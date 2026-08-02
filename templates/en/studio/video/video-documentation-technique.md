---
name: "Video Overview — Documentation technique"
category: studio/video
difficulty: intermediate
source: "Original"
use_case: "API documentation, technical specs, reference guides"
notebooklm_features:
  - video-overview
  - custom-style
  - custom-focus
---

## Style visuel

Coller dans le champ "Describe a custom visual style" :

```text
Technical diagram style, Material Design clean aesthetic, smooth transitions between sections, structured layouts, soft blue and grey palette, clean backgrounds.
Visualize components as connected nodes in a system diagram with clear input/output relationships.
```

## Focus IA

Coller dans le champ "What should the AI hosts focus on" :

```text
GROUNDING — read this first:
Use my selected sources as the only subject matter. Every claim, figure, name and example must come from them; add nothing from outside knowledge and invent nothing. If the layout calls for something the sources do not cover, drop that element rather than filling it with invented content.
Everything below this line describes ONLY the visual style and structure of the output. It is not the topic — never present, explain or refer to the style guide itself.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Target audience: [ROLE] needing reference material for [SYSTEM/API/TOOL]

Focus on:
- Structure information hierarchically (overview → details)
- Define terminology precisely on first use
- Show concrete examples for each concept
- Clarify inputs, outputs, and expected behaviors
- Highlight dependencies and prerequisites

Skip:
- Marketing language
- Comparisons with competitors
- Tutorials or step-by-step walkthroughs
- Opinion or editorialization

Tone: Precise, neutral, scannable
```

## Exemple rempli

```text
Target audience: developers needing reference material for Stripe payment APIs

Focus on:
- Structure information hierarchically (overview → details)
- Define terminology precisely on first use
- Show concrete examples for each concept
- Clarify inputs, outputs, and expected behaviors
- Highlight dependencies and prerequisites

Skip:
- Marketing language
- Comparisons with competitors
- Tutorials or step-by-step walkthroughs
- Opinion or editorialization

Tone: Precise, neutral, scannable
```
