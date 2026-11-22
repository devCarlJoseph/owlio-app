import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Keep placeholder contrast theme-aware, with motion disabled when requested.
function Block({ className = '' }: { className?: string }) {
  return <Skeleton className={`bg-foreground/8 motion-reduce:animate-none ${className}`} />
}

function Loading({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <div role="status" aria-label={label} className={`min-w-0 ${className}`}>
    <span className="sr-only">{label}</span>
    <div aria-hidden="true">{children}</div>
  </div>
}

function Lines() {
  return <div className="space-y-2"><Block className="h-3 w-full" /><Block className="h-3 w-4/5" /><Block className="h-3 w-3/5" /></div>
}

export function ClassroomMembersSkeleton() {
  return <Loading label="Loading members…"><div className="divide-y divide-border">{Array.from({ length: 5 }, (_, i) => <div key={i} className="flex items-center gap-3 py-3 first:pt-0">
    <Block className="size-9 shrink-0 rounded-full" /><div className="min-w-0 flex-1 space-y-2"><Block className="h-4 w-2/5 max-w-44" /><Block className="h-3 w-20" /></div>
  </div>)}</div></Loading>
}

export function ClassroomFeedSkeleton() {
  return <Loading label="Loading class discussion…"><div className="divide-y divide-border/60">{[0, 1].map(i => <div key={i} className="space-y-5 py-6 first:pt-0">
    <div className="flex items-center gap-3"><Block className="size-9 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Block className="h-4 w-32" /><Block className="h-3 w-20" /></div></div>
    <Lines /><div className="flex gap-3"><Block className="h-7 w-16 rounded-full" /><Block className="h-7 w-24 rounded-full" /></div>
  </div>)}</div></Loading>
}

export function ClassroomClassworkSkeleton() {
  return <Loading label="Loading classwork…"><div className="divide-y divide-border">{[0, 1, 2].map(i => <div key={i} className="flex items-center gap-4 px-5 py-5 sm:px-7">
    <Block className="size-10 shrink-0 rounded-xl" /><div className="min-w-0 flex-1 space-y-3"><Block className="h-4 w-3/5" /><div className="flex gap-2"><Block className="h-5 w-16" /><Block className="h-5 w-20" /></div><Block className="h-3 w-2/5" /></div><Block className="size-4 shrink-0" />
  </div>)}</div></Loading>
}

export function ClassworkProgressSkeleton() {
  return <Loading label="Loading deadlines…" className="mt-5"><div className="space-y-5">{[0, 1, 2].map(i => <div key={i} className="flex gap-2.5"><Block className="size-5 shrink-0 rounded-full" /><div className="min-w-0 flex-1 space-y-2"><Block className="h-3 w-4/5" /><Block className="h-3 w-full" /><Block className="h-3 w-2/3" /><Block className="h-6 w-24 rounded-lg" /></div></div>)}</div></Loading>
}

export function ClassroomScheduleSkeleton({ view = 'calendar', dayCount = 35 }: { view?: 'calendar' | 'list'; dayCount?: number }) {
  return <Loading label="Loading class schedule…">
    {view === 'calendar' ? <div className="overflow-x-auto px-3 pb-3 sm:px-4 sm:pb-4"><div className="min-w-[630px] overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-7 border-b border-border">{Array.from({ length: 7 }, (_, i) => <div key={i} className="flex justify-center py-3"><Block className="h-3 w-12" /></div>)}</div>
      <div className="grid grid-cols-7">{Array.from({ length: dayCount }, (_, i) => <div key={i} className={`min-h-28 border-border p-1.5 sm:min-h-32 ${i % 7 !== 6 ? 'border-r' : ''} ${i < dayCount - 7 ? 'border-b' : ''}`}><Block className="mb-2 size-6 rounded-full" />{i % 5 === 2 && <Block className="h-12 w-full" />}</div>)}</div>
    </div></div> : <div className="divide-y divide-border px-4 sm:px-5">{[0, 1, 2].map(i => <div key={i} className="flex items-center gap-4 py-5"><Block className="h-16 w-14 shrink-0 rounded-lg" /><div className="min-w-0 flex-1 space-y-2"><Block className="h-4 w-3/5" /><Block className="h-3 w-4/5" /><Block className="h-3 w-16" /></div></div>)}</div>}
  </Loading>
}

export function ClassroomChatSkeleton() {
  return <Loading label="Loading classroom messages…" className="w-full py-4"><div className="space-y-6">{[0, 1, 2, 3].map(i => <div key={i} className={`flex items-end gap-2 ${i % 2 ? 'flex-row-reverse' : ''}`}>
    <Block className="size-8 shrink-0 rounded-full" /><div className="w-3/4 max-w-sm space-y-2"><Block className="h-3 w-24" /><Block className={`w-full rounded-2xl ${i % 2 ? 'h-16' : 'h-24'}`} /><Block className="h-2 w-12" /></div>
  </div>)}</div></Loading>
}

export function ClassworkDetailSkeleton() {
  return <Loading label="Loading classwork…" className="rounded-xl border border-border bg-card p-5 sm:p-6"><div className="space-y-6"><Block className="h-7 w-3/5" /><div className="flex gap-2"><Block className="h-5 w-16" /><Block className="h-5 w-24" /></div><Lines /><div className="space-y-3 border-t border-border pt-5"><Block className="h-5 w-2/5" /><Block className="h-28 w-full rounded-lg" /></div></div></Loading>
}

export function ClassroomDetailSkeleton({ tab }: { tab: string }) {
  const wide = ['feed', 'classwork', 'schedule', 'chat'].includes(tab)
  return <div className="mx-auto min-w-0 max-w-[82rem] space-y-5 pb-4">
    <Loading label="Loading classroom…"><Block className="h-4 w-36" />{tab !== 'chat' && <div className="mt-5 min-h-52 space-y-4 rounded-xl border border-border bg-card p-5 sm:min-h-60 sm:p-7 lg:min-h-64 lg:p-8"><Block className="h-3 w-28" /><Block className="h-8 w-2/3 max-w-96" /><Block className="h-3 w-44" /><div className="flex items-center gap-3"><Block className="size-8 rounded-full" /><Block className="h-4 w-28" /></div><Block className="h-9 w-36" /></div>}</Loading>
    <div className="grid min-w-0 gap-5 lg:grid-cols-[11rem_minmax(0,1fr)] xl:grid-cols-[12rem_minmax(0,1fr)]">
      <div aria-hidden="true" className="flex gap-2 overflow-hidden lg:flex-col">{Array.from({ length: 8 }, (_, i) => <Block key={i} className="h-10 w-28 shrink-0 lg:w-full" />)}</div>
      <div className={wide ? 'min-w-0' : 'grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_15rem]'}>
        {tab === 'chat' ? <div className="rounded-xl border border-border bg-card p-5"><ClassroomChatSkeleton /></div>
          : tab === 'schedule' ? <div className="rounded-xl border border-border bg-card pt-5"><ClassroomScheduleSkeleton /></div>
          : tab === 'classwork' ? <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]"><div className="rounded-2xl border border-border bg-card"><ClassroomClassworkSkeleton /></div><div className="rounded-2xl border border-border bg-card p-4"><ClassworkProgressSkeleton /></div></div>
          : tab === 'feed' ? <div className="rounded-xl border border-border bg-card p-5 sm:p-7"><ClassroomFeedSkeleton /></div>
          : tab === 'people' ? <div className="rounded-xl border border-border bg-card p-5 sm:p-6"><ClassroomMembersSkeleton /></div>
          : <Loading label="Loading classroom information…" className="rounded-xl border border-border bg-card p-5 sm:p-6"><div className="space-y-5"><Block className="h-4 w-40" /><Lines /><Block className="h-24 w-full rounded-lg" /></div></Loading>}
        {!wide && <Loading label="Loading class details…" className="rounded-xl border border-border bg-card p-4"><div className="space-y-5"><Block className="h-3 w-24" /><Lines /><Block className="h-8 w-full" /></div></Loading>}
      </div>
    </div>
  </div>
}
