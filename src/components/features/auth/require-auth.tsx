import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthSession } from './auth-session-context'
import { SessionBoundary } from './session-boundary'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, user } = useAuthSession()
  const location = useLocation()

  return (
    <SessionBoundary>
      {status === 'authenticated' && user
        ? children
        : <Navigate to="/login" state={{ from: location }} replace />}
    </SessionBoundary>
  )
}
