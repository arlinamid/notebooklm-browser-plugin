// ===== Prompt Architect — Popup Logic =====

const CATEGORIES = ['all', 'studio', 'data-engineering', 'critical-analysis', 'learning', 'productivity', 'troubleshooting', 'professional', 'viral'];

// Languages with a shipped data/locales/<code>.json. English and Hungarian also
// have fully translated prompt bodies under templates/; the rest get English
// bodies with translated titles and descriptions — measured as 5% of the text
// for ~90% of the benefit. See docs/I18N-PLAN.md.
const AVAILABLE_LANGUAGES = {
    en: 'English',
    hu: 'Magyar',
    es: 'Español',
    'pt-BR': 'Português',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    'zh-CN': '中文',
    hi: 'हिन्दी',
    ru: 'Русский'
};

// Languages that ship fully translated prompt bodies under templates/
const NATIVE_BODY_LANGS = new Set(['en', 'hu']);

// Locale data for the current language, or null when English / not yet loaded
let locale = null;

async function loadLocale(lang) {
    locale = null;
    // en and hu ship native prompt bodies and bundled UI strings — no locale file,
    // and attempting the fetch would log a 404 on every open.
    if (!lang || NATIVE_BODY_LANGS.has(lang)) return;
    try {
        const res = await fetch(chrome.runtime.getURL(`data/locales/${lang}.json`));
        if (res.ok) locale = await res.json();
    } catch (e) {
        console.warn('[PA] locale load failed for', lang, e);
    }
}

/** UI strings: locale file → bundled i18n.js → English. */
function strings() {
    return (locale && locale.ui) || I18N[language] || I18N.en;
}

/** Title/description for a template, translated when the locale provides it. */
function localized(p) {
    const tr = locale && locale.templates && locale.templates[p.id];
    if (!tr) return p;
    return {
        ...p,
        title: tr.title || p.title,
        description: tr.description || p.description
    };
}

let allTemplates = [];
let userPrompts = [];
let language = 'en';
let activeFormat = 'audio-overview';
let activeCategory = 'all';
let activeLevel = 'all';
let searchQuery = '';
let editingPrompt = null;

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
    // Load templates
    const resp = await fetch(chrome.runtime.getURL('data/templates.json'));
    allTemplates = await resp.json();

    // Load data from sync with migration from local
    let stored = await chrome.storage.sync.get(['userPrompts', 'language', 'migrationDone']);

    if (!stored.migrationDone) {
        const localData = await chrome.storage.local.get(['userPrompts', 'language']);
        userPrompts = mergePrompts(stored.userPrompts, localData.userPrompts);
        language = stored.language || localData.language || 'en';

        if (localData.userPrompts && localData.userPrompts.length > 0) {
            console.log('[PA] Migrating', localData.userPrompts.length, 'prompt(s) from local to sync (Popup)...');
            await chrome.storage.sync.set({ userPrompts, language, migrationDone: true });
            await chrome.storage.local.remove('userPrompts');
        } else {
            // Only flip the flag — writing userPrompts here would wipe anything
            // already synced from another device.
            await chrome.storage.sync.set({ migrationDone: true });
        }
    } else {
        userPrompts = stored.userPrompts || [];
        language = stored.language || 'en';
    }

    await loadLocale(language);
    initUI();
    render();
});

