#!/usr/bin/env node
/**
 * Fills in UI strings that exist in data/locales/en.json but are missing from a
 * translated locale — the case where a key was added to the extension after the
 * locales were generated.
 *
 *   node scripts/translate-missing-ui.js            # every locale that has gaps
 *   node scripts/translate-missing-ui.js de ja      # named ones
 *
 * Only the missing keys are sent, so this stays a single fast call per language
 * rather than a re-translation of everything.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DIR = path.join(__dirname, '..', 'data', 'locales');
const SRC = JSON.parse(fs.readFileSync(path.join(DIR, 'en.json'), 'utf8'));

const NAMES = {
  es: 'Spanish (Spain)', 'pt-BR': 'Brazilian Portuguese', fr: 'French', de: 'German',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', 'zh-CN': 'Simplified Chinese',
  hi: 'Hindi', ru: 'Russian'
};

const RULES = `
Rules:
- Translate only the values, never the keys, and keep the nesting exactly as given.
- Keep {n} as-is; it is replaced with a number at runtime.
- Keep leading symbols such as ✓, ⚠, 📚 and ── dashes.
- "NotebookLM", "Studio", "Prompt Architect" are product names — do not translate.
- These are compact UI labels; keep them short.
- Output ONLY the JSON object, no markdown fence, no commentary.
`.trim();

// spawn + 'exit' rather than execFile: codex starts MCP subprocesses that hold
// stdout open, so waiting for 'close' hangs forever.
function ask(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn('codex', ['exec', '--skip-git-repo-check', prompt],
      { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
    let out = '';
    child.stdout.on('data', d => { out += d; });
    child.on('exit', () => setTimeout(() => {
      const m = out.match(/\{[\s\S]*\}/g);
      if (!m) return reject(new Error('no JSON in codex output'));
      try { resolve(JSON.parse(m[m.length - 1])); }
      catch (e) { reject(new Error('unparseable JSON: ' + e.message)); }
    }, 250));
    child.on('error', reject);
  });
}

/** Returns the subtree of `src` whose leaves are absent from `loc`. */
function missingOnly(src, loc) {
  const out = {};
  for (const [k, v] of Object.entries(src)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const sub = missingOnly(v, (loc && loc[k]) || {});
      if (Object.keys(sub).length) out[k] = sub;
    } else if (!loc || loc[k] === undefined) {
      out[k] = v;
    }
  }
  return out;
}

function deepAssign(target, extra) {
  for (const [k, v] of Object.entries(extra)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      target[k] = target[k] || {};
      deepAssign(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

(async () => {
  const args = process.argv.slice(2);
  const codes = args.length ? args
    : Object.keys(NAMES).filter(c => fs.existsSync(path.join(DIR, `${c}.json`)));

  for (const code of codes) {
    const file = path.join(DIR, `${code}.json`);
    if (!fs.existsSync(file)) { console.log(`skip ${code} — no locale file`); continue; }
    const loc = JSON.parse(fs.readFileSync(file, 'utf8'));

    const gaps = {};
    const ui = missingOnly(SRC.ui, loc.ui);
    const content = missingOnly(SRC.content || {}, loc.content);
    if (Object.keys(ui).length) gaps.ui = ui;
    if (Object.keys(content).length) gaps.content = content;

    const count = JSON.stringify(gaps).match(/"[^"]*":\s*"/g)?.length || 0;
    if (!count) { console.log(`${code}: complete`); continue; }

    process.stdout.write(`${code}: ${count} missing … `);
    try {
      const res = await ask(`Translate these UI strings from English to ${NAMES[code]}.\n${RULES}\n\nJSON:\n${JSON.stringify(gaps)}`);
      if (res.ui) deepAssign(loc.ui = loc.ui || {}, res.ui);
      if (res.content) deepAssign(loc.content = loc.content || {}, res.content);
      fs.writeFileSync(file, JSON.stringify(loc, null, 2) + '\n', 'utf8');
      console.log('filled');
    } catch (e) {
      console.log(`FAILED — ${e.message.slice(0, 100)}`);
    }
  }
})();
