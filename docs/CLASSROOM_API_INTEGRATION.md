# Classroom API integration

## Classroom Grades & Feedback

School classrooms expose **Grades & Feedback** at `/students/classrooms/:classroomId?tab=progress` and `/educators/classrooms/:classroomId?tab=progress`. Owners page through the roster and activities and can inspect drafts and releases. Learners use the self-scoped gradebook and see scores and written feedback only after the educator releases them. A submitted quiz or assessment also displays its released score and feedback in Classwork. Opening or refreshing the grades tab reads the current gradebook, and each row links to its original activity.

The owner projection uses `GET /classrooms/:classroomId/gradebook` with independent learner and classwork cursors. The learner projection uses `GET /classrooms/:classroomId/gradebook/me`. The details panel reads `GET /submissions/:submissionId/evaluation` for owners and `GET /submissions/:submissionId/result` for a learner's released result. These paths use the existing authenticated API under `/api/v1`.

Educators assign **Prelim**, **Midterm**, **Semi-finals**, or **Finals** when drafting Classwork. The period filter groups activities by their saved assignment. Published scored activities count toward their assigned period. Once their deadlines close and submitted results are released, educators can review and explicitly release each student's period grade. The API divides total earned by total possible, counts missing work as zero, and rounds to two decimals. Existing work without a period and feedback-only work are excluded. Each release is a snapshot. The first release for a period locks publication of additional scored work in that period.

Each released submission has a private comment thread for its author and the current classroom owner. Educators can revise published written feedback from the details panel. The API versions the revision and retains prior text. The released score, rubric, and release metadata are preserved.

Period assignment, period releases, private comments, and feedback revisions require the matching Owlio API release and additive migration `0049_classroom_grades_and_periods`. The migration was generated locally. Database application and live writes require separate authorization.

## Classwork theme alignment — 17 November 2026

Student and educator Classwork surfaces use semantic brand/brand-soft colors for badges, activity icons, selected answers, finish/submit actions, timeline markers, active activity buttons, progress fills, and correct-answer checks. Lime/green decorative accents from the original reference were removed at the user's request. Error and missing states retain destructive colors and text labels. This is a scoped presentation change with no API, grading, deadline, or data changes. Browser rendering remains unverified because the available browser cannot reach the local server.

## Educator student work and grading — 17 November 2026

Published activity details now have **Quiz form / Assessment form** and **Student work** tabs. The existing progress card also opens Student work. An activity-scoped React context owns the active panel and selected submission; both tab panels remain mounted so switching tabs preserves the selected student, entered grade/feedback, and form state without replacing the classroom shell. Changing activity/account resets that context. Learners never receive the educator tabs or grading reads.

Student work lists every authorized submitted attempt, including submissions from formerly enrolled students with a neutral name when their identity is absent from the current roster. Pending current learners appear separately and become Missing at the cutoff. Review compares each persisted choice with the owner's answer key, shows unanswered items and written responses, and loads the selected attempt's existing server advisory count. That count is a review aid, not an official grade. A convenience button copies the correct count only when the configured maximum equals the question count (explicitly one point per question); other scales remain educator-entered whole numbers without an invented weighting/rounding policy.

Grading uses the existing mounted `GET/PUT /submissions/:submissionId/evaluation`, `POST /submissions/:submissionId/evaluation/release`, `GET /submissions/:submissionId/assessment-score`, and `GET /classwork/:classworkId/rubric` contracts from the adjacent API source. Saves use the observed evaluation version and remain private. Release is a separate explicit action, uses the saved version, rejects unsaved edits, and confirms completion only after the API response. Existing rubrics accept criterion scores and require complete matching totals before release; released/corrected evaluations display read-only here. Reload is explicit, failed saves retain input, and cancellation/keyed scopes prevent stale reads from crossing activities/students/accounts. Submission, evaluation, and advisory identifiers are checked against the selected scope before showing controls. Backend ownership, publication, scoring, and concurrency checks remain authoritative.

