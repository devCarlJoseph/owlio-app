# google

This directory mirrors `src/components/features/auth/google/`. For the current files, proposed component folders, and manual migration checks, use the [auth guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/auth/google/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `google-oauth-callback-view.test.tsx`

Current file: `src/components/features/auth/google/google-oauth-callback-view.test.tsx`

```tsx
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import type { AuthUser } from '@/services/api/api.types'
import { getCsrfToken, getCurrentUser } from '@/services/api/auth.service'
import { AuthSessionContext } from '../auth-session-context'
import { GoogleOAuthCallbackView } from './google-oauth-callback-view'

vi.mock('@/services/api/auth.service', () => ({ getCsrfToken: vi.fn(), getCurrentUser: vi.fn() }))
vi.mock('../shared/auth-showcase-layout', () => ({
  AuthShowcaseLayout: ({ children }: { children: import('react').ReactNode }) => <main>{children}</main>,
}))
const user: AuthUser = { id: 'user', name: 'Test', email: 'test@example.test', roles: ['ESL'],
  status: 'ACTIVE', emailVerifiedAt: '2026-10-29T00:00:00Z', createdAt: '2026-10-29T00:00:00Z' }
beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)
function callback(result: string) {
  const refreshCurrentUser = vi.fn().mockResolvedValue(undefined)
  render(<MemoryRouter initialEntries={['/oauth/google/callback?result=' + result]}>
    <AuthSessionContext.Provider value={{ user: null, status: 'anonymous', error: null,
      signIn: vi.fn(), signOut: vi.fn(), refreshCurrentUser }}>
      <Routes>
        <Route path="/oauth/google/callback" element={<GoogleOAuthCallbackView />} />
        <Route path="/email-verification" element={<p>Verify email</p>} />
        <Route path="/register" element={<p>Register account</p>} />
        <Route path="/login" element={<p>Sign in</p>} />
        <Route path="/esl" element={<p>ESL workspace</p>} />
        <Route path="/esl/account/security" element={<p>Account security</p>} />
      </Routes>
    </AuthSessionContext.Provider>
  </MemoryRouter>)
  return refreshCurrentUser
}
describe('Google callback matches API outcome codes', () => {
  it.each([
    ['verification_required', 'Verify email'],
    ['registration_required', 'Register account'],
    ['link_required', 'Sign in'],
    ['link_conflict', 'Sign in'],
    ['failed', 'Sign in'],
  ])('handles %s', async (result, destination) => {
    callback(result)
    await screen.findByText(destination)
    expect(getCurrentUser).not.toHaveBeenCalled()
  })

  it.each([['authenticated', 'ESL workspace'], ['linked', 'Account security']])(
    'confirms the API session for %s', async (result, destination) => {
      vi.mocked(getCsrfToken).mockResolvedValue('fresh')
      vi.mocked(getCurrentUser).mockResolvedValue(user)
      const refresh = callback(result)
      await screen.findByText(destination)
      await waitFor(() => expect(refresh).toHaveBeenCalledOnce())
      expect(getCsrfToken).toHaveBeenCalledWith(true)
    },
  )

  it('does not treat an authenticated query parameter as proof of a session', async () => {
    vi.mocked(getCsrfToken).mockResolvedValue('fresh')
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Could not check session.'))
    const refresh = callback('authenticated')
    await screen.findByText('Could not check session.')
    expect(refresh).not.toHaveBeenCalled()
    expect(screen.queryByText('ESL workspace')).toBeNull()
  })
})
```

### `google-oauth-callback-view.tsx`

Current file: `src/components/features/auth/google/google-oauth-callback-view.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { AuthFeedback } from '../shared/auth-feedback'
import { AuthShowcaseLayout } from '../shared/auth-showcase-layout'
import { authPrimaryButtonClassName } from '../shared/auth-input-styles'
import { useAuthSession } from '../auth-session-context'
import { getWorkspacePath } from '@/lib/workspace-path'
import { getCurrentUser, getCsrfToken } from '@/services/api/auth.service'
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

    if (result === 'verification_required') {
      navigate('/email-verification', {
        replace: true,
        state: { source: 'google', resendCooldownSeconds: 60 },
      })
      return
    }
    if (result === 'registration_required') {
      navigate('/register', {
        replace: true,
        state: { oauthNotice: 'No Google-linked Owlio account was found. Choose a role and sign up with Google.' },
      })
      return
    }
    if (result === 'link_required') {
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
        await getCsrfToken(true)
        const user = await getCurrentUser()
        await refreshCurrentUser()
        const workspace = getWorkspacePath(user.roles)
        navigate(result === 'linked' && workspace !== '/access-denied' ? `${workspace}/account/security` : workspace, { replace: true })
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
```

<!-- END GENERATED CURRENT SOURCE -->
