#!/usr/bin/env node
/**
 * Translates prompt bodies into an existing locale, via the local `codex` CLI.
 *
 *   node scripts/translate-bodies.js de           # one language
 *   node scripts/translate-bodies.js de es fr     # several
 *
 * Requires data/locales/<lang>.json to exist already (translate-locales.js
 * produces the UI strings and titles). Bodies and slot labels are merged in.
 *
 * The grounding boilerplate is NOT sent here — it is hand-translated once per
 * language in _boilerplate.json and composed back at apply time, so a machine
 * never rewords the text that keeps answers source-grounded.
 *
 * Progress is checkpointed after every batch, so an interrupted run resumes
 * instead of starting over.
 *
 * Env:
 *   PA_CONCURRENCY   parallel codex calls (default 4)
 *   PA_BATCH_CHARS   characters of body text per call (default 9000)
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'locales');
const SRC = JSON.parse(fs.readFileSync(path.join(DIR, 'en.json'), 'utf8'));

const NAMES = {
  es: 'Spanish (Spain)', 'pt-BR': 'Brazilian Portuguese', fr: 'French', de: 'German',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', 'zh-CN': 'Simplified Chinese',
  hi: 'Hindi', ru: 'Russian'
};

// Measured 2026-08-02: a codex call costs ~50 s of fixed overhead almost
// regardless of payload — 218 chars took 52 s, 3.5 KB took 50 s, 17 KB took
// 130 s. Throughput therefore comes from running calls concurrently, not from
// making batches bigger. Sequential 6 KB batches took ~40 min per language.
const BUDGET = Number(process.env.PA_BATCH_CHARS) || 9000;
const CONCURRENCY = Number(process.env.PA_CONCURRENCY) || 4;

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

CRITICAL for inflected languages (Russian, Polish, Czech, Finnish, Hungarian...):
the token inside "slots" must be the exact string that appears in "body". If the
sentence would decline the token, either keep it in the dictionary form and
reword around it, or report the declined form — the two must match byte for
byte, because the extension substitutes by exact string match.

Output ONLY a JSON object of the form:
{"<template id>": {"body": "...", "slots": {"[ENGLISH TOKEN]": "[TRANSLATED TOKEN]"}}}
No markdown fence, no commentary. Keep template ids exactly as given.
`.trim();

/**
 * Uses spawn + the 'exit' event rather than execFile.
 *
 * execFile resolves on 'close', which waits for every stdio pipe to drain.
 * codex starts MCP server subprocesses that inherit stdout and keep it open, so
 * 'close' never fires and the call hangs forever — invisible with execFileSync,
 * which only ever waited for the main process to exit.
 */
function ask(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn('codex', ['exec', '--skip-git-repo-check', prompt], {
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true
    });
    let out = '';
    child.stdout.on('data', d => { out += d; });

    const timer = setTimeout(() => { child.kill(); reject(new Error('timed out')); }, 20 * 60 * 1000);
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const m = out.match(/\{[\s\S]*\}/g);
      if (!m) return reject(new Error('no JSON in codex output'));
      try { resolve(JSON.parse(m[m.length - 1])); }
      catch (e) { reject(new Error('unparseable JSON: ' + e.message)); }
    };

    child.on('exit', () => setTimeout(finish, 250));   // let the last chunk land
    child.on('error', e => { if (!settled) { settled = true; clearTimeout(timer); reject(e); } });
  });
}

/** Runs `worker` over `items` with at most `limit` in flight. */
async function pool(items, limit, worker) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await worker(items[i], i);
      }
    })
  );
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

async function translateLang(code) {
  const name = NAMES[code];
  if (!name) throw new Error('Unknown language: ' + code);
  const file = path.join(DIR, `${code}.json`);
  if (!fs.existsSync(file)) throw new Error(`${code}.json not found — run translate-locales.js ${code} first`);

  const loc = JSON.parse(fs.readFileSync(file, 'utf8'));
  loc.templates = loc.templates || {};

  const total = Object.keys(SRC.templates).length;
  const todo = Object.keys(SRC.templates).filter(id => !(loc.templates[id] || {}).body);
  console.log(`\n=== ${code} (${name}) — ${todo.length} to do, ${total - todo.length} already done ===`);
  if (!todo.length) return;

  const groups = batches(todo);
  const started = Date.now();
  let finished = 0;

  await pool(groups, CONCURRENCY, async (ids, i) => {
    const payload = {};
    ids.forEach(id => {
      payload[id] = { body: SRC.templates[id].body, slots: SRC.templates[id].slots };
    });
    try {
      const res = await ask(`Translate from English to ${name}.\n${RULES}\n\nJSON:\n${JSON.stringify(payload)}`);
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
          // Keep only the slots the English source declares. The translator
          // tends to map every bracket token it sees, which would make the
          // filler panel ask different questions per language for the same
          // template — 6 fields in Japanese against 5 in German.
          slots: Object.fromEntries(
            Object.entries(res[id].slots || {})
              .filter(([en]) => (SRC.templates[id].slots || []).includes(en))
          )
        };
        n++;
      }
      // Node is single-threaded, so this write cannot interleave with another
      // batch's write even though several calls are in flight.
      fs.writeFileSync(file, JSON.stringify(loc, null, 2) + '\n', 'utf8');
      finished++;
      console.log(`  [${code}] batch ${i + 1}/${groups.length}: ${n}/${ids.length} ok  (${finished}/${groups.length} done, ${((Date.now() - started) / 60000).toFixed(1)} min)`);
    } catch (e) {
      finished++;
      console.log(`  [${code}] batch ${i + 1}/${groups.length}: FAILED — ${e.message.slice(0, 100)}`);
    }
  });

  const filled = Object.values(loc.templates).filter(v => v.body).length;
  console.log(`  -> ${code}: ${filled}/${total} bodies in ${((Date.now() - started) / 60000).toFixed(1)} min`);
}

(async () => {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log('Usage: node scripts/translate-bodies.js <lang> [lang...]');
    console.log('Available: ' + Object.keys(NAMES).join(', '));
    process.exit(1);
  }
  console.log(`concurrency ${CONCURRENCY}, batch budget ${BUDGET} chars`);
  for (const code of args) {
    try { await translateLang(code); }
    catch (e) { console.error(`  FAILED ${code}: ${e.message.slice(0, 300)}`); }
  }
})();