The draft editor now exposes the existing optional `maxPoints` field (whole number 1–10,000). It must be configured before publishing for numeric grading. Blank remains feedback-only; already-published feedback-only work cannot gain a numeric maximum through this UI. New scored work or a new revision is required. The Classwork type picker now uses the existing project shadcn/Base UI Select wrapper. No dependencies, API mode, backend source, schema, migration, or live academic records were changed. Tests mock HTTP/services; deployed grading, database persistence, and rendered desktop/mobile layouts remain unverified.

## Educator deadline controls — 17 November 2026

Classwork creation, draft-save, and publish actions use the existing brand theme colors. The create/edit deadline field uses a project-owned expandable calendar with month navigation, selected/today states, keyboard day navigation, text-based hour/minute fields, AM/PM controls, Clear, and Done. It does not use native date/time inputs or install a calendar dependency. Escape closes the picker and restores trigger focus. Invalid time values cannot produce a deadline; the existing future-deadline validation remains authoritative in the form.

The picker initializes from the draft's local time and supplies the unchanged local `dueAt` form value. The existing adapter converts it to an absolute ISO timestamp for the API, preserving the fixed class-wide cutoff and time-zone disclosure. No backend or persistence format changes are included. Focused interaction tests cover leap day, month-boundary keyboard navigation, midnight/noon, invalid times, clearing, disabled state, and the educator creation flow. Browser rendering remains unverified due to local-browser connectivity limitations.

## Classwork progress sidebar — 17 November 2026

Only the Classwork tab replaces the class details/invite/meeting-code sidebar with the supplied timeline-style progress panel. The classroom shell gives this tab the full content area; the Classwork view owns its content and 17rem sidebar grid, which stacks on narrow screens. Other tabs retain their existing sidebars. Activity deep links use the same progress panel.

The timeline shows actual classwork titles, closing times, time remaining, and saved submission states, with buttons that open the corresponding activity. Students see their own submitted-activity count and saved quiz-answer count; successful draft saves and submissions update the panel. Owners can select published work to read submission counts against the paginated current roster and refresh explicitly. Duplicate submission attempts and outsiders do not inflate counts. Pending becomes Missing after closing. Draft classwork remains private. There is no live typing, per-student unsaved-answer tracking, grade inference, or fictional lesson content. Existing services and deadline enforcement remain unchanged; no backend change is needed for this sidebar.

Component tests cover sidebar replacement, saved-answer updates, owner counts, privacy, deadline transitions, and error/retry behavior. Rendered comparison remains unverified because the available in-app browser cannot reach the local development server.

## Classwork and fixed closing times — 17 November 2026

The classroom **Classwork** tab and existing `/:workspace/classrooms/:classroomId/classwork/:activityId` links now use the mounted classwork/question/submission APIs. Classroom owners can create drafts, edit draft instructions and a required future closing time, add/remove single-choice questions with answer keys, review, and publish. A question-based item is presented as a Quiz; an item without questions is a written Assessment. This is derived from the existing content model, not a new stored type. Drafts are owner-only; students see only published work in classrooms available to their account. Failed reads remain errors with retry, and a saved draft whose initial question fails is opened with an explicit partial-success notice instead of being recreated.

Students can select answers or write a response (up to the existing 6,000-character API limit), explicitly save a draft, reload saved work, and finalize. Saving a draft is not submission. Saves and finalization send the observed version; failed writes retain entered content. Published instructions and submitted work remain read-only. Owners can refresh the paginated roster/submission collection and review submitted responses. Grading is connected as described above; there is no automatic score release, file-upload UI, meeting UI, lesson plan, or per-student countdown.

The owner chooses one absolute closing date and time for everyone; the form and detail display the browser's time zone. At and after that time, the client locks unsubmitted work and derives **Missing** from publication, deadline, and the learner's submission state. Existing accepted submissions stay Submitted. Missing is not a new stored submission status or a grade. The frontend uses the existing cookie/CSRF helpers, cancellation and keyed account/classroom cleanup. No global API-mode or dependency changes were made.

The adjacent `owlio-api` checkout adds a finalization check using the database clock inside the scoped submission transaction: `POST /classwork/:classworkId/submissions/me/submit` rejects new finalizations at or after `dueAt` with `409 CLASSWORK_CLOSED`. It preserves successful retries after closing and historical accepted late records. Null-deadline legacy work is unchanged. Draft/file APIs remain unchanged; the deadline blocks submission. **Release both changes together**; a browser clock alone cannot enforce the policy. No schema migration was added or applied. See backend `docs/CLASSWORK_DEADLINES.md` for the policy.

