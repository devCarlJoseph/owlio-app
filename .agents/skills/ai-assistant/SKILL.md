---
name: ai-assistant
description: Design educator-facing AI assistance for creating and evaluating learning content while preserving educator review, privacy, and control.
---

# Owlio AI Assistant

Use for AI-assisted teaching and assessment features described by the product plan. AI is assistance for educators, not an autonomous authority over students or official academic records.

## Supported product direction

The plan describes assistance with question suggestions and refinement, grammar/clarity, variations, answer choices, difficulty, question-set organization, teacher-defined criteria, assignment instructions, discussion questions, activity ideas, lesson suggestions, suggested feedback, and written-response evaluation. ESL/tutoring examples include vocabulary, grammar, conversation, reading, writing, and speaking activities. Treat these as product direction, not existing capability.

## Review and control

- Keep generated text visibly identifiable as a draft or suggestion.
- Let the educator review, edit, accept, reject, or override generated content before publishing or using it.
- AI scoring or feedback may inform review; the educator remains responsible for final grades/evaluations and official learner records.
- Do not quietly publish, assign a grade, contact a learner, or modify a record as an AI side effect.
- Preserve the context supplied by the educator (subject, lesson, level, rubric, criteria) and avoid unsupported claims of curriculum alignment or accuracy.

## Privacy and integration

Do not send sensitive learner data or credentials to an AI provider without an approved product, privacy, and backend contract. Do not call AI providers directly from the browser or invent endpoints/model behavior. Follow the approved service/API flow when one exists; otherwise keep the UI explicitly in a design/prototype state. Provide clear error, unavailable, and retry states without exposing raw provider payloads.

Use [classwork and assessment](../classwork-assessment/SKILL.md) for activity and grading workflows, [ESL teaching](../esl-teaching/SKILL.md) for language-specific examples, and [Owlio Core](../owlio-core/SKILL.md) for shared ownership and security boundaries.