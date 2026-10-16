import { useState, type FormEvent } from "react"
import { ArrowRight, BookOpen, Plus, School, UserRoundPlus } from "lucide-react"
import { Link, useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { WorkspaceRole } from "./classroom-types"

function workspaceTitle(role: WorkspaceRole) {
  if (role === "students") return "Your enrolled classrooms"
  if (role === "esl") return "Your teaching classrooms"
  return "Your teaching classrooms"
}

export function ClassroomsView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? "students"
  const isStudent = role === "students"
  const { getClassroom, getClassroomsForWorkspace, createClassroom, joinClassroom } = useClassroomPrototype()
  const classrooms = getClassroomsForWorkspace(role)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [feedback, setFeedback] = useState("")
  const [joinError, setJoinError] = useState("")

  const openClassroom = (classroomId: string) => `/${role}/classrooms/${classroomId}`

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const classroom = createClassroom({
      name: String(form.get("class-name") ?? ""),
      subject: String(form.get("class-subject") ?? ""),
      description: String(form.get("class-description") ?? ""),
    }, role === "students" ? "educators" : role)
    event.currentTarget.reset()
    setShowCreate(false)
    setFeedback(`${classroom.name} was added to this demo session. It is not saved.`)
  }

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setJoinError("")
    const result = joinClassroom(joinCode)
    if ("error" in result) {
      setJoinError(result.error === "already-enrolled"
        ? "You are already enrolled in this demo classroom."
        : "That demo invite code was not found.")
      return
    }
    const classroom = getClassroom(result.classroomId)
    setJoinCode("")
    setShowJoin(false)
    setFeedback(`${classroom?.name ?? "Classroom"} was added to your demo enrollment. It is not saved.`)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Interactive demo · not connected</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {isStudent ? "Your learning spaces" : "Your classrooms"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isStudent
                ? "Open an enrolled class to find its conversations, group chat, activities, and learning resources."
                : "Create a classroom, share a demo invite code, and organize your class learning space."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isStudent ? (
              <Button type="button" variant="outline" onClick={() => { setShowJoin((current) => !current); setShowCreate(false) }}>
                <UserRoundPlus aria-hidden="true" /> Join a class
              </Button>
            ) : (
              <Button type="button" onClick={() => { setShowCreate((current) => !current); setShowJoin(false) }}>
                <Plus aria-hidden="true" /> Create classroom
              </Button>
            )}
          </div>
        </div>
      </section>

      {feedback && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{feedback}</p>}

      {showCreate && !isStudent && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Create a demo classroom</CardTitle>
            <CardDescription>This classroom only exists in this browser session. No server record is created.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="class-name">Classroom name</Label>
                <Input id="class-name" name="class-name" required maxLength={80} placeholder="e.g. Foundations of Biology" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class-subject">Subject or learning focus</Label>
                <Input id="class-subject" name="class-subject" required maxLength={80} placeholder="e.g. Life science" />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="class-description">Description</Label>
                <Textarea id="class-description" name="class-description" maxLength={500} placeholder="What will learners explore in this class?" />
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit">Create demo classroom</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showJoin && isStudent && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Join a classroom</CardTitle>
            <CardDescription>Enter an invite code from an educator's demo classroom.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="flex flex-col gap-3 sm:flex-row">
              <Label className="sr-only" htmlFor="class-join-code">Classroom invite code</Label>
              <Input
                id="class-join-code"
                value={joinCode}
                onChange={(event) => setJoinCode(event.currentTarget.value)}
                autoComplete="off"
                placeholder="Enter invite code"
                aria-describedby={joinError ? "join-error" : "join-disclosure"}
                className="sm:max-w-sm"
              />
              <Button type="submit" disabled={!joinCode.trim()}>Join demo class</Button>
            </form>
            {joinError && <p id="join-error" role="alert" className="mt-3 text-sm text-rose-700">{joinError}</p>}
            <p id="join-disclosure" className="mt-3 text-xs text-slate-500">Joining changes this in-memory preview only. It does not enroll an account on a server.</p>
          </CardContent>
        </Card>
      )}

      <section aria-labelledby="classrooms-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{workspaceTitle(role)}</p>
            <h3 id="classrooms-heading" className="mt-1 text-xl font-semibold text-slate-900">Classrooms</h3>
          </div>
          <Badge variant="outline" className="border-dashed border-amber-300 bg-amber-50 text-amber-800">Mock data</Badge>
        </div>
        {classrooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="items-center py-10 text-center">
              <School aria-hidden="true" className="size-8 text-slate-400" />
              <h4 className="text-base font-semibold text-slate-900">{isStudent ? "No demo classes joined yet" : "No demo classrooms yet"}</h4>
              <p className="max-w-md text-sm leading-6 text-slate-600">
                {isStudent ? "Use an educator's demo invite code to preview joining a class." : "Create a classroom to start exploring the educator workflow."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {classrooms.map((classroom) => (
              <Card key={classroom.id} className="border-slate-200 transition hover:border-blue-200 hover:shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{classroom.name}</CardTitle>
                      <CardDescription className="mt-1">{classroom.subject}</CardDescription>
                    </div>
                    <BookOpen aria-hidden="true" className="size-5 shrink-0 text-blue-700" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{classroom.description}</p>
                  <p className="text-xs text-slate-500">{isStudent ? "Educator" : "Class educator"}: {classroom.instructorName}</p>
                  <p className="text-xs text-slate-500">{classroom.enrolledLearnerIds.length} demo learners</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo classroom</Badge>
                    <Link
                      to={openClassroom(classroom.id)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-blue-700 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Open class <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
