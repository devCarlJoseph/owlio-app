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

## Implementation blueprint: routes, ownership, and files

This section is a target UI architecture, not a claim that the pages or services are implemented. `E` means an existing frontend route, `P` means a proposed frontend route, and `D` means a currently disabled sidebar entry. Proposed paths are not backend/API endpoints.

### Route-adapter rule

- Every new or refactored route folder under `src/pages/` contains only `index.tsx`. The file imports a feature view and returns it; it does not own layout sections, data arrays, forms, requests, or business rules.
- Use `src/main.tsx` only for route registration and keep student URLs under `/students`. Path parameters are registered in `main.tsx`, not encoded in folder names: for example, `path="subjects/:subjectId"` imports `pages/dashboard/students/subjects/detail/index.tsx`.
- Keep screen composition, reusable domain sections, forms, empty/error states, and state coordination under `src/components/features/<domain>/`. Keep domain types, schemas, and constants beside their feature. Keep cross-domain, domain-neutral controls in `src/components/ui/`.
- The existing `src/pages/dashboard/students/*/index.tsx` files already follow the thin-adapter pattern. Existing exceptions are `src/pages/dashboard/classroom/{detail,activity,meeting-room,meeting-room.lazy}.tsx`, `src/pages/dashboard/layout.tsx`, and `src/pages/App.tsx`; a separate, approved route-adapter cleanup would move their page code to feature/layout components and give each route folder an `index.tsx`. Do not silently relocate shared educator/tutor/ESL routes as part of a student-only feature.
- Shared classroom, schedule, materials, communication, notifications, progress, and meeting features may be mounted under multiple role prefixes. Extract their screen logic to shared feature components, but preserve role-prefixed links and backend classroom membership checks.
- Use `Button render={<Link to="..." />}` when applying the local Button wrapper to a React Router link. These wrappers are Base UI based; do not assume Radix `asChild`. Use the existing `Tabs` `value`/`onValueChange` pattern for in-page tabs.

### Route inventory and click destinations

| Student surface | Current sidebar / route | Target route or child | Route adapter and behavior |
|---|---|---|---|
| Overview | E: `/students` | Same | `pages/dashboard/students/index.tsx`; daily summary only, never a duplicate My Learning hub. |
| My Learning | E: sidebar opens `/students/subjects` as the current personal entry | P: `/students/learning`; keep E: `/students/subjects`, `/students/notes`, `/students/tasks` as focused routes | New `pages/dashboard/students/learning/index.tsx` returns `MyLearningView`; update sidebar href only when registered. Subject cards are not currently linked to details. |
| Subject detail | None | P: `/students/subjects/:subjectId` | `pages/dashboard/students/subjects/detail/index.tsx` returns `SubjectDetailView` after a subject ownership/data contract exists. |
| My Classes | E: `/students/classrooms` | E: `/students/classrooms/:classroomId`; E: `/students/classrooms/:classroomId/classwork/:activityId` | Shared classroom list/detail/activity adapters. Keep class/lesson tabs on the detail route unless a separate deep-link requirement is approved. |
| Study Library | E: `/students/materials` | Same; open the resource's authorized owner context | Shared materials adapter; do not create a detached file detail route or cross-share personal files without a contract. |
| Study Spaces | E: `/students/study-spaces` | P: `/students/study-spaces/:spaceId` for a joined/created space | New `pages/dashboard/students/study-spaces/detail/index.tsx` returns `StudySpaceDetailView` when real membership is supported. Current create/join is browser-local only. |
| Meeting Room | E: `/students/classrooms/meeting-room` | Same, optionally with an approved room invite query from an authorized class | Standalone screen; keep LiveKit chat/hand raises transient and never treat room presence as official attendance. |
| Discussions | E: `/students/communication` | Same with classroom/study-space context selection; thread deep links P until a service contract exists | Shared communication adapter; current tabs are previews, not persisted threads. |
| Notifications | E: `/students/notifications` | Same; future entries link to their authorized source | Shared notifications adapter; delivery/read state does not exist yet. |
| Calendar & Schedule | E: `/students/schedule` | Same; event click opens the event's owning route | Shared schedule adapter; current month grid does not load/save events. |
| Tasks & Assessments | E: sidebar opens `/students/tasks` | E: personal `/students/tasks`; E: assigned `/students/classwork`; E: classroom activity detail above | Keep a clearly labeled scope switch/link between personal and assigned work. Do not collapse personal task data into official classwork. |
| Progress & Grades | E: `/students/progress` | Same; record click returns to its task, class, or activity | Shared progress adapter with separate personal and released-classroom views. |
| AI Study Assistant | D: sidebar entry; E: `/students/ai-assistant` is an educator-oriented preview | Enable student-specific E route only after role/privacy/service approval | Do not route students into an educator tool or imply AI is operating now. |
| Help & Support | D: no route | P: `/students/help` | New `pages/dashboard/students/help/index.tsx` only after help content/support path is approved. |
| Profile & Settings | D: no route | P: `/students/settings` | New `pages/dashboard/students/settings/index.tsx` only after a profile/settings contract exists. Sign-out remains in the shared header. |

