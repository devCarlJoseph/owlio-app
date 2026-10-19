---
name: owlio-auth-app
description: Implement Owlio browser authentication UX aligned with the v1 API contract.
---

# Owlio App Authentication

Use this skill for authentication UI in `owlio-app`. The app is a React/TypeScript Vite SPA; the API is authoritative for credentials, verification, sessions, and authorization. Keep this frontend aligned with the backend contract and the existing `owlio-authentication` project skill under `.agents/skills`.

## Routes and API integration

- Canonical routes: `/register`, `/login`, `/email-verification`, `/forgot-password`, `/password-reset`, `/oauth/google/callback`, and protected role-prefixed dashboard paths.
- API calls live in `src/services/api/auth.service.ts`; shared request types live in `src/services/api/api.types.ts`.
- Use `src/lib/axios.ts` (`withCredentials`) and `postApiWithCsrf` for state-changing requests. Keep CSRF in memory; never persist session material or tokens in local storage.
- The API sets HttpOnly access/refresh cookies. The app establishes the session through `/me` and refresh in `AuthSessionProvider`.
- Preserve the current email/password reset-link workflow. Keep password-reset tokens out of visible URLs after capture and send them only in the corresponding API request body.
- Registration creates pending accounts and must navigate to email verification only after the API confirms registration.

## Verification OTP UX

- The verification page handles six-digit numeric OTP entry for the email passed in navigation state or entered by the user.
- Call the API with `{ email, code }`; show pending, submitting, verified, expired/invalid, and rate-limited states with actionable accessible feedback.
- Resend must use the API response, show a 60-second cooldown, and avoid revealing whether an account exists.
- Continue to accept legacy emailed `?token=` links: capture the token, remove it from the URL immediately, then POST `{ token }` to the API. Never render, log, persist, or put tokens in analytics.
- Do not invent local OTP values or claim verification succeeded until the API confirms it.

## Google OIDC UX

- Google sign-in is a backend authorization-code redirect; there is no Google client secret or API key in Vite code or `VITE_*` variables.
- The login button starts the API login intent. The registration Google button requires an explicit `student`/`educator` choice and accepted terms before starting the registration intent.
- The callback page handles only safe status codes, refreshes the auth session from the API, clears callback query parameters, then navigates to the role workspace or OTP verification.
- Existing password accounts must not be silently linked by matching email. Provide an authenticated account-security UI to initiate explicit Google linking; do not claim a link exists until the API confirms it.
- Use the API callback contract and configured frontend origin. Never accept arbitrary redirect targets or trust client-supplied Google profile/verification claims.

## UI and security constraints

- Reuse `AuthShowcaseLayout`, existing form schemas/primitives, theme tokens, and project conventions. Keep route adapters thin and use feature components for form/state logic.
- Keep forms keyboard accessible with labels, visible focus, numeric input mode and `autocomplete="one-time-code"` for OTP, linked validation errors, loading states, and screen-reader status feedback.
- Preserve generic login/recovery responses. Never display raw server payloads, Resend errors, OAuth codes, ID tokens, OTPs, passwords, or cookies.
- Google-only accounts may have no local password; do not assume a password login is available for every account.
- The frontend is a UX boundary only. Server validation, session checks, email verification, provider-token validation, and role authorization remain API responsibilities.
- Run app checks from the repository root: `npm run lint`, `npm run build`, and `npm test` when configured. Do not report unrun tests as passing.
