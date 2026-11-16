import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { listClassworkLearners, listClassworkSubmissions, type ClassworkQuestion } from '@/services/api/classwork-workspace.service'
import type { Classwork } from '@/services/api/academic.service'
import { formatClassworkDate } from '../utils/classwork-deadline'
import { useClassworkReview } from '../context/classwork-review-context'
import { ClassworkSubmissionReview } from './classwork-submission-review'

type Review = { learners: Awaited<ReturnType<typeof listClassworkLearners>>; submissions: Awaited<ReturnType<typeof listClassworkSubmissions>> }

export function ClassworkReview({ work, questions, closed }: { work: Classwork; questions: ClassworkQuestion[]; closed: boolean }) {
  const { selected, select } = useClassworkReview()
  const [data, setData] = useState<Review | null>(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([listClassworkLearners(work.classroomId, controller.signal), listClassworkSubmissions(work.id, controller.signal)]).then(([learners, submissions]) => {
      if (!controller.signal.aborted) { setData({ learners, submissions }); setError('') }
    }).catch(cause => { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Could not load submissions.')) })
    return () => controller.abort()
  }, [work.classroomId, work.id, revision])
  if (selected) return <ClassworkSubmissionReview key={selected.id} work={work} questions={questions} selection={selected} onClose={() => select(null)} />
  const submitted = data?.submissions.filter(item => item.submittedAt) ?? []
  const submittedIds = new Set(submitted.map(item => item.studentId))
  const pending = data?.learners.filter(learner => !submittedIds.has(learner.studentId)) ?? []
  const names = new Map(data?.learners.map(learner => [learner.studentId, learner.name]))
  return <section aria-labelledby="classwork-review-heading" className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-2"><div><h4 id="classwork-review-heading" className="text-sm font-semibold">Student submissions</h4><p className="mt-1 text-xs text-muted-foreground">Review submitted answers, save a private grade, and release it when ready.</p></div><Button variant="ghost" size="sm" onClick={() => { setData(null); setError(''); setRevision(value => value + 1) }}>Refresh submissions</Button></header>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : !data ? <p role="status" className="text-sm text-muted-foreground">Loading student work…</p> : <>
      <h5 className="text-xs font-semibold text-muted-foreground">Submitted · {submitted.length}</h5>
      {!submitted.length ? <p className="text-sm text-muted-foreground">No student submissions yet.</p> : <ul className="divide-y divide-border">{submitted.map(submission => {
        const name = names.get(submission.studentId) ?? 'Former class member'
        return <li key={submission.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div className="min-w-0"><p className="break-words font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">Attempt {submission.attempt} · {formatClassworkDate(submission.submittedAt)}{submission.returnedAt ? ' · Returned for revision' : ''}</p></div><Button size="sm" variant="outline" aria-label={`Review ${name}, attempt ${submission.attempt}`} onClick={() => select({ id: submission.id, studentId: submission.studentId, name })}>Review submission</Button></li>
      })}</ul>}
      {pending.length > 0 && <><h5 className="pt-3 text-xs font-semibold text-muted-foreground">{closed ? 'Missing' : 'Not submitted'} · {pending.length}</h5><ul className="divide-y divide-border">{pending.map(learner => <li key={learner.studentId} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{learner.name}</span><span className={closed ? 'text-destructive' : 'text-muted-foreground'}>{closed ? 'Missing' : 'Not submitted'}</span></li>)}</ul></>}
      {data.learners.length === 0 && !submitted.length && <p className="text-sm text-muted-foreground">No enrolled students.</p>}
    </>}
  </section>
}