The supplied reference screenshot guides only the Classwork content: instructions, numbered questions, two-column choices, lime selections, and finish action. Meeting controls, lesson timeline, and unrelated tabs were excluded. Behavioral tests use mocked API data and backend fake PostgreSQL queries. The attempted in-app browser render timed out connecting to the local server; screenshot fidelity and narrow-screen rendering remain unverified. No live classwork records, database writes, or deployment were performed.

## Message status and reader lists — 17 November 2026

Classroom chat no longer displays the composer/mention keyboard guidelines or the standalone “Message sent to this classroom.” banner. Outgoing persisted messages show a check icon and **Sent** beside their timestamp. The message API adds `seenCount`, a count for the authenticated sender's own messages and null for other messages. Positive counts display **Seen by N** beside the time; selecting that status opens a paginated reader dialog with names and initial avatars. Counts refresh with the existing five-second newest-page poll. History retains the receipt snapshot from when its page was loaded. Sent means the server saved the message; no device-delivery, online presence, or exact reading-time claim is made.

`GET /api/v1/classrooms/:classroomId/messages/:messageId/readers` returns `{ items: [{ id, name }], nextCursor }`, using a UUID user cursor and a maximum of 50 readers per page. The sender must retain classroom access and must be the message's author. Another classroom's message or another author's message is concealed with 404, including for the teaching owner. Counts and lists exclude the sender, inactive/unverified accounts, ended enrollments, and users who no longer have classroom roles/access. Reader identities are display-only. Failed reader requests remain errors, not empty or invented lists. Closing the dialog or changing account/classroom cancels pending reads.

Receipts reuse the existing account/classroom high-water read cursor. A cursor at or beyond the message means it has been acknowledged as read, including explicit **Mark all as read**. A fully visible latest message is also acknowledged after 500 ms in a focused, visible, unfiltered chat; hidden tabs and conversation details do not trigger that acknowledgment. This is not official attendance or proof of attention. Cursor comparisons and new cursor timestamps use original PostgreSQL timestamps directly, avoiding JavaScript's millisecond truncation of PostgreSQL microseconds. Older cursors are compared through their referenced source message, so they also retain accurate ordering without a backfill.

This requires the matching API release but no additional migration beyond the previously verified 0047. Desktop (1280×720) and narrow (390×844) conversation, inline status, mention-list cleanup, and reader-dialog rendering were inspected with synthetic messages in an isolated browser fixture. No account messages or live receipts were generated by that preview; two-account delivery and production revision remain unverified.

Verification for this change: 24 focused frontend chat/service tests passed. The final backend suite passed all 738 tests using two workers; the earlier shutdown timeout also passed in isolation. TypeScript and production builds passed in both repositories. Changed-file lint and diff checks passed. Full frontend lint retains 13 existing Fast Refresh export errors in untouched shared UI files; backend lint retains eight existing warnings in untouched services.

## Unread messages and mentions — 17 November 2026

Classroom Chat shows the server's total message count, unread count, and unread mention count. **View all unread messages** follows timestamp/UUID history pages to the first unread message, scrolls to and highlights it, and acknowledges that message. Scrolling to the bottom in a visible, focused conversation acknowledges the loaded latest message; **Mark all as read** explicitly acknowledges through that same message. Own messages do not count as unread. Read cursors belong to the account/classroom, only advance, and survive offline periods and device changes. Existing accounts without a cursor initially see all other authors' history as unread. New messages do not force scrolling while unread messages are present or the user is reading earlier history.

The composer suggests mentions inline when typing `@` and the first letters of a member's first or last name. There is no separate member-search field; focus stays in the message. Arrow keys choose a suggestion, Enter inserts it without sending, and Escape dismisses the list. Clicking **Mention someone** inserts `@` at the caret. Suggestions read the existing authorized member directory, including cursor pages, and filter locally while typing. Selecting a member attaches their ID to the message; removing or changing the mention text removes that target from the send. The teaching owner can type or select **@students** to target all currently enrolled students. The backend rejects group mentions from learners and individual targets outside the classroom. Mention metadata participates in request-ID retry checks. Message and deduplicated recipient notifications commit together, excluding the sender.

