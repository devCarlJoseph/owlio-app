---
name: student-workflows
description: Implement Owlio student pages from the approved student workflow while preserving independence, peer-space ownership, and official classroom record boundaries.
---

# Student Workflows

Use for any student dashboard page or interaction under `/students`. Read the [student workflow plan](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md) for the detailed page outlines, route statuses, component map, click-through flows, roadmap, and acceptance criteria. Its filename currently contains a double underscore; use it as checked in.

`AGENTS.md`, current source, and confirmed API/security contracts determine implementation status. The plan is the target workflow, not proof that a route, service, permission, or action exists. For shared page architecture and cross-role guardrails, also follow [owlio-role-workflows](../owlio-role-workflows/SKILL.md) and [owlio-core](../owlio-core/SKILL.md).

Use the [product-level Student workspace](../../../OWLIO_PRODUCT_PLAN.md#41-student-workspace) to connect this workflow to shared teaching capabilities, and the student plan's [delivery roadmap](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md#delivery-roadmap) for the independence-first sequence. Preserve its [acceptance criteria](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md#acceptance-criteria-for-the-proposal-and-later-implementation) for each delivered slice.

## Student purpose and sidebar

Owlio must remain useful to a student who has not joined a class. The target sidebar makes personal learning, educator-led classes, and peer collaboration separate contexts:

- Overview.
- Learning: My Learning, My Classes, Study Library, Study Spaces.
- Communication: Meeting Room, Discussions, Notifications.
- Academic: Calendar & Schedule, Tasks & Assessments, Progress & Grades.
- Tools & Support: AI Study Assistant, Help & Support.
- Account: Profile & Settings.

Keep Overview focused on the next useful action across personal learning and joined classes. My Learning is a distinct, student-owned workspace and must be useful without class membership; do not turn it into a second dashboard.

## Page workflows

- My Learning organizes the student's own subjects, notes, personal tasks, and personal resources. A personal subject or plan is not an educator's official course.
- My Classes is the entry to joined school, college, tutoring, or ESL learning contexts. Show authorized materials, sessions, classwork, discussions, attendance visibility, released results, and feedback only when the relevant service and permissions support them.
- Study Library identifies the source and owner of every resource: student-owned, educator-published, or peer-shared. Notes are not interchangeable with files, submissions, or class materials.
- Study Spaces are student-created peer collaboration. Keep members, tasks, notes, discussions, polls, and resources scoped to that space; they do not create official grades, attendance, teacher feedback, or classroom progress.
- Tasks & Assessments must visibly separate student-owned personal tasks from educator-assigned classwork. Personal task completion never edits an educator activity, submission status, or official result.
- Calendar & Schedule distinguishes personal study blocks from class sessions and educator-assigned due dates. Event links return to the owning task, class, or session.
- Progress & Grades separates personal learning history from official classroom results. Show only released grades/evaluations, feedback, and attendance the student is permitted to view, with source and class context.
- Meeting Room is a standalone destination with a lobby/join state and active call state. Class/session links may preselect a valid room but must not replace the standalone page. LiveKit presence, chat, and hand raises are transient, not saved class discussions or attendance.
- Discussions are contextual to a class, lesson, activity, or study space. Direct Messages are future unless separately approved with delivery, membership, privacy, and moderation contracts. Notifications link back to their source and expose read/delivery state only when supported.
- AI Study Assistant is student-specific and must not be a relabelled educator assistant. It remains unavailable until its scope, safety, privacy, data-source, and service requirements are approved. Help & Support and Profile & Settings remain planned until routes and services exist.

## Ownership and access rules

- Student-owned notes, tasks, personal resources, and personal learning activity belong to the student.
- Study-space content belongs to the peer space and follows its membership/visibility contract.
- Educator-controlled classwork, submissions, attendance, grades/evaluations, feedback, announcements, and class progress remain official class records.
- Do not conflate these record types or mutate them as if they share an owner. Cross-context Overview, library, calendar, or progress views may surface them together only with distinct scopes, sources, and visibility rules.
- Backend authorization enforces classroom, space, and resource access. A `/students` URL, hidden button, client validation, or local membership state is not authorization.
- Never expose another learner's records or private educator feedback. On revoked or unavailable access, show a safe state without leaking record details.

## Implementation guidance

- Keep student URLs under `/students`; register routes in `src/main.tsx` and synchronize `dashboard-navigation.ts`, titles, active matching, and header search.
- For new or refactored route folders, keep only a thin `index.tsx` adapter. Put screen sections, forms, state, schemas, and data orchestration in the student feature location specified by the plan under `src/components/features/`.
- Keep same-page tabs, filters, dialogs, and drawers on the current URL unless the plan defines a route transition. A proposed/disabled destination must not become a dead link.
- Reuse checked-in `src/components/ui/` wrappers and inspect their Base UI APIs. Do not assume a Radix-only prop or an unavailable primitive.
- Check runtime mode as well as source: `src/lib/api-mode.ts` currently pauses API requests and bypasses auth/role guards for UI previews. Personal/local state and preserved classroom/meeting clients do not establish account sync or shared collaboration. Re-check source, runtime mode, and service contracts before describing an action as live or saved.
- Do not add file formats, sharing rules, course/grade concepts, routes, endpoints, or permissions that are not in the plan or approved contract.

## UX and validation

- Preserve independent first-use flows with meaningful empty states; class membership is optional.
- Show distinct loading, empty, filtered-empty, unavailable, error/retry, and permission-denied states where applicable.
- Confirm a server save, join, submit, or mark-read action only after the responsible service confirms it. A browser-local save may report local success after storage succeeds, but must remain clearly distinct from account sync or collaboration.
- Keep controls semantic, labeled, keyboard-operable, visible-focus, responsive, and usable with touch. Preserve equivalent keyboard/pointer paths.
- Check navigation against the plan's click-flow diagrams. Every route destination must be registered or clearly proposed/disabled, and same-page actions must remain same-page.
- Verify that personal, peer-space, and official-class records remain separate through lists, detail views, notifications, and progress summaries.
- Run focused lint, `npm run build`, repository lint, and `git diff --check` as appropriate for the change. Report only checks actually run.

Use [study-spaces](../study-spaces/SKILL.md) for peer-space membership/collaboration, [classwork-assessment](../classwork-assessment/SKILL.md) for assigned work, [learning-materials](../learning-materials/SKILL.md) for resource ownership, [meeting-room](../meeting-room/SKILL.md) for live-session behavior, and [learner-progress-reporting](../learner-progress-reporting/SKILL.md) for student progress/results.
