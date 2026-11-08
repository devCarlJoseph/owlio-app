import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Link, MemoryRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router'
import { AuthRouteRedirect } from '@/components/common/auth-route-redirect'
import type { AuthRole, AuthUser } from '@/services/api/api.types'
import { AuthSessionContext, type AuthSessionContextValue } from './auth-session-context'
import { RequireAuth } from './require-auth'
import { RequireGuest } from './require-guest'
import { RequireRole } from './require-role'
import { NoWorkspaceView } from './no-workspace-view'

vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: true }))

afterEach(cleanup)
const workspaces = [['STUDENT', '/students'], ['EDUCATOR', '/educators'], ['TUTOR', '/tutors'], ['ESL', '/esl']] as const
function session(roles: AuthRole[] | null): AuthSessionContextValue {
  const user: AuthUser | null = roles && {
    id: 'user', name: 'Test user', email: 'user@example.test', roles,
    status: 'ACTIVE', emailVerifiedAt: '2026-10-29T00:00:00Z', createdAt: '2026-10-29T00:00:00Z',
  }
  return { user, status: user ? 'authenticated' : 'anonymous', error: null,
    signIn: vi.fn(), signOut: vi.fn(), refreshCurrentUser: vi.fn() }
}
function HistoryControls() {
  const navigate = useNavigate()
  return <><button onClick={() => navigate(-1)}>Back</button><Link to="/login">Login link</Link></>
}
function tree(value: AuthSessionContextValue, paths: string[]) {
  return <MemoryRouter initialEntries={paths}><AuthSessionContext.Provider value={value}>
    <HistoryControls />
    <Routes>
      <Route element={<RequireGuest />}>
        {['login', 'register', 'email-verification', 'forgot-password', 'password-reset', 'onboarding'].map((path) =>
          <Route key={path} path={'/' + path} element={<p>Guest {path}</p>} />)}
        <Route path="/auth/*" element={<AuthRouteRedirect />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>
      <Route element={<RequireAuth><Outlet /></RequireAuth>}>
        {workspaces.map(([role, path]) =>
          <Route key={role} path={path} element={<RequireRole role={role}><Outlet /></RequireRole>}>
            <Route index element={<p>Workspace {role}</p>} />
            <Route path="notes" element={<p>Feature {role}</p>} />
          </Route>)}
      </Route>
      <Route path="/access-denied" element={<NoWorkspaceView />} />
      <Route path="/oauth/google/callback" element={<p>OAuth callback</p>} />
    </Routes>
  </AuthSessionContext.Provider></MemoryRouter>
}

describe('role-scoped feature routes', () => {
  for (const [actor] of workspaces) {
    it.each(workspaces)('%s workspace rejects any unassigned role for ' + actor, async (target, path) => {
      render(tree(session([actor]), [path + '/notes']))
      await screen.findByText(actor === target ? 'Feature ' + actor : 'Workspace ' + actor)
      if (actor !== target) expect(screen.queryByText('Feature ' + target)).toBeNull()
    })
  }

  it.each(workspaces)('redirects signed-out users away from %s features', async (_role, path) => {
    render(tree(session(null), [path + '/notes']))
    await screen.findByText('Guest login')
    expect(screen.queryByText(/Feature/)).toBeNull()
  })

  it('keeps API-assigned multiple roles usable', async () => {
    render(tree(session(['STUDENT', 'TUTOR']), ['/tutors/notes']))
    await screen.findByText('Feature TUTOR')
  })

  it('does not treat administrator as a wildcard role', async () => {
    render(tree(session(['ADMIN']), ['/students/notes']))
    await screen.findByRole('heading', { name: 'No workspace available' })
    expect(screen.queryByText(/Feature/)).toBeNull()
  })

  it('blocks a previous feature page after logout and browser Back', async () => {
    const view = render(tree(session(['STUDENT']), ['/login', '/students/notes']))
    await screen.findByText('Feature STUDENT')
    view.rerender(tree(session(null), ['/login', '/students/notes']))
    await screen.findByText('Guest login')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByText('Guest login')
    expect(screen.queryByText('Feature STUDENT')).toBeNull()
  })
})

describe('guest-only authentication routes', () => {
  it.each(['/login', '/register', '/email-verification', '/forgot-password', '/password-reset', '/onboarding', '/auth/login'])(
    'redirects signed-in users away from %s', async (path) => {
      render(tree(session(['STUDENT']), [path]))
      await screen.findByText('Workspace STUDENT')
      expect(screen.queryByText(/Guest/)).toBeNull()
    },
  )

  it('blocks navigation back to login while authenticated', async () => {
    render(tree(session(['ESL']), ['/login', '/esl']))
    await screen.findByText('Workspace ESL')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByText('Workspace ESL')
    fireEvent.click(screen.getByRole('link', { name: 'Login link' }))
    await screen.findByText('Workspace ESL')
    expect(screen.queryByText('Guest login')).toBeNull()
  })

  it('keeps OAuth completion reachable for authenticated account linking', async () => {
    render(tree(session(['TUTOR']), ['/oauth/google/callback']))
    await screen.findByText('OAuth callback')
  })

  it('does not mount forms or features until the API session check finishes', () => {
    render(tree({ ...session(null), status: 'loading' }, ['/login']))
    expect(screen.getByRole('status').textContent).toContain('Checking')
    expect(screen.queryByText('Guest login')).toBeNull()
  })

  it('fails closed on session-check errors and offers retry', async () => {
    const value = { ...session(null), status: 'unavailable' as const, error: 'API unavailable' }
    render(tree(value, ['/students/notes']))
    expect(screen.queryByText(/Feature/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(value.refreshCurrentUser).toHaveBeenCalledOnce())
  })
})
