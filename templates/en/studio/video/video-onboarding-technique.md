---
name: "Video Overview — Onboarding technique"
category: studio/video
difficulty: beginner
source: "Original"
use_case: "Training, tutorials, step-by-step guides"
notebooklm_features:
  - video-overview
  - custom-style
  - custom-focus
---

## Style visuel

Coller dans le champ "Describe a custom visual style" :

```text
Sketch-style illustration, whiteboard aesthetic, ink linework on light background, minimalist iconography, simple annotations.
Represent concepts as building blocks being assembled step by step.
```

## Focus IA

Coller dans le champ "What should the AI hosts focus on" :

```text
GROUNDING — read this first:
Use my selected sources as the only subject matter. Every claim, figure, name and example must come from them; add nothing from outside knowledge and invent nothing. If the layout calls for something the sources do not cover, drop that element rather than filling it with invented content.
Everything below this line describes ONLY the visual style and structure of the output. It is not the topic — never present, explain or refer to the style guide itself.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Target audience: [ROLE] new to [TOPIC]

Focus on:
- Start with the "why" before the "how"
- Explain each concept before using it
- Use simple analogies for technical terms
- Progress from basic to advanced in logical order
- Highlight common beginner mistakes and how to avoid them

Skip:
- Advanced optimizations
- Edge cases
- Historical context unless essential

Tone: Patient, encouraging, assume no prior knowledge of [TOPIC]
```

## Exemple rempli

```text
Target audience: junior developers new to Python for data engineering

Focus on:
- Start with the "why" before the "how"
- Explain each concept before using it
- Use simple analogies for technical terms
- Progress from basic to advanced in logical order
- Highlight common beginner mistakes and how to avoid them

Skip:
- Advanced optimizations
- Edge cases
- Historical context unless essential

Tone: Patient, encouraging, assume no prior knowledge of data pipelines
```
