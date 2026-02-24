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
