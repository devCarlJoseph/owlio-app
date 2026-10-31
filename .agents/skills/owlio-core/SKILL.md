---
name: owlio-core
description: Apply Owlio-wide product boundaries, frontend conventions, accessibility, and security guardrails across learning and teaching workflows.
---

# Owlio Core

Use this skill for cross-cutting product decisions or when work touches multiple Owlio experiences. Follow the [Owlio Product Plan](../../../OWLIO_PRODUCT_PLAN.md) for shared product intent and the [four-workspace feature map](../../../OWLIO_PRODUCT_PLAN.md#shared-capabilities-and-role-specific-destinations) for how a capability connects to each role. `AGENTS.md` defines repository conventions; current source, runtime flags, and confirmed backend/security contracts determine actual support. A plan or skill does not create an API, permission, or working feature.

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

For page work, read the matching role plan's page requirements, component map, click flow, and acceptance criteria. For shared domains, also use the relevant focused skill below. Follow the [role delivery tracks](../../../OWLIO_PRODUCT_PLAN.md#role-delivery-tracks) rather than treating stage numbers in different plans as equivalent releases. Maintain shared product decisions in the product plan and detailed role behavior in its workflow plan; skills interpret those documents rather than replace them.

## Current implementation guardrails

- The current app is a React/TypeScript Vite SPA. Keep route adapters thin, put domain behavior beside its feature, and reuse existing UI primitives.
- Dashboard role roots are `/students`, `/educators`, `/tutors`, and `/esl`. Put role-specific pages under `src/pages/dashboard/<role>/<feature>/index.tsx`; put shared page components under `src/pages/dashboard/<feature>/index.tsx` and mount them beneath each role-prefixed route so the sidebar keeps its workspace context. These route prefixes are UX context, not authorization.
- Keep new/refactored route folders to thin `index.tsx` adapters and place page behavior in the role-plan feature locations. Keep URLs role-prefixed; route prefixes are workspace context, not authorization.
- Check `src/lib/api-mode.ts` before describing connected behavior. At this alignment, `API_INTEGRATION_ENABLED` is false: the Axios client rejects requests, session restoration is paused, and auth/role guards bypass their checks for UI previews. Preserved authentication/classroom/meeting integrations are not currently enabled service behavior. Do not enable them as a side effect of a page task. Onboarding remains local-only.
- Current registration account types are `student`, `educator`, `tutor`, and `esl`, mapping to `STUDENT`, `EDUCATOR`, `TUTOR`, and `ESL` in the auth model. Onboarding still uses `student`, `educator`, and `others` with subtypes; these local choices do not persist or grant an auth role.
- API clients include authentication, health, classroom list/detail/create/join/student-list, and meeting create/join/end. Their presence does not verify backend deployment, resource authorization, current runtime enablement, or complete learner-management support. Other workflows remain proposals, local prototypes, or UI scaffolds unless current source and an approved contract show otherwise.
- Do not invent endpoints, permissions, supported upload types, integrations, or product states. Label proposals and future functionality clearly.
- Preserve Owlio branding, existing theme tokens, responsive behavior, keyboard access, visible focus, associated labels, and useful status/error feedback.
- Never expose secrets, credentials, verification/reset tokens, raw server payloads, or private learner data in UI, logs, docs, or examples.
- AI-generated instructional or evaluation content must remain reviewable and editable by an educator; AI must not silently establish final official grades.
- Follow the [AI implementation plan](../../../OWLIO_AI_IMPLEMENTATION_PLAN.md) for professional preparation drafts first, initially English-only and using only user-entered task context/settings, excluding learner names, records, private notes, and submissions. Student AI stays separately gated; the browser must not call a model runtime directly.

## Workflow

Before work, identify the user, goal, experience (personal workspace, study space, or official classroom), data owner, and current implementation/API support. Map relevant states and role boundaries, inspect the actual feature and shared components, then verify the change and report what remains planned or backend-dependent.

## Related skills

Use focused guidance for [student workflows](../student-workflows/SKILL.md), [study spaces](../study-spaces/SKILL.md), [educator classrooms](../educator-classroom/SKILL.md), [tutoring](../tutoring-workflows/SKILL.md), [ESL teaching](../esl-teaching/SKILL.md), [classwork and assessment](../classwork-assessment/SKILL.md), [AI assistance](../ai-assistant/SKILL.md), [authentication](../owlio-authentication/SKILL.md), [onboarding](../owlio-onboarding/SKILL.md), [scheduling](../schedule-calendar/SKILL.md), [learning materials](../learning-materials/SKILL.md), [attendance](../attendance/SKILL.md), [communication and notifications](../communication-notifications/SKILL.md), and [progress/reporting](../learner-progress-reporting/SKILL.md).