// ===== UI Init =====
function initUI() {
    const t = strings();

    // Header
    document.getElementById('appTitle').textContent = t.appTitle;
    document.getElementById('appSubtitle').textContent = t.subtitle;

    // Language picker — populated from the locales that actually shipped
    const langSelect = document.getElementById('langSelect');
    if (langSelect && !langSelect.dataset.built) {
        langSelect.dataset.built = '1';
        langSelect.innerHTML = '';
        for (const [code, label] of Object.entries(AVAILABLE_LANGUAGES)) {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = label;
            langSelect.appendChild(opt);
        }
        langSelect.addEventListener('change', async () => {
            language = langSelect.value;
            chrome.storage.sync.set({ language });
            await loadLocale(language);
            initUI();
            render();
        });
    }
    if (langSelect) langSelect.value = language;

    // Format tabs
    const tabsContainer = document.getElementById('formatTabs');
    tabsContainer.querySelectorAll('.pa-format-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.format === activeFormat);
        // Update label
        const span = tab.querySelector('span');
        if (span && t.formats[tab.dataset.format]) {
            span.textContent = t.formats[tab.dataset.format];
        }
        tab.addEventListener('click', () => {
            activeFormat = tab.dataset.format;
            tabsContainer.querySelectorAll('.pa-format-tab').forEach(t2 => t2.classList.toggle('active', t2.dataset.format === activeFormat));
            render();
        });
    });

    // Category chips
    const catContainer = document.getElementById('categoryFilters');
    catContainer.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const chip = document.createElement('button');
        chip.className = `pa-filter-chip${activeCategory === cat ? ' active' : ''}`;
        chip.textContent = t.categories[cat] || cat;
        chip.addEventListener('click', () => {
            activeCategory = cat;
            catContainer.querySelectorAll('.pa-filter-chip').forEach(c => c.classList.toggle('active', false));
            chip.classList.add('active');
            render();
        });
        catContainer.appendChild(chip);
    });

    // Level select
    const levelSel = document.getElementById('levelSelect');
    levelSel.innerHTML = '';
    ['all', 'beginner', 'intermediate', 'advanced'].forEach(lvl => {
        const opt = document.createElement('option');
        opt.value = lvl;
        opt.textContent = t.levels[lvl];
        opt.selected = activeLevel === lvl;
        levelSel.appendChild(opt);
    });
    levelSel.onchange = () => { activeLevel = levelSel.value; render(); };

    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.placeholder = t.searchPlaceholder;
    searchInput.value = searchQuery;
    searchInput.oninput = () => { searchQuery = searchInput.value; render(); };

    // New prompt button
    document.getElementById('btnNewPrompt').onclick = () => openEditor(null);

    // About button
    const aboutOverlay = document.getElementById('aboutOverlay');
    document.getElementById('btnAbout').onclick = () => aboutOverlay.classList.add('open');
    document.getElementById('btnAboutClose').onclick = () => aboutOverlay.classList.remove('open');
    aboutOverlay.addEventListener('click', (e) => {
        if (e.target === aboutOverlay) aboutOverlay.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') aboutOverlay.classList.remove('open');
    });

    // Clear filters
    document.getElementById('btnClearFilters').onclick = () => {
        activeCategory = 'all';
        activeLevel = 'all';
        searchQuery = '';
        initUI();
        render();
    };

    // Empty state text
    document.getElementById('emptyMsg').textContent = t.noPrompts;

    // Editor labels
    document.getElementById('editorTitle').textContent = t.editor.createTitle;
    document.getElementById('edLabelTitle').textContent = t.editor.titleLabel;
    document.getElementById('edTitle').placeholder = t.editor.titlePlaceholder;
    document.getElementById('edLabelFormat').textContent = t.editor.formatLabel;
    document.getElementById('edLabelCategory').textContent = t.editor.categoryLabel;
    document.getElementById('edLabelLevel').textContent = t.editor.levelLabel;
    document.getElementById('edLabelSettings').textContent = t.editor.settingsLabel;
    document.getElementById('edSettings').placeholder = t.editor.settingsPlaceholder;
    document.getElementById('edLabelDesc').textContent = t.editor.descriptionLabel;
    document.getElementById('edDescription').placeholder = t.editor.descriptionPlaceholder;
    document.getElementById('edLabelPrompt').textContent = t.editor.promptLabel;
    document.getElementById('edPrompt').placeholder = t.editor.promptPlaceholder;
    document.getElementById('edCancel').textContent = t.editor.cancel;
    document.getElementById('edSave').textContent = t.editor.save;

    // Editor category select
    const edCat = document.getElementById('edCategory');
    edCat.innerHTML = '';
    CATEGORIES.filter(c => c !== 'all').forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = t.categories[cat] || cat;
        edCat.appendChild(opt);
    });

    // Editor format select labels
    const edFmt = document.getElementById('edFormat');
    Array.from(edFmt.options).forEach(opt => {
        if (t.formats[opt.value]) opt.textContent = t.formats[opt.value];
    });

    // Editor level select labels
    const edLvl = document.getElementById('edLevel');
    Array.from(edLvl.options).forEach(opt => {
        if (t.levels[opt.value]) opt.textContent = t.levels[opt.value];
    });

    // Editor actions
    document.getElementById('editorClose').onclick = closeEditor;
    document.getElementById('edCancel').onclick = closeEditor;
    document.getElementById('edSave').onclick = savePrompt;
}

