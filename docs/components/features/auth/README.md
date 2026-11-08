# Auth component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(auth): add organized auth source copies`

Proposed paths only; no files under `src/components/features/auth/` have been moved. Keep `auth/` as the owner, with smaller folders **inside** existing `login/`, `register/`, `shared/`, etc. See [folder rules](../../../sops/component-decomposition.md).

| Target relative to `auth/` | Current files |
| --- | --- |
| `context/` | `auth-session-context.ts`, `auth-session-provider.tsx`, `auth-session-provider.test.tsx` |
| `view/` | `no-workspace-view.tsx`, `require-auth.tsx`, `require-guest.tsx`, `require-role.tsx`, `session-boundary.tsx`, `preview-route-access.test.tsx`, `route-guards.test.tsx` |
| `account-security/view/` | `account-security-view.tsx` |
| `email-verification/forms/` | `email-verification.schema.ts`, `email-verification.schema.test.ts`, `resend-verification-form.tsx`, `verification-code-form.tsx` |
| `email-verification/view/` | `email-verification-view.tsx` |
| `forgot-password/forms/`, `view/` | `forgot-password-form.tsx`, `forgot-password.schema.ts` -> forms; `forgot-password-view.tsx` -> view |
| `google/view/` | `google-oauth-callback-view.tsx`, `google-oauth-callback-view.test.tsx` |
| `login/forms/`, `view/` | `login-form.tsx`, `login.schema.ts` -> forms; `login-view.tsx` -> view |
| `password-reset/forms/`, `view/` | `password-reset-form.tsx`, `password-reset.schema.ts` -> forms; `password-reset-view.tsx` -> view |
| `register/forms/`, `view/` | `account-type-selector.tsx`, `register-form.tsx`, `register.schema.ts` -> forms; `register-view.tsx` -> view |
| `shared/contents/` | `auth-showcase-content.ts` |
| `shared/utils/` | `auth-input-styles.ts`, `development-action-path.ts`, `password-rules.ts` |
| `shared/ui/` | `auth-brand-panel.tsx`, `auth-feedback.tsx`, `auth-form-actions.tsx`, `auth-layout.tsx`, `auth-password-input.tsx`, `auth-preview-controls.tsx`, `auth-showcase-layout.tsx`, `auth-showcase.tsx`, `auth-split-layout.tsx`, `auth-status-page.tsx`, `google-auth-button.tsx`, `google-auth-button.test.tsx`, `owlio-owl.tsx`, `password-field.tsx`, `password-guidance.tsx`, `session-expired-state.tsx` |

Migrate leaf forms and schemas before session context. Preserve the provider mounted in `src/main.tsx`, cookie/CSRF flow, redirect safety, account-switch cleanup, and token handling. A route guard is **not** a reusable form or a global UI primitive. Run the affected auth route/guard tests and a build after each slice. See [auth access](../../../AUTH_ROUTE_ACCESS.md).

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/auth/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### Nested feature guides

- [`account-security/`](account-security/README.md)
- [`email-verification/`](email-verification/README.md)
- [`forgot-password/`](forgot-password/README.md)
- [`google/`](google/README.md)
- [`login/`](login/README.md)
- [`password-reset/`](password-reset/README.md)
- [`register/`](register/README.md)
- [`shared/`](shared/README.md)

### `auth-session-context.ts`

Current file: `src/components/features/auth/auth-session-context.ts`

```ts
import { createContext, useContext } from 'react'
import type { AuthSession, AuthUser, LoginRequest } from '@/services/api/api.types'

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'unavailable'

export type AuthSessionContextValue = {
  user: AuthUser | null
  status: SessionStatus
  error: string | null
  signIn: (credentials: LoginRequest) => Promise<AuthSession>
  signOut: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

export function useAuthSession() {
  const value = useContext(AuthSessionContext)
  if (!value) throw new Error('useAuthSession must be used within AuthSessionProvider.')
  return value
}
```

### `auth-session-provider.test.tsx`

Current file: `src/components/features/auth/auth-session-provider.test.tsx`

```tsx
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
```

### `auth-session-provider.tsx`

Current file: `src/components/features/auth/auth-session-provider.tsx`

