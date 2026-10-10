---
name: owlio-authentication
description: Design Owlio's complete authentication UI and user journey with security-conscious UX for registration, email verification, sign-in, and account recovery. This skill is UI-only; it does not implement API or session wiring.
---

# Owlio Authentication UI

Use this skill when designing or implementing the authentication screens, screen-level interactions, and visual flow for Owlio. Cover the complete user-facing journey while keeping this skill strictly focused on UI/UX. Follow `OWLIO_FRONTEND_GUIDE.md` and current shared UI conventions. The authentication pages and route registrations are currently absent from the frontend; the structure below is a target recommendation, not a claim about files that already exist.

## 1. Scope: UI only

This skill guides screen composition, form presentation, client-side usability validation, accessibility, responsive behavior, and navigation between auth screens.

- Do not add API requests, Axios/service calls, auth hooks, session providers, route guards, cookie handling, token refresh, backend changes, or persistence.
- Do not write passwords, verification/reset tokens, or session material to localStorage, sessionStorage, cookies, analytics, or logs.
- Do not create a fake successful login, registration, verification, password reset, or logout state that implies the server performed that action. UI previews may present explicitly labeled visual states, but do not represent them as real authentication.
- UI validation is for usability only; it is not authentication, authorization, or a security boundary.
- Do not add Google or other provider sign-in buttons as working-looking controls: OAuth is not configured in the current contract.

## 2. Owlio visual direction

- Use the Owlio book mark/wordmark, Inter, indigo brand accent, slate typography, and white or soft-neutral surfaces, consistent with the current shared navbar and global styling.
- Reuse the existing Button, Card, Field, Input, Label, Separator, and Spinner primitives in `src/components/ui`. Use semantic theme tokens instead of inventing a separate auth palette.
- Keep the presentation welcoming and learning-oriented: calm, clear, and polished rather than institutional or overly playful.
- Use a responsive split layout where it improves the screen: compact form panel plus a restrained brand/learning visual on wide screens; form-first single column on mobile. Avoid letting decorative panels obscure the task.
- Keep primary/secondary action hierarchy, card treatments, form spacing, and feedback styles consistent across auth screens.

## 3. Complete screen inventory and routes

Use these route names, which align with the current navbar links and backend email-link contract. Routes need to be registered when the UI is actually built; this skill does not add them.

| Route | Screen | Required UI states |
|---|---|---|
| `/auth/register` | Create account | Initial form, field errors, submitting presentation, form-level error, account-created/check-email presentation |
| `/auth/email-verification?token=…` | Verify email | Processing, verified, missing/invalid/expired link, resend form, resend confirmation/error |
| `/auth/login` | Sign in | Initial form, submitting, generic invalid credentials, unverified-email guidance, unavailable/network error, signed-in destination is a future integration state |
| `/auth/forgot-password` | Request reset | Initial form, validation, submitting, neutral check-email confirmation, retryable error |
| `/auth/password-reset?token=…` | Set new password | Initial form, password validation, submitting, invalid/expired link, reset confirmation with sign-in link |
| Logout/session expiry | Authenticated-app action/state | Sign-out confirmation or transition as applicable; expired/unauthenticated presentation with a sign-in action. These are UX specifications only, not routes or session enforcement. |

### Registration

- Fields: full name, email, account type (Student or Educator), password, password confirmation, and terms acceptance.
- Match the backend contract's account types: `student` and `educator`. Do not add tutor/other role values to the UI unless product and backend contracts change together.
- Use appropriate labels, autocomplete (`name`, `email`, `new-password`), inline field errors, a show/hide password control, and clear required/optional indicators.
- After submission, the product flow is an account-created / check-your-email state, not an authenticated dashboard. In UI-only work, render this state only as a clearly identified preview or visual state, not as proof of account creation.

### Email verification and resend

- Present a clear status headline and next action for verified, invalid/expired, or missing-link states.
- Provide a resend-verification form/status presentation where needed, with neutral copy that does not reveal whether an email is registered.
- The link contract places an opaque token in the query string. Treat it as sensitive: never display, log, persist, or send it anywhere from this UI-only scope.

### Sign-in

- Fields: email and password; show/hide password control; remember-me control as a presentation requirement; link to forgot password.
- Use `email` and `current-password` autocomplete values.
- Use generic invalid-credentials wording. When describing an unverified account, guide the user toward verification/resend without exposing unnecessary account details.
- Do not say "You're signed in" or display a real authenticated user state in the UI-only scope.

### Password recovery and reset

- Forgot password accepts an email and shows account-enumeration-neutral confirmation (for example, instructions will be sent if an account can be verified), plus a return-to-sign-in link.
- Reset password accepts a new password and confirmation, offers show/hide controls, and has invalid/expired-link and completed visual states.
- Current API contract requires passwords of at least 8 characters and limits them to bcrypt's 72-byte input size. Keep UI guidance consistent with this documented constraint; do not suggest that client validation replaces authoritative server validation.
- After the reset-completed state, provide a sign-in action. Do not represent a real password change as completed unless the screen is explicitly a design-state preview.

## 4. End-to-end user journey

```text
Register
  → account-created / check email
  → email verification link
  → verified confirmation
  → sign-in

Sign-in
  ├─ valid credentials → authenticated destination (future integration)
  ├─ unverified-email guidance → verification / resend UI
  └─ forgot password → neutral check-email confirmation
                         → reset link
                         → set new password
                         → reset confirmation
                         → sign-in

Authenticated app
  └─ sign-out action or session-expired state → sign-in UI
```

