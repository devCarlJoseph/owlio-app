---
name: ai-assistant
description: Guide role-specific Owlio AI assistance while keeping student and educator experiences distinct and requiring human review, privacy, and control.
---

# Owlio AI Assistance

Use for AI assistance in student, school educator, ESL teacher, and tutor workflows. Read the matching role plan before implementing an AI entry point:

- [Student workflow](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md)
- [Educator workflow](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md)
- [ESL teacher workflow](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md)
- [Tutor workflow](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md)

The role plans describe target behavior, not current service support. Verify `AGENTS.md`, source, and approved provider/privacy/backend contracts. The current shared `/[role]/ai-assistant` page is educator-preparation copy, and no AI generation service is established in the current frontend; this is not proof that generation works for any role.

## Supported product direction

The plan describes assistance with question suggestions and refinement, grammar/clarity, variations, answer choices, difficulty, question-set organization, teacher-defined criteria, assignment instructions, discussion questions, activity ideas, lesson suggestions, suggested feedback, and written-response evaluation. ESL/tutoring examples include vocabulary, grammar, conversation, reading, writing, and speaking activities. Treat these as product direction, not existing capability.

## Role-specific scope

- School educator: the AI Form Assistant supports the Classwork & Assessments authoring flow. Keep generated questions/criteria in a draft, require an educator-selected class context before publishing, and keep Teaching Insights separate from AI-generated evaluation.
- ESL teacher: the AI Lesson Assistant may prepare language-learning lesson/activity drafts and suggested feedback for teacher review. Do not infer language proficiency or standards alignment.
- Tutor: the AI Tutor Assistant is for tutor preparation/review, not an autonomous learner-facing tutor. Keep tutoring evaluations separate from institutional grades.
- Student: the AI Study Assistant is a separate proposed capability with its own safety, age, source, and privacy decisions. Do not relabel the educator assistant or enable student generation by default.

## Review and control

- Keep generated text visibly identifiable as a draft or suggestion.
- Let the educator review, edit, accept, reject, or override generated content before publishing or using it.
- For student-facing assistance, follow the student plan's separate product/safety contract; do not apply educator controls or data access automatically.
- AI scoring or feedback may inform review; the authorized educator or tutor remains responsible for final evaluations and official records under the role plan.
- Do not quietly publish, assign work, contact a learner, set mastery/proficiency, assign a final grade/evaluation, or modify attendance, progress, or another official record as an AI side effect.
- Preserve the context supplied by the educator (subject, lesson, level, rubric, criteria) and avoid unsupported claims of curriculum alignment or accuracy.

## Privacy and integration

Do not send sensitive learner data or credentials to an AI provider without an approved product, privacy, and backend contract. Do not call AI providers directly from the browser or invent endpoints/model behavior. Follow the approved service/API flow when one exists; otherwise keep the UI explicitly in a design/prototype state. Provide clear error, unavailable, and retry states without exposing raw provider payloads.

Use [classwork and assessment](../classwork-assessment/SKILL.md) for activity and grading workflows, [ESL teaching](../esl-teaching/SKILL.md) for language-specific examples, and [Owlio Core](../owlio-core/SKILL.md) for shared ownership and security boundaries.