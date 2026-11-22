# Frontend authentication and role access

Updated: 16 November 2026.

This integration uses the existing Owlio API. It does not change backend routes, security settings, environment values, database schema, or role assignments.

## API-only access

Authentication and role guards always run. There is no preview bypass or configuration that opens protected pages anonymously. The compatibility constant in `src/lib/api-mode.ts` is true; guards and session restoration no longer depend on it.

The local onboarding wizard is no longer routed. `/onboarding` redirects to `/register`, whose account type is validated by the backend. Original workspace pages and local tools remain behind the same guards; layout and whiteboard previews do not bypass authentication. Separate Account records views retain the connected workflows. See [API connection](API_CONNECTION.md).

## Route access (API integration enabled)

| API role | Permitted workspace |
| --- | --- |
| STUDENT | /students and its registered child routes |
| EDUCATOR | /educators and its registered child routes |
| TUTOR | /tutors and its registered child routes |
| ESL | /esl and its registered child routes |
| ADMIN without a learning/teaching role | /access-denied; no implicit educator or student access |

Permissions accumulate when the API assigns multiple roles. An account with STUDENT and TUTOR can use both workspaces. Frontend onboarding selections and URLs never grant a role.

The login, registration, verification, password recovery/reset, legacy auth, and onboarding redirect are guest-only. A signed-in user is redirected to an allowed workspace. The Google callback remains reachable because it must complete sign-in and explicit account linking.

Anonymous users are redirected to login before feature components render. The login return target is restricted to a workspace assigned by the API; authorized deep links retain their search/fragment. Redirects replace browser history entries so Back cannot bypass the guards.

## Session behavior (API integration enabled)

- Restore the session from GET /api/v1/auth/me.
- On 401, try the existing cookie-based refresh endpoint; a refresh 401 means anonymous.
- Keep forms/features closed while the initial session check is loading or unavailable.
- Recheck on protected route navigation. Brief focus/visibility changes and page restoration keep the current screen. After 15 minutes without interaction, returning to the tab or interacting again triggers a background check without the loading screen.
- Recheck after protected API requests return 401; do not automatically replay feature mutations.
- Clear frontend authentication only after logout succeeds on the API.
- Ignore outdated session checks after login/logout.
- Keep credentials in HttpOnly cookies and CSRF only in memory.

API failures show a retry state instead of being interpreted as a successful login or a confirmed logout. Other-tab changes are observed on an idle return, protected navigation, or a protected request that returns 401. Initial load and explicit retry still show the session loading screen.

## Production cookie routing

Production API requests use the frontend origin and the `/api` Render proxy in `vercel.json`, so session and CSRF cookies do not depend on third-party cookie access in iOS browsers. Development retains `VITE_API_URL`. Existing Secure, HttpOnly, CSRF, session rotation, and route guards remain in place. Google OAuth must return through the frontend `/api/v1/auth/google/callback` path; see [API connection](API_CONNECTION.md#configuration-and-authentication) for release settings and device acceptance checks. This source change requires a frontend deployment and does not establish live iOS verification.

## Contract alignment

The frontend uses the API's INVALID_CSRF response for a single retry after obtaining fresh CSRF. Registration returns a generic message, not an authenticated user. Account statuses include DISABLED. Google link status returns linked without an email. Google callback outcomes use the API's underscore names, including verification_required, registration_required, and link_required.

## Account pages

All four workspace roots expose `profile`, `settings`, and `help`. My Profile updates the display name through `PATCH /api/v1/users/me` and uses `/api/v1/users/me/avatar` for JPEG, PNG, or WebP uploads up to 2 MB. The matching API serves uploaded images from a private Neon Object Storage bucket using short-lived URLs. The profile and dashboard menu share the photo. Google sign-in or linking refreshes the synced Google photo, and removing a custom upload restores it when available. Existing linked users sync at their next Google sign-in.

Settings saves time zone, locale, and session-reminder opt-in to the authenticated account, while appearance applies to this browser. Help & Support submits a request and lists status for the current account.

## Google setup and linking

A successful Google login callback with `registration_required` opens a dedicated signup step: choose an account role, accept the terms, and select **Sign up with Google**. Google supplies the name and email, and this flow does not require an Owlio password. Email signup remains available.

An existing password account must explicitly connect Google. The setup screen offers **Log in to connect Google**, and `link_required` directs the user to password login. After login, both paths open the assigned workspace's **Account security** screen. Its **Connect Google** action starts the existing authenticated, CSRF-protected link flow. Account security is reachable from the sidebar and account menu for all four workspaces. Accounts are never silently merged by matching email.

## Main files

- src/main.tsx: guest and role route wiring.
- src/components/features/auth/view/require-auth.tsx: signed-out route protection.
- src/components/features/auth/view/require-guest.tsx: signed-in auth-page protection.
- src/components/features/auth/view/require-role.tsx: role restrictions before mounting the dashboard shell.
- src/components/features/auth/context/auth-session-provider.tsx: API-backed session lifecycle.
- src/lib/workspace-path.ts: allowed workspace and login return navigation.
- src/services/api/auth.service.ts and api.types.ts: cookie/CSRF contract and types.

## Verification

Run npm test -- --pool=threads, npm run build, npm run lint, and git diff --check.

Regression tests mock API responses; they do not validate deployed cookies, CORS, Google/Brevo configuration, live credentials, or database state. For a browser integration check, use your test accounts against the configured API and verify each role's direct URLs, login redirects, logout plus Back, expired-session restoration, and Google callback/linking. Backend authorization remains authoritative for all data access.

## Banned account notice

Owlio displays a dismissible ban dialog when the API returns `ACCOUNT_BANNED` after checking the password or confirms an active ban through the verified Google callback. Password sign-in shows the ban type and the local display time for temporary expiry when supplied by the API. The Google redirect carries only the outcome. The form stays on sign-in, and the API does not create a session while the ban applies.
