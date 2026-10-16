import { useState, type FormEvent } from "react"
import { ArrowLeft, FileUp, TriangleAlert } from "lucide-react"
import { Link, useLocation, useParams } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DEMO_LEARNER_ID } from "./classroom-mock-data"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, ClassroomActivity } from "./classroom-types"

function StudentActivityWorkspace({ classroom, activity }: { classroom: Classroom; activity: ClassroomActivity }) {
  const { submitActivity } = useClassroomPrototype()
  const currentSubmission = activity.submissions.find((submission) => submission.learnerId === DEMO_LEARNER_ID)
  const [response, setResponse] = useState("")
  const [fileName, setFileName] = useState("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [status, setStatus] = useState("")

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const answer = activity.responseType === "Quiz" ? JSON.stringify(answers) : response
    const hasQuizAnswer = Object.values(answers).some((value) => value.trim())
    if (activity.responseType === "Quiz" ? !hasQuizAnswer : !answer.trim() && !fileName.trim()) {
      setStatus("Add a response before previewing submission.")
      return
    }
    submitActivity(classroom.id, activity.id, answer, fileName || undefined)
    setStatus("Demo response submitted in this session only. It was not uploaded or saved.")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Your task workspace</CardTitle>
            <CardDescription className="mt-1">Complete this activity in the context of {classroom.name}.</CardDescription>
          </div>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo workspace</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {currentSubmission?.status === "Returned" && currentSubmission.released && (
          <section aria-labelledby="released-feedback-heading" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 id="released-feedback-heading" className="font-semibold text-emerald-950">Returned feedback · demo</h3>
            <p className="mt-2 text-sm text-emerald-900">Evaluation: {currentSubmission.evaluation || "No evaluation provided"}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-900">{currentSubmission.feedback || "No written feedback provided."}</p>
          </section>
        )}
        {currentSubmission && currentSubmission.status !== "Returned" && (
          <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Your demo response is {currentSubmission.status.toLowerCase()}. It has not been sent to an educator.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {activity.responseType === "Quiz" && activity.questions.length > 0 ? (
            activity.questions.map((question, index) => (
              <fieldset key={question.id} className="grid gap-3 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-900">Question {index + 1} · {question.type}</legend>
                <p className="text-sm leading-6 text-slate-700">{question.prompt}</p>
                {question.type === "Multiple choice" ? (
                  <select
                    aria-label={`Answer question ${index + 1}`}
                    value={answers[question.id] ?? ""}
                    onChange={(event) => setAnswer(question.id, event.currentTarget.value)}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="">Choose an answer</option>
                    {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : question.type === "True or false" ? (
                  <div className="flex flex-wrap gap-4">
                    {["True", "False"].map((answer) => (
                      <label key={answer} className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input type="radio" name={`answer-${question.id}`} value={answer} checked={answers[question.id] === answer} onChange={() => setAnswer(question.id, answer)} />
                        {answer}
                      </label>
                    ))}
                  </div>
                ) : question.type === "Multiple select" ? (
                  <div className="grid gap-2">
                    {question.options.map((option) => {
                      const selected = (answers[question.id] ?? "").split("\n").includes(option)
                      return (
                        <label key={option} className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => {
                              const current = (answers[question.id] ?? "").split("\n").filter(Boolean)
                              setAnswer(question.id, (event.currentTarget.checked
                                ? [...current, option]
                                : current.filter((item) => item !== option)
                              ).join("\n"))
                            }}
                          />
                          {option}
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <Textarea
                    aria-label={`Answer question ${index + 1}`}
                    value={answers[question.id] ?? ""}
                    onChange={(event) => setAnswer(question.id, event.currentTarget.value)}
                    maxLength={4000}
                    placeholder="Write your response…"
                  />
                )}
              </fieldset>
            ))
          ) : activity.responseType === "File" ? (
            <div className="grid gap-2">
              <Label htmlFor="demo-file-response">Choose a file to preview</Label>
              <Input
                id="demo-file-response"
                type="file"
                onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name ?? "")}
                aria-describedby="file-response-note"
              />
              <p id="file-response-note" className="text-xs text-slate-500">Only the filename is shown. No file is uploaded or stored.</p>
              {fileName && <p role="status" className="flex items-center gap-2 text-sm text-slate-700"><FileUp aria-hidden="true" className="size-4" />{fileName} · local preview</p>}
            </div>
          ) : activity.responseType === "Link" ? (
            <div className="grid gap-2">
              <Label htmlFor="demo-link-response">Your link response</Label>
              <Input id="demo-link-response" type="url" value={response} onChange={(event) => setResponse(event.currentTarget.value)} placeholder="https://…" />
              <p className="text-xs text-slate-500">This link remains in the current demo session only.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="demo-text-response">Your response</Label>
              <Textarea id="demo-text-response" value={response} onChange={(event) => setResponse(event.currentTarget.value)} maxLength={4000} placeholder="Write your work here…" />
            </div>
          )}
          {status && <p role="status" className="text-sm text-amber-800">{status}</p>}
          <Button type="submit">{currentSubmission ? "Update demo response" : "Submit demo response"}</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EducatorReview({ classroom, activity }: { classroom: Classroom; activity: ClassroomActivity }) {
  const { reviewSubmission } = useClassroomPrototype()
  const [drafts, setDrafts] = useState<Record<string, { evaluation: string; feedback: string }>>({})
  const [status, setStatus] = useState("")

  const handleReturn = (event: FormEvent<HTMLFormElement>, submissionId: string) => {
    event.preventDefault()
    const draft = drafts[submissionId] ?? { evaluation: "", feedback: "" }
    reviewSubmission(classroom.id, activity.id, submissionId, draft.evaluation, draft.feedback)
    setStatus("Demo evaluation and feedback returned in this session only. No official record was changed.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Submission review preview</CardTitle>
        <CardDescription>Review learner responses and return demo feedback. This does not change an official record.</CardDescription>
      </CardHeader>
      <CardContent>
        {status && <p role="status" className="mb-4 text-sm text-amber-800">{status}</p>}
        {activity.submissions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">No demo submissions yet. Responses will appear here in this session.</p>
        ) : (
          <ul className="space-y-4">
            {activity.submissions.map((submission) => {
              const draft = drafts[submission.id] ?? {
                evaluation: submission.evaluation ?? "",
                feedback: submission.feedback ?? "",
              }
              return (
                <li key={submission.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{submission.learnerName}</h3>
                      <p className="mt-1 text-xs text-slate-500">{submission.submittedAt} · {submission.status.toLowerCase()} · demo</p>
                    </div>
                    <Badge variant="outline">{submission.status}</Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{submission.fileName ? `Selected file: ${submission.fileName}` : submission.response || "No text response."}</p>
                  <form onSubmit={(event) => handleReturn(event, submission.id)} className="mt-4 grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor={`evaluation-${submission.id}`}>Evaluation preview</Label>
                      <Input
                        id={`evaluation-${submission.id}`}
                        value={draft.evaluation}
                        onChange={(event) => setDrafts((current) => ({ ...current, [submission.id]: { ...draft, evaluation: event.currentTarget.value } }))}
                        maxLength={100}
                        placeholder="e.g. Complete · demo"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                      <Textarea
                        id={`feedback-${submission.id}`}
                        value={draft.feedback}
                        onChange={(event) => setDrafts((current) => ({ ...current, [submission.id]: { ...draft, feedback: event.currentTarget.value } }))}
                        maxLength={1000}
                        placeholder="Write feedback for this learner…"
                      />
                    </div>
                    <Button type="submit" variant="outline" className="w-fit">Return demo feedback</Button>
                  </form>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function ClassroomActivityView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? "students"
  const { classroomId, activityId } = useParams()
  const { getClassroom } = useClassroomPrototype()
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const activity = classroom?.activities.find((item) => item.id === activityId)
  const hasAccessInDemo = classroom && (role === "students"
    ? classroom.enrolledLearnerIds.includes(DEMO_LEARNER_ID)
    : classroom.ownerWorkspace === role)

  if (!classroom || !activity || !hasAccessInDemo) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Activity unavailable in this demo</CardTitle>
          <CardDescription>Choose an activity from a classroom available in this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to={`/${role}/classrooms`} className="text-sm font-semibold text-blue-700 hover:underline">Back to classrooms</Link>
        </CardContent>
      </Card>
    )
  }

  const isStudent = role === "students"

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <Link
        to={`/${role}/classrooms/${classroom.id}`}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to {classroom.name}
      </Link>
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{activity.type}</Badge>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Mock activity</Badge>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{activity.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{activity.instructions}</p>
        <p className="mt-3 text-xs text-slate-500">{activity.dueDate ? `Due ${activity.dueDate}` : "No due date"} · {activity.scoringNote || "Evaluation details are a demo preview"}</p>
      </header>
      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Demo only</AlertTitle>
        <AlertDescription className="text-amber-800">Responses, files, evaluations, and feedback stay in this temporary preview and are not submitted or saved.</AlertDescription>
      </Alert>
      {isStudent
        ? <StudentActivityWorkspace classroom={classroom} activity={activity} />
        : <EducatorReview classroom={classroom} activity={activity} />}
    </div>
  )
}
