# Chrome Web Store listing copy

Plain text — the Store does not render Markdown. Copy the blocks below as-is.

---

## Short description (132 char limit)

```
229 one-click prompts for NotebookLM — better podcasts, slide decks, infographics and study guides.
```

*(98 characters)*

---

## Detailed description

```
You fed NotebookLM 40 sources. It handed back a summary that sounds like every other summary.

The sources weren't the problem. The prompt was.

Prompt Architect puts 229 ready-made prompts one click away — right inside NotebookLM's Studio panels and above the chat box. Pick one. It fills the box. Hit Generate.


🎨 SLIDE DECKS PEOPLE ACTUALLY LOOK AT

62 deck templates, each a full design brief: manga, brutalist editorial, neo-noir, royal blue watercolour, Japanese seminar minimal, neon tech-art, magazine spread. Colour palettes, typography, layout rules — all written out, all applied to your material.

Same for infographics: 25 styles, from executive KPI boards to expressive cubist and mixed-media collage.


🎙️ PODCASTS WORTH LISTENING TO

Turn your sources into a real debate between two hosts. Or a critique that pokes holes in your own argument. Or a five-minute executive brief instead of a rambling deep dive. 12 audio templates, 18 for video.


🧠 A CHAT THAT ACTS LIKE AN EXPERT

24 personas you set once and the whole notebook follows: Socratic Tutor that answers with questions instead of answers. Exam Coach that finds your weak spots. Fact-Checker. Research Scientist. Business Strategist. Creative Writing Mentor.

Plus 68 chat prompts for the everyday work — synthesis across sources, conflict detection, study guides, gap analysis.

And study aids: flashcards, quizzes, reports, data tables.


✅ ANSWERS FROM YOUR SOURCES — NOT FROM THE PROMPT

Here's the thing most prompt packs get wrong.

Feed NotebookLM a gorgeous "visual style" prompt and it will often build you a beautiful deck… about the style guide. Not about your research. You've probably seen it happen.

Every template here starts by pinning the model to your material: use the selected sources, invent nothing, and say so when the sources fall short. The style templates go further and spell out that the design brief is not the subject.

It's the difference between a prompt that reads well and a prompt that answers the right question.


✍️ NO MORE HALF-FINISHED PROMPTS

Studio generates in one shot — no back and forth. So a leftover [TOPIC] in your prompt goes straight to the model, and nobody warns you.

Now a small form pops up listing exactly what's missing. Fill it in, hit Generate, done.


💾 YOUR PROMPTS, EVERYWHERE

Found a prompt that works? Save it from any NotebookLM text box with one click. It shows up in the dropdowns next to the built-ins — and follows you to every Chrome you're signed into.


🌍 ENGLISH AND HUNGARIAN

Both the interface and all 229 templates. Properly translated, not run through a machine. Switch with one click.

Light and dark theme, automatically.


🔒 FREE, AND IT STAYS ON YOUR MACHINE

No account. No sign-up. No telemetry, no analytics, no servers of ours anywhere. There's simply nowhere for your data to go.

Open source: github.com/arlinamid/notebooklm-browser-plugin


GETTING STARTED

1. Open notebook.google.com and pick one of your notebooks
2. Open any Studio card, or click into the chat box
3. Choose a template from the dropdown
4. Fill in the blanks it asks for, and Generate

One note: NotebookLM only shows Studio panels in notebooks you own — shared and featured notebooks don't have them, so the Studio dropdowns won't appear there. The chat picker works everywhere.

Works on notebook.google.com and the old notebooklm.google.com address.


Prompt Architect is an independent extension. It is not affiliated with, associated with, or endorsed by Google LLC. NotebookLM and Gemini are trademarks of Google LLC.
```

---

## Notes for the listing owner

### Facts corrected from the previous version

| Old | Correct |
|---|---|
| "216 templates" / "200+" | **229** |
| "108 English and 108 Hungarian" | **114 EN + 115 HU** |
| "Open notebooklm.google.com" | **notebook.google.com** since July 2026 |
| "saved in your Chrome **local** storage" | `chrome.storage.**sync**` — prompts follow the user across devices |
| "Fill in any [BRACKETED] variables" | The extension fills them now |

The storage one mattered most: cross-device sync has shipped since v1.1.0 and the old copy told people the opposite.

### What this version does differently

**Leads with the reader's problem, not the mechanism.** The old opening explained what the extension *is*. This one opens on the moment of disappointment every NotebookLM user has had, then offers the fix.

**Sells the visual formats first.** 62 slide styles and 25 infographic styles are the most immediately appealing thing here, and they were buried in a bullet list. Naming them — manga, brutalist editorial, neo-noir — does more than "presentation slides, infographics, data tables".

**Turns the grounding work into a benefit.** Nobody buys "source-grounded prompt preambles". They do recognise "a beautiful deck about the style guide instead of your research."

**Keeps the awkward truth, placed low.** Studio panels only existing in your own notebooks is a predictable source of 1-star "doesn't work" reviews. Stating it plainly near the end costs a little and prevents that.

### Deliberately avoided

*Unlock, supercharge, revolutionise, game-changer, seamlessly, perfectly, powerful, effortlessly.* Marketing copy earns attention with specifics, not intensifiers — the previous draft's *perfectly* ×4 and *seamlessly* ×2 were the clearest tell that no one had actually written it.
