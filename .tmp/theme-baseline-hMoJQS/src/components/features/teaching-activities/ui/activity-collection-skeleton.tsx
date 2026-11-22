import { LoadingSkeleton, SkeletonLines } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function ActivityCollectionSkeleton({ view }: { view: 'grid' | 'list' }) {
  return <LoadingSkeleton label="Loading teaching groups…"><div className="space-y-3"><SkeletonLines />
    <div className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'divide-y overflow-hidden rounded-xl border'}>{[0, 1, 2].map(i => <div key={i} className={view === 'grid' ? 'space-y-4 rounded-xl border bg-card p-4' : 'flex flex-wrap items-center gap-3 bg-card p-4'}><Skeleton className="size-9 shrink-0 rounded-xl" /><SkeletonLines /><Skeleton className={view === 'grid' ? 'h-12 w-full' : 'h-4 w-28'} /><Skeleton className="h-4 w-24" /></div>)}</div>
  </div></LoadingSkeleton>
}
