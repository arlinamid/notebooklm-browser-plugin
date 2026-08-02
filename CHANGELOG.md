# Changelog

All notable changes to **Prompt Architect for NotebookLM** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] — 2026-08-02

### Added
- 🌍 **Ten new languages.** The interface and the full template library are now available in
  English, Hungarian, Spanish, Brazilian Portuguese, French, German, Italian, Japanese, Korean, Simplified Chinese, Hindi and Russian.

  Everything is translated: 55 popup strings, 15 strings injected into NotebookLM itself, and for
  each of the 114 templates a title, a description and the prompt body — 4 120 items per language,
  zero missing keys.

  Prompt bodies are translated too, not just the labels. A prompt you cannot read is one you cannot
  adapt, which defeats the point of a prompt library.
- 🈁 **Language picker** in the popup header, replacing the EN/HU toggle. Languages appear under
  their own names (Deutsch, 日本語, हिन्दी).

### Changed
- The grounding blocks and the bracket-handling rule are 15% of the prompt text and identical
  across all 114 templates. They are hand-translated once per language in
  `data/locales/_boilerplate.json` and composed onto the body at apply time, so no machine ever
  rewords the text that keeps NotebookLM answering from the sources. Strip and compose is verified
  byte-exact on all 114 templates.
- **Slot detection is data, not heuristics, outside English and Hungarian.** The runtime classifier
  matches Latin script only, so it finds no bracket token at all in Japanese, Chinese, Korean, Hindi
  or Russian — the filler panel would simply never appear. Slots are now extracted once from the
  English source, where the classifier is verified, and each locale carries the mapping
  (`[SPECIFIC TOPIC]` → `[SPEZIFISCHES THEMA]`). The same template asks the same questions in every
  language.
- Chat and Configure Chat prompts get an `Answer in <language>.` line appended. Measured: an English
  prompt against Hungarian sources answers in English, so body language does not follow the sources.
  Studio dialogs have their own language selector and are left alone.

### Fixed
- **The injected UI crashed outside English and Hungarian.** `I18N[language]` was read directly, so
  any other language threw on the first property access and took the whole injection down — no
  dropdown, no filler panel, nothing on the page.
- Two Russian slots were mapped in the nominative while the sentence required the dative, so exact
  match substitution would never have replaced them. The translation rules now require the mapped
  token and the token in the body to match byte for byte.
- A nested bracket in the English source, `[TARGET AUDIENCE: data engineers evaluating [TOOL]]`,
  produced an unbalanced token that rendered a broken label and substituted wrongly. Present in
  v1.3.1 and earlier. Fixed in both languages; the Hungarian file also carried English tokens where
  its other 32 are Hungarian.

### Tooling
- `scripts/build-locale-source.js` — emits the translation source of truth
- `scripts/translate-locales.js` / `translate-bodies.js` / `translate-content-strings.js` — delegate
  to the local codex CLI, with checkpointing and resume
- `scripts/validate-locales.js` — checks every locale for missing or empty keys, lost product names,
  altered `[BRACKET]` tokens, hex colours, code fences, length outliers relative to each language's
  own median, slot presence in the body, and characters from the wrong writing system

## [1.3.1] — 2026-08-02

### Fixed
- 🎯 **Apply from the popup went to the chat box regardless of format.** An Audio Overview brief,
  a slide-deck design spec or a Configure Chat persona would all be dumped into the chat composer,
  because the handler only used an open dialog if one happened to be open already — and when
  browsing the popup, none is. It now opens the right Studio panel for the prompt's format and
  writes into that panel's field. Configure Chat additionally flips the goal toggle to *Custom*,
  since the custom-prompt field does not exist until it is selected.

  The studio card is located by its `mat-icon`, not by `aria-label`, so it works in any interface
  language. Verified through the real popup→content-script message path for audio-overview,
  slide-deck, infographic, data-table, configure-chat and text-chat.

  When there is no valid target — a shared or featured notebook, which has no Studio panel — the
  prompt is copied to the clipboard and the popup says why, instead of silently landing in chat.
- ℹ️ **The About panel had said "Version 1.0" since the first release.** It was hardcoded in
  `popup.html` and never updated, so every user saw the wrong version regardless of what they had
  installed. It now reads `chrome.runtime.getManifest().version`, which cannot drift.
