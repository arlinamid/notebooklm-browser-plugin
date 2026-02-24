---
name: "Research Findings Table"
category: studio
difficulty: intermediate
format: data-table
use_case: "Extract and structure key research findings from multiple sources into a clean, comparable table with columns for source, methodology, key finding, and implications."
source: Library
---

## Prompt

```text
Create a structured data table extracting the major findings from the source material.

Table columns:
| Title/Source | Author(s) | Key Finding | Methodology | Sample Size | Implication |

Requirements:
- Extract one row per distinct finding or study
- Keep each cell concise (1-2 sentences max)
- Sort by relevance/importance (most impactful first)
- Add a "Notes" column for caveats, limitations, or contradictions
- If sources contradict each other, flag with ⚠️

Generate up to 15 rows. Add a brief summary paragraph below the table highlighting the 3 most significant patterns across all findings.
```
