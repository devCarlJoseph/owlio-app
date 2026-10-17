# Owlio Student Sidebar and Workflow Megaplan

Recommend a student-first navigation and page-content model that preserves Owlio's independent-learning promise, separates peer and official classroom records, maps the proposal to the current frontend, and sequences future work by backend readiness.

## Objective and agreed scope

- Deliver a product/UX proposal plus a current-state map and staged roadmap for the student workspace and shared experiences students use.
- Use the full Owlio product vision as the target, but clearly distinguish shipped integrations, local/demo prototypes, and future product capabilities.
- Keep the work student-first. Include shared classroom, calendar, meeting, communication, materials, notification, and progress behavior only where it affects the student journey.
- Treat general direct Messages as a future capability, not a working destination in the first student navigation.
- This is a planning deliverable, not permission to edit application source. No API routes, permissions, data behavior, dependencies, or backend contracts are to be invented.

## Recommendation

Keep the requested high-level sections, but make the student navigation express three different contexts: personal learning, educator-led classes, and peer collaboration. Do not put every feature in the sidebar merely because it exists in the product vision.

```text
Overview

LEARNING
- My Learning
- My Classes
- Study Library
- Study Spaces

COMMUNICATION
- Meeting Room
- Discussions
- Notifications

ACADEMIC
- Calendar & Schedule
- Tasks & Assessments
- Progress & Grades

TOOLS & SUPPORT
- AI Study Assistant
- Help & Support

ACCOUNT
- Profile & Settings
```

### Changes from the draft sidebar

- Keep **Overview** as a cross-workspace daily landing page; make **My Learning** a distinct personal-workspace hub, not a second dashboard. The personal hub should be useful with zero classes joined.
- Promote **My Classes** to a primary student destination. It is the entry to enrolled school, college, tutoring, and ESL learning spaces; "classroom" remains an adaptable product concept, while the student-facing label can be "Classes."
- Move **Study Spaces** from Communication into Learning. A student-created peer space is a learning context, not an official classroom and not a general messaging inbox.
- Replace **Messages** with **Discussions** for the active product concept. Discussions and announcements stay attached to a specific class, lesson, or study space. Add direct Messages only after product and API contracts define delivery, membership, privacy, and moderation.
- Keep **Meeting Room** as a dedicated standalone page and an explicit sidebar destination. It should have a lobby/entry state where a student can join using a valid invite/code, then transition into the live room on that same page. Class and calendar actions may deep-link to this page with the relevant room preselected; they complement rather than replace the standalone page. Do not imply that a room history, scheduled meeting list, or student room-creation permission exists unless supported by product/API contracts.
- Keep **Tasks & Assessments** as one discoverable student entry only if the page visibly separates "My personal tasks" from "Educator-assigned classwork." Do not merge their ownership, completion states, or official record semantics.
- Add **Help & Support** and **Profile & Settings** as target-product destinations, but mark them as future until routes, content, and account services exist.
- Keep **AI Study Assistant** student-specific in its experience and wording. The current shared AI screen describes educator preparation, so it cannot simply be relabeled as a student tutor.

The sidebar should remain concise. Context-specific tabs/actions belong inside a class, lesson, study space, task, or calendar event. Preserve role-prefixed URLs for workspace context, and do not use a visible menu item as an authorization boundary.

## Page content and student workflows

### Overview

**Purpose:** Answer "What should I do next?" across personal learning and joined classes without requiring the student to have a class.

- Show a brief welcome and a clear split between personal workspace and educator-led learning.
- Surface a short actionable list: upcoming personal task, assigned classwork due soon, next class/session, and a released feedback/result item when the corresponding service provides them.
- Include quick actions such as create a personal task/note, open My Learning, join a class, and continue to an upcoming class meeting when eligible.
- Link to personal subjects and recent learning resources, without presenting demo counts, fake activity, or guessed grades as live data.
- Empty states should give a meaningful independent-learning next step as well as an optional "Join a class" path.
- Existing route: `/students`. Rework the present dashboard scaffold to use real sourced data as those services become available.

### My Learning

**Purpose:** Be the student's owned, independent workspace: subjects, notes, personal tasks/plans, and personal resources.

- Start with a manageable subject list and "create/add subject" flow after a subject persistence contract exists.
- A subject detail should organize the student's own notes, resources, personal tasks, and study plan. It must not imply that a personal subject is an educator's official course.
- Provide clear paths to personal Notes and Tasks; these existing routes must not become orphaned if the sidebar groups them under this hub.
- Offer simple personal goals or study-plan blocks only when their persistence and progress semantics are defined.
- Show personal progress separately from released grades or official attendance.
- Proposed route for the hub: a new student learning/workspace route, while `/students` remains Overview and existing subject/note/task routes can remain as focused destinations or nested views.
- Existing related routes/components: `/students/subjects`, `/students/notes`, `/students/tasks`; subjects are sample/read-only, while Notes and Tasks currently support browser-local CRUD and are not server-synced.

