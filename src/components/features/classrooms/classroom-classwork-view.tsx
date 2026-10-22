import { useState, type FormEvent } from "react"
import { ArrowRight, Plus, TriangleAlert } from "lucide-react"
import { Link, useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { ActivityType, Classroom, QuestionType, WorkspaceRole } from "./classroom-types"

const activityTypes: ActivityType[] = [
  "Quiz",
  "Test",
  "Assignment",
  "File submission",
  "Project",
  "Presentation",
  "Lab work",
  "Practical activity",
  "Discussion activity",
  "Reading activity",
  "Speaking practice",
]

const questionTypes: QuestionType[] = [
  "Multiple choice",
  "Multiple select",
  "True or false",
  "Identification",
  "Short answer",
  "Essay",
]

export function ClassroomClassworkView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { pathname } = useLocation()
  const workspace = getDashboardRole(pathname) ?? "students"
  const { createActivity } = useClassroomPrototype()
  const isStudent = role === "students"
  const [showCreate, setShowCreate] = useState(false)
  const [activityType, setActivityType] = useState<ActivityType>("Assignment")
  const [questionType, setQuestionType] = useState<QuestionType>("Multiple choice")
  const [status, setStatus] = useState("")
  const isFormBased = activityType === "Quiz" || activityType === "Test"
  const mySubmitted = classroom.activities.filter((activity) => activity.submissions.some((item) => item.learnerId === "demo-learner")).length
  const toReview = classroom.activities.reduce((total, activity) => total + activity.submissions.filter((item) => item.status === "In review").length, 0)
  const nextDue = classroom.activities.map((activity) => activity.dueDate).filter(Boolean).sort()[0]
  const stats = [
    { label: "Total classwork", value: String(classroom.activities.length), tone: "bg-white" },
    { label: "Next due", value: nextDue || "None", tone: "bg-white" },
    isStudent
      ? { label: "Submitted by you", value: `${mySubmitted} of ${classroom.activities.length}`, tone: "bg-indigo-50" }
      : { label: "Awaiting review", value: String(toReview), tone: "bg-indigo-50" },
    { label: "Status", value: classroom.activities.length ? "Published" : "No classwork", tone: "bg-blue-50" },
  ]

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const prompt = String(form.get("question-prompt") ?? "").trim()
    const options = String(form.get("question-options") ?? "")
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean)

    if (isFormBased && !prompt) {
      setStatus("Add a question prompt before publishing this demo activity.")
      return
    }
    if (isFormBased && ["Multiple choice", "Multiple select"].includes(questionType) && options.length < 2) {
      setStatus("Add at least two comma-separated options for this demo question.")
      return
    }

    createActivity(classroom.id, {
      title: String(form.get("activity-title") ?? ""),
      type: activityType,
      instructions: String(form.get("activity-instructions") ?? ""),
      dueDate: String(form.get("activity-due-date") ?? ""),
      scoringNote: String(form.get("activity-evaluation") ?? ""),
      responseType: isFormBased ? "Quiz" : String(form.get("response-type") ?? "Text") as "Text" | "File" | "Link",
      questions: isFormBased ? [{
        id: `question-${crypto.randomUUID()}`,
        type: questionType,
        prompt,
        options,
      }] : [],
    })
    event.currentTarget.reset()
    setActivityType("Assignment")
    setQuestionType("Multiple choice")
    setShowCreate(false)
    setStatus("Demo classwork was published in this session only. It was not saved.")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Classwork</h3>
          <p className="mt-1 text-sm text-slate-600">Activities and assignment work for {classroom.name}.</p>
        </div>
        {!isStudent && (
          <Button type="button" onClick={() => setShowCreate((current) => !current)}>
            <Plus aria-hidden="true" /> {showCreate ? "Close editor" : "Create classwork"}
          </Button>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, tone }) => (
          <div key={label} className={`rounded-2xl border border-slate-200 p-4 ${tone}`}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Prototype classwork</AlertTitle>
        <AlertDescription className="text-amber-800">Activity content, responses, evaluation, and feedback are mock data. Nothing is submitted or saved to a classroom service.</AlertDescription>
      </Alert>

      {status && <p role="status" className="text-sm text-amber-800">{status}</p>}

      {showCreate && !isStudent && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Create classwork preview</CardTitle>
            <CardDescription>Publish a demo activity to this classroom's in-memory workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="activity-title">Activity title</Label>
                  <Input id="activity-title" name="activity-title" required maxLength={100} placeholder="e.g. Ecosystem reflection" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="activity-type">Activity type</Label>
                  <select
                    id="activity-type"
                    value={activityType}
                    onChange={(event) => setActivityType(event.currentTarget.value as ActivityType)}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {activityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="activity-instructions">Instructions</Label>
                <Textarea id="activity-instructions" name="activity-instructions" required maxLength={2000} placeholder="Explain what learners should do…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="activity-due-date">Due date <span className="font-normal text-slate-500">(optional)</span></Label>
                  <Input id="activity-due-date" name="activity-due-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="activity-evaluation">Evaluation note <span className="font-normal text-slate-500">(optional)</span></Label>
                  <Input id="activity-evaluation" name="activity-evaluation" maxLength={200} placeholder="e.g. Feedback-based review" />
                </div>
              </div>
              {isFormBased ? (
                <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4">
                  <legend className="px-1 text-sm font-semibold text-slate-800">Question preview</legend>
                  <div className="grid gap-2">
                    <Label htmlFor="question-type">Question type</Label>
                    <select
                      id="question-type"
                      value={questionType}
                      onChange={(event) => setQuestionType(event.currentTarget.value as QuestionType)}
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {questionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="question-prompt">Question prompt</Label>
                    <Textarea id="question-prompt" name="question-prompt" required maxLength={1000} placeholder="Write a question…" />
                  </div>
                  {["Multiple choice", "Multiple select"].includes(questionType) && (
                    <div className="grid gap-2">
                      <Label htmlFor="question-options">Answer options</Label>
                      <Input id="question-options" name="question-options" required placeholder="Separate options with commas" />
                    </div>
                  )}
                  <p className="text-xs text-slate-500">The prototype captures one example question; quiz scoring and answer-key behavior are not connected.</p>
                </fieldset>
              ) : (
                <div className="grid gap-2 sm:max-w-sm">
                  <Label htmlFor="response-type">Student response preview</Label>
                  <select
                    id="response-type"
                    name="response-type"
                    defaultValue="Text"
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="Text">Written response</option>
                    <option value="File">File name preview</option>
                    <option value="Link">Link response</option>
                  </select>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="submit">Publish demo activity</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {classroom.activities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-sm text-slate-600">{isStudent ? "No demo classwork is available yet." : "Create a demo activity to preview learner classwork."}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {classroom.activities.map((activity) => {
            const submission = activity.submissions.find((item) => item.learnerId === "demo-learner")
            return (
              <Card key={activity.id}>
                <CardContent className="flex flex-wrap items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{activity.title}</h4>
                      <Badge variant="outline">{activity.type}</Badge>
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{activity.instructions}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.dueDate ? `Due ${activity.dueDate}` : "No due date"} · {isStudent ? submission?.status ?? "Not started · demo" : `${activity.submissions.length} demo submissions`}
                    </p>
                  </div>
                  <Link
                    to={`/${workspace}/classrooms/${classroom.id}/classwork/${activity.id}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-blue-700 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {isStudent ? "Open workspace" : "Review activity"} <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