### File placement and component ownership

The tree below shows representative target files, not a request to create them now. Existing files keep their current names until a feature or route-adapter migration is approved. Every folder shown under `pages` has only `index.tsx`; component implementation lives outside `pages`.

```text
src/
  main.tsx                                      # React Router registrations
  pages/
    index.tsx                                   # P: move root App.tsx in cross-app cleanup
    dashboard/
      students/
        index.tsx                               # E: StudentOverviewView adapter
        learning/index.tsx                      # P: MyLearningView adapter
        subjects/index.tsx                      # E: SubjectsView adapter
        subjects/detail/index.tsx               # P: SubjectDetailView adapter
        notes/index.tsx                         # E: NotesView adapter
        tasks/index.tsx                         # E: TasksView adapter
        classwork/index.tsx                     # E: ClassworkView adapter
        study-spaces/index.tsx                  # E: StudySpacesView adapter
        study-spaces/detail/index.tsx           # P: StudySpaceDetailView adapter
        help/index.tsx                          # P: StudentHelpView adapter
        settings/index.tsx                      # P: StudentSettingsView adapter
      classroom/
        index.tsx                               # E: ClassroomsView adapter
        detail/index.tsx                        # P: move current detail.tsx adapter
        activity/index.tsx                      # P: move current activity.tsx adapter
        meeting-room/index.tsx                  # P: thin adapter for lazy meeting feature
      materials/index.tsx                       # E: extract current screen to feature view
      schedule/index.tsx                        # E: extract current screen to feature view
      communication/index.tsx                   # E: extract current screen to feature view
      notifications/index.tsx                   # E: extract current screen to feature view
      progress/index.tsx                        # E: extract current screen to feature view
      ai-assistant/index.tsx                    # E: keep role-aware adapter only
  components/
    layouts/platform-layout.tsx                 # P: move layout.tsx in cross-app cleanup
    common/dashboard-navigation.ts              # Role-prefixed sidebar targets
    features/
      personal-workspace/
        student-overview/                       # E: dashboard sections and copy
        learning/                               # P: my-learning-view, quick-actions, subject rail
        subjects/                               # E: subject list/cards; P: subject-detail-view
        notes/                                  # E: list, tag groups, composer/detail/delete dialogs
        tasks/                                  # E: list, groups, composer/detail/delete dialogs
        study-spaces/                           # E: list/rails/dialogs; P: space-detail-view
        classwork/                              # E: assigned list sample; P: server-backed view
      classrooms/                               # E: shared class list/detail/activity/records views
      meeting-room/                             # P: extract current heavy LiveKit page view
      materials/                                # P: student-source filters and resource sections
      schedule/                                 # P: calendar, day agenda, event details
      communication/                            # P: source-scoped discussion sections
      notifications/                            # P: event list and source actions
      progress/                                 # P: personal/class results sections
      student-ai/                               # P: student-specific assistant only if approved
      student-help/                             # P: help categories and support context
      student-settings/                         # P: profile/privacy/preferences sections
    ui/                                         # E: shared domain-neutral Base UI wrappers
  services/api/                                 # Add domain services only after backend contract
```

**Specific adapter -> feature-view guide** (`P` filenames are suggested, not existing):

