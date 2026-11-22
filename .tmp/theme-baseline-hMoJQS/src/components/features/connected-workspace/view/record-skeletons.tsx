import { LoadingSkeleton, RecordListSkeleton } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function PersonalRecordsSkeleton({ kind }: { kind: 'subjects' | 'tasks' | 'notes' }) {
  return <div className="space-y-5">
    <LoadingSkeleton label="Loading editor…" className="rounded-2xl border bg-card p-5"><div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: kind === 'notes' ? 3 : 2 }, (_, i) => <div key={i} className="space-y-2"><Skeleton className="h-3.5 w-24" /><Skeleton className={kind === 'notes' && i === 2 ? 'h-40 w-full' : kind === 'subjects' && i === 1 ? 'h-16 w-full' : 'h-10 w-full'} /></div>)}
      <Skeleton className="h-9 w-28" />
    </div></LoadingSkeleton>
    <LoadingSkeleton label="Loading record controls…"><Skeleton className="h-9 w-32" /></LoadingSkeleton>
    <RecordListSkeleton grid={kind !== 'tasks'} />
  </div>
}

export function AccountNotificationsSkeleton() {
  return <LoadingSkeleton label="Loading notifications…"><div className="space-y-3"><Skeleton className="mb-5 h-9 w-24" />{[0, 1, 2].map(i => <div key={i} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-5 w-3/5" /><Skeleton className="h-4 w-2/5" /></div><Skeleton className="h-9 w-28" /></div>)}</div></LoadingSkeleton>
}
