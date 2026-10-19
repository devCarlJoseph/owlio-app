---
name: owlio-authentication
description: Guide Owlio authentication UI, navigation, validation, verification and recovery states with security-conscious boundaries.
---

# Owlio Authentication

Use for registration, login, email verification/resend, password recovery/reset, and session-expired presentation. Authentication is integrated with the v1 API; verify current service behavior rather than treating forms as previews.

## Current routes and behavior

Canonical routes are `/register`, `/login`, `/email-verification`, `/forgot-password`, and `/password-reset`. Legacy `/auth/*` paths are handled by a compatibility redirect; preserve query strings and hashes through that redirect because email-action links may carry tokens. Check `src/main.tsx` before changing route assumptions.

`src/services/api/auth.service.ts` calls the v1 auth API. `AuthSessionProvider` restores the user through `/me` and refresh, establishes login state, and signs out through the API. Registration, login, email verification/resend, password recovery/reset, refresh, and logout have service-backed handlers. A successful registration proceeds to email verification. Do not claim an operation succeeded unless its request returned successfully.

## Screen and form guidance

- Registration UI includes full name, email, account type, password/confirmation, and terms acceptance. Current accepted account types are `student` and `educator`; confirm the service/schema before changing them.
- Login uses email/password, show/hide behavior, and a recovery link. Keep invalid-credential and account-existence feedback generic.
- Verification/resend and forgot-password states should give a clear next action without revealing whether an address has an account.
- Password reset uses the token-link flow, field validation, and return-to-login affordance. Keep pending, server-confirmed success, and recoverable failure states distinct.
- Use the existing shared auth layout/showcase, form primitives, and page-specific copy. Include initial, validation, submitting, generic failure, and success states.

## Security, accessibility, and visual constraints

- Treat verification/reset query values as sensitive: never log, display, persist, or send them outside an approved API flow.
- Never persist or log passwords or session material. Clear transient passwords when a flow terminates. Never display raw server payloads.
- Do not present the Google mark or any unconfigured provider as working OAuth.
- Preserve the current password UX contract: at least 8 characters and at most 72 UTF-8 bytes, unless the backend owner changes it.
- Use associated labels, correct autocomplete, keyboard-operable controls, visible focus, linked/announced errors, responsive layouts, and accessible password-reveal names.
- Keep the Owlio brand, shared auth components, and semantic theme tokens; do not invent a separate palette.

Registration uses `student`/`educator`, while onboarding uses `student`/`educator`/`others`. The `others` onboarding subtype may describe ESL/tutor/freelance setup, but is not a persisted auth role or permission. Do not infer access to `/tutors` or `/esl` from client-side onboarding or route visibility. Backend authorization remains authoritative.

See [Owlio Core](../owlio-core/SKILL.md) for shared product/security boundaries.