- 🔤 **The card preview showed boilerplate instead of the prompt.** Since v1.3.0 every template
  opens with a grounding block, and templates with fill-in slots also carry a bracket-handling
  rule, so the popup preview was showing identical scaffolding on every card. The preview now
  skips those leading blocks; the prompt that gets applied is still the complete text.

## [1.3.0] — 2026-08-02

Compatibility release for the **"Gemini Notebook"** rebuild of NotebookLM. The extension was
completely inert after the migration; every item below was verified against the live site
with Playwright.

### Fixed
- 🚨 **Domain migration** — NotebookLM moved from `notebooklm.google.com` to `notebook.google.com`.
  The content script never loaded on the new host, so *nothing* was injected. Both domains are now
  matched in `manifest.json` (content script + `web_accessible_resources`) and in the popup's
  Apply handler.
- **Studio dialog format detection** — the header icon class was renamed
  `.dialog-icon` → `.dialog-title-icon` in `<configurable-form-dialog>`, and the Reports dialog
  header now starts with a back-arrow icon. Detection scans every header icon and takes the first
  recognised one instead of trusting a single `querySelector`.
- **Video Overview** — its focus field is a bare `<textarea class="mat-body-medium">` with no
  `mat-mdc-input-element` class, so it was skipped entirely. Textarea matching no longer depends
  on Material input classes.
- **Reports** — the flow is now a two-stage `<report-customization-dialog>`; both the
  *Create Your Own* and the per-template *Customize Report* paths are handled.
- **Configure Chat** — the dialog host is now `<configure-notebook-settings>` and has no
  `.mat-mdc-dialog-title`, which made format detection fall through to whatever studio card was
  clicked last. It is now identified explicitly.
- **Studio card click tracking** — reads `mat-icon.artifact-icon` inside
  `.create-artifact-button-container` instead of the first `mat-icon`, which resolved to the
  chevron/edit glyph on the new cards. Added an English `aria-label` fallback map.
- **Duplicate / stale injection** — the dropdown is anchored to the dialog's own layout containers
  (`.text-form-field-container`, `.custom-topic-card`, `.prompt-section-custom-input`) with a
  `:scope >` duplicate guard, so it renders above the prompt field instead of inside the form field.
- **Chat composer** — the template dropdown re-resolves `textarea.query-box-input` at apply time,
  so it keeps working after Angular swaps the composer out.
- The "Discover sources" web-search box (`textarea.query-box-textarea`) is explicitly excluded —
  it is a new sibling that the old selectors would have matched.
- 💾 **Saved prompts could be discarded by the local→sync migration.** When `migrationDone` was
  unset but `chrome.storage.local` held no prompts, both the popup and the content script flipped
  the flag while ignoring `chrome.storage.sync.userPrompts` — the popup went further and reset its
  in-memory list to `[]`, so the next save or delete persisted that empty list over the user's real
  prompts. Migration now merges the sync and local lists by `id` (sync wins on collision) and never
  writes `userPrompts` when there is nothing to migrate.

  Verified end-to-end against the live site for four upgrade paths: local-only (v1.0.x), synced
  (v1.1+), sync-without-flag, and local + sync both populated. All prompts survive in every case.

### Changed
- 🎯 **Every template is now source-grounded.** 109 of the 229 templates (48%) never referred to
  the sources at all, so NotebookLM read the prompt body as the brief and answered *about the
  prompt* instead of the material. The worst affected were the pure style specs — slide-deck
  (54/62), infographic (22/25) and video-overview (16/18) — which are 100% visual direction and
  contained no instruction about where the content should come from. Every prompt now opens with a
  short grounding block in its own language, in one of three variants:
  - **style formats** — states that the spec below describes *only* the visual style and is never
    the topic, so the deck stops being a presentation about the design system
  - **content formats** — restricts claims, figures and quotes to the sources and requires gaps to
    be stated rather than filled
  - **configure-chat** — phrased as a persistent system instruction covering every answer
- 🔖 **Unfilled `[PLACEHOLDER]` slots no longer leak into output.** 94 templates carry fill-in
  slots; they now instruct the model to infer the value from the sources and continue, rather than
  asking back or echoing the bracket text. Structural section markers (`[ROLE]`, `[STEPS]`, …) are
  deliberately left alone.