| Route adapter (`index.tsx` only) | Screen feature file | Section/form files in the same domain |
|---|---|---|
| `pages/dashboard/students/index.tsx` E | `components/features/personal-workspace/student-overview/student-overview-view.tsx` E | `upcoming-items.tsx`, `subjects-table.tsx`, `classwork-highlight.tsx`, `personal-metrics.tsx`, `progress-summary.tsx` E. |
| `pages/dashboard/students/learning/index.tsx` P | `components/features/personal-workspace/learning/my-learning-view.tsx` P | `personal-subject-list.tsx`, `continue-learning.tsx`, `learning-shortcuts.tsx` P. |
| `pages/dashboard/students/subjects/index.tsx` E; `subjects/detail/index.tsx` P | `components/features/personal-workspace/subjects/subjects-view.tsx` E; `subject-detail-view.tsx` P | `subject-card.tsx`, `subject-workspace.tsx` E; `subject-detail-sections.tsx`, `subject-form.schema.ts` P after contract. |
| `pages/dashboard/students/notes/index.tsx` E | `components/features/personal-workspace/notes/notes-view.tsx` E | `note-list.tsx`, `note-groups.tsx`, `note-composer-dialog.tsx`, `note-detail-dialog.tsx`, `note-records.ts` E. |
| `pages/dashboard/students/tasks/index.tsx` E | `components/features/personal-workspace/tasks/tasks-view.tsx` E | `task-list.tsx`, `task-subject-groups.tsx`, `task-composer-dialog.tsx`, `task-detail-dialog.tsx`, `task-records.ts` E; P scope switch when backed. |
| `pages/dashboard/students/classwork/index.tsx` E | `components/features/personal-workspace/classwork/classwork-view.tsx` E | `classwork-card.tsx`, `sample-classwork.ts` E; P authorized assigned-work repository/hook after contract. |
| `pages/dashboard/students/study-spaces/index.tsx` E; `study-spaces/detail/index.tsx` P | `components/features/personal-workspace/study-spaces/study-spaces-view.tsx` E; `study-space-detail-view.tsx` P | `create-space-dialog.tsx`, `join-space-dialog.tsx`, `space-circle-rail.tsx` E; `member-list.tsx`, `space-tabs.tsx` P. |
| `pages/dashboard/classroom/index.tsx` E; `detail/index.tsx`, `activity/index.tsx` P adapter migrations | `components/features/classrooms/classrooms-view.tsx`, `classroom-detail-view.tsx`, `classroom-activity-view.tsx` E | `classroom-classwork-view.tsx`, `classroom-feed-view.tsx`, `classroom-records-view.tsx` E; preserve role-aware shared behavior. |
| `pages/dashboard/classroom/meeting-room/index.tsx` P adapter migration | `components/features/meeting-room/meeting-room-view.tsx` P extraction of E `pages/dashboard/classroom/meeting-room.tsx` | `meeting-lobby.tsx`, `room-controls.tsx`, `meeting-chat-panel.tsx` P extraction; retain lazy loading at route registration. |
| `pages/dashboard/materials/index.tsx` E | `components/features/materials/student-library-view.tsx` P extraction | `resource-source-filter.tsx`, `resource-list.tsx`, `resource-context-link.tsx` P. |
| `pages/dashboard/schedule/index.tsx` E | `components/features/schedule/student-schedule-view.tsx` P extraction | `calendar-grid.tsx`, `day-agenda.tsx`, `event-detail.tsx` P. |
| `pages/dashboard/communication/index.tsx` E | `components/features/communication/student-discussions-view.tsx` P extraction | `discussion-context-filter.tsx`, `thread-list.tsx`, `reply-composer.tsx` P. |
| `pages/dashboard/notifications/index.tsx` E | `components/features/notifications/student-notifications-view.tsx` P extraction | `notification-filters.tsx`, `notification-list.tsx` P. |
| `pages/dashboard/progress/index.tsx` E | `components/features/progress/student-progress-view.tsx` P extraction | `personal-progress-section.tsx`, `classroom-results-section.tsx`, `feedback-list.tsx` P. |
| `pages/dashboard/ai-assistant/index.tsx` E; `students/help/index.tsx`, `students/settings/index.tsx` P | `components/features/student-ai/student-ai-view.tsx`, `student-help/student-help-view.tsx`, `student-settings/student-settings-view.tsx` P | Keep student AI, help, and account forms role-specific; no working student AI/help/settings route today. |

### Section components and checked-in UI primitives

The component names are target suggestions. Reuse checked-in `src/components/ui` wrappers, not a second component kit. "Planned" controls remain inert or absent until their corresponding service supports the action.

