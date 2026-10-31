---
name: tutoring-workflows
description: Implement tutor pages from the approved tutoring workflow, preserving flexible sessions, private notes, learner-visible feedback, and non-school records.
---

# Tutor Workflow

Use for tutor dashboard pages under `/tutors`, not ESL-specific language instruction. Read the [tutor workflow plan](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md) for page requirements, route statuses, component placement, click flows, roadmap, and acceptance criteria.

The plan describes target behavior, not proof of implementation. Current source and confirmed API/security contracts decide what exists. Follow [owlio-role-workflows](../owlio-role-workflows/SKILL.md), [educator-classroom](../educator-classroom/SKILL.md) for shared classroom behavior, and [owlio-core](../owlio-core/SKILL.md) for product-wide rules.

Use the [product-level Tutor workspace](../../../OWLIO_PRODUCT_PLAN.md#44-tutor-workspace) for shared feature relationships, the tutor plan's [delivery roadmap](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md#delivery-roadmap) for staging, and its [acceptance criteria](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md#acceptance-criteria-for-this-plan-and-later-implementation) for each delivered slice. Shared educator safeguards do not impose school terms, Gradebook, or institutional grading on tutoring.

## Purpose and sidebar

Support independent tutoring across subjects without requiring a formal institution, school roster, school gradebook, school term, or fixed timetable. Support one-to-one and group tutoring where the product and backend contracts permit it.

The target sidebar is:

- Overview.
- Learner Management: My Learners, Learning Plans, Activities & Evaluations.
- Sessions & Communication: Sessions & Schedule, Session Attendance, Session Notes, Meeting Room, Discussions, Announcements, Notifications.
- Resources & Progress: Teaching Materials, Student Progress, AI Tutor Assistant.
- Account: Profile & Settings.

## End-to-end tutor workflow

1. Review upcoming sessions and sourced follow-up actions in Overview.
2. Add or open an authorized individual learner or tutoring group.
3. Create or review a multi-session Learning Plan with tutor-authored goals, milestones, and next steps.
4. Prepare a session agenda and connect relevant materials, activities, and evaluation context.
5. Schedule online, in-person, or hybrid only where supported. Link Meeting Room only when a valid room exists for an online session.
6. Teach, then record Session Attendance explicitly rather than inferring it from room presence.
7. Review learner work, keep private Session Notes private, and deliberately publish learner-visible feedback.
8. Review Student Progress from actual authorized sessions, attendance, activities, evaluations, and published feedback.
9. Use AI Tutor Assistant output only as a tutor-reviewed draft.

## Page-specific requirements

- My Learners distinguishes individuals and groups and keeps learner-specific records private to the authorized tutor relationship.
- Learning Plans track goals across sessions; they are not a single-session agenda, formal school curriculum, or gradebook. AI or inferred mastery must not silently change a plan.
- Activities & Evaluations supports tutor-authored practice/work only as contractually supported. Use actual status/evaluation lifecycle; do not assume school points, grades, auto-grading, late rules, or revision windows.
- Sessions & Schedule represents actual appointments with learner/group, date/time/timezone, topic, and delivery mode only as supported. Recurrence, rescheduling, cancellation, duration, reminders, and conflict rules need defined contracts.
- Session Attendance records eligible learners for the actual session, including individuals within a group, using approved states/corrections. LiveKit roster, duration, chat, screen sharing, or connectivity is not official attendance.
- Session Notes are tutor-only and linked to a learner/group and session. Keep them out of learner feeds, discussions, notifications, progress, exports, and feedback records. A separate explicit publish action creates learner-visible feedback only after audience/content confirmation.
- Meeting Room remains standalone. In-call chat and hand raises are transient and separate from saved Discussions, notes, attendance, feedback, and progress. Only server-authorized permissions allow room creation/ending.
- Discussions are contextual to a learner, group, session, or activity. Announcements are tutor-authored notices for a defined audience; Notifications are confirmed event links. Direct Messages remain future.
- Teaching Materials is one tutor resource library with owner/audience explicit; share private resources deliberately. Keep progress insights under Student Progress.
- Student Progress cites sources, dates, and tutor-defined criteria. Keep group and individual progress distinct; never expose one learner's private notes/evaluation to group members or call tutoring evaluations institutional grades.
- AI Tutor Assistant is tutor-facing, not autonomous learner AI. Drafts may support preparation/activity/feedback; the tutor reviews and edits before use. AI cannot contact learners, assign work, finalize evaluations, determine mastery, or alter records.
- Follow [AI assistance](../ai-assistant/SKILL.md) for the initial English-only, user-entered-context scope; exclude learner names, records, private notes, and submissions. Never call a model runtime directly from the browser.
- Profile & Settings exposes only supported authenticated profile/preferences fields and persistence. Keep sign-out in the shared shell.

## Tutoring-specific context

Support the product's planned variations in class size (individual or group), learner level, session format, frequency, schedule, lesson materials, activities, attendance, evaluations, feedback, and learner progress. Keep a clear distinction between a scheduled session/lesson and longer-lived classroom membership when the product contract defines both.

Educators retain control over learner evaluations and feedback. Students/learners can access only records and activities permitted for their membership. Tutoring evaluations may be flexible, but do not silently treat them as school grades or official institutional records.

## Design guidance

- Use adaptable labels such as “learner,” “session,” or “learning group” where appropriate; do not require a school, grade, or institution.
- Make one-to-one and group formats possible only where supported by the feature/API contract.
- Keep learner-specific materials, session history, attendance, and progress scoped to the correct educator and learning context.
- Treat schedules, meeting links, AI activity suggestions, and payment/business features as unavailable unless their integrations are explicitly implemented. Payments and advanced tutoring-business scheduling are future enhancements in the product plan.

Use [educator classroom](../educator-classroom/SKILL.md) for shared classroom boundaries, [scheduling](../schedule-calendar/SKILL.md) for time-related workflows, and [progress/reporting](../learner-progress-reporting/SKILL.md) for learner records.

## Implementation and validation

- Keep routes under `/tutors`; register routes in `src/main.tsx` and synchronize sidebar labels, page title, active state, and header search. `E` is an existing frontend route, `P` proposed, and `D` disabled/planned; none of these alone proves a backend operation exists.
- New/refactored route directories contain only a thin `index.tsx` adapter. Put screen sections, state, forms, schemas, and data orchestration in the feature components mapped by the plan. Avoid unrelated shared-route migrations.
- Recheck current source rather than copying route-status snapshots: tutor Learning Plans, Session Notes, Announcements, and Settings already have frontend routes, but a route is not persistence. `src/lib/api-mode.ts` currently pauses requests; preserved classroom/meeting clients and local previews do not establish connected tutor learner, plan, session, evaluation, notes, progress, AI, or settings workflows.
- Backend authorization enforces tutor ownership, learner/group membership, and record visibility. `/tutors` paths and client controls are not authorization.
- Do not add payments, invoicing, or advanced tutoring-business scheduling without separate approval. Do not invent endpoints, learner levels, grade scales, file policies, session modes, or retention rules.
- Provide applicable loading, empty, filtered-empty, unavailable, error/retry, and permission-denied states. Show mutation success only after server confirmation; label demo/local data honestly.
- Use accessible labels, visible focus, keyboard/touch paths, responsive layouts, and text alternatives for charts/status colors. Follow the plan's click flows; missing routes remain disabled rather than dead links.
- Run focused lint, `npm run build`, repository lint, and `git diff --check` as appropriate. Report checks actually run and any backend or product decisions still open.
