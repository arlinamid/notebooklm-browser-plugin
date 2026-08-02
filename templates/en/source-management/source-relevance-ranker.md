---
name: "Source Relevance Ranker"
category: source-management
subcategory: source-evaluation
difficulty: beginner
source: "Custom"
use_case: "After uploading 20+ sources, quickly filter to the 5-10 most relevant"
---

# Source Relevance Ranker

**Source:** Custom  
**Difficulty:** Beginner

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Analyze all sources and rank them by:
1. Recency (publication date)
2. Authority (source type: official docs > tutorials > blog posts > forums)
3. Depth (surface overview vs deep technical detail)
4. Relevance to [MY SPECIFIC USE CASE]

For each source, provide:
- Relevance score (1-10)
- Key unique contribution
- Overlap with other sources
- Recommendation: KEEP / MAYBE / REMOVE
```

## Use Case (Data Engineering)

After uploading 20+ sources, quickly filter to the 5-10 most relevant.
