import { useEffect, useId, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, ClipboardList, GraduationCap, LockKeyhole, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/api-error'
import {
  getClassroomGradebook, getGradebookFeedback, type GradebookActivity, type GradebookCell, type GradebookPage,
} from '@/services/api/classroom-gradebook.service'
import { formatClassworkDate } from '../utils/classwork-deadline'
import { gradingPeriodLabels } from '../contents/grading-periods'
import { GradeComments } from '../ui/grade-comments'
import { PeriodGrades } from '../ui/period-grades'
import { ReleasedFeedbackEditor } from '../ui/released-feedback-editor'

const card = 'min-w-0 rounded-[1.5rem] bg-card p-4 sm:p-5'
const detailTile = 'flex items-start gap-3 rounded-xl bg-blue-50 p-3.5 surface-dark:bg-muted'
const heading = 'text-lg font-medium tracking-tight'
type GradesProps = { classroomId: string; classroomHref: string; accountId: string; owned: boolean }
type ActivityResult = { activity: GradebookActivity; cell?: GradebookCell }
type ReadState<T> = { data: T } | { error: string } | null

export function ClassroomGradesView(props: GradesProps) {
  const [activities, setActivities] = useState<string[]>([])
  const [learners, setLearners] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const [selectedLearner, setSelectedLearner] = useState('')
  const activityCursor = activities.at(-1)
  const learnerCursor = learners.at(-1)

  return (
    <div className="@container">
      <GradebookContent
        key={JSON.stringify([activityCursor, learnerCursor, revision])}
        {...props}
        activityCursor={activityCursor}
        learnerCursor={learnerCursor}
        selectedLearner={selectedLearner}
        onSelectLearner={setSelectedLearner}
        onRefresh={() => setRevision(value => value + 1)}
        activityPage={{ label: 'Activities', history: activities, onChange: setActivities }}
        learnerPage={{ label: 'Learners', history: learners, onChange: setLearners }}
      />
    </div>
  )
}

type PageControls = { label: string; history: string[]; onChange: (history: string[]) => void }

function GradebookContent({
  classroomId, classroomHref, accountId, owned, activityCursor, learnerCursor, selectedLearner, onSelectLearner,
  onRefresh, activityPage, learnerPage,
}: GradesProps & {
  activityCursor?: string
  learnerCursor?: string
  selectedLearner: string
  onSelectLearner: (id: string) => void
  onRefresh: () => void
  activityPage: PageControls
  learnerPage: PageControls
}) {
  const bookTitle = useId()
  const [read, setRead] = useState<ReadState<GradebookPage>>(null)
  const [selectedActivity, setSelectedActivity] = useState('')
  const studentId = owned ? undefined : accountId

  useEffect(() => {
    const controller = new AbortController()
    getClassroomGradebook({ classroomId, studentId }, { activity: activityCursor, learner: learnerCursor }, controller.signal)
      .then(data => { if (!controller.signal.aborted) setRead({ data }) })
      .catch(cause => {
        if (!controller.signal.aborted) setRead({ error: getApiErrorMessage(cause, 'Could not load grades and feedback.') })
      })
    return () => controller.abort()
  }, [activityCursor, classroomId, learnerCursor, studentId])

  const page = read && 'data' in read ? read.data : null
  const learner = page?.learners.find(item => item.student.id === selectedLearner) ?? page?.learners[0]
  const cells = new Map(learner?.cells.map(cell => [cell.classworkId, cell]))
  const rows: ActivityResult[] = page?.activities.map(activity => ({ activity, cell: cells.get(activity.id) })) ?? []
  const selected = rows.find(row => row.activity.id === selectedActivity)
    ?? rows.find(row => row.cell?.status === 'RELEASED')
    ?? rows[0]
  const error = read && 'error' in read ? read.error : ''

  return (
    <div className="grid items-start gap-3.5 @min-[39rem]:grid-cols-2">
      <section aria-labelledby={bookTitle} className={card}>
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 id={bookTitle} className={heading}>Grades &amp; Feedback</h3>
          <Button type="button" variant="ghost" size="sm" disabled={!read} onClick={onRefresh} className="text-brand">Refresh grades</Button>
        </header>
        {owned && page && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            {learner && <Select value={learner.student.id} onValueChange={value => { if (value) onSelectLearner(value) }}
              items={page.learners.map(item => ({ value: item.student.id, label: item.student.name }))}>
              <SelectTrigger aria-label="Student" className="max-w-full"><SelectValue /></SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {page.learners.map(item => <SelectItem key={item.student.id} value={item.student.id}>{item.student.name}</SelectItem>)}
              </SelectContent>
            </Select>}
            <Pagination {...learnerPage} next={page.nextLearner} />
          </div>
        )}
        {!read && <div role="status" aria-label="Loading grades" className="space-y-4 py-2">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-10 w-full rounded-xl" />)}
        </div>}
        {error && <p role="alert" className="px-1 py-4 text-sm text-destructive">{error}</p>}
        {page && (rows.length && learner ? (
          <ul aria-label="Classwork grades" className="space-y-1">
            {rows.map(row => (
              <li key={row.activity.id}>
                <Button type="button" variant="ghost" aria-pressed={selected === row}
                  onClick={() => setSelectedActivity(row.activity.id)}
                  className="grid h-auto w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-2.5 rounded-xl px-1.5 py-2 text-left font-normal whitespace-normal aria-pressed:bg-brand-soft/60 sm:gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand-soft-foreground"><ClipboardList aria-hidden="true" className="size-4" /></span>
                  <span className="min-w-0">
                    <span className="block wrap-anywhere font-medium">{row.activity.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {row.activity.gradingPeriod && `${gradingPeriodLabels[row.activity.gradingPeriod]} · `}
                      {row.activity.dueAt ? `Due ${formatClassworkDate(row.activity.dueAt)}` : 'No deadline'}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-base leading-none tabular-nums">
                      {owned || row.cell?.status === 'RELEASED' ? formatScore(row.cell) : '—'}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{resultStatus(row.cell)}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        ) : <p className="px-1 py-4 text-sm text-muted-foreground">{owned && !learner ? 'No enrolled students on this page.' : 'No published classwork on this page.'}</p>)}
        {page && <Pagination {...activityPage} next={page.nextActivity} />}
      </section>

      <aside aria-label="Grade details" className={card}>
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className={heading}>Feedback details</h3>
          <Link to={`${classroomHref}?tab=classwork`} className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand hover:underline focus-visible:ring-2 focus-visible:ring-ring">
            View Classwork <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </header>
        <div className="space-y-2">
          <div className={detailTile}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700 surface-dark:bg-background surface-dark:text-foreground"><MessageSquareText aria-hidden="true" className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold">{learner && selected ? selected.activity.title : 'Classwork feedback'}</h4>
              {learner && selected ? <Feedback
                key={JSON.stringify([learner.student.id, selected.activity.id, selected.cell?.submissionId])}
                owned={owned}
                row={selected}
                activityHref={`${classroomHref}/classwork/${encodeURIComponent(selected.activity.id)}`}
              /> : <p className="mt-1 text-xs text-muted-foreground">Feedback for released Classwork appears here.</p>}
            </div>
          </div>
          <div className={detailTile}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 surface-dark:bg-background surface-dark:text-foreground"><GraduationCap aria-hidden="true" className="size-4" /></span>
            <div className="min-w-0 flex-1 space-y-2">
              <h4 className="text-sm font-semibold">Semester grades</h4>
              {learner ? <PeriodGrades key={learner.student.id} classroomId={classroomId} studentId={learner.student.id} owned={owned} />
                : <p className="text-xs text-muted-foreground">Semester grades appear here after release.</p>}
            </div>
          </div>
          <div className={detailTile}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-800 surface-dark:bg-background surface-dark:text-foreground"><LockKeyhole aria-hidden="true" className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold">Private comments</h4>
              {selected?.cell?.status === 'RELEASED' ? (
                <GradeComments key={selected.cell.submissionId} submissionId={selected.cell.submissionId} accountId={accountId} owned={owned} />
              ) : <p className="mt-1 text-xs text-muted-foreground">Select a released grade to read or write a private comment.</p>}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function Feedback({ owned, row, activityHref }: { owned: boolean; row: ActivityResult; activityHref: string }) {
  const cell = row.cell
  const released = cell?.status === 'RELEASED'
  const submissionId = released || (owned && cell?.status === 'EVALUATION_DRAFT') ? cell.submissionId : null
  const [read, setRead] = useState<ReadState<Awaited<ReturnType<typeof getGradebookFeedback>>>>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!submissionId) return
    const controller = new AbortController()
    getGradebookFeedback(submissionId, owned, controller.signal)
      .then(data => {
        if (released && data?.evaluation?.status === 'DRAFT') throw new Error('The grade changed. Refresh grades to see the current result.')
        if (!controller.signal.aborted) setRead({ data })
      })
      .catch(cause => {
        if (!controller.signal.aborted) setRead({ error: getApiErrorMessage(cause, 'Could not load feedback.') })
      })
    return () => controller.abort()
  }, [owned, released, revision, submissionId])

  return (
    <>
      <p className="mt-1 text-xs text-muted-foreground">
        {resultStatus(cell)}{cell?.releasedAt && ` · ${formatClassworkDate(cell.releasedAt)}`}
      </p>
      {submissionId && (!read ? <p role="status" className="mt-3 text-sm">Loading feedback…</p> : 'error' in read ? (
        <div className="mt-3 space-y-2">
          <p role="alert" className="text-sm text-destructive">{read.error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => { setRead(null); setRevision(value => value + 1) }}>Retry feedback</Button>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-5 whitespace-pre-wrap wrap-anywhere">
          {read.data ? read.data.feedback || 'No written feedback.' : 'Feedback is unavailable for this submission.'}
        </p>
      ))}
      {owned && read && 'data' in read && read.data?.evaluation?.status === 'RELEASED' && (
        <ReleasedFeedbackEditor evaluation={read.data.evaluation} onSave={evaluation => setRead({ data: { evaluation, feedback: evaluation.feedback } })} />
      )}
      <Link to={activityHref} className="mt-3 inline-flex items-center gap-1 rounded text-xs font-semibold text-brand hover:underline focus-visible:ring-2 focus-visible:ring-ring">
        {owned && !released && cell?.submissionId ? 'Review in Classwork' : 'Open activity'} <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </Link>
    </>
  )
}

function formatScore(cell?: GradebookCell) {
  return cell?.score != null && cell.maxPoints != null ? `${cell.score} / ${cell.maxPoints}` : '—'
}

function resultStatus(cell?: GradebookCell) {
  switch (cell?.status) {
    case 'RELEASED': return 'Released'
    case 'EVALUATION_DRAFT': return 'Grade draft'
    case 'AWAITING_RESULT': return 'Awaiting grade'
    case 'UNGRADED': return 'Ungraded'
    case 'NOT_SUBMITTED': return cell.isOverdue ? 'Missing' : 'Not submitted'
    default: return 'Unavailable'
  }
}

function Pagination({ label, history, onChange, next }: PageControls & { next: string | null }) {
  const canAdvance = Boolean(next && !history.includes(next))
  if (!history.length && !next) return null
  return (
    <div role="group" aria-label={`${label} pagination`} className="flex items-center justify-end gap-1">
      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Previous ${label.toLowerCase()} page`}
        disabled={!history.length} onClick={() => onChange(history.slice(0, -1))}><ChevronLeft aria-hidden="true" /></Button>
      <span className="text-xs text-muted-foreground">Page {history.length + 1}</span>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Next ${label.toLowerCase()} page`}
        disabled={!canAdvance} onClick={() => { if (next && canAdvance) onChange([...history, next]) }}><ChevronRight aria-hidden="true" /></Button>
    </div>
  )
}
