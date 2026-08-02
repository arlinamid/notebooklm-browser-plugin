---
name: "Complete Study Guide Generator"
category: productivity
difficulty: intermediate
source: "AI Fire"
use_case: "Upload AWS Lambda + API Gateway + DynamoDB docs → complete study guide with quizzes"
---

# Complete Study Guide Generator

**Source:** AI Fire  
**Difficulty:** Intermediate

## Prompt

```
GROUNDING — read this first:
Work only from my selected sources. Every claim, figure and quote must be traceable to them; add nothing from outside knowledge and invent nothing. If the sources do not cover part of the request, say so plainly instead of filling the gap.
Everything below this line is instructions on how to shape the output. It is not the subject matter — do not restate or comment on the instructions themselves.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Act as a dedicated tutor. Based on all the study materials provided for the topic of [TOPIC], create a "Complete Study Guide Kit" that includes:

**1. Summary of Key Concepts:**
- Explain the 3-5 most important ideas of this topic
- For each one, provide a simple explanation and a specific example from the materials

**2. Terminology Flashcards:**
- Create a list of 10 important terms and their short definitions
- Present them as "Term: Definition"

**3. Practice Questions:**
- Write 5 long-form essay questions that could be on the exam, covering different parts of the topic
- Write a 10-question multiple-choice quiz (with 4 options: A, B, C, D) to quickly test knowledge

**4. Provide an Answer Key:**
- At the very end, provide the answers for the 10 multiple-choice questions

**5. Study Tips:**
- Based on the complexity of this topic, suggest the best way to study it
- Estimate how many hours are needed to master this topic
```

## Use Case (Data Engineering)

Upload AWS Lambda + API Gateway + DynamoDB docs → complete study guide with quizzes.
