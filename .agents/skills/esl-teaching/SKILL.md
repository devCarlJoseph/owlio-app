---
name: esl-teaching
description: Implement ESL teacher pages from the approved lesson workflow, including private-versus-published feedback and the constrained temporary Meeting Room whiteboard.
---

# ESL Teaching

Use for ESL teacher dashboard pages under `/esl`. Read the [ESL teacher workflow plan](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md) for page requirements, route statuses, component placement, click flows, whiteboard constraints, and acceptance criteria. ESL teachers use shared educator classroom concepts, but language instruction does not by itself define a separate authorization role.

The plan describes target behavior, not proof of implementation. `AGENTS.md`, current source, and approved role/API/realtime contracts govern availability. Do not infer ESL authorization from a route prefix or onboarding selection. Also follow [owlio-role-workflows](../owlio-role-workflows/SKILL.md), [educator-classroom](../educator-classroom/SKILL.md) for shared record rules, and [owlio-core](../owlio-core/SKILL.md).

## Purpose and sidebar

Support ESL teachers and learners in a flexible language-learning workflow, including one-to-one and group instruction where contracts permit it. Do not require a school timetable, conventional grading scale, or unapproved language-level framework.

The target sidebar is:

- Overview.
- Teaching: My Learners, Lesson Plans, Teaching Materials, Activities & Assessments, Lesson Attendance.
- Live Learning: Meeting Room, Lesson Schedule.
- Communication: Discussions, Announcements, Notifications.
- Progress & AI: Learner Progress, Feedback & Notes, AI Lesson Assistant.
- Account: Profile & Settings.

## End-to-end lesson workflow

Use authorized learner/group context to prepare a reusable Lesson Plan, select or share Teaching Materials, prepare an Activity or Assessment, schedule the dated lesson, open its valid Meeting Room, then record attendance and review learner work. Keep Lesson Plans distinct from Lesson Schedule: the former is reusable preparation; the latter is a dated session.

## Page responsibilities

- Overview surfaces upcoming lessons and sourced follow-up actions without invented language-level metrics.
- My Learners distinguishes individual learners from groups and shows records only in the teacher's authorized learning context. Do not infer CEFR/proficiency from AI, activity, attendance, or speech.
- Lesson Plans capture educator-authored objectives, supported language skills, activity sequence, materials, practice/review, and notes. Adapting a plan must not unintentionally overwrite its source.
- Teaching Materials is one contextual library. Show owner, audience, and lesson/activity context; teacher-private material requires explicit sharing before learners can see it.
- Activities & Assessments connect practice or assessed work to its learner/group and lesson. Do not convert conversation practice into a grade; use only contract-defined response and evaluation states.
- Lesson Attendance is an educator-controlled session record. LiveKit presence, duration, chat, and whiteboard actions are not attendance or engagement.
- Lesson Schedule owns dated sessions and time context, not reusable plans. Do not assume timezone, recurrence, reminders, cancellation, or calendar sync.
- Discussions are contextual to a learner/group, lesson, class, or activity. Announcements are authored notices; Notifications link confirmed events to their source. Direct Messages remain future.
- Learner Progress cites actual activities/results, dates, and teacher-defined criteria. Do not infer language proficiency or present a school gradebook by default.
- Feedback & Notes separates educator-private notes from learner feedback that is intentionally published with an explicit audience.
- AI Lesson Assistant produces editable teacher-reviewed drafts. It cannot silently publish, assign, grade, message learners, set proficiency, or alter progress/attendance.
- Do not send private learner/lesson data to an AI provider without approved consent, privacy, retention, and backend contracts; never call an AI provider directly from the browser.
- Profile & Settings fields are editable only if authenticated profile/preferences contracts support them.

## Meeting Room and whiteboard

Meeting Room remains a standalone full-screen destination. Media is opt-in; participant access and room creation/ending are server-authorized. In-call chat and hand raises are transient and must not become saved Discussions, notes, attendance, or learner records.

The proposed ESL whiteboard is a live tool inside an authorized, connected ESL Meeting Room only:

- Use teacher-authored built-in prompts/simple objects. Learners can select, click, circle, or mark the target. Attribute actions using authorized connected-room identity, not color alone.
- Keep teacher prompt content separate from each learner's response. The teacher can start/replace and clear/reset prompts; learner actions cannot alter the prompt or another learner's response.
- Keep board state temporary, room-scoped, and in memory. Clear it on board/session end or leave. Never persist, export, replay, grade, notify, report, or feed responses into attendance, activities, feedback, progress, or AI.
- Do not add uploads, screenshots, or unrestricted freehand drawing to the initial scope. Provide keyboard and touch alternatives to drag-only or color-only interactions.
- The ESL plan reprioritizes a constrained whiteboard while the main product plan still lists collaborative whiteboards as future work. Treat it as proposed until priority and realtime authorization/transport are approved.
- Before implementation, resolve event authorization, ordering/deduplication, rate/payload limits, late-join/reconnect resynchronization, failed publish, concurrent actions, and cleanup. If LiveKit packets cannot support the approved behavior, stop and agree on a suitable realtime contract rather than presenting unsynchronized UI as collaborative.

## Data and implementation boundaries

- Keep learner, group, lesson, activity, attendance, note, feedback, and resource records attached to their authorized context and audience. Backend authorization is authoritative.
- Do not assume language-level taxonomies (including CEFR), curriculum alignment, supported file types, assessment policy, notification delivery, or API endpoints.
- At the plan snapshot, ESL-specific learner, lesson-plan, activity, attendance, material, communication, feedback, progress, AI, and settings services are absent. Meeting APIs/LiveKit exist, but no whiteboard implementation does; re-check current source before claiming capability.
- Keep new/refactored route directories to a thin `index.tsx` adapter and put page behavior in the feature locations mapped by the plan. Preserve role-prefixed routes and shared meeting/classroom behavior.
- Show applicable loading, empty, unavailable, error/retry, and permission-denied states. Confirm saves/publishing/check-in only after service confirmation; label demo data honestly.
- Use existing UI wrappers, semantic labels, visible focus, keyboard/touch support, responsive layouts, and text alternatives for chart/color information.
- Ask when missing level, ownership, visibility, retention, evaluation, or realtime details change user-visible behavior; do not infer them.

Validate changes against the plan's click flows and acceptance criteria. Run focused lint, `npm run build`, repository lint, `git diff --check`, and appropriate multi-client whiteboard checks when relevant. Report what could not be verified.

Use [tutoring-workflows](../tutoring-workflows/SKILL.md) for tutor-specific context and [attendance](../attendance/SKILL.md), [classwork-assessment](../classwork-assessment/SKILL.md), [learning-materials](../learning-materials/SKILL.md), [schedule-calendar](../schedule-calendar/SKILL.md), [communication-notifications](../communication-notifications/SKILL.md), [meeting-room](../meeting-room/SKILL.md), [learner-progress-reporting](../learner-progress-reporting/SKILL.md), and [ai-assistant](../ai-assistant/SKILL.md) for shared domains.
