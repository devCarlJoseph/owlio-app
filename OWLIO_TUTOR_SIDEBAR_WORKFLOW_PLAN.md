# Owlio Tutor Sidebar and Workflow Megaplan

Recommend a tutor-first information architecture and end-to-end workflow for one-to-one and group tutoring, including page responsibilities, ownership boundaries, current route/API status, and a backend-aware delivery roadmap.

## Objective and confirmed decisions

- Deliver a product/UX proposal, current frontend/service map, and sequenced implementation roadmap for the tutor workspace.
- Focus on private, online, and independent tutoring—not school-only teacher workflows and not ESL-specific language instruction. Keep the shared tutoring model usable across subjects such as math, programming, writing, and academic review.
- Support one-to-one and group tutoring. Plan online Meeting Room sessions plus in-person/hybrid session metadata where supported by the eventual session contract; do not require every session to use Owlio video.
- Use contextual Discussions rather than promising a direct-message inbox. Direct one-to-one/group messages remain future until product, delivery, privacy, and backend contracts exist.
- Separate tutor-only Session Notes from learner-visible, explicitly published feedback.
- Split **Materials** from **Student Progress/Insights**. Put evidence-based insight summaries with the relevant learner progress; do not mix file management with analytics.
- Do not assume a school, class roster, school gradebook, grading scale, institutional term, tutor payments, or advanced tutoring-business scheduling.
- Treat all product capabilities as planned until source and confirmed API contracts demonstrate that they are implemented. No endpoints, roles, data persistence, or permissions are to be invented.

## Recommended tutor sidebar

```text
Overview

LEARNER MANAGEMENT
- My Learners
- Learning Plans
- Activities & Evaluations

SESSIONS & COMMUNICATION
- Sessions & Schedule
- Session Attendance
- Session Notes
- Meeting Room
- Discussions
- Announcements
- Notifications

RESOURCES & PROGRESS
- Teaching Materials
- Student Progress
- AI Tutor Assistant

ACCOUNT
- Profile & Settings
```

### Recommended additions and changes

- Rename **My Students** to **My Learners**. Tutors may teach adults, individuals, or groups outside a school; “learner” avoids implying formal enrollment or a school roster. Retain “students” in product copy if that is the chosen brand vocabulary.
- Keep **Learning Plans** for goals across multiple sessions, not as a duplicate lesson/agenda editor. Put the agenda for one meeting inside its session detail.
- Rename **Assignments** to **Activities & Evaluations**. This supports practice, homework, projects, review, and tutor evaluation without implying a school-only assignment or grading system. The page can still label learner-facing work “Assignments” where appropriate.
- Add **Session Attendance**. It is an important tutor-controlled session record and should not be inferred from LiveKit presence or meeting duration.
- Move **Session Notes** beside Sessions & Communication because notes belong to a session and its learner context. Keep private notes separate from feedback intentionally published to learners.
- Keep **Meeting Room** as a standalone destination, but link to it from eligible online sessions. Do not present every scheduled tutoring appointment as an online meeting.
- Replace **Messages** with **Discussions** for contextual threads attached to a learner, group, session, or activity. Keep in-call chat transient and separate from saved discussions. Direct messages remain future.
- Add **Announcements** and **Notifications**. Announcements are tutor-authored updates to an intended learning group; notifications are service-confirmed events and links back to their source.
- Rename **Materials & Insights** to **Teaching Materials**. Keep progress and evidence-based learner insights under **Student Progress**; avoid a combined file-library/analytics destination.
- Keep **AI Tutor Assistant** clearly tutor-facing. It can help the tutor prepare plans, practice activities, and feedback drafts; do not imply an autonomous student-facing AI tutor or final evaluator.
- Do not add a separate payments, invoicing, or business-scheduling page in this plan. Product direction lists those as future enhancements; the current objective is the teaching/learning workflow.

## End-to-end tutor workflow

