#!/usr/bin/env node
/**
 * Checks every data/locales/<lang>.json against en.json. Machine translation is
 * not trusted — this is what catches it going wrong.
 *
 *   node scripts/validate-locales.js
 *
 * Exits non-zero on any error. Warnings are reported but do not fail the run.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data', 'locales');
const src = JSON.parse(fs.readFileSync(path.join(DIR, 'en.json'), 'utf8'));

// Product names that must survive translation untouched
const KEEP = ['NotebookLM', 'Prompt Architect'];
// Tokens inside strings that must be carried over verbatim
const TOKEN = /\[[A-Za-zÁÉÍÓÖŐÚÜŰ][^\]\n]{1,40}\]/g;

// Machine translation — and hand-editing — can drop characters from the wrong
// writing system into a locale. A single stray Hangul glyph inside Japanese is
// invisible on review but obvious to a native reader. (This caught exactly that
// in the hand-written boilerplate.)
const SCRIPTS = {
  hangul: /[가-힯]/g,
  kana: /[぀-ヿ]/g,
  cyrillic: /[Ѐ-ӿ]/g,
  devanagari: /[ऀ-ॿ]/g,
  han: /[一-鿿]/g
};
const EXPECTED_SCRIPTS = {
  ja: ['kana', 'han'],
  ko: ['hangul', 'han'],
  'zh-CN': ['han'],
  ru: ['cyrillic'],
  hi: ['devanagari']
};

function checkScripts(code, text) {
  const allowed = EXPECTED_SCRIPTS[code];
  if (!allowed) return [];
  return Object.entries(SCRIPTS)
    .filter(([name, re]) => (text.match(re) || []).length > 0)
    .map(([name]) => name)
    .filter(name => !allowed.includes(name))
    .map(name => `contains ${name} characters, which do not belong in ${code}`);
}

function flatten(obj, pre = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = pre ? `${pre}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else if (v && typeof v === 'object') flatten(v, key, out);
  }
  return out;
}

const srcUI = flatten(src.ui);
const srcTmpl = src.templates;
let errors = 0, warnings = 0;

// Files beginning with _ are shared data, not per-language locales
const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.json') && f !== 'en.json' && !f.startsWith('_'))
  .sort();
if (!files.length) { console.log('No translated locales yet.'); process.exit(0); }

for (const file of files) {
  const code = file.replace(/\.json$/, '');
  const errs = [], warns = [];
  let loc;
  try { loc = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')); }
  catch (e) { console.error(`\n${code}: INVALID JSON — ${e.message}`); errors++; continue; }

  // --- UI ---
  const locUI = flatten(loc.ui || {});
  for (const key of Object.keys(srcUI)) {
    if (!(key in locUI)) { errs.push(`ui.${key} missing`); continue; }
    const a = srcUI[key], b = locUI[key];
    if (!b.trim()) errs.push(`ui.${key} empty`);
    // A short label may legitimately match English (e.g. "Quiz", "Audio")
    if (a === b && a.length > 25) warns.push(`ui.${key} identical to English`);
    for (const name of KEEP) {
      if (a.includes(name) && !b.includes(name)) errs.push(`ui.${key} lost product name "${name}"`);
    }
    const at = a.match(TOKEN) || [], bt = b.match(TOKEN) || [];
    if (at.join() !== bt.join()) errs.push(`ui.${key} bracket tokens changed: ${at.join()} -> ${bt.join()}`);
  }
  for (const key of Object.keys(locUI)) {
    if (!(key in srcUI)) warns.push(`ui.${key} is not in en.json`);
  }

  // --- templates ---
  const locT = loc.templates || {};
  let identical = 0;
  for (const id of Object.keys(srcTmpl)) {
    if (!(id in locT)) { errs.push(`template ${id} missing`); continue; }
    for (const field of ['title', 'description']) {
      const a = srcTmpl[id][field] || '', b = locT[id][field];
      if (b === undefined) { errs.push(`${id}.${field} missing`); continue; }
      if (a && !String(b).trim()) errs.push(`${id}.${field} empty`);
      if (a && a === b) identical++;
    }
  }
  for (const id of Object.keys(locT)) {
    if (!(id in srcTmpl)) warns.push(`template ${id} is not in en.json`);
  }
  const total = Object.keys(srcTmpl).length * 2;
  if (identical > total * 0.15) {
    errs.push(`${identical}/${total} template strings identical to English — likely untranslated`);
  } else if (identical) {
    warns.push(`${identical}/${total} template strings identical to English`);
  }

  // --- writing system ---
  checkScripts(code, JSON.stringify(loc)).forEach(e => errs.push(e));

  const status = errs.length ? '❌' : warns.length ? '⚠️ ' : '✅';
  console.log(`${status} ${code.padEnd(6)} ui ${Object.keys(locUI).length}/${Object.keys(srcUI).length}  templates ${Object.keys(locT).length}/${Object.keys(srcTmpl).length}`);
  errs.slice(0, 12).forEach(e => console.log(`     ERROR  ${e}`));
  if (errs.length > 12) console.log(`     … and ${errs.length - 12} more errors`);
  warns.slice(0, 5).forEach(w => console.log(`     warn   ${w}`));
  if (warns.length > 5) console.log(`     … and ${warns.length - 5} more warnings`);
  errors += errs.length; warnings += warns.length;
}

// --- shared boilerplate ---
// The grounding blocks are hand-translated, so they get the same scrutiny.
const BP_FILE = path.join(DIR, '_boilerplate.json');
if (fs.existsSync(BP_FILE)) {
  const bp = JSON.parse(fs.readFileSync(BP_FILE, 'utf8'));
  const NEEDED = ['style', 'content', 'system', 'slots'];
  const langs = Object.keys(bp).filter(k => k !== '_comment');
  let bpErrs = 0;
  for (const code of langs) {
    const problems = [];
    for (const key of NEEDED) {
      if (!bp[code][key] || !String(bp[code][key]).trim()) problems.push(`${key} missing or empty`);
    }
    checkScripts(code, JSON.stringify(bp[code])).forEach(p => problems.push(p));
    if (problems.length) {
      console.log(`❌ boilerplate ${code}`);
      problems.forEach(p => console.log(`     ERROR  ${p}`));
      bpErrs += problems.length;
    }
  }
  console.log(`\nboilerplate: ${langs.length} language(s), ${bpErrs} error(s)`);
  errors += bpErrs;
}

console.log(`\n${files.length} locale(s): ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
