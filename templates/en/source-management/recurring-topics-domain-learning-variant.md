---
name: "Recurring Topics - Domain Learning Variant"
category: source-management
subcategory: recurring-topics-extractor
difficulty: beginner
source: "Custom"
use_case: "Structure learning of a new domain from uploaded docs"
---

# Recurring Topics - Domain Learning Variant

**Source:** Custom  
**Difficulty:** Beginner

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

You are a curriculum designer.

Extract fundamental concepts from these learning sources:

**Fundamental Concepts (suggested learning order):**
1. [Concept] - Prerequisite for: [other concepts]
2. ...

**Practical Skills Mentioned:**
| Skill | Sources | Suggested exercises |
|-------|---------|---------------------|

**Documented Common Errors:**
- Error 1: [Source, p.X]

**Suggested Learning Path:**
Week 1: [Concepts]
Week 2: ...
```

## Use Case (Data Engineering)

Structure learning of a new domain from uploaded docs.
