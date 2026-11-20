# API connection

Updated 15 November 2026. Backend contract evidence is the adjacent `owlio-api` checkout: mounted `src/routes/v1/index.ts`, auth/classroom/personal/notification/session/native-meeting route files, their Zod schemas, controllers, services, and repository response fields. This is frontend work; backend configuration, dependencies, providers, and database migrations were not changed.

## Configuration and authentication

In development, `VITE_API_URL` is the public API **origin**, defaulting to `http://localhost:7000`. Do not include `/api/v1`, credentials, query parameters, or fragments. Production builds use `window.location.origin` for API calls, even when an older Vercel setting still points `VITE_API_URL` at Render. The Axios client adds full route paths, sends credentials, and has a 15-second timeout.

`vercel.json` forwards `/api/:path*` to `https://owlio-api.onrender.com/api/:path*` before the existing SPA fallback. API responses explicitly disable browser and CDN caching. Access, refresh, and CSRF cookies remain host-only and HttpOnly, with their existing `/api` paths; the browser receives them from the frontend origin. This removes the cross-site cookie dependency that can prevent iOS session restoration. Local development still calls its configured API directly. Other production hosts must provide the same proxy; Vite preview alone does not implement Vercel routing.

Before releasing this configuration:

- Keep Render `NODE_ENV=production` and `FRONTEND_URL=https://owliohub.vercel.app` for the current public app. Preserve authentication secrets. Reconfirm the exact trusted proxy topology before changing `TRUST_PROXY_HOPS`; adding Vercel changes that topology.
- Set Render `BACKEND_URL=https://owliohub.vercel.app` (the public proxied API origin) and `GOOGLE_REDIRECT_URI=https://owliohub.vercel.app/api/v1/auth/google/callback`, then register that exact URI on the existing Google OAuth web client. Both the API adapter and release preflight require the callback origin to match `BACKEND_URL`; changing only the callback fails validation. The rewrite destination stays `https://owlio-api.onrender.com`. Google start/link cookies and the callback must use the frontend origin. A callback on `onrender.com` cannot receive the new host-only transaction cookie. These are release requirements, not settings changed by this patch.
- Users must sign in again after release: old Render-host cookies are not frontend-host cookies. Verify email/password and Google login, reload, refresh, logout, and protected requests on iOS Safari, iOS Chrome, and Android. Inspect status codes and cookie attributes without recording token values.
- Verify `/api/socket.io` through the deployed proxy for meeting chat. The existing read-only WebSocket client follows the shared API origin and retains its five-second HTTP fallback when unavailable. LiveKit media continues to use its provider URL. No backend transport change is included.

No live provider, database, Render, or Vercel settings were changed while preparing this fix.

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

Students can open a private-code room in **Meeting Room → Student meetings** using `POST /api/v1/peer-meetings`. The invitation resolver returns the active room ID. When a student joins a standalone peer room for the first time, the client passes its `OWLIO-PEER-…` code in the join body as `peerCode`. Hosts close student rooms via `POST /api/v1/peer-meetings/:roomId/end`.

Shared Study Spaces show a reusable `OWLIO-SPACE-<UUID>` meeting code alongside the separate membership code. The space owner opens the meeting using `POST /api/v1/study-spaces/:spaceId/native-meeting`. The resolver and media join both check current student membership. Both meeting flows require the matching API and worker release, migration 0052, and the configured LiveKit provider.
| In-call information | HTTP room state, authorized media directory, idempotent chat sends, and versioned own-hand changes. Chat uses the API’s cookie-authenticated Socket.IO channel; state/roster reads remain on a five-second refresh. Chat is independent of provider roster latency, with HTTP fallback and bounded reconnect recovery. Access failures disconnect media. No LiveKit data publishing. |

Response records for the new personal/schedule/meeting clients are runtime-validated. UUID cursor loops fail explicitly. Connected records are cleared on account/role/path remounts; late/aborted account reads cannot populate another account's screen. Mutation success uses server confirmation and is not inferred from local edits.

## Restored layouts and remaining work

Protected routes still require a session and assigned role. The original role-specific Overview, Calendar, learning/teaching pages, auth showcase, notification panel, and meeting category hub are restored. My Classes and API/session clients are preserved. The local onboarding route still redirects to registration; there is no authentication preview bypass or sample classroom fallback. Legacy room IDs are not reinterpreted as scheduled-session IDs; use `?session=<UUID>` or `OWLIO-SESSION-<UUID>` for connected meetings.

The default workspace view mounts the original page adapter. A separate **Account records** link (`?source=account`) keeps the connected overview, student subjects/tasks/notes, notifications, calendar, and tutor-session workflows accessible. Device editors and account records retain their distinct storage and mutations; neither automatically imports or overwrites the other. Connected subject links retain the account query. Meeting Room offers **Scheduled sessions** for the connected directory and explicit `layout-preview=1` / ESL `whiteboard-preview=1` entry points for isolated layouts. These previews never open a live meeting or request devices.

