import { useState } from 'react'
import { Navigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { OwlioPageState } from '@/components/common/owlio-page-state'
import { getWorkspacePath } from '@/lib/workspace-path'
import { getApiErrorMessage } from '@/services/api/api-error'
import { useAuthSession } from '../context/auth-session-context'
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
        <OwlioPageState
          title="No workspace available"
          description={<><p>Your account does not have a role for a learning or teaching workspace. Contact your administrator if you need access.</p>{error && <p className="mt-3 text-destructive" role="alert">{error}</p>}</>}
          action={<Button className="h-11 rounded-xl bg-indigo-600 px-6 text-white hover:bg-indigo-700" disabled={pending} onClick={() => void handleSignOut()}>{pending ? 'Signing out…' : 'Sign out'}</Button>}
        />
      )}
    </RequireAuth>
  )
}