| Destination | Suggested feature components | Suitable local shadcn-style wrappers |
|---|---|---|
| Overview | `StudentOverviewView`, `UpcomingItems`, `SubjectsTable`, `ClassworkHighlight`, `PersonalMetrics`, `ProgressSummary`, `QuickLinks` | `Card`, `Badge`, `Button`, `Empty`, `Skeleton`, `Alert`; `Progress` only for real completion data. |
| My Learning / subject | `MyLearningView`, `PersonalSubjectList`, `SubjectCard`, `SubjectDetailView`, `SubjectQuickLinks`, `NotePreview`, `PersonalTaskPreview` | `Card`, `Tabs`, `Input`, `Select`, `Field`, `Dialog`, `Badge`, `Empty`, `Separator`; use `Table` for dense lists only. |
| My Classes / class detail | `ClassroomsView`, `ClassroomDetailView`, `ClassroomClassworkView`, `ClassroomMaterialsView`, `ClassroomScheduleView`, `ClassroomActivityView` | `Card`, `Tabs`, `Badge`, `Input`, `Field`, `Button`, `Alert`, `Avatar`, `Empty`, `Skeleton`. |
| Study Library | `StudentLibraryView`, `ResourceSourceFilter`, `ResourceList`, `ResourceCard`, `ResourceContextLink` | `Card`, `Tabs`, `Input`, `Select`, `Badge`, `Empty`, `Skeleton`; `Attachment` only where a supported resource is actually present. |
| Study Spaces / space detail | `StudySpacesView`, `SpaceCircleRail`, `CreateSpaceDialog`, `JoinSpaceDialog`, `StudySpaceDetailView`, `MemberList` | `Card`, `Dialog`, `Field`, `Input`, `Tabs`, `Avatar`, `ScrollArea`, `Alert`, `Empty`. |
| Meeting Room | `MeetingRoomView`, `MeetingLobby`, `ParticipantGrid`, `RoomControls`, `MeetingChatPanel`, `PeoplePanel` | `Button`, `Drawer`, `ScrollArea`, `Alert`, `Badge`; media transport stays in LiveKit, not a UI wrapper. |
| Discussions | `StudentDiscussionsView`, `DiscussionContextFilter`, `ThreadList`, `ThreadDetail`, `ReplyComposer` | `Tabs`, `Card`, `Badge`, `Textarea`, `Field`, `Button`, `ScrollArea`, `Empty`, `Alert`. |
| Notifications | `StudentNotificationsView`, `NotificationFilters`, `NotificationList`, `NotificationRow` | `Card`, `Tabs`, `Badge`, `Button`, `Empty`, `Skeleton`, `Alert`. |
| Calendar & Schedule | `StudentScheduleView`, `CalendarGrid`, `DayAgenda`, `EventDetail` | `Card`, `Button`, `Select`, `Dialog` or `Drawer`, `Badge`, `Empty`; do not assume a Popover wrapper exists. |
| Tasks & Assessments | `TasksView`, `TaskList`, `TaskComposerDialog`, `TaskDetailDialog`, `ClassworkView`, `ClassworkCard` | `Tabs`, `Card`, `Field`, `Input`, `Select`, `Textarea`, `Dialog`, `Badge`, `Alert`, `Empty`, `Table`. |
| Progress & Grades | `StudentProgressView`, `PersonalProgressSection`, `ClassroomResultsSection`, `FeedbackList` | `Tabs`, `Card`, `Table`, `Badge`, `Progress`, `Empty`, `Alert`; text equivalents for charts. |
| AI Study Assistant | `StudentAiView`, `PromptForm`, `SuggestionPanel` (all P) | `Card`, `Field`, `Textarea`, `Button`, `Alert`, `Skeleton`; no enabled prompt until approved. |
| Help & Support | `StudentHelpView`, `HelpTopicList`, `HelpArticle` (all P) | `Accordion`, `Card`, `Input`, `Button`, `Empty`; support contact only via approved channel. |
| Profile & Settings | `StudentSettingsView`, `ProfileForm`, `PreferenceFields` (all P) | `Field`, `Input`, `Switch`, `Button`, `Alert`, `Card`; never claim a setting was saved without server confirmation. |

**State and data placement:** Fetch orchestration or local browser state belongs in feature hooks/components, never in the route adapter. The present Tasks, Notes, and Study Spaces views use localStorage; do not call that account persistence. Classroom list/create/join and meeting operations use APIs, but classroom details and assessments are still prototype data. Put future React Hook Form/Zod schemas beside each complex form and use `src/services/api/` only after contracts are confirmed.

## Click-through page flowcharts

Each chart starts at the sidebar destination. `E` is an existing frontend route, `P` a proposed future frontend route/action, and `D` a disabled sidebar entry. "Same page" means a tab, dialog, filter, or local state change rather than a new URL. A chart is a target interaction specification, not proof that a backend action exists.

### Overview: `/students` (E)

**Sections:** `StudentOverviewView` welcome/quick actions, `UpcomingItems` split by personal/class, `SubjectsTable`, `ClassworkHighlight`, `ProgressSummary`, and `PersonalSpacePromo`. Show a real next action or a useful empty state, not sample counts.

```mermaid
flowchart TD
  O["Overview /students"] --> Q{"Student selects"}
  Q -->|"Open personal subjects"| L["My Learning /students/subjects E"]
  Q -->|"Plan a personal task"| T["Tasks /students/tasks E"]
  Q -->|"Write a personal note"| N["Notes /students/notes E"]
  Q -->|"View own deadlines"| C["Calendar /students/schedule E"]
  Q -->|"Open class / join a class"| CL["My Classes /students/classrooms E"]
  Q -->|"See assigned work"| CW["Classwork /students/classwork E"]
  Q -->|"Review progress"| P["Progress /students/progress E"]
  Q -->|"Peer collaboration"| S["Study Spaces /students/study-spaces E"]
  CL -->|"Join code form when available"| J["Join result: server-confirmed or labeled demo"]
  O -->|"No personal work yet"| L
  O -->|"No class joined"| CL
```

