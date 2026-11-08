import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Link, MemoryRouter, Outlet, Route, Routes } from 'react-router'
import { getCurrentUser, loginAccount, logoutAccount, refreshSession } from '@/services/api/auth.service'
import { AuthSessionContext, type AuthSessionContextValue, type SessionStatus } from './auth-session-context'
import { AuthSessionProvider } from './auth-session-provider'
import { RequireAuth } from './require-auth'
import { RequireGuest } from './require-guest'
import { RequireRole } from './require-role'

vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: false }))
vi.mock('@/services/api/auth.service', () => ({
  getCurrentUser: vi.fn(), loginAccount: vi.fn(), logoutAccount: vi.fn(), refreshSession: vi.fn(),
}))
afterEach(() => { cleanup(); vi.clearAllMocks() })

const workspaces = [
  ['STUDENT', '/students'], ['EDUCATOR', '/educators'], ['TUTOR', '/tutors'], ['ESL', '/esl'],
] as const
const authPages = ['login', 'register', 'email-verification', 'forgot-password', 'password-reset', 'onboarding']

function pages() {
  return <Routes>
    <Route element={<RequireGuest />}>
      {authPages.map((path) => <Route key={path} path={'/' + path} element={<p>Preview {path}</p>} />)}
    </Route>
    <Route element={<RequireAuth><Outlet /></RequireAuth>}>
      {workspaces.map(([role, path]) =>
        <Route key={role} path={path} element={<RequireRole role={role}><Outlet /></RequireRole>}>
          <Route index element={<p>Preview {role}</p>} />
          <Route path="notes" element={<p>Preview {role} feature</p>} />
        </Route>)}
    </Route>
  </Routes>
}

function preview(path: string, status: SessionStatus = 'anonymous') {
  const value: AuthSessionContextValue = {
    user: status === 'authenticated' ? {
      id: 'preview-user', name: 'Preview', email: 'preview@example.test', roles: ['STUDENT'],
      status: 'ACTIVE', emailVerifiedAt: '2026-10-29T00:00:00Z', createdAt: '2026-10-29T00:00:00Z',
    } : null,
    status, error: status === 'unavailable' ? 'API unavailable' : null,
    signIn: vi.fn(), signOut: vi.fn(), refreshCurrentUser: vi.fn(),
  }
  return <MemoryRouter initialEntries={[path]}>
    <AuthSessionContext.Provider value={value}>{pages()}</AuthSessionContext.Provider>
  </MemoryRouter>
}

describe('API-disabled development route access', () => {
  it.each(workspaces)('opens the %s workspace without signing in', async (role, path) => {
    render(preview(path))
    await screen.findByText('Preview ' + role)
  })

  it.each(workspaces)('opens nested %s features without a matching role', async (role, path) => {
    render(preview(path + '/notes', 'authenticated'))
    await screen.findByText('Preview ' + role + ' feature')
  })

  it.each(authPages)('keeps /%s reachable even with a cached signed-in session', async (path) => {
    render(preview('/' + path, 'authenticated'))
    await screen.findByText('Preview ' + path)
  })

  it.each(['loading', 'unavailable'] as const)('ignores stale %s session gates while previewing', async (status) => {
    render(preview('/tutors/notes', status))
    await screen.findByText('Preview TUTOR feature')
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  })

  it('allows navigation between workspaces with the real preview session provider and no API calls', async () => {
    render(<MemoryRouter initialEntries={['/students']}>
      <AuthSessionProvider>
        <Link to="/educators/notes">Educator preview</Link>
        {pages()}
      </AuthSessionProvider>
    </MemoryRouter>)
    await screen.findByText('Preview STUDENT')
    fireEvent.click(screen.getByRole('link', { name: 'Educator preview' }))
    await screen.findByText('Preview EDUCATOR feature')
    fireEvent(window, new Event('focus'))
    expect(getCurrentUser).not.toHaveBeenCalled()
    expect(refreshSession).not.toHaveBeenCalled()
    expect(loginAccount).not.toHaveBeenCalled()
    expect(logoutAccount).not.toHaveBeenCalled()
  })
})
