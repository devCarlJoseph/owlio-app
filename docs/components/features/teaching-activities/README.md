# Teaching activities breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(teaching-activities): add teaching activity source copies`

Target: `src/components/features/teaching-activities/`. This shared teaching feature is used across educator, ESL, and tutor contexts; preserve their audience and terminology. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `forms/` | `activity-composer.tsx` |
| `ui/` | `activity-collection.tsx`, `activity-details.tsx` |
| `model/` | `activity-workspace-model.ts` |
| `view/` | `teaching-activities-view.tsx`, `teaching-activities.test.tsx` |

Keep preview authoring/review behavior separate from connected classroom records and published learner feedback. Check the existing classroom provider dependency before moving the view; a failing test without its provider is a test-setup issue, not a reason to fabricate activity data.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/dashboard/educators/classwork/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { TeachingActivitiesView } from '@/components/features/teaching-activities/teaching-activities-view'

export default function EducatorClassworkPage() {
  return <TeachingActivitiesView role="educators" />
}
```

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/teaching-activities/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `activity-collection.tsx`

Current file: `src/components/features/teaching-activities/activity-collection.tsx`

```tsx
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
```

### `activity-composer.tsx`

Current file: `src/components/features/teaching-activities/activity-composer.tsx`

```tsx
import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QuizTimerSettings } from '@/components/features/classrooms/quiz-timer-settings'
import { parseTimingFields, type TimingFormResult } from '@/components/features/classrooms/quiz-timing'
import type { ActivityTiming, Classroom, CreateActivityInput } from '@/components/features/classrooms/classroom-types'
import { activityTypes, questionTypes, workspaceCopy, type TeachingRole } from './activity-workspace-model'

const schema = z.object({
  classroomId: z.string().min(1, 'Choose a teaching group.'), title: z.string().trim().min(3, 'Use at least 3 characters for the title.').max(100),
  type: z.enum(activityTypes), instructions: z.string().trim().min(1, 'Add instructions for the learner.').max(2000), dueDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, 'Choose a valid due date.'),
  scoringNote: z.string().trim().max(200), responseType: z.enum(['Text', 'File', 'Link']), questionType: z.enum(questionTypes), prompt: z.string().trim().max(1000), options: z.string(),
}).superRefine((data, ctx) => {
  if (data.type !== 'Quiz' && data.type !== 'Test') return
  if (!data.prompt) ctx.addIssue({ code: 'custom', path: ['prompt'], message: 'Add a question prompt.' })
  if (['Multiple choice', 'Multiple select'].includes(data.questionType) && data.options.split(',').map(item => item.trim()).filter(Boolean).length < 2) ctx.addIssue({ code: 'custom', path: ['options'], message: 'Add at least two comma-separated options.' })
})
type Values = z.infer<typeof schema>
const selectClass = 'h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function ActivityComposer({ open, onOpenChange, classrooms, role, onCreate }: {
  open: boolean; onOpenChange: (open: boolean) => void; classrooms: Classroom[]; role: TeachingRole
  onCreate: (classroomId: string, input: CreateActivityInput) => void
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><ComposerForm classrooms={classrooms} role={role} onCreate={onCreate} onCancel={() => onOpenChange(false)} /></DialogContent></Dialog>
}

