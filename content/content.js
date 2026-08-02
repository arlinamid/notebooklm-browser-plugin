// ===== Prompt Architect — Content Script =====
// Injects prompt selector INSIDE NotebookLM modals and chat area
// Uses NLM's native CSS classes for seamless integration

let allTemplates = [];
let userPrompts = [];
let language = 'en';
let templatesLoaded = false;

// We still need to find configure-chat directly as it's not a standard studio card.
// 2026 UI renamed the dialog host to <configure-notebook-settings>, the inner
// classes (.prompt-section-custom-input / .custom-input-textarea) survived.
const CONFIGURE_CHAT_SELECTOR = 'textarea[aria-label*="Custom prompt to control"], textarea[aria-label*="custom prompt"], configure-notebook-settings textarea, .configure-notebook-dialog textarea.mat-mdc-input-element, textarea.custom-input-textarea, .prompt-section-custom-input textarea';

// Textareas that look like modal inputs but must never be touched
const IGNORED_TEXTAREA_CLASSES = [
    'query-box-input',     // main chat composer
    'query-box-textarea'   // "Discover sources" web-search box in the source panel
];

// Hosts that identify a NotebookLM customization overlay
const DIALOG_HOST_SELECTOR = 'mat-dialog-container, [role="dialog"], .cdk-overlay-pane, .cdk-dialog-container, .mat-mdc-dialog-surface, configurable-form-dialog, report-customization-dialog, configure-notebook-settings';

// Global tracker for the last opened studio format
let lastOpenedFormat = null;

// Map Material Icons to our internal format keys
const ICON_TO_FORMAT = {
    'audio_magic_eraser': 'audio-overview',
    'subscriptions': 'video-overview',
    'stacked_bar_chart': 'infographic',
    'tablet': 'slide-deck',
    'auto_tab_group': 'report',
    'summarize': 'report',
    'description': 'report',
    'table_view': 'data-table',
    'quiz': 'quiz',
    'cards_star': 'flashcards',
    'flowchart': 'mindmap',
    'tune': 'configure-chat'
};

// Secondary, English-only mapping used when the mat-icon lookup fails.
// The studio create cards expose aria-label="Audio Overview" etc.
const LABEL_TO_FORMAT = {
    'audio overview': 'audio-overview',
    'video overview': 'video-overview',
    'slide deck': 'slide-deck',
    'infographic': 'infographic',
    'reports': 'report',
    'report': 'report',
    'data table': 'data-table',
    'quiz': 'quiz',
    'flashcards': 'flashcards',
    'mind map': 'mindmap'
};

const I18N = {
    en: {
        sectionLabel: 'Prompt Template',
        placeholder: 'Select a prompt template...',
        customGroup: '── Custom Prompts ──',
        builtinGroup: '── Built-in Templates ──',
        applied: '✓ Applied!',
        chatLabel: '📚 Templates',
        savePrompt: 'Save current text as Template',
        saved: '✓ Saved!',
        namePrompt: 'Enter a name for this prompt template:',
        slotsTitle: 'Placeholders still to fill: {n}',
        slotsHint: 'Studio generates in one shot — it cannot ask you for these.',
        slotsApply: 'Fill in',
        slotsDismiss: 'Leave as is',
        slotsDone: '✓ All placeholders filled',
        slotsPlaceholder: 'value…'
    },
    hu: {
        sectionLabel: 'Prompt Sablon',
        placeholder: 'Válassz prompt sablont...',
        customGroup: '── Egyéni Promptok ──',
        builtinGroup: '── Beépített Sablonok ──',
        applied: '✓ Alkalmazva!',
        chatLabel: '📚 Sablonok',
        savePrompt: 'Jelenlegi szöveg mentése sablonként',
        saved: '✓ Mentve!',
        namePrompt: 'Add meg a prompt sablon nevét:',
        slotsTitle: 'Kitöltendő helyek: {n}',
        slotsHint: 'A Studio egy lépésben generál — ezeket nem fogja megkérdezni.',
        slotsApply: 'Kitöltés',
        slotsDismiss: 'Maradjon így',
        slotsDone: '✓ Minden hely kitöltve',
        slotsPlaceholder: 'érték…'
    }
};

/**
 * Injected-UI strings. I18N only carries en and hu; any other language falls
 * back to English rather than throwing — reading I18N['de'].chatLabel used to
 * kill the whole injection with "Cannot read properties of undefined".
 */
function uiStrings() {
    return (locale && locale.content) || I18N[language] || I18N.en;
}

// ===== Placeholder slots =====
// Studio panels generate in a single shot: there is no conversation, so an
// unfilled [SLOT] is silently sent to the model. We surface them instead.
const SLOT_TOKEN = /\[[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű][^\]\n]{1,60}\]/g;

// Structural section markers (RISEN framework etc.) and the grounding
// boilerplate's own self-reference are not user-fillable.
const SLOT_IGNORE = /^\[(ROLE|INSTRUCTIONS|STEPS|END GOAL|NARROWING|CONTEXT|OBJECTIVE|STYLE|TONE|AUDIENCE|RESPONSE|RESPONSE FORMAT|VISUAL STYLE|AI FOCUS|SQUARE BRACKETS|SZEREP|UTASÍTÁSOK|LÉPÉSEK|VÉGCÉL|SZŰKÍTÉS|KONTEXTUS|CÉL|STÍLUS|HANGNEM|KÖZÖNSÉG|VÁLASZ|VÁLASZFORMÁTUM|VIZUÁLIS STÍLUS|SZÖGLETES ZÁRÓJELBEN)\]$/i;

