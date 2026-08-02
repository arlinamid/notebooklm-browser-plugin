#!/usr/bin/env node
/**
 * Template linter — guards the two failure modes that make NotebookLM answer
 * the prompt instead of the sources:
 *
 *   1. no-grounding    The prompt never refers to the sources at all. Pasted into a
 *                      Studio field, the model reads the prompt body as the brief and
 *                      generates content *about the prompt* (worst for the pure
 *                      style-spec templates: slide-deck, infographic, video-overview).
 *   2. loose-slots     The prompt has [FILL ME IN] slots but no rule telling the model
 *                      what to do when one is left unfilled, so it either asks back or
 *                      echoes the bracket text into the output.
 *
 * Run after scripts/build-templates.js. Exits non-zero on any error.
 *   node scripts/lint-templates.js
 */
const path = require('path');

const TEMPLATES = require(path.join(__dirname, '..', 'data', 'templates.json'));

const GROUNDING = /\bsources?\b|\bforrás|source material|uploaded|a dokumentum|feltöltött/i;
const SLOT_RULE = /SQUARE BRACKETS|SZÖGLETES ZÁRÓJEL/i;
const TOKEN = /\[[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű][^\]\n]{1,40}\]/g;
// Phrases that actively send the model off-source. "no prior knowledge" is
// excluded on purpose — that one describes the audience, not the model.
const OFF_SOURCE = /\b(general knowledge|your own knowledge|outside sources)\b|általános tudásod|saját tudásod/i;

/** A lone [TOKEN] on its own line is a structural section marker, not a fill-in slot. */
function hasFillInSlot(body) {
  return body.split('\n').some(line => {
    const found = line.match(TOKEN);
    if (!found) return false;
    return found.some(tok => !line.includes(tok + '(') && line.trim() !== tok);
  });
}

/** The extension only applies the [AI FOCUS] half of a split video template. */
function effectiveBody(t) {
  if (t.format !== 'video-overview') return t.prompt;
  const i = t.prompt.indexOf('[AI FOCUS]\n');
  return i === -1 ? t.prompt : t.prompt.slice(i + '[AI FOCUS]\n'.length);
}

const errors = [];
for (const t of TEMPLATES) {
  const body = effectiveBody(t);
  const where = `${t.lang}/${t.id}`;

  if (!GROUNDING.test(body)) {
    errors.push(`${where}\n    no-grounding: the prompt never mentions the sources — add a grounding preamble`);
  }
  if (hasFillInSlot(body) && !SLOT_RULE.test(body)) {
    errors.push(`${where}\n    loose-slots: has [FILL IN] slots but no rule for unfilled ones`);
  }
  if (OFF_SOURCE.test(body)) {
    errors.push(`${where}\n    off-source: invites the model to use knowledge outside the sources`);
  }
}

console.log(`Linted ${TEMPLATES.length} templates.`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n`);
  errors.forEach(e => console.error('  ' + e));
  process.exit(1);
}
console.log('All templates are source-grounded. ✓');