The notification bell shows an unread classroom-mention badge. Its authenticated panel/full inbox shows saved classroom mentions, refreshes every ten seconds, and links directly to the mentioned chat message, including older pages. The notification response provides message/classroom display context only while the recipient retains classroom access; revoked sources are omitted from this feed. Other notification categories retain the separate account-record view and the explicit example layout. Alerts are in-app only; email and browser push are not part of this feature. Chat refresh remains five seconds. Account changes cancel reads and discard old view state.

Additive routes: `GET /api/v1/classrooms/:classroomId/messages/unread` returns `{ total, unreadCount, mentionCount, firstUnread: { id, createdAt } | null }`; `POST .../messages/read` accepts `{ messageId }`. Existing sends accept optional `mentionUserIds` (up to 50 unique UUIDs) and `mentionStudents`; history includes these fields. Writes preserve cookie/CSRF helpers and backend scope checks. `GET /users/me/notifications` adds nullable `classroomMention` display context for scoped `CLASSROOM_MENTION` records.

Verification: 98 relevant frontend classroom/notification/service tests passed; the final focused regression rerun passed all 17 tests. Backend chat/repository/contract checks passed all 30 tests in isolation. The full backend run recorded 731 passes and a 60-second contract-generation timeout; that contract test passed in the isolated run. Both TypeScript/build checks, changed-file lint, migration metadata validation and diff checks passed. Full frontend lint still reports 13 Fast Refresh export errors in untouched shared UI wrappers; backend lint has zero errors and eight existing warnings in untouched services.

Release requires the matching API and generated migration **0047_organic_obadiah_stane**, which adds mention fields and an account/classroom read-cursor table. On 17 November, after the user reported applying the migrations, a read-only metadata check confirmed that the configured backend database has migrations 0046 and 0047 with matching SQL checksums, 48 journal entries, and the expected discussion/read-cursor tables and mention columns. The agent did not apply migrations. Other environments require independent verification; deployed API revision and live two-account delivery remain unverified.

The inline mention composer was rendered in an isolated browser fixture using synthetic members at 1280×720 and 390×844. Typing/filtering, focus retention, keyboard insertion and the owner group suggestion were inspected; no account messages were sent. This verifies component layout, not the complete authenticated classroom flow. Automated UI/HTTP/repository checks use fixtures and fake PostgreSQL clients.

## Discussion feed and class comments — 17 November 2026

The classroom **Discussion** tab (`/:workspace/classrooms/:classroomId?tab=feed`) now uses a single feed surface with author avatars, timestamps, linked post text, reaction pills, participant previews, always-visible class comments and reply fields, and an educator composer. The supplied reference applies only to this discussion surface; the dashboard and classroom navigation remain intact. Initial avatars use existing Owlio components. Unsupported attachments are omitted.

The matching backend source adds `GET/POST /api/v1/classrooms/:classroomId/posts`, `GET/POST /api/v1/classrooms/:classroomId/posts/:postId/comments`, and `POST /api/v1/classrooms/:classroomId/posts/:postId/reactions`. Only the teaching owner publishes posts. The owner and currently enrolled students read, comment, and react; archived history is read-only. Permissions are rechecked transactionally by the backend, independently of URL context. Failed saves retain drafts, post/comment retries reuse request IDs, and reactions set an explicit desired state. Posts/comments use timestamp/UUID cursor pages; the newest post page and visible comment threads refresh every ten seconds. Account/classroom changes discard view state and reject late results. There is no mock fallback or browser-local persistence.

Backend migration `0046_classroom_discussion` creates three additive tables and their constraints/indexes. It has been generated and reviewed locally, **not applied to a database**. Release the migration and matching API before relying on this tab in a deployed environment. Migration application needs approval for the exact database and operation; no deployment or live database writes were included here. Component/service and fake-repository/HTTP checks do not prove live persistence. Browser visual comparison remains unverified because local browser access failed.

