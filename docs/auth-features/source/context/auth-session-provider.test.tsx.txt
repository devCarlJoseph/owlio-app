import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import api from '@/lib/axios'
import type { AuthUser } from '@/services/api/api.types'
import { getCurrentUser, loginAccount, logoutAccount, refreshSession } from '@/services/api/auth.service'
import { AuthSessionProvider } from './auth-session-provider'
import { useAuthSession } from './auth-session-context'
import { RequireAuth } from './require-auth'

vi.mock('@/lib/axios', () => ({
  default: { interceptors: { response: { use: vi.fn(), eject: vi.fn() } } },
}))
vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: true }))
vi.mock('@/services/api/auth.service', () => ({
  getCurrentUser: vi.fn(), refreshSession: vi.fn(), loginAccount: vi.fn(), logoutAccount: vi.fn(),
}))
const user: AuthUser = { id: 'user', name: 'Test user', email: 'test@example.test', roles: ['STUDENT'],
  status: 'ACTIVE', emailVerifiedAt: '2026-10-29T00:00:00Z', createdAt: '2026-10-29T00:00:00Z' }
const unauthorized = { isAxiosError: true, response: { status: 401 } }
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}
function Status() {
  const { status, user: current, signOut, signIn } = useAuthSession()
  return <>
    <p>Session {status}</p><p>{current?.roles.join(',') ?? 'No roles'}</p>
    <button onClick={() => void signOut().catch(() => {})}>Sign out</button>
    <button onClick={() => void signIn({ email: user.email, password: 'test-only-password', rememberMe: false })}>Sign in</button>
    <Link to="/students/notes">Notes</Link>
  </>
}
function app() {
  return <MemoryRouter><AuthSessionProvider><Status /><Routes>
    <Route path="/" element={<p>Public page</p>} />
    <Route path="/students/notes" element={<RequireAuth><p>Private feature</p></RequireAuth>} />
    <Route path="/login" element={<p>Login page</p>} />
  </Routes></AuthSessionProvider></MemoryRouter>
}
beforeEach(() => { vi.resetAllMocks() })
afterEach(cleanup)

describe('API-backed session lifecycle', () => {
  it('restores current roles from /me', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user)
    render(app())
    await screen.findByText('Session authenticated')
    expect(screen.getByText('STUDENT')).toBeTruthy()
    expect(refreshSession).not.toHaveBeenCalled()
  })

  it('recovers an expired access cookie through refresh', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(unauthorized)
    vi.mocked(refreshSession).mockResolvedValue({ user, csrfToken: 'rotated' })
    render(app())
    await screen.findByText('Session authenticated')
    expect(refreshSession).toHaveBeenCalledOnce()
  })

  it('marks an expired/revoked refresh session anonymous', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(unauthorized)
    vi.mocked(refreshSession).mockRejectedValue(unauthorized)
    render(app())
    await screen.findByText('Session anonymous')
  })

  it('does not disguise an API outage as signed-out state or try refresh', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('API unavailable'))
    render(app())
    await screen.findByText('Session unavailable')
    expect(refreshSession).not.toHaveBeenCalled()
  })

  it('clears the frontend session after confirmed logout', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user)
    vi.mocked(logoutAccount).mockResolvedValue({ message: 'Signed out.' })
    render(app())
    await screen.findByText('Session authenticated')
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await screen.findByText('Session anonymous')
    expect(screen.getByText('No roles')).toBeTruthy()
  })

  it('does not claim logout succeeded when the API rejects it', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(user)
    vi.mocked(logoutAccount).mockRejectedValue(new Error('Unavailable'))
    render(app())
    await screen.findByText('Session authenticated')
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(logoutAccount).toHaveBeenCalledOnce())
    expect(screen.getByText('Session authenticated')).toBeTruthy()
  })

  it('rechecks on focus and removes a session revoked in another tab', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(user).mockRejectedValue(unauthorized)
    vi.mocked(refreshSession).mockRejectedValue(unauthorized)
    render(app())
    await screen.findByText('Session authenticated')
    fireEvent(window, new Event('focus'))
    await screen.findByText('Session anonymous')
  })

  it('reloads current API roles when navigating to feature pages', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(user).mockResolvedValue({ ...user, roles: ['TUTOR'] })
    render(app())
    await screen.findByText('STUDENT')
    fireEvent.click(screen.getByRole('link', { name: 'Notes' }))
    await screen.findByText('TUTOR')
  })

  it('does not let a stale session lookup restore a logged-out user', async () => {
    const check = deferred<AuthUser>()
    vi.mocked(getCurrentUser).mockResolvedValueOnce(user).mockReturnValueOnce(check.promise)
    vi.mocked(logoutAccount).mockResolvedValue({ message: 'Signed out.' })
    render(app())
    await screen.findByText('Session authenticated')
    fireEvent(window, new Event('focus'))
    await waitFor(() => expect(getCurrentUser).toHaveBeenCalledTimes(2))
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await screen.findByText('Session anonymous')
    await act(async () => { check.resolve(user); await check.promise })
    expect(screen.getByText('Session anonymous')).toBeTruthy()
  })

  it('does not recheck midway through logout and overwrite the confirmed result', async () => {
    const logout = deferred<{ message: string }>()
    vi.mocked(getCurrentUser).mockResolvedValue(user)
    vi.mocked(logoutAccount).mockReturnValue(logout.promise)
    render(app())
    await screen.findByText('Session authenticated')
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    fireEvent(window, new Event('focus'))
    await act(async () => { logout.resolve({ message: 'Signed out.' }); await logout.promise })
    await screen.findByText('Session anonymous')
    expect(getCurrentUser).toHaveBeenCalledOnce()
  })

  it('revalidates a protected API 401 without replaying its action', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(user).mockRejectedValue(unauthorized)
    vi.mocked(refreshSession).mockRejectedValue(unauthorized)
    render(app())
    await screen.findByText('Session authenticated')
    const handler = vi.mocked(api.interceptors.response.use).mock.calls[0][1]!
    await act(async () => {
      await Promise.resolve(handler({ ...unauthorized, config: { url: '/api/v1/classrooms' } })).catch(() => {})
    })
    await screen.findByText('Session anonymous')
    expect(refreshSession).toHaveBeenCalledOnce()
  })

  it('establishes the user from the confirmed login response', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(unauthorized)
    vi.mocked(refreshSession).mockRejectedValue(unauthorized)
    vi.mocked(loginAccount).mockResolvedValue({ user, csrfToken: 'rotated' })
    render(app())
    await screen.findByText('Session anonymous')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await screen.findByText('Session authenticated')
  })
})