**Boundary:** Personal links work without a classroom. Upcoming classroom data, grades, or attendance must be omitted or marked unavailable if no authorized service supplies them.

### My Learning: `/students/subjects` (E entry), `/students/learning` (P hub)

**Sections:** `MyLearningView` (P) with personal subject list, continue-study panel, notes preview, tasks preview, and personal-resource shortcuts; `SubjectsView` (E) remains the focused subject list. A subject is student-owned and is not an official educator class.

```mermaid
flowchart TD
  M["Sidebar My Learning -> /students/subjects E"] --> F["Subject search / status filter: same page E"]
  M --> SC["Subject card: read-only sample E"]
  SC -->|"When subject service exists"| SD["Subject detail /students/subjects/:subjectId P"]
  SD --> NS["Subject notes /students/notes E"]
  SD --> TS["Personal tasks /students/tasks E"]
  SD --> RS["Personal resources /students/materials E"]
  M -->|"Current quick link"| NS
  M -->|"Current quick link"| TS
  NS -->|"Create / edit / pin / delete"| ND["Note dialogs: same page, browser-local E"]
  TS -->|"Create / edit / complete / delete"| TD["Task dialogs: same page, browser-local E"]
  M -->|"After hub is registered"| MH["My Learning /students/learning P"]
  MH --> F
  MH --> NS
  MH --> TS
```

**Migration:** Update the sidebar from `/students/subjects` to `/students/learning` only when that hub has an `index.tsx` adapter and a real view. Keep `/students/subjects`, `/students/notes`, and `/students/tasks` reachable as focused/deep destinations; do not make a personal subject a classroom.

### My Classes: `/students/classrooms` (E)

**Sections:** `ClassroomsView` with enrolled-class cards and join-code form; `ClassroomDetailView` with feed, classwork, materials, people, schedule, attendance, and released-progress tabs; `ClassroomActivityView` for an activity. Tabs currently remain on the same class-detail URL.

```mermaid
flowchart TD
  CL["My Classes /students/classrooms E"] --> CH{"Choose class action"}
  CH -->|"Enter class code"| J["Join form on /students/classrooms E"]
  J -->|"Confirmed join API response"| LIST["Updated enrolled list E"]
  J -->|"Failure / already joined"| ERR["Inline error; remain on list E"]
  CH -->|"Open enrolled class card"| D["/students/classrooms/:classroomId E"]
  D -->|"Feed / People / Materials / Schedule"| TAB["Scoped tab on class detail E; data mostly demo"]
  D -->|"Classwork tab"| A["Assigned activity list in this class E; demo"]
  A -->|"Open activity"| AD["/students/classrooms/:classroomId/classwork/:activityId E"]
  AD -->|"Submit when service permits"| SR["Server-confirmed submission P; demo only today"]
  D -->|"Join linked live room"| R["Meeting Room /students/classrooms/meeting-room?room=CODE E"]
  D -->|"Back to classes"| CL
  TAB -->|"Attendance / results"| AUTH["View own permitted records only P"]
```

**Boundary:** The list/create/join classroom API exists, but detail tabs and activity submission/review are in-memory previews. Do not label a demo reply, grade, session, or submission as saved. Join links and invitations remain P until approved.

### Study Library: `/students/materials` (E)

**Sections:** `StudentLibraryView` (P) with source filter, search, resource list/cards, and a visible owner/context badge. Today's shared page only sends the user to the owning context.

```mermaid
flowchart TD
  LIB["Study Library /students/materials E"] --> SRC{"Select source"}
  SRC -->|"Personal notes / references"| N["Notes /students/notes E"]
  SRC -->|"Personal subject"| SUB["My Learning /students/subjects E"]
  SRC -->|"Educator-published material"| CL["My Classes /students/classrooms E"]
  CL -->|"Open authorized class"| MAT["Class detail materials tab E; preview"]
  SRC -->|"Peer-shared material"| SS["Study Spaces /students/study-spaces E"]
  SS -->|"After verified membership"| SD["Study-space detail /students/study-spaces/:spaceId P"]
  LIB -->|"Search / kind / source filters when service exists"| RES["Resource results on same route P"]
  RES -->|"Open"| OWNER["Open authorized owner context; no silent cross-sharing P"]
  LIB -->|"No resource service"| EMPTY["Context cards + unavailable state E"]
```

**Boundary:** A personal note, educator-published class file, peer-shared resource, and student submission have different owners. No upload/download, preview, or cross-context sharing should appear operational before the materials contract.

### Study Spaces: `/students/study-spaces` (E)

**Sections:** `StudySpacesView` with "Spaces you create" and "Spaces you join" rails, `CreateSpaceDialog`, and `JoinSpaceDialog`; future `StudySpaceDetailView` owns member list, shared resources/tasks, discussions, and space notices.

