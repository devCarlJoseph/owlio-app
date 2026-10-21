import { useEffect, useRef, useState, type FormEvent } from "react"
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
import { ClassroomCard } from "./classroom-card"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, WorkspaceRole } from "./classroom-types"

function workspaceTitle(role: WorkspaceRole) {
  if (role === "students") return "Your enrolled classrooms"
  if (role === "esl") return "Your teaching classrooms"
  return "Your teaching classrooms"
}

type JoinNotice = {
  tone: "success" | "info" | "error"
  message: string
}

const joinNoticeStyles: Record<JoinNotice["tone"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
}

export function ClassroomsView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? "students"
  const isStudent = role === "students"
  const {
    classroomsLoading,
    classroomsError,
    connectedModeEnabled,
    getClassroomsForWorkspace,
    reloadClassrooms,
    createClassroom,
    joinClassroom,
  } = useClassroomPrototype()
  const classrooms = getClassroomsForWorkspace(role)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [feedback, setFeedback] = useState("")
  const [joinNotice, setJoinNotice] = useState<JoinNotice | null>(null)
  const [createError, setCreateError] = useState("")
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const joiningRef = useRef(false)
  const joinToggleRef = useRef<HTMLButtonElement>(null)
  const joinCodeRef = useRef<HTMLInputElement>(null)
  const joinStatusRef = useRef<HTMLParagraphElement>(null)

  const connectedClassrooms = classrooms.filter((classroom) => !classroom.isMock)
  const demoClassrooms = classrooms.filter((classroom) => classroom.isMock)
  const studentClassrooms = [...connectedClassrooms, ...demoClassrooms]

  useEffect(() => {
    if (!joinNotice) return
    if (joinNotice.tone === "error") {
      joinCodeRef.current?.focus()
      return
    }
    joinStatusRef.current?.focus()
  }, [joinNotice])

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
    if (joiningRef.current) return
    joiningRef.current = true
    setJoinNotice(null)
    setJoining(true)
    try {
      const result = await joinClassroom(joinCode)
      if (result.status === "joined") {
        setJoinCode("")
        setJoinNotice({
          tone: "success",
          message: result.source === "connected"
            ? `${result.classroomName} was added to your class list. The classroom service confirmed your enrollment.`
            : `${result.classroomName} was added to this preview session only. It is not saved to your account.`,
        })
        return
      }
      if (result.status === "already-previewed") {
        setJoinNotice({
          tone: "info",
          message: `You are already viewing ${result.classroomName} in this preview session. Nothing was added or saved.`,
        })
        return
      }
      setJoinNotice({
        tone: "error",
        message: connectedModeEnabled
          ? "That code could not be joined. Check the invite code with your educator and try again."
          : "Codes are not verified in preview mode. Only demo codes work here, and nothing is saved to your account.",
      })
    } catch (error) {
      setJoinNotice({
        tone: "error",
        message: getApiErrorMessage(error, "Could not join the class. Check the invite code and try again."),
      })
    } finally {
      setJoining(false)
      joiningRef.current = false
    }
  }

  function closeJoinPanel() {
    setShowJoin(false)
    setJoinNotice(null)
    joinToggleRef.current?.focus()
  }

  const studentSourceLabel = classroomsError
    ? "Demo preview · connected classes unavailable"
    : connectedModeEnabled
      ? "Connected classes + demo previews"
      : "Preview mode · demo classes only"
  const studentSourceBadgeClass = classroomsError || !connectedModeEnabled
    ? "bg-amber-100 text-amber-900"
    : "bg-blue-100 text-blue-800"
  const joinDisclosure = connectedModeEnabled
    ? "A confirmed code enrolls your signed-in account through the classroom service. Demo codes only change this preview session."
    : "Preview mode: codes are not verified by a service. Demo codes only change this preview session, and nothing is saved to your account."

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {isStudent ? (
        <section aria-labelledby="classrooms-heading" className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 max-w-2xl">
              <h2
                id="classrooms-heading"
                className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
              >
                My Classes
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {connectedModeEnabled
                  ? "Open a class you are enrolled in to see what your educator has shared. Membership comes from the classroom service; conversations, classwork, attendance, and results stay previews for now."
                  : "Open a class you are enrolled in to see what your educator has shared. Nothing on this page is connected to a service yet, so class details stay previews and no enrollment is saved."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={studentSourceBadgeClass}>
                  {studentSourceLabel}
                </Badge>
                <span className="text-xs text-slate-500">
                  {connectedClassrooms.length} connected · {demoClassrooms.length} demo previews
                </span>
              </div>
            </div>

            <Button
              ref={joinToggleRef}
              type="button"
              aria-expanded={showJoin}
              aria-controls="join-class-panel"
              onClick={() => { setShowJoin((current) => !current); setShowCreate(false) }}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              <UserRoundPlus aria-hidden="true" /> Join a class
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <Badge variant="secondary" className={classroomsError ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-800"}>
                {classroomsError ? "Demo preview · API unavailable" : "Connected classrooms + demo previews"}
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Your classrooms
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Create a connected classroom, share its invite code, and organize your class learning space.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => { setShowCreate((current) => !current); setShowJoin(false) }}>
                <Plus aria-hidden="true" /> Create classroom
              </Button>
            </div>
          </div>
        </section>
      )}

      {feedback && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{feedback}</p>}
      {!isStudent && classroomsError && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Connected classrooms could not be loaded. Demo classrooms remain available. {classroomsError}</p>}

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
        <Card id="join-class-panel" className="border-blue-200">
          <CardHeader>
            <CardTitle>Join a classroom</CardTitle>
            <CardDescription>Enter an invite code shared by the educator.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} aria-busy={joining} className="flex flex-col gap-3 sm:flex-row">
              <Label className="sr-only" htmlFor="class-join-code">Classroom invite code</Label>
              <Input
                id="class-join-code"
                ref={joinCodeRef}
                value={joinCode}
                onChange={(event) => setJoinCode(event.currentTarget.value)}
                autoComplete="off"
                disabled={joining}
                placeholder="OWLIO-0123ABCDEF"
                aria-invalid={joinNotice?.tone === "error"}
                aria-describedby={joinNotice ? "join-disclosure join-status" : "join-disclosure"}
                className="sm:max-w-sm"
              />
              <Button type="submit" disabled={!joinCode.trim() || joining}>{joining ? "Joining…" : "Join class"}</Button>
            </form>
            {joinNotice ? (
              <p
                id="join-status"
                ref={joinStatusRef}
                tabIndex={-1}
                role={joinNotice.tone === "error" ? "alert" : "status"}
                className={`mt-3 rounded-xl border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${joinNoticeStyles[joinNotice.tone]}`}
              >
                {joinNotice.message}
              </p>
            ) : null}
            <p id="join-disclosure" className="mt-3 text-xs leading-5 text-slate-500">{joinDisclosure}</p>
            <div className="mt-3">
              <Button type="button" variant="outline" onClick={closeJoinPanel}>Close join form</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isStudent ? (
        <section aria-label="Your classes" className="space-y-5">
          {classroomsError ? (
            <Card className="border-amber-200 bg-amber-50/40">
              <CardContent className="py-6">
                <p className="text-base font-semibold text-slate-900">Your connected classes could not be loaded</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{classroomsError}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Nothing was changed. Try again, and use the demo previews in the meantime.
                </p>
                <Button type="button" variant="outline" className="mt-4" onClick={reloadClassrooms}>Try again</Button>
              </CardContent>
            </Card>
          ) : null}

          {classroomsLoading && classrooms.length === 0 ? (
            <Card><CardContent className="py-8 text-sm text-slate-600" role="status">Loading classes…</CardContent></Card>
          ) : studentClassrooms.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="items-center py-10 text-center">
                <School aria-hidden="true" className="size-8 text-slate-400" />
                <h3 className="text-base font-semibold text-slate-900">No classes joined yet</h3>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  Use an educator&apos;s invite code to join a class. Confirmed enrollments appear here.
                </p>
                <Button type="button" variant="outline" onClick={() => setShowJoin(true)}>
                  <UserRoundPlus aria-hidden="true" /> Join a class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {studentClassrooms.map((classroom) => (
                <ClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  href={openClassroom(classroom.id)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section aria-labelledby="classrooms-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{workspaceTitle(role)}</p>
              <h3 id="classrooms-heading" className="mt-1 text-xl font-semibold text-slate-900">Classrooms</h3>
            </div>
            <Badge variant="outline" className="border-dashed border-amber-300 bg-amber-50 text-amber-800">
              Connected + demo classes
            </Badge>
          </div>
          {classroomsLoading && classrooms.length === 0 ? (
            <Card><CardContent className="py-8 text-sm text-slate-600" role="status">Loading classrooms…</CardContent></Card>
          ) : classrooms.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="items-center py-10 text-center">
                <School aria-hidden="true" className="size-8 text-slate-400" />
                <h4 className="text-base font-semibold text-slate-900">No demo classrooms yet</h4>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  Create a classroom to start exploring the educator workflow.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {classrooms.map((classroom) => (
                <ClassroomSummaryCard key={classroom.id} classroom={classroom} href={openClassroom(classroom.id)} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function ClassroomSummaryCard({
  classroom,
  href,
}: {
  classroom: Classroom
  href: string
}) {
  return (
    <Card className="border-slate-200 transition hover:border-blue-200 hover:shadow-sm">
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
        <p className="text-xs text-slate-500">Class educator: {classroom.instructorName}</p>
        <p className="text-xs text-slate-500">{classroom.isMock
          ? `${classroom.enrolledLearnerIds.length} demo learners`
          : classroom.access === "student" ? "Enrolled classroom" : "Classroom you manage"
        }</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <Badge variant="outline" className={classroom.isMock
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"}
          >
            {classroom.isMock ? "Demo classroom" : "Connected"}
          </Badge>
          <Link
            to={href}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-blue-700 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Open class <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