function ComposerForm({ classrooms, role, onCreate, onCancel }: { classrooms: Classroom[]; role: TeachingRole; onCreate: (classroomId: string, input: CreateActivityInput) => void; onCancel: () => void }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [timingErrors, setTimingErrors] = useState<TimingFormResult['errors']>({})
  const { register, handleSubmit, control, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { classroomId: classrooms[0]?.id ?? '', title: '', type: role === 'esl' ? 'Speaking practice' : 'Assignment', instructions: '', dueDate: '', scoringNote: '', responseType: 'Text', questionType: 'Multiple choice', prompt: '', options: '' } })
  const type = useWatch({ control, name: 'type' })
  const questionType = useWatch({ control, name: 'questionType' })
  const formBased = type === 'Quiz' || type === 'Test'
  const copy = workspaceCopy[role]
  function submit(data: Values) {
    setError('')
    if (!classrooms.some(item => item.id === data.classroomId)) { setError('The selected group is no longer available. Close this form and choose an available group.'); return }
    let timing: ActivityTiming | undefined
    let showLeaderboard: boolean | undefined
    if (formBased && formRef.current) {
      const form = new FormData(formRef.current)
      const parsed = parseTimingFields({ duration: String(form.get('timer-duration') ?? ''), opensAt: String(form.get('timer-opens') ?? ''), closesAt: String(form.get('timer-closes') ?? ''), autoSubmit: form.get('timer-auto-submit') === 'on' })
      setTimingErrors(parsed.errors)
      if (!parsed.timing) return
      timing = parsed.timing
      showLeaderboard = form.get('show-leaderboard') === 'on'
    }
    try {
      onCreate(data.classroomId, { title: data.title, type: data.type, instructions: data.instructions, dueDate: data.dueDate, scoringNote: data.scoringNote, responseType: formBased ? 'Quiz' : data.responseType, questions: formBased ? [{ id: crypto.randomUUID(), type: data.questionType, prompt: data.prompt, options: ['Multiple choice', 'Multiple select'].includes(data.questionType) ? data.options.split(',').map(item => item.trim()).filter(Boolean) : [] }] : [], timing, showLeaderboard })
    } catch { setError('The preview activity couldn’t be added. Your entries are still here; check the group and try again.') }
  }
  const errorFor = (name: keyof Values) => errors[name]?.message ? <p id={`create-${name}-error`} role="alert" className="text-xs text-destructive">{String(errors[name]?.message)}</p> : null
  return <>
    <DialogHeader><DialogTitle className="text-xl font-semibold">Create preview activity</DialogTitle><DialogDescription>This creates a Published example in the selected classroom preview. Changes stay in this tab and reset on refresh.</DialogDescription></DialogHeader>
    <form ref={formRef} onSubmit={event => void handleSubmit(submit)(event)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="create-classroom">{copy.context}</Label><select id="create-classroom" className={selectClass} {...register('classroomId')} aria-invalid={Boolean(errors.classroomId)} aria-describedby={errors.classroomId ? 'create-classroomId-error' : undefined}>{classrooms.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errorFor('classroomId')}</div><div className="space-y-2"><Label htmlFor="create-type">Activity type</Label><select id="create-type" className={selectClass} {...register('type')}>{activityTypes.map(item => <option key={item}>{item}</option>)}</select></div></div>
      <div className="space-y-2"><Label htmlFor="create-title">Activity title</Label><Input id="create-title" {...register('title')} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'create-title-error' : undefined} placeholder={role === 'esl' ? 'e.g. Describe your favorite place' : 'e.g. Apply what we learned'} maxLength={100} />{errorFor('title')}</div>
      <div className="space-y-2"><Label htmlFor="create-instructions">Learner instructions</Label><Textarea id="create-instructions" {...register('instructions')} aria-invalid={Boolean(errors.instructions)} aria-describedby={errors.instructions ? 'create-instructions-error' : undefined} placeholder="Explain the task and what a useful response looks like…" className="min-h-28" maxLength={2000} />{errorFor('instructions')}</div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="create-due">Due date (optional)</Label><Input id="create-due" type="date" {...register('dueDate')} aria-invalid={Boolean(errors.dueDate)} aria-describedby={errors.dueDate ? 'create-dueDate-error' : undefined} />{errorFor('dueDate')}</div><div className="space-y-2"><Label htmlFor="create-criteria">{copy.criteria} (optional)</Label><Input id="create-criteria" {...register('scoringNote')} maxLength={200} placeholder="e.g. Explain your reasoning clearly" /></div></div>
      {formBased ? <fieldset className="space-y-4 rounded-xl border border-border p-4"><legend className="px-1 text-sm font-medium">Question preview</legend><p className="text-xs text-muted-foreground">The current classroom prototype supports one question per new quiz or test.</p><div className="space-y-2"><Label htmlFor="create-question-type">Question type</Label><select id="create-question-type" className={selectClass} {...register('questionType')}>{questionTypes.map(item => <option key={item}>{item}</option>)}</select></div><div className="space-y-2"><Label htmlFor="create-prompt">Question prompt</Label><Textarea id="create-prompt" {...register('prompt')} maxLength={1000} aria-invalid={Boolean(errors.prompt)} aria-describedby={errors.prompt ? 'create-prompt-error' : undefined} />{errorFor('prompt')}</div>{['Multiple choice', 'Multiple select'].includes(questionType) && <div className="space-y-2"><Label htmlFor="create-options">Answer options, separated by commas</Label><Input id="create-options" {...register('options')} placeholder="First choice, Second choice" aria-invalid={Boolean(errors.options)} aria-describedby={errors.options ? 'create-options-error' : undefined} />{errorFor('options')}</div>}<QuizTimerSettings required isQuizOrTest errors={timingErrors} /></fieldset>
        : <div className="space-y-2"><Label htmlFor="create-response-type">Response type</Label><select id="create-response-type" className={selectClass} {...register('responseType')}><option value="Text">Written response</option><option value="Link">Link response</option><option value="File">File description preview</option></select><p className="text-[11px] leading-5 text-muted-foreground">Files are descriptive previews only. Nothing is uploaded or scanned.</p></div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Add to preview</Button></div>
    </form>
  </>
}
```

### `activity-details.tsx`

Current file: `src/components/features/teaching-activities/activity-details.tsx`

```tsx
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, CalendarDays, ClipboardCheck, MessageSquareText } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ClassroomSubmission } from '@/components/features/classrooms/classroom-types'
import { formatActivityDate, pendingResponses, workspaceCopy, type ActivityEntry, type TeachingRole } from './activity-workspace-model'