**Not all backend modules have frontend integrations yet.** Restored classwork, materials/editors, progress, teaching plans, profile/settings, and AI pages retain their existing local/example/unavailable disclosures. Restoring their layout does not connect their unimplemented API operations. Their backend capabilities vary; this does not claim that corresponding backend routes are missing. Separate typed adapters and verification are still required for new server persistence.

Native calls additionally require the backend's explicit `NATIVE_MEETINGS_ENABLED`, configured LiveKit service and worker, eligible owned/enrolled classroom membership, and a scheduled online/hybrid session within its admission window. Approval-required rooms surface the backend error; host admission/moderation and synchronized whiteboard UI are not implemented by this integration. Ending returns 202/ENDING: the UI reports closure requested, not instant provider cleanup. Camera/microphone start off. Pre-join controls request each device only on a click, render a muted local camera preview, and publish the selected tracks after a successful join. Turning a device off, changing invite, leaving, and unmounting release owned tracks; late permission results are stopped.

Meeting messages and hand state use the backend's room lifecycle. Local panels clear on leave, but the UI does not claim that leaving deletes server messages. New messages arrive on the read-only Socket.IO subscription at `/api/socket.io`, using the configured API origin, credentials, and WebSocket transport. Each outgoing message appears immediately as Sending; its HTTP response adds the confirmed message without another read. Failed messages remain visibly unsent with Retry using the same request ID, while the next typed draft is preserved. Incoming and confirmed messages merge by ID. Reconnects and server gap signals recover exact timestamp/UUID cursor pages within the 1,000-message room bound. Chat falls back to five-second HTTP reads when realtime is unavailable, with a 30-second HTTP reconciliation while connected. Realtime unread counts are not implemented.

## Study Spaces

`/students/study-spaces` lists shared spaces the account owns or has joined through the paginated Study Spaces API. A student-only discovery endpoint lists active spaces created by student accounts; names and descriptions are visible to signed-in students, while joining still requires the owner’s `OWLIO-SPS-XXXX` access code. The access code is never included in directory results. A code entered from a discovery card is checked against that specific space before membership is added. The owner can see and copy the reusable code from the owned-space card or reopen **Invite** in the room. Owners can also create a personal invitation using the recipient’s account ID. Personal invitations work once and expire after 24 hours. Browser-only rooms remain accessible in List view.

The room’s **Members** panel shows current member names and roles from the API, including students who accepted an invitation. Joined members also appear as idle room characters with stable generated colors. This is still a membership roster, not live presence: each member’s custom character colors and movement are local to their device. Seats, music, tasks, lockers and TV remain device-local. The matching API update adds discovery, owner-only code projection on the owner’s own list item, and member display names. It uses the existing tables and requires no database migration.

Shared room messages are saved as discussion replies and visible only to members. The open room refreshes the latest 50 displayed messages every five seconds while the tab is visible. The current discussion API returns author IDs without display names for other members. Members appear as **Member** and the signed-in student sees their own name. Simultaneous first posts can create separate API threads. The room combines replies from threads named **Room discussion**.

Room codes require backend migration `0050_study_space_join_codes` and the matching API release before the frontend release. Preexisting shared rooms continue to use personal invitations. Archived room codes cannot be used, and a student with an inactive membership needs a personal invitation to rejoin. The directory is available to authenticated students only; listed shared spaces require the owner’s code. Layout and seat count preferences for a shared room use account- and room-scoped browser storage. Existing device room records are left in their original storage and are not published automatically.

## Verification boundary

Service/component tests use mocked HTTP or service responses. They cover exact paths/payloads, CSRF limits, version conflicts, cursor termination, cancellation, draft retention, original page rendering, separate account-record access, and isolated meeting previews. They do not prove deployed authorization, real write persistence, LiveKit connectivity, admission policy, worker cleanup, or provider revocation.

Browser reads can establish session restoration, classroom data, schedule/inbox rendering, and responsive layout against an available backend. Do not infer tested writes or connected media from these reads. The 15 November meeting repair adds the explicitly approved `socket.io-client@4.8.4` frontend dependency. It does not change the backend contract, schema, provider/security settings, or deployment.

### Google proxy configuration follow-up

For the coordinated rollout, add both exact authorized redirect URIs to the existing Google OAuth Web client used by Render, preserving its development URI: `https://owlio-api.onrender.com/api/v1/auth/google/callback` for the current direct deployment and `https://owliohub.vercel.app/api/v1/auth/google/callback` for the proxy deployment. Register the proxy callback before switching Render's public API origin/callback or deploying the frontend. An OAuth client secret change is not required for a redirect URI mismatch. The final browser address `/oauth/google/callback` is a separate frontend outcome route and must not replace the API callback URI.

The API's unchanged Google adapter and release preflight require the callback origin to equal the public `BACKEND_URL`. The proxy rollout therefore also sets `BACKEND_URL=https://owliohub.vercel.app`; changing only `GOOGLE_REDIRECT_URI` is insufficient. Offline coverage in the API checkout exercises the frontend-domain proxy, the existing direct callback, state/nonce/PKCE generation, and rejection of foreign origins or wrong callback paths: 33 Google/service/preflight tests passed. The user reported Google error `redirect_uri_mismatch`, confirming an exact callback registration mismatch; the live OAuth client settings have not been inspected. No Google Cloud or Render settings were changed.

