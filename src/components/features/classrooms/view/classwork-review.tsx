import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getClassworkSubmission, listClassworkLearners, listClassworkSubmissions, type ClassworkQuestion } from '@/services/api/classwork-workspace.service'
import type { Submission } from '@/services/api/academic.service'
import { formatClassworkDate } from '../utils/classwork-deadline'

type Review = { learners: Awaited<ReturnType<typeof listClassworkLearners>>; submissions: Awaited<ReturnType<typeof listClassworkSubmissions>> }

export function ClassworkReview({ classroomId, classworkId, questions, closed }: { classroomId: string; classworkId: string; questions: ClassworkQuestion[]; closed: boolean }) {
  const [data, setData] = useState<Review | null>(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([listClassworkLearners(classroomId, controller.signal), listClassworkSubmissions(classworkId, controller.signal)]).then(([learners, submissions]) => {
      if (!controller.signal.aborted) { setData({ learners, submissions }); setError('') }
    }).catch(cause => { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Could not load submissions.')) })
    return () => controller.abort()
  }, [classroomId, classworkId, revision])
  return <section aria-labelledby="classwork-review-heading" className="space-y-4 border-t border-border pt-5"><header className="flex items-center justify-between gap-2"><h4 id="classwork-review-heading" className="text-sm font-semibold">Student work</h4><Button variant="ghost" size="sm" onClick={() => { setData(null); setError(''); setRevision(value => value + 1) }}>Refresh submissions</Button></header>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : !data ? <p role="status" className="text-sm text-muted-foreground">Loading student work…</p> : data.learners.length === 0 ? <p className="text-sm text-muted-foreground">No enrolled students.</p> : <ul className="divide-y divide-border">{data.learners.map(learner => {
      const submission = data.submissions.filter(item => item.studentId === learner.studentId && item.submittedAt).sort((a, b) => b.attempt - a.attempt)[0]
      return <li key={learner.studentId} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span className="break-words">{learner.name}</span><div className="flex items-center gap-2"><span className={submission ? 'text-muted-foreground' : closed ? 'text-destructive' : 'text-muted-foreground'}>{submission ? 'Submitted' : closed ? 'Missing' : 'Not submitted'}</span>{submission && <Button size="sm" variant="outline" onClick={() => setSelected(submission.id)}>Review {learner.name}</Button>}</div></li>
    })}</ul>}
    {selected && <SubmissionReview key={selected} id={selected} questions={questions} onClose={() => setSelected(null)} />}
  </section>
}

function SubmissionReview({ id, questions, onClose }: { id: string; questions: ClassworkQuestion[]; onClose: () => void }) {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getClassworkSubmission(id, controller.signal).then(value => { if (!controller.signal.aborted) setSubmission(value) }).catch(cause => { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Could not read this submission.')) })
    return () => controller.abort()
  }, [id])
  return <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4"><header className="flex items-center justify-between"><h5 className="text-sm font-semibold">Submitted response</h5><Button size="sm" variant="ghost" onClick={onClose}>Close review</Button></header>{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : !submission ? <p role="status" className="text-sm">Loading response…</p> : <><p className="text-xs text-muted-foreground">Submitted {formatClassworkDate(submission.submittedAt)}</p>{submission.textAnswer && <p className="whitespace-pre-wrap break-words text-sm leading-6">{submission.textAnswer}</p>}<ol className="space-y-3">{questions.map(question => {
    const choice = submission.choiceAnswers.find(answer => answer.questionId === question.id)
    return <li key={question.id} className="text-sm"><p className="font-medium">{question.prompt}</p><p className="mt-1 text-muted-foreground">{choice ? question.options[choice.optionIndex] ?? 'Unavailable answer' : 'No answer'}</p></li>
  })}</ol>{submission.files.length > 0 && <p className="text-xs text-muted-foreground">This submission also contains {submission.files.length} attachment(s). Attachment review is not available here.</p>}</>}</div>
}