// ===== Render =====
function render() {
    const t = strings();

    // Prompt bodies exist only for en and hu. Every other language uses the
    // English bodies and gets its titles/descriptions from the locale file.
    const huIds = new Set(allTemplates.filter(p => p.lang === 'hu').map(p => p.id));
    const langTemplates = allTemplates.filter(p => {
        if (!p.lang) return true;                              // legacy entries without lang tag
        if (!NATIVE_BODY_LANGS.has(language)) return p.lang === 'en';
        if (p.lang === language) return true;                  // exact match
        if (language === 'hu' && p.lang === 'en' && !huIds.has(p.id)) return true; // EN fallback for missing HU
        return false;
    });
    // Swap in translated titles/descriptions before filtering, so search matches
    // what the user actually sees
    const all = [...userPrompts, ...langTemplates.map(localized)];

    const filtered = all.filter(p => {
        const fmt = p.format || 'text-chat';
        if (fmt !== activeFormat) return false;
        if (activeCategory !== 'all' && p.category !== activeCategory) return false;
        if (activeLevel !== 'all' && p.level !== activeLevel) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const container = document.getElementById('cardsContainer');
    const empty = document.getElementById('emptyState');

    if (filtered.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    container.innerHTML = filtered.map(p => renderCard(p, t)).join('');

    // Attach events
    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const prompt = all.find(p => p.id === id);
            if (!prompt) return;

            if (action === 'apply') applyPrompt(prompt, btn, t);
            else if (action === 'copy') copyPrompt(prompt, btn, t);
            else if (action === 'edit') openEditor(prompt);
            else if (action === 'delete') deletePrompt(prompt.id);
        });
    });
}

function renderCard(p, t) {
    const levelClass = `pa-badge-${p.level}`;
    const levelLabel = t.levels[p.level] || p.level;
    const customBadge = p.isUserDefined ? `<span class="pa-badge pa-badge-custom">${t.card.custom}</span>` : '';
    const catLabel = t.categories[p.category] || p.category;

    const editBtn = `<button class="pa-btn-sm" data-action="edit" data-id="${esc(p.id)}" title="${t.card.edit}">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  </button>`;

    const deleteBtn = p.isUserDefined ? `<button class="pa-btn-sm delete" data-action="delete" data-id="${esc(p.id)}" title="${t.card.delete}">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  </button>` : '';

    return `<div class="pa-card">
    <div class="pa-card-top">
      <div class="pa-card-title">${esc(p.title)}</div>
      <div class="pa-card-badges">
        <span class="pa-badge ${levelClass}">${levelLabel}</span>
        ${customBadge}
        <span class="pa-badge pa-badge-category">${catLabel}</span>
      </div>
    </div>
    <div class="pa-card-desc">${esc(p.description)}</div>
    <div class="pa-card-prompt">${esc(previewOf(p.prompt))}</div>
    ${p.settings ? `<div class="pa-card-settings">${esc(p.settings)}</div>` : ''}
    <div class="pa-card-actions">
      <button class="pa-btn-apply" data-action="apply" data-id="${esc(p.id)}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        ${t.card.apply}
      </button>
      <button class="pa-btn-copy" data-action="copy" data-id="${esc(p.id)}">${t.card.copy}</button>
      ${editBtn}
      ${deleteBtn}
    </div>
  </div>`;
}

// ===== Actions =====
async function applyPrompt(prompt, btn, t) {
    // Send message to content script
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && /:\/\/(notebooklm|notebook)\.google\.com\//.test(tab.url)) {
            const resp = await chrome.tabs.sendMessage(tab.id, {
                type: 'APPLY_PROMPT',
                prompt: prompt.prompt,
                format: prompt.format
            });

            // A studio-format prompt has nowhere to go unless the notebook is
            // one the user owns. Say so and fall back to the clipboard rather
            // than silently dropping it into the chat box.
            if (!resp || !resp.success) {
                copyPrompt(prompt, btn, t);
                showApplyNote(resp && resp.reason === 'no-studio' ? t.card.noStudio : t.card.noTarget);
                return;
            }

            btn.classList.add('applied');
            btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ${t.card.applied}`;
            setTimeout(() => {
                btn.classList.remove('applied');
                btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ${t.card.apply}`;
            }, 2000);
        } else {
            // Not on NLM — just copy
            copyPrompt(prompt, btn, t);
        }
    } catch (err) {
        console.error('Apply failed:', err);
        copyPrompt(prompt, btn, t);
    }
}

