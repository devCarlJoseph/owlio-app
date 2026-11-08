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
