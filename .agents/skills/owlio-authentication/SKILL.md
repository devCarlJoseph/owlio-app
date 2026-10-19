---
name: owlio-authentication
description: Guide Owlio authentication UI, navigation, validation, verification and recovery states with security-conscious boundaries.
---

# Owlio Authentication

Use for registration, login, email OTP verification/resend, password recovery/reset, Google OIDC sign-in/linking, and session-expired presentation. Authentication is integrated with the v1 API; verify current service behavior rather than treating forms as previews.

## Current routes and behavior

Canonical routes are `/register`, `/login`, `/email-verification`, `/forgot-password`, `/password-reset`, `/oauth/google/callback`, and role-prefixed `account/security` pages. Legacy `/auth/*` paths are handled by a compatibility redirect; preserve query strings and hashes through that redirect because valid pre-rollout verification/reset links may carry tokens. Check `src/main.tsx` before changing route assumptions.

`src/services/api/auth.service.ts` calls the v1 auth API. `AuthSessionProvider` restores the user through `/me` and refresh, establishes login state, and signs out through the API. Registration, login, OTP/legacy-link verification, resend, password recovery/reset, Google OIDC, account linking, refresh, and logout have service-backed handlers. A successful registration proceeds to OTP entry. Do not claim an operation succeeded unless its request returned successfully.

## Screen and form guidance

- Registration UI includes full name, email, account type, password/confirmation, and terms acceptance. Current accepted account types are `student` and `educator`; confirm the service/schema before changing them.
- Login uses email/password, show/hide behavior, and a recovery link. Keep invalid-credential and account-existence feedback generic.
- Email verification uses a six-digit numeric OTP. Show submitting, invalid/expired, verified, and resend-cooldown states. Keep accepting valid legacy `?token=` links, remove tokens from the visible URL immediately, and post them only to the API.
- Forgot-password remains a generic account-safe request for a one-time reset link. Password reset uses the existing token-link flow, field validation, and return-to-login affordance. Keep pending, server-confirmed success, and recoverable failure states distinct.
- Google sign-in redirects through the backend API's authorization-code flow. On first-time Google registration, require explicit `student`/`educator` selection and terms acceptance; do not collect a local password for Google-only accounts.
- Handle callback outcomes without showing raw query values. Refresh the current API session after successful callback; send verification-required users to OTP entry, and provide a sign-in/link handoff when a Google email matches an existing password account.
- Account Security shows linked Google status and lets an authenticated user explicitly start linking. Never silently link identities by matching email.
- Use the existing shared auth layout/showcase, form primitives, and page-specific copy. Include initial, validation, submitting, generic failure, and success states.

## Security, accessibility, and visual constraints

- Treat verification/reset query values as sensitive: never log, display, persist, or send them outside an approved API flow.
- Never persist or log passwords or session material. Clear transient passwords when a flow terminates. Never display raw server payloads.
- Do not expose provider credentials or OAuth client secrets in Vite variables. The Google sign-in button must start the configured backend flow rather than behave as a visual placeholder.
- Preserve the current password UX contract: at least 8 characters and at most 72 UTF-8 bytes, unless the backend owner changes it.
- Use associated labels, correct autocomplete, keyboard-operable controls, visible focus, linked/announced errors, responsive layouts, and accessible password-reveal names.
- Keep the Owlio brand, shared auth components, and semantic theme tokens; do not invent a separate palette.

Registration uses `student`/`educator`, while onboarding uses `student`/`educator`/`others`. The `others` onboarding subtype may describe ESL/tutor/freelance setup, but is not a persisted auth role or permission. Do not infer access to `/tutors` or `/esl` from client-side onboarding or route visibility. Backend authorization remains authoritative.

See [Owlio Core](../owlio-core/SKILL.md) for shared product/security boundaries.