import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { AccountType } from '@/services/api/api.types'
import { registerAccount, startGoogleOAuth } from '@/services/api/auth.service'
import { AuthFeedback } from '../../shared/ui/auth-feedback'
import { AuthShowcaseLayout } from '../../shared/ui/auth-showcase-layout'
import { registerSchema, type RegisterValues } from '../schemas/register.schema'
import { RegisterForm } from '../forms/register-form'

export function RegisterView() {
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [googlePending, setGooglePending] = useState(false)
  const locationState = location.state as { oauthNotice?: string; googleSetup?: boolean } | null
  const [useEmail, setUseEmail] = useState(false)
  const googleOnly = locationState?.googleSetup === true && !useEmail
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
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 surface-dark:text-foreground">{googleOnly ? 'Finish Google signup' : 'Create your account'}</h1>
        <div className="mt-7 space-y-4">
          {locationState?.oauthNotice && !useEmail && <AuthFeedback title="Continue account setup" tone="info">{locationState.oauthNotice}</AuthFeedback>}
          {submitError && <AuthFeedback title="Account creation failed" tone="error">{submitError}</AuthFeedback>}
          <RegisterForm onSubmit={onSubmit} onGoogle={onGoogle} googlePending={googlePending} googleOnly={googleOnly} onUseEmail={() => setUseEmail(true)} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
