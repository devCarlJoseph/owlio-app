import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

/** One announcement per loading region; decorative shapes never enter the focus order. */
export function LoadingSkeleton({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <div role="status" aria-label={label} className={cn('min-w-0', className)}>
    <span className="sr-only">{label}</span>
    <div aria-hidden="true">{children}</div>
  </div>
}

export function SkeletonLines() {
  return <div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-3/5" /><Skeleton className="h-3 w-2/5" /></div>
}

export function RecordListSkeleton({ label = 'Loading your records…', grid = false }: { label?: string; grid?: boolean }) {
  return <LoadingSkeleton label={label}><div className={grid ? 'grid gap-4 sm:grid-cols-2' : 'space-y-3'}>
    {[0, 1, 2].map(i => <div key={i} className="space-y-3 rounded-2xl border bg-card p-5"><SkeletonLines /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-9 w-28" /></div>)}
  </div></LoadingSkeleton>
}

export function PeopleRowsSkeleton({ label, count = 3, compact = false }: { label: string; count?: number; compact?: boolean }) {
  return <LoadingSkeleton label={label}><div className="space-y-3">{Array.from({ length: count }, (_, i) => <div key={i} className={compact ? 'px-3 py-2' : 'flex items-center gap-3'}>{!compact && <Skeleton className="size-8 shrink-0 rounded-full" />}<Skeleton className="h-4 w-32 max-w-full" /></div>)}</div></LoadingSkeleton>
}
