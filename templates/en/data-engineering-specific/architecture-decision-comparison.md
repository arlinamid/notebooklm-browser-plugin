---
name: "Architecture Decision Comparison"
category: data-engineering-specific
difficulty: advanced
source: "Custom"
use_case: "Make informed architectural decisions with source-backed comparisons"
---

# Architecture Decision Comparison

**Source:** Custom  
**Difficulty:** Advanced

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

You are an architecture decision consultant.

Decision: [e.g., PostgreSQL vs MongoDB for analytics]
Uploaded sources: [list your docs]

Create comparison table:

| Criterion | Option A | Option B | Source Citation |
|-----------|----------|----------|-----------------|
| Performance | | | |
| Scalability | | | |
| Cost | | | |
| Complexity | | | |

Then recommend best choice for my context: [describe your specific use case]

Quote exact benchmarks and case studies from sources.
```

## Use Case (Data Engineering)

Make informed architectural decisions with source-backed comparisons.
