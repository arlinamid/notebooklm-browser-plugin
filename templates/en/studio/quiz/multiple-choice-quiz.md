---
name: "Multiple Choice Quiz"
category: studio
difficulty: intermediate
format: quiz
use_case: "Generate a multiple-choice quiz on a specific topic from the source material, with clear questions, plausible distractors, and correct answers."
source: Library
---

## Prompt

```text
GROUNDING — read this first:
Work only from my selected sources. Every claim, figure and quote must be traceable to them; add nothing from outside knowledge and invent nothing. If the sources do not cover part of the request, say so plainly instead of filling the gap.
Everything below this line is instructions on how to shape the output. It is not the subject matter — do not restate or comment on the instructions themselves.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Create a multiple-choice quiz on the topic: [TOPIC].

For each question:
- Write a clear, unambiguous question
- Provide 4 answer options (A, B, C, D)
- Include only one correct answer
- Make distractors plausible but clearly wrong on reflection
- Avoid trick questions

After all questions, provide an Answer Key section.

Generate 10 questions covering different aspects of the topic.
Difficulty distribution: 3 easy, 5 medium, 2 hard.

Format:
**Q[N]: [question]**
A) [option]
B) [option]
C) [option]
D) [option]

Answer Key: Q1-D, Q2-B, ...
```