// The sentence explaining bracket handling — pointless once nothing is left to fill.
const SLOT_RULE_LINE = /^.*(SQUARE BRACKETS|SZÖGLETES ZÁRÓJELBEN).*$\n?\n?/im;

// Distinguishes a slot the USER must fill from output scaffolding the MODEL fills.
// The corpus splits cleanly on case: [TOPIC], [SOURCE A], [SZAKTERÜLET] are
// parameters, while [quote], [Source, p.X], [answer], [thesis verbatim] describe
// what the model should emit. Prompting the user for the latter is noise, so this
// stays deliberately conservative — anything it skips is still covered by the
// prompt's own rule telling the model to infer unfilled slots from the sources.
function isUserSlot(token) {
    const inner = token.slice(1, -1).trim();
    if (inner.replace(/[^\p{L}]/gu, '').length < 2) return false;   // [1-5], [x]

    // Entirely upper-case → a parameter: [TOPIC], [WHAT TO IGNORE], [TÉMA]
    if (inner === inner.toUpperCase()) return true;

    // ALL-CAPS lead-in with an inline example: [AUDIENCE: tech leads],
    // [SOLUTION/TOOL being evaluated]
    if (/^\p{Lu}[\p{Lu}\d/ ]*\p{Lu}(?=\s*[:\s])/u.test(inner)) return true;

    // A slash-separated choice with no spaces: [beginner/intermediate/advanced]
    if (/^[^\s/]+(\/[^\s/]+)+$/.test(inner)) return true;

    // Phrased as an instruction to the reader
    if (/^(e\.?g\.?|your\b|you\b|describe\b|list\b|insert\b|enter\b|specify\b|upload\b|pl\.|saját\b|add meg\b|írd\b|sorold\b|töltsd\b)/i.test(inner)) return true;

    return false;
}

// Any bracket token left in the text, including model-side scaffolding.
// While one survives, the prompt's bracket-handling rule still earns its place.
function hasAnyBracketToken(text) {
    return text.split('\n').some(line => {
        const matches = line.match(SLOT_TOKEN);
        if (!matches) return false;
        return matches.some(tok =>
            !line.includes(tok + '(') && !SLOT_IGNORE.test(tok) && line.trim() !== tok
        );
    });
}

/**
 * @param {string[]} [known] Slot tokens from the locale file. When present they
 * are used verbatim instead of the case-based classifier, which cannot work in
 * scripts without letter case (ja, zh, ko, hi) — there every bracket token,
 * including model-side scaffolding, would look user-fillable.
 */
function collectSlots(text, known) {
    if (known && known.length) return known.filter(tok => text.includes(tok));
    const found = new Set();
    text.split('\n').forEach(line => {
        const matches = line.match(SLOT_TOKEN);
        if (!matches) return;
        matches.forEach(tok => {
            if (line.includes(tok + '(')) return;   // markdown link
            if (SLOT_IGNORE.test(tok)) return;      // structural marker
            if (line.trim() === tok) return;        // lone marker on its own line
            if (!isUserSlot(tok)) return;           // model-side output scaffold
            found.add(tok);
        });
    });
    return [...found];
}

// ===== Global Styles =====
function injectGlobalStyles() {
    if (document.getElementById('pa-global-style')) return;
    const style = document.createElement('style');
    style.id = 'pa-global-style';
    style.textContent = `
        /* PA injected elements — theme-aware via NLM mat-sys CSS vars */
        .pa-select {
            font-family: 'Google Sans Text', 'Google Sans', Roboto, Arial, sans-serif !important;
            font-size: 16px !important;
            font-weight: 400 !important;
            color: var(--mat-sys-on-surface, inherit) !important;
            background: var(--mat-sys-surface-container, transparent) !important;
        }
        .pa-select-compact {
            font-family: 'Google Sans Text', 'Google Sans', Roboto, Arial, sans-serif !important;
            font-size: 14px !important;
            font-weight: 400 !important;
            color: var(--mat-sys-on-surface, inherit) !important;
            background: var(--mat-sys-surface-container, transparent) !important;
        }
        .pa-section-title {
            font-family: 'Google Sans Text', 'Google Sans', Roboto, Arial, sans-serif;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.1px;
            color: var(--mat-sys-on-surface-variant, var(--mat-sys-on-surface, #5f6368));
            text-transform: uppercase;
            margin-bottom: 4px;
        }
    `;
    document.head.appendChild(style);
}

function injectBMCWidget() {
    if (document.getElementById('pa-bmc-widget')) return;

    const bmc = document.createElement('a');
    bmc.id = 'pa-bmc-widget';
    bmc.href = 'https://www.buymeacoffee.com/arlinamid';
    bmc.target = '_blank';
    bmc.title = 'Support me on Buy me a coffee!';

    // Style to match the BMC floating widget
    bmc.style.cssText = `
        position: fixed;
        bottom: 18px;
        right: 18px;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #5F7FFF;
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        text-decoration: none;
    `;

    // BMC Cup Logo
    bmc.innerHTML = `
        <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="BMC" style="width: 32px; height: 32px;">
    `;

    bmc.onmouseenter = () => bmc.style.transform = 'scale(1.1)';
    bmc.onmouseleave = () => bmc.style.transform = 'scale(1)';

    document.body.appendChild(bmc);
}

