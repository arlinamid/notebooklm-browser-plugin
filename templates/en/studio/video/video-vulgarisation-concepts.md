---
name: "Video Overview — Vulgarisation/Concepts"
category: studio/video
difficulty: beginner
source: "Original"
use_case: "Explain complex concepts in an accessible way"
notebooklm_features:
  - video-overview
  - custom-style
  - custom-focus
---

## Style visuel

Coller dans le champ "Describe a custom visual style" :

```text
Flat design illustration, Kurzgesagt-style, vibrant saturated colors, simplified shapes, smooth animations, playful but professional.
Represent concepts as building blocks being assembled step by step.
```

## Focus IA

Coller dans le champ "What should the AI hosts focus on" :

```text
GROUNDING — read this first:
Use my selected sources as the only subject matter. Every claim, figure, name and example must come from them; add nothing from outside knowledge and invent nothing. If the layout calls for something the sources do not cover, drop that element rather than filling it with invented content.
Everything below this line describes ONLY the visual style and structure of the output. It is not the topic — never present, explain or refer to the style guide itself.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Target audience: [AUDIENCE] unfamiliar with [CONCEPT/DOMAIN]

Focus on:
- Start with a relatable analogy or real-world example
- Build understanding progressively (simple → nuanced)
- Use visual metaphors the audience can picture
- Connect abstract ideas to everyday experiences
- Reinforce key takeaways with repetition

Skip:
- Jargon without explanation
- Mathematical formulas or technical notation
- Exhaustive accuracy (favor clarity over completeness)
- Caveats and edge cases

Tone: Engaging, curious, conversational
```

## Exemple rempli

```text
Target audience: business professionals unfamiliar with machine learning

Focus on:
- Start with a relatable analogy or real-world example
- Build understanding progressively (simple → nuanced)
- Use visual metaphors the audience can picture
- Connect abstract ideas to everyday experiences
- Reinforce key takeaways with repetition

Skip:
- Jargon without explanation
- Mathematical formulas or technical notation
- Exhaustive accuracy (favor clarity over completeness)
- Caveats and edge cases

Tone: Engaging, curious, conversational
```
