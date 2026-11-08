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
