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
        description={<><p>We couldn’t connect to your Owlio session. Please try again.</p>{error && <p className="mt-2 text-xs">{error}</p>}</>}
        action={<Button type="button" className="h-10 rounded-lg bg-brand px-5 text-brand-foreground hover:bg-brand/90 focus-visible:ring-brand/50" onClick={() => void refreshCurrentUser()}><RefreshCw aria-hidden="true" />Try again</Button>}
      />
    )
  }
  return children
}
