# register

This directory mirrors `src/components/features/auth/register/`. For the current files, proposed component folders, and manual migration checks, use the [auth guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/auth/register/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `account-type-selector.tsx`

Current file: `src/components/features/auth/register/account-type-selector.tsx`

```tsx
import { GraduationCap, Languages, School, UserRound } from "lucide-react"
import { Controller, useFormContext } from "react-hook-form"
import { FieldError } from "@/components/ui/field"
import type { RegisterValues } from "./register.schema"

const accountTypes = [
  { value: "student", label: "Student", description: "For learners", Icon: GraduationCap },
  { value: "educator", label: "Educator", description: "School and college teachers", Icon: School },
  { value: "tutor", label: "Tutor", description: "One-to-one and small-group tutoring", Icon: UserRound },
  { value: "esl", label: "ESL Teacher", description: "English and language lessons", Icon: Languages },
] as const

export function AccountTypeSelector() {
  const form = useFormContext<RegisterValues>()
  const error = form.formState.errors.accountType?.message

  return (
    <fieldset className="space-y-2" aria-describedby={error ? "accountType-error" : undefined}>
      <legend className="mb-2 text-sm font-medium text-slate-600">I am joining Owlio as <span className="text-destructive">*</span></legend>
      <Controller
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2">
            {accountTypes.map(({ value, label, description, Icon }) => (
              <label
                key={value}
                htmlFor={`accountType-${value}`}
                className={`flex min-w-0 cursor-pointer flex-col gap-1.5 rounded-lg border p-3 transition focus-within:ring-2 focus-within:ring-blue-500/20 ${
                  field.value === value ? "border-blue-500 bg-blue-50/70" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <input
                    id={`accountType-${value}`}
                    type="radio"
                    required
                    name={field.name}
                    value={value}
                    checked={field.value === value}
                    onChange={() => field.onChange(value)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className="size-3.5 shrink-0 accent-blue-600"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "accountType-error" : undefined}
                  />
                  <Icon className="size-3.5 shrink-0 text-blue-700" aria-hidden="true" />
                  <span className="truncate text-sm font-semibold text-slate-800">{label}</span>
                </span>
                <span className="pl-5 text-[11px] leading-4 text-slate-500">{description}</span>
              </label>
            ))}
          </div>
        )}
      />
      <FieldError id="accountType-error" errors={[error ? { message: error } : undefined]} />
    </fieldset>
  )
}
```

### `register-form.tsx`

Current file: `src/components/features/auth/register/register-form.tsx`

```tsx
import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { AuthPasswordInput } from "../shared/auth-password-input"
import { authInputClassName, authLinkClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"
import { PasswordGuidance } from "../shared/password-guidance"
import { GoogleAuthButton } from "../shared/google-auth-button"
import { AccountTypeSelector } from "./account-type-selector"
import type { RegisterValues } from "./register.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AccountType } from "@/services/api/api.types"

type RegisterFormProps = {
  onSubmit: (values: RegisterValues) => void
  onGoogle: (accountType: AccountType) => void
  googlePending: boolean
}

export function RegisterForm({ onSubmit, onGoogle, googlePending }: RegisterFormProps) {
  const form = useFormContext<RegisterValues>()
  const errors = form.formState.errors

  const continueWithGoogle = () => {
    const accountType = form.getValues('accountType')
    const termsAccepted = form.getValues('acceptTerms')
    if (!accountType) {
      form.setError('accountType', { type: 'manual', message: 'Choose an account type to continue with Google.' })
      return
    }
    if (!termsAccepted) {
      form.setError('acceptTerms', { type: 'manual', message: 'Accept the terms to continue.' })
      return
    }
    onGoogle(accountType)
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="sr-only">Full name</Label>
          <Input id="fullName" autoComplete="name" placeholder="Enter your full name" required aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined} className={authInputClassName} {...form.register("fullName")} />
          <FieldError id="fullName-error" errors={[errors.fullName]} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="registerEmail" className="sr-only">Email</Label>
          <Input id="registerEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "registerEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
          <FieldError id="registerEmail-error" errors={[errors.email]} />
        </div>
        <AccountTypeSelector />
        <div className="space-y-1.5">
          <AuthPasswordInput id="registerPassword" label="Password" placeholder="Create a password" autoComplete="new-password" registration={form.register("password")} error={errors.password?.message} />
          <PasswordGuidance />
        </div>
        <AuthPasswordInput id="passwordConfirmation" label="Confirm password" placeholder="Confirm your password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={errors.passwordConfirmation?.message} />
        <div className="space-y-1.5">
          <label htmlFor="acceptTerms" className="flex cursor-pointer items-start gap-2 text-sm leading-5 text-slate-600">
            <input id="acceptTerms" type="checkbox" required className="mt-0.5 size-4 shrink-0 rounded accent-blue-600" aria-invalid={Boolean(errors.acceptTerms)} aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined} {...form.register("acceptTerms")} />
            <span>I agree to the Terms of Service and Privacy Policy <span className="text-destructive">*</span></span>
          </label>
          <FieldError id="acceptTerms-error" errors={[errors.acceptTerms]} />
        </div>
      </FieldGroup>
      <div className="space-y-5">
        <p className="text-center text-xs text-slate-500">Or continue without an Owlio password. Choose a role and accept the terms above.</p>
        <GoogleAuthButton onClick={continueWithGoogle} disabled={googlePending} label={googlePending ? 'Connecting to Google…' : 'Sign up with Google'} />
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Creating account…' : 'Create account'}</Button>
      <p className="text-center text-sm text-slate-500">
        Already have an account? <Link to="/login" className={authLinkClassName}>Log in</Link>
      </p>
    </form>
  )
}
```

### `register-view.tsx`

Current file: `src/components/features/auth/register/register-view.tsx`

```tsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { AccountType } from '@/services/api/api.types'
import { registerAccount, startGoogleOAuth } from '@/services/api/auth.service'
import { AuthFeedback } from '../shared/auth-feedback'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { registerSchema, type RegisterValues } from './register.schema'
import { RegisterForm } from './register-form'

