import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { OwlioLoadingPage } from '@/components/common/owlio-loading-page'
import { OwlioPageState } from '@/components/common/owlio-page-state'
import { useAuthSession } from '../context/auth-session-context'

export function SessionBoundary({ children }: { children: ReactNode }) {
  const { status, error, refreshCurrentUser } = useAuthSession()

  if (status === 'loading') {
    return <OwlioLoadingPage title="Getting your space ready" description="Checking your Owlio session…" />
  }
  if (status === 'unavailable') {
    return (
      <OwlioPageState
        tone="error"
        title="Could not check your session"
        description={<><p>We couldn’t connect to your Owlio session. Please try again.</p><p className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-xs surface-dark:bg-slate-800">{error || 'Check your connection and try again.'}</p></>}
        action={<Button type="button" className="h-11 rounded-xl bg-indigo-600 px-6 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 focus-visible:ring-indigo-500" onClick={() => void refreshCurrentUser()}><RefreshCw aria-hidden="true" />Try again</Button>}
      />
    )
  }
  return children
}
