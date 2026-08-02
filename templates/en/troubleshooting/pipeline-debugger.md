---
name: "Pipeline Debugger"
category: troubleshooting
difficulty: intermediate
source: "Custom (Data Engineering Template)"
use_case: "Upload error logs + your code + relevant documentation for systematic debugging"
---

# Pipeline Debugger

**Source:** Custom (Data Engineering Template)  
**Difficulty:** Intermediate

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

You are a senior data engineer troubleshooting specialist.

Problem: [describe your broken pipeline]
Current setup: [tech stack]
Error message: [paste error]
What I tried: [attempted solutions]

Using my uploaded documentation sources, provide:
1. Root cause analysis (cite specific docs)
2. Step-by-step fix (with code examples from sources)
3. Prevention strategies (quote best practices)
4. Similar issues in sources (with resolutions)

Format each recommendation: "[Source, Page X]: '[exact quote]' → Action: [what to do]"
```

## Use Case (Data Engineering)

Upload error logs + your code + relevant documentation for systematic debugging.
