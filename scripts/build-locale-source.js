#!/usr/bin/env node
/**
 * Emits data/locales/en.json — the single source file that every other locale
 * is translated from.
 *
 * Only two things need translating per language:
 *   ui        — the 55 popup interface strings
 *   templates — title + description for each of the 114 English templates
 *
 * Prompt bodies are deliberately NOT included. Measured 2026-08-02: an English
 * prompt against Hungarian sources answers in English, so the body language does
 * not follow the sources — but appending "Answer in <language>." fixes it. That
 * one generated line replaces translating 227 KB of prompt bodies.
 *
 *   node scripts/build-locale-source.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'locales');

// i18n.js is a plain script, not a module — evaluate it to get the object
function readI18N() {
  const src = fs.readFileSync(path.join(ROOT, 'data', 'i18n.js'), 'utf8');
  const body = src.replace(/^const I18N\s*=/, '').replace(/;\s*$/, '');
  return eval('(' + body + ')');
}

const i18n = readI18N();
const templates = require(path.join(ROOT, 'data', 'templates.json'));

const en = templates.filter(t => t.lang === 'en');
const tmpl = {};
for (const t of en) {
  tmpl[t.id] = { title: t.title, description: t.description || '' };
}

const out = {
  _comment: 'Source of truth for translation. ui = popup interface, templates = title/description per template id. Prompt bodies are never translated.',
  language: 'en',
  languageName: 'English',
  ui: i18n.en,
  templates: tmpl
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, 'en.json');
fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf8');

const uiKeys = JSON.stringify(i18n.en).match(/"[^"]*":/g).length;
console.log(`Wrote ${path.relative(ROOT, file)}`);
console.log(`  ui        : ${uiKeys} keys`);
console.log(`  templates : ${Object.keys(tmpl).length} entries (${Object.keys(tmpl).length * 2} strings)`);
console.log(`  size      : ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
