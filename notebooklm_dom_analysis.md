# NotebookLM / Gemini Notebook — DOM Analysis

**URL: `https://notebook.google.com/`** (page title: *Gemini Notebook*)

> ⚠️ **Domain migration.** NotebookLM moved from `notebooklm.google.com` to `notebook.google.com`.
> The old host now redirects to the Google sign-in flow. The extension matches both.

Last verified: **2026-08-02**, against a live logged-in session using Playwright.
Sections marked *legacy* describe the pre-2026 DOM and are kept for reference only.

---

## Home page (`/`)

| What | Selector | Notes |
|---|---|---|
| Notebook cards | `mat-card.project-button-card` | unchanged |
| Grid container | `.project-grid-container` | unchanged |
| Notebook link | `a[href^="/notebook/<uuid>"]` | most reliable way to enumerate notebooks |
| Card title | `.project-button-title` | unchanged |
| Filter tabs | `mat-button-toggle` | *All · My notebooks · Featured notebooks · Shared with me · **Collections*** (Collections is new) |
| Create notebook | `button[aria-label="Create notebook"]` | label changed from "Create new notebook" |

Custom elements on the home page:
`welcome-page`, `project-grid`, `project-button`, `project-action-button`,
`notebook-search-input`, `page-header`, `title-bar-settings`, `pro-badge`, `get-app-button`.

---

## Notebook page (`/notebook/<uuid>`)

Top-level custom elements:
`notebook-header`, `source-picker`, `chat-panel`, `chat-panel-header`, `query-box`,
`studio-panel`, `artifact-library`, `artifact-library-item`, `artifact-library-note`,
`follow-up`, `remix-button`, `popup-panel`.

### Chat composer

```
div.query-box-container
  query-box
    div.query-box
      div.input-group
        form.form
          div.message-container
            div.query-box-input-wrapper
              textarea.query-box-input[aria-label="Query box"][placeholder="Start typing..."]
            div.bottom-right-container
              button.submit-button[aria-label="Submit"]
```

`textarea.query-box-input` and `.query-box` both survived the rebuild. The extension inserts its
compact dropdown as a sibling **before** `div.query-box`, i.e. inside the `<query-box>` element.

⚠️ Do not confuse it with `textarea.query-box-textarea`
(`aria-label="Discover sources based on the inputted query"`) — that is the new *"Search the web
for new sources"* box in the Sources panel. It must be excluded explicitly.

### Studio panel — create buttons

```
studio-panel
  div.panel-content-scrollable
    div.create-artifact-buttons-container
      basic-create-artifact-button
        div.create-artifact-button-container[role="button"][aria-label="Audio Overview"]
          span.default-container
            span.icon-container > span.icon-container-row
              mat-icon.artifact-icon            ← the format icon
            span.create-label-container
          div.option-icon
            button.edit-button[aria-label="Customize Audio Overview"]
              mat-icon.edit-button-icon          ← "chevron_forward", NOT the format icon
    div.artifact-library-container
      artifact-library
        artifact-library-item / artifact-library-note
          div.artifact-item-button > div.artifact-button-content
            button.artifact-stretched-button[aria-description="Infographic"]
            mat-icon.artifact-icon
      div.add-note-button-container > button.add-note-button
```

**Breaking change:** `button.artifact-button-content` is now `div.artifact-button-content`.
When resolving the format from a click, query `mat-icon.artifact-icon` — a plain `mat-icon`
lookup returns the chevron/edit glyph.

Available cards and their icons:

| Card (`aria-label`) | `mat-icon` | Extension format |
|---|---|---|
| Audio Overview | `audio_magic_eraser` | `audio-overview` |
| Slide Deck | `tablet` | `slide-deck` |
| Video Overview | `subscriptions` | `video-overview` |
| Mind Map | `flowchart` | `mindmap` (no templates) |
| Reports | `auto_tab_group` | `report` |
| Flashcards | `cards_star` | `flashcards` |
| Quiz | `quiz` | `quiz` |
| Infographic | `stacked_bar_chart` | `infographic` |
| Data Table | `table_view` | `data-table` |

