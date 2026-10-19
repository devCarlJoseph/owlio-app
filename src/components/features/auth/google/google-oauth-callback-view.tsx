import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { AuthFeedback } from '../shared/auth-feedback'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { authPrimaryButtonClassName } from '../shared/auth-input-styles'
import { useAuthSession } from '../auth-session-context'
import { getCurrentUser } from '@/services/api/auth.service'
import { getApiErrorMessage } from '@/services/api/api-error'

export function GoogleOAuthCallbackView() {
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshCurrentUser } = useAuthSession()
  const handled = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    const result = new URLSearchParams(location.search).get('result')
    navigate(location.pathname, { replace: true })

    if (result === 'verification-required') {
      navigate('/email-verification', {
        replace: true,
        state: { source: 'google', resendCooldownSeconds: 60 },
      })
      return
    }
    if (result === 'registration-required') {
      navigate('/register', {
        replace: true,
        state: { oauthNotice: 'No Google-linked Owlio account was found. Choose a role and sign up with Google.' },
      })
      return
    }
    if (result === 'account-link-required') {
      navigate('/login', {
        replace: true,
        state: { oauthNotice: 'Sign in to your existing account, then link Google from Account Security.' },
      })
      return
    }
    if (result !== 'authenticated' && result !== 'linked') {
      navigate('/login', {
        replace: true,
        state: { oauthNotice: result === 'cancelled' ? 'Google sign-in was cancelled.' : 'Google sign-in could not be completed. Please try again.' },
      })
      return
    }

    void (async () => {
      try {
        const user = await getCurrentUser()
        await refreshCurrentUser()
        const workspace = user.roles.includes('STUDENT') ? '/students' : '/educators'
        navigate(result === 'linked' ? `${workspace}/account/security` : workspace, { replace: true })
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Could not finish Google sign-in. Please try again.'))
      }
    })()
  }, [location.pathname, location.search, navigate, refreshCurrentUser])

  return (
    <AuthShowcaseLayout context="login">
      <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Connecting to Owlio</h1>
      {error
        ? (
          <div className="space-y-4">
            <AuthFeedback title="Google sign-in failed" tone="error">{error}</AuthFeedback>
            <Button render={<Link to="/login" />} className={authPrimaryButtonClassName}>Return to login</Button>
          </div>
        )
        : <AuthFeedback title="Finishing sign-in" tone="info">Please wait while we confirm your Owlio session.</AuthFeedback>}
    </AuthShowcaseLayout>
  )
}
