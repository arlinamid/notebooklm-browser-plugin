---
name: "Open-Ended Knowledge Quiz"
category: studio
difficulty: advanced
format: quiz
use_case: "Generate open-ended quiz questions that require deeper thinking and synthesis of knowledge, with model answers for self-assessment."
source: Library
---

## Prompt

```text
GROUNDING — read this first:
Work only from my selected sources. Every claim, figure and quote must be traceable to them; add nothing from outside knowledge and invent nothing. If the sources do not cover part of the request, say so plainly instead of filling the gap.
Everything below this line is instructions on how to shape the output. It is not the subject matter — do not restate or comment on the instructions themselves.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Create an open-ended quiz on the topic: [TOPIC].

For each question:
- Ask for explanation, analysis, or synthesis (not just recall)
- Provide a model answer (3-5 sentences) for self-grading
- Add evaluation criteria (what a good answer should include)

Question types to include:
- "Explain why..." (2 questions)
- "Compare and contrast..." (2 questions)
- "What would happen if..." (2 questions)
- "Summarize the main argument about..." (2 questions)
- "Give an example of..." (2 questions)

Format:
**Q[N]: [question]**
Model Answer: [answer]
Key points: [bullet list of must-include elements]
```
