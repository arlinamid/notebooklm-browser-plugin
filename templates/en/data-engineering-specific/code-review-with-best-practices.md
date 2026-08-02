---
name: "Code Review with Best Practices"
category: data-engineering-specific
difficulty: intermediate
source: "Custom"
use_case: "Systematic code review against uploaded best practices documentation"
---

# Code Review with Best Practices

**Source:** Custom  
**Difficulty:** Intermediate

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

You are a code quality expert specializing in [Python/SQL/etc].

Review this code against best practices from uploaded sources:

```[language]
[paste your code]
```

Compare with recommendations from sources:
1. Style violations (cite style guide sections)
2. Performance issues (reference optimization docs)
3. Security concerns (quote security guidelines)
4. Missing patterns (what sources recommend but code lacks)
5. Refactoring suggestions (with before/after from examples)

For each issue: "[Source, Section X] recommends: '[quote]' → Your code: [problem] → Fix: [solution]"
```

## Use Case (Data Engineering)

Systematic code review against uploaded best practices documentation.
