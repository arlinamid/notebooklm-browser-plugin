# Chrome Web Store listing copy

Plain text — the Store does not render Markdown. Copy the blocks below as-is.
Current for **v1.6.1**.

---

## Short description (132 char limit)

```
229 one-click prompts for NotebookLM, in 12 languages — better podcasts, slide decks and study guides.
```

*(101 characters)*

---

## Detailed description

```
You fed NotebookLM 40 sources. It handed back a summary that sounds like every other summary.

The sources weren't the problem. The prompt was.

Prompt Architect puts 229 ready-made prompts one click away — right inside NotebookLM's Studio panels and above the chat box. Pick one. It fills the box. Hit Generate.


🌍 NOW IN 12 LANGUAGES

English, Hungarian, Spanish, Portuguese, French, German, Italian, Japanese, Korean, Chinese, Hindi and Russian.

Not just the menus — the prompts themselves. Titles, descriptions and the full prompt text you actually read and edit. Because a prompt you can't read is a prompt you can't adapt.


🎨 SLIDE DECKS PEOPLE ACTUALLY LOOK AT

62 deck templates, each a full design brief: manga, brutalist editorial, neo-noir, royal blue watercolour, Japanese seminar minimal, neon tech-art, magazine spread. Colour palettes, typography, layout rules — all written out, all applied to your material.

Same for infographics: 25 styles, from executive KPI boards to expressive cubist and mixed-media collage.


🎙️ PODCASTS WORTH LISTENING TO

Turn your sources into a real debate between two hosts. Or a critique that pokes holes in your own argument. Or a five-minute executive brief instead of a rambling deep dive. 12 audio templates, 18 for video.


🧠 A CHAT THAT ACTS LIKE AN EXPERT

24 personas you set once and the whole notebook follows: Socratic Tutor that answers with questions instead of answers. Exam Coach that finds your weak spots. Fact-Checker. Research Scientist. Business Strategist. Creative Writing Mentor.

Plus 68 chat prompts for the everyday work — synthesis across sources, conflict detection, study guides, gap analysis.

And study aids: flashcards, quizzes, reports, data tables.


⛓ ONE QUESTION LEADS TO THE NEXT

Good research is rarely one prompt. You summarise, then you dig into what the summary raised, then you ask what it left out.

Build that once as a chain and run it with a click. Each step goes into the same chat, so every step can build on the answers before it. Steps can be templates from the library or one-offs you type yourself.

The blanks are filled in once, before it starts — then it runs unattended while you read.


✅ ANSWERS FROM YOUR SOURCES — NOT FROM THE PROMPT

Here's the thing most prompt packs get wrong.

Feed NotebookLM a gorgeous "visual style" prompt and it will often build you a beautiful deck… about the style guide. Not about your research. You've probably seen it happen.

Every template here starts by pinning the model to your material: use the selected sources, invent nothing, and say so when the sources fall short. The style templates go further and spell out that the design brief is not the subject.

It's the difference between a prompt that reads well and a prompt that answers the right question.


✍️ NO MORE HALF-FINISHED PROMPTS

Studio generates in one shot — no back and forth. So a leftover [TOPIC] in your prompt goes straight to the model, and nobody warns you.

Now a small form pops up listing exactly what's missing. Fill it in, hit Generate, done. It works in every language — the placeholders are translated too.


💾 YOUR PROMPTS, EVERYWHERE

Found a prompt that works? Save it from any NotebookLM text box with one click. It shows up in the dropdowns next to the built-ins — and follows you to every Chrome you're signed into.


🔒 FREE, AND IT STAYS ON YOUR MACHINE

No account. No sign-up. No telemetry, no analytics, no servers of ours anywhere. There's simply nowhere for your data to go.

Open source: github.com/arlinamid/notebooklm-browser-plugin


GETTING STARTED

1. Open notebook.google.com and pick one of your notebooks
2. Open any Studio card, or click into the chat box
3. Choose a template from the dropdown
4. Fill in the blanks it asks for, and Generate

One note: NotebookLM only shows Studio panels in notebooks you own — shared and featured notebooks don't have them, so the Studio dropdowns won't appear there. The chat picker works everywhere.


⚠️ IF IT STOPPED WORKING FOR YOU IN JULY

Google renamed NotebookLM to Gemini Notebook and moved it to notebook.google.com. Extensions pointing at the old address went silent overnight — including this one.

Fixed. Both addresses work again. If you tried it during that window and gave up, update and try once more.


Prompt Architect is an independent extension. It is not affiliated with, associated with, or endorsed by Google LLC. NotebookLM and Gemini are trademarks of Google LLC.
```

---

## Notes for the listing owner

### What changed for v1.6.1

- **Chains get their own section**, placed just before the grounding pitch. It is the one thing here
  that NotebookLM cannot do at all, and it came directly out of a store review asking to "select
  prompts in sequence" — so it belongs above the fold rather than in a feature list.
- The section leads with the *reason* a chain exists (research is iterative) rather than the
  mechanism, because the mechanism only reads as valuable once the need is obvious.
- **Screenshots retaken** for the 1.6.0 popup — `docs/store-screenshots/`, all 1280x800 24-bit RGB,
  which is what the Store accepts. Eight exist; **the Store takes five**, so pick. Recommended set,
  in upload order:

  | # | File | Why it earns a slot |
  |---|---|---|
  | 1 | `store-1-library.png` | What the thing is, in one look |
  | 2 | `store-6-inpage.png` | Proof it lives inside NotebookLM, plus the placeholder form |
  | 3 | `store-8-chain-run.png` | Chains — the one thing NotebookLM cannot do |
  | 4 | `store-7-save.png` | Your own prompts, saved from the page |
  | 5 | `store-5-languages.png` | Twelve languages, prompts included |

  Held back: `store-2-formats.png` (format rail), `store-3-chains.png` (chain library),
  `store-4-slides.png` (deck styles) — each overlaps something already in the five.
- Regenerate the popup shots with `node scripts/build-screenshots.js` after any popup change.
  Shots 6-8 are composed from a signed-in NotebookLM session and are captured by hand.

### What changed for v1.4.0

- **12 languages is the new headline**, placed second — right after the hook, before the visual formats. It is the single biggest reason a new user in Spain, Brazil or Japan would install this over an English-only competitor.
- Added the **July migration notice** near the end. It is aimed squarely at the people who installed, hit the dead version, and left a one-star review. Naming the cause and saying "try once more" recovers more of them than silence.
- The placeholder section now mentions that slots are translated too.

### Facts kept current

| | |
|---|---|
| Templates | 229 (114 EN + 115 HU bodies; other languages use translated bodies) |
| Languages | 12 |
| Domain | `notebook.google.com` (old one still supported) |
| Storage | `chrome.storage.sync`, sharded across keys — follows the user across devices |
| Chains | Chat only; Studio generates once from a single brief |

### Deliberately avoided

*Unlock, supercharge, revolutionise, game-changer, seamlessly, perfectly, powerful, effortlessly.*
Marketing copy earns attention with specifics, not intensifiers.
