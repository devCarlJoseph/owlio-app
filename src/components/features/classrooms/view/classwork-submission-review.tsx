import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { Classwork, Submission } from '@/services/api/academic.service'
import { getClassworkSubmission, type ClassworkQuestion } from '@/services/api/classwork-workspace.service'
import { getClassworkAnswerScore, getClassworkEvaluation, getClassworkRubric, releaseClassworkEvaluation, saveClassworkEvaluation, type ClassworkEvaluation } from '@/services/api/classwork-grading.service'
import type { ReviewSelection } from '../context/classwork-review-context'
import { formatClassworkDate } from '../utils/classwork-deadline'

type ReviewData = {
  submission: Submission; evaluation: ClassworkEvaluation | null
  answerScore: Awaited<ReturnType<typeof getClassworkAnswerScore>> | null
  rubric: Awaited<ReturnType<typeof getClassworkRubric>>['criteria']
}

export function ClassworkSubmissionReview({ work, questions, selection, onClose }: {
  work: Classwork; questions: ClassworkQuestion[]; selection: ReviewSelection; onClose: () => void
}) {
  const [data, setData] = useState<ReviewData | null>(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getClassworkSubmission(selection.id, controller.signal), getClassworkEvaluation(selection.id, controller.signal),
      questions.length ? getClassworkAnswerScore(selection.id, controller.signal) : Promise.resolve(null),
      work.maxPoints !== null ? getClassworkRubric(work.id, controller.signal) : Promise.resolve({ criteria: null }),
    ]).then(([submission, evaluation, answerScore, rubric]) => {
      if (controller.signal.aborted) return
      if (submission.classworkId !== work.id || submission.studentId !== selection.studentId || submission.status !== 'SUBMITTED') throw new Error('This submission is not available for review in this activity.')
      if (evaluation && evaluation.submissionId !== submission.id) throw new Error('The grade does not belong to this submission.')
      if (answerScore && answerScore.id !== submission.id) throw new Error('The answer-key check does not belong to this submission.')
      setData({ submission, evaluation, answerScore, rubric: rubric.criteria }); setError('')
    }).catch(cause => { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Could not load this submission for grading.')) })
    return () => controller.abort()
  }, [selection.id, selection.studentId, work.id, work.maxPoints, questions.length, revision])
  return <section className="space-y-5" aria-label={`Review ${selection.name}`}>
    <header className="flex flex-wrap items-center justify-between gap-2"><Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft />All submissions</Button><Button variant="ghost" size="sm" onClick={() => { setData(null); setError(''); setRevision(value => value + 1) }}>Reload saved grade</Button></header>
    <div><h4 className="break-words text-base font-semibold">{selection.name}</h4><p className="mt-1 text-xs text-muted-foreground">{work.title}</p></div>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : !data ? <p role="status" className="text-sm text-muted-foreground">Loading submitted answers and grade…</p> : <>
      <p className="text-xs text-muted-foreground">Attempt {data.submission.attempt} · Submitted {formatClassworkDate(data.submission.submittedAt)}</p>
      {data.answerScore && <p className="rounded-xl bg-brand-soft p-3 text-sm font-medium text-brand-soft-foreground">Answer-key check: {data.answerScore.correct} of {data.answerScore.total} correct<span className="mt-1 block text-xs font-normal">This is a review aid. Save and release the grade separately.</span></p>}
      <ol className="space-y-5">{questions.map((question, index) => {
        const chosen = data.submission.choiceAnswers.find(answer => answer.questionId === question.id)
        const hasKey = question.answerIndex !== undefined
        const correct = hasKey && chosen?.optionIndex === question.answerIndex
        return <li key={question.id} className="space-y-3 rounded-xl border border-border p-4"><h5 className="break-words text-sm font-semibold">{index + 1}. {question.prompt}</h5><p className="flex items-center gap-2 text-xs font-medium">{hasKey ? correct ? <><Check aria-hidden="true" className="size-4 text-brand" />Correct</> : <><X aria-hidden="true" className="size-4 text-destructive" />{chosen ? 'Incorrect' : 'Unanswered'}</> : 'Answer key unavailable'}</p><dl className="space-y-2 text-sm"><div><dt className="text-xs text-muted-foreground">Student answer</dt><dd className="mt-1 break-words">{chosen ? question.options[chosen.optionIndex] ?? 'Unavailable answer' : 'No answer'}</dd></div><div><dt className="text-xs text-muted-foreground">Correct answer</dt><dd className="mt-1 break-words">{hasKey ? question.options[question.answerIndex!] : 'Unavailable'}</dd></div></dl></li>
      })}</ol>
      {data.submission.textAnswer && <section className="space-y-2 rounded-xl border border-border p-4"><h5 className="text-sm font-semibold">Written response</h5><p className="whitespace-pre-wrap break-words text-sm leading-6">{data.submission.textAnswer}</p></section>}
      {data.submission.files.length > 0 && <p className="text-xs text-muted-foreground">This submission has {data.submission.files.length} attachment(s). Attachment review is not available here.</p>}
      <GradeEditor key={revision} work={work} data={data} />
    </>}
  </section>
}

