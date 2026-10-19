---
name: owlio-role-workflows
description: Implement Owlio student, educator, ESL teacher, and tutor dashboard workflows from the approved role plans without crossing data-ownership or backend-contract boundaries.
---

# Owlio Role Workflows

Use this skill when implementing or modifying a page, route, sidebar item, or shared feature in the student, educator, ESL teacher, or tutor dashboard.

## Purpose and authority

Implement the product workflows defined by the four role plans while preserving each role's purpose, ownership boundaries, and current implementation status. This skill is a reusable guide; the role plan contains the detailed page requirements and click flows.

Use this order when making decisions:

1. Current source and confirmed backend/API/security contracts define what exists and what is allowed.
2. `AGENTS.md` defines repository conventions and implementation guardrails.
3. The relevant role workflow plan defines intended page behavior and role-specific product decisions.
4. `OWLIO_PRODUCT_PLAN.md` provides the broader product vision.

An `E` route in a plan means the frontend route exists; it does not prove that its data or actions are backed by a service. A `P` route/action is proposed, not registered or implemented. A `D` item is intentionally disabled/planned. Never convert a proposal into a claim of current capability. If a plan, source, or contract conflicts, do not guess; explain the conflict and ask the product/backend owner when it affects the implementation.

## Workflow specifications

Read the matching plan before changing a role workflow. The plans are the page-level source for exact page sections, routes, component maps, and click-through flows:

| Workspace | Workflow plan | Primary boundary |
|---|---|---|
| Student | [Student workflow](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md) | Personal learning, peer study spaces, and official class records are separate experiences and record owners. |
| School educator | [Educator workflow](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md) | Official records belong to classes the educator is authorized to manage. |
| ESL teacher | [ESL teacher workflow](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md) | Flexible language lessons share educator workflows; the planned whiteboard is temporary and only inside an authorized live ESL Meeting Room. |
| Tutor | [Tutor workflow](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md) | Flexible one-to-one/group tutoring is not a school gradebook or institutional classroom by default. |

The student plan currently has a double underscore in its filename. Use the checked-in filename exactly; do not rename or replace user documents as part of a page implementation.

## Role-specific workflows and sidebar map

Keep the four workspaces distinct. Their URL roots are `/students`, `/educators`, `/esl`, and `/tutors`; these prefixes preserve UI context only and do not grant access.

### Student

The target sidebar groups are:

- Overview.
- Learning: My Learning, My Classes, Study Library, Study Spaces.
- Communication: Meeting Room, Discussions, Notifications.
- Academic: Calendar & Schedule, Tasks & Assessments, Progress & Grades.
- Tools & Support: AI Study Assistant, Help & Support.
- Account: Profile & Settings.

Students must be able to use personal learning without joining a class. Keep personal notes, tasks, resources, and personal progress distinct from peer-space content and educator-controlled classwork, attendance, released grades, and feedback. Students view only records released or otherwise permitted to them; do not add educator record-editing actions.

### School educator

The target sidebar groups are:

- Overview.
- Teaching & Management: My Classes, Classwork & Assessments, Students, Attendance, Gradebook.
- Communication: Meeting Room, Discussions, Announcements, Notifications.
- Planning: Lesson Planner, Calendar & Schedule, Teaching Materials.
- AI & Insights: AI Form Assistant, Teaching Insights.
- Account: Profile & Settings.

Keep classwork authoring/submission review separate from official Gradebook controls, and Attendance separate from LiveKit room presence. Class membership, grades, attendance, feedback, and reports must be scoped to authorized classes.

### ESL teacher

The target sidebar groups are:

- Overview.
- Teaching: My Learners, Lesson Plans, Teaching Materials, Activities & Assessments, Lesson Attendance.
- Live Learning: Meeting Room, Lesson Schedule.
- Communication: Discussions, Announcements, Notifications.
- Progress & AI: Learner Progress, Feedback & Notes, AI Lesson Assistant.
- Account: Profile & Settings.

