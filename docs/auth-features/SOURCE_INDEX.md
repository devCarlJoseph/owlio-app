# auth source reference

Exact copies of current `src/components/features/` source files, arranged by the proposed folder map in this feature README. The `.txt` suffix prevents these **non-runnable reference copies** (including tests) from being picked up by app tooling. Imports in the copies still point at the original source layout; do not compile them in place. Recheck the source before using a snapshot for a manual refactor.

## `context/`

- [`source/context/auth-session-context.ts.txt`](source/context/auth-session-context.ts.txt) <- `src/components/features/auth/auth-session-context.ts`
- [`source/context/auth-session-provider.tsx.txt`](source/context/auth-session-provider.tsx.txt) <- `src/components/features/auth/auth-session-provider.tsx`
- [`source/context/auth-session-provider.test.tsx.txt`](source/context/auth-session-provider.test.tsx.txt) <- `src/components/features/auth/auth-session-provider.test.tsx`

## `view/`

- [`source/view/no-workspace-view.tsx.txt`](source/view/no-workspace-view.tsx.txt) <- `src/components/features/auth/no-workspace-view.tsx`
- [`source/view/require-auth.tsx.txt`](source/view/require-auth.tsx.txt) <- `src/components/features/auth/require-auth.tsx`
- [`source/view/require-guest.tsx.txt`](source/view/require-guest.tsx.txt) <- `src/components/features/auth/require-guest.tsx`
- [`source/view/require-role.tsx.txt`](source/view/require-role.tsx.txt) <- `src/components/features/auth/require-role.tsx`
- [`source/view/session-boundary.tsx.txt`](source/view/session-boundary.tsx.txt) <- `src/components/features/auth/session-boundary.tsx`
- [`source/view/preview-route-access.test.tsx.txt`](source/view/preview-route-access.test.tsx.txt) <- `src/components/features/auth/preview-route-access.test.tsx`
- [`source/view/route-guards.test.tsx.txt`](source/view/route-guards.test.tsx.txt) <- `src/components/features/auth/route-guards.test.tsx`

## `account-security/view/`

- [`source/account-security/view/account-security-view.tsx.txt`](source/account-security/view/account-security-view.tsx.txt) <- `src/components/features/auth/account-security/account-security-view.tsx`

## `email-verification/forms/`

- [`source/email-verification/forms/email-verification.schema.ts.txt`](source/email-verification/forms/email-verification.schema.ts.txt) <- `src/components/features/auth/email-verification/email-verification.schema.ts`
- [`source/email-verification/forms/email-verification.schema.test.ts.txt`](source/email-verification/forms/email-verification.schema.test.ts.txt) <- `src/components/features/auth/email-verification/email-verification.schema.test.ts`
- [`source/email-verification/forms/resend-verification-form.tsx.txt`](source/email-verification/forms/resend-verification-form.tsx.txt) <- `src/components/features/auth/email-verification/resend-verification-form.tsx`
- [`source/email-verification/forms/verification-code-form.tsx.txt`](source/email-verification/forms/verification-code-form.tsx.txt) <- `src/components/features/auth/email-verification/verification-code-form.tsx`

## `email-verification/view/`

- [`source/email-verification/view/email-verification-view.tsx.txt`](source/email-verification/view/email-verification-view.tsx.txt) <- `src/components/features/auth/email-verification/email-verification-view.tsx`

## `forgot-password/forms/`

- [`source/forgot-password/forms/forgot-password-form.tsx.txt`](source/forgot-password/forms/forgot-password-form.tsx.txt) <- `src/components/features/auth/forgot-password/forgot-password-form.tsx`
- [`source/forgot-password/forms/forgot-password.schema.ts.txt`](source/forgot-password/forms/forgot-password.schema.ts.txt) <- `src/components/features/auth/forgot-password/forgot-password.schema.ts`

## `forgot-password/view/`

- [`source/forgot-password/view/forgot-password-view.tsx.txt`](source/forgot-password/view/forgot-password-view.tsx.txt) <- `src/components/features/auth/forgot-password/forgot-password-view.tsx`

## `google/view/`

- [`source/google/view/google-oauth-callback-view.tsx.txt`](source/google/view/google-oauth-callback-view.tsx.txt) <- `src/components/features/auth/google/google-oauth-callback-view.tsx`
- [`source/google/view/google-oauth-callback-view.test.tsx.txt`](source/google/view/google-oauth-callback-view.test.tsx.txt) <- `src/components/features/auth/google/google-oauth-callback-view.test.tsx`

## `login/forms/`

- [`source/login/forms/login-form.tsx.txt`](source/login/forms/login-form.tsx.txt) <- `src/components/features/auth/login/login-form.tsx`
- [`source/login/forms/login.schema.ts.txt`](source/login/forms/login.schema.ts.txt) <- `src/components/features/auth/login/login.schema.ts`

## `login/view/`

- [`source/login/view/login-view.tsx.txt`](source/login/view/login-view.tsx.txt) <- `src/components/features/auth/login/login-view.tsx`

## `password-reset/forms/`

