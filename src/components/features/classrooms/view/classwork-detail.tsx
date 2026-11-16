import { ClassworkDetailSkeleton } from '../ui/classroom-skeletons'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, Clock3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClassworkReview } from '../context/classwork-review-context'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { Submission } from '@/services/api/academic.service'
import { addClassworkQuestion, loadClassroomWork, publishClassroomWork, removeClassworkQuestion, saveClassworkResponse, submitClassworkResponse, updateClassroomWork, type ClassworkEntry, type QuestionInput } from '@/services/api/classwork-workspace.service'
import { ClassworkFields, QuestionEditor } from '../forms/classwork-editor'
import { useClassworkClock } from '../hooks/use-classwork-clock'
import { classworkClosed, classworkStatus, formatClassworkDate, readClassworkFields } from '../utils/classwork-deadline'
import { ClassworkReview } from './classwork-review'

const finishClass = 'border border-brand bg-brand text-brand-foreground hover:bg-brand/90'

export function ClassworkDetail({ classroomId, id, owned, notice, onBack, onEntryChange }: { classroomId: string; id: string; owned: boolean; notice?: string; onBack: () => void; onEntryChange?: (entry: ClassworkEntry) => void }) {
  const [entry, setEntry] = useState<ClassworkEntry | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    loadClassroomWork(classroomId, id, owned, controller.signal).then(result => {
      if (!controller.signal.aborted) { setEntry(result); setError('') }
    }).catch(cause => { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Could not load classwork.')) })
    return () => controller.abort()
  }, [classroomId, id, owned, attempt])
  return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft />All classwork</Button><Button variant="ghost" size="sm" onClick={() => { setEntry(null); setError(''); setAttempt(value => value + 1) }}>Reload saved work</Button></div>
    {notice && <p role="status" className="rounded-lg border border-border bg-muted p-3 text-sm">{notice}</p>}
    {error ? <div role="alert" className="space-y-3 rounded-xl border border-border bg-card p-5"><p>{error}</p><Button variant="outline" onClick={() => { setError(''); setAttempt(value => value + 1) }}>Retry classwork</Button></div> : entry ? <ClassworkContent entry={entry} owned={owned} onEntryChange={onEntryChange} /> : <ClassworkDetailSkeleton />}
  </div>
}

