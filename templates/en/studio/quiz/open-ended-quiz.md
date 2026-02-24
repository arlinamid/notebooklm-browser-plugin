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
