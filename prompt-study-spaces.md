Use only these relevant Owlio skills:
- owlio-role-workflows
- student-workflows
- study-spaces

Do not load unrelated skills.

## Task
Make the student's Study Spaces page an honest peer-collaboration surface. Every space the student sees must be traceable to a real browser-local record or be visibly labeled as a sample preview, and every create/join result must reflect what actually persisted instead of an implied server membership. Improve the create and join-by-code feedback (pending, success, failure) without inventing a study-space API.

## Workspace and target
- Workspace: Student
- Page: Study Spaces
- Current route: /students/study-spaces
- Keep the shared My Classes page, the standalone Meeting Room, and unrelated role pages unchanged.

## Scope
In:
- Inspect and improve the existing Study Spaces page: the "Spaces you create" and "Spaces you join" rails, CreateSpaceDialog, and JoinSpaceDialog.
- Make the browser-local persistence and its failure modes visible and truthful: loading, saving, saved, and failed states for create and join.
- Keep sample preview spaces distinguishable from the student's own saved records.
- Keep the current student-only route and its sidebar entry unchanged.

Out:
- Do not add a study-space backend endpoint, service, or permission; no confirmed study-space API contract exists.
- Do not reuse /api/v1/classrooms or /api/v1/classrooms/join for peer spaces; those are official-classroom endpoints.
- Do not add a /students/study-spaces/:spaceId detail route, member list, shared resources/tasks, discussions, polls, or announcements.
- Do not add invitation links, expiring codes, duplicate-code handling, or space administration permissions.
- Do not change educator, ESL teacher, or tutor navigation or pages; study-space creation eligibility outside the student workspace is an open product decision.
- Do not change /students/materials or /students/communication, which link to this page.
- Do not flip API_INTEGRATION_ENABLED in src/lib/api-mode.ts without owner approval.

## Authoritative context to inspect
1. Read the Student workflow plan's Study Spaces requirements, route inventory, click-through flow, data-boundary rules, and acceptance criteria:
   OWLIO_STUDENT__WORKFLOW_PLAN.md
   - "Study Spaces" section: purpose, separating spaces the student owns from spaces they joined, browser-local create/join, invite codes that are not verified.
   - Route inventory row for Study Spaces: /students/study-spaces exists, while the /students/study-spaces/:spaceId detail route stays proposed until real membership is supported.
   - The Study Spaces flow diagram and its boundary statement ("current joined records are local and do not prove membership").
   - Data-boundary rules: browser-only notes/tasks/study spaces must say they are browser-only, and any successful create/join/save must be backed by the corresponding service response.
   - Data status table: the Study Spaces feature folder is localStorage/demo preview; membership and invite code are not server-verified.
   - Open questions: confirm study-space creator/member permissions and whether spaces are student-only; add server-backed Study Spaces with confirmed membership, invitation, ownership, and sharing behavior.
2. Inspect the current route in src/main.tsx and the components used by /students/study-spaces:
   - src/pages/dashboard/students/study-spaces/index.tsx (thin adapter)
   - src/components/features/personal-workspace/study-spaces/study-spaces-view.tsx (the Study Spaces screen)
   - src/components/features/personal-workspace/study-spaces/study-spaces-records.ts (record type, storage key owlio.student-study-spaces.v1, load/save helpers, sample seeds, guidance strings)
   - src/components/features/personal-workspace/study-spaces/create-space-dialog.tsx and join-space-dialog.tsx (current create/join forms)
   - src/components/features/personal-workspace/study-spaces/space-circle-rail.tsx (rails, action circle, empty state)
   - src/components/common/dashboard-navigation.ts (the /students/study-spaces sidebar entry)
3. Confirm from source that no study-space API exists. src/services/api/ contains api.types.ts, api-error.ts, api-health.service.ts, auth.service.ts, classroom.service.ts, and meeting.service.ts only. classroom.service.ts is scoped to official classrooms: GET /api/v1/classrooms, POST /api/v1/classrooms, POST /api/v1/classrooms/join with body { joinCode }, returning ApiClassroom with access 'owner' | 'student'. getApiErrorMessage(error, fallback) in src/services/api/api-error.ts is the shared error-message pattern.
4. Check AGENTS.md and the selected skills for route, ownership, accessibility, and authorization rules.

Known plan context:
- A study space is peer collaboration, not an official classroom. It never carries official grades, attendance, educator feedback, or classroom progress.
- The page is browser-local today. loadStudySpaces() seeds sample records on first visit and falls back to those samples whenever storage is empty or unparseable, so sample spaces can currently appear as the student's own spaces.
- saveStudySpaces() swallows write failures, so a space can currently be reported as added even when nothing persisted.
- JoinSpaceDialog collects a space name typed by the student plus a code that no service verifies, so a "joined" rail entry can be an arbitrary self-entered name.
- src/lib/api-mode.ts currently exports API_INTEGRATION_ENABLED = false, so connected calls are paused. Treat re-enabling as an owner decision, not a side effect of this task.

## Non-negotiable boundaries
- A space shown in a rail is either a record that actually persisted in this browser or is labeled as a sample/demo preview. Never present a sample or a self-entered name as a confirmed peer membership.
- Do not describe a browser-local space as synced, shared, verified, or joined by a server.
- A visible route or control does not establish membership or access; the backend is authoritative, and no study-space backend exists yet.
- Do not expose other students' data, private class records, learner records, grades, attendance, or educator feedback in a peer space.
- Do not invent invite-code verification, expiration, duplicate-code, permission, or moderation behavior, and do not implement invitation links.
- Do not inspect or include .env values, credentials, tokens, or learner records in the prompt or output.
- If the work needs a server-backed space, membership, or sharing contract, stop and report it as an unresolved backend dependency instead of guessing an endpoint.

## Acceptance criteria
- The existing student-prefixed route remains /students/study-spaces, and the sidebar entry and page title still read Study Spaces.
- Sample preview spaces are visibly labeled and separable from the student's own saved records; a storage read or parse failure never silently displays sample spaces as the student's own.
- Create and join both show a pending state, prevent duplicate submission while a request is in progress, and report success only after the record actually persisted; a failed write leaves the student with a clear next step and does not add the record to a rail.
- Join feedback states plainly that the code is not verified by a service and that membership is browser-local; a failed or unverified join never implies an active peer membership.
- Each space shows its relationship to the student (created vs joined), and the joined rail does not imply a shared, connected space.
- Applicable loading, first-use empty, and unavailable/error states exist and match the real data source.
- The flow works with keyboard and touch, has labeled controls and visible focus, and uses appropriate status/alert semantics for pending, success, and error messages.
- No unrelated role, route, or feature is changed, and no dependency or configuration is added.

## Validation and handoff
- Verify create/join behavior against the actual local-storage code path in study-spaces-records.ts, including a write-failure and a parse-failure case.
- Run relevant tests if available (npm test), focused lint, npm run build, npm run lint when feasible, and git diff --check. Separate pre-existing failures (the AGENTS.md lint baseline in src/components/ui) from newly introduced ones.
- Report changed files, behavior, checks actually run, and any unresolved API or product dependency.