The lines describe the intended user journey, not functional network behavior in this UI-only scope. Email links, account state, signed-in navigation, and sign-out require backend integration that is outside this skill.

## 5. Security-conscious UX guardrails

These guardrails reflect the current backend contract and prevent unsafe UI patterns. They do not make a frontend-only auth flow secure or replace backend enforcement.

- Never persist or log passwords, access/refresh credentials, session identifiers, or email action tokens. Keep password input only in transient form state while needed and clear it when leaving the form or presenting a terminal state.
- Do not display token values. Do not copy query tokens into analytics, browser storage, page content, or client-side logs.
- Use neutral forgot-password and resend-verification confirmations so the interface does not reveal whether an account/email exists.
- Do not surface raw API error payloads, internal codes, stack traces, or security implementation details as user-facing copy. If error states are designed, express them as generic and actionable UX.
- Do not present role selection, hidden screens, or client-side validation as authorization or protection.
- Do not present an unimplemented OAuth/provider button as functional.
- Make password visibility controls explicit, keyboard accessible, and correctly labeled. Avoid accidental form submission from the show/hide button.

## 6. Forms, states, accessibility, and responsive behavior

- For future form UI implementation, use the existing React Hook Form, Zod, and resolver dependencies where appropriate. Define a clear schema per form; backend validation remains authoritative when integration is separately in scope.
- Include field-level validation, form-level error/status regions, focus-visible states, and disabled/submitting presentation. Preserve non-secret values after validation errors where helpful; clear password/token values at terminal transitions.
- Use semantic forms and buttons, associated labels, correct autocomplete attributes, keyboard-operable controls, visible focus indicators, and `aria-describedby` links for errors.
- Announce asynchronous status/error copy through suitable live regions (`role="status"` or `role="alert"`); move focus to the page heading or first invalid field when appropriate.
- Ensure password reveal controls have an accessible name that reflects the action (show/hide), and keep decorative icons hidden from assistive technology.
- Design for narrow screens and zoom: avoid fixed-height auth panels that clip content; keep submit and recovery actions available without horizontal scrolling.
- Include loading, empty/initial, validation error, generic failure, and success/design-preview states that apply to each screen.

## 7. Proposed frontend structure

This is a full target structure for the auth UI, not the current repository tree. Keep route pages thin and screen-specific components in their feature folders. Do not create service/query/session files under this UI-only skill.

```text
src/
  pages/
    auth/
      register/
        index.tsx
      login/
        index.tsx
      email-verification/
        index.tsx
      forgot-password/
        index.tsx
      password-reset/
        index.tsx
  components/
    features/
      auth/
        shared/
          auth-layout.tsx
          auth-brand-panel.tsx
          auth-feedback.tsx
          password-field.tsx
          password-guidance.tsx
          auth-form-actions.tsx
          session-expired-state.tsx
        register/
          register-view.tsx
          register-form.tsx
          account-type-selector.tsx
          register.schema.ts
        login/
          login-view.tsx
          login-form.tsx
          login.schema.ts
        email-verification/
          email-verification-view.tsx
          email-verification-status.tsx
          resend-verification-form.tsx
          email-verification.schema.ts
        forgot-password/
          forgot-password-view.tsx
          forgot-password-form.tsx
          forgot-password.schema.ts
        password-reset/
          password-reset-view.tsx
          password-reset-form.tsx
          password-reset.schema.ts
```

- `pages/auth/<screen>/index.tsx` should compose a screen view and remain a route-level entry point.
- `auth-layout.tsx`, `auth-feedback.tsx`, and `password-field.tsx` belong in `shared/` only if actually reused; avoid premature abstraction.
- Keep forms and their schema beside the screen that owns them. The schema is for client-side UX validation only.
- Logout is an action/state in the authenticated application, not an invented public `/auth/logout` page. The auth UI structure may expose a reusable session-expired state, but session checking is out of scope.
- No `services/auth`, auth hooks, query keys, API providers, route guards, cookie/session utilities, or backend files are included because the agreed target is UI only.

## 8. Explicitly out of scope

- Implementing registration, login, verification, resend, password reset, logout, session refresh, or current-user API calls.
- Cookie/session storage or auth route protection.
- Backend endpoints, database/schema changes, email delivery, CSRF, rate limiting, or account security policy implementation.
- Google OAuth or any social sign-in.
- Onboarding/profile setup after authentication.

## 9. Acceptance checklist for auth UI work

- [ ] The five screens and their major states in section 3 are represented.
- [ ] Registration → verification → sign-in, recovery → reset → sign-in, resend, logout, and expired-session UX paths are documented consistently.
- [ ] Forms use clear field labels, validation messages, password visibility controls, and appropriate autocomplete guidance.
- [ ] Recovery and resend feedback does not disclose account existence.
- [ ] No screen implies a real API-backed account/session/password change in UI-only work.
- [ ] No credentials or tokens are persisted, logged, displayed, or sent to analytics.
- [ ] No unimplemented OAuth control is presented as working.
- [ ] Target component/file tree stays under the proposed auth page/feature structure and does not add API/session modules.
- [ ] Screens are keyboard accessible and responsive at mobile and desktop sizes.
