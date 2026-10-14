import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiErrorMessage } from '@/services/api/api-error'
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
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onTouched',
  })

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null)
    try {
      const session = await signIn(values)
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      const safeReturnPath = from?.startsWith('/') && !from.startsWith('//') ? from : null
      const defaultPath = session.user.roles.includes('STUDENT') ? '/students' : '/educators'
      navigate(safeReturnPath ?? defaultPath, { replace: true })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not sign in. Check your credentials and try again.'))
    }
  }

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout context="login">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Welcome back!</h1>
        <p className="mt-1.5 text-sm text-slate-500">Log in to your Owlio account to continue learning.</p>
        <div className="mt-7 space-y-4">
          {submitError && <AuthFeedback title="Sign-in failed" tone="error">{submitError}</AuthFeedback>}
          <LoginForm onSubmit={onSubmit} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