// ===== Init =====
async function init() {
    console.log('[PA] Init starting...');

    // Load templates
    try {
        const url = chrome.runtime.getURL('data/templates.json');
        console.log('[PA] Fetching templates from:', url);
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        allTemplates = await resp.json();
        templatesLoaded = true;
        console.log('[PA] Loaded', allTemplates.length, 'templates');
    } catch (e) {
        console.error('[PA] Failed to load templates:', e);
        return;
    }

    // Load user settings with migration from local to sync
    try {
        // 1. Try to load from sync
        let stored = await chrome.storage.sync.get(['userPrompts', 'language', 'migrationDone']);

        // 2. If not migrated yet, check local
        if (!stored.migrationDone) {
            const localData = await chrome.storage.local.get(['userPrompts', 'language']);
            userPrompts = mergePrompts(stored.userPrompts, localData.userPrompts);
            language = stored.language || localData.language || 'en';

            if (localData.userPrompts && localData.userPrompts.length > 0) {
                console.log('[PA] Migrating', localData.userPrompts.length, 'prompt(s) from local to sync...');
                await chrome.storage.sync.set({ userPrompts, language, migrationDone: true });
                // Clear local prompts to avoid confusion, but keep language as fallback
                await chrome.storage.local.remove('userPrompts');
            } else {
                // No local data, just mark as migrated to avoid future checks.
                // Never write userPrompts here — anything already in sync must survive.
                await chrome.storage.sync.set({ migrationDone: true });
            }
        } else {
            userPrompts = stored.userPrompts || [];
            language = stored.language || 'en';
        }
    } catch (e) {
        console.error('[PA] Storage init error:', e);
    }

    // Locale data for the selected language (no-op for en / hu)
    await loadLocale(language);

    // Inject plugin stylesheet once
    injectGlobalStyles();

    // Inject Buy Me a Coffee widget
    injectBMCWidget();

    // Wait for page to load
    await waitForElement('.query-box-input, .create-artifact-button-container', 15000);
    console.log('[PA] Page loaded, starting observers');

    // Add global click listener to track which modal is being opened
    document.addEventListener('click', (e) => {
        // Find if they clicked an edit button, a create card, or a report customize button
        const target = e.target.closest('.create-artifact-button-container, basic-create-artifact-button, .edit-button, button[aria-label*="Customize"], button[aria-label*="testreszabása"]');
        if (!target) return;

        // The create card wraps both the artifact icon and the edit button, so
        // always resolve up to it before looking for the identifying icon.
        const card = target.closest('.create-artifact-button-container, basic-create-artifact-button')
            || target.closest('.artifact-button-content, mat-card')
            || target;

        // .artifact-icon is the format icon; a bare mat-icon lookup would find
        // the chevron/edit glyph on the button itself.
        const iconEl = card.querySelector('mat-icon.artifact-icon') || card.querySelector('mat-icon');
        const iconName = iconEl ? iconEl.textContent.trim() : '';

        const label = (card.getAttribute('aria-label') || target.getAttribute('aria-label') || '')
            .replace(/^Customize\s+/i, '').trim().toLowerCase();

        const format = ICON_TO_FORMAT[iconName] || LABEL_TO_FORMAT[label];
        if (format) {
            lastOpenedFormat = format;
            console.log('[PA] User opened format:', format, '(icon:', iconName || '—', '/ label:', label || '—', ')');
        }
    }, true); // use capture phase to get it early

    // Inject into chat
    injectChatButton();

    // Watch for modals and DOM changes. NotebookLM's Angular app mutates the DOM
    // constantly, so coalesce bursts into one scan per animation frame.
    let scanQueued = false;
    const queueScan = () => {
        if (scanQueued) return;
        scanQueued = true;
        requestAnimationFrame(() => {
            scanQueued = false;
            scanForModals();
            injectChatButton();
        });
    };

    const observer = new MutationObserver(queueScan);
    observer.observe(document.body, { childList: true, subtree: true });

    // First pass immediately — the studio panel may already be rendered
    queueScan();
}

// ===== Scan for Modal Textareas =====
// We directly look for textareas that appear when a dialog is open
function scanForModals() {
    if (!templatesLoaded) return;

    // We look for general modal textareas or the specific configure chat one.
    // `configurable-form-dialog textarea` is what catches the Video Overview
    // focus box, which is a plain textarea without any mat-mdc-* classes.
    const textareas = document.querySelectorAll(
        `mat-dialog-container textarea, configurable-form-dialog textarea, report-customization-dialog textarea, ${CONFIGURE_CHAT_SELECTOR}`
    );

    textareas.forEach(textarea => {
        if (IGNORED_TEXTAREA_CLASSES.some(c => textarea.classList.contains(c))) return;

        const isConfigureChat = textarea.matches(CONFIGURE_CHAT_SELECTOR);
        const isInOverlay = textarea.closest(DIALOG_HOST_SELECTOR);
        if (!isInOverlay && !isConfigureChat) return;

        const anchor = findInsertAnchor(textarea);
        const insertionParent = anchor.parentElement;
        if (!insertionParent) return;
        if (insertionParent.querySelector(':scope > .pa-injected')) return;

        const format = isConfigureChat ? 'configure-chat' : detectDialogFormat(textarea);
        if (!format) return;

        const templates = getTemplatesForFormat(format);
        if (templates.length === 0) return;

        console.log('[PA] Injecting into modal for format:', format, 'templates:', templates.length);

        const section = createTemplateSection(templates, textarea, format);
        insertionParent.insertBefore(section, anchor);
    });
}

// Pick the nicest place to drop the selector above the prompt field.
// Ordered most-specific first so each dialog type gets a sane layout.
function findInsertAnchor(textarea) {
    return textarea.closest('.text-form-field-container')      // audio / slides / infographic / quiz / flashcards / mind map
        || textarea.closest('.custom-topic-card')              // video overview
        || textarea.closest('.prompt-section-custom-input')    // configure chat
        || textarea.closest('mat-form-field, .mat-mdc-form-field') // reports "create your own"
        || textarea;
}