Verification for this change: 56 frontend classroom/service tests passed; TypeScript/Vite build, changed-file ESLint, and diff checks passed. Full frontend lint reports 13 existing Fast Refresh export errors in untouched shared UI files. Backend discussion HTTP/repository checks passed; the full suite recorded 724 passes and one contract-generation timeout, and all seven contract tests passed when rerun in isolation. Backend TypeScript/build and migration metadata checks passed; backend lint has zero errors and eight warnings in untouched services. No live database or viewport comparison was performed.

## Banner instructor identity — 17 November 2026

The classroom banner places the instructor identity and classwork/meeting actions beneath the title. Owner accounts use their known instructor name. When the classroom metadata lacks that name for a learner, the banner reads the existing authorized member-directory endpoint and matches the classroom owner ID and the member's owner role. It follows cursor pages only until the owner is found, detects repeated cursors, aborts on unmount or identity changes, and never shows a prior classroom/account's result. Failed or missing identities remain unavailable; they do not produce fictional names. This uses the same existing endpoint/release requirement below, with no API payload or authorization change. Verification uses mocked member responses; live identity and browser rendering remain unverified.

## Member directory and conversation layout — 16 November 2026

The **Members** tab and **Chat → Conversation details → Chat members** use `GET /api/v1/classrooms/:classroomId/members`. This additive API is implemented in `owlio-api` for the owner and currently enrolled students. It returns paginated display identities (`id`, `name`, `role: owner | student`) only, with UUID cursors and the existing authenticated envelope. The frontend validates the response, cancels stale reads, deduplicates page overlaps, and reports denied/failed reads without mock fallbacks. The owner-only `/students` roster and its permissions remain unchanged. This requires releasing the matching API endpoint; no migration or dependency change is needed. UI checks use fixtures and do not establish production deployment or live database access.

Classroom chat uses a Messenger-inspired conversation layout with grouped bubbles, actual message dates/times, search, server-backed replies, a bounded shadcn message viewport, and a collapsible details/member panel. Its conversation surfaces inherit the product theme (white in light mode and dark in dark mode), with purple outgoing bubbles and a rounded composer scoped to the Chat tab. Classroom invite and meeting-code cards are omitted on this tab and remain available on the other classroom tabs. On narrow screens details replace the conversation temporarily; closing restores focus and the draft. Existing message routes, cookie/CSRF handling, five-second refresh, request-ID retry behavior, and archived/denied restrictions are unchanged. The unsupported local preview reactions were removed from classroom chat; emoji message content still uses the existing server-backed send flow. There are no fabricated typing, online, read-receipt, file-sharing, or encryption indicators.

## Classroom chat and reusable meeting codes — 15 November 2026

The existing classroom and meeting layouts now connect the requested create/enroll/chat/meeting journey. New classroom invitations use `OWLIO-` plus four random uppercase letters/digits. Each classroom also receives a reusable meeting code with eight random uppercase letters/digits, available immediately after creation and on authorized list/detail reloads. Older invitations remain accepted.

The classroom **Chat** tab reuses the existing chat layout and calls `GET/POST /api/v1/classrooms/:classroomId/messages`. History is persisted separately from temporary in-call chat, refreshed every five seconds, and supports older pages and scoped replies. Sends preserve drafts on failure and reuse request IDs on retry. Account/classroom changes abort reads and discard old conversation state. Only the current classroom owner with a teaching role or a currently enrolled learner can read/send; archived classroom history remains readable while new messages are blocked. Emoji message content is saved; the existing explicitly preview-only reactions remain local.

The classroom meeting code and existing Meeting room links lead to the existing prejoin screen. An EDUCATOR/ESL/TUTOR owner uses **Open session room** to call `POST /api/v1/classrooms/:classroomId/native-meeting`, then **Join meeting**. The API reuses an active room or creates a four-hour online session. Enrolled learners resolve the same reusable code to the currently open session and join; before the host opens, the app explains that the meeting has not started. Classroom enrollment codes and meeting codes have distinct purposes. Copied meeting URLs, legacy short meeting codes, and `OWLIO-SESSION-<UUID>` invitations remain accepted.