### My Classes

**Purpose:** Give the student one place to find educator-led school classes, college courses, tutoring groups, or ESL learning spaces and continue class work.

- List joined classes with educator/tutor identity, subject/context, and a next supported session or activity when real records exist.
- Provide the supported join-by-code action. Join links/invitations should be added only when their contracts are confirmed.
- Class detail should make the context and educator clear, and expose only applicable areas: feed/announcements, materials, classwork, schedule/session, discussions, attendance visible to the student, released grades/evaluations, and feedback.
- Each assessment should offer the lifecycle supported by the service: open instructions, complete/submit, see submission status, and view only released results/feedback. Do not promise unsupported file types or revision states.
- Put the meeting join action beside the applicable session or classroom details. Meeting-room chat and hand raises are transient meeting interactions, not saved class discussions or official attendance.
- Existing routes: `/students/classrooms`, `/students/classrooms/:classroomId`, and classwork activity detail. Classroom list/create/join have API calls, but the provider also injects demo classes and class details, materials, classwork, submissions, attendance, and progress are prototype/in-memory data. Clearly distinguish connected records from previews.

### Study Library

**Purpose:** Help students find resources while preserving who owns each resource and where it belongs.

- Offer search/filter by source and subject/context: personal, educator-published classroom, or peer-shared study space.
- Show title, resource kind, subject/class/space, author/source, and the supported open/download action.
- Keep personal notes discoverable, but do not conflate notes with uploaded files or class-published materials.
- Include empty, unavailable, permission, and loading states; do not claim uploads, file previews, external-drive sync, or sharing until supported.
- Existing route: `/students/materials` currently explains these contexts and links out to them; it is a context selector, not a connected resource library.

### Study Spaces

**Purpose:** Support student-created peer learning without an instructor and without turning the space into an official record.

- Separate spaces the student owns from spaces they joined; show purpose, membership, and the current space context.
- Once backed by a service, support create/join, member management, shared resources/tasks, discussions, and optional polls/announcements according to an approved permission model.
- Keep peer contributions and tasks within the specific space. Never show official class grades, attendance, educator feedback, or classroom progress here.
- Current create/join flows are local-browser prototypes and invite codes are not verified. The "open a space" experience is also not connected; do not present those controls as real collaboration.
- Existing route/component: `/students/study-spaces`.

### Meeting Room, discussions, and notifications

**Meeting Room** is a separate destination from My Classes and classroom detail pages. It should support a student arriving from the sidebar with a meeting invite/code, while also accepting contextual links from an enrolled class or session. Keep the lobby separate from the active call state, explain connection/join errors, and do not add a meeting history or scheduled-room list without an API contract. Any room creation control must respect backend authorization; do not assume a student is allowed to create rooms merely because the shared page currently exposes a create flow.

- Existing route: `/students/classrooms/meeting-room` already renders a full standalone meeting page and accepts a room query parameter/invite. The recommended navigation should link directly to this route rather than embedding the meeting UI in a classroom detail page.
- The sidebar's active item and page title must identify Meeting Room at this nested path instead of treating it as the My Classes page.

**Discussions** should be contextual, with class/lesson and study-space threads entered from their parent space. Make authorship, timestamp, audience, and destination clear. Polls and announcements can be included when supported by the relevant classroom/study-space permissions. Avoid a global direct-message inbox in the first student rollout.

**Notifications** should link to the originating class, task, discussion, feedback, or schedule item; show read state only when supported. Potential events include invitations, new classwork/materials, due dates, announcements, replies, released results, and schedule changes. Avoid lock-screen or inbox content that exposes grades or private feedback without an explicit privacy contract.

- Existing shared route: `/students/communication` is a UI-only discussion/announcement/poll preview; `/students/notifications` is an explanatory empty state with no delivery or read state.

### Calendar & Schedule

- Combine personal study blocks/deadlines with joined-class sessions and educator-assigned due dates, using visually distinct labels/owners.
- Selecting an event should open its source: personal task, class/session, or classwork; a meeting link appears only for a valid event that has one.
- Decide timezone, recurrence, locale, reminders, daylight-saving, and all-day behavior before implementing calendar persistence or sync.
- Existing route: `/students/schedule` provides a local-date month grid but loads and saves no events.

### Tasks & Assessments

