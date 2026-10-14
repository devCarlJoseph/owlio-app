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