- *The Devil's Advocate* no longer invites counter-arguments from "general knowledge".
- The `MutationObserver` now coalesces mutation bursts into one scan per animation frame. The new
  UI mutates the DOM continuously and the previous per-mutation scan was re-querying the whole
  document hundreds of times per second.
- Popup **Apply** writes into an open Studio/Configure dialog when there is one, and falls back to
  the chat composer otherwise.

### Added
- ✍️ **Placeholder filler panel.** Studio generates in a single shot — there is no conversation, so
  an unfilled `[SLOT]` is sent to the model verbatim and the user never gets asked. Selecting a
  template that still has slots now opens a small panel under the dropdown listing each one with an
  input; filling them substitutes every occurrence in the prompt field. It appears in the Studio
  dialogs, in the chat composer, and on the popup's Apply path, tracks manual edits to the textarea,
  and can be dismissed with *Leave as is*.

  The panel only asks about slots meant for **you**. The template corpus splits cleanly on case:
  `[TOPIC]`, `[SOURCE A]`, `[SZAKTERÜLET]` are parameters, while `[quote]`, `[Source, p.X]`,
  `[answer]`, `[thesis verbatim]` describe what the *model* should produce — prompting for those
  would be noise. Classification is deliberately conservative; anything it skips is still covered by
  the prompt's own rule telling the model to infer unfilled slots from the sources. In practice this
  cut *The Devil's Advocate* from 7 confusing tokens to the 2 that are genuinely yours.
- `scripts/lint-templates.js` — fails the build on a template that has no source grounding, has
  fill-in slots without a rule for unfilled ones, or invites off-source knowledge. Run it after
  `build-templates.js` so new templates cannot regress.

### Notes
- **Shared and Featured notebooks have no Studio panel** — this is a NotebookLM restriction, not an
  extension bug. Studio injection only applies to notebooks you own.
- Mind Map is recognised but intentionally has no templates, so no dropdown is injected there.

---

## [1.2.0] — 2026-02-28

### Added
- **6 new Infographic visual style templates** (EN + HU) for artistic and editorial use cases:
  - *Expressive Cubist Abstract* — geometric fragmentation, mixed-media canvas, vibrant magenta/cyan/violet palette
  - *Geometric Mosaic* — stained-glass polygonal composition, deep blue + warm orange, handcrafted painterly finish
  - *Mixed-Media Expressionist* — bold brushwork, collage textures, musical notation fragments, warm orange palette
  - *Hybrid Conceptual Collage* — double exposure, urban architectural montage, blueprint overlays, editorial poster aesthetic
  - *Dark Neo-Noir* — chiaroscuro lighting, oil-paint expressionism, red/black palette, crime poster aesthetic
  - *Brutalist Editorial* — Swiss typography, xerox grunge textures, strict black/white/red palette
- **HU: Manga Comic infographic template** — 4 variants (classic B&W, shōnen action, editorial scientific, chibi/educational)

### Changed
- **Expanded slide-deck and visual-style prompts** (8 styles, EN + HU): replaced single-line style descriptions with detailed YAML design specifications covering Global Settings, Color Palette, Typography, Composition rules, Layout Variations, and Design Rules. Affected styles: `black-orange-creative`, `deformed-flat-persona`, `manga-style`, `mincho-handwritten-mix`, `pink-street-style`, `royal-blue-red-watercolor`, `seminar-minimal-text`, `yellow-black-editorial`
- Template count: 217 → 229

---

## [1.1.0] — 2026-02-25

### Added
- **Cross-Device Sync:** Saved prompts and language settings are now automatically synchronized across all devices where you are signed into Chrome.
- **Data Migration:** Existing locally saved prompts are automatically migrated to the cloud on first run.

---

## [1.0.6] — 2026-02-25

### Fixed
- Fixed missing prompt templates in the "Configure chat" (Csevegés konfigurálása) modal by adding support for specialized Material Design textarea classes (`.custom-input-textarea`).

---

## [1.0.5] — 2026-02-25

### Fixed
- Added support for "Reports" customization modals by improving the click tracker to handle gallery-to-modal transitions.
- Added missing `tune` (Configure notebook) icon mapping for chat customization sidebar.
- Added Hungarian terms to the language-agnostic logic fallback (e.g., "jelentés", "hang", "dia").

---

## [1.0.4] — 2026-02-25

