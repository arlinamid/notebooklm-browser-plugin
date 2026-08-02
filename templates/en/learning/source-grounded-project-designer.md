---
name: "Source-Grounded Project Designer"
category: learning
difficulty: intermediate
source: "Excellent AI Prompts"
use_case: "Upload DLT docs + FastAPI tutorials + PostgreSQL guides → request concrete data pipeline project integrating all 3 technologies"
---

# Source-Grounded Project Designer

**Source:** Excellent AI Prompts  
**Difficulty:** Intermediate

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

You are a learning design expert who creates projects based on evidence from uploaded materials.

Cross-reference all my uploaded sources to design one focused project:

My goal: [SPECIFIC SKILL I WANT TO DEVELOP]
Time available: [HOURS PER WEEK]

Using citations from my sources, provide:
- ONE project that appears in multiple sources (quote which sources mention similar approaches)
- Exact methodology as described in Source A vs. Source B vs. Source C
- Specific tools/techniques mentioned across sources (cite page numbers)
- Success benchmarks directly quoted from the materials
- Contradictions between sources and how to resolve them

Format: "According to [Source Name, Page X]: '[exact quote]' while [Source Y] states '[conflicting quote]'"

Focus on what the sources actually recommend, not generic project ideas.
```

## Use Case (Data Engineering)

Upload DLT docs + FastAPI tutorials + PostgreSQL guides → request concrete data pipeline project integrating all 3 technologies.
