---
name: owlio-core
description: Apply Owlio-wide product boundaries, frontend conventions, accessibility, and security guardrails across learning and teaching workflows.
---

# Owlio Core

Use this skill for cross-cutting product decisions or when work touches multiple Owlio experiences. Follow the [Owlio Product Plan](../../../OWLIO_PRODUCT_PLAN.md) for product vision and target workflows. `AGENTS.md`, current source, and confirmed backend contracts are authoritative for implementation status and technical behavior; the plan is not proof that a feature or API already exists.

## Product model

Owlio supports four connected experiences:

1. Student workspace, useful without an instructor and including a distinct peer study-space context.
2. School educator classrooms for formal teaching and official class records.
3. ESL teacher workflows for flexible language lessons and learner feedback.
4. Tutor workflows for flexible one-to-one/group instruction outside a school-only model.

Keep student personal work and peer study-space content distinct from educator-controlled classroom records. Official school grades, attendance, feedback, classwork, and classroom progress belong to authorized educator workflows. Tutoring evaluations are not automatically institutional grades; private ESL/tutor notes are not learner-visible feedback. Backend authorization—not hidden controls, route prefixes, or client validation—is the security boundary.

## Four workflow specifications

Read the page-specific plan before changing a role workflow:

- [Student](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md): independent learning, My Classes, student-created Study Spaces, and distinct personal/peer/official records.
- [School educator](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md): class ownership, classwork, separate Attendance and Gradebook, lesson planning, communication, AI drafts, and sourced insights.
- [ESL teacher](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md): flexible language lessons, separate Lesson Plans and Lesson Schedule, private notes vs published feedback, and a proposed temporary in-room whiteboard.
- [Tutor](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md): individual/group tutoring, flexible session modes where supported, Session Attendance, private Session Notes, published feedback, and non-school evaluations.

These plans define intended behavior, not current implementation. `AGENTS.md`, source, and confirmed backend/security contracts take precedence for what exists. Ask rather than resolving a conflict by guess.

## Current implementation guardrails

- The current app is a React/TypeScript Vite SPA. Keep route adapters thin, put domain behavior beside its feature, and reuse existing UI primitives.
- Dashboard role roots are `/students`, `/educators`, `/tutors`, and `/esl`. Put role-specific pages under `src/pages/dashboard/<role>/<feature>/index.tsx`; put shared page components under `src/pages/dashboard/<feature>/index.tsx` and mount them beneath each role-prefixed route so the sidebar keeps its workspace context. These route prefixes are UX context, not authorization.
- Keep new/refactored route folders to thin `index.tsx` adapters and place page behavior in the role-plan feature locations. Keep URLs role-prefixed; route prefixes are workspace context, not authorization.
- Authentication is API-backed through `auth.service.ts` and `AuthSessionProvider`; onboarding remains a local-only wizard. Verify current source before describing either flow.
- Current registration account types are `student` and `educator`. Onboarding has `student`, `educator`, and `others` (including tutor/ESL subtypes); those subtype selections are not persisted auth roles or backend authorization.
- Current dashboard services cover authentication, health, classroom list/create/join, and meeting create/join/end. Other workflow features remain proposals, local prototypes, or UI scaffolds unless current source and an approved contract show otherwise. Do not present sample values as live activity.
- Do not invent endpoints, permissions, supported upload types, integrations, or product states. Label proposals and future functionality clearly.
- Preserve Owlio branding, existing theme tokens, responsive behavior, keyboard access, visible focus, associated labels, and useful status/error feedback.
- Never expose secrets, credentials, verification/reset tokens, raw server payloads, or private learner data in UI, logs, docs, or examples.
- AI-generated instructional or evaluation content must remain reviewable and editable by an educator; AI must not silently establish final official grades.
- Student AI is a separate proposed assistant, not a relabelled educator tool. ESL/tutor/educator AI remains role-specific, service-backed only when approved, and human-reviewed.

## Workflow

Before work, identify the user, goal, experience (personal workspace, study space, or official classroom), data owner, and current implementation/API support. Map relevant states and role boundaries, inspect the actual feature and shared components, then verify the change and report what remains planned or backend-dependent.

## Related skills

Use focused guidance for [student workflows](../student-workflows/SKILL.md), [study spaces](../study-spaces/SKILL.md), [educator classrooms](../educator-classroom/SKILL.md), [tutoring](../tutoring-workflows/SKILL.md), [ESL teaching](../esl-teaching/SKILL.md), [classwork and assessment](../classwork-assessment/SKILL.md), [AI assistance](../ai-assistant/SKILL.md), [authentication](../owlio-authentication/SKILL.md), [onboarding](../owlio-onboarding/SKILL.md), [scheduling](../schedule-calendar/SKILL.md), [learning materials](../learning-materials/SKILL.md), [attendance](../attendance/SKILL.md), [communication and notifications](../communication-notifications/SKILL.md), and [progress/reporting](../learner-progress-reporting/SKILL.md).