### Changed
- Refactored DOM selectors to be language-agnostic using Material Design icon mapping and class-based targeting. This ensures the extension works correctly across all NotebookLM UI localizations (EN, HU, etc.).
- Implemented a global click tracker to identify Studio card formats based on icon text before modals open.

---

## [1.0.3] — 2026-02-24

### Fixed
- Replaced malformed inline SVG in the floating Buy Me a Coffee widget with the official BMC image logo to resolve console parsing errors.

---

## [1.0.2] — 2026-02-24

### Changed
- Replaced the external BMC script widget with a native DOM HTML/CSS floating button. This completely bypasses NotebookLM's strict Content Security Policy (CSP) which was blocking the external script.

---

## [1.0.1] — 2026-02-24

### Added
- Added Buy Me a Coffee widget injection directly into the NotebookLM page via `content.js`.

### Fixed
- Fixed broken SVG path in the popup's Buy Me a Coffee button by replacing it with the official `<img>` logo.

---

## [1.0.0] — 2026-02-24

### Added

#### Core Extension
- Manifest V3 Chrome extension with `storage` and `activeTab` permissions
- Content script injected on `notebooklm.google.com` that adds prompt template selectors into NotebookLM's Studio panels and chat input
- Popup interface to browse, filter, search, and manage prompt templates

#### Template Library (108 EN + 108 HU = 216 templates)
- **Audio Overview** — podcast-style, debate, briefing, critique, deep-dive prompts
- **Video Overview** — explainer, concept vulgarisation, onboarding, innovation
- **Slides (Slide Deck)** — presentation structure templates
- **Infographic** — visual layout and data-viz prompts
- **Configure Chat** — 12 role-based chat personas (Socratic Tutor, Exam Coach, Business Strategist, Research Scientist, ELI5 Explainer, Creative Writer, Fact Checker, Debate Partner, Language Tutor, Data Analyst, Technical Architect, University Professor)
- **Flashcards** — Focused Flashcard Set, Exam Preparation Flashcards
- **Quiz** — Multiple Choice Quiz, Open-Ended Knowledge Quiz
- **Report** — Executive Briefing, Blog Post & Thought Leadership, Competitive Intelligence Report
- **Data Table** — Research Findings Table, Key Quotes & Evidence Table, Comparative Analysis Table
- **Text Chat** — general conversation and productivity prompts
- **Critical Analysis** — Dialectical Lens, counter-argument frameworks
- **Learning** — spaced repetition, study strategies
- **Troubleshooting** — pipeline debugger, systematic debugging
- **Professional** — business reporting, stakeholder communication

#### Internationalization
- Full **Hungarian (HU)** translation of all UI strings, format/category labels, and 108 prompt templates
- Language toggle (EN / HU) in popup header with `chrome.storage.local` persistence
- Real-time language sync between popup and content script via `chrome.storage.onChanged`

#### Dark / Light Mode
- Popup auto-adapts to OS/browser theme via `@media (prefers-color-scheme: light)`
- Injected modal dialogs use NotebookLM's own Material Design 3 CSS variables (`--mat-sys-*`, `--mat-dialog-*`) for automatic theme adaptation
- No JavaScript-based dark mode detection — pure CSS variable inheritance

#### UI/UX
- Format tab bar (Audio · Video · Slides · Infographic · Configure · Cards · Quiz · Report · Table · Chat)
- Category filter chips and level dropdown (All / Beginner / Intermediate / Advanced)
- Full-text search across template titles and prompts
- Save current textarea content as a custom prompt template
- Edit and delete custom prompt templates
- Copy template prompt to clipboard
- **About panel** — developer info, GitHub profile photo, Buy Me a Coffee link

#### Build Tooling
- `scripts/build-templates.js` — parses Markdown template files with YAML frontmatter into `data/templates.json`
- Multi-language directory support (`templates/en/`, `templates/hu/`)
- Automatic format detection from frontmatter `format:` field and file path
- CRLF → LF normalization for cross-platform regex compatibility
- Fixed Strategy 1 prompt extraction to handle `##` sub-headers inside code blocks

---

## [Unreleased]

### Planned
- Firefox compatibility (Manifest V3 with Firefox-specific adjustments)
- Custom template import/export (JSON)
- Template rating and favourites
- More Hungarian template translations for Studio formats
- Dark mode icon variants

---

*Maintained by [János Rózsavölgyi (@arlinamid)](https://github.com/arlinamid)*