1. Open Overview to see upcoming sessions and any learner/activity follow-up that is backed by real data.
2. Add or open an individual learner or tutoring group; establish the tutoring relationship and permitted learner profile.
3. Set or review a multi-session Learning Plan with tutor-authored objectives, milestones, and next steps.
4. Prepare a specific session with an agenda/lesson focus, relevant Teaching Materials, and an Activity or Evaluation.
5. Schedule the session as online, in-person, or hybrid only as the service supports; attach a Meeting Room only for an online session that has a valid room.
6. Teach: join the Meeting Room if online, or use the session details for in-person/hybrid instruction. Meeting chat and presence remain live-only interactions.
7. Record Session Attendance through an explicit educator workflow, independent of whether a learner joined the video room.
8. Review learner work, provide a tutor evaluation, publish learner-visible feedback intentionally, and keep private Session Notes private.
9. Review Student Progress using sourced activities, sessions, attendance, and published evaluations without representing tutoring evaluations as institutional grades.
10. Use AI Tutor Assistant suggestions as editable drafts; the tutor remains responsible for all teaching decisions, evaluations, and learner communication.

## Page responsibilities and content

### Overview

**Purpose:** Give the tutor a practical daily starting point without displaying fabricated counts or requiring a school/classroom model.

- Upcoming one-to-one and group sessions with date/time, learner/group, subject/topic, delivery mode, and a Meeting Room action only where a valid online room is attached.
- A focused action queue for session preparation, activities to review, attendance to record, feedback drafts, and follow-up items, only when these are backed by real records.
- Quick actions to add a learner/group, create a Learning Plan, schedule a session, prepare an activity, or add a teaching resource.
- Learner progress highlights only when sourced from actual, authorized records and with a link to the learner context.
- First-use empty state: add a learner, establish a learning goal, or create a first session; include non-school language and an optional in-person/hybrid path.
- Existing route: `/tutors`. Current dashboard has “--” stats and honest empty session/AI states; no tutor dashboard query exists.

### My Learners

**Purpose:** Organize individuals and groups the tutor is authorized to teach.

- Search/filter individuals and groups, with membership/relationship status only when supported.
- Profile details appropriate to tutoring: preferred name, contact/learning context, tutor-defined goals, and relevant learner preferences. Sensitive/private fields require explicit access rules.
- A learner detail view links to that learner’s plans, scheduled sessions, activities, attendance, private notes, released feedback, materials, and progress.
- Group view shows the group’s shared learning context while preserving learner-specific submissions, notes, feedback, and attendance as individual records.
- Do not require school enrollment, grade, section, or institutional role; do not expose another tutor’s learners or records.
- Existing route: `/tutors/learners` presents sample group tabs and empty learner/submission/progress states. No learner or tutoring-group API exists.

### Learning Plans

**Purpose:** Track a learner’s or group’s longer-term tutoring goals across multiple sessions.

- Tutor-authored goals, focus topics/skills, target outcomes, milestones, and next steps, associated with one learner or an explicitly supported group.
- Link a plan to related sessions, activities, materials, and feedback; show the source/context of each activity.
- Keep a learning plan distinct from the agenda for one session and from an official school curriculum/gradebook.
- Allow progress updates only through confirmed workflows; no AI-generated or inferred mastery/level should silently change a plan.
- No Learning Plans route/service currently exists. A new role-prefixed destination (candidate: `/tutors/learning-plans`) requires a product/data contract.

### Activities & Evaluations

**Purpose:** Prepare practice and assignments, collect learner work, and record tutor-controlled evaluations and feedback.

- Cross-learner/group activity list with filters for learner/group, subject/topic, session, due date, activity type, and review state where the API supports them.
- Support flexible tutoring work: exercises, quizzes/practice, reading or project work, written/file/link submissions, demonstrations, and other contract-defined activity types.
- Activity detail contains instructions, related plan/session/materials, learner-specific responses, and any approved evaluation criteria.
- Provide a submission/review queue; tutor evaluations and feedback are controlled by the tutor. Distinguish a private observation from feedback released to the learner.
- Use the API’s status lifecycle. Do not assume that school-oriented points, grades, auto-grading, late rules, or revision windows apply to tutoring.
- Existing route: `/tutors/classwork` is explanatory copy only. Shared classroom activity forms are in-memory demo state; there is no tutor activity/submission service.

