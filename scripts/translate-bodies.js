#!/usr/bin/env node
/**
 * Translates prompt bodies into an existing locale, via the local `codex` CLI.
 *
 *   node scripts/translate-bodies.js de           # one language
 *   node scripts/translate-bodies.js de es fr     # several, sequentially
 *
 * Requires data/locales/<lang>.json to already exist (run translate-locales.js
 * first for the UI strings and titles). Bodies and slot labels are merged in.
 *
 * The grounding boilerplate is NOT sent here — it is hand-translated once per
 * language in _boilerplate.json and composed back at apply time, so a machine
 * never rewords the text that keeps answers source-grounded.
 *
 * Progress is written back after every batch, so an interrupted run resumes
 * instead of starting over.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'locales');
const SRC = JSON.parse(fs.readFileSync(path.join(DIR, 'en.json'), 'utf8'));

const NAMES = {
  es: 'Spanish (Spain)', 'pt-BR': 'Brazilian Portuguese', fr: 'French', de: 'German',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', 'zh-CN': 'Simplified Chinese',
  hi: 'Hindi', ru: 'Russian'
};

// Character budget per codex call. Small enough to stay reliable, large enough
// that a language finishes in minutes rather than hours.
const BUDGET = 6000;

const RULES = `
Translate the "body" of each entry. These are prompt templates a user reads and edits.

MUST NOT change:
- hex colour codes (#FF1493), numbers, units, measurements
- YAML/spec keys — the text before a colon at the start of an indented line
  (e.g. "Color Palette:", "Typography:", "Rule:") stays in English
- anything inside a code fence
- product names: NotebookLM, Studio, Gemini, Prompt Architect
- markdown structure, indentation, line breaks, bullet characters

MUST translate:
- all prose, instructions, descriptions and the human-readable values after a colon
  (e.g. "#FF1493 (magenta — vibrant emotional anchor)" -> keep #FF1493, translate the parenthetical)
- every [BRACKETED] token, and report the mapping in "slots"

Output ONLY a JSON object of the form:
{"<template id>": {"body": "...", "slots": {"[ENGLISH TOKEN]": "[TRANSLATED TOKEN]"}}}
No markdown fence, no commentary. Keep template ids exactly as given.
`.trim();

function ask(prompt) {
  const res = execFileSync('codex', ['exec', '--skip-git-repo-check', prompt], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 20 * 60 * 1000
  });
  const m = res.match(/\{[\s\S]*\}/g);
  if (!m) throw new Error('no JSON in codex output:\n' + res.slice(-500));
  return JSON.parse(m[m.length - 1]);
}

/** Groups template ids into batches under the character budget. */
function batches(ids) {
  const out = [];
  let cur = [], size = 0;
  for (const id of ids) {
    const len = SRC.templates[id].body.length;
    if (cur.length && size + len > BUDGET) { out.push(cur); cur = []; size = 0; }
    cur.push(id); size += len;
  }
  if (cur.length) out.push(cur);
  return out;
}

function translateLang(code) {
  const name = NAMES[code];
  if (!name) throw new Error('Unknown language: ' + code);
  const file = path.join(DIR, `${code}.json`);
  if (!fs.existsSync(file)) throw new Error(`${code}.json not found — run translate-locales.js ${code} first`);

  const loc = JSON.parse(fs.readFileSync(file, 'utf8'));
  loc.templates = loc.templates || {};

  // Resume: skip anything that already has a body
  const todo = Object.keys(SRC.templates).filter(id => !(loc.templates[id] || {}).body);
  const done = Object.keys(SRC.templates).length - todo.length;
  console.log(`\n=== ${code} (${name}) — ${todo.length} to do, ${done} already done ===`);
  if (!todo.length) return;

  const groups = batches(todo);
  groups.forEach((ids, i) => {
    const payload = {};
    ids.forEach(id => {
      payload[id] = { body: SRC.templates[id].body, slots: SRC.templates[id].slots };
    });
    const kb = (JSON.stringify(payload).length / 1024).toFixed(1);
    process.stdout.write(`  batch ${i + 1}/${groups.length} (${ids.length} templates, ${kb} KB) … `);
    try {
      const res = ask(`Translate from English to ${name}.\n${RULES}\n\nJSON:\n${JSON.stringify(payload)}`);
      let n = 0;
      for (const id of ids) {
        if (!res[id] || !res[id].body) continue;
        // Carry grounding + slotRule across so the runtime can compose the
        // prompt from this file alone, without also loading the English source.
        loc.templates[id] = {
          ...(loc.templates[id] || {}),
          grounding: SRC.templates[id].grounding,
          slotRule: SRC.templates[id].slotRule,
          body: res[id].body,
          slots: res[id].slots || {}
        };
        n++;
      }
      fs.writeFileSync(file, JSON.stringify(loc, null, 2) + '\n', 'utf8');   // checkpoint
      console.log(`${n}/${ids.length} ok`);
    } catch (e) {
      console.log(`FAILED — ${e.message.slice(0, 120)}`);
    }
  });

  const filled = Object.values(loc.templates).filter(v => v.body).length;
  console.log(`  -> ${path.relative(ROOT, file)} — ${filled}/${Object.keys(SRC.templates).length} bodies, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

const args = process.argv.slice(2);
if (!args.length) {
  console.log('Usage: node scripts/translate-bodies.js <lang> [lang...]');
  console.log('Available: ' + Object.keys(NAMES).join(', '));
  process.exit(1);
}
for (const code of args) {
  try { translateLang(code); }
  catch (e) { console.error(`  FAILED ${code}: ${e.message.slice(0, 300)}`); }
}
