# password-reset

This directory mirrors `src/components/features/auth/password-reset/`. For the current files, proposed component folders, and manual migration checks, use the [auth guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/auth/password-reset/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `password-reset-form.tsx`

Current file: `src/components/features/auth/password-reset/password-reset-form.tsx`

```tsx
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { authPrimaryButtonClassName } from "../shared/auth-input-styles"
import { PasswordField } from "../shared/password-field"
import { PasswordGuidance } from "../shared/password-guidance"
import type { PasswordResetValues } from "./password-reset.schema"

type PasswordResetFormProps = {
  onSubmit: (values: PasswordResetValues) => void
}

export function PasswordResetForm({ onSubmit }: PasswordResetFormProps) {
  const form = useFormContext<PasswordResetValues>()
  const error = form.formState.errors.passwordConfirmation?.message

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <PasswordField id="resetPassword" label="New password" placeholder="Create a new password" autoComplete="new-password" registration={form.register("password")} error={form.formState.errors.password?.message} />
      <PasswordGuidance />
      <PasswordField id="resetPasswordConfirmation" label="Confirm new password" placeholder="Confirm your new password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={error} />
      <Button type="submit" disabled={form.formState.isSubmitting} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Updating…' : 'Set new password'}</Button>
    </form>
  )
}
```

### `password-reset-view.tsx`

Current file: `src/components/features/auth/password-reset/password-reset-view.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { resetPassword } from '@/services/api/auth.service'
import { AuthFeedback } from '../shared/auth-feedback'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { authLinkClassName, authPrimaryButtonClassName } from '../shared/auth-input-styles'
import { PasswordResetForm } from './password-reset-form'
import { passwordResetSchema, type PasswordResetValues } from './password-reset.schema'

export function PasswordResetView() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryToken = new URLSearchParams(location.search).get('token')
  const [resetToken, setResetToken] = useState<string | null>(queryToken)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: '', passwordConfirmation: '' },
    mode: 'onTouched',
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [resetSuccess])

  useEffect(() => {
    if (queryToken) navigate(location.pathname, { replace: true })
  }, [queryToken, location.pathname, navigate])

  const onSubmit = async (values: PasswordResetValues) => {
    if (!resetToken) return
    setSubmitError(null)
    try {
      await resetPassword(resetToken, values.password, values.passwordConfirmation)
      setResetToken(null)
      setResetSuccess(true)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not reset your password. Request a new reset link and try again.'))
    }
  }

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout context="password-reset">
        <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">Choose a new password</h1>
        <p className="mt-1.5 text-sm text-slate-500">{resetToken ? 'Set a new password for your Owlio account.' : 'Request a password-reset link to continue.'}</p>
        <div className="mt-7 space-y-4">
          {submitError && <AuthFeedback title="Password reset failed" tone="error">{submitError}</AuthFeedback>}
          {resetSuccess ? (
            <div className="space-y-4">
              <AuthFeedback title="Password updated" tone="success">Your password has been reset. Sign in with your new password.</AuthFeedback>
              <Button render={<Link to="/login" />} className={authPrimaryButtonClassName}>Continue to login</Button>
            </div>
          ) : resetToken ? (
            <PasswordResetForm onSubmit={onSubmit} />
          ) : (
            <Button render={<Link to="/forgot-password" />} className={authPrimaryButtonClassName}>Request a new reset link</Button>
          )}
          <p className="text-center text-sm text-slate-500">
            Remembered your password? <Link to="/login" className={authLinkClassName}>Log in</Link>
          </p>
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
```

### `password-reset.schema.ts`

Current file: `src/components/features/auth/password-reset/password-reset.schema.ts`

```ts
import { z } from "zod"
import { passwordSchema } from "../shared/password-rules"

export const passwordResetSchema = z.object({
  password: passwordSchema,
  passwordConfirmation: z.string().min(1, "Confirm your password."),
}).refine((values) => values.password === values.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "Passwords do not match.",
})

export type PasswordResetValues = z.infer<typeof passwordResetSchema>
```

<!-- END GENERATED CURRENT SOURCE -->
