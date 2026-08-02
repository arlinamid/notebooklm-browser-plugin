# Going beyond EN + HU

**Status:** proposal
**Date:** 2026-08-02
**Question:** can we serve more languages without hand-translating 229 templates each time?

---

## The measurement that reframes the problem

Adding a language *looks* like translating everything. It isn't:

| | Characters (EN set) | Share |
|---|---:|---:|
| Prompt bodies | 227,060 | 94.8% |
| **Titles + descriptions** | **12,452** | **5.2%** |

The titles and descriptions are what a user actually reads while browsing the popup. The prompt
bodies are what gets sent to the model — and **the model does not need them in the user's language.**

So the real cost of a new language is ~12 KB of short strings, not ~227 KB of prose.

---

## Why prompt bodies can stay English

NotebookLM controls output language natively. Every Studio dialog carries a
`mat-select.language-override-select` labelled *Choose language* — measured on the live site, and in
this account it was already set to `magyar` while the prompt was English.

So: **English prompt + Hungarian language setting = Hungarian output.** The prompt is instructions to
the model, not text shown to the user.

The one gap is **chat**, which has no language selector. This was measured on 2026-08-02, in a
notebook with Hungarian sources, with the browser locale set to `en-US`:

| # | Prompt | Answer |
|---|---|---|
| A | Plain English, no language instruction | ❌ **English** |
| B | English + *"Answer in Hungarian."* | ✅ **Hungarian** |
| C | English + *"Answer in the language of my sources."* | ✅ **Hungarian** |

**Case A is the important one: an English prompt produces an English answer even when every source
is Hungarian.** So "just ship English bodies" is *not* sufficient on its own — the naive version of
this plan would have given non-English users English chat answers.

Both B and C fix it. C needs no per-language variants at all, which makes the whole scheme work with
a single English body per template.

### Better than C: inject the target language at apply time

C ties the output to the *sources'* language, which is wrong when a Hungarian user has English
sources. The extension already knows the user's chosen interface language, so it can append the line
itself when applying a prompt:

```
Answer in <the user's selected language>.
```

One dynamically generated line, correct for any language, and **no template ever needs translating
for this purpose**. Studio formats can keep using the native language selector and skip the line.

---

## Proposed structure

```
templates/en/**           canonical prompt bodies — the source of truth
templates/hu/**           full human translation — keep as it is
locales/<lang>.json       title + description overrides only  (~12 KB per language)
_locales/<lang>/          UI strings, via the standard chrome.i18n mechanism
```

Resolution at runtime, per field:

| Field | Lookup order |
|---|---|
| Prompt body | the language's own template folder if it exists → **English** |
| Title, description | `locales/<lang>.json` → English |
| UI strings | `chrome.i18n` picks the closest locale → English |

Hungarian keeps its fully translated bodies. Every other language gets English bodies with translated
labels — which is the honest 90% of the value for 5% of the work.

### Why `_locales/` for the UI

`data/i18n.js` hardcodes two languages and a manual switcher. Chrome's own `chrome.i18n` gives
locale matching and English fallback for free, and is what reviewers expect. Worth adopting even if
no new language ships — but note it follows the **browser** locale, so the existing manual EN/HU
toggle should stay for users whose browser language differs from their reading preference.

---

## Producing the translations

### Recommended: at build time, committed

~12 KB per language, machine-translated once and committed, so the result is reviewable, diffable
and identical for every user. Fits the existing `scripts/build-templates.js` step and can run through
the local AI tooling already on this machine.

Ten languages ≈ 124 KB of translation, one time. Translating the bodies instead would be ~2.3 MB.

### Considered: Chrome's built-in Translator API

Chrome 138+ ships an on-device [Translator API](https://developer.chrome.com/docs/ai/translator-api) —
free, no API key, works offline, nothing leaves the machine.

Attractive, but not as the primary mechanism: it needs per-language packs downloaded on first use,
availability still varies by Chrome version and platform, and translation quality would differ
between users. Good as **progressive enhancement** — translate on the fly for a locale we don't ship
— with the committed translations as the reliable base.

### Rejected: translating through NotebookLM's own internal API

Tempting — the user is already authenticated, and it would cost us nothing to run.

- **NotebookLM is deliberately source-bound.** It answers *from the notebook's sources*, and this
  extension's own grounding blocks explicitly forbid going outside them. Test C above shows it
  reasoning from sources even for a simple thematic question. Used as a general translator it would
  either refuse or colour the translation with notebook content.
- **It spends the user's quota**, which is capped, on work that benefits the whole user base rather
  than them.
- **Undocumented internal endpoints.** This project just spent a release recovering from a change to
  the *public* UI. An internal API is a worse bet, not a better one.
- **Silent background calls on someone's account** are the wrong pattern regardless of whether they
  work — nobody installed a prompt library expecting their notebook to be used as a translation
  engine.
- **Runtime translation means every user sees different wording.** Translations belong in the repo,
  reviewed and diffable.

The legitimate version of this idea is build-time translation on the maintainer's own machine, with
a general-purpose model rather than a retrieval-bound one. That is what "at build time, committed"
above describes.

### Rejected: a translation API at runtime

An API key in the extension, or a server to hold one. Costs money, adds a network dependency to a
tool that currently has none, and breaks the "nothing leaves your browser" promise.

---

## What this does not solve

- **Template *content* stays culturally English.** Examples, idioms and framing were written for an
  English-speaking reader. Translated labels do not change that.
- **The HU set will drift.** Two full sets already means every prompt edit is two edits. Making
  English canonical reduces new drift but does not fix the existing 115 files.
- **Quality is machine quality.** Fine for a 40-character description, not for a persona prompt —
  which is exactly why bodies are excluded from this scheme.

---

## Suggested order

1. Verify the chat language-steering assumption (above) — it is the load-bearing one
2. Move UI strings to `_locales/`, keeping the manual toggle
3. Add `locales/<lang>.json` resolution with English fallback
4. Generate one language as a pilot — German is a good test: large audience, and we already know the
   NotebookLM UI renders correctly in it
5. Measure whether it actually gets used before doing nine more
