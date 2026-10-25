import { useEffect, useRef, useState, type FormEvent } from "react"
import { Plus, School, Search, UserRoundPlus, X } from "lucide-react"
import { useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/services/api/api-error"
import { ClassroomCard, ClassroomListHeader, ClassroomListRow } from "./classroom-card"
import { ClassroomCreateDialog, ClassroomJoinDialog } from "./classroom-form-dialogs"
import { FilterPills, GridListToggle, type ClassroomView } from "./classroom-list-ui"
import { useClassroomPrototype } from "./classroom-prototype-context"

type PageNotice = { tone: "success" | "info"; message: string }

const noticeStyles: Record<PageNotice["tone"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
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
  const connectedClassrooms = classrooms.filter((classroom) => !classroom.isMock)
  const demoClassrooms = classrooms.filter((classroom) => classroom.isMock)
  const orderedClassrooms = [...connectedClassrooms, ...demoClassrooms]
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [notice, setNotice] = useState<PageNotice | null>(null)
  const [joinError, setJoinError] = useState("")
  const [createError, setCreateError] = useState("")
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [stripDismissed, setStripDismissed] = useState(false)
  const [view, setView] = useState<ClassroomView>("grid")
  const [query, setQuery] = useState("")
  const [subject, setSubject] = useState("all")
  const joiningRef = useRef(false)
  const focusNoticeRef = useRef(false)
  const joinCodeRef = useRef<HTMLInputElement>(null)
  const noticeRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (joinError) joinCodeRef.current?.focus()
  }, [joinError])

  const subjectCounts = new Map<string, number>()
  for (const classroom of orderedClassrooms) {
    if (classroom.subject) subjectCounts.set(classroom.subject, (subjectCounts.get(classroom.subject) ?? 0) + 1)
  }
  const subjectOptions = [
    { value: "all", label: "All", count: orderedClassrooms.length },
    ...[...subjectCounts.entries()].map(([value, count]) => ({ value, label: value, count })),
  ]
  const activeSubject = subjectOptions.some((option) => option.value === subject) ? subject : "all"
  const normalizedQuery = query.trim().toLowerCase()
  const visibleClassrooms = orderedClassrooms.filter((classroom) =>
    (activeSubject === "all" || classroom.subject === activeSubject)
    && (!normalizedQuery || [classroom.name, classroom.subject, classroom.instructorName].some((field) => field.toLowerCase().includes(normalizedQuery)))
  )

  const openClassroom = (classroomId: string) => `/${role}/classrooms/${classroomId}`

  const dialogFinalFocus = () => {
    if (focusNoticeRef.current && noticeRef.current) {
      focusNoticeRef.current = false
      return noticeRef.current
    }
    return true
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setCreating(true)
    setCreateError("")
    try {
      const classroom = await createClassroom({
        name: String(form.get("class-name") ?? ""),
        subject: String(form.get("class-subject") ?? ""),
        description: String(form.get("class-description") ?? ""),
      }, role === "students" ? "educators" : role)
      focusNoticeRef.current = true
      setShowCreate(false)
      setNotice({
        tone: classroom.isMock ? "info" : "success",
        message: classroom.isMock
          ? `${classroom.name} was added to this demo session. It is not saved.`
          : `${classroom.name} was created and saved. Share its invite code with students.`,
      })
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
    setJoinError("")
    setJoining(true)
    try {
      const result = await joinClassroom(joinCode)
      if (result.status === "joined" || result.status === "already-previewed") {
        focusNoticeRef.current = true
        setJoinCode("")
        setShowJoin(false)
        setNotice(result.status === "joined"
          ? {
            tone: "success",
            message: result.source === "connected"
              ? `${result.classroomName} was added to your class list. The classroom service confirmed your enrollment.`
              : `${result.classroomName} was added to this preview session only. It is not saved to your account.`,
          }
          : {
            tone: "info",
            message: `You are already viewing ${result.classroomName} in this preview session. Nothing was added or saved.`,
          })
        return
      }
      setJoinError(connectedModeEnabled
        ? "That code could not be joined. Check the invite code with your educator and try again."
        : "Codes are not verified in preview mode. Only demo codes work here, and nothing is saved to your account.")
    } catch (error) {
      setJoinError(getApiErrorMessage(error, "Could not join the class. Check the invite code and try again."))
    } finally {
      setJoining(false)
      joiningRef.current = false
    }
  }

  const openJoin = () => {
    setJoinError("")
    setShowJoin(true)
  }

  const sourceLabel = classroomsError
    ? "Demo preview · connected classes unavailable"
    : isStudent
      ? connectedModeEnabled ? "Connected classes + demo previews" : "Preview mode · demo classes only"
      : "Connected classrooms + demo previews"
  const sourceIsWarning = Boolean(classroomsError) || (isStudent && !connectedModeEnabled)
  const joinDisclosure = connectedModeEnabled
    ? "A confirmed code enrolls your signed-in account through the classroom service. Demo codes only change this preview session."
    : "Preview mode: codes are not verified by a service. Demo codes only change this preview session, and nothing is saved to your account."
  const description = isStudent
    ? connectedModeEnabled
      ? "Open a class you are enrolled in to see what your educator has shared. Membership comes from the classroom service; conversations, classwork, attendance, and results stay previews for now."
      : "Open a class you are enrolled in to see what your educator has shared. Nothing on this page is connected to a service yet, so class details stay previews and no enrollment is saved."
    : "Create a connected classroom, share its invite code, and organize your class learning space."
  const showSkeletons = classroomsLoading && classrooms.length === 0

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      {!stripDismissed && (
        <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${sourceIsWarning ? "border-amber-200 bg-amber-50 text-amber-900" : "border-brand/20 bg-brand-soft text-brand-soft-foreground"}`}>
          <p>
            <span className="font-medium">{sourceLabel}</span>
            <span className="ml-2 text-xs opacity-80">{connectedClassrooms.length} connected · {demoClassrooms.length} demo previews</span>
          </p>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={() => setStripDismissed(true)}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}

      <section aria-labelledby="classrooms-heading" className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h2 id="classrooms-heading" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            My Classes
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {isStudent ? (
          <Button type="button" aria-haspopup="dialog" onClick={openJoin} className="bg-brand text-brand-foreground hover:bg-brand/90">
            <UserRoundPlus aria-hidden="true" /> Join a class
          </Button>
        ) : (
          <Button type="button" aria-haspopup="dialog" onClick={() => { setCreateError(""); setShowCreate(true) }} className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Plus aria-hidden="true" /> Create class
          </Button>
        )}
      </section>

      {notice && (
        <p
          ref={noticeRef}
          tabIndex={-1}
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand ${noticeStyles[notice.tone]}`}
        >
          {notice.message}
        </p>
      )}

      {classroomsError && (
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
      )}

      <div className="flex flex-wrap items-center gap-3">
        <FilterPills label="Filter classes by subject" options={subjectOptions} value={activeSubject} onValueChange={setSubject} />
        <div className="relative ml-auto w-full sm:w-64">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            aria-label="Search classes"
            placeholder="Search classes…"
            autoComplete="off"
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <GridListToggle value={view} onValueChange={setView} />
      </div>

      <section aria-label="Your classes" aria-busy={showSkeletons}>
        {showSkeletons ? (
          <div role="status" aria-label="Loading classes" className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-2"}>
            {Array.from({ length: view === "grid" ? 3 : 4 }, (_, index) => (
              <Skeleton key={index} className={view === "grid" ? "h-72 rounded-2xl" : "h-16 rounded-xl"} />
            ))}
          </div>
        ) : orderedClassrooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="items-center py-10 text-center">
              <School aria-hidden="true" className="size-8 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900">{isStudent ? "No classes joined yet" : "No classrooms yet"}</h3>
              <p className="max-w-md text-sm leading-6 text-slate-600">
                {isStudent
                  ? "Use an educator's invite code to join a class. Confirmed enrollments appear here."
                  : "Create a classroom to start organizing your class learning space."}
              </p>
              {isStudent ? (
                <Button type="button" variant="outline" aria-haspopup="dialog" onClick={openJoin}>
                  <UserRoundPlus aria-hidden="true" /> Join with a class code
                </Button>
              ) : (
                <Button type="button" variant="outline" aria-haspopup="dialog" onClick={() => { setCreateError(""); setShowCreate(true) }}>
                  <Plus aria-hidden="true" /> Create your first class
                </Button>
              )}
            </CardContent>
          </Card>
        ) : visibleClassrooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="items-center py-10 text-center">
              <h3 className="text-base font-semibold text-slate-900">No classes match your filters</h3>
              <p className="max-w-md text-sm leading-6 text-slate-600">Try a different subject or search term.</p>
              <Button type="button" variant="outline" onClick={() => { setSubject("all"); setQuery("") }}>Clear filters</Button>
            </CardContent>
          </Card>
        ) : view === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleClassrooms.map((classroom) => (
              <ClassroomCard key={classroom.id} classroom={classroom} href={openClassroom(classroom.id)} role={role} />
            ))}
          </div>
        ) : (
          <div role="table" aria-label="Classes" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ClassroomListHeader role={role} />
            <div role="rowgroup">
              {visibleClassrooms.map((classroom) => (
                <ClassroomListRow key={classroom.id} classroom={classroom} href={openClassroom(classroom.id)} role={role} />
              ))}
            </div>
          </div>
        )}
      </section>

      <ClassroomCreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreate}
        pending={creating}
        error={createError}
        finalFocus={dialogFinalFocus}
      />
      <ClassroomJoinDialog
        open={showJoin}
        onOpenChange={setShowJoin}
        onSubmit={handleJoin}
        code={joinCode}
        onCodeChange={setJoinCode}
        joining={joining}
        error={joinError}
        disclosure={joinDisclosure}
        inputRef={joinCodeRef}
        finalFocus={dialogFinalFocus}
      />
    </div>
  )
}
