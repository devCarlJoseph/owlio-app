import { Link } from 'react-router'
import { OwlioPageState } from '@/components/common/owlio-page-state'

export function NotFoundPage() {
  return (
    <OwlioPageState
      tone="error"
      code={404}
      title="This page flew out of reach"
      description="We couldn’t find this page. It may have moved, or the link may be incorrect."
      action={<Link to="/" className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">Go home</Link>}
    />
  )
}
