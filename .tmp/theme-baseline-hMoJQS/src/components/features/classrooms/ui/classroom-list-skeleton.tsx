import { LoadingSkeleton, SkeletonLines } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function ClassroomListSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  return <LoadingSkeleton label="Loading classes…" className="space-y-5"><div className="space-y-5">
    <Skeleton className="h-5 w-40" />
    {view === 'grid' ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="space-y-5 rounded-2xl border bg-card p-5">
      <div className="flex items-start gap-4"><Skeleton className="size-20 shrink-0 rounded-xl sm:size-24" /><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-full" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-3 w-3/5" /></div></div>
      <div className="flex gap-2.5"><Skeleton className="h-10 flex-1 rounded-xl" /><Skeleton className="size-10" /></div>
    </div>)}</div> : <div className="divide-y overflow-hidden rounded-xl border bg-card">
      <div className="hidden gap-4 px-4 py-2 md:grid md:grid-cols-[2.4fr_1.2fr_1.2fr_8rem_auto]">{[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-full max-w-20" />)}</div>
      {[0, 1, 2, 3, 4].map(i => <div key={i} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_8rem_auto] md:items-center md:gap-4"><div className="flex items-center gap-3"><Skeleton className="size-12 shrink-0 rounded-lg" /><SkeletonLines /></div><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-9 w-28" /></div>)}
    </div>}
  </div></LoadingSkeleton>
}
