import { useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useClassroomPrototype } from './classroom-prototype-context'
import { ClassroomPreviewNotice } from './classroom-preview-notice'
import { QuizWorkspace } from './quiz-workspace'
import { UnderDevelopment } from './classroom-ui'

export function ClassroomActivityView() {
  return API_INTEGRATION_ENABLED ? <ConnectedActivityView /> : <PreviewActivityView />
}

function ConnectedActivityView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  return <div className="space-y-4"><Link className="underline" to={'/' + role + '/classrooms'}>Back to classrooms</Link>
    <UnderDevelopment title="Classroom activities are not available yet" /></div>
}

function PreviewActivityView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { classroomId, activityId } = useParams()
  const { getClassroom, submitActivity, reviewSubmission, currentLearnerId } = useClassroomPrototype()
  const [notice, setNotice] = useState('')
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const activity = classroom?.activities.find(item => item.id === activityId)
  const back = `/${role}/classrooms${classroom ? `/${classroom.id}?tab=classwork` : ''}`
  if (!classroom || !activity) return <section className="space-y-3 rounded-xl border p-6"><h2>Activity unavailable</h2><p>This activity is not available in your classroom view.</p><Link className="underline" to={back}>Back to classroom</Link></section>
  const student = role === 'students'
  const submission = activity.submissions.find(item => item.learnerId === currentLearnerId)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = String(form.get('response') ?? '').trim()
    if (!response) return
    submitActivity(classroom.id, activity.id, response)
    setNotice('Response submitted in this preview tab only. Nothing was uploaded or saved to an account.')
  }
  return <div className="mx-auto max-w-4xl space-y-5">
    <Link className="inline-block rounded text-sm underline outline-none focus-visible:ring-2 focus-visible:ring-ring" to={back}>Back to classroom classwork</Link>
    <ClassroomPreviewNotice role={role} classroomId={classroom.id} />
    <header className="rounded-2xl border border-border bg-card p-6"><p className="text-xs font-medium text-brand-soft-foreground">{classroom.name} · {activity.type} · {activity.status}</p><h2 className="mt-2 text-2xl font-semibold">{activity.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{activity.instructions}</p><p className="mt-3 text-xs text-muted-foreground">{activity.dueDate ? `Due ${activity.dueDate} · ` : ''}Preview activity · individual responses are visible to your instructor.</p></header>
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {student && activity.responseType === 'Quiz' ? <QuizWorkspace classroom={classroom} activity={activity} /> : student ? <section className="rounded-2xl border border-border bg-card p-6">
      {submission ? <div className="space-y-3"><h3 className="font-semibold">Your response · {submission.status}</h3><p className="whitespace-pre-wrap break-words text-sm">{submission.response}</p>{submission.released ? <div className="rounded-lg bg-brand-soft p-4 text-sm"><p className="font-semibold">{submission.evaluation}</p><p className="mt-2 whitespace-pre-wrap">{submission.feedback}</p></div> : <p className="text-sm text-muted-foreground">Your instructor has not released feedback yet.</p>}</div> : <form onSubmit={submit} className="space-y-4"><Label htmlFor="activity-response">{activity.responseType === 'Link' ? 'Your response link' : activity.responseType === 'File' ? 'File description · preview only' : 'Your response'}</Label>{activity.responseType === 'Link' ? <Input id="activity-response" name="response" type="url" required /> : <Textarea id="activity-response" name="response" maxLength={5000} required className="min-h-40" />}<p className="text-xs text-muted-foreground">Shared only with your instructor in this preview. File uploads and account saving are unavailable.</p><Button type="submit">Submit preview response</Button></form>}
    </section> : <section className="space-y-4"><h3 className="text-lg font-semibold">Individual submissions · teacher only</h3>{activity.questions.length > 0 && <div className="rounded-xl border bg-card p-5"><h4 className="font-semibold">Questions</h4>{activity.questions.map(question => <p key={question.id} className="mt-2 text-sm">{question.prompt}</p>)}</div>}{activity.submissions.length === 0 && <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No preview responses yet. Open the student preview and submit this activity.</p>}{activity.submissions.map(item => <article key={item.id} className="space-y-3 rounded-xl border border-border bg-card p-5"><h4 className="font-semibold">{item.learnerName} · {item.status}</h4><p className="whitespace-pre-wrap break-words text-sm">{item.response}</p><form className="space-y-3" onSubmit={event => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      reviewSubmission(classroom.id, activity.id, item.id, String(form.get('evaluation') ?? '').trim(), String(form.get('feedback') ?? '').trim())
      setNotice('Feedback released to this learner in the preview only. Resets on refresh.')
    }}><Label htmlFor={`evaluation-${item.id}`}>Evaluation</Label><Input id={`evaluation-${item.id}`} name="evaluation" defaultValue={item.evaluation ?? ''} maxLength={150} required /><Label htmlFor={`feedback-${item.id}`}>Learner-visible feedback</Label><Textarea id={`feedback-${item.id}`} name="feedback" defaultValue={item.feedback ?? ''} maxLength={2000} required /><p className="text-xs text-muted-foreground">Audience: {item.learnerName} only. This explicitly releases the evaluation and feedback.</p><Button type="submit">Release preview feedback</Button></form></article>)}</section>}
  </div>
}