> **Shared / featured notebooks have no `studio-panel` create buttons.** Studio only renders for
> notebooks you own. This is a NotebookLM restriction, not an extension failure.

---

## Customization dialogs

All dialogs live in `.cdk-overlay-pane > mat-dialog-container`. Three different hosts exist:

| Host element | Used by |
|---|---|
| `configurable-form-dialog` | Audio, Slides, Video, Mind Map, Flashcards, Quiz, Infographic, Data Table |
| `report-customization-dialog` | Reports (two-stage) |
| `configure-notebook-settings` | Configure Chat |

### `configurable-form-dialog`

```
div.dialog-container
  div.mat-mdc-dialog-title.dialog-title
    mat-icon.dialog-title-icon        ← format icon (was .dialog-icon)
    h2.dialog-title-text              "Customize Audio Overview"
    button[aria-label="Close dialog"]
  mat-dialog-content
    div.dialog-section > div.controls-grid > div.control-wrapper
      label.control-label
      div.text-form-field-container   ← extension inserts the dropdown before this
        suggestion-builder
          mat-form-field.text-form-field
            textarea[aria-label="…"]
  mat-dialog-actions
    button                            "Generate"
```

Prompt textarea `aria-label` per format:

| Format | `aria-label` |
|---|---|
| Audio Overview | `What should the AI hosts focus on in this episode?` |
| Slide Deck | `Describe the slide deck you want to create` |
| Video Overview | `What should the video focus on?` |
| Mind Map | `What should the topic be?` |
| Flashcards / Quiz | `What should the topic be?` |
| Infographic | `Describe the infographic you want to create` |
| Data Table | `Describe the data table you want to create` |

⚠️ **Video Overview is the odd one out.** Its field is a plain
`textarea.mat-body-medium` inside `div.custom-topic-input > div.custom-topic-card > suggestion-builder`
— no `mat-form-field`, no `mat-mdc-input-element`. Selectors that require Material input classes
silently skip it.

### `report-customization-dialog` (two-stage)

**Stage 1 — format gallery:**

```
h1.mat-mdc-dialog-title.dialog-title-container
  span.dialog-title
    mat-icon.dialog-icon              "auto_tab_group"
    span.mat-title-medium             "Create report"
mat-dialog-content.dialog-content
  div.options-container
    report-customization-tile
      div.option-card
        button.primary-action-button[aria-label="Create Your Own" | "Briefing Doc" | "Study Guide" | "Blog Post"]
        button.edit-button[aria-label="Customize Report"][aria-description="Briefing Doc"]
```

There is **no textarea in stage 1.** The user must pick *Create Your Own* or a tile's
*Customize Report* pencil.

**Stage 2 — custom report form:**

```
h1.mat-mdc-dialog-title
  span.dialog-title
    button.title-back-button[aria-label="Back"] > mat-icon "arrow_back"   ← first icon in the header!
    mat-icon.dialog-icon "auto_tab_group"
mat-dialog-content
  div.custom-report-container > div.custom-report-content > div.custom-report-input-container
    mat-select.language-override-select
    mat-form-field.custom-report-input
      textarea[aria-label="Input to describe the kind of report to create"]
```

⚠️ Because the back-arrow precedes the format icon, format detection must iterate **all** header
icons rather than taking the first one.

### `configure-notebook-settings` (Configure Chat)

Opened by `button[aria-label="Configure notebook"]` (also reachable via
*Chat options → Customize notebook*).

