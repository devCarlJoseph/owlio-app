# Classroom API integration

## Discussion feed and class comments — 17 November 2026

The classroom **Discussion** tab (`/:workspace/classrooms/:classroomId?tab=feed`) now uses a single feed surface with author avatars, timestamps, linked post text, reaction pills, participant previews, expandable class comments, and an educator composer. The supplied reference applies only to this discussion surface; the dashboard and classroom navigation remain intact. Initial avatars use existing Owlio components. Unsupported attachments are omitted.

The matching backend source adds `GET/POST /api/v1/classrooms/:classroomId/posts`, `GET/POST /api/v1/classrooms/:classroomId/posts/:postId/comments`, and `POST /api/v1/classrooms/:classroomId/posts/:postId/reactions`. Only the teaching owner publishes posts. The owner and currently enrolled students read, comment, and react; archived history is read-only. Permissions are rechecked transactionally by the backend, independently of URL context. Failed saves retain drafts, post/comment retries reuse request IDs, and reactions set an explicit desired state. Posts/comments use timestamp/UUID cursor pages; the newest post page and open comment threads refresh every ten seconds. Account/classroom changes discard view state and reject late results. There is no mock fallback or browser-local persistence.

Backend migration `0046_classroom_discussion` creates three additive tables and their constraints/indexes. It has been generated and reviewed locally, **not applied to a database**. Release the migration and matching API before relying on this tab in a deployed environment. Migration application needs approval for the exact database and operation; no deployment or live database writes were included here. Component/service and fake-repository/HTTP checks do not prove live persistence. Browser visual comparison remains unverified because local browser access failed.

Verification for this change: 56 frontend classroom/service tests passed; TypeScript/Vite build, changed-file ESLint, and diff checks passed. Full frontend lint reports 13 existing Fast Refresh export errors in untouched shared UI files. Backend discussion HTTP/repository checks passed; the full suite recorded 724 passes and one contract-generation timeout, and all seven contract tests passed when rerun in isolation. Backend TypeScript/build and migration metadata checks passed; backend lint has zero errors and eight warnings in untouched services. No live database or viewport comparison was performed.

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

Classroom discussion is integrated as described above. Classwork, quizzes/submissions, materials, attendance, progress, and membership edits are not integrated into these frontend tabs. Current backend source contains additional modules; unavailable frontend tabs do not imply missing backend endpoints. Schedule and Meeting Room now have separate connected screens using classroom sessions and native-meeting contracts. Decorative classroom cover artwork is presentation. Missing subject/instructor metadata is not invented.

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
