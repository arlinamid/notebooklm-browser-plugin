#!/usr/bin/env node
/**
 * Emits data/locales/en.json — the single source file every other locale is
 * translated from.
 *
 * Per template it carries:
 *   title, description  — what the user reads while browsing
 *   body                — the prompt WITHOUT its grounding boilerplate
 *   grounding           — which boilerplate variant to compose back on
 *   slots               — the user-fillable [TOKENS], extracted here
 *
 * Why the boilerplate is stripped: the grounding blocks and the bracket rule are
 * identical across all 114 templates (15% of the text). They are hand-translated
 * once per language in _boilerplate.json and composed back at apply time, so a
 * machine never gets to reword the one thing that keeps answers source-grounded.
 *
 * Why slots are extracted here: the runtime classifier keys on letter case, which
 * does not exist in Japanese, Chinese, Korean or Hindi — every bracket token there
 * would look user-fillable, including model-side scaffolding like [quote]. Doing
 * it once against the English source, where the classifier is verified, avoids
 * running any heuristic over translated text.
 *
 *   node scripts/build-locale-source.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'locales');
const BP = JSON.parse(fs.readFileSync(path.join(OUT_DIR, '_boilerplate.json'), 'utf8'));

function readI18N() {
  const src = fs.readFileSync(path.join(ROOT, 'data', 'i18n.js'), 'utf8');
  return eval('(' + src.replace(/^const I18N\s*=/, '').replace(/;\s*$/, '') + ')');
}

// --- slot extraction (must stay in step with isUserSlot() in content/content.js) ---
const SLOT_TOKEN = /\[[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű][^\]\n]{1,60}\]/g;
const SLOT_IGNORE = /^\[(ROLE|INSTRUCTIONS|STEPS|END GOAL|NARROWING|CONTEXT|OBJECTIVE|STYLE|TONE|AUDIENCE|RESPONSE|RESPONSE FORMAT|VISUAL STYLE|AI FOCUS|SQUARE BRACKETS)\]$/i;

function isUserSlot(token) {
  const inner = token.slice(1, -1).trim();
  if (inner.replace(/[^\p{L}]/gu, '').length < 2) return false;
  if (inner === inner.toUpperCase()) return true;
  if (/^\p{Lu}[\p{Lu}\d/ ]*\p{Lu}(?=\s*[:\s])/u.test(inner)) return true;
  if (/^[^\s/]+(\/[^\s/]+)+$/.test(inner)) return true;
  if (/^(e\.?g\.?|your\b|you\b|describe\b|list\b|insert\b|enter\b|specify\b|upload\b)/i.test(inner)) return true;
  return false;
}

function collectSlots(text) {
  const found = new Set();
  text.split('\n').forEach(line => {
    (line.match(SLOT_TOKEN) || []).forEach(tok => {
      if (line.includes(tok + '(')) return;
      if (SLOT_IGNORE.test(tok)) return;
      if (line.trim() === tok) return;
      if (!isUserSlot(tok)) return;
      found.add(tok);
    });
  });
  return [...found];
}

// --- boilerplate stripping ---
const EN = BP.en;
const VARIANTS = [['style', EN.style], ['content', EN.content], ['system', EN.system]];

/**
 * Splits a prompt into { grounding, hasSlotRule, body }.
 *
 * Works by index rather than split/rejoin: a blank line containing spaces
 * (`\n    \n`) is meaningful whitespace inside these prompts, and rejoining on
 * `\n\n` would silently normalise it away.
 */
function stripBoilerplate(prompt) {
  let pos = 0, grounding = null, hasSlotRule = false;

  const consume = (text) => {
    const trimmed = text.trim();
    if (!prompt.startsWith(trimmed, pos)) return false;
    pos += trimmed.length;
    const gap = prompt.slice(pos).match(/^\s*\n\s*\n/);   // separator to the next block
    if (gap) pos += gap[0].length;
    else pos = prompt.length;
    return true;
  };

  let moved = true;
  while (moved) {
    moved = false;
    for (const [name, text] of VARIANTS) {
      if (!grounding && consume(text)) { grounding = name; moved = true; break; }
    }
    if (!moved && !hasSlotRule && consume(EN.slots)) { hasSlotRule = true; moved = true; }
  }

  return { grounding, hasSlotRule, body: prompt.slice(pos) };
}

const i18n = readI18N();
const templates = require(path.join(ROOT, 'data', 'templates.json'));
const en = templates.filter(t => t.lang === 'en');

const tmpl = {};
const stats = { grounded: 0, ungrounded: [], withSlots: 0, slotCount: 0 };

for (const t of en) {
  const { grounding, hasSlotRule, body } = stripBoilerplate(t.prompt || '');
  const slots = collectSlots(t.prompt || '');
  if (grounding) stats.grounded++; else stats.ungrounded.push(t.id);
  if (slots.length) { stats.withSlots++; stats.slotCount += slots.length; }

  // grounding stays null when the template never had a block — 65 of them already
  // referenced the sources in their own words and were skipped by the grounding
  // pass. Composing one on now would change a shipped prompt.
  tmpl[t.id] = {
    title: t.title,
    description: t.description || '',
    grounding,
    slotRule: hasSlotRule,
    slots,
    body
  };
}

const out = {
  _comment: 'Source of truth for translation. body excludes the grounding boilerplate (see _boilerplate.json) — it is composed back at apply time. slots lists the user-fillable tokens, extracted from English so no heuristic ever runs over translated text.',
  language: 'en',
  languageName: 'English',
  ui: i18n.en,
  templates: tmpl
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, 'en.json');
fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf8');

const bodyChars = Object.values(tmpl).reduce((s, v) => s + v.body.length, 0);
console.log(`Wrote ${path.relative(ROOT, file)}`);
console.log(`  templates      : ${en.length}`);
console.log(`  with a grounding block : ${stats.grounded}`);
console.log(`  already source-aware   : ${stats.ungrounded.length} (no block to strip or compose)`);
console.log(`  with slots     : ${stats.withSlots} templates, ${stats.slotCount} slots total`);
console.log(`  body text      : ${(bodyChars / 1024).toFixed(0)} KB (boilerplate excluded)`);
console.log(`  file size      : ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
