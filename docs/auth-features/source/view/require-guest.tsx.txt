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
