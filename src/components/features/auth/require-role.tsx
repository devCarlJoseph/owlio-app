import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { getWorkspacePath, type WorkspaceRole } from '@/lib/workspace-path'
import { useAuthSession } from './auth-session-context'
import { RequireAuth } from './require-auth'

export function RequireRole({ role, children }: { role: WorkspaceRole; children: ReactNode }) {
  const { user } = useAuthSession()
  return (
    <RequireAuth>
      {user?.roles.includes(role)
        ? children
        : <Navigate to={getWorkspacePath(user?.roles ?? [])} replace />}
    </RequireAuth>
  )
}
