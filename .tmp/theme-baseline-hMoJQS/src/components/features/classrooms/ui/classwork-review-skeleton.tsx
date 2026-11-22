import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function ClassworkReviewSkeleton({ answers = false }: { answers?: boolean }) {
  return <LoadingSkeleton label={answers ? 'Loading submitted answers and grade…' : 'Loading student work…'}><div className="space-y-5"><Skeleton className="h-3 w-32" />
    {answers ? <><div className="space-y-3 rounded-xl border p-4"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-20" /><Skeleton className="h-20 w-full" /></div><div className="space-y-3 rounded-xl border p-4"><Skeleton className="h-4 w-36" /><Skeleton className="h-24 w-full" /><Skeleton className="h-9 w-28" /></div></>
      : <div className="divide-y divide-border">{[0, 1, 2].map(i => <div key={i} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-3 w-3/5" /></div><Skeleton className="h-8 w-32" /></div>)}</div>}
  </div></LoadingSkeleton>
}