### Sessions & Schedule

**Purpose:** Manage actual tutoring appointments separately from longer-term Learning Plans.

- Session list/calendar with individual/group participant context, date/time/timezone, topic/lesson focus, duration only if the product defines it, and delivery mode: online, in-person, or hybrid only where supported.
- Session detail includes agenda, related plan, materials, activities, attendance, private notes, learner-visible feedback, and an online meeting link only where valid.
- Support recurring sessions or rescheduling only after timezone, recurrence, cancellation, and conflict rules are agreed with the product/backend.
- A scheduled session can link to the Meeting Room, but not every session should be represented as an online room.
- Existing `/tutors/sessions` is an empty UI scaffold; `/tutors/schedule` reuses a generic monthly calendar with no event data or persistence.

### Session Attendance

**Purpose:** Record tutor-controlled attendance for an individual or group session.

- Select the actual session and show its date/time and eligible learner/group roster.
- Provide only approved states and operations (for example, present/absent/late/excused if that status model is confirmed); keep individual attendance distinct within a group.
- Provide history by learner and session, with correction/audit behavior from the backend contract.
- LiveKit roster, room duration, chat, screen-share, or connectivity must not silently create official attendance. In-person/hybrid sessions need a manual or otherwise approved attendance flow.
- Existing `/tutors/attendance` is an explanatory empty state with no attendance service.

### Session Notes

**Purpose:** Capture private tutor observations tied to a specific learner/group and session.

- Private notes should have an explicit tutor-only audience, session/learner context, author, and date.
- Do not put these notes in learner-visible activity feeds, notifications, progress exports, or feedback records.
- A separate “Publish feedback” action should create or update a learner-visible feedback record only after the tutor confirms the audience and content.
- Define retention, edit/delete, access/audit, and group-session privacy rules before storing notes that may contain sensitive learner information.
- No dedicated Session Notes route or service exists. The classroom prototype’s progress/feedback data is in-memory and is not a private notes store.

### Meeting Room

**Purpose:** Provide a standalone live video/meeting page for online tutoring sessions.

- Retain a lobby/invite-code entry, active session view, opt-in microphone/camera, screen sharing, participant panel, in-call chat, hand raise, recoverable connection errors, and clean leave/end state.
- From Sessions & Schedule, link to the Meeting Room with the session’s actual meeting identifier when one exists. The standalone page remains separately reachable as requested by this product pattern.
- Restrict room creation/end to server-authorized tutor/host roles. A `/tutors` route prefix is presentation context, not permission.
- In-room chat and hand raises are transient to the active LiveKit room; they are not saved Discussions, session notes, attendance, or learner progress.
- Existing route: `/tutors/classrooms/meeting-room` uses the shared meeting-room page. The meeting service supports create/join/end and LiveKit supplies connected media/presence.

### Discussions (replaces Messages)

**Purpose:** Keep tutoring conversations attached to their subject and learning context.

- Threads may be scoped to a learner, group, session, or activity with clear author, time, audience, and reply context.
- Respect whether the context is private one-to-one or visible to a group; do not allow a private tutor note to become a discussion post.
- Direct one-to-one or group inbox messaging is not part of the first scope. Meeting Room chat remains transient and separate.
- Existing `/tutors/communication` is a shared UI preview for discussions/announcements/polls; posts and replies are not saved or delivered.

### Announcements

- Tutor-authored updates for a defined learning group/learner context, such as a session change or preparation instructions.
- Show intended audience and publication state. Scheduling, editing, deletion, and delivery confirmations depend on service support.
- Announcements are not private notes, direct messages, or notification delivery records. No announcement service currently exists.

### Notifications