export function ActivityDetails({ entry, open, onOpenChange, role, reviewFirst, onRelease }: {
  entry?: ActivityEntry; open: boolean; onOpenChange: (open: boolean) => void; role: TeachingRole; reviewFirst: boolean
  onRelease: (entry: ActivityEntry, submission: ClassroomSubmission, evaluation: string, feedback: string) => void
}) {
  const lastKey = useRef(entry?.key)
  useEffect(() => { if (entry) lastKey.current = entry.key }, [entry])
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent overlayClassName="bg-black/20 supports-backdrop-filter:backdrop-blur-none" finalFocus={() => Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-activity-open]')).find(button => button.dataset.activityOpen === lastKey.current) ?? document.querySelector<HTMLButtonElement>('[data-create-teaching-activity]')} className="inset-y-0 right-0 left-auto flex h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l border-border p-0 sm:max-w-2xl data-open:zoom-in-100 data-closed:zoom-out-100 motion-reduce:animate-none">
    {entry ? <DetailContent key={entry.key} entry={entry} role={role} reviewFirst={reviewFirst} onRelease={onRelease} /> : <DialogHeader className="p-6"><DialogTitle>Activity unavailable</DialogTitle><DialogDescription>This activity is no longer available in the current teaching workspace.</DialogDescription></DialogHeader>}
  </DialogContent></Dialog>
}