Live media still requires a saved, enabled LiveKit configuration on the API and jobs worker. The jobs worker handles end-for-everyone and expired room cleanup. Browser camera/microphone permissions and an actual two-account media call require live acceptance. Mocked tests do not establish those outcomes. Migration 0045 adds classroom meeting aliases and persistent chat; it requires earlier schema prerequisites, including 0043/0044. See backend `docs/CLASSROOM_MEETING_INTEGRATION.md` for the target migration record and verification.

The sections below describe the earlier integration baseline; statements about chat being unavailable or losing a persisted code on reload are superseded by this section.

The classroom list, creation, enrollment, details and owner-only roster use the existing Owlio API. The routed provider is always connected; it cannot select sample records or a preview provider. Existing provider/context names are retained to keep route adapters compatible. See [current API connection](API_CONNECTION.md) for the application-wide API-only boundary and newer personal/scheduling/meeting clients.

## Contract

- GET /api/v1/classrooms returns data.items and data.nextCursor. The adapter follows UUID cursor pages and passes cancellation signals.
- POST /api/v1/classrooms accepts name and description only, returning data.classroom and a one-time data.joinCode. Subject is no longer collected because the API does not persist it.
- POST /api/v1/classrooms/join returns an enrollment. The adapter fetches the authorized classroom using enrollment.classroomId; it does not treat enrollment as classroom data. If that fetch fails after enrollment, the error explicitly reports that enrollment was confirmed.
- GET /api/v1/classrooms/:id/students is requested only for owned classrooms and supports student-cursor pagination. Students do not request this endpoint.

Ownership is derived from the server record's ownerId and authenticated user ID, not URL prefixes or fabricated access flags. Backend authorization remains authoritative. EDUCATOR, ESL and TUTOR can manage their own classes after deploying the matching backend permission update. Students can enroll and read their own memberships. Admin access is not implicitly expanded.

The provider starts empty, replaces data on successful loads, and clears it on load failures. Account/role changes remount the classroom session and discard its data and invite codes; aborted/late requests cannot populate another account's session. Join codes remain in React memory only for the creating account and are not stored in localStorage. Reloading or signing out loses the code; retrieval/rotation is not supported yet.

## Available and unavailable screens

Create/list/join/detail and teacher roster are connected. Empty, loading, error/retry, confirmed-success and permission-denied states replace demo fallbacks. The existing grid/list toggle, classroom cards, route prefixes, tabs and keyboard-accessible dialogs are retained.

Classroom discussion and Classwork are integrated as described above. Materials, progress, and membership edits are not integrated into these frontend tabs. Current backend source contains additional modules; unavailable frontend tabs do not imply missing backend endpoints. The classroom Schedule tab now reads the existing paginated classroom sessions API, with calendar/list views, local-time event details, refresh/retry, and owner-only scheduling through the existing cookie/CSRF service. Exams are titled sessions (for example, Mock exam), without a new exam type or grading behavior. Students can view schedules but cannot create them. Cancelled sessions remain labeled; no editing, deletion, recurrence, or reminder delivery is added. Account/classroom changes discard tab state and cancel reads. Separate Schedule and Meeting Room screens retain their existing contracts. Mocked component/service checks cover these flows; rendered comparison and live persistence are unverified. Decorative classroom cover artwork is presentation. Missing subject/instructor metadata is not invented.

### Classroom and online-meeting attendance

The classroom Attendance tab now uses the existing attendance management contracts. Owners choose a session by month and see the current paginated student roster with explicit Present, Late, Absent, Excused, and unrecorded states. Four summary cards, learner search, status filtering, refresh, and CSV export use the loaded register; missing records never become automatic absences. Cancelled sessions are read-only. Status selection saves one learner immediately through the cookie/CSRF mutation helper: new records send version 0 and `MANUAL_ROLL_CALL`, corrections send the observed version and `TEACHER_CORRECTION`. A failed or conflicting write shows an error and reloads; it never claims success. The backend remains the owner/enrollment authority. Historical records for learners no longer in the current roster are outside this register's current scope.

Connected meeting hosts with a teaching role can open **Take attendance**. The dialog resolves the exact meeting session against the authenticated owner's classroom session lists, then mounts the same register and links to that classroom's Attendance tab. Both surfaces read/write the same server session records, without local copies or presence-based marking. Opening/reopening or explicitly refreshing the register loads current saved values; there is no attendance polling or push subscription. Learners use only `GET /classrooms/{classroomId}/attendance/me` and cannot open the owner register through the classroom tab.

