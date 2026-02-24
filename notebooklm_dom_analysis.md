# NotebookLM DOM Analysis

URL: https://notebooklm.google.com/

This document contains the DOM analysis of the NotebookLM homepage and individual notebook pages, which will be useful for developing a browser extension.

## --- Home Page (/)

### 1. 'New notebook' (Új jegyzetfüzet) buttons
There are two ways to create a new notebook on the page:
*   **Top navigation button:**
    *   **Selector:** `button.create-new-button` or `button[aria-label="Create new notebook"]`
    *   **Description:** The black button in the top right corner with the text "Create new".
*   **Grid card:**
    *   **Selector:** `mat-card.create-new-action-button`
    *   **Description:** The first element in the notebook list, which is a card-formatted button.

### 2. Notebook list container
*   **Selector:** `.project-grid-container`
*   **Description:** This div element wraps all the notebook cards (including the "New notebook" card) in a grid layout. This is located inside the `.welcome-page-container` element.

### 3. Individual notebook cards (Notebook Cards)
*   **Main card element:** `mat-card.project-button-card` (or more specifically: `mat-card:not(.create-new-action-button)`)
*   **Inner element selectors:**
    *   **Clickable area (Open):** `button.primary-action-button`
    *   **Title:** `.project-button-title` (a `span` element inside the card)
    *   **Subtitle/Date/Source count:** `.project-button-subtitle`
    *   **Action menu (three dots):** `project-action-button button[aria-label="Project Actions Menu"]`
    *   **Icon/Emoji:** `.project-button-box-icon`

### 4. Top navigation tabs (Tabs)
These are part of a `mat-button-toggle-group`.
*   **General selector:** `mat-button-toggle-button`
*   **Specific tabs (by order):**
    1.  **All:** `mat-button-toggle-button:nth-of-type(1)`
    2.  **My notebooks:** `mat-button-toggle-button:nth-of-type(2)`
    3.  **Featured notebooks:** `mat-button-toggle-button:nth-of-type(3)`
    4.  **Shared with me:** `mat-button-toggle-button:nth-of-type(4)`
*   **View toggles (Grid/List):** `button[aria-label="Grid view"]` and `button[aria-label="List view"]`.

### 5. Profile and Settings buttons
*   **Settings:** `button[aria-label="Settings"]` (class: `.extendable-button`)
*   **Profile (Google account):** `a[aria-label*="Google Account"]` (classes: `.gb_B`, `.gb_0a`)
*   **PRO version button:** `button.extendable-button` (which contains the `span` with the "PRO" text)


## --- Notebook Page (/notebook/...)

### 1. Chat Input Area
*   **Textarea:** `textarea.query-box-input` or `textarea[aria-label="Query box"]`
*   **Submit button:** `button.actions-enter-button` (Contains the `arrow_forward` icon. Note: disabled when textarea is empty.)

### 2. Chat History (Messages)
*   **Main container:** `div.chat-panel-content`
*   **Save answer to note:** `button.pin-button` (or `button[aria-label="Save message to a note"]`)
*   **Copy answer:** `button.xap-copy-to-clipboard`

### 3. Sources Panel
*   **Add source button:** `button.add-source-button`
*   **Individual source item:** `div.single-source-container`
*   **Source title:** `.single-source-container span` (e.g., the PDF filename)
*   **Select all sources checkbox:** `input#mat-mdc-checkbox-0-input`

### 4. Main Content Area (Studio Panel)
In NotebookLM, generated documents and notes appear in the right "Studio" panel.
*   **Generated artifact cards:** `button.artifact-button-content`
*   **Add new note button:** `button.add-note-button`

### 5. Other prominent features
*   **Audio Overview:** `div[aria-label="Audio Overview"]`
*   **Slide Deck:** `div[aria-label="Slide Deck"]`
*   **Mind Map:** `div[aria-label="Mind Map"]`
*   **Quiz:** `div[aria-label="Quiz"]`
*   **Collapse/Expand Studio panel:** `button.toggle-studio-panel-button`

## Development Notes
*   The page uses the **Angular Material** framework, so the `mat-` prefixed classes and tags are likely stable.
*   There are no dedicated `data-testid` attributes, so using `aria-label` and specific class names (like `.project-button-title` or `.query-box-input`) is recommended for the most reliable interaction.
*   DOM elements often contain `mat-icon` elements with `google-symbols` or `material-symbols-outlined` classes that can be identified by their text content (e.g. "copy_all", "keep_pin").
*   The document/notebook content loads dynamically, so the extension should probably use a `MutationObserver` to watch for changes in the container.

## --- Hidden Panels / Modals

### 1. Audio Overview (Deep Dive) Configuration
This panel opens when clicking the Edit (pencil) icon on the 'Audio Overview' card in the Studio.
*   **Panel container:** `mat-dialog-container`
*   **Format selector (Radio):** `mat-radio-button` elements. Important values:
    *   `value="DEEP_DIVE"`
    *   `value="BRIEF"`
    *   `value="CRITIQUE"`
    *   `value="DEBATE"`