Support individual and group instruction where the contract permits it. A reusable Lesson Plan is not a dated Lesson Schedule entry. Keep private teacher notes separate from learner-visible feedback. The planned whiteboard is an in-room feature only: built-in prompt objects and temporary learner actions; no saved lesson artifact, export, replay, automatic grade, attendance, or progress mutation. Do not add uploads or unrestricted freehand drawing to the initial whiteboard scope.

### Tutor

The target sidebar groups are:

- Overview.
- Learner Management: My Learners, Learning Plans, Activities & Evaluations.
- Sessions & Communication: Sessions & Schedule, Session Attendance, Session Notes, Meeting Room, Discussions, Announcements, Notifications.
- Resources & Progress: Teaching Materials, Student Progress, AI Tutor Assistant.
- Account: Profile & Settings.

Support individual and group tutoring. Treat online, in-person, or hybrid delivery as available only when the session contract supports it; link to Meeting Room only when a valid online room exists. Keep multi-session Learning Plans distinct from a session agenda. Keep Session Attendance distinct from meeting presence, and tutor-only Session Notes distinct from deliberately published learner feedback. Do not infer school terms, grade scales, payments, invoicing, or advanced business scheduling.

## Shared workflow rules

- Keep contextual information visible: the learner/group, class or study space, lesson/session, activity, resource owner, and record audience as applicable.
- Keep student-owned personal work separate from student-created peer spaces and educator-owned official classroom records. Never treat peer activity or personal task completion as a grade or official attendance.
- Educators, tutors, and ESL teachers retain control of official attendance, evaluations, feedback, and record publication within their authorized scope. A tutoring evaluation is not automatically an institutional grade.
- Keep Meetings standalone and link to them contextually. LiveKit presence, in-call chat, and hand raises are transient room interactions; they are not saved Discussions, official attendance, feedback, or progress.
- Distinguish Discussions, Announcements, and Notifications. Direct Messages are future unless the relevant plan and an approved product/service contract bring them into scope.
- Keep Teaching Materials as a resource workflow and Progress/Insights as evidence-based summaries. Resource ownership and sharing audience must be explicit.
- AI output for educators, ESL teachers, and tutors remains a clearly labeled, editable draft until the human reviews and accepts it. Do not silently publish, assign work, contact learners, set mastery, finalize grades/evaluations, or mutate records. Do not call AI providers directly from the browser or send sensitive learner data without an approved service and privacy contract.
- Use the status and fields provided by the real service. Do not invent status transitions, grading policy, language-level frameworks, upload formats, session modes, notification delivery, permissions, or persistence.
- Do not label mock, sample, in-memory, or browser-local data as server data or account-synced state.

## Page and component implementation

Before editing:

1. Identify the workspace, page, user goal, data owner, and audience.
2. Read the matching workflow plan's page section, route inventory, component map, flowchart, and acceptance criteria.
3. Inspect `src/main.tsx`, `src/components/common/dashboard-navigation.ts`, the relevant page/feature components, `src/components/ui/`, and the actual API service/contract.
4. Confirm whether each route and operation is existing, proposed, disabled, UI-only, browser-local, or service-backed.
5. Keep the change within the requested feature and avoid unrelated role/page changes.

Architecture rules:

- Register routes in `src/main.tsx`; keep workspace URLs role-prefixed and in sync with sidebar links, page titles, active matching, and header search.
- For new or refactored route folders, use only a thin `index.tsx` adapter under `src/pages/dashboard/<role>/<feature>/`. It should import and render the feature view, not own substantial JSX, forms, business rules, mock arrays, or data orchestration.
- Put role-specific screen composition, state, forms, schemas, and sections in the feature location specified by the relevant plan under `src/components/features/`. Put shared domain-neutral controls in `src/components/ui/`.
- Preserve shared feature behavior when a page is mounted under multiple role prefixes. Do not silently migrate legacy shared route files or restructure another role while implementing a single-role page.
- Reuse the checked-in Base UI-backed shadcn-style wrappers. Inspect their actual APIs; do not assume a Radix-only prop or a wrapper that is not present. Use `@/*` imports and current theme tokens.
- A sidebar destination without a registered route must remain non-navigable/planned; never use a fake `href` or create a dead link. Route visibility and client-side role detection are not authorization.
- Keep tabs, filters, dialogs, drawers, and same-page actions on the current URL unless the role plan explicitly defines a route transition.

