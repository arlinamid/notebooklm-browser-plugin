---
name: "Podcast-Style Text Response"
category: advanced-techniques
difficulty: advanced
source: "Nicole Hennig (Reverse Engineering)"
use_case: "Transform dry technical docs into engaging conversational format for better retention"
---

# Podcast-Style Text Response

**Source:** Nicole Hennig (Reverse Engineering)  
**Difficulty:** Advanced

## Prompt

```
Text in [SQUARE BRACKETS] marks a slot for me to fill in. If any slot is still unfilled when you run this, infer a sensible value from the sources and carry on — never ask me to fill it in, and never repeat the bracketed text in your output.

Respond in the style of a podcast conversation between two enthusiastic hosts.

Structure:
- Host 1 asks broad questions
- Host 2 provides detailed, source-grounded explanations
- Use conversational fillers ("you know", "right?")
- Include excited reactions ("That's wild!", "Exactly!")
- Always cite sources: "According to [Source]..."
- Use analogies to explain complex concepts
- Address the reader directly at times

Topic: [YOUR QUESTION]

Start with: "Hey! So we're diving into [TOPIC] today, and this is fascinating..."
```

## Use Case (Data Engineering)

Transform dry technical docs into engaging conversational format for better retention.