- [`source/password-reset/forms/password-reset-form.tsx.txt`](source/password-reset/forms/password-reset-form.tsx.txt) <- `src/components/features/auth/password-reset/password-reset-form.tsx`
- [`source/password-reset/forms/password-reset.schema.ts.txt`](source/password-reset/forms/password-reset.schema.ts.txt) <- `src/components/features/auth/password-reset/password-reset.schema.ts`

## `password-reset/view/`

- [`source/password-reset/view/password-reset-view.tsx.txt`](source/password-reset/view/password-reset-view.tsx.txt) <- `src/components/features/auth/password-reset/password-reset-view.tsx`

## `register/forms/`

- [`source/register/forms/account-type-selector.tsx.txt`](source/register/forms/account-type-selector.tsx.txt) <- `src/components/features/auth/register/account-type-selector.tsx`
- [`source/register/forms/register-form.tsx.txt`](source/register/forms/register-form.tsx.txt) <- `src/components/features/auth/register/register-form.tsx`
- [`source/register/forms/register.schema.ts.txt`](source/register/forms/register.schema.ts.txt) <- `src/components/features/auth/register/register.schema.ts`

## `register/view/`

- [`source/register/view/register-view.tsx.txt`](source/register/view/register-view.tsx.txt) <- `src/components/features/auth/register/register-view.tsx`

## `shared/contents/`

- [`source/shared/contents/auth-showcase-content.ts.txt`](source/shared/contents/auth-showcase-content.ts.txt) <- `src/components/features/auth/shared/auth-showcase-content.ts`

## `shared/utils/`

- [`source/shared/utils/auth-input-styles.ts.txt`](source/shared/utils/auth-input-styles.ts.txt) <- `src/components/features/auth/shared/auth-input-styles.ts`
- [`source/shared/utils/development-action-path.ts.txt`](source/shared/utils/development-action-path.ts.txt) <- `src/components/features/auth/shared/development-action-path.ts`
- [`source/shared/utils/password-rules.ts.txt`](source/shared/utils/password-rules.ts.txt) <- `src/components/features/auth/shared/password-rules.ts`

## `shared/ui/`

- [`source/shared/ui/auth-brand-panel.tsx.txt`](source/shared/ui/auth-brand-panel.tsx.txt) <- `src/components/features/auth/shared/auth-brand-panel.tsx`
- [`source/shared/ui/auth-feedback.tsx.txt`](source/shared/ui/auth-feedback.tsx.txt) <- `src/components/features/auth/shared/auth-feedback.tsx`
- [`source/shared/ui/auth-form-actions.tsx.txt`](source/shared/ui/auth-form-actions.tsx.txt) <- `src/components/features/auth/shared/auth-form-actions.tsx`
- [`source/shared/ui/auth-layout.tsx.txt`](source/shared/ui/auth-layout.tsx.txt) <- `src/components/features/auth/shared/auth-layout.tsx`
- [`source/shared/ui/auth-password-input.tsx.txt`](source/shared/ui/auth-password-input.tsx.txt) <- `src/components/features/auth/shared/auth-password-input.tsx`
- [`source/shared/ui/auth-preview-controls.tsx.txt`](source/shared/ui/auth-preview-controls.tsx.txt) <- `src/components/features/auth/shared/auth-preview-controls.tsx`
- [`source/shared/ui/auth-showcase-layout.tsx.txt`](source/shared/ui/auth-showcase-layout.tsx.txt) <- `src/components/features/auth/shared/auth-showcase-layout.tsx`
- [`source/shared/ui/auth-showcase.tsx.txt`](source/shared/ui/auth-showcase.tsx.txt) <- `src/components/features/auth/shared/auth-showcase.tsx`
- [`source/shared/ui/auth-split-layout.tsx.txt`](source/shared/ui/auth-split-layout.tsx.txt) <- `src/components/features/auth/shared/auth-split-layout.tsx`
- [`source/shared/ui/auth-status-page.tsx.txt`](source/shared/ui/auth-status-page.tsx.txt) <- `src/components/features/auth/shared/auth-status-page.tsx`
- [`source/shared/ui/google-auth-button.tsx.txt`](source/shared/ui/google-auth-button.tsx.txt) <- `src/components/features/auth/shared/google-auth-button.tsx`
- [`source/shared/ui/google-auth-button.test.tsx.txt`](source/shared/ui/google-auth-button.test.tsx.txt) <- `src/components/features/auth/shared/google-auth-button.test.tsx`
- [`source/shared/ui/owlio-owl.tsx.txt`](source/shared/ui/owlio-owl.tsx.txt) <- `src/components/features/auth/shared/owlio-owl.tsx`
- [`source/shared/ui/password-field.tsx.txt`](source/shared/ui/password-field.tsx.txt) <- `src/components/features/auth/shared/password-field.tsx`
- [`source/shared/ui/password-guidance.tsx.txt`](source/shared/ui/password-guidance.tsx.txt) <- `src/components/features/auth/shared/password-guidance.tsx`
- [`source/shared/ui/session-expired-state.tsx.txt`](source/shared/ui/session-expired-state.tsx.txt) <- `src/components/features/auth/shared/session-expired-state.tsx`
