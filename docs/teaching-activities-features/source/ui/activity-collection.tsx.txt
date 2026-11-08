import { ArrowUpRight, CalendarDays, ChevronRight, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router'
import { activityIcon, formatActivityDate, pendingResponses, type ActivityEntry, type TeachingRole } from './activity-workspace-model'

export function ActivityCollection({ entries, view, role, onOpen }: { entries: ActivityEntry[]; view: 'grid' | 'list'; role: TeachingRole; onOpen: (entry: ActivityEntry) => void }) {
  const groups = [...new Map(entries.map(entry => [entry.classroom.id, entry.classroom])).values()]
  return <div className="space-y-6">
    {groups.map(group => <section key={group.id} aria-label={group.name} className="space-y-3">
      <div className="flex items-center justify-between gap-3"><div className="min-w-0"><Link to={`/${role}/classrooms/${encodeURIComponent(group.id)}?tab=classwork`} className="inline-flex max-w-full items-center gap-2 rounded text-sm font-semibold outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"><span className="truncate">{group.name}</span><ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" /></Link><p className="mt-1 text-[11px] text-muted-foreground">{group.subject} · Preview group</p></div><span className="shrink-0 text-[11px] text-muted-foreground">{entries.filter(entry => entry.classroom.id === group.id).length} activities</span></div>
      <ul className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'divide-y divide-border overflow-hidden rounded-xl border border-border'}>
        {entries.filter(entry => entry.classroom.id === group.id).map(entry => {
          const { activity } = entry
          const Icon = activityIcon(activity.type)
          const pending = pendingResponses(activity)
          return <li key={entry.key}><button type="button" data-activity-open={entry.key} onClick={() => onOpen(entry)} aria-label={`Open activity ${activity.title}`} className={`group w-full text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${view === 'grid' ? 'flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xs hover:border-brand/40' : 'flex flex-wrap items-center gap-3 bg-card p-4 hover:bg-muted/40 focus-visible:ring-inset'}`}>
            <div className={`flex ${view === 'grid' ? 'w-full items-start justify-between' : 'items-center'}`}><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground"><Icon aria-hidden="true" className="size-4" /></span>{view === 'grid' && <span className={`rounded-md border px-2 py-1 text-[10px] ${activity.status === 'Draft' ? 'border-border bg-muted text-muted-foreground' : 'border-brand/20 bg-brand-soft text-brand-soft-foreground'}`}>{activity.status}</span>}</div>
            <div className="min-w-0 flex-1"><p className="text-[10px] font-medium text-muted-foreground">{activity.type}</p><h4 className="mt-1 break-words text-sm font-semibold leading-5 group-hover:text-brand">{activity.title}</h4>{view === 'grid' && <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-muted-foreground">{activity.instructions}</p>}</div>
            {view === 'list' && <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground">{activity.status}</span>}
            <div className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[10px] text-muted-foreground ${view === 'grid' ? 'mt-auto w-full border-t border-border pt-3' : ''}`}><span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-3" />{formatActivityDate(activity.dueDate)}</span><span className={`inline-flex items-center gap-1.5 ${pending ? 'font-medium text-brand-soft-foreground' : ''}`}><MessageSquareText aria-hidden="true" className="size-3" />{pending ? `${pending} to review` : `${activity.submissions.length} responses`}</span></div>{view === 'list' && <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />}
          </button></li>
        })}
      </ul>
    </section>)}
  </div>
}
