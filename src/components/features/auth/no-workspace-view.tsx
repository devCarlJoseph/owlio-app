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