*   **Language selector:** `mat-select.language-override-select`
*   **Length toggle:** `mat-button-toggle-group`
*   **Focus / Prompt input:** `textarea[aria-label="What should the AI hosts focus on in this episode?"]`
*   **Generate button:** `button` containing the text "Generate" (often has class `mdc-button`).

### 2. Reports / Briefing Doc Customization
Clicking the Edit (pencil) icon next to a report type like "Briefing Doc" inside the Reports modal.
*   **Open Customize button:** `button[aria-label="Customize Report"]` or pencil icon next to the report type.
*   **Prompt/Description input:** `textarea[aria-label="Input to describe the kind of report to create"]`
*   **Language selector:** `mat-select.language-override-select`
*   **Back button:** `button[aria-label="Back"]`
*   **Generate button:** `button.generate-button` (text: "Generate")

### 3. Add Sources Modal
Opened by clicking the "Add sources" button.
*   **Search/URL input:** `textarea[aria-label="Discover sources based on the inputted query"]`
*   **Upload files button:** `button` containing `mat-icon` with text `upload`
*   **Websites/Links button:** `button` containing `mat-icon` with text `link`
*   **Google Drive button:** `button` containing `mat-icon` with text `drive`
*   **Copied text button:** `button` containing `mat-icon` with text `content_paste`
*   **Close button:** `button[aria-label="Close"]`

### 4. Other Studio Panels (Flashcards, Quiz, Infographic, Data Table, Video)
These panels are accessed either by their pencil icon (`button.edit-button`) or by clicking the card itself (like Video Overview).
*   **Flashcards**
    *   **Edit trigger:** Edit Button (`aria-label='Customize Flashcards'`)
    *   **Number of Cards:** Select via specific text: `button:has-text("Fewer")`, `"Standard"`, `"More"` (or XPath: `//button[.//*[text()="Fewer"]]`)
    *   **Difficulty:** Select via specific text: `button:has-text("Easy")`, `"Medium"`, `"Hard"`
    *   **Topic Input:** `textarea[aria-label='Text area for custom topic']`
    *   **Action:** `button.generate-button`
*   **Quiz**
    *   **Edit trigger:** Edit Button (`aria-label='Customize Quiz'`)
    *   **Number of Questions:** `button:has-text("Fewer")`, `"Standard"`, `"More"`
    *   **Difficulty:** `button:has-text("Easy")`, `"Medium"`, `"Hard"`
    *   **Topic Input:** `textarea[aria-label='Text area for custom topic']`
    *   **Action:** `button.generate-button`
*   **Infographic**
    *   **Edit trigger:** Edit Button (`aria-label='Customize Infographic'`)
    *   **Orientation:** `mat-button-toggle:has-text("Landscape")`, `"Portrait"`, `"Square"`
    *   **Level of Detail:** `mat-button-toggle:has-text("Concise")`, `"Standard"`, `"Detailed"`
    *   **Language dropdown:** Open with `mat-select[role="combobox"]`, then click `mat-option:has-text("Language Name")` (e.g. "English")
    *   **Steering Prompt:** `textarea[aria-label='Describe the infographic you want to create']`
*   **Data Table**
    *   **Edit trigger:** Edit Button (`aria-label='Customize Data Table'`)
    *   **Description Input:** `textarea[aria-label='Describe the data table you want to create']`
*   **Video Overview**
    *   **Edit trigger:** Click Card (`aria-label='Video Overview'`)
    *   **Format:** `mat-radio-button:has-text("Explainer")`, `"Brief"`
    *   **Visual Style (Carousel):** `mat-radio-button:has-text("Style Name")` (Options: `Auto-select`, `Custom`, `Classic`, `Whiteboard`, `Kawaii`, `Anime`, `Watercolor`, `Retro print`, `Heritage`)
    *   **Language dropdown:** Open with `mat-select[role="combobox"]`, then select `mat-option`.
    *   **Focus Input:** `textarea` following label `id='videoFocus-label'`
    *   **Action:** `button.mdc-button--unelevated` (Text: "Generate")

### 5. Notebook Configuration & General Settings
*   **Configure Notebook (System Instructions):**
    *   **Trigger:** `button[aria-label='Configure notebook']` (Icon: `tune`)
    *   **Goal:** `button[aria-label="Default button"]`, `button[aria-label="Learning Guide prompt button"]`, `button[aria-label="Custom button"]`
    *   **Response Length:** `button[aria-label="Verbose style guide button"]` (Longer), `button[aria-label="Concise style guide button"]` (Shorter), or the second `Default button`.
    *   **Custom Instruction Input:** `textarea[aria-label='Custom prompt to control the chat response']`
    *   **Action:** `button.submit-button` (Text: "Save")
*   **General Settings:**
    *   **Trigger:** `button[aria-label='Settings']` (Icon: `settings`) in the header
    *   **Notebook Name Input:** `input.title-input`
