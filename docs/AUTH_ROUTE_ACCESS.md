# Frontend authentication and role access

Updated: 29 October 2026.

This integration uses the existing Owlio API. It does not change backend routes, security settings, environment values, database schema, or role assignments.

## Route access

| API role | Permitted workspace |
| --- | --- |
| STUDENT | /students and its registered child routes |
| EDUCATOR | /educators and its registered child routes |
| TUTOR | /tutors and its registered child routes |
| ESL | /esl and its registered child routes |
| ADMIN without a learning/teaching role | /access-denied; no implicit educator or student access |

Permissions accumulate when the API assigns multiple roles. An account with STUDENT and TUTOR can use both workspaces. Frontend onboarding selections and URLs never grant a role.

The login, registration, verification, password recovery/reset, legacy auth, and local onboarding pages are guest-only. A signed-in user is redirected to an allowed workspace. The Google callback remains reachable because it must complete sign-in and explicit account linking.

Anonymous users are redirected to login before feature components render. The login return target is restricted to a workspace assigned by the API; authorized deep links retain their search/fragment. Redirects replace browser history entries so Back cannot bypass the guards.

## Session behavior

- Restore the session from GET /api/v1/auth/me.
- On 401, try the existing cookie-based refresh endpoint; a refresh 401 means anonymous.
- Keep forms/features closed while the initial session check is loading or unavailable.
- Recheck on protected route navigation, window focus, page restoration, and tab visibility.
- Recheck after protected API requests return 401; do not automatically replay feature mutations.
- Clear frontend authentication only after logout succeeds on the API.
- Ignore outdated session checks after login/logout.
- Keep credentials in HttpOnly cookies and CSRF only in memory.

API failures show a retry state instead of being interpreted as a successful login or a confirmed logout. Other-tab changes are observed when the tab becomes visible/focused or performs a protected navigation/request.

## Contract alignment

The frontend uses the API's INVALID_CSRF response for a single retry after obtaining fresh CSRF. Registration returns a generic message, not an authenticated user. Account statuses include DISABLED. Google link status returns linked without an email. Google callback outcomes use the API's underscore names, including verification_required, registration_required, and link_required.

## Main files

- src/main.tsx: guest and role route wiring.
- src/components/features/auth/require-auth.tsx: signed-out route protection.
- src/components/features/auth/require-guest.tsx: signed-in auth-page protection.
- src/components/features/auth/require-role.tsx: role restrictions before mounting the dashboard shell.
- src/components/features/auth/auth-session-provider.tsx: API-backed session lifecycle.
- src/lib/workspace-path.ts: allowed workspace and login return navigation.
- src/services/api/auth.service.ts and api.types.ts: cookie/CSRF contract and types.

## Verification

Run npm test -- --pool=threads, npm run build, npm run lint, and git diff --check.

Regression tests mock API responses; they do not validate deployed cookies, CORS, Google/Brevo configuration, live credentials, or database state. For a browser integration check, use your test accounts against the configured API and verify each role's direct URLs, login redirects, logout plus Back, expired-session restoration, and Google callback/linking. Backend authorization remains authoritative for all data access.