function ClassworkContent({ entry, owned, onEntryChange }: { entry: ClassworkEntry; owned: boolean; onEntryChange?: (entry: ClassworkEntry) => void }) {
  const review = useClassworkReview()
  const [work, setWork] = useState(entry.work)
  const [questions, setQuestions] = useState(entry.questions)
  const [submission, setSubmission] = useState(entry.submission)
  const [text, setText] = useState(entry.submission?.textAnswer ?? '')
  const [choices, setChoices] = useState<Submission['choiceAnswers']>(entry.submission?.choiceAnswers ?? [])
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [serverClosed, setServerClosed] = useState(false)
  const now = useClassworkClock()
  const closed = serverClosed || classworkClosed(work.dueAt, now)
  const draft = work.status === 'DRAFT'
  const submitted = submission?.status === 'SUBMITTED'
  const quiz = questions.questions.length > 0
  const locked = busy || closed || submitted || owned
  useEffect(() => { onEntryChange?.({ work, questions, submission }) }, [work, questions, submission, onEntryChange])

  async function run(action: () => Promise<void>) {
    if (pending.current) return
    pending.current = true; setBusy(true); setError(''); setNotice('')
    try { await action() }
    catch (cause) {
      setError(getApiErrorMessage(cause, 'The operation could not be completed. Try again.'))
      if (typeof cause === 'object' && cause !== null && 'response' in cause) {
        const response = cause.response as { data?: { code?: string } } | undefined
        if (response?.data?.code === 'CLASSWORK_CLOSED') setServerClosed(true)
      }
    } finally { pending.current = false; setBusy(false) }
  }

  async function saveMetadata(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    await run(async () => {
      const result = await updateClassroomWork(work.id, readClassworkFields(data))
      setWork(result); setQuestions(current => ({ ...current, version: result.version })); setEditing(false); setNotice('Draft changes saved.')
    })
  }

  async function addQuestion(input: QuestionInput) {
    let saved = false
    await run(async () => {
      const result = await addClassworkQuestion(work.id, questions.version, input)
      setQuestions(current => ({ version: result.version, questions: [...current.questions, { ...input, id: result.question.id }] }))
      setNotice('Question saved.'); saved = true
    })
    return saved
  }

  async function saveResponse(final: boolean) {
    await run(async () => {
      if (classworkClosed(work.dueAt) || serverClosed) throw new Error('The deadline has passed. Submissions are no longer accepted.')
      if (final && quiz && choices.length === 0 && !text.trim()) throw new Error('Answer at least one question before finishing the quiz.')
      if (final && !quiz && !text.trim()) throw new Error('Write your response before submitting the assessment.')
      const saved = await saveClassworkResponse(work.id, submission?.version ?? 0, text, choices)
      setSubmission(saved)
      if (!final) { setNotice('Draft saved. Remember to submit before the deadline.'); return }
      setNotice('Your answers were saved as a draft.')
      if (classworkClosed(work.dueAt)) throw new Error('The deadline passed before submission. Your draft is saved, but this activity is Missing.')
      const result = await submitClassworkResponse(work.id, saved.version)
      setSubmission(result); setNotice('Your classwork was submitted.')
    })
  }

  const state = owned ? draft ? 'Draft' : closed ? 'Closed' : 'Published' : closed && !submitted ? 'Missing' : classworkStatus(work, submission, now)
  return <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card" aria-labelledby="classwork-title"><Tabs value={owned ? review.panel : 'form'} onValueChange={value => review.setPanel(value === 'student-work' ? 'student-work' : 'form')} className="gap-0">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-2"><Badge className="bg-brand-soft text-brand-soft-foreground">{quiz ? 'Quiz' : 'Assessment'}</Badge><span className="text-xs text-muted-foreground">{state}</span></div>
      {owned ? <div className="flex flex-wrap gap-2">{draft && <><Button size="sm" variant="outline" disabled={busy || editing} onClick={() => setEditing(true)}>Edit details</Button><Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90" disabled={busy || editing || !work.dueAt || closed} onClick={() => void run(async () => { if (!work.dueAt || classworkClosed(work.dueAt)) throw new Error('Set a future closing date before publishing.'); await publishClassroomWork(work.id); setWork(current => ({ ...current, status: 'PUBLISHED' })); setNotice('Classwork published to this classroom.') })}>Publish to class</Button></>}</div> : <Button size="sm" className={finishClass} disabled={locked} onClick={() => void saveResponse(true)}>{submitted ? <><Check />Submitted</> : quiz ? 'Finish quiz' : 'Submit assessment'}</Button>}
    </header>
    {owned && <TabsList aria-label="Activity workspace" variant="line" className="mx-5 mt-4 border-b border-border sm:mx-7"><TabsTrigger value="form">{quiz ? 'Quiz form' : 'Assessment form'}</TabsTrigger><TabsTrigger value="student-work" disabled={draft}>Student work</TabsTrigger></TabsList>}
    <TabsContent value="form" keepMounted className="space-y-6 px-5 py-6 sm:px-7">
      <div><h3 id="classwork-title" className="break-words text-xl font-semibold tracking-tight">{work.title}</h3><p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Clock3 aria-hidden="true" className="size-4" />{work.dueAt ? `Closes ${formatClassworkDate(work.dueAt)}` : 'No deadline set'}<span>({Intl.DateTimeFormat().resolvedOptions().timeZone})</span></p></div>
      <div aria-live="polite" className="space-y-2">{error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}{notice && <p role="status" className="rounded-lg bg-muted p-3 text-sm">{notice}</p>}</div>
      {closed && !draft && <p role="status" className="rounded-lg border border-border bg-muted/60 p-3 text-sm">{submitted ? 'This activity is closed. Your submitted work is available below.' : owned ? 'This activity is closed. Further submissions are not accepted.' : 'Missing activity. The deadline has passed and submissions are no longer accepted. Your saved work is available below.'}</p>}
      {draft && !editing && <p className="text-xs text-muted-foreground">Only you can see this draft. {work.dueAt && closed ? 'Edit its closing date before publishing.' : 'Review the instructions and questions before publishing.'}</p>}
      {editing ? <form onSubmit={saveMetadata} className="space-y-4"><ClassworkFields work={work} disabled={busy} /><div className="flex gap-2"><Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90" disabled={busy}>Save details</Button><Button type="button" variant="ghost" disabled={busy} onClick={() => setEditing(false)}>Cancel</Button></div></form> : <section className="space-y-2 border-b border-border pb-5"><h4 className="text-sm font-semibold">Instructions</h4><p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{work.instructions}</p></section>}
      <div className="space-y-6">{questions.questions.map((question, index) => <div key={question.id} className="space-y-2"><fieldset disabled={locked} className="min-w-0 space-y-3"><legend className="mb-3 w-full break-words text-sm font-semibold">{index + 1}. {question.prompt}</legend><div className="grid gap-3 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={optionIndex} className={`flex min-h-11 min-w-0 items-center gap-3 rounded-xl border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${choices.some(answer => answer.questionId === question.id && answer.optionIndex === optionIndex) ? 'border-brand/40 bg-brand-soft text-brand-soft-foreground' : 'border-border bg-card'} ${locked ? 'cursor-default' : 'cursor-pointer hover:border-brand/50'}`}><input className="sr-only" type="radio" name={`answer-${question.id}`} value={optionIndex} checked={choices.some(answer => answer.questionId === question.id && answer.optionIndex === optionIndex)} onChange={() => setChoices(current => [...current.filter(answer => answer.questionId !== question.id), { questionId: question.id, optionIndex }])} /><span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded bg-black/5">{String.fromCharCode(65 + optionIndex)}</span><span className="min-w-0 break-words">{option}</span>{owned && question.answerIndex === optionIndex && <Check aria-label="Correct answer" className="ml-auto size-4 shrink-0 text-brand" />}</label>)}</div></fieldset>
        {owned && draft && <Button type="button" variant="ghost" size="sm" disabled={busy || editing} onClick={() => void run(async () => { const result = await removeClassworkQuestion(work.id, question.id, questions.version); setQuestions(current => ({ version: result.version, questions: current.questions.filter(item => item.id !== question.id) })); setNotice('Question removed.') })}><Trash2 />Remove question {index + 1}</Button>}
      </div>)}</div>
      {owned && draft && !editing && (Math.max(0, ...questions.questions.map(question => question.position)) < 50 ? <QuestionEditor position={Math.max(0, ...questions.questions.map(question => question.position)) + 1} disabled={busy} onSave={addQuestion} /> : <p className="text-xs text-muted-foreground">Maximum question position reached. Remove the last question to add another.</p>)}
      {!owned && !quiz && <div className="space-y-3"><label htmlFor="assessment-answer" className="text-sm font-semibold">Your response</label><Textarea id="assessment-answer" value={text} onChange={event => setText(event.target.value)} disabled={locked} maxLength={6000} className="min-h-48" placeholder="Write your assessment response…" /></div>}
      {!owned && !submitted && !closed && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><p className="max-w-xs text-xs leading-5 text-muted-foreground">Drafts are not submissions. Finish and submit before the closing time.</p><Button variant="outline" disabled={busy} onClick={() => void saveResponse(false)}>{busy ? 'Saving…' : 'Save draft'}</Button></footer>}
      {submitted && <p className="text-xs text-muted-foreground">Submitted {formatClassworkDate(submission.submittedAt)}{submission.isLate ? ' · Previously accepted late' : ''}</p>}

    </TabsContent>{owned && !draft && <TabsContent value="student-work" keepMounted className="px-5 py-6 sm:px-7"><ClassworkReview work={work} questions={questions.questions} closed={closed} /></TabsContent>}</Tabs>
  </section>
}