function detectDialogFormat(textarea) {
    const dialog = textarea.closest(DIALOG_HOST_SELECTOR);

    // 1. The dialog header icon is the most reliable signal. The 2026 UI uses
    //    .dialog-title-icon in configurable-form-dialog and .dialog-icon in the
    //    report dialog, and the report header also carries a back-arrow icon —
    //    so scan every header icon and take the first one we recognise.
    if (dialog) {
        const headerIcons = dialog.querySelectorAll(
            'mat-icon.dialog-title-icon, mat-icon.dialog-icon, .mat-mdc-dialog-title mat-icon, .dialog-title mat-icon'
        );
        for (const icon of headerIcons) {
            const mapped = ICON_TO_FORMAT[icon.textContent.trim()];
            if (mapped) return mapped;
        }
    }

    // 2. Fall back to the studio card the user clicked to get here
    if (lastOpenedFormat) return lastOpenedFormat;

    // 3. Last resort — sniff the field's own labels
    const combined = (
        (textarea.getAttribute('aria-label') || '') + ' ' +
        (textarea.getAttribute('placeholder') || '')
    ).toLowerCase();

    if (combined.includes('audio') || combined.includes('hosts') || combined.includes('episode') || combined.includes('hang')) return 'audio-overview';
    if (combined.includes('video') || combined.includes('videó')) return 'video-overview';
    if (combined.includes('infographic') || combined.includes('infografika')) return 'infographic';
    if (combined.includes('slide') || combined.includes('dia') || combined.includes('prezentáció')) return 'slide-deck';
    if (combined.includes('report') || combined.includes('jelentés')) return 'report';
    if (combined.includes('data table') || combined.includes('adattábla')) return 'data-table';
    if (combined.includes('quiz') || combined.includes('kvíz')) return 'quiz';
    if (combined.includes('flash') || combined.includes('card') || combined.includes('tanulókártya')) return 'flashcards';
    return null;
}