```mermaid
flowchart TD
  SS["Study Spaces /students/study-spaces E"] --> ACT{"Student selects"}
  ACT -->|"Create space"| CR["CreateSpaceDialog on same page E"]
  ACT -->|"Join space"| JR["JoinSpaceDialog on same page E"]
  CR -->|"Today: save browser-local"| LOCAL["Space rail updated; others cannot join E"]
  JR -->|"Today: no code verification"| LOCAL
  CR -->|"After create API confirms"| DETAIL["/students/study-spaces/:spaceId P"]
  JR -->|"After membership API confirms"| DETAIL
  DETAIL -->|"Shared tasks / materials"| PEER["Space-scoped content tabs P"]
  DETAIL -->|"Discussion"| THREAD["Space-scoped discussion P"]
  DETAIL -->|"Member management if owner"| MEMBERS["Approved member controls P"]
  DETAIL -->|"Back"| SS
  SS -->|"No membership or unavailable"| EMPTY["Peer-learning empty / error state"]
```

**Boundary:** Current "joined" records are local and do not prove membership. A peer space never creates official grades, educator feedback, or attendance; personal content is shared only through an explicit approved action.

### Meeting Room: `/students/classrooms/meeting-room` (E)

**Sections:** Full-screen `MeetingLobby`, `ParticipantGrid`, `RoomControls`, `MeetingChatPanel`, and `PeoplePanel`. The sidebar entry opens the separate lobby; an eligible classroom/session may link to the same route with a room code. The connected room is LiveKit-backed.

```mermaid
flowchart TD
  R["Meeting Room /students/classrooms/meeting-room E"] --> ENTRY{"How did student arrive?"}
  ENTRY -->|"Sidebar"| FORM["Enter invite / room code in lobby E"]
  ENTRY -->|"Authorized class link"| PREFILL["Room code prefilled from class E"]
  FORM --> JOIN["Join request to existing meeting API E"]
  PREFILL --> JOIN
  JOIN -->|"Denied / invalid / offline"| ERROR["Visible error; stay in lobby E"]
  JOIN -->|"Authorized token + connected"| LIVE["LiveKit connected room E"]
  LIVE -->|"Enable mic / camera"| MEDIA["Browser permission requested only by control E"]
  LIVE -->|"Chat / raise hand"| TRANSIENT["Transient LiveKit packet E"]
  LIVE -->|"People panel"| PRESENCE["Connected roster, not attendance E"]
  LIVE -->|"Leave / disconnect"| CLEAR["Clear transient room state E"]
  CLEAR --> R
  R -->|"Back to classes"| CL["My Classes /students/classrooms E"]
```

**Boundary:** The room is not a persistent messaging system or official roll call. A whiteboard, recording, meeting history, or student-host permission is not implied by the student route; the ESL whiteboard is a separately approved live-session feature.

### Discussions: `/students/communication` (E scaffold)

**Sections:** `DiscussionContextFilter`, classroom/peer thread list, thread detail with author/time/context, and an accessible reply composer (P). The current page previews discussions, announcements, and polls without saved posts.

```mermaid
flowchart TD
  DISC["Discussions /students/communication E"] --> CTX{"Select context"}
  CTX -->|"Joined class"| CL["My Classes /students/classrooms E"]
  CL -->|"Open class feed"| FEED["Classroom detail feed tab E; demo only"]
  CTX -->|"Peer space"| SS["Study Spaces /students/study-spaces E"]
  SS -->|"Verified space detail"| SP["/students/study-spaces/:spaceId P"]
  CTX -->|"When discussion API exists"| LIST["Scoped thread list on same route P"]
  LIST -->|"Open thread"| THREAD["Thread detail on same route or approved deep link P"]
  THREAD -->|"Reply / vote if permitted"| SAVE["Server-confirmed action or inline error P"]
  DISC -->|"Current not-connected state"| INFO["Context links and explanatory empty state E"]
```

**Boundary:** Only authorized class/space members see content. A student cannot publish an educator announcement, alter official records, or treat in-room chat as a saved discussion. Direct Messages remain out of scope.

### Notifications: `/students/notifications` (E scaffold)

**Sections:** `NotificationFilters`, list grouped by source/date, item details, and source links (P). Current route has category cards and no delivered events or read state.

```mermaid
flowchart TD
  N["Notifications /students/notifications E"] --> DATA{"Notification service available?"}
  DATA -->|"No"| EMPTY["Category guidance + no live activity E"]
  DATA -->|"Yes"| LIST["Authorized event list P"]
  LIST -->|"Class invite / announcement"| CL["Class detail or My Classes /students/classrooms E"]
  LIST -->|"New work / released result"| ACT["/students/classrooms/:classroomId/classwork/:activityId E"]
  LIST -->|"Deadline / changed session"| CAL["Calendar /students/schedule E"]
  LIST -->|"Peer reply"| SS["Study Spaces /students/study-spaces E"]
  LIST -->|"Mark read if supported"| READ["Read-state mutation confirmed by service P"]
  LIST -->|"Permission revoked"| UNAV["Unavailable message; do not expose private payload P"]
```

