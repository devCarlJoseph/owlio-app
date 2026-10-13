---
name: owlio-core
description: Apply Owlio-wide product boundaries, frontend conventions, accessibility, and security guardrails across learning and teaching workflows.
---

# Owlio Core

Use this skill for cross-cutting product decisions or when work touches multiple Owlio experiences. Follow the [Owlio Product Plan](../../../OWLIO_PRODUCT_PLAN.md) for product vision and target workflows. `AGENTS.md`, current source, and confirmed backend contracts are authoritative for implementation status and technical behavior; the plan is not proof that a feature or API already exists.

## Product model

Owlio supports four connected experiences:

1. Student personal workspace, useful without an instructor.
2. Student-created study spaces for peer collaboration.
3. Educator-led classrooms for formal teaching.
4. Flexible tutoring and ESL classrooms for independent or group instruction.

Keep a student's personal work and peer study-space content distinct from educator-controlled classroom records. Official grades, attendance, feedback, classwork, and classroom progress belong to authorized classroom workflows. Backend authorization—not hidden controls, role selection, or client validation—is the security boundary.

## Current implementation guardrails

- The current app is a React/TypeScript Vite SPA. Keep route adapters thin, put domain behavior beside its feature, and reuse existing UI primitives.
- Dashboard role roots are `/students`, `/educators`, `/tutors`, and `/esl`. Put role-specific pages under `src/pages/dashboard/<role>/<feature>/index.tsx`; put shared page components under `src/pages/dashboard/<feature>/index.tsx` and mount them beneath each role-prefixed route so the sidebar keeps its workspace context. These route prefixes are UX context, not authorization.
- Dashboard pages are feature-specific UI scaffolds/empty states; feature data services and an auth role/session provider are not wired in this snapshot. Do not present sample values as live activity. Auth/onboarding submissions are UI-only unless current source and an approved API contract show otherwise.
- Registration currently uses `student`/`teacher`/`other`; onboarding uses `student`/`educator`/`others` with educator subtypes. Do not normalize or choose a canonical backend role without owner/backend confirmation.
- Do not invent endpoints, permissions, supported upload types, integrations, or product states. Label proposals and future functionality clearly.
- Preserve Owlio branding, existing theme tokens, responsive behavior, keyboard access, visible focus, associated labels, and useful status/error feedback.
- Never expose secrets, credentials, verification/reset tokens, raw server payloads, or private learner data in UI, logs, docs, or examples.
- AI-generated instructional or evaluation content must remain reviewable and editable by an educator; AI must not silently establish final official grades.

## Workflow

Before work, identify the user, goal, experience (personal workspace, study space, or official classroom), data owner, and current implementation/API support. Map relevant states and role boundaries, inspect the actual feature and shared components, then verify the change and report what remains planned or backend-dependent.

## Related skills

Use focused guidance for [student workflows](../student-workflows/SKILL.md), [study spaces](../study-spaces/SKILL.md), [educator classrooms](../educator-classroom/SKILL.md), [tutoring](../tutoring-workflows/SKILL.md), [ESL teaching](../esl-teaching/SKILL.md), [classwork and assessment](../classwork-assessment/SKILL.md), [AI assistance](../ai-assistant/SKILL.md), [authentication](../owlio-authentication/SKILL.md), [onboarding](../owlio-onboarding/SKILL.md), [scheduling](../schedule-calendar/SKILL.md), [learning materials](../learning-materials/SKILL.md), [attendance](../attendance/SKILL.md), [communication and notifications](../communication-notifications/SKILL.md), and [progress/reporting](../learner-progress-reporting/SKILL.md).