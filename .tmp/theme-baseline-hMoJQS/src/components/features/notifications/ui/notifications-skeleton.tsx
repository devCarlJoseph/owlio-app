import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function NotificationsSkeleton() {
  return <LoadingSkeleton label="Loading notifications"><div className="divide-y divide-border">
    {[0, 1, 2, 3].map(i => <div key={i} className="flex items-start gap-3 px-5 py-5"><Skeleton className="size-11 shrink-0 rounded-full" /><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/5" /></div><Skeleton className="mt-2 size-2 shrink-0 rounded-full" /></div>)}
  </div></LoadingSkeleton>
}
