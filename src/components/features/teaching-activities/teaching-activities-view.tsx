import { useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, ClipboardCheck, FileText, Grid2X2, Info, List, MessageSquareText, Plus, Search, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClassroomPrototype } from '@/components/features/classrooms/classroom-prototype-context'
import { ActivityCollection } from './activity-collection'
import { ActivityComposer } from './activity-composer'
import { ActivityDetails } from './activity-details'
import { activityEntries, activityTypes, filterActivities, ownedPreviewClasses, pendingResponses, workspaceCopy, type ActivityFilter, type DueFilter, type TeachingRole } from './activity-workspace-model'

const selectClass = 'h-9 min-w-0 rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
const filters = [{ value: 'all', label: 'All activities' }, { value: 'review', label: 'To review' }, { value: 'Draft', label: 'Drafts' }, { value: 'Published', label: 'Published' }] as const

export function TeachingActivitiesView({ role }: { role: TeachingRole }) {
  const { getClassroomsForWorkspace, connectedModeEnabled, classroomsLoading, classroomsError, reloadClassrooms, createActivity, reviewSubmission } = useClassroomPrototype()
  const copy = workspaceCopy[role]
  const classrooms = connectedModeEnabled ? [] : ownedPreviewClasses(getClassroomsForWorkspace(role), role)
  const entries = activityEntries(classrooms)
  const [query, setQuery] = useState('')
  const [context, setContext] = useState('all')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState<ActivityFilter>('all')
  const [due, setDue] = useState<DueFilter>('all')
  const [sort, setSort] = useState<'due' | 'title'>('due')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [composer, setComposer] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const visible = filterActivities(entries, { query, context, type, status, due, sort })
  const selected = entries.find(entry => entry.key === selectedKey)
  const availableClasses = classrooms.filter(item => item.previewStatus !== 'inactive')
  const ready = !connectedModeEnabled && !classroomsLoading && !classroomsError
  const isFiltered = query.trim() !== '' || context !== 'all' || type !== 'all' || status !== 'all' || due !== 'all'
  const counts = { all: entries.length, Published: entries.filter(entry => entry.activity.status === 'Published').length, Draft: entries.filter(entry => entry.activity.status === 'Draft').length, review: entries.reduce((sum, entry) => sum + pendingResponses(entry.activity), 0) }
  function reset() { setQuery(''); setContext('all'); setType('all'); setStatus('all'); setDue('all') }

  return <div className="mx-auto w-full max-w-7xl space-y-4">
    <header className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-48 w-72 rounded-full bg-brand-soft opacity-70 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold tracking-[0.18em] text-brand-soft-foreground uppercase">{copy.eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{copy.title}</h2><p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">{copy.description}</p></div><div className="flex shrink-0 flex-wrap gap-2"><Link to={`/${role}/classrooms`} className={buttonVariants({ variant: 'outline', size: 'sm' })}><BookOpen aria-hidden="true" />My classes</Link><Button data-create-teaching-activity size="sm" disabled={!ready || availableClasses.length === 0} onClick={() => { setNotice(''); setComposer(true) }}><Plus aria-hidden="true" />Create preview activity</Button></div></div>
    </header>

    <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/35 px-4 py-3 text-xs leading-5 text-muted-foreground"><Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /><p>{connectedModeEnabled ? 'Activity and submission services are not connected. Classroom access does not enable activity authoring or review.' : <><strong className="font-medium text-foreground">Classroom preview.</strong> Sample content and changes stay in this tab and reset on refresh. Nothing is saved to an account or assigned on the server.</>}</p></div>

    <div role="group" aria-label="Preview activity summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {([{ key: 'all', label: 'All activities', detail: 'Across your teaching groups', icon: BookOpen }, { key: 'Published', label: 'Published', detail: 'Published preview activities', icon: ClipboardCheck }, { key: 'Draft', label: 'Drafts', detail: 'Unpublished preparation', icon: FileText }, { key: 'review', label: 'Responses to review', detail: 'Preview responses without feedback', icon: MessageSquareText }] as const).map(item => <button key={item.key} type="button" disabled={!ready} onClick={() => setStatus(item.key)} aria-pressed={status === item.key} className={`flex min-w-0 flex-col rounded-xl border bg-card p-3 text-left outline-none hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed ${status === item.key ? 'border-brand/35 ring-1 ring-brand/10' : 'border-border'}`}><span className="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground"><span>{item.label}</span><item.icon aria-hidden="true" className="size-4 shrink-0" /></span><span className="mt-1 text-2xl font-semibold tracking-tight">{ready ? counts[item.key] : '—'}</span><span className="sr-only">{item.detail}</span></button>)}
    </div>
    {notice && <p role="status" className="rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-xs text-brand-soft-foreground">{notice}</p>}

    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5" aria-label="Activity workspace">
      <Tabs value={status} onValueChange={value => setStatus((value ?? 'all') as ActivityFilter)} className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border"><TabsList variant="line" className="h-auto flex-wrap justify-start gap-1">{filters.map(item => <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>)}</TabsList><div role="group" aria-label="Activity layout" className="mb-2 flex gap-1"><Button variant="ghost" size="icon-sm" aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'bg-muted' : ''} onClick={() => setView('grid')}><Grid2X2 aria-hidden="true" className="size-4" /></Button><Button variant="ghost" size="icon-sm" aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'bg-muted' : ''} onClick={() => setView('list')}><List aria-hidden="true" className="size-4" /></Button></div></div>
        <div className="flex flex-wrap gap-2"><div className="relative min-w-40 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label="Search activities" placeholder="Search by activity, topic, or group…" value={query} onChange={event => setQuery(event.target.value)} className="h-9 bg-background pl-9 text-xs md:text-xs" /></div><select aria-label={copy.context} className={`${selectClass} max-w-48`} value={context} onChange={event => setContext(event.target.value)}><option value="all">{copy.contexts}</option>{classrooms.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="Activity type" className={`${selectClass} max-w-40`} value={type} onChange={event => setType(event.target.value)}><option value="all">All types</option>{activityTypes.map(item => <option key={item}>{item}</option>)}</select><select aria-label="Due date filter" className={selectClass} value={due} onChange={event => setDue(event.target.value as DueFilter)}><option value="all">Any due date</option><option value="upcoming">Next 7 days</option><option value="past">Past due dates</option><option value="undated">No due date</option></select><select aria-label="Sort activities" className={selectClass} value={sort} onChange={event => setSort(event.target.value as 'due' | 'title')}><option value="due">Sort by due date</option><option value="title">Sort by title</option></select></div>
        {filters.map(filter => <TabsContent key={filter.value} value={filter.value} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><p role="status">{ready ? `${visible.length} preview ${visible.length === 1 ? 'activity' : 'activities'} shown` : 'Activity records unavailable'}</p>{isFiltered && <Button variant="ghost" size="xs" onClick={reset}><X aria-hidden="true" className="size-3" />Clear filters</Button>}</div>
          {classroomsLoading ? <p role="status" className="p-8 text-center text-sm text-muted-foreground">Loading teaching groups…</p> : classroomsError ? <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 p-6"><p className="text-sm">Your teaching groups couldn’t be loaded. Try again to restore this workspace.</p><Button variant="outline" onClick={reloadClassrooms}>Retry loading groups</Button></div> : connectedModeEnabled ? <WorkspaceEmpty title="Activity service not connected" description="Authoring, learner responses, evaluations, and feedback are unavailable until an approved activity service is connected." />
            : visible.length > 0 ? <ActivityCollection entries={visible} view={view} role={role} onOpen={entry => setSelectedKey(entry.key)} />
            : <WorkspaceEmpty title={isFiltered ? status === 'review' && query === '' && context === 'all' && type === 'all' && due === 'all' ? 'No preview responses to review' : 'No activities match this view' : 'Your next activity starts here'} description={isFiltered ? 'Change the filters to explore your other preview activities.' : 'Create a preview activity in one of your teaching groups. You can also open My classes to prepare a group first.'}><Button variant="outline" size="sm" onClick={isFiltered ? reset : () => setComposer(true)} disabled={!isFiltered && availableClasses.length === 0}>{isFiltered ? 'Reset filters' : 'Create preview activity'}</Button></WorkspaceEmpty>}
        </TabsContent>)}
      </Tabs>
      <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">{copy.boundary}</p>
    </section>

    <ActivityComposer open={composer && ready} onOpenChange={setComposer} classrooms={availableClasses} role={role} onCreate={(classroomId, input) => {
      if (!ready || !availableClasses.some(item => item.id === classroomId)) throw new Error('Unavailable preview group')
      createActivity(classroomId, input); setComposer(false); reset(); setNotice('Activity added to the classroom preview. Changes reset on refresh.')
    }} />
    <ActivityDetails open={selectedKey !== null} entry={ready ? selected : undefined} onOpenChange={open => { if (!open) setSelectedKey(null) }} role={role} reviewFirst={status === 'review'} onRelease={(entry, submission, evaluation, feedback) => {
      if (!ready || !entries.some(item => item.key === entry.key)) throw new Error('Unavailable preview activity')
      reviewSubmission(entry.classroom.id, entry.activity.id, submission.id, evaluation, feedback, submission.score)
    }} />
  </div>
}

function WorkspaceEmpty({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-foreground"><ClipboardCheck aria-hidden="true" className="size-5" /></span><h3 className="text-base font-semibold">{title}</h3><p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>{children}</div>
}
