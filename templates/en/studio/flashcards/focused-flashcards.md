---
name: "Focused Flashcard Set"
category: studio
difficulty: beginner
format: flashcards
use_case: "Generate a focused set of flashcards on a specific topic or concept from the source material, ideal for spaced repetition and active recall practice."
source: Library
---

## Prompt

```text
GROUNDING — read this first:
Work only from my selected sources. Every claim, figure and quote must be traceable to them; add nothing from outside knowledge and invent nothing. If the sources do not cover part of the request, say so plainly instead of filling the gap.
Everything below this line is instructions on how to shape the output. It is not the subject matter — do not restate or comment on the instructions themselves.

Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Create a comprehensive set of flashcards on the following topic: [TOPIC].

For each flashcard:
- Front: A clear, concise question or key term
- Back: A precise, memorable answer or definition (max 2-3 sentences)

Requirements:
- Focus strictly on the most important concepts
- Use simple, clear language
- Vary question types: definitions, explanations, examples, comparisons
- Include 15-20 cards covering core concepts
- Order from fundamental to advanced

Format each card as:
Q: [question]
A: [answer]
```
