import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { resendVerification, verifyEmail } from '@/services/api/auth.service'
import { AuthFeedback } from '../shared/auth-feedback'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { authLinkClassName, authPrimaryButtonClassName } from '../shared/auth-input-styles'
import { getDevelopmentActionPath } from '../shared/development-action-path'
import { ResendVerificationForm } from './resend-verification-form'
import { resendVerificationSchema, type ResendVerificationValues } from './email-verification.schema'

const verificationSteps = [
  { title: 'Check your inbox', description: 'Look for an email from Owlio.' },
  { title: 'Open your verification link', description: 'Use the link to confirm your email address.' },
  { title: 'Start learning', description: 'Continue to your Owlio learning space.' },
]

export function EmailVerificationView() {
  const location = useLocation()
  const navigate = useNavigate()
  const verificationToken = new URLSearchParams(location.search).get('token')
  const handledToken = useRef<string | null>(null)
  const locationState = location.state as { email?: string } | null
  const [emailHint] = useState(locationState?.email ?? '')
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>(
    verificationToken ? 'verifying' : 'idle',
  )
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [resendFeedback, setResendFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const form = useForm<ResendVerificationValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: emailHint },
    mode: 'onTouched',
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [isResending, verificationStatus])

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

  const onResend = async (values: ResendVerificationValues) => {
    setResendFeedback(null)
    try {
      const result = await resendVerification(values.email)
      const developmentPath = getDevelopmentActionPath(result.developmentActionUrl)
      if (developmentPath) {
        navigate(developmentPath, { replace: true })
        return
      }
      setResendFeedback({ tone: 'success', message: result.message })
    } catch (error) {
      setResendFeedback({
        tone: 'error',
        message: getApiErrorMessage(error, 'Could not resend the verification email. Please try again.'),
      })
    }
  }

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout context="email-verification">
        <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {isResending ? 'Resend verification email' : 'Verify your email'}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {isResending
            ? 'Enter the email address associated with your Owlio account.'
            : emailHint
              ? `Check ${emailHint} for a verification link.`
              : 'Confirm your email to keep your Owlio learning space connected.'}
        </p>
        <div className="mt-7 space-y-5">
          {isResending ? (
            <div className="space-y-3">
              {resendFeedback && <AuthFeedback title={resendFeedback.tone === 'error' ? 'Could not resend email' : 'Request received'} tone={resendFeedback.tone}>{resendFeedback.message}</AuthFeedback>}
              <ResendVerificationForm onSubmit={onResend} />
              <Button type="button" variant="ghost" onClick={() => setIsResending(false)} className="w-full text-sm text-slate-600">Back</Button>
            </div>
          ) : verificationStatus === 'verifying' ? (
            <AuthFeedback title="Verifying your email" tone="info">Please wait while we confirm your address.</AuthFeedback>
          ) : verificationStatus === 'verified' ? (
            <div className="space-y-4">
              <AuthFeedback title="Email verified" tone="success">Your account is ready. You can now sign in.</AuthFeedback>
              <Button render={<Link to="/login" />} className={authPrimaryButtonClassName}>Continue to login</Button>
            </div>
          ) : verificationStatus === 'error' ? (
            <div className="space-y-4">
              <AuthFeedback title="Verification link not accepted" tone="error">{verificationError}</AuthFeedback>
              <Button type="button" onClick={() => setIsResending(true)} className={authPrimaryButtonClassName}>Request another verification email</Button>
            </div>
          ) : (
            <div className="space-y-5">
              <ol className="space-y-3">
                {verificationSteps.map(({ title, description }, index) => (
                  <li key={title} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/80 px-3 py-3 shadow-sm">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-700">0{index + 1}</span>
                    <span><span className="block text-xs font-semibold text-slate-800">{title}</span><span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{description}</span></span>
                  </li>
                ))}
              </ol>
              <Button type="button" onClick={() => setIsResending(true)} className={authPrimaryButtonClassName}>Resend verification email</Button>
            </div>
          )}
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className={authLinkClassName}>Log in</Link>
          </p>
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
