// ===== Prompt Architect — Content Script =====
// Injects prompt selector INSIDE NotebookLM modals and chat area
// Uses NLM's native CSS classes for seamless integration

let allTemplates = [];
let userPrompts = [];
let language = 'en';
let templatesLoaded = false;

// We still need to find configure-chat directly as it's not a standard studio card
const CONFIGURE_CHAT_SELECTOR = 'textarea[aria-label*="Custom prompt to control"], textarea[aria-label*="custom prompt"], .configure-notebook-dialog textarea.mat-mdc-input-element';

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
        namePrompt: 'Enter a name for this prompt template:'
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
        namePrompt: 'Add meg a prompt sablon nevét:'
    }
};

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

    // Load user settings
    try {
        const stored = await chrome.storage.local.get(['userPrompts', 'language']);
        userPrompts = stored.userPrompts || [];
        language = stored.language || 'en';
    } catch (e) { /* ignore */ }

    // Inject plugin stylesheet once
    injectGlobalStyles();

    // Inject Buy Me a Coffee widget
    injectBMCWidget();

    // Wait for page to load
    await waitForElement('.query-box-input, .create-artifact-button-container', 15000);
    console.log('[PA] Page loaded, starting observers');

    // Add global click listener to track which modal is being opened
    document.addEventListener('click', (e) => {
        // Find if they clicked an edit button, a card, or specifically a report customize button
        const target = e.target.closest('.create-artifact-button-container, .edit-button, button[aria-label*="Customize"], button[aria-label*="testreszabása"]');
        if (!target) return;

        // Try to find the associated mat-icon
        let iconEl = target.querySelector('mat-icon');

        // If clicking an edit button specifically, the icon might be on the parent card
        if (!iconEl && target.closest('.create-artifact-button-container')) {
            iconEl = target.closest('.create-artifact-button-container').querySelector('mat-icon');
        }

        // If we are in the Reports gallery, the icon in the card header identifies the whole category
        const reportCard = target.closest('.artifact-button-content, mat-card');
        if (!iconEl && reportCard) {
            iconEl = reportCard.querySelector('mat-icon');
        }

        if (iconEl) {
            const iconName = iconEl.textContent.trim();
            if (ICON_TO_FORMAT[iconName]) {
                lastOpenedFormat = ICON_TO_FORMAT[iconName];
                console.log('[PA] User opened format:', lastOpenedFormat, 'via icon:', iconName);
            }
        }
    }, true); // use capture phase to get it early

    // Inject into chat
    injectChatButton();

    // Watch for modals and DOM changes
    const observer = new MutationObserver(() => {
        scanForModals();
        injectChatButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// ===== Scan for Modal Textareas =====
// We directly look for textareas that appear when a dialog is open
function scanForModals() {
    if (!templatesLoaded) return;

    // We look for general modal textareas or the specific configure chat one
    const textareas = document.querySelectorAll(`mat-dialog-container textarea.mat-mdc-input-element, configurable-form-dialog textarea, mat-dialog-container .textarea-container textarea, ${CONFIGURE_CHAT_SELECTOR}`);

    textareas.forEach(textarea => {
        // Skip if already injected (check parent)
        if (textarea.parentElement?.querySelector('.pa-injected')) return;
        // Also check grandparent (mat-form-field wraps textarea)
        const formField = textarea.closest('mat-form-field, .mat-mdc-form-field');
        const insertionParent = formField?.parentElement || textarea.parentElement;
        if (!insertionParent) return;
        if (insertionParent.querySelector('.pa-injected')) return;

        // Skip textareas in the main chat
        const isInOverlay = textarea.closest('mat-dialog-container, [role="dialog"], .cdk-overlay-pane, .cdk-dialog-container, .mat-mdc-dialog-surface, [class*="configure"], [class*="settings"]');
        const isConfigureChat = textarea.matches(CONFIGURE_CHAT_SELECTOR);
        if (!isInOverlay && !isConfigureChat) return;
        if (isConfigureChat && textarea.classList.contains('query-box-input')) return;

        let format = null;

        if (isConfigureChat) {
            format = 'configure-chat';
        } else {
            // Try to figure out format from a header icon first
            const dialog = textarea.closest('mat-dialog-container, [role="dialog"], .cdk-dialog-container, .mat-mdc-dialog-surface, .cdk-overlay-pane');
            const headerIcon = dialog?.querySelector('mat-icon.dialog-icon, .mat-mdc-dialog-title mat-icon');

            if (headerIcon && ICON_TO_FORMAT[headerIcon.textContent.trim()]) {
                format = ICON_TO_FORMAT[headerIcon.textContent.trim()];
            } else if (lastOpenedFormat) {
                // Fallback to the globally tracked last format clicked
                format = lastOpenedFormat;
            } else {
                // Desperate fallback for older UI or specific localized labels
                const label = (textarea.getAttribute('aria-label') || '').toLowerCase();
                const placeholder = (textarea.getAttribute('placeholder') || '').toLowerCase();
                const combined = label + ' ' + placeholder;

                if (combined.includes('audio') || combined.includes('hang')) format = 'audio-overview';
                else if (combined.includes('video') || combined.includes('videó')) format = 'video-overview';
                else if (combined.includes('infographic') || combined.includes('infografika')) format = 'infographic';
                else if (combined.includes('slide') || combined.includes('dia') || combined.includes('prezentáció')) format = 'slide-deck';
                else if (combined.includes('report') || combined.includes('jelentés')) format = 'report';
                else if (combined.includes('data table') || combined.includes('adattábla')) format = 'data-table';
                else if (combined.includes('quiz') || combined.includes('kvíz')) format = 'quiz';
                else if (combined.includes('flash') || combined.includes('card') || combined.includes('tanulókártya')) format = 'flashcards';
            }
        }

        if (!format) return;

        const templates = getTemplatesForFormat(format);
        if (templates.length === 0) return;

        console.log('[PA] Injecting into modal for format:', format, 'templates:', templates.length);

        const section = createTemplateSection(templates, textarea, format);
        const insertBefore = formField || textarea;
        insertBefore.parentElement.insertBefore(section, insertBefore);
    });
}

// ===== Create Template Section (using NLM classes) =====
function createTemplateSection(templates, textarea, format) {
    const t = I18N[language];

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
            setNativeValue(textarea, text);
            textarea.focus();
            flashToast(I18N[language].applied);
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

// ===== Chat Button =====
function injectChatButton() {
    if (!templatesLoaded) return;

    // Language-agnostic class-based selector instead of aria-label
    const chatTextarea = document.querySelector('textarea.query-box-input');
    if (!chatTextarea) return;

    // DOM: ... → parent → div.query-box → div.input-group → form → div.message-container → textarea
    const queryBox = chatTextarea.closest('.query-box');

    if (!queryBox || !queryBox.parentElement) return;

    // Check if we already injected it in to the parent
    if (queryBox.parentElement.querySelector(':scope > .pa-chat-injected')) return;

    const templates = getTemplatesForFormat('text-chat');
    if (templates.length === 0) return;

    const t = I18N[language];
    const wrapper = document.createElement('div');
    wrapper.className = 'pa-chat-injected';

    // Inject neatly at the top of the query box column without breaking internal flex layouts
    wrapper.style.cssText = 'padding: 4px 16px 8px; display: flex; gap: 8px; align-items: center; width: 100%; box-sizing: border-box; background: transparent;';

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
            setNativeValue(chatTextarea, template.prompt);
            chatTextarea.focus();
            select.selectedIndex = 0;
            flashToast(I18N[language].applied);
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
        saveCurrentInput(chatTextarea, 'text-chat');
    });

    wrapper.appendChild(select);
    wrapper.appendChild(saveBtn);

    // Insert safely into the DIRECT parent of the gray query box, directly above it.
    // This removes the "not a child of this node" error.
    queryBox.parentElement.insertBefore(wrapper, queryBox);
}

// ===== Helpers =====
async function saveCurrentInput(textarea, format) {
    const textVal = textarea.value.trim();
    if (!textVal) return;

    const t = I18N[language];
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
    await chrome.storage.local.set({ userPrompts });

    flashToast(t.saved);

    // Refresh modal UI to show the new option in the select dropdowns
    const injected = document.querySelectorAll('.pa-injected, .pa-chat-injected');
    injected.forEach(el => el.remove());
    scanForModals();
    injectChatButton();
}

function showSaveModal(defaultTitle) {
    return new Promise((resolve) => {
        const t = I18N[language];

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
        if (p.lang === language) return true;                  // exact match
        if (language === 'hu' && p.lang === 'en' && !huIds.has(p.id)) return true; // EN fallback
        return false;
    });
    return [...userPrompts.filter(p => p.format === format), ...langTemplates];
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
        const textarea = document.querySelector('textarea.query-box-input');
        if (textarea) setNativeValue(textarea, msg.prompt);
        sendResponse({ success: true });
    }
    return true;
});

// ===== Storage Sync =====
// Keep userPrompts and language in sync with the popup in real time.
// Whenever the popup deletes/edits a prompt or switches language, we
// update in-memory state and re-render all injected UI elements.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    let needsRefresh = false;

    if (changes.userPrompts) {
        userPrompts = changes.userPrompts.newValue || [];
        needsRefresh = true;
        console.log('[PA] userPrompts synced from storage:', userPrompts.length, 'entries');
    }

    if (changes.language) {
        language = changes.language.newValue || 'en';
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