export function RegisterView() {
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [googlePending, setGooglePending] = useState(false)
  const locationState = location.state as { oauthNotice?: string } | null
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', accountType: undefined, password: '', passwordConfirmation: '', acceptTerms: false },
    mode: 'onTouched',
  })

  const onSubmit = async (values: RegisterValues) => {
    setSubmitError(null)
    try {
      const result = await registerAccount({
        name: values.fullName,
        email: values.email,
        accountType: values.accountType,
        password: values.password,
        confirmPassword: values.passwordConfirmation,
        termsAccepted: true,
      })
      navigate('/email-verification', {
        replace: true,
        state: {
          email: values.email,
          resendCooldownSeconds: result.resendCooldownSeconds ?? 60,
        },
      })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not create your account. Please try again.'))
    }
  }

  const onGoogle = async (accountType: AccountType) => {
    setSubmitError(null)
    setGooglePending(true)
    try {
      const { authorizationUrl } = await startGoogleOAuth({
        intent: 'register',
        accountType,
        termsAccepted: true,
      })
      window.location.assign(authorizationUrl)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not start Google sign-up. Please try again.'))
      setGooglePending(false)
    }
  }

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout context="register">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Create your account</h1>
        <div className="mt-7 space-y-4">
          {locationState?.oauthNotice && <AuthFeedback title="Continue account setup" tone="info">{locationState.oauthNotice}</AuthFeedback>}
          {submitError && <AuthFeedback title="Account creation failed" tone="error">{submitError}</AuthFeedback>}
          <RegisterForm onSubmit={onSubmit} onGoogle={onGoogle} googlePending={googlePending} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
```

### `register.schema.ts`

Current file: `src/components/features/auth/register/register.schema.ts`

```ts
import { z } from "zod"
import { passwordSchema } from "../shared/password-rules"

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  accountType: z.enum(["student", "educator", "tutor", "esl"], { error: "Choose an account type." }),
  password: passwordSchema,
  passwordConfirmation: z.string().min(1, "Confirm your password."),
  acceptTerms: z.boolean().refine((accepted) => accepted, "Accept the terms to continue."),
}).refine((values) => values.password === values.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "Passwords do not match.",
})

export type RegisterValues = z.infer<typeof registerSchema>
```

<!-- END GENERATED CURRENT SOURCE -->
