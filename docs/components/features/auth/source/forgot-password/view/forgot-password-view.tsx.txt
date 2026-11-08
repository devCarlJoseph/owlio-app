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