## Design and interaction requirements

- Use semantic controls, associated labels, keyboard-operable interactions, visible focus, accessible names, and concise status/error feedback.
- Keep layouts responsive and preserve equivalent touch, pointer, and keyboard paths. Account for reduced motion if adding animation.
- Define applicable loading, first-use empty, filtered-empty, unavailable, recoverable error, and permission-denied states. Do not use skeletons as permanent content.
- Mutations must have pending, server-confirmed success, and recoverable failure behavior when a service exists. Do not show save/publish/join/check-in/delivery success from local UI state alone.
- Keep record audience explicit before publish/share actions. Avoid exposing private notes, grades, feedback, learner identity, or resource details in unrelated views and notification previews.
- Use textual descriptions with charts or status colors; do not rely on color alone.
- Use existing components and form conventions. Do not add dependencies or configuration changes without approval.

## Data, security, and product constraints

- The backend enforces role, membership, ownership, and record-level authorization. A route prefix, disabled button, form validation, or hidden control is not a security boundary.
- Query actual services before representing an operation as available. Existing classroom list/create/join and meeting create/join/end integrations do not imply that roster, classwork, attendance, materials, messaging, scheduling, progress, AI, or settings APIs exist.
- Do not expose secrets, `.env` values, auth/session tokens, meeting credentials, or private learner data. Do not store meeting credentials or transient room state in browser storage.
- ESL whiteboard behavior remains temporary and room-scoped under the ESL plan. Do not persist or replay board actions or feed them into attendance, grades, submissions, feedback, progress, or AI.
- Ask for clarification when a missing contract or ambiguous ownership/audience/status would change the data model, permissions, persistence, or user-visible behavior. Do not make a plausible guess.

## Validation checklist

Before handoff, verify:

- The implementation matches the correct role plan and preserves the role-specific purpose and sidebar grouping.
- Every clickable link is a registered, role-prefixed route or an explicitly approved contextual destination; planned items do not navigate to missing routes.
- Page transitions match the relevant plan's flowchart; tabs, dialogs, filters, and other same-page actions do not imply a route change.
- Route titles, active sidebar state, and header search remain coherent, including nested paths.
- Personal, peer-space, classroom, tutoring, private-note, published-feedback, attendance, progress, and resource ownership remain correctly separated.
- UI does not overstate service support; sample/local data and server-confirmed data are distinguishable.
- Loading, empty, error, unavailable, and permission states are present where applicable.
- Keyboard, focus, labels, semantics, responsive layouts, and touch interactions work for the changed flow.
- Any meeting-room change preserves opt-in media and treats presence/chat as transient. Any ESL whiteboard change meets the room-only, temporary, built-in-prompt constraints and approved transport contract.
- Run focused lint on changed code, `npm run build`, repository lint when feasible, and `git diff --check`. Run the relevant automated or manual flow checks available in the project. Report tests and checks actually run; do not claim unrun tests passed.

## Related focused skills

Use the relevant domain skill in addition to this workflow guide:

- Student pages: [student-workflows](../student-workflows/SKILL.md); peer collaboration: [study-spaces](../study-spaces/SKILL.md).
- Educator, ESL, and tutoring pages: [educator-classroom](../educator-classroom/SKILL.md), [esl-teaching](../esl-teaching/SKILL.md), and [tutoring-workflows](../tutoring-workflows/SKILL.md).
- Shared features: [classwork-assessment](../classwork-assessment/SKILL.md), [attendance](../attendance/SKILL.md), [communication-notifications](../communication-notifications/SKILL.md), [learning-materials](../learning-materials/SKILL.md), [schedule-calendar](../schedule-calendar/SKILL.md), [meeting-room](../meeting-room/SKILL.md), [learner-progress-reporting](../learner-progress-reporting/SKILL.md), and [ai-assistant](../ai-assistant/SKILL.md).
- Consult [owlio-authentication](../owlio-authentication/SKILL.md) or [owlio-onboarding](../owlio-onboarding/SKILL.md) only when a task actually touches account entry or onboarding.