### iOS cookie routing checks recorded 15 November 2026

- Runtime changes: production origin selection in `src/lib/axios.ts` and ordered API proxy/cache rules in `vercel.json`. Updated `.env.example`, auth access, capability status, and this integration guide; added origin and routing regression tests. No dependencies, backend source, real environment files, database, or live provider settings changed.
- Focused `npm test -- src/lib/axios.test.ts src/lib/api-routing.test.ts src/services/api/auth.service.test.ts src/components/features/auth/tests/auth-session-provider.test.tsx src/services/api/meeting-realtime.test.ts --pool=threads --maxWorkers=2`: 36 passed.
- `npm run build`: TypeScript and production bundle passed; existing large-chunk warnings remain. Changed-file ESLint and `git diff --check` passed.
- Full `npm test -- --pool=threads --maxWorkers=2`: 561 passed, three failed. Two tutor provider-context tests and one meeting-history recovery assertion fail identically in an untouched HEAD snapshot. Full `npm run lint` reports 13 shared UI export errors, also reproduced on untouched HEAD. No failures were suppressed or unrelated components modified.
- Isolated browser fixture using the production build and synthetic local API responses: login sent CSRF, reached the student workspace, retained its HttpOnly/Secure cookie across a full reload, and logout removed protected access. Sanitized fixture evidence showed the session cookie present on `/auth/me` after reload and absent after logout. This did not contact Render, Neon, Google, or LiveKit and does not prove deployed proxy behavior or iOS WebKit compatibility.
- No deployment was performed. The Google callback release settings above, deployed proxy verification (including meeting chat), and actual iOS/Android checks remain required.

### Meeting repair checks recorded 15 November 2026

- Changed runtime files: meeting-room view/types, classroom/coaching screens and shared chat panel, new pre-join preview/device hook, meeting data hook, meeting service and new realtime client. Updated their focused tests, package/lockfile, this contract, capability status, and the source-copy snapshot notice.
- Approved dependency: exact `socket.io-client@4.8.4`, installed with lifecycle scripts disabled; no backend changes or live API/database/provider writes.
- Focused device/chat/service tests: `npm test -- --pool=threads src/components/features/meeting-room/tests/meeting-devices.test.tsx src/components/features/meeting-room/tests/use-native-meeting-data.test.ts src/services/api/meeting-realtime.test.ts src/services/api/meeting.service.test.ts` — 41 passed.
- Existing meeting entry/layout tests: `npm test -- --pool=threads --maxWorkers=2 src/components/features/meeting-room/tests/meeting-room-hub.test.tsx src/components/features/meeting-room/tests/meeting-room-screen.test.tsx` — 52 passed after updating the entry tests' offline realtime mock.
- `npm run build` passed TypeScript and production bundling; large-chunk warnings remain. ESLint passed for all changed runtime/test files.
- Full `npm test -- --pool=threads --maxWorkers=2`: 537 passed, two tutor tests failed, and the meeting-entry suite initially failed on an incomplete service mock. The meeting mock was corrected and its 17 tests passed in the focused rerun above. The two tutor failures (missing ClassroomPrototypeProvider) reproduced in a temporary clean HEAD source snapshot: 17 passed, two failed. The complete suite was not rerun after the test-only mock correction.
- `npm run lint` retains 13 react-refresh errors in unchanged shared UI files. Their contents match HEAD, and linting that unchanged directory reproduced all 13 errors.
- `git diff --check` passed.
- Browser inspection stopped because Computer Use could not verify the Windows browser URL. Responsive rendering, real device permissions, a two-participant WebRTC call, and live chat latency remain unverified. No deployment was performed. Restart/rebuild the frontend to load the new dependency; the existing backend must expose its authenticated `/api/socket.io` channel through the hosting proxy.

### Checks recorded 14 November 2026

- `npm run build`: passed (TypeScript plus Vite); large-bundle warnings remain.
- `npm test -- --pool=threads`: 474 passed, 3 failed. Two tutor workspace tests mount the unchanged activity component without its required classroom provider. The unchanged onboarding mascot timing assertion fails in the full suite and passed in the focused rerun. The affected source/tests match the pre-integration revision; no failures were suppressed. New API, workspace, and preview-removal tests passed.
- `npm run lint`: the same 13 `react-refresh/only-export-components` errors in unchanged shared UI wrappers; no new-file errors remain.
- `git diff --check`: passed.
- Browser at `http://localhost:5173`: observed real session restoration, API classroom collection/count, and a confirmed empty monthly session list. Inspected the schedule at a narrow viewport and confirmed a legacy preview query still renders an unavailable workspace. Notifications returned the backend's unexpected-error message, which remained an error state without sample fallback. No live writes, note deletions, native-room opens, device permissions, media connection, or worker cleanup were exercised.

The notification backend error remains unresolved. Source inspection and mocked tests confirm the request contract; they do not identify or repair the running backend error.
