---
name: "Video Overview — Architecture/Pipelines"
category: studio/video
difficulty: intermediate
source: "Original"
use_case: "Visualize data architectures, ETL/ELT pipelines, data flows"
notebooklm_features:
  - video-overview
  - custom-style
  - custom-focus
---

## Style visuel

Coller dans le champ "Describe a custom visual style" :

```text
3D isometric illustration, Material Design style, glowing connection lines between components, soft shadows, clean geometric shapes.
Show data flowing from sources through transformation layers to destination with visual checkpoints.
```

## Focus IA

Coller dans le champ "What should the AI hosts focus on" :

```text
GROUNDING — read this first:
Use my selected sources as the only subject matter. Every claim, figure, name and example must come from them; add nothing from outside knowledge and invent nothing. If the layout calls for something the sources do not cover, drop that element rather than filling it with invented content.
Everything below this line describes ONLY the visual style and structure of the output. It is not the topic — never present, explain or refer to the style guide itself.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Target audience: [ROLE] understanding [SYSTEM/PIPELINE] architecture

Focus on:
- Name and role of each component
- Data flow direction and sequence
- Integration points between systems
- Key decision points and branching logic
- Scale and volume considerations where relevant

Skip:
- Code-level implementation
- Vendor-specific configurations
- Historical evolution of the architecture
- Operational runbooks

Tone: Technical, systematic, component-oriented
```

## Exemple rempli

```text
Target audience: data engineers understanding modern data pipeline architecture

Focus on:
- Name and role of each component
- Data flow direction and sequence
- Integration points between systems
- Key decision points and branching logic
- Scale and volume considerations where relevant

Skip:
- Code-level implementation
- Vendor-specific configurations
- Historical evolution of the architecture
- Operational runbooks

Tone: Technical, systematic, component-oriented
```