```tsx
import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import api from '@/lib/axios'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { AuthUser, LoginRequest } from '@/services/api/api.types'
import { getCurrentUser, loginAccount, logoutAccount, refreshSession } from '@/services/api/auth.service'
import { AuthSessionContext, type AuthSessionContextValue, type SessionStatus } from './auth-session-context'

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<SessionStatus>(API_INTEGRATION_ENABLED ? 'loading' : 'anonymous')
  const [error, setError] = useState<string | null>(null)
  const operationVersion = useRef(0)
  const changingSession = useRef(false)
  const pendingSession = useRef<Promise<AuthUser | null> | null>(null)
  const { pathname } = useLocation()

  const loadCurrentUser = useCallback((): Promise<AuthUser | null> => {
    if (!pendingSession.current) {
      const request = (async () => {
        try {
          return await getCurrentUser()
        } catch (requestError) {
          if (!(axios.isAxiosError(requestError) && requestError.response?.status === 401)) throw requestError
          try {
            return (await refreshSession()).user
          } catch (refreshError) {
            if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) return null
            throw refreshError
          }
        }
      })()
      const trackedRequest = request.finally(() => {
        if (pendingSession.current === trackedRequest) pendingSession.current = null
      })
      pendingSession.current = trackedRequest
    }
    return pendingSession.current
  }, [])

  const checkCurrentUser = useCallback(async (background = false) => {
    if (!API_INTEGRATION_ENABLED || changingSession.current) return
    const operation = ++operationVersion.current
    setStatus((current) => background && current === 'authenticated' ? current : 'loading')
    setError(null)
    try {
      const currentUser = await loadCurrentUser()
      if (operation !== operationVersion.current) return
      setUser(currentUser)
      setStatus(currentUser ? 'authenticated' : 'anonymous')
    } catch (requestError) {
      if (operation !== operationVersion.current) return
      setUser(null)
      setStatus('unavailable')
      setError(getApiErrorMessage(requestError, 'Could not check your Owlio session.'))
    }
  }, [loadCurrentUser])

  const refreshCurrentUser = useCallback(() => checkCurrentUser(), [checkCurrentUser])

  const invalidatePendingChecks = useCallback(() => { ++operationVersion.current }, [])

  useEffect(() => {
    void refreshCurrentUser()
    return invalidatePendingChecks
  }, [refreshCurrentUser, invalidatePendingChecks])

  useEffect(() => {
    if (!API_INTEGRATION_ENABLED) return
    const recheck = () => { void checkCurrentUser(true) }
    const onVisible = () => { if (document.visibilityState === 'visible') recheck() }
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void refreshCurrentUser() }
    window.addEventListener('focus', recheck)
    window.addEventListener('pageshow', onPageShow)
    document.addEventListener('visibilitychange', onVisible)
    const interceptor = api.interceptors.response.use(undefined, (requestError: unknown) => {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401 &&
          !requestError.config?.url?.startsWith('/api/v1/auth/')) void refreshCurrentUser()
      return Promise.reject(requestError)
    })
    return () => {
      window.removeEventListener('focus', recheck)
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('visibilitychange', onVisible)
      api.interceptors.response.eject(interceptor)
    }
  }, [refreshCurrentUser, checkCurrentUser])

  useEffect(() => {
    if (/^\/(students|educators|tutors|esl)(\/|$)/.test(pathname)) {
      void checkCurrentUser(true)
    }
  }, [pathname, checkCurrentUser])

  const signIn = useCallback(async (credentials: LoginRequest) => {
    if (!API_INTEGRATION_ENABLED) throw new Error('Sign-in is unavailable while the UI is in preview mode.')
    const operation = ++operationVersion.current
    changingSession.current = true
    pendingSession.current = null
    try {
      const session = await loginAccount(credentials)
      if (operation === operationVersion.current) {
        setUser(session.user)
        setStatus('authenticated')
        setError(null)
      }
      return session
    } finally {
      changingSession.current = false
    }
  }, [])

  const signOut = useCallback(async () => {
    const operation = ++operationVersion.current
    changingSession.current = true
    pendingSession.current = null
    try {
      if (API_INTEGRATION_ENABLED) await logoutAccount()
      if (operation === operationVersion.current) {
        setUser(null)
        setStatus('anonymous')
        setError(null)
      }
    } finally {
      changingSession.current = false
    }
  }, [])

  const value = useMemo<AuthSessionContextValue>(() => ({
    user, status, error, signIn, signOut, refreshCurrentUser,
  }), [user, status, error, signIn, signOut, refreshCurrentUser])

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
```