- Present two unmistakably separate scopes: **Personal tasks** (student-owned) and **Assigned classwork** (educator-controlled).
- Personal tasks support title, details, subject, due date, priority, status, and personal notes as defined by the product plan.
- Assigned work lists educator-provided instructions, class, due date, supported work type, submission status, and released evaluation/feedback. The student must not edit the educator's activity or official result.
- Search/filter may apply within each scope; counts and states must derive from real data, not preview records.
- Existing routes: `/students/tasks` supports localStorage CRUD; `/students/classwork` is sample-only. They can be surfaced from one sidebar entry, but retain distinct views and record boundaries.

### Progress & Grades

- Separate **Personal learning** (student tasks/goals/history) from **Classroom results** (released educator grades/evaluations, feedback, and permitted attendance).
- Provide source, class, activity, and release context for official records; never infer grades from personal completion or peer-space activity.
- Keep summaries understandable without charts; add trend visualizations only when real, correctly scoped records exist.
- Existing route: `/students/progress` currently explains the distinction but loads no records.

### AI Study Assistant

- Treat student assistance as a separately approved product capability, not as the educator AI tool. Potential future student tasks might include concept explanations, practice questions, study-plan suggestions, or help using material the student is authorized to access.
- Decide allowed subjects/age-appropriate behavior, sources, privacy/retention, safety boundaries, and how classroom material may be supplied before connecting an AI provider.
- Show AI output as assistance rather than authoritative teaching, grades, or educator feedback. Do not send private classroom/student data directly from the browser.
- Existing `/students/ai-assistant` is a shared educator-oriented preview with no AI provider or generation flow; student-facing use is not implemented.

### Help & Support; Profile & Settings

- Help & Support can eventually include onboarding guidance, concise feature help, account/access troubleshooting, and an approved support/contact path.
- Profile & Settings can eventually expose only account/profile fields and preferences supported by an authenticated API, plus notification and privacy preferences if those contracts exist. Keep sign-out available.
- Neither currently has a student route or feature service. Do not make editable-looking controls imply server persistence.

## Current implementation map and data boundaries

| Area | Current source | Current state |
|---|---|---|
| Student nav and shared nav data | `src/components/common/dashboard-navigation.ts`; renderer `src/components/common/app-sidebar.tsx` | Current student menu has Overview, Subjects, Tasks, Notes, Study spaces, Classwork plus shared pages. The proposed IA requires grouping/label/href changes and attention to the layout's page-title/search mapping. |
| Routes and shared layout | `src/main.tsx`; `src/pages/dashboard/layout.tsx` | Role-prefixed nested routes; navigation is presentation context, not authorization. Existing route adapters should remain thin. |
| Student Overview | `src/pages/dashboard/students/index.tsx`; `src/components/features/personal-workspace/student-overview/` | Scaffold links and explanatory states; no student dashboard query. |
| Subjects | `src/pages/dashboard/students/subjects/`; `src/components/features/personal-workspace/subjects/` | Fixed sample dataset, read-only; no subject API. |
| Tasks and Notes | `src/components/features/personal-workspace/tasks/`; `.../notes/` | CRUD is localStorage/browser-only, initialized with sample data; not account-synced. |
| Study Spaces | `src/components/features/personal-workspace/study-spaces/` | localStorage/demo preview; membership and invite code are not server-verified. |
| Classrooms | `src/services/api/classroom.service.ts`; `src/components/features/classrooms/`; `src/pages/dashboard/classroom/` | List/create/join API endpoints exist; prototype provider blends API classroom headers with mock classroom records and in-memory detail state. Verify backend payloads/authorization before expanding. |
| Meeting Room | `src/services/api/meeting.service.ts`; `src/pages/dashboard/classroom/meeting-room.tsx` | Create/join/end API calls and LiveKit media/presence are connected. This is already a separate full page at a nested route; the proposed sidebar should link directly to it. Chat/raised hands are transient LiveKit packets, not persistent class communication or attendance. Room route accepts a room query/invite or explicit room-code interaction. |
| Classwork/submissions | `src/components/features/classrooms/classroom-classwork-view.tsx`, `classroom-activity-view.tsx`; `src/components/features/personal-workspace/classwork/` | Mock or in-memory preview only; no classwork/submission service. |
| Schedule, materials, communication, notifications, progress, AI | `src/pages/dashboard/{schedule,materials,communication,notifications,progress,ai-assistant}/` | UI scaffolds/context previews; no event, material, discussion, notification, progress, or AI data service. |
| Profile/settings/help | Dashboard layout/auth session | Authenticated user name/role and sign-out exist; profile editing, support, and preferences do not have routes/services. |

Before implementation, re-check the route tree and service contracts because this snapshot may change. Preserve current user work and avoid reading `.env` files.

