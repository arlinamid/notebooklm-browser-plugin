#!/usr/bin/env node
/**
 * Delegates locale translation to the local `codex` CLI, one language per run.
 *
 *   node scripts/translate-locales.js de           # one language
 *   node scripts/translate-locales.js de es fr     # several, sequentially
 *
 * Input  : data/locales/en.json
 * Output : data/locales/<lang>.json
 *
 * Nothing is trusted blindly — validate-locales.js checks every result for
 * missing keys, empty values, untranslated leftovers and JSON validity.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'locales');
const SRC = path.join(DIR, 'en.json');

const LANGUAGES = {
  es: 'Spanish (Spain)',
  'pt-BR': 'Brazilian Portuguese',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  'zh-CN': 'Simplified Chinese',
  hi: 'Hindi',
  ru: 'Russian',
  hu: 'Hungarian'
};

// Translating 26 KB in one call is unreliable, so send it in slices.
const CHUNK = 40;

function chunkObject(obj, size) {
  const keys = Object.keys(obj);
  const out = [];
  for (let i = 0; i < keys.length; i += size) {
    out.push(Object.fromEntries(keys.slice(i, i + size).map(k => [k, obj[k]])));
  }
  return out;
}

function ask(prompt) {
  const res = execFileSync('codex', ['exec', '--skip-git-repo-check', prompt], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 15 * 60 * 1000
  });
  // codex echoes progress lines; the payload is the last JSON object in the output
  const m = res.match(/\{[\s\S]*\}/g);
  if (!m) throw new Error('no JSON in codex output:\n' + res.slice(-600));
  return JSON.parse(m[m.length - 1]);
}

const RULES = `
Rules:
- Translate ONLY the string values. Never translate or alter any key.
- Keep every key exactly as given, same nesting, same count.
- Preserve leading/trailing spaces, punctuation, emoji, and any [BRACKETED] token verbatim.
- "Prompt Architect" is a product name — leave it untranslated.
- "NotebookLM", "Studio", "Gemini" are product names — leave them untranslated.
- These are UI labels and short template titles: keep them short and idiomatic, not literal.
- Output ONLY the resulting JSON object. No markdown fence, no commentary.
`.trim();

function translateLang(code) {
  const name = LANGUAGES[code];
  if (!name) throw new Error('Unknown language: ' + code);
  const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));

  process.stdout.write(`\n=== ${code} (${name}) ===\n`);

  process.stdout.write('  ui … ');
  const ui = ask(`Translate the JSON values from English to ${name}.\n${RULES}\n\nJSON:\n${JSON.stringify(src.ui)}`);
  process.stdout.write(`${Object.keys(ui).length} keys\n`);

  const slices = chunkObject(src.templates, CHUNK);
  const templates = {};
  slices.forEach((slice, i) => {
    process.stdout.write(`  templates ${i + 1}/${slices.length} … `);
    const part = ask(
      `Translate the "title" and "description" values from English to ${name}. ` +
      `These are prompt-template names shown in a list.\n${RULES}\n\nJSON:\n${JSON.stringify(slice)}`
    );
    Object.assign(templates, part);
    process.stdout.write(`${Object.keys(part).length} entries\n`);
  });

  const out = { language: code, languageName: name, ui, templates };
  const file = path.join(DIR, `${code}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`  -> ${path.relative(ROOT, file)} (${(fs.statSync(file).size / 1024).toFixed(1)} KB)`);
}

const args = process.argv.slice(2);
if (!args.length) {
  console.log('Usage: node scripts/translate-locales.js <lang> [lang...]');
  console.log('Available: ' + Object.keys(LANGUAGES).join(', '));
  process.exit(1);
}
for (const code of args) {
  try { translateLang(code); }
  catch (e) { console.error(`  FAILED ${code}: ${e.message.slice(0, 300)}`); }
}