### `no-workspace-view.tsx`

Current file: `src/components/features/auth/no-workspace-view.tsx`

```tsx
import { useState } from 'react'
import { Navigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { getWorkspacePath } from '@/lib/workspace-path'
import { getApiErrorMessage } from '@/services/api/api-error'
import { useAuthSession } from './auth-session-context'
import { RequireAuth } from './require-auth'

export function NoWorkspaceView() {
  const { user, signOut } = useAuthSession()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workspace = getWorkspacePath(user?.roles ?? [])

  async function handleSignOut() {
    setPending(true)
    setError(null)
    try {
      await signOut()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not sign out. Please try again.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <RequireAuth>
      {workspace !== '/access-denied' ? <Navigate to={workspace} replace /> : (
        <main className="mx-auto max-w-lg space-y-4 p-8">
          <h1 className="text-2xl font-semibold">No workspace available</h1>
          <p>Your account does not have a role for a learning or teaching workspace. Contact your administrator if you need access.</p>
          {error && <p role="alert">{error}</p>}
          <Button disabled={pending} onClick={() => void handleSignOut()}>{pending ? 'Signing out…' : 'Sign out'}</Button>
        </main>
      )}
    </RequireAuth>
  )
}
```

### `preview-route-access.test.tsx`

Current file: `src/components/features/auth/preview-route-access.test.tsx`

```tsx
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
```

### `require-auth.tsx`

Current file: `src/components/features/auth/require-auth.tsx`

```tsx
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { useAuthSession } from './auth-session-context'
import { SessionBoundary } from './session-boundary'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, user } = useAuthSession()
  const location = useLocation()

  if (!API_INTEGRATION_ENABLED) return children

  return (
    <SessionBoundary>
      {status === 'authenticated' && user
        ? children
        : <Navigate to="/login" state={{ from: location }} replace />}
    </SessionBoundary>
  )
}
```

### `require-guest.tsx`

Current file: `src/components/features/auth/require-guest.tsx`

```tsx
import { Navigate, Outlet, useLocation } from 'react-router'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { getLoginDestination } from '@/lib/workspace-path'
import { useAuthSession } from './auth-session-context'
import { SessionBoundary } from './session-boundary'

export function RequireGuest() {
  const { status, user } = useAuthSession()
  const location = useLocation()
  const from = (location.state as { from?: unknown } | null)?.from

  if (!API_INTEGRATION_ENABLED) return <Outlet />

  return (
    <SessionBoundary>
      {status === 'authenticated' && user
        ? <Navigate to={getLoginDestination(user.roles, from)} replace />
        : <Outlet />}
    </SessionBoundary>
  )
}
```

### `require-role.tsx`

Current file: `src/components/features/auth/require-role.tsx`

```tsx
import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { getWorkspacePath, type WorkspaceRole } from '@/lib/workspace-path'
import { useAuthSession } from './auth-session-context'
import { RequireAuth } from './require-auth'

export function RequireRole({ role, children }: { role: WorkspaceRole; children: ReactNode }) {
  const { user } = useAuthSession()

  if (!API_INTEGRATION_ENABLED) return children
  return (
    <RequireAuth>
      {user?.roles.includes(role)
        ? children
        : <Navigate to={getWorkspacePath(user?.roles ?? [])} replace />}
    </RequireAuth>
  )
}
```

### `route-guards.test.tsx`

Current file: `src/components/features/auth/route-guards.test.tsx`

```tsx
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
```

### `session-boundary.tsx`

Current file: `src/components/features/auth/session-boundary.tsx`

```tsx
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AuthFeedback } from './shared/auth-feedback'
import { useAuthSession } from './auth-session-context'

export function SessionBoundary({ children }: { children: ReactNode }) {
  const { status, error, refreshCurrentUser } = useAuthSession()

  if (status === 'loading') {
    return <div className="p-8 text-sm text-slate-600" role="status">Checking your Owlio session…</div>
  }
  if (status === 'unavailable') {
    return (
      <main className="mx-auto max-w-lg p-6">
        <AuthFeedback title="Could not check your session" tone="error">
          {error || 'Check your connection to the Owlio API and try again.'}
        </AuthFeedback>
        <Button type="button" className="mt-4" onClick={() => void refreshCurrentUser()}>Try again</Button>
      </main>
    )
  }
  return children
}
```

<!-- END GENERATED CURRENT SOURCE -->