## Delivery roadmap

### Stage 0 — Product and API decisions

- Confirm the canonical account/role model and how student-only routes are authorized by the backend.
- Confirm study-space creator/member permissions and whether spaces are student-only.
- Define the student-facing classwork/submission status model, released-grade visibility, attendance visibility, and supported submission types.
- Define event timezone/recurrence/reminders; material storage/sharing; notification delivery/read state; and direct-message scope (still future by current decision).
- Decide whether/when student AI is in scope, what data it may use, and privacy/safety requirements.
- Define profile/settings and support-service contracts before adding controls.

### Stage 1 — Student independence first

- Establish Overview versus My Learning as distinct destinations and make independent learning the default no-class path.
- Implement real personal subject CRUD, then wire personal notes and tasks to an approved account-scoped persistence service. Retire sample-only metrics as live-looking values.
- Keep current notes/task functionality clearly labeled browser-only until service persistence ships; handle empty, loading, validation, save failure, and offline/storage-unavailable states.
- Make personal resources discoverable in Study Library while keeping personal notes and files distinct.

### Stage 2 — Classroom participation

- Build My Classes around API-backed class list and join flows, with loading/empty/error/duplicate-code states.
- Replace demo detail data with authorized class/lesson, materials, classwork, session, discussion, attendance, and released-result APIs as contracts become available.
- Keep Meeting Room as a standalone page reachable from the sidebar, and allow class/session actions to deep-link into that page with a valid room selected. Reuse the existing meeting service and LiveKit room; do not use meeting chat or room presence as persistent class communication/attendance.

### Stage 3 — Academic organizer

- Connect Calendar & Schedule to personal events, class sessions, and classwork deadlines with clear context and time-zone rules.
- Present personal tasks and assigned assessments under a common student destination while maintaining separate data models and permissions.
- Connect personal progress and released official grades/feedback/attendance as separate sections, with accessible text summaries and real records only.

### Stage 4 — Peer collaboration and contextual communication

- Add server-backed Study Spaces with confirmed membership, invitation, ownership, and sharing behavior.
- Add contextual discussions/announcements/polls and notifications only with APIs that confirm save/delivery/read states and classroom isolation.
- Keep direct Messages off the active sidebar until its own requirements and services are approved.

### Stage 5 — Student tools and account completion

- Design and implement a student-specific AI assistant only after product, provider, privacy, and safety decisions.
- Add Profile & Settings and Help & Support when authenticated profile/preferences and support workflows are defined.
- Add any additional cross-cutting search or recommendations only after their data scope, privacy, and service behavior are agreed.

## Acceptance criteria for the proposal and later implementation

- A student can understand and start the independent workflow without joining a class; Overview is not a duplicate of My Learning.
- My Classes, My Learning, Study Spaces, and Study Library each communicate their purpose and data owner.
- Personal notes/tasks/progress, peer-space content, and educator-controlled classwork/grades/attendance are visibly and technically separate.
- Sidebar items lead to real student-prefixed routes; active state, page title, search result labels, mobile behavior, and keyboard/focus behavior remain coherent.
- Meeting Room is reachable as a standalone sidebar page, with optional deep links from relevant classes/sessions; meeting presence/chat is not described as saved communication or official attendance.
- Direct Messages are clearly future, not represented by the current contextual communication preview.
- Every unfinished feature is labeled accurately; sample/demo data, localStorage data, and server-confirmed data are not conflated.
- Pages define useful loading, empty, error/unavailable, and permission states; sensitive record visibility remains backend-authorized.
- No new dependencies or invented endpoints/permissions are introduced without explicit approval.

## Likely application files if implementation is separately approved

- Navigation and layout mapping: `src/components/common/dashboard-navigation.ts`, `src/components/common/app-sidebar.tsx`, `src/pages/dashboard/layout.tsx`. Add Meeting Room as its own item and ensure the nested meeting route gets the correct active item/page title rather than inheriting My Classes.
- Route registration/adapters: `src/main.tsx`, plus a new role-specific route module under `src/pages/dashboard/students/` for the My Learning hub if selected.
- Student workspace: `src/components/features/personal-workspace/student-overview/`, `subjects/`, `tasks/`, `notes/`, `study-spaces/`, and `classwork/`.
- Shared student-visible experiences: `src/pages/dashboard/classroom/`, `schedule/`, `materials/`, `communication/`, `notifications/`, `progress/`, and `ai-assistant/`; classroom subviews under `src/components/features/classrooms/`.
- New API modules/types only after backend contracts are confirmed: `src/services/api/`.
- No source edits, dependency changes, API calls, or configuration changes are part of this proposal/roadmap plan.