function GradeEditor({ work, data }: { work: Classwork; data: ReviewData }) {
  const [evaluation, setEvaluation] = useState(data.evaluation)
  const [score, setScore] = useState(data.evaluation?.score?.toString() ?? '')
  const [feedback, setFeedback] = useState(data.evaluation?.feedback ?? '')
  const criteria = data.evaluation?.rubric ?? data.rubric ?? []
  const [points, setPoints] = useState<Record<string, string>>(() => Object.fromEntries((data.evaluation?.criterionScores ?? []).map(item => [item.criterionId, String(item.points)])))
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const released = evaluation?.status === 'RELEASED'
  const maximum = evaluation ? evaluation.maxPoints : work.maxPoints
  const dirty = !evaluation || score !== (evaluation.score?.toString() ?? '') || feedback !== evaluation.feedback || criteria.some(item => (points[item.id] ?? '') !== String(evaluation.criterionScores?.find(value => value.criterionId === item.id)?.points ?? ''))

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current || released) return
    setError(''); setNotice('')
    const value = score.trim() === '' ? null : Number(score)
    if (maximum !== null && value !== null && (!Number.isInteger(value) || value < 0 || value > maximum)) { setError(`Enter a whole-number score from 0 to ${maximum}.`); return }
    const criterionScores = criteria.filter(item => points[item.id]?.trim()).map(item => ({ criterionId: item.id, points: Number(points[item.id]) }))
    if (criterionScores.some(item => !Number.isInteger(item.points) || item.points < 0 || item.points > criteria.find(criterion => criterion.id === item.criterionId)!.maxPoints)) { setError('Each criterion needs a whole-number score within its maximum.'); return }
    lock.current = true; setBusy(true)
    try {
      const saved = await saveClassworkEvaluation(data.submission.id, { score: maximum === null ? null : value, feedback, expectedVersion: evaluation?.version ?? 0, ...(criteria.length ? { criterionScores } : {}) })
      setEvaluation(saved); setScore(saved.score?.toString() ?? ''); setFeedback(saved.feedback)
      setPoints(Object.fromEntries((saved.criterionScores ?? []).map(item => [item.criterionId, String(item.points)])))
      setNotice('Grade draft saved. It is private until released.')
    } catch (cause) { setError(getApiErrorMessage(cause, 'Could not save this grade. Your edits are still here.')) }
    finally { lock.current = false; setBusy(false) }
  }

  async function release() {
    if (lock.current || !evaluation || dirty || released) return
    if ((maximum !== null && evaluation.score === null) || (maximum === null && !evaluation.feedback.trim())) { setError('Save a complete score or feedback before releasing.'); return }
    if (criteria.length && (evaluation.criterionScores?.length !== criteria.length || evaluation.criterionScores.reduce((sum, item) => sum + item.points, 0) !== evaluation.score)) { setError('Complete rubric scores must add up to the grade before release.'); return }
    lock.current = true; setBusy(true); setError(''); setNotice('')
    try { const result = await releaseClassworkEvaluation(data.submission.id, evaluation.version); setEvaluation(result); setNotice('Grade released to the student.') }
    catch (cause) { setError(getApiErrorMessage(cause, 'Release was not confirmed. Reload the saved grade before retrying.')) }
    finally { lock.current = false; setBusy(false) }
  }

  return <form onSubmit={save} className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
    <header><h5 className="text-sm font-semibold">{released ? 'Released grade' : 'Grade and feedback'}</h5><p className="mt-1 text-xs leading-5 text-muted-foreground">{released ? 'This result is visible to the student and is locked here.' : 'Saving keeps this grade private. Release it only after reviewing the submitted answers.'}</p></header>
    {maximum === null ? <p className="text-xs leading-5 text-muted-foreground">This activity was published as feedback-only. Its maximum points cannot be changed now. Set maximum points on a new draft to enable numeric grades.</p> : <div className="space-y-2"><Label htmlFor="review-score">Score out of {maximum}</Label><Input id="review-score" type="number" min={0} max={maximum} step={1} value={score} onChange={event => setScore(event.target.value)} disabled={busy || released} />{data.answerScore && data.answerScore.total === maximum && criteria.length === 0 && !released && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setScore(String(data.answerScore!.correct))}>Use answer-key count · 1 point per question</Button>}</div>}
    {criteria.map(item => <div key={item.id} className="space-y-2"><Label htmlFor={`criterion-${item.id}`}>{item.label} · out of {item.maxPoints}</Label><Input id={`criterion-${item.id}`} type="number" min={0} max={item.maxPoints} step={1} value={points[item.id] ?? ''} disabled={busy || released} onChange={event => setPoints(current => ({ ...current, [item.id]: event.target.value }))} /></div>)}
    <div className="space-y-2"><Label htmlFor="review-feedback">Feedback for the student</Label><Textarea id="review-feedback" maxLength={6000} value={feedback} onChange={event => setFeedback(event.target.value)} disabled={busy || released} className="min-h-28" /></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{notice && <p role="status" className="text-sm">{notice}</p>}
    {!released && <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy} className="bg-brand text-brand-foreground hover:bg-brand/90">Save grade draft</Button><Button type="button" variant="outline" disabled={busy || dirty || !evaluation} onClick={() => void release()}>Release grade to student</Button></div>}
  </form>
}