function DetailContent({ entry, role, reviewFirst, onRelease }: { entry: ActivityEntry; role: TeachingRole; reviewFirst: boolean; onRelease: (entry: ActivityEntry, submission: ClassroomSubmission, evaluation: string, feedback: string) => void }) {
  const { activity, classroom } = entry
  const copy = workspaceCopy[role]
  const [selected, setSelected] = useState(activity.submissions.find(item => !item.released)?.id ?? activity.submissions[0]?.id ?? '')
  const submission = activity.submissions.find(item => item.id === selected) ?? activity.submissions[0]
  return <>
    <DialogHeader className="shrink-0 border-b border-border p-5 pr-14 sm:p-6 sm:pr-14"><p className="text-[10px] font-semibold tracking-wider text-brand-soft-foreground uppercase">{activity.type} · Classroom preview</p><DialogTitle className="break-words text-xl font-semibold leading-7">{activity.title}</DialogTitle><DialogDescription className="text-xs">{classroom.name} · {activity.status} · Changes reset on refresh.</DialogDescription></DialogHeader>
    <Tabs defaultValue={reviewFirst ? 'responses' : 'overview'} className="min-h-0 flex-1 gap-0 overflow-hidden">
      <TabsList variant="line" className="mx-5 h-12 shrink-0 justify-start gap-4 border-b border-border sm:mx-6"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="responses">Responses <span className="ml-1 text-[10px] text-muted-foreground">{activity.submissions.length}</span></TabsTrigger></TabsList>
      <TabsContent value="overview" className="min-h-0 overflow-y-auto p-5 sm:p-6">
        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border p-4 text-xs"><div><dt className="text-muted-foreground">Response type</dt><dd className="mt-2 font-medium">{activity.responseType === 'File' ? 'File description preview' : activity.responseType}</dd></div><div><dt className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays aria-hidden="true" className="size-3" />Due date</dt><dd className="mt-2 font-medium">{formatActivityDate(activity.dueDate)}</dd></div></dl>
        <section className="mt-6 space-y-3"><h3 className="text-sm font-semibold">Learner instructions</h3><p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{activity.instructions || 'No instructions provided.'}</p></section>
        <section className="mt-6 space-y-3 border-t border-border pt-5"><h3 className="text-sm font-semibold">{copy.criteria}</h3><p className="whitespace-pre-wrap break-words rounded-xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">{activity.scoringNote || 'No criteria added to this preview activity.'}</p><p className="text-xs leading-5 text-muted-foreground">{copy.boundary}</p></section>
        {activity.questions.length > 0 && <section className="mt-6 space-y-3 border-t border-border pt-5"><h3 className="text-sm font-semibold">Questions</h3>{activity.questions.map((question, index) => <article key={question.id} className="space-y-2 rounded-xl border border-border p-4"><p className="text-[10px] text-muted-foreground">Question {index + 1} · {question.type}</p><p className="whitespace-pre-wrap break-words text-sm">{question.prompt}</p>{question.options.length > 0 && <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">{question.options.map((option, i) => <li key={i}>{option}</li>)}</ul>}</article>)}</section>}
        {activity.timing && <section className="mt-6 space-y-2 rounded-xl border border-border p-4 text-xs"><h3 className="font-semibold">Timed activity preview</h3><p>{activity.timing.durationMinutes} minutes · {activity.timing.autoSubmitOnTimeUp ? 'Preview auto-submit enabled' : 'Manual preview submission'}</p>{activity.timing.opensAt && <p>Opens: {new Date(activity.timing.opensAt).toLocaleString()}</p>}{activity.timing.closesAt && <p>Closes: {new Date(activity.timing.closesAt).toLocaleString()}</p>}</section>}
      </TabsContent>
      <TabsContent value="responses" className="min-h-0 overflow-y-auto p-5 sm:p-6">
        {activity.submissions.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-5 text-center"><MessageSquareText aria-hidden="true" className="size-8 text-muted-foreground" /><h3 className="text-base font-medium">No preview responses yet</h3><p className="max-w-sm text-sm leading-6 text-muted-foreground">Learner work appears here when submitted in the classroom preview. No submissions or review progress are invented.</p></div> : <div className="space-y-5">
          <div className="space-y-2"><Label htmlFor="review-learner">Learner response</Label><select id="review-learner" value={submission?.id ?? ''} onChange={event => setSelected(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">{activity.submissions.map(item => <option key={item.id} value={item.id}>{item.learnerName} · {item.released ? 'Feedback released' : 'To review'}</option>)}</select><p className="text-[11px] text-muted-foreground">{pendingResponses(activity)} responses still awaiting feedback in this preview.</p></div>
          {submission && <><article className="rounded-xl border border-border bg-muted/30 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><h3 className="font-semibold text-foreground">{submission.learnerName}</h3><span>{submission.status} · Preview</span></div><p className="whitespace-pre-wrap break-words text-sm leading-7">{submission.response}</p>{submission.fileName && <p className="mt-3 text-xs text-muted-foreground">File name preview: {submission.fileName} · Upload unavailable</p>}</article><FeedbackForm key={submission.id} entry={entry} submission={submission} role={role} onRelease={onRelease} /></>}
        </div>}
      </TabsContent>
    </Tabs>
    <footer className="flex shrink-0 flex-wrap justify-between gap-2 border-t border-border bg-card p-4"><Link className={buttonVariants({ variant: 'outline', size: 'sm' })} to={`/${role}/classrooms/${encodeURIComponent(classroom.id)}?tab=classwork`}>{copy.openContext}</Link><Link className={buttonVariants({ size: 'sm' })} to={`/${role}/classrooms/${encodeURIComponent(classroom.id)}/classwork/${encodeURIComponent(activity.id)}`}>Open full activity <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link></footer>
  </>
}

function FeedbackForm({ entry, submission, role, onRelease }: { entry: ActivityEntry; submission: ClassroomSubmission; role: TeachingRole; onRelease: (entry: ActivityEntry, submission: ClassroomSubmission, evaluation: string, feedback: string) => void }) {
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [evaluationValue, setEvaluationValue] = useState(submission.evaluation ?? '')
  const [feedbackValue, setFeedbackValue] = useState(submission.feedback ?? '')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(''); setError('')
    const evaluation = evaluationValue.trim()
    const feedback = feedbackValue.trim()
    if (!evaluation || !feedback) { setError('Add an evaluation and learner-visible feedback before releasing.'); return }
    try { onRelease(entry, submission, evaluation, feedback); setNotice('Feedback released to this learner in the preview only. Nothing was saved to an account.') }
    catch { setError('The preview feedback couldn’t be released. Your entries are still here; try again.') }
  }
  return <form className="space-y-3 rounded-xl border border-border p-4" onSubmit={submit}>
    <h3 className="flex items-center gap-2 text-sm font-semibold"><ClipboardCheck aria-hidden="true" className="size-4" />Review & feedback</h3><Label htmlFor="activity-review-evaluation">{workspaceCopy[role].review}</Label><Input id="activity-review-evaluation" name="evaluation" value={evaluationValue} onChange={event => setEvaluationValue(event.target.value)} required maxLength={150} placeholder="Your review of this response" /><Label htmlFor="activity-review-feedback">Learner-visible feedback</Label><Textarea id="activity-review-feedback" name="feedback" value={feedbackValue} onChange={event => setFeedbackValue(event.target.value)} required maxLength={2000} placeholder="What worked well? What should the learner try next?" />
    <p className="rounded-lg bg-brand-soft p-3 text-xs leading-5 text-brand-soft-foreground"><strong>Audience: {submission.learnerName} only.</strong> Releasing shares both fields with this learner in the classroom preview. Keep private teaching or Session Notes out of this form.</p>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}{notice && <p role="status" className="text-xs text-brand-soft-foreground">{notice}</p>}<Button type="submit" size="sm">{submission.released ? 'Update released preview feedback' : 'Release preview feedback'}</Button>
  </form>
}
```

### `activity-workspace-model.ts`

Current file: `src/components/features/teaching-activities/activity-workspace-model.ts`

```ts
import { BookOpen, ClipboardCheck, FileText, FlaskConical, MessageSquare, Mic, Paperclip, Presentation, Wrench } from 'lucide-react'
import type { ActivityType, Classroom, ClassroomActivity, WorkspaceRole } from '@/components/features/classrooms/classroom-types'

export type TeachingRole = Exclude<WorkspaceRole, 'students'>
export type ActivityEntry = { key: string; classroom: Classroom; activity: ClassroomActivity }
export type ActivityFilter = 'all' | 'review' | 'Draft' | 'Published'
export type DueFilter = 'all' | 'upcoming' | 'past' | 'undated'
export const activityTypes: ActivityType[] = ['Quiz', 'Test', 'Assignment', 'File submission', 'Project', 'Presentation', 'Lab work', 'Practical activity', 'Discussion activity', 'Reading activity', 'Speaking practice']
export const questionTypes = ['Multiple choice', 'Multiple select', 'True or false', 'Identification', 'Short answer', 'Essay'] as const
export const activityKey = (classroomId: string, activityId: string) => JSON.stringify([classroomId, activityId])
export const pendingResponses = (activity: ClassroomActivity) => activity.submissions.filter(item => !item.released).length
export const activityIcon = (type: ActivityType) => ({ Quiz: ClipboardCheck, Test: ClipboardCheck, Assignment: FileText, 'File submission': Paperclip, Project: Wrench, Presentation, 'Lab work': FlaskConical, 'Practical activity': Wrench, 'Discussion activity': MessageSquare, 'Reading activity': BookOpen, 'Speaking practice': Mic })[type]

export const workspaceCopy = {
  educators: { title: 'Classwork & Assessments', eyebrow: 'Teaching workspace', description: 'Organize classwork, review responses, and return useful feedback.', context: 'Classroom', contexts: 'All classrooms', openContext: 'Open classroom', criteria: 'Assessment criteria', review: 'Evaluation', boundary: 'Classwork and feedback stay with their owning class. Official grades belong in the separate Gradebook workflow.' },
  esl: { title: 'Activities & Assessments', eyebrow: 'Language teaching', description: 'Prepare language practice, review responses, and guide the next step.', context: 'Learning group', contexts: 'All learning groups', openContext: 'Open learning group', criteria: 'Practice / assessment criteria', review: 'Teacher evaluation', boundary: 'Language practice does not automatically create a grade or proficiency level. Private teaching notes stay separate from released feedback.' },
  tutors: { title: 'Activities & Evaluations', eyebrow: 'Tutoring workspace', description: 'Prepare practice, review learner work, and share tutor feedback.', context: 'Learner / group', contexts: 'All learner groups', openContext: 'Open learner group', criteria: 'Practice / evaluation criteria', review: 'Tutor evaluation', boundary: 'Tutor evaluations are separate from school grades. Private Session Notes stay outside learner-visible feedback.' },
} satisfies Record<TeachingRole, { title: string; eyebrow: string; description: string; context: string; contexts: string; openContext: string; criteria: string; review: string; boundary: string }>

export function ownedPreviewClasses(classrooms: Classroom[], role: TeachingRole): Classroom[] {
  return classrooms.filter(item => item.isMock && item.access === 'owner' && item.ownerWorkspace === role)
}
export function activityEntries(classrooms: Classroom[]): ActivityEntry[] {
  return classrooms.flatMap(classroom => classroom.activities.map(activity => ({ key: activityKey(classroom.id, activity.id), classroom, activity })))
}
export function formatActivityDate(value: string): string {
  if (!value) return 'No due date'
  const date = new Date(`${value}T00:00:00`)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unavailable'
}
export function filterActivities(entries: ActivityEntry[], filters: { query: string; context: string; type: string; status: ActivityFilter; due: DueFilter; sort: 'due' | 'title' }, today = new Date()): ActivityEntry[] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).getTime()
  const query = filters.query.trim().toLowerCase()
  return entries.filter(({ activity, classroom }) => {
    const date = new Date(`${activity.dueDate}T00:00:00`).getTime()
    return (filters.context === 'all' || classroom.id === filters.context) &&
      (filters.type === 'all' || activity.type === filters.type) &&
      (filters.status === 'all' || (filters.status === 'review' ? pendingResponses(activity) > 0 : activity.status === filters.status)) &&
      (filters.due === 'all' || (filters.due === 'undated' ? !activity.dueDate : filters.due === 'past' ? date < start : date >= start && date < end)) &&
      `${activity.title} ${activity.instructions} ${activity.type} ${classroom.name} ${classroom.subject}`.toLowerCase().includes(query)
  }).sort((a, b) => filters.sort === 'title' ? a.activity.title.localeCompare(b.activity.title) :
    (a.activity.dueDate || '9999').localeCompare(b.activity.dueDate || '9999') || a.activity.title.localeCompare(b.activity.title))
}
```

### `teaching-activities-view.tsx`

Current file: `src/components/features/teaching-activities/teaching-activities-view.tsx`

```tsx
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
```

### `teaching-activities.test.tsx`

Current file: `src/components/features/teaching-activities/teaching-activities.test.tsx`

```tsx
import type { ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EducatorClassworkPage from '@/pages/dashboard/educators/classwork'
import EslClassworkPage from '@/pages/dashboard/esl/classwork'
import TutorClassworkPage from '@/pages/dashboard/tutors/classwork'
import { ClassroomPreviewProvider } from '@/components/features/classrooms/classroom-preview-provider'
import { ClassroomPrototypeContext, useClassroomPrototype, type ClassroomPrototypeContextValue } from '@/components/features/classrooms/classroom-prototype-context'
import { classroomPreviewStore } from '@/components/features/classrooms/classroom-preview-store'
import type { ClassroomSubmission } from '@/components/features/classrooms/classroom-types'
import { activityEntries, filterActivities, ownedPreviewClasses, workspaceCopy, type TeachingRole } from './activity-workspace-model'

const pages = { educators: <EducatorClassworkPage />, esl: <EslClassworkPage />, tutors: <TutorClassworkPage /> }
function Override({ children, changes }: { children: ReactNode; changes: Partial<ClassroomPrototypeContextValue> }) {
  const context = useClassroomPrototype()
  return <ClassroomPrototypeContext.Provider value={{ ...context, ...changes }}>{children}</ClassroomPrototypeContext.Provider>
}
function show(role: TeachingRole = 'educators', changes?: Partial<ClassroomPrototypeContextValue>) {
  return render(<MemoryRouter initialEntries={[`/${role}/classwork`]}><ClassroomPreviewProvider>{changes ? <Override changes={changes}>{pages[role]}</Override> : pages[role]}</ClassroomPreviewProvider></MemoryRouter>)
}
const submission: ClassroomSubmission = { id: 'response-one', learnerId: 'preview-learner', learnerName: 'Alex Rivera', response: 'My explanation uses an example from the lesson.', submittedAt: '2026-10-31T10:00:00.000Z', status: 'Submitted', released: false, score: 7 }
function addResponse() {
  classroomPreviewStore.update('algebra-coaching', 'tutors', classroom => ({ ...classroom, activities: classroom.activities.map((activity, index) => index === 0 ? { ...activity, submissions: [submission] } : activity) }), true)
}
beforeEach(() => classroomPreviewStore.reset())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('shared teaching activity workspace', () => {
  it.each(['educators', 'esl', 'tutors'] as const)('keeps %s records and labels scoped to that teaching role', role => {
    show(role)
    expect(screen.getByRole('heading', { name: workspaceCopy[role].title })).toBeTruthy()
    expect(screen.getByText(/Sample content and changes stay in this tab/)).toBeTruthy()
    const classLinks = screen.getAllByRole('link').filter(link => link.getAttribute('href')?.includes('/classrooms/'))
    expect(classLinks.length).toBeGreaterThan(0)
    expect(classLinks.every(link => link.getAttribute('href')?.startsWith(`/${role}/classrooms/`))).toBe(true)
    if (role !== 'esl') expect(screen.queryByRole('region', { name: 'Everyday English' })).toBeNull()
    if (role !== 'tutors') expect(screen.queryByRole('region', { name: 'Algebra coaching circle' })).toBeNull()
    if (role !== 'educators') expect(screen.queryByRole('region', { name: 'Human Computer Interaction · BSIT 3A' })).toBeNull()
  })

  it('combines search, group, type, and state filters across grid/list views', async () => {
    const user = userEvent.setup()
    show('esl')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Learning group' }), 'everyday-english')
    await user.click(screen.getByRole('tab', { name: 'Drafts' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Activity type' }), 'Reading activity')
    await user.click(screen.getByRole('button', { name: 'List view' }))
    expect(screen.getAllByRole('button', { name: 'Open activity Next session preparation · teacher draft' })).toHaveLength(1)
    await user.type(screen.getByRole('searchbox', { name: 'Search activities' }), 'not a match')
    expect(screen.getByRole('heading', { name: 'No activities match this view' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect((screen.getByRole('searchbox', { name: 'Search activities' }) as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('region', { name: 'English writing workshop' })).toBeTruthy()
  })

  it('creates in the selected owned preview group and keeps the shared classroom source updated', async () => {
    const user = userEvent.setup()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    show('tutors')
    await user.click(screen.getByRole('button', { name: 'Create preview activity' }))
    const form = within(screen.getByRole('dialog'))
    await user.selectOptions(form.getByLabelText('Learner / group'), 'coding-studio')
    await user.type(form.getByLabelText('Activity title'), 'Explain a debugging strategy')
    await user.type(form.getByLabelText('Learner instructions'), 'Choose a bug and explain how you isolated it.')
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    const entry = classroomPreviewStore.getSnapshot().find(item => item.id === 'coding-studio')!.activities[0]
    expect(entry).toMatchObject({ title: 'Explain a debugging strategy', status: 'Published', responseType: 'Text' })
    expect(classroomPreviewStore.getSnapshot().find(item => item.id === 'algebra-coaching')!.activities.some(item => item.title === entry.title)).toBe(false)
    expect(screen.getByRole('button', { name: 'Open activity Explain a debugging strategy' })).toBeTruthy()
    expect(writes).not.toHaveBeenCalled()
  })

  it('validates required instructions, quiz options and timer settings before creating a preview', async () => {
    const user = userEvent.setup()
    show('educators')
    await user.click(screen.getByRole('button', { name: 'Create preview activity' }))
    const form = within(screen.getByRole('dialog'))
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(await form.findByText('Use at least 3 characters for the title.')).toBeTruthy()
    await user.type(form.getByLabelText('Activity title'), 'Concept check')
    await user.type(form.getByLabelText('Learner instructions'), 'Select the best answer.')
    await user.selectOptions(form.getByLabelText('Activity type'), 'Quiz')
    await user.type(form.getByLabelText('Question prompt'), 'Which explanation is correct?')
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(await form.findByText('Add at least two comma-separated options.')).toBeTruthy()
    await user.type(form.getByLabelText('Answer options, separated by commas'), 'First, Second')
    fireEvent.change(form.getByLabelText('Duration (minutes)'), { target: { value: '0' } })
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(form.getByRole('alert').textContent).toContain('1')
    fireEvent.change(form.getByLabelText('Duration (minutes)'), { target: { value: '20' } })
    await user.click(form.getByRole('checkbox', { name: /Show leaderboard to students/ }))
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    const created = classroomPreviewStore.getSnapshot().flatMap(item => item.activities).find(item => item.title === 'Concept check')!
    expect(created.responseType).toBe('Quiz')
    expect(created.questions[0].options).toEqual(['First', 'Second'])
    expect(created.timing?.durationMinutes).toBe(20)
    expect(created.showLeaderboard).toBe(true)
  })

  it('does not create anything when the composer is canceled', async () => {
    const user = userEvent.setup()
    show('esl')
    const before = classroomPreviewStore.getSnapshot()
    await user.click(screen.getByRole('button', { name: 'Create preview activity' }))
    expect((within(screen.getByRole('dialog')).getByLabelText('Activity type') as HTMLSelectElement).value).toBe('Speaking practice')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(classroomPreviewStore.getSnapshot()).toBe(before)
  })

  it('shows instructions and owning-context links without inventing submissions', async () => {
    const user = userEvent.setup()
    show('esl')
    const group = within(screen.getByRole('region', { name: 'Everyday English' }))
    await user.click(group.getByRole('button', { name: 'Open activity Introduce your favorite place' }))
    const detail = within(screen.getByRole('dialog'))
    expect(detail.getByText(/Choose one idea from our speaking/)).toBeTruthy()
    expect(detail.getByRole('link', { name: 'Open full activity' }).getAttribute('href')).toBe('/esl/classrooms/everyday-english/classwork/everyday-english-activity')
    await user.click(detail.getByRole('tab', { name: /Responses/ }))
    expect(detail.getByRole('heading', { name: 'No preview responses yet' })).toBeTruthy()
    expect(detail.queryByRole('button', { name: 'Release preview feedback' })).toBeNull()
  })

  it('releases feedback only after the teacher acts, preserving the existing score and unrelated records', async () => {
    const user = userEvent.setup()
    addResponse()
    const untouched = classroomPreviewStore.getSnapshot().find(item => item.id === 'coding-studio')!
    show('tutors')
    await user.click(screen.getByRole('tab', { name: 'To review' }))
    await user.click(screen.getByRole('button', { name: 'Open activity Guided practice reflection' }))
    const detail = within(screen.getByRole('dialog'))
    expect(detail.getByText('My explanation uses an example from the lesson.')).toBeTruthy()
    await user.type(detail.getByLabelText('Tutor evaluation'), 'Clear reasoning')
    await user.type(detail.getByLabelText('Learner-visible feedback'), 'Add another worked example next time.')
    const original = classroomPreviewStore.getSnapshot().find(item => item.id === 'algebra-coaching')!.activities[0].submissions[0]
    expect(original.released).toBe(false)
    await user.click(detail.getByRole('button', { name: 'Release preview feedback' }))
    const released = classroomPreviewStore.getSnapshot().find(item => item.id === 'algebra-coaching')!.activities[0].submissions[0]
    expect(released).toMatchObject({ released: true, score: 7, evaluation: 'Clear reasoning', feedback: 'Add another worked example next time.' })
    expect(classroomPreviewStore.getSnapshot().find(item => item.id === 'coding-studio')).toBe(untouched)
    expect(detail.getByRole('status').textContent).toContain('preview only')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('heading', { name: 'No preview responses to review' })).toBeTruthy()
  })

  it('does not fall back to sample records or zero counts when connected activity services are unavailable', () => {
    show('educators', { connectedModeEnabled: true })
    expect(screen.getByRole('heading', { name: 'Activity service not connected' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Open activity/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Create preview activity' }).hasAttribute('disabled')).toBe(true)
    expect(within(screen.getByRole('group', { name: 'Preview activity summary' })).getAllByText('—')).toHaveLength(4)
  })

  it('offers retry without printing backend error details', async () => {
    const retry = vi.fn()
    show('esl', { classroomsError: 'raw sensitive server error', reloadClassrooms: retry })
    expect(screen.queryByText('raw sensitive server error')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading groups' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})

describe('activity filtering and ownership', () => {
  it('does not expose other roles, non-owner classes or connected records as classroom previews', () => {
    const source = classroomPreviewStore.getSnapshot()
    const outsider = { ...source[0], access: 'student' as const }
    const connected = { ...source[0], isMock: false }
    expect(ownedPreviewClasses([outsider, connected, source.find(item => item.ownerWorkspace === 'tutors')!], 'educators')).toEqual([])
  })
  it('filters due dates using local calendar days and places undated activities last', () => {
    const classroom = classroomPreviewStore.getSnapshot()[0]
    const activity = classroom.activities[0]
    const entries = activityEntries([{ ...classroom, activities: [{ ...activity, id: 'past', dueDate: '2026-10-30' }, { ...activity, id: 'next', dueDate: '2026-11-02' }, { ...activity, id: 'undated', dueDate: '' }] }])
    const filters = { query: '', context: 'all', type: 'all', status: 'all' as const, due: 'all' as const, sort: 'due' as const }
    expect(filterActivities(entries, { ...filters, due: 'upcoming' }, new Date(2026, 9, 31, 12)).map(item => item.activity.id)).toEqual(['next'])
    expect(filterActivities(entries, { ...filters, due: 'past' }, new Date(2026, 9, 31, 12)).map(item => item.activity.id)).toEqual(['past'])
    expect(filterActivities(entries, filters).at(-1)?.activity.id).toBe('undated')
  })
})
```

<!-- END GENERATED CURRENT SOURCE -->