Contract evidence: sibling `owlio-api` attendance management routes, service, schema, and repository confirm owner checks, current enrollment, scheduled-session writes, UUID pagination, version conflicts, and audit reason codes. No backend changes or migrations are introduced. Mocked tests cover client persistence semantics and cross-screen reads; deployed persistence and rendered reference/narrow-screen comparison remain unverified because the browser could not reach the local server and Windows browser control stopped before navigation.

## Setup and verification

Start both projects with their npm run dev commands. Preserve credentialed Axios/cookie/CSRF configuration and use the same browser host consistently. The backend's frontend origin must match exactly. The frontend no longer has a preview-mode setting. No dependency or database schema changes are made by this frontend integration.

Classroom tables must already exist in the target development database. This work does not apply migrations or inspect a live database. Review pending migration history before any separately approved database migration; do not automatically apply unrelated legacy-auth drops. See the backend docs/CLASSROOM_API.md.

Frontend checks: npm test -- --pool=threads; npm run build; focused ESLint on classroom/API files; full npm run lint; git diff --check. Backend checks: npm test; npx tsc --noEmit; npm run lint. Service/component tests mock HTTP; they do not prove live database, browser cookie or SMTP/provider integration.

Manually verify: educator/ESL/tutor creates a class, saves the one-time code, student joins, owner reads the roster, outsider is denied, and logout/account switching clears previous data. Those live browser/database checks have not been run by this change.

## Verification recorded October 28, 2026

- Frontend: 207 tests passed (26 files), using threads.
- Frontend TypeScript/Vite build: passed; Vite reports large bundle chunks.
- Focused ESLint for classroom source/tests and the API adapter: passed.
- Full frontend lint: 13 existing react-refresh/only-export-components errors in shared UI wrappers; none in the changed classroom files.
- Backend: 149 tests passed; TypeScript, lint and build passed.
- Both repository diff checks: passed.
- No live database, browser session or provider checks were run. No migrations, dependencies or private environment files were changed.

## Changed files

Frontend:

- `docs/CLASSROOM_API_INTEGRATION.md`
- `src/components/features/classrooms/view/classroom-activity-view.tsx`
- `src/components/features/classrooms/tests/classroom-chat.test.tsx`
- `src/components/features/classrooms/view/classroom-classwork-view.tsx`
- `src/components/features/classrooms/tests/classroom-detail-tabs.test.tsx`
- `src/components/features/classrooms/view/classroom-detail-view.tsx`
- `src/components/features/classrooms/tests/classroom-discussion.test.tsx`
- `src/components/features/classrooms/forms/classroom-form-dialogs.tsx`
- `src/components/features/classrooms/tests/classroom-members-view.test.tsx`
- `src/components/features/classrooms/view/classroom-members-view.tsx`
- `src/components/features/classrooms/classroom-mock-data.ts`
- `src/components/features/classrooms/context/classroom-prototype-provider.tsx`
- `src/components/features/classrooms/tests/classroom-quiz.test.tsx`
- `src/components/features/classrooms/view/classroom-records-view.tsx`
- `src/components/features/classrooms/tests/classroom-test-data.ts`
- `src/components/features/classrooms/tests/classroom-test-fixtures.tsx`
- `src/components/features/classrooms/types/classroom-types.ts`
- `src/components/features/classrooms/tests/classrooms-view-accessibility.test.tsx`
- `src/components/features/classrooms/tests/classrooms-view.test.tsx`
- `src/components/features/classrooms/view/classrooms-view.tsx`
- `src/components/features/classrooms/view/quiz-workspace.tsx`
- `src/services/api/classroom.service.test.ts`
- `src/services/api/classroom.service.ts`

Backend:

- `docs/CLASSROOM_API.md`
- `src/lib/access-policy.ts`
- `src/routes/v1/classroom-security.test.ts`
- `src/services/classroom/classroom-service.test.ts`

The existing frontend src/lib/api-mode.ts edit was preserved and is not part of this implementation. No files were staged and no commits were created.
