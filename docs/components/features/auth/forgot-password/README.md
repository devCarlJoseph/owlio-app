# forgot-password

This directory mirrors `src/components/features/auth/forgot-password/`. For the current files, proposed component folders, and manual migration checks, use the [auth guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/auth/forgot-password/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `forgot-password-form.tsx`

Current file: `src/components/features/auth/forgot-password/forgot-password-form.tsx`

```tsx
import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { ForgotPasswordValues } from "./forgot-password.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authInputClassName, authLinkClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"

type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordValues) => void
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const form = useFormContext<ForgotPasswordValues>()
  const error = form.formState.errors.email

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="forgotEmail" className="sr-only">Email</Label>
          <Input id="forgotEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(error)} aria-describedby={error ? "forgotEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
          <FieldError id="forgotEmail-error" errors={[error]} />
        </div>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Sending…' : 'Send reset instructions'}</Button>
      <p className="text-center text-sm text-slate-500">
        Remembered your password? <Link to="/login" className={authLinkClassName}>Log in</Link>
      </p>
    </form>
  )
}
```

### `forgot-password-view.tsx`

Current file: `src/components/features/auth/forgot-password/forgot-password-view.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiErrorMessage } from '@/services/api/api-error'
import { requestPasswordReset } from '@/services/api/auth.service'
import { AuthFeedback } from '../shared/auth-feedback'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { getDevelopmentActionPath } from '../shared/development-action-path'
import { ForgotPasswordForm } from './forgot-password-form'
import { forgotPasswordSchema, type ForgotPasswordValues } from './forgot-password.schema'

export function ForgotPasswordView() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [requestSent])

  const onSubmit = async (values: ForgotPasswordValues) => {
    setSubmitError(null)
    setRequestSent(false)
    try {
      const result = await requestPasswordReset(values.email)
      const developmentPath = getDevelopmentActionPath(result.developmentActionUrl)
      if (developmentPath) {
        navigate(developmentPath, { replace: true })
        return
      }
      setRequestSent(true)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not request a password reset. Please try again.'))
    }
  }

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout context="forgot-password">
        <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">Reset your password</h1>
        <p className="mt-1.5 text-sm text-slate-500">Enter the email address associated with your Owlio account.</p>
        <div className="mt-7 space-y-4">
          {submitError && <AuthFeedback title="Could not request a reset" tone="error">{submitError}</AuthFeedback>}
          {requestSent && <AuthFeedback title="Check your inbox" tone="success">If an active account exists, password-reset instructions will be sent.</AuthFeedback>}
          <ForgotPasswordForm onSubmit={onSubmit} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
```

### `forgot-password.schema.ts`

Current file: `src/components/features/auth/forgot-password/forgot-password.schema.ts`

```ts
import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
```

<!-- END GENERATED CURRENT SOURCE -->
