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
import { getApiErrorMessage } from "@/services/api/api-error"
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
  const {
    classroomsLoading,
    classroomsError,
    getClassroomsForWorkspace,
    createClassroom,
    joinClassroom,
  } = useClassroomPrototype()
  const classrooms = getClassroomsForWorkspace(role)
  const connectedClassrooms = classrooms.filter((classroom) => !classroom.isMock)
  const demoClassrooms = classrooms.filter((classroom) => classroom.isMock)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [feedback, setFeedback] = useState("")
  const [joinError, setJoinError] = useState("")
  const [createError, setCreateError] = useState("")
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  const openClassroom = (classroomId: string) => `/${role}/classrooms/${classroomId}`

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setCreating(true)
    setCreateError("")
    try {
      const classroom = await createClassroom({
      name: String(form.get("class-name") ?? ""),
      subject: String(form.get("class-subject") ?? ""),
      description: String(form.get("class-description") ?? ""),
      }, role === "students" ? "educators" : role)
      formElement.reset()
      setShowCreate(false)
      setFeedback(classroom.isMock
        ? `${classroom.name} was added to this demo session. It is not saved.`
        : `${classroom.name} was created and saved. Share its invite code with students.`)
    } catch (error) {
      setCreateError(getApiErrorMessage(error, "Could not create the classroom. Please try again."))
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setJoinError("")
    setJoining(true)
    try {
      const result = await joinClassroom(joinCode)
      if ("error" in result) {
        setJoinError(result.error === "already-enrolled"
          ? "You are already enrolled in this demo classroom."
          : "That demo invite code was not found.")
        return
      }
      setJoinCode("")
      setShowJoin(false)
      setFeedback(`${result.classroomName} was added to your classroom list.`)
    } catch (error) {
      setJoinError(getApiErrorMessage(error, "Could not join the classroom. Please check the invite code."))
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge variant="secondary" className={classroomsError ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-800"}>
              {classroomsError ? "Connected data unavailable" : isStudent ? "Your learning spaces" : "Class workspace"}
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {isStudent ? "Your learning spaces" : "My classes"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isStudent
                ? "Open an enrolled class to find its conversations, group chat, activities, and learning resources."
                : "Open a class to review its teaching workspace, or create a classroom to get started."}
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
      {classroomsError && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Connected classrooms could not be loaded. Demo classrooms remain available. {classroomsError}</p>}

      {showCreate && !isStudent && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Create a classroom</CardTitle>
            <CardDescription>Create a connected class record and generate a student invite code.</CardDescription>
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
                <Button type="submit" disabled={creating}>{creating ? "Creating…" : "Create classroom"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
              {createError && <p role="alert" className="text-sm text-rose-700 sm:col-span-2">{createError}</p>}
            </form>
          </CardContent>
        </Card>
      )}

      {showJoin && isStudent && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Join a classroom</CardTitle>
            <CardDescription>Enter an invite code shared by the educator.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="flex flex-col gap-3 sm:flex-row">
              <Label className="sr-only" htmlFor="class-join-code">Classroom invite code</Label>
              <Input
                id="class-join-code"
                value={joinCode}
                onChange={(event) => setJoinCode(event.currentTarget.value)}
                autoComplete="off"
                placeholder="OWLIO-0123ABCDEF"
                aria-describedby={joinError ? "join-error" : "join-disclosure"}
                className="sm:max-w-sm"
              />
              <Button type="submit" disabled={!joinCode.trim() || joining}>{joining ? "Joining…" : "Join class"}</Button>
            </form>
            {joinError && <p id="join-error" role="alert" className="mt-3 text-sm text-rose-700">{joinError}</p>}
            <p id="join-disclosure" className="mt-3 text-xs text-slate-500">Real class codes enroll your signed-in account. Demo codes only change this preview session.</p>
          </CardContent>
        </Card>
      )}

      {role === "educators" ? (
        <div className="space-y-8">
          <ClassroomCollection
            title="Connected classrooms"
            description="Classes returned by the classroom service."
            classrooms={connectedClassrooms}
            role={role}
            loading={classroomsLoading}
            emptyMessage="No connected classrooms are available yet. Create a classroom to begin."
          />
          {demoClassrooms.length > 0 && (
            <ClassroomCollection
              title="Demo previews"
              description="Sample classrooms for exploring the interface. Changes stay in this preview session."
              classrooms={demoClassrooms}
              role={role}
              loading={false}
              emptyMessage=""
            />
          )}
        </div>
      ) : <section aria-labelledby="classrooms-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{workspaceTitle(role)}</p>
            <h3 id="classrooms-heading" className="mt-1 text-xl font-semibold text-slate-900">Classrooms</h3>
          </div>
          <Badge variant="outline" className="border-dashed border-amber-300 bg-amber-50 text-amber-800">Connected + demo classes</Badge>
        </div>
        {classroomsLoading && classrooms.length === 0 ? (
          <Card><CardContent className="py-8 text-sm text-slate-600" role="status">Loading classrooms…</CardContent></Card>
        ) : classrooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="items-center py-10 text-center">
              <School aria-hidden="true" className="size-8 text-slate-400" />
              <h4 className="text-base font-semibold text-slate-900">{isStudent ? "No demo classes joined yet" : "No demo classrooms yet"}</h4>
            <p className="max-w-md text-sm leading-6 text-slate-600">
                {isStudent ? "Use an educator's invite code to join a connected class." : "Create a classroom to start exploring the educator workflow."}
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
                  <p className="text-xs text-slate-500">{classroom.isMock
                    ? `${classroom.enrolledLearnerIds.length} demo learners`
                    : classroom.access === "student" ? "Enrolled classroom" : "Classroom you manage"}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Badge variant="outline" className={classroom.isMock
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"}
                    >
                      {classroom.isMock ? "Demo classroom" : "Connected"}
                    </Badge>
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
      </section>}
    </div>
  )
}

function ClassroomCollection({
  title,
  description,
  classrooms,
  role,
  loading,
  emptyMessage,
}: {
  title: string
  description: string
  classrooms: ReturnType<ReturnType<typeof useClassroomPrototype>["getClassroomsForWorkspace"]>
  role: WorkspaceRole
  loading: boolean
  emptyMessage: string
}) {
  return (
    <section aria-label={title}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {loading && classrooms.length === 0 ? (
        <Card><CardContent className="py-8 text-sm text-slate-600" role="status">Loading classrooms…</CardContent></Card>
      ) : classrooms.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">{emptyMessage}</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((classroom) => (
            <Card key={classroom.id} className="overflow-hidden border-slate-200 transition hover:border-blue-200 hover:shadow-sm">
              <div aria-hidden="true" className={`h-20 bg-gradient-to-r ${classroom.isMock ? "from-amber-100 via-orange-50 to-white" : "from-blue-700 via-indigo-600 to-sky-500"}`} />
              <CardHeader>
                <div className="flex items-end justify-between gap-3">
                  <span aria-hidden="true" className={`-mt-11 flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-white text-sm font-bold shadow-sm ${classroom.isMock ? "bg-amber-100 text-amber-900" : "bg-blue-700 text-white"}`}>
                    {classroom.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                  </span>
                  <Badge variant="outline" className={classroom.isMock ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}>{classroom.isMock ? "Demo preview" : "Connected"}</Badge>
                </div>
                <div className="pt-2">
                    <CardTitle className="truncate">{classroom.name}</CardTitle>
                    <CardDescription className="mt-1">{classroom.subject}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{classroom.description}</p>
                <p className="text-xs text-slate-500">Educator: {classroom.instructorName}</p>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Link to={`/${role}/classrooms/${classroom.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-blue-700 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">
                    Open class <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
