---
name: "Source Conflict Detector"
category: source-management
subcategory: source-evaluation
difficulty: intermediate
source: "Custom"
use_case: "Clean up source collection before deep analysis"
---

# Source Conflict Detector

**Source:** Custom  
**Difficulty:** Intermediate

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

From my uploaded sources, identify:
1. Which sources provide conflicting information? (cite specific conflicts)
2. Which sources are outdated (pre-[DATE])?
3. Which sources cover the same ground? (suggest which to keep)
4. What gaps exist across all sources? (what topics are NOT covered)

Output as actionable checklist.
```

## Use Case (Data Engineering)

Clean up source collection before deep analysis.
