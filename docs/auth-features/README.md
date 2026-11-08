# Auth component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(auth): add organized auth source copies`

Proposed paths only; no files under `src/components/features/auth/` have been moved. Keep `auth/` as the owner, with smaller folders **inside** existing `login/`, `register/`, `shared/`, etc. See [folder rules](../sops/component-decomposition.md).

| Target relative to `auth/` | Current files |
| --- | --- |
| `context/` | `auth-session-context.ts`, `auth-session-provider.tsx`, `auth-session-provider.test.tsx` |
| `view/` | `no-workspace-view.tsx`, `require-auth.tsx`, `require-guest.tsx`, `require-role.tsx`, `session-boundary.tsx`, `preview-route-access.test.tsx`, `route-guards.test.tsx` |
| `account-security/view/` | `account-security-view.tsx` |
| `email-verification/forms/` | `email-verification.schema.ts`, `email-verification.schema.test.ts`, `resend-verification-form.tsx`, `verification-code-form.tsx` |
| `email-verification/view/` | `email-verification-view.tsx` |
| `forgot-password/forms/`, `view/` | `forgot-password-form.tsx`, `forgot-password.schema.ts` -> forms; `forgot-password-view.tsx` -> view |
| `google/view/` | `google-oauth-callback-view.tsx`, `google-oauth-callback-view.test.tsx` |
| `login/forms/`, `view/` | `login-form.tsx`, `login.schema.ts` -> forms; `login-view.tsx` -> view |
| `password-reset/forms/`, `view/` | `password-reset-form.tsx`, `password-reset.schema.ts` -> forms; `password-reset-view.tsx` -> view |
| `register/forms/`, `view/` | `account-type-selector.tsx`, `register-form.tsx`, `register.schema.ts` -> forms; `register-view.tsx` -> view |
| `shared/contents/` | `auth-showcase-content.ts` |
| `shared/utils/` | `auth-input-styles.ts`, `development-action-path.ts`, `password-rules.ts` |
| `shared/ui/` | `auth-brand-panel.tsx`, `auth-feedback.tsx`, `auth-form-actions.tsx`, `auth-layout.tsx`, `auth-password-input.tsx`, `auth-preview-controls.tsx`, `auth-showcase-layout.tsx`, `auth-showcase.tsx`, `auth-split-layout.tsx`, `auth-status-page.tsx`, `google-auth-button.tsx`, `google-auth-button.test.tsx`, `owlio-owl.tsx`, `password-field.tsx`, `password-guidance.tsx`, `session-expired-state.tsx` |

Migrate leaf forms and schemas before session context. Preserve the provider mounted in `src/main.tsx`, cookie/CSRF flow, redirect safety, account-switch cleanup, and token handling. A route guard is **not** a reusable form or a global UI primitive. Run the affected auth route/guard tests and a build after each slice. See [auth access](../AUTH_ROUTE_ACCESS.md).

[All feature plans](../component-breakdowns.md)