- Link confirmed events to their source: invitation/membership, upcoming session, new activity, a submission, published feedback, or a discussion/announcement.
- Read/unread state, channels, reminders, and delivery claims require an API contract. Protect private notes and learner evaluation content from unauthorized previews.
- Existing `/tutors/notifications` has an empty-state preview only; notification delivery/read state is not connected.

### Teaching Materials

**Purpose:** Provide one tutor-facing resource library that can be reused across authorized learners, groups, subjects, and sessions.

- Organize tutor-owned materials by learner/group, topic/subject, learning plan, session, and resource type as supported.
- Show owner, intended audience, and current use; explicitly share a tutor-private resource before making it learner-visible.
- Support only file/link types, previews, uploads, and sharing rules defined by the backend. Do not promise external-drive integration or upload limits without a contract.
- Existing `/tutors/materials` is a shared context-selection page; there is no resource upload/browse service.

### Student Progress

**Purpose:** Show evidence-based tutoring progress for the selected learner/group without implying institutional grades.

- Summarize completed sessions, attendance, activities, tutor evaluations, published feedback, and learning-plan milestones using actual authorized records.
- Keep learner-level and group-level progress distinguishable. Group summaries must not expose a learner’s private notes or evaluation to other members.
- Label the source, date, and tutor-defined criteria. Avoid automatic mastery/grade labels or progress trends from missing/sample data.
- Include report/export only after access scope, format, and privacy contracts are approved.
- Existing `/tutors/progress` reuses a generic empty progress page; the tutor Learners page uses placeholders; no progress/report service exists. Progress insights live here rather than inside the Materials page.

### AI Tutor Assistant

**Purpose:** Assist the tutor in preparation and review; it is not an autonomous AI tutor for learners.

- Potential tutor-facing tasks: draft lesson/activity ideas, generate practice questions, adapt an explanation, organize a plan around tutor-selected goals, or draft feedback.
- Require tutor-supplied context and keep generated output clearly marked as a draft. The tutor edits and approves before using it with a learner.
- Do not autonomously contact learners, create/publish assignments, decide learner mastery, issue final evaluation, or alter progress/attendance records.
- Do not send sensitive learner/session notes to an AI provider until provider, privacy, retention, and backend service contracts are approved. Do not call an AI provider directly from the browser.
- Existing `/tutors/ai-assistant` reuses an educator-facing explanatory page; no generation provider/service is present.

### Profile & Settings

- Potential account/profile information and preferences should use the authenticated profile/settings contract; keep sign-out available.
- Define tutor-specific profile fields/preferences and notification settings before making forms editable. Do not treat onboarding subtype or `/tutors` URL context as persistent authorization.
- The dashboard currently displays the authenticated user and supports sign-out, but has no profile/settings route or profile-update service.

## Current route, API, and data-flow map

