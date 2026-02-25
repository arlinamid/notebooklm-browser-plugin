# Changelog

All notable changes to **Prompt Architect for NotebookLM** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
