#!/usr/bin/env node
/**
 * Translates the content script's own 15 injected-UI strings into every locale
 * that already exists. Small enough for a single codex call per language.
 *
 *   node scripts/translate-content-strings.js            # all existing locales
 *   node scripts/translate-content-strings.js de ja      # named ones
 *
 * These are separate from the popup's `ui` strings: they label the dropdown and
 * the placeholder filler panel injected into NotebookLM itself.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = path.join(__dirname, '..', 'data', 'locales');
const SRC = JSON.parse(fs.readFileSync(path.join(DIR, 'en.json'), 'utf8'));

const NAMES = {
  es: 'Spanish (Spain)', 'pt-BR': 'Brazilian Portuguese', fr: 'French', de: 'German',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', 'zh-CN': 'Simplified Chinese',
  hi: 'Hindi', ru: 'Russian'
};

const RULES = `
Rules:
- Translate only the values, never the keys.
- Keep {n} exactly as it is — it is replaced with a number at runtime.
- Keep leading symbols such as ✓, ⚠, 📚 and the ── dashes.
- "NotebookLM", "Studio" and "Prompt Architect" are product names — do not translate.
- These are compact UI labels; keep them short.
- Output ONLY the JSON object, no markdown fence, no commentary.
`.trim();

function ask(prompt) {
  const res = execFileSync('codex', ['exec', '--skip-git-repo-check', prompt], {
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 10 * 60 * 1000
  });
  const m = res.match(/\{[\s\S]*\}/g);
  if (!m) throw new Error('no JSON in codex output');
  return JSON.parse(m[m.length - 1]);
}

const args = process.argv.slice(2);
const codes = args.length ? args : Object.keys(NAMES).filter(c => fs.existsSync(path.join(DIR, `${c}.json`)));

for (const code of codes) {
  const file = path.join(DIR, `${code}.json`);
  if (!fs.existsSync(file)) { console.log(`skip ${code} — no locale file`); continue; }
  const loc = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (loc.content && Object.keys(loc.content).length === Object.keys(SRC.content).length) {
    console.log(`skip ${code} — already translated`);
    continue;
  }
  process.stdout.write(`${code} … `);
  try {
    const out = ask(`Translate these UI strings from English to ${NAMES[code]}.\n${RULES}\n\nJSON:\n${JSON.stringify(SRC.content)}`);
    const missing = Object.keys(SRC.content).filter(k => !out[k]);
    if (missing.length) { console.log(`FAILED — missing ${missing.join(', ')}`); continue; }
    loc.content = out;
    fs.writeFileSync(file, JSON.stringify(loc, null, 2) + '\n', 'utf8');
    console.log(`${Object.keys(out).length} strings ok`);
  } catch (e) {
    console.log(`FAILED — ${e.message.slice(0, 120)}`);
  }
}
