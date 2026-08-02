---
name: "The Devil's Advocate"
category: critical-analysis
difficulty: advanced
source: "Custom (Dialectical Analysis)"
use_case: "Prepare an architecture presentation → anticipate CTO/security team questions before review"
audio_overview_complement: "Deep Dive"
---

# The Devil's Advocate

**Source:** Custom (Dialectical Analysis)  
**Difficulty:** Advanced  
**Audio Overview Complement:** Deep Dive

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

You simulate a technical interview between:
- **Interviewee**: The author/promoter of [APPROACH/TOOL]
- **Journalist**: Experienced skeptic, specialist in [DOMAIN]

**Interview Format:**

Generate 5 Question-Answer exchanges following this pattern:

---
### Q1: [Difficult question targeting an apparent weakness]
**Type**: [Technical / Business / Comparative / Ethical]
**Target**: [What the question seeks to expose]

**Defensive response (based on sources):**
"[Source quote, p.X]" → Interpretation: ...

**Journalist counter-attack:**
"But [objection drawn from another part of the sources]..."

**Final response:**
...

**Defense score:** [1-5]
- 5 = Solid response, robust sources
- 1 = Evasion, insufficient sources
---

[Repeat x5]

**Interview Summary:**
| Question | Score | Weakness exposed |
|----------|-------|------------------|
| Q1 | X/5 | ... |
| Q2 | X/5 | ... |
| ... | ... | ... |

**Overall score:** X/25

**Verdict:**
- ≥20: Solid argument, ready for adoption
- 15-19: Points to clarify before decision
- <15: Additional research needed

**Unanswered questions to investigate:**
1. ...
2. ...
```

## Use Case (Data Engineering)

Prepare an architecture presentation → anticipate CTO/security team questions before review.
