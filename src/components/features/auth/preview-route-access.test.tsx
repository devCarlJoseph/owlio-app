import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router'
import { AuthSessionContext, type AuthSessionContextValue, type SessionStatus } from './auth-session-context'
import { RequireAuth } from './require-auth'
import { RequireGuest } from './require-guest'
import { RequireRole } from './require-role'

// A stale preview flag must never restore the removed authorization bypass.
vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: false }))
afterEach(cleanup)
const workspaces = [['STUDENT', '/students'], ['EDUCATOR', '/educators'], ['TUTOR', '/tutors'], ['ESL', '/esl']] as const
function tree(path: string, status: SessionStatus = 'anonymous') {
  const value: AuthSessionContextValue = { user: status === 'authenticated' ? { id: 'test-user', name: 'Test', email: 'test@example.test', roles: ['STUDENT'], status: 'ACTIVE', emailVerifiedAt: '2026-11-14T00:00:00Z', createdAt: '2026-11-14T00:00:00Z' } : null,
    status, error: status === 'unavailable' ? 'Service unavailable' : null, signIn: vi.fn(), signOut: vi.fn(), refreshCurrentUser: vi.fn() }
  return <MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={value}><Routes>
    <Route element={<RequireGuest />}><Route path="/login" element={<p>Sign in</p>} /></Route>
    <Route element={<RequireAuth><Outlet /></RequireAuth>}>{workspaces.map(([role, href]) => <Route key={role} path={href} element={<RequireRole role={role}><p>Workspace {role}</p></RequireRole>} />)}</Route>
  </Routes></AuthSessionContext.Provider></MemoryRouter>
}
describe('preview access is removed', () => {
  it.each(workspaces)('requires a session for %s even with a stale preview flag', async (_role, path) => {
    render(tree(path)); expect(await screen.findByText('Sign in')).toBeTruthy(); expect(screen.queryByText(/Workspace/)).toBeNull()
  })
  it.each(workspaces.slice(1))('denies an unassigned %s role', async (_role, path) => {
    render(tree(path, 'authenticated')); expect(await screen.findByText('Workspace STUDENT')).toBeTruthy()
  })
  it('keeps a session outage closed', () => {
    render(tree('/students', 'unavailable')); expect(screen.getByText('Service unavailable')).toBeTruthy(); expect(screen.queryByText(/Workspace/)).toBeNull()
  })
  it('waits for the session check', () => {
    render(tree('/students', 'loading')); expect(screen.getByRole('status').textContent).toContain('Checking'); expect(screen.queryByText(/Workspace/)).toBeNull()
  })
  it('redirects authenticated users away from guest pages', async () => {
    render(tree('/login', 'authenticated')); expect(await screen.findByText('Workspace STUDENT')).toBeTruthy()
  })
})
