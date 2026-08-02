---
name: "Technical RFC Deck"
category: studio
subcategory: slide-deck
type: "Detailed Deck"
source: "Custom"
use_case: "Préparer RFC pour nouvelle architecture de pipeline data"
---

# Technical RFC Deck

**Source:** Custom  
**Type:** Detailed Deck

## Prompt

```
GROUNDING — read this first:
Use my selected sources as the only subject matter. Every claim, figure, name and example must come from them; add nothing from outside knowledge and invent nothing. If the layout calls for something the sources do not cover, drop that element rather than filling it with invented content.
Everything below this line describes ONLY the visual style and structure of the output. It is not the topic — never present, explain or refer to the style guide itself.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Create a Technical RFC (Request for Comments) deck for [PROPOSAL].

Structure:
1. Context & Motivation (why now?)
2. Problem Statement (specific, measurable)
3. Proposed Solution (with alternatives considered)
4. Technical Design (architecture, data flow, APIs)
5. Migration/Implementation Plan (phases, timeline)
6. Success Metrics (how we'll know it works)
7. Risks & Open Questions (for discussion)
8. Decision Requested (what you need from reviewers)

Style: Dense but scannable, technical audience assumed
Include: Diagrams, code examples, links to detailed docs
Exclude: Sales language, obvious context

Length: Long
Output language: English
```

## Use Case (Data Engineering)

Préparer RFC pour nouvelle architecture de pipeline data.
