# email-verification

This directory mirrors `src/components/features/auth/email-verification/`. For the current files, proposed component folders, and manual migration checks, use the [auth guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/auth/email-verification/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `email-verification-view.tsx`

Current file: `src/components/features/auth/email-verification/email-verification-view.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { resendVerification, verifyEmail, verifyEmailCode } from '@/services/api/auth.service'
import { AuthFeedback } from '../shared/auth-feedback'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { authLinkClassName, authPrimaryButtonClassName } from '../shared/auth-input-styles'
import { VerificationCodeForm } from './verification-code-form'
import type { VerifyEmailCodeValues } from './email-verification.schema'

const verificationSteps = [
  { title: 'Check your inbox', description: 'Look for a six-digit code from Owlio.' },
  { title: 'Enter your code', description: 'Use the code to confirm your email address.' },
  { title: 'Start learning', description: 'Continue to your Owlio learning space.' },
]

export function EmailVerificationView() {
  const location = useLocation()
  const navigate = useNavigate()
  const verificationToken = new URLSearchParams(location.search).get('token')
  const handledToken = useRef<string | null>(null)
  const locationState = location.state as { email?: string; resendCooldownSeconds?: number } | null
  const [emailHint] = useState(locationState?.email ?? '')
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>(
    verificationToken ? 'verifying' : 'idle',
  )
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [resendFeedback, setResendFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(locationState?.resendCooldownSeconds ?? 0)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [verificationStatus])

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return
    const timer = window.setTimeout(() => setResendCooldownSeconds((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendCooldownSeconds])

  useEffect(() => {
    if (!verificationToken || handledToken.current === verificationToken) return
    handledToken.current = verificationToken
    navigate(location.pathname, { replace: true })
    void verifyEmail(verificationToken)
      .then(() => setVerificationStatus('verified'))
      .catch((error: unknown) => {
        setVerificationError(getApiErrorMessage(error, 'This verification link is invalid or expired.'))
        setVerificationStatus('error')
      })
  }, [verificationToken, location.pathname, navigate])

  const onVerifyCode = async (values: VerifyEmailCodeValues) => {
    setVerificationStatus('verifying')
    setVerificationError(null)
    try {
      await verifyEmailCode(values.email, values.code)
      setVerificationStatus('verified')
    } catch (error) {
      setVerificationError(getApiErrorMessage(error, 'This verification code is invalid or expired.'))
      setVerificationStatus('error')
    }
  }

  const onResend = async (email: string) => {
    setResendFeedback(null)
    try {
      const result = await resendVerification(email)
      setResendCooldownSeconds(result.resendCooldownSeconds ?? 60)
      setResendFeedback({ tone: 'success', message: result.message })
    } catch (error) {
      setResendFeedback({
        tone: 'error',
        message: getApiErrorMessage(error, 'Could not resend the verification email. Please try again.'),
      })
    }
  }

  return (
    <AuthShowcaseLayout context="email-verification">
      <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {verificationStatus === 'verified' ? 'Email verified' : 'Verify your email'}
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        {emailHint
          ? `Enter the six-digit code sent to ${emailHint}.`
          : 'Enter the six-digit code sent to your email address.'}
      </p>
      <div className="mt-7 space-y-5">
        {verificationStatus === 'verifying' ? (
            <AuthFeedback title="Verifying your email" tone="info">Please wait while we confirm your address.</AuthFeedback>
        ) : verificationStatus === 'verified' ? (
          <div className="space-y-4">
            <AuthFeedback title="Email verified" tone="success">Your account is ready. You can now sign in.</AuthFeedback>
            <Button render={<Link to="/login" />} className={authPrimaryButtonClassName}>Continue to login</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {verificationError && <AuthFeedback title="Verification wasn't accepted" tone="error">{verificationError}</AuthFeedback>}
            {resendFeedback && <AuthFeedback title={resendFeedback.tone === 'error' ? 'Could not resend code' : 'Request received'} tone={resendFeedback.tone}>{resendFeedback.message}</AuthFeedback>}
            <VerificationCodeForm
              initialEmail={emailHint}
              submitting={false}
              resendCooldownSeconds={resendCooldownSeconds}
              onSubmit={onVerifyCode}
              onResend={onResend}
            />
            <ol className="space-y-2">
              {verificationSteps.map(({ title, description }, index) => (
                <li key={title} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/80 px-3 py-3 shadow-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-700">0{index + 1}</span>
                  <span><span className="block text-xs font-semibold text-slate-800">{title}</span><span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{description}</span></span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <p className="text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className={authLinkClassName}>Log in</Link>
        </p>
      </div>
    </AuthShowcaseLayout>
  )
}
```

### `email-verification.schema.test.ts`

Current file: `src/components/features/auth/email-verification/email-verification.schema.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { verifyEmailCodeSchema } from './email-verification.schema'

describe('email verification code schema', () => {
  it('accepts a six-digit code and trims the email address', () => {
    expect(verifyEmailCodeSchema.safeParse({
      email: ' Learner@Example.com ',
      code: '004271',
    }).success).toBe(true)
  })

  it.each(['12345', '1234567', '12a456', ''])('rejects invalid code %s', (code) => {
    expect(verifyEmailCodeSchema.safeParse({
      email: 'learner@example.com',
      code,
    }).success).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(verifyEmailCodeSchema.safeParse({
      email: 'not-an-email',
      code: '004271',
    }).success).toBe(false)
  })
})
```

### `email-verification.schema.ts`

Current file: `src/components/features/auth/email-verification/email-verification.schema.ts`

```ts
import { z } from "zod"

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
})

export const verifyEmailCodeSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  code: z.string().regex(/^\d{6}$/, "Enter the six-digit code from your email."),
})

export type ResendVerificationValues = z.infer<typeof resendVerificationSchema>
export type VerifyEmailCodeValues = z.infer<typeof verifyEmailCodeSchema>
```

### `resend-verification-form.tsx`

Current file: `src/components/features/auth/email-verification/resend-verification-form.tsx`

```tsx
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { ResendVerificationValues } from "./email-verification.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authInputClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"

type ResendVerificationFormProps = {
  onSubmit: (values: ResendVerificationValues) => void
}

export function ResendVerificationForm({ onSubmit }: ResendVerificationFormProps) {
  const form = useFormContext<ResendVerificationValues>()
  const error = form.formState.errors.email

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="verificationEmail" className="sr-only">Email</Label>
          <Input id="verificationEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(error)} aria-describedby={error ? "verificationEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
          <FieldError id="verificationEmail-error" errors={[error]} />
        </div>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Sending…' : 'Resend verification email'}</Button>
    </form>
  )
}
```

### `verification-code-form.tsx`

Current file: `src/components/features/auth/email-verification/verification-code-form.tsx`

```tsx
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authInputClassName, authPrimaryButtonClassName } from '../shared/auth-input-styles'
import { verifyEmailCodeSchema, type VerifyEmailCodeValues } from './email-verification.schema'

type VerificationCodeFormProps = {
  initialEmail: string
  submitting: boolean
  resendCooldownSeconds: number
  onSubmit: (values: VerifyEmailCodeValues) => Promise<void>
  onResend: (email: string) => Promise<void>
}

export function VerificationCodeForm({
  initialEmail,
  submitting,
  resendCooldownSeconds,
  onSubmit,
  onResend,
}: VerificationCodeFormProps) {
  const form = useForm<VerifyEmailCodeValues>({
    resolver: zodResolver(verifyEmailCodeSchema),
    defaultValues: { email: initialEmail, code: '' },
    mode: 'onTouched',
  })
  const errors = form.formState.errors

  const resend = async () => {
    if (!await form.trigger('email')) return
    const email = form.getValues('email')
    await onResend(email)
    form.setValue('code', '')
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup className="gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="verificationEmail">Email</Label>
            <Input
              id="verificationEmail"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'verificationEmail-error' : undefined}
              className={authInputClassName}
              {...form.register('email')}
            />
            <FieldError id="verificationEmail-error" errors={[errors.email]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Six-digit code</Label>
            <Controller
              control={form.control}
              name="code"
              render={({ field }) => (
                <InputOTP
                  id="verificationCode"
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="^[0-9]*$"
                  aria-label="Six-digit verification code"
                  aria-invalid={Boolean(errors.code)}
                  aria-describedby={errors.code ? 'verificationCode-error' : undefined}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            <FieldError id="verificationCode-error" errors={[errors.code]} />
          </div>
        </FieldGroup>
        <Button type="submit" disabled={submitting || form.formState.isSubmitting} className={authPrimaryButtonClassName}>
          {submitting || form.formState.isSubmitting ? 'Verifying…' : 'Verify email'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={resendCooldownSeconds > 0 || form.formState.isSubmitting}
          onClick={() => void resend()}
          className="w-full text-sm text-slate-600"
        >
          {resendCooldownSeconds > 0 ? `Resend code in ${resendCooldownSeconds}s` : 'Resend code'}
        </Button>
      </form>
    </FormProvider>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
