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
