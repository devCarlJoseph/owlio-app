import { Navigate, Outlet, useLocation } from 'react-router'
import { getLoginDestination } from '@/lib/workspace-path'
import { useAuthSession } from '../context/auth-session-context'
import { SessionBoundary } from './session-boundary'

export function RequireGuest() {
  const { status, user } = useAuthSession()
  const location = useLocation()
  const state = location.state as { from?: unknown; connectGoogle?: boolean } | null

  return (
    <SessionBoundary>
      {status === 'authenticated' && user
        ? <Navigate to={getLoginDestination(user.roles, state?.from, state?.connectGoogle === true)} replace />
        : <Outlet />}
    </SessionBoundary>
  )
}