// ===== Create Template Section (using NLM classes) =====
function createTemplateSection(templates, textarea, format) {
    const t = uiStrings();

    const section = document.createElement('div');
    section.className = 'pa-injected';
    section.style.cssText = 'margin-bottom: 16px;';

    // Label — uses NLM's own control-label class
    const label = document.createElement('label');
    label.className = 'control-label';
    label.textContent = t.sectionLabel;
    section.appendChild(label);

    // Select wrapper
    const selectWrapper = document.createElement('div');
    selectWrapper.style.cssText = 'margin-top: 8px; display: flex; gap: 8px; align-items: center;';

    // Native <select> styled to match NLM (Google Sans Text, 16px, mat-sys vars)
    const select = document.createElement('select');
    select.className = 'pa-select';
    select.style.cssText = `
    flex: 1;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--mat-sys-outline, var(--mat-form-field-outline-color, rgba(0,0,0,.38)));
    border-radius: 4px;
    background: var(--mat-sys-surface-container, var(--mat-form-field-container-color, transparent));
    color: var(--mat-sys-on-surface, var(--mat-form-field-input-color, inherit));
    font-family: 'Google Sans Text', 'Google Sans', Roboto, Arial, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    cursor: pointer;
    outline: none;
    appearance: auto;
    -webkit-appearance: auto;
    transition: border-color 0.2s;
  `;

    // Default empty option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = t.placeholder;
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    select.appendChild(defaultOpt);

    // Separate user vs built-in with optgroups
    const userTmpl = templates.filter(p => p.isUserDefined);
    const builtIn = templates.filter(p => !p.isUserDefined);

    if (userTmpl.length > 0) {
        const group = document.createElement('optgroup');
        group.label = t.customGroup;
        userTmpl.forEach((tmpl, i) => {
            const opt = document.createElement('option');
            opt.value = 'u_' + i;
            opt.textContent = `${tmpl.title} [${tmpl.level}]`;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }

    if (builtIn.length > 0) {
        const group = document.createElement('optgroup');
        group.label = t.builtinGroup;
        builtIn.forEach((tmpl, i) => {
            const opt = document.createElement('option');
            opt.value = 'b_' + i;
            opt.textContent = `${tmpl.title} [${tmpl.level}]`;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }

    // On change → fill the textarea
    select.addEventListener('change', () => {
        const val = select.value;
        let template = null;
        if (val.startsWith('u_')) template = userTmpl[parseInt(val.substring(2))];
        else if (val.startsWith('b_')) template = builtIn[parseInt(val.substring(2))];

        if (template) {
            let text = template.prompt;
            if (format === 'video-overview') {
                const match = text.match(/\[AI FOCUS\]\n([\s\S]*?)$/i);
                if (match) text = match[1].trim();
            }
            setNativeValue(textarea, withOutputLanguage(text, format));
            textarea.focus();
            flashToast(uiStrings().applied);
            // Studio generates in one shot — surface any [SLOTS] before Generate
            refreshSlotPanel(section, textarea, template.paSlots);
            watchSlots(section, textarea);
        }
    });

    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`;
    saveBtn.title = t.savePrompt;
    saveBtn.style.cssText = `
        background: transparent;
        border: 1px solid var(--mat-form-field-outline-color, rgba(0,0,0,.38));
        border-radius: 4px;
        color: var(--mat-form-field-input-color, inherit);
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveCurrentInput(textarea, format);
    });

    selectWrapper.appendChild(select);
    selectWrapper.appendChild(saveBtn);
    section.appendChild(selectWrapper);
    return section;
}

// ===== Placeholder Filler Panel =====
// Rendered right under the template dropdown whenever the applied text still
// has [SLOTS]. Filling one substitutes every occurrence in the textarea.
function refreshSlotPanel(host, textarea, known) {
    const t = uiStrings();
    let panel = host.querySelector(':scope > .pa-slots');
    // Remember the list so later re-renders (manual edits) keep using it
    if (known) host.dataset.paSlots = JSON.stringify(known);
    const remembered = host.dataset.paSlots ? JSON.parse(host.dataset.paSlots) : null;
    const slots = collectSlots(textarea.value || '', known || remembered);

    if (slots.length === 0) {
        if (panel) {
            // Nothing bracketed left at all — drop the now-pointless bracket rule
            if (panel.dataset.touched === '1'
                && !hasAnyBracketToken(textarea.value)
                && SLOT_RULE_LINE.test(textarea.value)) {
                setNativeValue(textarea, textarea.value.replace(SLOT_RULE_LINE, ''));
            }
            panel.remove();
        }
        return;
    }

    // Panel already showing exactly these slots — leave the user's typing alone
    if (panel && panel.dataset.slots === slots.join(' ')) return;

    const touched = panel ? panel.dataset.touched : '0';
    if (panel) panel.remove();

    panel = document.createElement('div');
    panel.className = 'pa-slots';
    panel.dataset.slots = slots.join(' ');
    panel.dataset.touched = touched || '0';

    const head = document.createElement('div');
    head.className = 'pa-slots-head';
    head.innerHTML = `<span class="pa-slots-title">⚠ ${String(t.slotsTitle).replace('{n}', slots.length)}</span>
        <span class="pa-slots-hint">${t.slotsHint}</span>`;
    panel.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'pa-slots-grid';
    const inputs = [];

    slots.forEach(tok => {
        const row = document.createElement('label');
        row.className = 'pa-slot-row';

        const name = document.createElement('span');
        name.className = 'pa-slot-name';
        name.textContent = tok.slice(1, -1);
        name.title = tok;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'pa-slot-input';
        input.placeholder = t.slotsPlaceholder;
        input.dataset.token = tok;
        // Keep Enter/Escape from reaching NotebookLM's dialog handlers
        input.addEventListener('keydown', e => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); applyBtn.click(); }
        });

        row.appendChild(name);
        row.appendChild(input);
        grid.appendChild(row);
        inputs.push(input);
    });
    panel.appendChild(grid);

    const actions = document.createElement('div');
    actions.className = 'pa-slots-actions';

    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'pa-slots-btn';
    dismissBtn.textContent = t.slotsDismiss;
    dismissBtn.addEventListener('click', e => { e.preventDefault(); panel.remove(); });

    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'pa-slots-btn pa-slots-btn-primary';
    applyBtn.textContent = t.slotsApply;
    applyBtn.addEventListener('click', e => {
        e.preventDefault();
        let text = textarea.value;
        let changed = false;
        inputs.forEach(inp => {
            const val = inp.value.trim();
            if (!val) return;
            text = text.split(inp.dataset.token).join(val);
            changed = true;
        });
        if (!changed) return;
        panel.dataset.touched = '1';
        setNativeValue(textarea, text);
        const remaining = collectSlots(text);
        refreshSlotPanel(host, textarea);
        if (remaining.length === 0) flashToast(t.slotsDone);
    });

    actions.appendChild(dismissBtn);
    actions.appendChild(applyBtn);
    panel.appendChild(actions);

    host.appendChild(panel);
    inputs[0]?.focus();
}

// Keep the panel in sync when the user edits the textarea by hand
function watchSlots(host, textarea) {
    if (textarea.dataset.paSlotWatch === '1') return;
    textarea.dataset.paSlotWatch = '1';
    textarea.addEventListener('input', () => {
        if (host.querySelector(':scope > .pa-slots')) refreshSlotPanel(host, textarea);
    });
}

