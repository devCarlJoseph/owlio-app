import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function StudySpaceSkeleton({ world = false }: { world?: boolean }) {
  return <LoadingSkeleton label={world ? 'Loading study hall…' : 'Loading study space…'} className={world ? 'h-full p-3 [&>div]:h-full' : 'mx-auto w-full'}>
    <div className={world ? 'flex h-full min-h-[480px] flex-col gap-2' : 'flex h-[calc(100svh-6rem)] min-h-[560px] flex-col gap-2 sm:h-[calc(100svh-7rem)] lg:h-[calc(100svh-8rem)]'}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2"><Skeleton className="h-6 w-40" /><div className="flex gap-2">{[0, 1, 2].map(i => <Skeleton key={i} className="size-8" />)}</div></div>
      <Skeleton className="min-h-80 w-full flex-1 rounded-xl" />
      <div className="flex flex-wrap justify-center gap-3 rounded-xl border bg-card p-3">{[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className="size-10 rounded-xl" />)}</div>
    </div>
  </LoadingSkeleton>
}
