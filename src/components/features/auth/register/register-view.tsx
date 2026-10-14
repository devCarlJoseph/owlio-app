import { useState } from 'react'
import { useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiErrorMessage } from '@/services/api/api-error'
import { registerAccount } from '@/services/api/auth.service'
import { AuthFeedback } from '../shared/auth-feedback'
import { getDevelopmentActionPath } from '../shared/development-action-path'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { registerSchema, type RegisterValues } from './register.schema'
import { RegisterForm } from './register-form'

export function RegisterView() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
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
      const verificationPath = getDevelopmentActionPath(result.developmentActionUrl)
      navigate(verificationPath ?? '/email-verification', { replace: true, state: { email: values.email } })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not create your account. Please try again.'))
    }
  }

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout context="register">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Create your account</h1>
        <div className="mt-7 space-y-4">
          {submitError && <AuthFeedback title="Account creation failed" tone="error">{submitError}</AuthFeedback>}
          <RegisterForm onSubmit={onSubmit} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
