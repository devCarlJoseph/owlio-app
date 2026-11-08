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
