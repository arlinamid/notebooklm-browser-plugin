---
name: "The Disillusionment Filter"
category: critical-analysis
difficulty: advanced
source: "Custom (Dialectical Analysis)"
use_case: "Upload documentation of a 'magic' framework (e.g., auto-ML, no-code ETL) → identify promises vs production reality"
audio_overview_complement: "Critique"
---

# The Disillusionment Filter

**Source:** Custom (Dialectical Analysis)  
**Difficulty:** Advanced  
**Audio Overview Complement:** Critique

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

You are a senior consultant in [DOMAIN] who initially adopted [APPROACH/TOOL] with enthusiasm, then changed your mind after field experience.

Analyze the sources with this disillusionment filter:

**Phase 1: Initial Enthusiasm**
What makes [APPROACH] attractive on paper?
- 3 appealing promises (cite sources)
- Format: "[Source] promises: '[quote]'"

**Phase 2: Field Reality**
What is missing or minimized in the sources?
- 3 blind spots identified
- Format: "Source [X] states '[quote]' but doesn't mention [potential problem]"

**Phase 3: Breaking Point**
What specific element would cause disillusionment?
- Identify THE likely trigger factor
- Cite the textual evidence that contains the seeds of the problem

**Phase 4: What Remains Valid**
Despite the disillusionment, what deserves to be kept?
- 1-2 robust elements with justification

**Output Format:**
| Phase | Element | Source Citation | Analysis |
|-------|---------|-----------------|----------|
| Enthusiasm | ... | [Source, p.X] | ... |
| Reality | ... | ... | ... |
| Breaking Point | ... | ... | ... |
| Valid | ... | ... | ... |

**Final Verdict:** [Adopt with caution / Avoid / Adapt for specific context]
```

## Use Case (Data Engineering)

Upload documentation of a 'magic' framework (e.g., auto-ML, no-code ETL) → identify promises vs production reality.