// ===== Chat Button =====
function injectChatButton() {
    if (!templatesLoaded) return;

    // Language-agnostic class-based selector instead of aria-label
    const chatTextarea = document.querySelector('textarea.query-box-input');
    if (!chatTextarea) return;

    // DOM: div.query-box-container → query-box → div.query-box → div.input-group
    //      → form → div.message-container → div.query-box-input-wrapper → textarea
    const queryBox = chatTextarea.closest('.query-box') || chatTextarea.closest('query-box');

    if (!queryBox || !queryBox.parentElement) return;

    // Check if we already injected it in to the parent
    if (queryBox.parentElement.querySelector(':scope > .pa-chat-injected')) return;

    const templates = getTemplatesForFormat('text-chat');
    if (templates.length === 0) return;

    const t = uiStrings();
    const wrapper = document.createElement('div');
    wrapper.className = 'pa-chat-injected';

    // Inject neatly at the top of the query box column without breaking internal flex layouts.
    // Column direction so the placeholder panel can stack under the controls row.
    wrapper.style.cssText = 'padding: 4px 16px 8px; display: flex; flex-direction: column; gap: 6px; align-items: stretch; width: 100%; box-sizing: border-box; background: transparent;';

    const controlsRow = document.createElement('div');
    controlsRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';

    const select = document.createElement('select');
    select.className = 'pa-select-compact';
    select.style.cssText = `
    flex: 1;
    padding: 5px 10px;
    border: 1px solid var(--mat-sys-outline, var(--mat-form-field-outline-color, rgba(0,0,0,.38)));
    border-radius: 20px;
    background: var(--mat-sys-surface-container, var(--mat-form-field-container-color, transparent));
    color: var(--mat-sys-on-surface, var(--mat-form-field-input-color, inherit));
    font-family: 'Google Sans Text', 'Google Sans', Roboto, Arial, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    cursor: pointer;
    outline: none;
    max-width: 280px;
    transition: border-color 0.2s;
  `;

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = t.chatLabel;
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    select.appendChild(defaultOpt);

    const userTmpl = templates.filter(p => p.isUserDefined);
    const builtIn = templates.filter(p => !p.isUserDefined);

    if (userTmpl.length > 0) {
        const group = document.createElement('optgroup');
        group.label = t.customGroup;
        userTmpl.forEach((tmpl, i) => {
            const opt = document.createElement('option');
            opt.value = 'u_' + i;
            opt.textContent = `${tmpl.title} [${tmpl.level}]`;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }

    if (builtIn.length > 0) {
        const group = document.createElement('optgroup');
        group.label = t.builtinGroup;
        builtIn.forEach((tmpl, i) => {
            const opt = document.createElement('option');
            opt.value = 'b_' + i;
            opt.textContent = `${tmpl.title} [${tmpl.level}]`;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }

    select.addEventListener('change', () => {
        const val = select.value;
        let template = null;
        if (val.startsWith('u_')) template = userTmpl[parseInt(val.substring(2))];
        else if (val.startsWith('b_')) template = builtIn[parseInt(val.substring(2))];
        if (template) {
            // Re-resolve: Angular may have swapped the textarea since injection
            const live = document.querySelector('textarea.query-box-input') || chatTextarea;
            setNativeValue(live, withOutputLanguage(template.prompt, 'text-chat'));
            live.focus();
            select.selectedIndex = 0;
            flashToast(uiStrings().applied);
            refreshSlotPanel(wrapper, live, template.paSlots);
            watchSlots(wrapper, live);
        }
    });

    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`;
    saveBtn.title = t.savePrompt;
    saveBtn.style.cssText = `
        background: transparent;
        border: 1px solid var(--mat-form-field-outline-color, rgba(0,0,0,.12));
        border-radius: 4px;
        color: var(--mat-form-field-input-color, inherit);
        cursor: pointer;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveCurrentInput(document.querySelector('textarea.query-box-input') || chatTextarea, 'text-chat');
    });

    controlsRow.appendChild(select);
    controlsRow.appendChild(saveBtn);
    wrapper.appendChild(controlsRow);

    // Insert safely into the DIRECT parent of the gray query box, directly above it.
    // This removes the "not a child of this node" error.
    queryBox.parentElement.insertBefore(wrapper, queryBox);
}

// ===== Helpers =====
// Union of the sync and local prompt lists, sync entries winning on id collisions.
// Used only by the one-time local→sync migration so an upgrade can never drop prompts.
function mergePrompts(syncPrompts, localPrompts) {
    const merged = Array.isArray(syncPrompts) ? [...syncPrompts] : [];
    const seen = new Set(merged.map(p => p && p.id));
    (Array.isArray(localPrompts) ? localPrompts : []).forEach(p => {
        if (p && !seen.has(p.id)) {
            merged.push(p);
            seen.add(p.id);
        }
    });
    return merged;
}

async function saveCurrentInput(textarea, format) {
    const textVal = textarea.value.trim();
    if (!textVal) return;

    const t = uiStrings();
    const title = await showSaveModal("My Custom Prompt");
    if (!title) return; // Cancelled

    const newPrompt = {
        id: Date.now().toString(),
        title: title.trim() || 'Custom Prompt',
        format: format,
        category: 'studio',
        level: 'intermediate',
        description: 'Saved directly from NotebookLM.',
        prompt: textVal,
        settings: '',
        isUserDefined: true
    };

    userPrompts.unshift(newPrompt);
    await chrome.storage.sync.set({ userPrompts });

    flashToast(t.saved);

    // Refresh modal UI to show the new option in the select dropdowns
    const injected = document.querySelectorAll('.pa-injected, .pa-chat-injected');
    injected.forEach(el => el.remove());
    scanForModals();
    injectChatButton();
}

function showSaveModal(defaultTitle) {
    return new Promise((resolve) => {
        const t = uiStrings();

        let existing = document.getElementById('pa-save-modal');
        if (existing) existing.remove();

        // Inject stylesheet once — uses NLM's own CSS vars so it
        // automatically adapts to dark / light mode without any JS detection.
        if (!document.getElementById('pa-save-modal-style')) {
            const style = document.createElement('style');
            style.id = 'pa-save-modal-style';
            style.textContent = `
                #pa-save-modal::backdrop {
                    background: rgba(0, 0, 0, 0.32);
                }
                #pa-save-modal {
                    padding: 0;
                    border: none;
                    border-radius: 16px;
                    background: var(--mat-dialog-container-color,
                                var(--mat-app-surface,
                                var(--mat-app-background, #fff)));
                    color: var(--mat-dialog-with-divider-title-text-color,
                            var(--mat-app-on-surface,
                            var(--mat-app-on-background, #202124)));
                    box-shadow: 0 11px 15px -7px rgba(0,0,0,.2),
                                0 24px 38px 3px rgba(0,0,0,.14),
                                0 9px 46px 8px rgba(0,0,0,.12);
                    width: 400px;
                    max-width: 90vw;
                    font-family: 'Google Sans', 'Google Sans Text', Roboto, sans-serif;
                    outline: none;
                }
                #pa-save-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--mat-form-field-outline-color, rgba(0,0,0,.38));
                    border-radius: 8px;
                    font-size: 16px;
                    font-family: inherit;
                    background: transparent;
                    color: inherit;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color 0.2s, padding 0.2s, border-width 0.2s;
                }
                #pa-save-input:focus {
                    border-color: var(--mat-form-field-focus-outline-color, #1a73e8);
                    border-width: 2px;
                    padding: 11px 15px;
                }
                #pa-save-cancel {
                    background: transparent;
                    border: 1px solid var(--mat-form-field-outline-color, #dadce0);
                    color: inherit;
                    border-radius: 24px;
                    height: 40px;
                    padding: 0 24px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    font-family: inherit;
                }
                #pa-save-confirm {
                    background: var(--mdc-protected-button-container-color, #1a73e8);
                    border: none;
                    color: #fff;
                    border-radius: 24px;
                    height: 40px;
                    padding: 0 24px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    font-family: inherit;
                }
            `;
            document.head.appendChild(style);
        }

        const dialog = document.createElement('dialog');
        dialog.id = 'pa-save-modal';

        dialog.innerHTML = `
            <div style="display: flex; flex-direction: column;">
                <div style="padding: 24px 24px 16px;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 500; line-height: 28px;">${t.namePrompt}</h2>
                </div>
                <div style="padding: 0 24px 24px;">
                    <input type="text" id="pa-save-input" value="${defaultTitle}">
                </div>
                <div style="padding: 8px 24px 24px; display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="pa-save-cancel">${t.editor ? t.editor.cancel : (language === 'hu' ? 'Mégse' : 'Cancel')}</button>
                    <button id="pa-save-confirm">${t.editor ? t.editor.save : (language === 'hu' ? 'Mentés' : 'Save')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
        dialog.showModal();

        const input = document.getElementById('pa-save-input');
        const btnCancel = document.getElementById('pa-save-cancel');
        const btnConfirm = document.getElementById('pa-save-confirm');

        input.focus();
        input.select();

        const close = (val) => {
            dialog.close();
            dialog.remove();
            resolve(val);
        };

        btnCancel.onclick = () => close(null);
        btnConfirm.onclick = () => close(input.value.trim() || defaultTitle);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) close(null);
        });
        input.onkeydown = (e) => {
            if (e.key === 'Enter') close(input.value.trim() || defaultTitle);
            if (e.key === 'Escape') close(null);
        };
    });
}

function getTemplatesForFormat(format) {
    const huIds = new Set(allTemplates.filter(p => p.lang === 'hu').map(p => p.id));
    const langTemplates = allTemplates.filter(p => {
        if (p.format !== format) return false;
        if (!p.lang) return true;                              // legacy entries without lang tag
        // Prompt bodies exist only for en and hu; other languages use English
        // bodies with titles translated from the locale file.
        if (!NATIVE_BODY_LANGS.has(language)) return p.lang === 'en';
        if (p.lang === language) return true;                  // exact match
        if (language === 'hu' && p.lang === 'en' && !huIds.has(p.id)) return true; // EN fallback
        return false;
    });
    return [...userPrompts.filter(p => p.format === format), ...langTemplates.map(localizedTemplate)];
}

// ===== Locale =====
// Only English and Hungarian ship translated prompt bodies. Every other language
// gets English bodies with a translated title/description, plus a generated
// output-language line. Measured 2026-08-02: an English prompt against Hungarian
// sources answers in English, so that line is what actually steers the output.
const NATIVE_BODY_LANGS = new Set(['en', 'hu']);
let locale = null;
let boilerplate = null;

async function loadLocale(lang) {
    locale = null;
    // en and hu ship native prompt bodies and bundled UI strings — no locale file,
    // and attempting the fetch would log a 404 on every page load.
    if (!lang || NATIVE_BODY_LANGS.has(lang)) return;
    try {
        const [locRes, bpRes] = await Promise.all([
            fetch(chrome.runtime.getURL(`data/locales/${lang}.json`)),
            boilerplate ? null : fetch(chrome.runtime.getURL('data/locales/_boilerplate.json'))
        ]);
        if (locRes && locRes.ok) locale = await locRes.json();
        if (bpRes && bpRes.ok) boilerplate = await bpRes.json();
    } catch (e) {
        console.warn('[PA] locale load failed for', lang, e);
    }
}

/**
 * Rebuilds a full prompt from the translated body plus the hand-translated
 * grounding block. Bodies are stored without boilerplate so a machine never
 * rewords the text that keeps answers source-grounded.
 */
function composeBody(entry, lang) {
    const bp = boilerplate && boilerplate[lang];
    if (!bp) return entry.body;
    const parts = [];
    if (entry.grounding && bp[entry.grounding]) parts.push(bp[entry.grounding]);
    if (entry.slotRule && bp.slots) parts.push(bp.slots);
    parts.push(entry.body);
    return parts.join('\n\n');
}

function localizedTemplate(p) {
    const tr = locale && locale.templates && locale.templates[p.id];
    if (!tr) return p;
    const out = { ...p, title: tr.title || p.title, description: tr.description || p.description };
    if (tr.body) {
        out.prompt = composeBody(tr, locale.language);
        // Slot labels come from the locale, not from a heuristic — letter case
        // does not exist in Japanese, Chinese, Korean or Hindi, so the runtime
        // classifier cannot tell a user slot from model-side scaffolding there.
        if (tr.slots) out.paSlots = Object.values(tr.slots);
    }
    return out;
}

/**
 * Chat has no output-language control, so an English body would answer in
 * English. Studio dialogs have their own language selector and are left alone.
 */
function withOutputLanguage(text, format) {
    if (format !== 'text-chat' && format !== 'configure-chat') return text;
    if (!locale || !locale.languageName) return text;          // en / hu keep native bodies
    return `${text}\n\nAnswer in ${locale.languageName}.`;
}

function setNativeValue(element, value) {
    const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
    )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    )?.set;
    if (setter) setter.call(element, value);
    else element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

function flashToast(msg) {
    const existing = document.getElementById('pa-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'pa-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function waitForElement(selector, timeout = 10000) {
    return new Promise(resolve => {
        const el = document.querySelector(selector);
        if (el) { resolve(el); return; }
        const start = Date.now();
        const check = () => {
            if (document.querySelector(selector)) { resolve(document.querySelector(selector)); return; }
            if (Date.now() - start > timeout) { resolve(null); return; }
            requestAnimationFrame(check);
        };
        check();
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'APPLY_PROMPT') {
        applyFromPopup(msg).then(sendResponse);
        return true;   // keep the channel open for the async reply
    }
    return true;
});

// ===== Popup → page apply =====
// A studio-format prompt belongs in that format's dialog, not in the chat box.
// If the dialog isn't open we open it first, rather than dumping an Audio
// Overview brief into the chat composer.
const FORMAT_TO_ICON = Object.entries(ICON_TO_FORMAT)
    .reduce((acc, [icon, fmt]) => { if (!acc[fmt]) acc[fmt] = icon; return acc; }, {});

function visibleDialogTextarea() {
    return [...document.querySelectorAll(
        'mat-dialog-container textarea, configurable-form-dialog textarea, report-customization-dialog textarea, configure-notebook-settings textarea'
    )].find(t => !IGNORED_TEXTAREA_CLASSES.some(c => t.classList.contains(c)) && t.offsetParent !== null);
}

/** Studio create card for a format, found by its icon so it stays language-agnostic. */
function findStudioCard(format) {
    const icon = FORMAT_TO_ICON[format];
    if (!icon) return null;
    return [...document.querySelectorAll('.create-artifact-button-container')]
        .find(c => {
            const i = c.querySelector('mat-icon.artifact-icon') || c.querySelector('mat-icon');
            return i && i.textContent.trim() === icon;
        }) || null;
}

async function openConfigureChat() {
    const btn = [...document.querySelectorAll('button')]
        .find(b => b.querySelector('mat-icon')?.textContent.trim() === 'tune');
    if (!btn) return false;
    btn.click();
    // The custom prompt field only exists once "Custom" is selected — it is the
    // last toggle in the goal group.
    const group = await waitForElement('mat-button-toggle-group[formcontrolname="customizeButtonSelected"]', 6000);
    if (!group) return false;
    const toggles = group.querySelectorAll('mat-button-toggle button');
    if (toggles.length) toggles[toggles.length - 1].click();
    return true;
}

async function applyFromPopup(msg) {
    const format = msg.format || 'text-chat';

    // 1. Something is already open — the user is looking at it, use it.
    let textarea = visibleDialogTextarea();

    // 2. Chat prompts go to the composer.
    if (!textarea && format === 'text-chat') {
        textarea = document.querySelector('textarea.query-box-input');
    }

    // 3. Studio / configure formats: open the right panel first.
    if (!textarea) {
        if (format === 'configure-chat') {
            if (!await openConfigureChat()) {
                return { success: false, reason: 'no-configure' };
            }
        } else {
            const card = findStudioCard(format);
            if (!card) return { success: false, reason: 'no-studio' };
            // The pencil opens the Customize dialog directly; the card itself
            // may start a generation, so prefer the pencil when present.
            (card.querySelector('button.edit-button') || card).click();
        }
        await waitForElement('mat-dialog-container textarea, configurable-form-dialog textarea, configure-notebook-settings textarea', 8000);
        textarea = visibleDialogTextarea();
        if (!textarea) return { success: false, reason: 'dialog-timeout' };
    }

    setNativeValue(textarea, withOutputLanguage(msg.prompt, format));
    textarea.focus();
    textarea.scrollIntoView({ block: 'center', behavior: 'smooth' });

    // Surface unfilled [SLOTS] here too — the popup path bypasses the dropdown
    scanForModals();
    const host = textarea.closest('mat-dialog-container, configurable-form-dialog, report-customization-dialog, configure-notebook-settings')
        ?.querySelector('.pa-injected')
        || document.querySelector('.pa-chat-injected');
    if (host) { refreshSlotPanel(host, textarea); watchSlots(host, textarea); }

    flashToast(uiStrings().applied);
    return { success: true };
}

// ===== Storage Sync =====
// Keep userPrompts and language in sync with the popup in real time.
// Whenever the popup deletes/edits a prompt or switches language, we
// update in-memory state and re-render all injected UI elements.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    let needsRefresh = false;

    if (changes.userPrompts) {
        userPrompts = changes.userPrompts.newValue || [];
        needsRefresh = true;
        console.log('[PA] userPrompts synced from storage:', userPrompts.length, 'entries');
    }

    if (changes.language) {
        language = changes.language.newValue || 'en';
        loadLocale(language);
        needsRefresh = true;
        console.log('[PA] language synced from storage:', language);
    }

    if (needsRefresh) {
        // Remove all injected elements so they rebuild with fresh data
        document.querySelectorAll('.pa-injected, .pa-chat-injected').forEach(el => el.remove());
        scanForModals();
        injectChatButton();
    }
});

// Start
init();
