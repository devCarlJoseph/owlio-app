---
name: educator-classroom
description: Implement the school educator classroom workflow from its approved plan while protecting authorized class records and separating teaching, attendance, and grading responsibilities.
---

# School Educator Workflow

Use for school educator dashboard pages under `/educators`. Read the [educator workflow plan](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md) for the page requirements, route/component map, Mermaid click flows, staged roadmap, and acceptance criteria. The plan is school-educator-first. Shared classroom patterns may also serve tutors and ESL teachers, but use their specialized skills for those workspaces.

`AGENTS.md`, current source, and confirmed backend contracts define what is implemented and authorized. The workflow plan describes target behavior, not proof of an API or permission. Follow [owlio-role-workflows](../owlio-role-workflows/SKILL.md) for shared route/component and cross-role rules, and [owlio-core](../owlio-core/SKILL.md) for product-wide safeguards.

## Purpose and sidebar

The school educator workflow supports a path from class setup and lesson planning through instruction, classwork review, attendance, official results, communication, and evidence-based insights. The target sidebar is:

- Overview.
- Teaching & Management: My Classes, Classwork & Assessments, Students, Attendance, Gradebook.
- Communication: Meeting Room, Discussions, Announcements, Notifications.
- Planning: Lesson Planner, Calendar & Schedule, Teaching Materials.
- AI & Insights: AI Form Assistant, Teaching Insights.
- Account: Profile & Settings.

## Page responsibilities

- Overview surfaces today's/upcoming classes and lessons and sourced actions needing attention; never fabricate counts or progress.
- My Classes is the root for educator-owned/authorized classes, enrollment, roster, lessons, materials, classwork, communication, attendance, and results. Use only supported creation and invitation methods.
- Classwork & Assessments owns educator-authored activity drafts, publication, submission review, and feedback. Respect the actual server lifecycle and supported activity/evaluation criteria.
- Students is a class-scoped directory. Show only learner records the educator is authorized to review; avoid unscoped cross-class aggregation.
- Attendance is an official session record. Use supported statuses and confirmation/audit rules; treat student check-in as a separate optional workflow only where approved. Never infer attendance from LiveKit presence, duration, chat, or hand raises.
- Gradebook is separate from Attendance and Classwork. It presents official results from source activities under confirmed school grading/release policy; do not invent weights, scales, calculations, terms, or overrides.
- Meeting Room remains a standalone page; class/session actions may deep-link into a valid room. In-call chat and hand raises are transient, not saved Discussions or official records.
- Discussions are contextual to a class, lesson, or activity. General direct Messages are future unless separately approved.
- Announcements are educator-authored notices with an explicit audience. Notifications are service-confirmed events that link to their source; do not conflate publication with delivery.
- Lesson Planner connects a class's objectives, lesson notes, materials, classwork, schedule, and meeting context where supported. Keep it distinct from Calendar & Schedule.
- Teaching Materials is one library destination, with owner, class/lesson context, and sharing audience explicit. Educator-private drafts are not learner-visible by default.
- AI Form Assistant should be reachable from both the form builder and its sidebar destination. It creates reviewable authoring drafts; educator approval is required before saving/publishing, and a target class is required before publication. AI cannot autonomously assign, grade, message, or mutate records.
- Teaching Insights summarizes real authorized class activity with source/date context. It is decision support, not a gradebook, risk score, or definitive student label.
- Profile & Settings is editable only for fields backed by authenticated profile/preferences services; retain shared sign-out behavior.

## Classroom lifecycle

The shared classroom model can serve school, tutoring, and ESL instruction. For this skill, follow the school educator plan; defer flexible tutor/ESL-specific class size, session, and language needs to their specialized skills. The plan describes class setup, supported enrollment, lessons, materials, classwork, attendance, discussions, announcements, grades/evaluations, feedback, and progress. Treat individual fields, routes, join methods, and integrations as proposals unless verified in current source and an approved API contract.

Keep actions and content attached to the correct classroom or lesson. A lesson-centered view may bring together lesson information, meeting details, materials, activities, attendance, discussion, and educator notes, but only show capabilities that are actually implemented.

## Educator control and learner access

Educators manage classrooms they own or are authorized to manage. Classroom records (official classwork, submissions, grades/evaluations, attendance, feedback, and progress) must be isolated by classroom membership and enforced by the backend. Learners see permitted materials and activities, submit work, participate, and view released feedback/results; they must not gain educator controls through UI changes.

Keep classwork authoring/review, Gradebook, and Attendance as separate but linked workflows. Keep private educator notes out of learner-visible feedback, class discussions, notifications, and reports. Meeting Room presence and chat never become attendance, saved communication, or progress.

Use [tutoring workflows](../tutoring-workflows/SKILL.md) and [ESL teaching](../esl-teaching/SKILL.md) for their distinct session and learner needs. Use [scheduling](../schedule-calendar/SKILL.md), [materials](../learning-materials/SKILL.md), [attendance](../attendance/SKILL.md), [classwork and assessment](../classwork-assessment/SKILL.md), [communication](../communication-notifications/SKILL.md), [meeting-room](../meeting-room/SKILL.md), [progress/reporting](../learner-progress-reporting/SKILL.md), and [AI assistance](../ai-assistant/SKILL.md) for focused domain rules.

## Implementation checks

Confirm ownership, membership, class scope, and permitted actions before encoding assumptions. At the plan snapshot, classroom list/create/join and Meeting Room create/join/end have API services. Roster, classwork/submissions, attendance, Gradebook, lesson planning, schedule, materials, discussions, announcements, notifications, insights, AI, and profile settings are not established as working services by their UI previews; re-check current source and contracts.

Keep new/refactored route directories to a thin `index.tsx` adapter and put page components/state in the feature locations mapped by the plan. Keep routes, sidebar labels, page title, active matching, and header search aligned; a proposed route is not registered, and a missing destination must remain disabled/planned rather than becoming a dead link.

Include applicable loading, empty, filtered-empty, unavailable, error/retry, and permission-denied states. Use accessible labels, keyboard-operable controls, visible focus, responsive layouts, and text alternatives for charts/status colors. Show successful mutations only after server confirmation. Ask rather than guessing if school structure, grading/release, attendance, ownership, or reporting contracts are unclear.