```
configure-notebook-settings
  div.configure-settings-container > div.content
    div.header > div.header-title           "Configure Chat"
    form.form
      div.prompt-section
        mat-button-toggle-group[formcontrolname="customizeButtonSelected"]
          button[aria-label="Default button" | "Learning Guide prompt button" | "Custom button"]
        div.prompt-section-custom-input       ← only rendered when "Custom" is selected
          mat-form-field.custom-input
            textarea.custom-input-textarea[aria-label="Custom prompt to control the chat response"]
                    [formcontrolname="customizeCustomPrompt"]
      div.style-section
        mat-button-toggle-group[formcontrolname="styleGuideButtonSelected"]
          button[aria-label="Default button" | "Verbose style guide button" | "Concise style guide button"]
    div.save-container > button.submit-button "Save"
```

⚠️ This dialog has **no `.mat-mdc-dialog-title`**, so icon-based format detection finds nothing and
would fall through to "whatever studio card was clicked last". It must be matched explicitly on
`configure-notebook-settings` / `.custom-input-textarea` / `.prompt-section-custom-input`.

---

## Sources panel

| What | Selector |
|---|---|
| Add source | `button[aria-label="Add source"]` |
| Source item | `div.single-source-container` |
| Web search box | `textarea.query-box-textarea[aria-label="Discover sources based on the inputted query"]` |
| Collapse panel | `button[aria-label="Collapse source panel"]` |
| Sort | `button[aria-label="Sort sources"]` |

---

## Localization — what is translated and what is not

The interface language follows the user's Google account, so **any selector built on visible text or
`aria-label` will break for most of the world**. Verified on the live site in German and Japanese,
2026-08-02:

| Signal | Translated? | Example |
|---|---|---|
| `aria-label` on studio cards | ❌ **yes, translated** | EN `Slide Deck` → DE `Präsentation` → JA `スライド資料` |
| `aria-label` on edit buttons | ❌ **yes** | EN `Customize Slide Deck` → DE `Präsentation anpassen` |
| `aria-label` on prompt textareas | ❌ **yes** | DE `Beschreiben Sie die Präsentation, die Sie erstellen möchten` |
| **`mat-icon` ligature text** | ✅ **never** | `tablet`, `audio_magic_eraser`, `stacked_bar_chart`, `tune` — identical in every locale |
| CSS classes | ✅ never | `.create-artifact-button-container`, `.edit-button`, `.custom-input-textarea` |
| Custom element names | ✅ never | `configurable-form-dialog`, `configure-notebook-settings` |
| `formcontrolname` | ✅ never | `customizeButtonSelected`, `customizeCustomPrompt` |

**Rule: identify things by `mat-icon` text, CSS class, tag name or `formcontrolname`.** Treat any
English `aria-label` match as a last-resort fallback only, never as the primary path.

Verified working end to end in `de` and `ja`: dropdown injection into all eight Studio formats and
Configure Chat, plus the popup's Apply routing. The console log shows the mechanism — the icon
resolves the format while the localized label is ignored:

```
[PA] User opened format: slide-deck (icon: tablet / label: präsentation)
[PA] User opened format: slide-deck (icon: tablet / label: スライド資料)
```

One piece is still English/Hungarian only: the keyword sniffing at the end of `detectDialogFormat()`.
It is the third fallback, reachable only if both the icon lookup and the click tracker fail — i.e.
if Google renames an icon. Worth remembering as the thing to fix first if that ever happens.

## Development notes

- Still Angular Material — `mat-*` tags and classes remain the most stable anchors, but
  **component-specific classes get renamed between releases** (`.dialog-icon` → `.dialog-title-icon`,
  `button.artifact-button-content` → `div.artifact-button-content`).
- `aria-label` values are localized. Use `mat-icon` text content as the primary signal and treat
  English `aria-label` matching as a fallback only.
- Angular re-renders continuously. A `MutationObserver` on `document.body` must coalesce bursts
  (e.g. one scan per `requestAnimationFrame`) or it will re-query the document hundreds of times
  per second.
- Angular can replace the chat `<textarea>` node, so cached element references go stale — re-resolve
  `textarea.query-box-input` at the moment you write to it.
- Write values via the native `HTMLTextAreaElement.prototype.value` setter plus `input`/`change`
  events, otherwise Angular's form control never sees the change.