| Area | Current source | Verified implementation status |
|---|---|---|
| Tutor navigation | `src/components/common/dashboard-navigation.ts`; `src/components/common/app-sidebar.tsx` | Tutor sidebar currently has Overview, Sessions, Activities & evaluations, Attendance, Learners plus a generic Shared section (Classrooms, Schedule, Materials, Communication, Notifications, Progress, AI Assistant). The proposed grouped labels and new routes require navigation/title/search alignment. |
| Routes/layout | `src/main.tsx`; `src/pages/dashboard/layout.tsx` | Tutor routes are role-prefixed under `/tutors`; role-prefixed route guard requires authentication only. Frontend URL context is not authorization. |
| Overview | `src/pages/dashboard/tutors/index.tsx` | “--” statistics and empty upcoming-session/AI states; no tutor overview query. |
| My Learners | `src/pages/dashboard/tutors/learners/index.tsx` | Group tabs and learner/progress/submission areas are placeholder UI. No learner or group service; no real learner data is loaded. |
| Learning Plans | No current tutor route/page | Product concept needs a new role-prefixed page/component and an approved learner-plan data contract. |
| Assignments/activities | `src/pages/dashboard/tutors/classwork/index.tsx`; `src/components/features/classrooms/classroom-classwork-view.tsx`; `classroom-activity-view.tsx` | Tutor page is explanatory scaffolding. Shared classroom activity authoring/submission/review is mock/in-memory state. No tutor activity/submission API. |
| Sessions/schedule | `src/pages/dashboard/tutors/sessions/index.tsx`; `src/pages/dashboard/schedule/index.tsx` | Tutor sessions are a scaffold; generic schedule shows a month grid but loads/saves no events. No scheduling service. |
| Attendance | `src/pages/dashboard/tutors/attendance/index.tsx` | Empty explanatory view; no attendance service. |
| Session Notes | No dedicated tutor route/component/service | Must not reuse mock classroom progress as persistent private notes. |
| Meeting Room | `src/pages/dashboard/classroom/meeting-room.tsx`; `src/services/api/meeting.service.ts` | Shared full-screen page with meeting API create/join/end and LiveKit media/presence. In-call chat/hand state is transient, not saved tutoring communication or official attendance. |
| Materials | `src/pages/dashboard/materials/index.tsx` | Context cards for tutoring resources, but no browse/upload/share service. |
| Communication/notifications | `src/pages/dashboard/communication/index.tsx`; `src/pages/dashboard/notifications/index.tsx` | Preview-only conversation categories and empty notification state; no persisted posts, direct messages, delivery, or read-state service. |
| Progress/AI | `src/pages/dashboard/progress/index.tsx`; `src/pages/dashboard/ai-assistant/index.tsx` | Shared explanatory/empty-state pages; no tutor progress query or AI integration. |
| Classroom API/prototype | `src/services/api/classroom.service.ts`; `src/components/features/classrooms/classroom-prototype-provider.tsx`; `classroom-mock-data.ts` | Classroom list/create/join calls exist. Provider also seeds sample tutor class/session data and holds classroom details/actions in memory. Do not present the sample “Math Study Group” or mock attendance/work as live tutoring data. |
| API inventory | `src/services/api/` | Services exist for authentication, health, classroom list/create/join, and meeting create/join/end. No tutor learner, group, plan, session/schedule, assignment, attendance, notes, materials, communication, notification, progress, AI, billing, or settings service exists. |

The registration/onboarding role contract is still inconsistent: authentication uses account types `student` and `educator`, while onboarding has additional educator/tutor-like subtypes that are not persisted by authentication. Confirm the canonical tutor identity/profile/authorization contract before treating `/tutors` or a client-selected subtype as an access boundary.

## Delivery roadmap

### Stage 0 — Product/data contracts and access model

- Confirm tutor account/profile representation, ownership of learners/groups, invitations/membership, and backend authorization boundaries.
- Define learner versus group relationship, tutoring context, individual/group session participation, and what in-person/online/hybrid session modes are supported.
- Define Learning Plan and activity/submission data, evaluation/feedback visibility, private Session Note access/retention, attendance values/corrections, and progress evidence.
- Define timezone, recurrence, cancellation, reminders, material types/sharing, discussion audiences, announcement delivery, notification/read state, AI provider/privacy, and profile preferences before implementation.
- Defer direct messages, payments/subscriptions, tutoring-business invoicing, and advanced scheduling until separately approved.

### Stage 1 — Tutor workspace and learner relationships

- Finalize the tutor-specific grouped sidebar, navigation hrefs, page title, active-item logic, workspace search, and mobile/collapsed behavior.
- Replace fake/stat placeholder content with real service data or clear no-data/loading/error/permission states.
- Establish tutor-owned learner/group records and My Learners views with backend isolation before exposing private learner data.
- Keep current classroom list/create/join behavior verified against the API, and separate connected classroom metadata from demo classroom prototype state.

### Stage 2 — Learning Plans, sessions, and schedule

- Add learner/group Learning Plans and connect plan goals to specific sessions and activities.
- Connect Sessions & Schedule to real session records with online/in-person/hybrid mode only as supported.
- Link Meeting Room only to a valid online session; avoid treating all tutoring appointments as video meetings.
- Resolve timezone/recurrence/cancellation behavior before calendar creation or reminders.