// Every template now opens with a source-grounding block, and templates with
// fill-in slots also carry a bracket-handling rule. That boilerplate is
// identical everywhere, so showing it in the card preview hides the one thing
// the user is actually scanning for. Strip it for display only — the prompt
// that gets applied is always the complete text.
const BOILERPLATE_BLOCK = /^(GROUNDING —|MEGALAPOZÁS —|Text in \[SQUARE BRACKETS\]|A \[SZÖGLETES ZÁRÓJELBEN\])/;

function previewOf(promptText) {
    const blocks = String(promptText || '').split(/\n\s*\n/);
    let i = 0;
    while (i < blocks.length && BOILERPLATE_BLOCK.test(blocks[i].trim())) i++;
    // Never return nothing — if a prompt were only boilerplate, show it as-is
    return i < blocks.length ? blocks.slice(i).join('\n\n') : promptText;
}

// Transient banner at the bottom of the popup — used when Apply could not
// reach a sensible target and fell back to the clipboard.
function showApplyNote(msg) {
    document.getElementById('pa-apply-note')?.remove();
    const note = document.createElement('div');
    note.id = 'pa-apply-note';
    note.textContent = msg;
    note.style.cssText = `
        position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 9999;
        padding: 10px 12px; border-radius: 8px;
        background: #4a3a10; color: #f6e7c1; border: 1px solid #6b5416;
        font-size: 12px; line-height: 1.4;
        box-shadow: 0 4px 14px rgba(0,0,0,.35);
    `;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 5000);
}

function copyPrompt(prompt, btn, t) {
    navigator.clipboard.writeText(prompt.prompt);
    const origText = btn.textContent;
    btn.classList.add('copied');
    btn.textContent = t.card.copied;
    setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = origText || t.card.copy;
    }, 2000);
}

function deletePrompt(id) {
    userPrompts = userPrompts.filter(p => p.id !== id);
    chrome.storage.sync.set({ userPrompts });
    render();
}

// ===== Editor =====
function openEditor(prompt) {
    editingPrompt = prompt;
    const t = strings();

    document.getElementById('editorTitle').textContent = prompt ? t.editor.editTitle : t.editor.createTitle;
    document.getElementById('edTitle').value = prompt ? prompt.title : '';
    document.getElementById('edFormat').value = prompt ? (prompt.format || activeFormat) : activeFormat;
    document.getElementById('edCategory').value = prompt ? prompt.category : 'professional';
    document.getElementById('edLevel').value = prompt ? prompt.level : 'intermediate';
    document.getElementById('edDescription').value = prompt ? prompt.description : '';
    document.getElementById('edPrompt').value = prompt ? prompt.prompt : '';
    document.getElementById('edSettings').value = prompt ? prompt.settings : '';

    document.getElementById('editorOverlay').style.display = 'flex';
}

function closeEditor() {
    document.getElementById('editorOverlay').style.display = 'none';
    editingPrompt = null;
}

function savePrompt() {
    const title = document.getElementById('edTitle').value.trim();
    const promptText = document.getElementById('edPrompt').value.trim();
    if (!title || !promptText) return;

    const newPrompt = {
        id: editingPrompt?.isUserDefined ? editingPrompt.id : Date.now().toString(),
        title,
        format: document.getElementById('edFormat').value,
        category: document.getElementById('edCategory').value,
        level: document.getElementById('edLevel').value,
        description: document.getElementById('edDescription').value.trim(),
        prompt: promptText,
        settings: document.getElementById('edSettings').value.trim(),
        isUserDefined: true
    };

    const idx = userPrompts.findIndex(p => p.id === newPrompt.id);
    if (idx > -1) {
        userPrompts[idx] = newPrompt;
    } else {
        userPrompts.unshift(newPrompt);
    }

    chrome.storage.sync.set({ userPrompts });
    closeEditor();
    render();
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

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
