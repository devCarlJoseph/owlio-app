# API connection

Updated 14 November 2026. Backend contract evidence is the adjacent `owlio-api` checkout: mounted `src/routes/v1/index.ts`, auth/classroom/personal/notification/session/native-meeting route files, their Zod schemas, controllers, services, and repository response fields. This is frontend work; backend configuration, dependencies, providers, and database migrations were not changed.

## Configuration and authentication

`VITE_API_URL` is the public API **origin**, defaulting to `http://localhost:7000`. Do not include `/api/v1`, credentials, query parameters, or fragments. The Axios client adds full route paths, sends credentials, and has a 15-second timeout. It does not rewrite localhost to a different host.

The backend must allow the exact frontend origin through `FRONTEND_URL`, normally `http://localhost:5173`. Use one host consistently; `localhost` and `127.0.0.1` are different origins. Restart Vite after configuration changes. Keep production cookie/HTTPS and provider settings in the backend.

Owlio authentication uses HttpOnly access/refresh cookies and in-memory CSRF, not a frontend API key. Every POST/PATCH/DELETE uses the CSRF helper. Only a 403 `INVALID_CSRF` triggers one token refresh and replay; authorization, conflicts, network errors, and expired feature mutations are not automatically replayed. Session restoration/refresh remains separate.

## Connected frontend inventory

| Feature | API behavior |
| --- | --- |
| Auth/account security | Existing register, verification, login, cookie refresh, logout, password recovery/reset, Google sign-in/linking, and API-derived role guards. Local onboarding redirects to registration. |
| Overview | Real identity and classroom collection/count; no invented metrics. |
| Classrooms | List/create/join/detail and owner roster. Uses existing ownership, pagination, cancellation, partial-enrollment handling, and in-memory one-time invite codes. |
| Student subjects | `/users/me/subjects`: paginated active list, create, versioned edit, archive. The form collects only persisted name and description. |
| Student tasks | `/users/me/tasks`: list/create/edit/complete/reopen. Sends observed `expectedVersion`; personal completion is not a grade. |
| Student notes | `/users/me/personal-notes`: list/create/versioned edit/delete, optional account-owned subject. Drafts remain after failed saves. No automatic import from local storage. |
| Notifications (all roles) | `/users/me/notifications`: paginated list and individual read confirmation. No sample inbox or unconfirmed read state. |
| Schedule (all roles) and tutor sessions | Selected classroom, month window (UTC), time/id pagination; owners can create dated sessions in their local timezone. Session links lead to Meeting Room. |
| Meeting Room | Open/join/end use `/sessions/:sessionId/native-meeting`, `/join`, `/end`, with empty JSON objects. LiveKit connects using the returned `url` and short-lived `token`. Host controls use server `isHost`. |
| In-call information | HTTP room state, authorized media directory, latest 50 chat messages, idempotent chat sends, and versioned own-hand changes. Reads poll sequentially every five seconds and abort on unmount. Access failures disconnect media. No LiveKit data publishing. |

Response records for the new personal/schedule/meeting clients are runtime-validated. UUID cursor loops fail explicitly. Connected records are cleared on account/role/path remounts; late/aborted account reads cannot populate another account's screen. Mutation success uses server confirmation and is not inferred from local edits.

## Removed preview entry points and remaining work

Protected routes always require a session and assigned role. The application has no preview-mode switch, role-switch preview banner, sample dashboard, sample classroom fallback, local onboarding route, meeting layout/whiteboard preview link, or interactive auth example quiz. Query parameters such as `layout-preview` and `whiteboard-preview` do not activate those screens. Legacy room IDs are not reinterpreted as scheduled-session IDs; use `?session=<UUID>` or `OWLIO-SESSION-<UUID>`.

The workspace content boundary prevents the older local/sample page implementations from mounting. Existing local files, notes, tasks, subjects, and study-space storage are left untouched. Retained source and isolated tests for old local tools are not evidence that those tools remain routed.

**Not all backend modules have frontend integrations yet.** Classwork/submissions/evaluations, discussions, materials/uploads/editors, study spaces, attendance/gradebook/progress, teaching plans/private notes/learner management, account profile/settings, and AI screens currently show unavailable states. Their backend capabilities vary; this frontend state does not claim that corresponding backend routes are missing. These workflows require separate typed adapters, UI integration, and verification before enabling them.

Native calls additionally require the backend's explicit `NATIVE_MEETINGS_ENABLED`, configured LiveKit service and worker, eligible owned/enrolled classroom membership, and a scheduled online/hybrid session within its admission window. Approval-required rooms surface the backend error; host admission/moderation and synchronized whiteboard UI are not implemented by this integration. Ending returns 202/ENDING: the UI reports closure requested, not instant provider cleanup. Camera/microphone remain off until the user enables them.

Meeting messages and hand state use the backend's room lifecycle. Local panels clear on leave, but the UI does not claim that leaving deletes server messages. Latest-message polling is bounded to 50; older history and realtime unread counts are not implemented.

## Verification boundary

Service/component tests use mocked HTTP or service responses. They cover exact paths/payloads, CSRF limits, version conflicts, cursor termination, cancellation, draft retention, removed preview access, and blocked sample-screen mounting. They do not prove deployed authorization, real write persistence, LiveKit connectivity, admission policy, worker cleanup, or provider revocation.

Browser reads can establish session restoration, classroom data, schedule/inbox rendering, and responsive layout against an available backend. Do not infer tested writes or connected media from these reads. No live account writes, schema changes, dependency installations, or deployments are needed for this frontend change.

### Checks recorded 14 November 2026

- `npm run build`: passed (TypeScript plus Vite); large-bundle warnings remain.
- `npm test -- --pool=threads`: 474 passed, 3 failed. Two tutor workspace tests mount the unchanged activity component without its required classroom provider. The unchanged onboarding mascot timing assertion fails in the full suite and passed in the focused rerun. The affected source/tests match the pre-integration revision; no failures were suppressed. New API, workspace, and preview-removal tests passed.
- `npm run lint`: the same 13 `react-refresh/only-export-components` errors in unchanged shared UI wrappers; no new-file errors remain.
- `git diff --check`: passed.
- Browser at `http://localhost:5173`: observed real session restoration, API classroom collection/count, and a confirmed empty monthly session list. Inspected the schedule at a narrow viewport and confirmed a legacy preview query still renders an unavailable workspace. Notifications returned the backend's unexpected-error message, which remained an error state without sample fallback. No live writes, note deletions, native-room opens, device permissions, media connection, or worker cleanup were exercised.

The notification backend error remains unresolved. Source inspection and mocked tests confirm the request contract; they do not identify or repair the running backend error.
