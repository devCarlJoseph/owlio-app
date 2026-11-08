# login

This directory mirrors `src/components/features/auth/login/`. For the current files, proposed component folders, and manual migration checks, use the [auth guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/auth/login/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `login-form.tsx`

Current file: `src/components/features/auth/login/login-form.tsx`

```tsx
import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { LoginValues } from "./login.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthPasswordInput } from "../shared/auth-password-input"
import { authInputClassName, authLinkClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"
import { GoogleAuthButton } from "../shared/google-auth-button"

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
  onGoogle: () => void
  googlePending: boolean
}

export function LoginForm({ onSubmit, onGoogle, googlePending }: LoginFormProps) {
  const form = useFormContext<LoginValues>()
  const errors = form.formState.errors

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <GoogleAuthButton onClick={onGoogle} disabled={googlePending} label={googlePending ? 'Connecting to Google…' : 'Continue with Google'} />
      <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or with email<span className="h-px flex-1 bg-slate-200" /></div>
      <FieldGroup className="gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="loginEmail" className="sr-only">Email</Label>
          <Input id="loginEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "loginEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
          <FieldError id="loginEmail-error" errors={[errors.email]} />
        </div>
        <AuthPasswordInput id="loginPassword" label="Password" placeholder="Enter your password" autoComplete="current-password" registration={form.register("password")} error={errors.password?.message} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input id="rememberMe" type="checkbox" className="size-4 rounded accent-blue-600" {...form.register("rememberMe")} />
            Stay signed in
          </label>
          <Link to="/forgot-password" className={`text-sm ${authLinkClassName} font-medium`}>Forgot password?</Link>
        </div>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Signing in…' : 'Log in'}</Button>
      <p className="text-center text-sm text-slate-500">
        Don’t have an account? <Link to="/register" className={authLinkClassName}>Sign up</Link>
      </p>
    </form>
  )
}
```

### `login-view.tsx`

Current file: `src/components/features/auth/login/login-view.tsx`

```tsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getLoginDestination } from '@/lib/workspace-path'
import { startGoogleOAuth } from '@/services/api/auth.service'
import { useAuthSession } from '../auth-session-context'
import { AuthFeedback } from '../shared/auth-feedback'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { LoginForm } from './login-form'
import { loginSchema, type LoginValues } from './login.schema'

export function LoginView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuthSession()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [googlePending, setGooglePending] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onTouched',
  })

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null)
    try {
      const session = await signIn(values)
      const from = (location.state as { from?: unknown } | null)?.from
      navigate(getLoginDestination(session.user.roles, from), { replace: true })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not sign in. Check your credentials and try again.'))
    }
  }

  const onGoogle = async () => {
    setSubmitError(null)
    setGooglePending(true)
    try {
      const { authorizationUrl } = await startGoogleOAuth({
        intent: 'login',
        rememberMe: form.getValues('rememberMe'),
      })
      window.location.assign(authorizationUrl)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not start Google sign-in. Please try again.'))
      setGooglePending(false)
    }
  }

  const oauthNotice = (location.state as { oauthNotice?: string } | null)?.oauthNotice

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout context="login">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Welcome back!</h1>
        <p className="mt-1.5 text-sm text-slate-500">Log in to your Owlio account to continue learning.</p>
        <div className="mt-7 space-y-4">
          {oauthNotice && <AuthFeedback title="Google sign-in" tone="info">{oauthNotice}</AuthFeedback>}
          {submitError && <AuthFeedback title="Sign-in failed" tone="error">{submitError}</AuthFeedback>}
          <LoginForm onSubmit={onSubmit} onGoogle={onGoogle} googlePending={googlePending} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
```

### `login.schema.ts`

Current file: `src/components/features/auth/login/login.schema.ts`

```ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean(),
})

export type LoginValues = z.infer<typeof loginSchema>
```

<!-- END GENERATED CURRENT SOURCE -->
