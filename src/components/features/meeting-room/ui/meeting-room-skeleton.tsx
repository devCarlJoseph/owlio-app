import { LoadingSkeleton, SkeletonLines } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function MeetingRoomSkeleton({ hub = false, coaching = false }: { hub?: boolean; coaching?: boolean }) {
  return <LoadingSkeleton label="Loading meeting room…" className="mx-auto w-full max-w-6xl"><div className="space-y-6">
    <SkeletonLines />
    {hub ? <><div className="grid gap-4 lg:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="flex gap-4 rounded-2xl border bg-card p-5"><Skeleton className="size-6 shrink-0" /><div className="min-w-0 flex-1 space-y-3"><Skeleton className="h-5 w-24" /><SkeletonLines /></div></div>)}</div><Skeleton className="h-24 w-full rounded-2xl" /></>
      : <div className={coaching ? 'grid items-center gap-6 rounded-2xl border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:gap-10 lg:p-8' : 'grid items-center gap-8 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,1fr)] lg:gap-12 lg:py-10'}><div className="space-y-3"><Skeleton className="aspect-video w-full rounded-xl" /><div className="flex justify-center gap-3"><Skeleton className="size-10 rounded-full" /><Skeleton className="size-10 rounded-full" /></div></div><div className="mx-auto w-full max-w-sm space-y-4"><Skeleton className="h-3 w-32" /><Skeleton className="h-8 w-4/5" /><SkeletonLines /><Skeleton className="h-3 w-36" /><Skeleton className="h-11 w-full" /><Skeleton className={coaching ? 'h-10 w-full' : 'h-11 w-full rounded-full'} /></div></div>}
  </div></LoadingSkeleton>
}

export function MeetingClassesSkeleton() {
  return <LoadingSkeleton label="Loading your classes…"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="space-y-6 rounded-xl border bg-card p-6"><SkeletonLines /><Skeleton className="h-10 w-32" /><Skeleton className="h-4 w-24" /></div>)}</div></LoadingSkeleton>
}
