import { useEffect, useState } from 'react'
import { Check, ClipboardCheck, FileText, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { listClassworkLearners, listClassworkSubmissions, type ClassworkEntry } from '@/services/api/classwork-workspace.service'
import { classworkClosed, classworkStatus, formatClassworkDate } from '../utils/classwork-deadline'
import { useContext } from 'react'
import { ClassworkReviewContext } from '../context/classwork-review-context'

function timeRemaining(dueAt: string | null, now: number) {
  if (!dueAt) return 'No closing time'
  const minutes = Math.ceil((Date.parse(dueAt) - now) / 60_000)
  if (minutes <= 0) return 'Closed'
  if (minutes < 60) return `${minutes} min left`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ${minutes % 60} min left`
  const days = Math.ceil(minutes / 1440)
  return `${days} ${days === 1 ? 'day' : 'days'} left`
}

export function ClassworkProgressPanel({ items, active, owned, loading, error, now, onSelect }: {
  items: ClassworkEntry[]; active: ClassworkEntry | null; owned: boolean
  loading: boolean; error: boolean; now: number; onSelect: (id: string) => void
}) {
  const review = useContext(ClassworkReviewContext)
  const published = items.filter(item => item.work.status === 'PUBLISHED')
  const completed = published.filter(item => item.submission?.status === 'SUBMITTED').length
  const timeline = [...items].sort((a, b) => (a.work.dueAt ? Date.parse(a.work.dueAt) : Infinity) - (b.work.dueAt ? Date.parse(b.work.dueAt) : Infinity))
  return <aside aria-label="Classwork deadlines and progress" className="min-w-0 space-y-3 xl:sticky xl:top-5">
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Classwork progress</h3><Info aria-label="Progress reflects saved work and confirmed submissions, not grades." className="size-3.5 shrink-0 text-muted-foreground" /></header>
      {!owned && !loading && !error && <div className="mt-4 space-y-2"><p className="text-xs text-muted-foreground">{completed} of {published.length} activities submitted</p><progress aria-label="Activities submitted" value={completed} max={Math.max(1, published.length)} className="h-1.5 w-full overflow-hidden rounded-full appearance-none accent-brand [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-brand [&::-moz-progress-bar]:bg-brand" /></div>}
      {loading ? <p role="status" className="mt-5 text-xs text-muted-foreground">Loading deadlines…</p> : error ? <p className="mt-5 text-xs text-muted-foreground">Deadlines could not be loaded. Retry classwork to refresh.</p> : timeline.length === 0 ? <p className="mt-5 text-xs leading-5 text-muted-foreground">Assigned work and closing times will appear here.</p> : <ol className="mt-5 space-y-0">{timeline.map((item, index) => {
        const selected = active?.work.id === item.work.id
        const submitted = item.submission?.status === 'SUBMITTED'
        const closed = classworkClosed(item.work.dueAt, now)
        const status = owned ? item.work.status === 'DRAFT' ? 'Draft' : closed ? 'Closed' : 'Published' : classworkStatus(item.work, item.submission, now)
        return <li key={item.work.id} className="relative flex gap-2.5 pb-5 last:pb-0">
          {index < timeline.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-2.5 top-6 w-px bg-border" />}
          <span aria-hidden="true" className={`relative mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${submitted ? 'border-brand bg-brand text-brand-foreground' : selected ? 'border-2 border-brand bg-card' : 'border-border bg-card'}`}>{submitted && <Check className="size-3" />}</span>
          <div className="min-w-0 flex-1"><p className={`break-words text-xs leading-5 ${selected ? 'font-semibold' : 'font-medium'}`}>{item.work.title}</p><p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{formatClassworkDate(item.work.dueAt)}</p><p className={`mt-0.5 text-[11px] ${status === 'Missing' ? 'text-destructive' : 'text-muted-foreground'}`}>{status}{item.work.status === 'PUBLISHED' && !submitted ? ` · ${timeRemaining(item.work.dueAt, now)}` : ''}</p>
            <Button size="sm" variant="outline" className={`mt-2 h-6 rounded-lg px-2 text-[10px] ${selected ? 'border-brand/30 bg-brand-soft text-brand-soft-foreground hover:bg-brand-soft/80' : ''}`} aria-current={selected ? 'step' : undefined} aria-label={`View progress for ${item.work.title}`} onClick={() => onSelect(item.work.id)}>{selected ? 'Viewing activity' : 'View activity'}</Button>
          </div>
        </li>
      })}</ol>}
    </section>
    {active && <section className="space-y-3 rounded-2xl border border-border bg-card p-4" aria-label="Selected activity progress">
      <div className="flex items-center gap-2">{active.questions.questions.length ? <ClipboardCheck aria-hidden="true" className="size-4 text-brand" /> : <FileText aria-hidden="true" className="size-4 text-brand" />}<h3 className="text-xs font-semibold">{active.questions.questions.length ? 'Quiz' : 'Assessment'}</h3></div>
      <p className="break-words text-xs leading-5">{active.work.title}</p>
      {owned && active.work.status === 'PUBLISHED' && review && <Button size="sm" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => review.setPanel('student-work')}>Student work</Button>}
      {owned ? active.work.status === 'DRAFT' ? <p className="text-xs text-muted-foreground">Private draft. Publish to assign it to your students.</p> : <ClassSubmissionProgress key={active.work.id} classroomId={active.work.classroomId} classworkId={active.work.id} closed={classworkClosed(active.work.dueAt, now)} /> : <div className="space-y-2 text-xs text-muted-foreground">
        <p>{classworkStatus(active.work, active.submission, now)}</p>
        {active.questions.questions.length > 0 && <p>{active.submission?.choiceAnswers.length ?? 0} of {active.questions.questions.length} answers saved</p>}
        {active.submission?.submittedAt && <p>Submitted {formatClassworkDate(active.submission.submittedAt)}</p>}
        <p className="leading-5">Progress reflects saved work. Drafts must be submitted before closing.</p>
      </div>}
    </section>}
  </aside>
}

function ClassSubmissionProgress({ classroomId, classworkId, closed }: { classroomId: string; classworkId: string; closed: boolean }) {
  const [counts, setCounts] = useState<{ total: number; submitted: number } | null>(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([listClassworkLearners(classroomId, controller.signal), listClassworkSubmissions(classworkId, controller.signal)]).then(([learners, submissions]) => {
      if (controller.signal.aborted) return
      const submitted = new Set(submissions.filter(item => item.submittedAt).map(item => item.studentId))
      setCounts({ total: learners.length, submitted: learners.filter(learner => submitted.has(learner.studentId)).length })
      setError('')
    }).catch(cause => { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Progress could not be loaded.')) })
    return () => controller.abort()
  }, [classroomId, classworkId, revision])
  return <div className="space-y-2 text-xs text-muted-foreground">
    {error ? <p role="alert">{error}</p> : !counts ? <p role="status">Loading student progress…</p> : <><p>{counts.submitted} of {counts.total} students submitted</p><progress aria-label="Students submitted" value={counts.submitted} max={Math.max(1, counts.total)} className="h-1.5 w-full appearance-none accent-brand [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-brand [&::-moz-progress-bar]:bg-brand" /><p>{counts.total - counts.submitted} {closed ? 'missing' : 'not submitted'}</p></>}
    <Button size="sm" variant="ghost" className="h-7 px-0 text-[11px]" onClick={() => { setCounts(null); setError(''); setRevision(value => value + 1) }}>Refresh progress</Button>
  </div>
}
