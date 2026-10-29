# Classroom API integration

The classroom list, creation, enrollment, details and owner-only roster now use the existing Owlio API. Runtime classroom sample records have been removed. Tests use explicit fixtures; those fixtures are not imported by product code. Existing provider/context names are retained to keep route adapters compatible.

## Contract

- GET /api/v1/classrooms returns data.items and data.nextCursor. The adapter follows UUID cursor pages and passes cancellation signals.
- POST /api/v1/classrooms accepts name and description only, returning data.classroom and a one-time data.joinCode. Subject is no longer collected because the API does not persist it.
- POST /api/v1/classrooms/join returns an enrollment. The adapter fetches the authorized classroom using enrollment.classroomId; it does not treat enrollment as classroom data. If that fetch fails after enrollment, the error explicitly reports that enrollment was confirmed.
- GET /api/v1/classrooms/:id/students is requested only for owned classrooms and supports student-cursor pagination. Students do not request this endpoint.

Ownership is derived from the server record's ownerId and authenticated user ID, not URL prefixes or fabricated access flags. Backend authorization remains authoritative. EDUCATOR, ESL and TUTOR can manage their own classes after deploying the matching backend permission update. Students can enroll and read their own memberships. Admin access is not implicitly expanded.

The provider starts empty, replaces data on successful loads, and clears it on load failures. Account/role changes remount the classroom session and discard its data and invite codes; aborted/late requests cannot populate another account's session. Join codes remain in React memory only for the creating account and are not stored in localStorage. Reloading or signing out loses the code; retrieval/rotation is not supported yet.

## Available and unavailable screens

Create/list/join/detail and teacher roster are connected. Empty, loading, error/retry, confirmed-success and permission-denied states replace demo fallbacks. The existing grid/list toggle, classroom cards, route prefixes, tabs and keyboard-accessible dialogs are retained.

Classroom discussion, chat, classwork, quizzes/submissions, materials, schedule, attendance, progress, membership edits and classroom-linked meetings have no matching backend endpoints in this API slice. Those tabs show unavailable states; they do not fabricate records or save browser-local mutations. Standalone meeting functionality elsewhere in the app is outside this change. Decorative classroom cover artwork is retained as presentation. Missing subject, instructor and schedule metadata is not invented.

## Setup and verification

Start both projects with their npm run dev commands. Preserve the existing credentialed Axios/cookie/CSRF configuration and your local API-mode setting. Restart the backend to load the teaching-role permission update. Use the same browser host consistently. No dependency or database schema changes are required by this integration.

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
- `src/components/features/classrooms/classroom-activity-view.tsx`
- `src/components/features/classrooms/classroom-chat.test.tsx`
- `src/components/features/classrooms/classroom-classwork-view.tsx`
- `src/components/features/classrooms/classroom-detail-tabs.test.tsx`
- `src/components/features/classrooms/classroom-detail-view.tsx`
- `src/components/features/classrooms/classroom-discussion.test.tsx`
- `src/components/features/classrooms/classroom-form-dialogs.tsx`
- `src/components/features/classrooms/classroom-members-view.test.tsx`
- `src/components/features/classrooms/classroom-members-view.tsx`
- `src/components/features/classrooms/classroom-mock-data.ts`
- `src/components/features/classrooms/classroom-prototype-provider.tsx`
- `src/components/features/classrooms/classroom-quiz.test.tsx`
- `src/components/features/classrooms/classroom-records-view.tsx`
- `src/components/features/classrooms/classroom-test-data.ts`
- `src/components/features/classrooms/classroom-test-fixtures.tsx`
- `src/components/features/classrooms/classroom-types.ts`
- `src/components/features/classrooms/classrooms-view-accessibility.test.tsx`
- `src/components/features/classrooms/classrooms-view.test.tsx`
- `src/components/features/classrooms/classrooms-view.tsx`
- `src/components/features/classrooms/quiz-workspace.tsx`
- `src/services/api/classroom.service.test.ts`
- `src/services/api/classroom.service.ts`

Backend:

- `docs/CLASSROOM_API.md`
- `src/lib/access-policy.ts`
- `src/routes/v1/classroom-security.test.ts`
- `src/services/classroom/classroom-service.test.ts`

The existing frontend src/lib/api-mode.ts edit was preserved and is not part of this implementation. No files were staged and no commits were created.