**Boundary:** Every event opens its owner context. Do not expose private grades/feedback to other members or claim delivery/read state from client-only changes.

### Calendar & Schedule: `/students/schedule` (E scaffold)

**Sections:** `CalendarGrid`, selected-day `DayAgenda`, source legend/filter, and event details. The current calendar only navigates dates; it does not save or load events.

```mermaid
flowchart TD
  CAL["Calendar /students/schedule E"] --> DATE["Select month / date: same page E"]
  DATE --> SERVICE{"Approved event sources loaded?"}
  SERVICE -->|"No"| EMPTY["No connected events E"]
  SERVICE -->|"Yes"| AGENDA["Day agenda with owner badges P"]
  AGENDA -->|"Personal task deadline"| TASK["Personal tasks /students/tasks E"]
  AGENDA -->|"Assigned activity deadline"| CW["Classwork /students/classwork E"]
  CW -->|"Open class activity"| ACT["/students/classrooms/:classroomId/classwork/:activityId E"]
  AGENDA -->|"Class / tutoring session"| CLASS["/students/classrooms/:classroomId E"]
  CLASS -->|"Eligible live meeting"| ROOM["/students/classrooms/meeting-room?room=CODE E"]
  CAL -->|"Add personal study block if supported"| FORM["Personal event form; same page P"]
  FORM -->|"Save success / failure"| DATE
```

**Boundary:** A student may edit only their own events. Classroom sessions and educator deadlines stay read-only unless an approved contract says otherwise. Confirm timezone, recurrence, and reminder behavior before event CRUD.

### Tasks & Assessments: `/students/tasks` (E entry) and `/students/classwork` (E)

**Sections:** A target `TasksAndAssessmentsView` can provide distinct "Personal tasks" and "Assigned classwork" scope tabs/links. Existing `TasksView` owns personal task dialogs and browser-local persistence; `ClassworkView` displays sample assigned work and has no submission action.

```mermaid
flowchart TD
  WORK["Tasks & Assessments sidebar -> /students/tasks E"] --> SCOPE{"Choose scope"}
  SCOPE -->|"Personal tasks"| T["Tasks list /students/tasks E"]
  T -->|"Create / edit"| FORM["TaskComposerDialog; same route E"]
  FORM -->|"Save"| LOCAL["Browser-local task list E"]
  T -->|"Open / complete / delete"| DETAIL["TaskDetailDialog or DeleteDialog; same route E"]
  SCOPE -->|"Assigned classwork"| CW["View classwork link -> /students/classwork E"]
  CW -->|"Search / status filter"| LIST["Sample classwork list; same route E"]
  LIST -->|"When classwork API exists"| CLASS["Open authorized class /students/classrooms/:classroomId E"]
  CLASS -->|"Open activity"| ACT["/students/classrooms/:classroomId/classwork/:activityId E"]
  ACT -->|"Submit / revise when permitted"| CONFIRM["Server-confirmed status or recoverable error P"]
  CONFIRM -->|"Released result"| PROG["Progress /students/progress E"]
```

**Boundary:** Personal task completion is not an educator submission; a localStorage task is not account-synced. Keep the existing classwork link discoverable until a service-backed combined hub can show both scopes honestly.

### Progress & Grades: `/students/progress` (E scaffold)

**Sections:** Separate `PersonalProgressSection` for student-owned task/study history and `ClassroomResultsSection` for the student's released educator results, feedback, and permitted attendance. The current page explains the distinction but loads no records.

```mermaid
flowchart TD
  P["Progress /students/progress E"] --> SCOPE{"Select record scope"}
  SCOPE -->|"Personal learning"| OWN["Personal tasks / study activity section P"]
  OWN -->|"Open task"| TASK["/students/tasks E; task detail dialog"]
  OWN -->|"Open subject"| SUB["/students/subjects E"]
  SCOPE -->|"Classroom results"| OFF["Own released grades / feedback / attendance P"]
  OFF -->|"Open result or feedback"| ACT["/students/classrooms/:classroomId/classwork/:activityId E"]
  OFF -->|"Open permitted attendance"| CL["/students/classrooms/:classroomId E; attendance tab"]
  OFF -->|"No released record or no permission"| EMPTY["Clear unavailable / empty state P"]
  P -->|"No progress service today"| PREVIEW["Existing explanatory page E"]
```

**Boundary:** No aggregate "grade" should be computed from personal tasks or peer collaboration. Official evaluation and attendance remain educator-controlled and are visible only to the authorized learner after release.

