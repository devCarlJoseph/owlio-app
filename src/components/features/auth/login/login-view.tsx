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