### Stage 3 — Activities, evaluations, attendance, and notes

- Implement tutor-authored practice/assignments, learner response/submission, evaluation, and feedback with a confirmed lifecycle.
- Add session attendance separate from LiveKit connectivity, including individual attendance within a group session.
- Implement tutor-only Session Notes separately from explicit learner-facing feedback; verify access and retention policies.

### Stage 4 — Materials, communication, and progress

- Connect the Teaching Materials library with explicit owner/audience and learner sharing.
- Add contextual Discussions, Announcements, and Notifications only with confirmed save/delivery/read contracts; direct Messages remain future.
- Build Student Progress from actual sessions, attendance, activities, evaluations, and published feedback, with learner/group privacy controls.

### Stage 5 — Tutor AI and account/settings

- Add tutor-facing AI drafts after provider/privacy/backend approvals; require human review and prohibit automatic learner contact or record changes.
- Add Profile & Settings using authenticated profile/preferences services.
- Revisit payments or tutoring-business scheduling only as a separately scoped future phase.

## Acceptance criteria for this plan and later implementation

- A tutor can follow a clear workflow from learner/group relationship through Learning Plan, sessions, material/activity, teaching, attendance, notes/feedback, and evidence-based progress.
- One-to-one and group tutoring are supported where the service contract allows them; the UX does not force school classes, terms, or school grading.
- Online, in-person, and hybrid sessions are represented only according to supported session modes; a Meeting Room is linked only when a valid online room exists.
- Attendance is an educator-controlled session record, not derived from meeting participants, connection time, or in-call messages.
- Tutor-only Session Notes cannot leak into learner feedback, discussions, notifications, or progress; published feedback has an explicit audience and publication action.
- Learner/group, activity, material, attendance, and progress records are scoped to the authorized tutor and context on the backend.
- Direct Messages remain future; contextual Discussions, Announcements, and Notifications are not described as functional until services confirm persistence/delivery/read state.
- Materials has a single clear owner/context; insights live with Student Progress and derive only from real authorized records.
- AI Tutor Assistant is clearly tutor-facing, outputs editable drafts, and cannot autonomously assign work, evaluate a learner, message a learner, or mutate official records.
- Sample and in-memory classroom/tutor data are never reported as live or server-saved; each page has appropriate loading, empty, error, unavailable, and permission-denied states.
- Tutor navigation changes stay under `/tutors`, keep page title/search/active state in sync, and do not alter student, educator, or ESL navigation unless separately approved.
- No new dependencies, API routes, permissions, grade scales, file rules, or integrations are assumed without explicit approval.

## Likely application files if implementation is separately approved

- Tutor sidebar/navigation and layout mapping: `src/components/common/dashboard-navigation.ts`, `src/components/common/app-sidebar.tsx`, `src/pages/dashboard/layout.tsx`.
- Tutor routes/adapters: `src/main.tsx`; existing pages under `src/pages/dashboard/tutors/{index,sessions,classwork,attendance,learners}/`; new modules may be needed for Learning Plans, Session Notes, Announcements, and settings.
- Tutor domain views/services: create focused feature modules under `src/components/features/` for learner/group plans, activities/evaluations, attendance, private session notes, and learner-facing feedback; add `src/services/api/` modules only after backend contracts are confirmed.
- Shared workflow views: `src/pages/dashboard/classroom/`, `schedule/`, `materials/`, `communication/`, `notifications/`, `progress/`, and `ai-assistant/`.
- Existing classroom integration/prototype: `src/services/api/classroom.service.ts`, `src/components/features/classrooms/classroom-prototype-context.ts`, `classroom-prototype-provider.tsx`, `classroom-mock-data.ts`, and shared classroom views. Keep mock state clearly separated while replacing flows with approved APIs.
- Meeting integration: `src/pages/dashboard/classroom/meeting-room.tsx` and `src/services/api/meeting.service.ts`; retain transient room chat/hand boundaries and do not add persistence without an approved contract.
- No application source, route, dependency, configuration, or backend changes are included in this planning document.