### AI Study Assistant: disabled sidebar item (D); `/students/ai-assistant` is an E preview

**Sections when approved:** `StudentAiView`, concise scope/safety guidance, prompt form, editable suggestion or practice output, and explicit optional actions for the student's own work. The current shared page describes educator AI and has no provider.

```mermaid
flowchart TD
  D["AI Study Assistant: sidebar disabled D"] --> APPROVAL{"Student AI capability + privacy contract approved?"}
  APPROVAL -->|"No"| WAIT["No prompt input; keep planned status"]
  APPROVAL -->|"Yes"| AI["Student AI /students/ai-assistant E route, new view P"]
  AI -->|"Enter allowed study prompt"| SEND["Approved backend service request P"]
  SEND -->|"Error / unsafe / unavailable"| FEED["Safe feedback + retry guidance P"]
  SEND -->|"Response"| REVIEW["Student reviews suggestion; not an official answer P"]
  REVIEW -->|"Explicitly create own note"| NOTES["Personal Notes /students/notes E"]
  REVIEW -->|"Return to study"| LEARN["My Learning /students/subjects E"]
```

**Boundary:** No direct provider call from the browser, silent learner-data upload, classroom submission, published grade, or AI-generated official evaluation. Keep the sidebar disabled until a student-appropriate page and service exist.

### Help & Support: disabled sidebar item (D); `/students/help` (P)

**Sections when approved:** `StudentHelpView` with searchable help topics for personal workspace, class joining, peer spaces, submission guidance, meeting troubleshooting, and account recovery. A support-contact flow needs an approved delivery channel.

```mermaid
flowchart TD
  D["Help & Support: sidebar disabled D"] --> READY{"Help route + content approved?"}
  READY -->|"No"| WAIT["Planned status; no dead link"]
  READY -->|"Yes"| HELP["Help /students/help P"]
  HELP -->|"Find personal-workspace guide"| LEARN["My Learning /students/subjects E"]
  HELP -->|"Find joining guide"| CL["My Classes /students/classrooms E"]
  HELP -->|"Find meeting guide"| ROOM["Meeting Room /students/classrooms/meeting-room E"]
  HELP -->|"Account recovery"| RECOVER["/forgot-password E"]
  HELP -->|"Still need help, channel approved"| CONTACT["Approved support handoff P"]
  HELP -->|"No matching topic"| EMPTY["Search empty state and clear query P"]
```

**Boundary:** An FAQ does not create a support ticket or send an email. Only show contact/send success after an approved service confirms it.

### Profile & Settings: disabled sidebar item (D); `/students/settings` (P)

**Sections when approved:** `StudentSettingsView` with server-backed account profile, privacy/preferences, and notification choices only if those fields are in the identity/profile contract. Sign-out already exists in the shared header.

```mermaid
flowchart TD
  D["Profile & Settings: sidebar disabled D"] --> READY{"Profile/settings route + API approved?"}
  READY -->|"No"| WAIT["Planned status; header account + sign-out remain"]
  READY -->|"Yes"| SETTINGS["Settings /students/settings P"]
  SETTINGS -->|"Review identity"| PROFILE["Server-supplied profile; read-only if no update contract P"]
  SETTINGS -->|"Edit supported fields"| FORM["Labeled profile / preference form P"]
  FORM -->|"Save"| RESULT{"Server confirms?"}
  RESULT -->|"Yes"| PROFILE
  RESULT -->|"No"| ERROR["Keep draft + safe error; no false saved state P"]
  SETTINGS -->|"Back to learning"| OVER["Overview /students E"]
  SETTINGS -->|"Sign out through shared header"| LOGIN["/login E after confirmed logout"]
```

**Boundary:** Never expose authentication or email-link tokens in the DOM, localStorage, logs, or a screenshot. Route visibility and local form validation do not replace backend ownership/authorization.

### Universal page-state and navigation contract

- For every navigable page: define loading, first-use empty, filtered-empty, API unavailable, error/retry, permission denied, and authorized populated states where applicable. Use `Skeleton` only while loading, not as a permanent substitute for data.
- Any successful create/join/submit/save/mark-read action must be backed by the corresponding service response. Browser-only notes/tasks/study spaces must say they are browser-only; classroom detail demos must say they are demos.
- Preserve focus after dialogs and navigation, label every field, expose validation/status messages with appropriate semantics, and keep mobile and keyboard paths equivalent to pointer paths.
- A tab, filter, dialog, or in-room panel stays on its current URL unless this plan names a destination. Register proposed routes and update the sidebar/header source together; never render a clickable item that leads to a missing route.
- When access to a class, study space, resource, or notification is revoked, show a safe unavailable state and a route back to a valid list. Do not leak record titles, student identities, feedback, or grades in errors.

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
