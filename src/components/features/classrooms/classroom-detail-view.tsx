import { useState } from "react"
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Copy,
  FolderOpen,
  GraduationCap,
  MessageCircle,
  MessagesSquare,
  School,
  Users,
} from "lucide-react"
import { Link, useLocation, useParams, useSearchParams } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthSession } from "@/components/features/auth/auth-session-context"
import { formatMeetingCode } from "@/lib/meeting-code"
import { getApiErrorMessage } from "@/services/api/api-error"
import { createMeeting } from "@/services/api/meeting.service"
import { ClassroomChatView } from "./classroom-chat-view"
import { ClassroomClassworkView } from "./classroom-classwork-view"
import { ClassroomFeedView } from "./classroom-feed-view"
import { useClassroomPrototype } from "./classroom-prototype-context"
import { ClassroomMembersView } from "./classroom-members-view"
import type { WorkspaceRole } from "./classroom-types"
import { UnderDevelopment } from "./classroom-ui"

const underDevelopmentTabs = new Set(["materials", "schedule", "media", "files", "attendance", "progress"])

const tabItems = [
  { value: "feed", label: "Discussion", icon: MessagesSquare },
  { value: "chat", label: "Chat", icon: MessageCircle },
  { value: "classwork", label: "Classwork", icon: ClipboardList },
  { value: "materials", label: "Materials", icon: BookOpen },
  { value: "people", label: "People", icon: Users },
  { value: "schedule", label: "Schedule", icon: CalendarDays },
  { value: "attendance", label: "Attendance", icon: GraduationCap },
  { value: "progress", label: "Progress", icon: School },
] as const

const educatorTabItems = [
  { value: "about", label: "About", icon: School },
  { value: "feed", label: "Discussion", icon: MessagesSquare },
  { value: "chat", label: "Chat", icon: MessageCircle },
  { value: "people", label: "Members", icon: Users },
  { value: "schedule", label: "Events", icon: CalendarDays },
  { value: "media", label: "Media", icon: BookOpen },
  { value: "files", label: "Files", icon: FolderOpen },
  { value: "classwork", label: "Classwork", icon: ClipboardList },
  { value: "attendance", label: "Attendance", icon: GraduationCap },
  { value: "progress", label: "Progress", icon: School },
] as const

export function ClassroomDetailView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? "students"
  const { classroomId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { getClassroom, createMeetingLink, classroomsLoading } = useClassroomPrototype()
  const { user } = useAuthSession()
  const [status, setStatus] = useState("")
  const [meetingError, setMeetingError] = useState("")
  const [creatingMeeting, setCreatingMeeting] = useState(false)
  const visibleTabItems = role === "educators" ? educatorTabItems : tabItems
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const isStudent = role === "students"
  const hasAccessInDemo = classroom && (classroom.isMock
    ? isStudent
      ? classroom.enrolledLearnerIds.includes("demo-learner")
      : classroom.ownerWorkspace === role
    : isStudent
      ? classroom.access === "student"
      : classroom.access === "owner")
  const isClassOwner = classroom && (classroom.isMock
    ? classroom.ownerWorkspace === role
    : classroom.access === "owner" && !isStudent)
  const canCreateMeeting = Boolean(
    classroom
      && !classroom.isMock
      && isClassOwner
      && !isStudent
      && user?.roles.includes("EDUCATOR"),
  )
  const meetingUrl = classroom?.meetingId
    ? new URL(`/${role}/classrooms/meeting-room?room=${encodeURIComponent(formatMeetingCode(classroom.meetingId))}`, window.location.origin).toString()
    : null
  const requestedTab = searchParams.get("tab")
  const activeTab = visibleTabItems.find((item) => item.value === requestedTab)?.value
    ?? visibleTabItems[0].value
  const selectTab = (tab: string) => {
    if (!visibleTabItems.some((item) => item.value === tab)) return

    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (tab === visibleTabItems[0].value) next.delete("tab")
      else next.set("tab", tab)
      return next
    }, { replace: true })
  }

  if (!classroom && classroomsLoading) {
    return <p role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading classroom…</p>
  }

  if (!classroom || !hasAccessInDemo) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="items-center py-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Classroom unavailable in this demo</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Return to your classroom list and choose a class available in this workspace.</p>
          <Link to={`/${role}/classrooms`} className="mt-4 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Back to classrooms
          </Link>
        </CardContent>
      </Card>
    )
  }

  const handleCopyMeetingLink = async () => {
    if (!meetingUrl) return
    try {
      await navigator.clipboard.writeText(meetingUrl)
      setStatus("Meeting invite copied.")
    } catch {
      setStatus(`Meeting invite: ${meetingUrl}`)
    }
  }

  const handleCopyMeetingCode = async () => {
    if (!classroom?.meetingId) return
    const code = formatMeetingCode(classroom.meetingId)
    try {
      await navigator.clipboard.writeText(code)
      setStatus("Owlio meeting code copied.")
    } catch {
      setStatus(`Owlio meeting code: ${code}`)
    }
  }

  const handleCreateMeeting = async () => {
    if (!canCreateMeeting || creatingMeeting || !classroom) return
    setCreatingMeeting(true)
    setMeetingError("")
    setStatus("")
    try {
      const { meetingId } = await createMeeting(classroom.id)
      createMeetingLink(classroom.id, meetingId)
      setStatus("Meeting room created and linked to this classroom. Enrolled students can now see and join it.")
    } catch (error) {
      setMeetingError(getApiErrorMessage(error, "Could not create the meeting room. Please try again."))
    } finally {
      setCreatingMeeting(false)
    }
  }

  const handleCopyInviteCode = async () => {
    if (!classroom?.joinCode) return
    try {
      await navigator.clipboard.writeText(classroom.joinCode)
      setStatus(classroom.isMock ? "Demo invite code copied. It is not a real enrollment token." : "Classroom invite code copied.")
    } catch {
      setStatus(classroom.isMock
        ? `Demo invite code: ${classroom.joinCode}. It is not a real enrollment token.`
        : `Classroom invite code: ${classroom.joinCode}`,
      )
    }
  }

  const meetingCard = (
    <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="meeting-link-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="meeting-link-heading" className="text-sm font-semibold text-slate-900">Class meeting</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Live teaching opens in the separate Meeting Room.</p>
        </div>
        <Badge variant="outline" className={classroom.meetingId
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-600"}
        >{classroom.meetingId ? "Room ready" : "No room"}</Badge>
      </div>
      {meetingUrl ? (
        <>
          <p className="mt-3 text-xs font-medium text-slate-500">Room code</p>
          <code className="mt-1 block break-all rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold tracking-wider text-slate-800">{formatMeetingCode(classroom.meetingId ?? "")}</code>
          {role !== "educators" && <code className="mt-3 block break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">{meetingUrl}</code>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={`/${role}/classrooms/meeting-room?room=${encodeURIComponent(formatMeetingCode(classroom.meetingId ?? ""))}`}
              className="inline-flex min-h-9 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >Join meeting</Link>
            <Button type="button" variant="outline" size="sm" onClick={() => void handleCopyMeetingLink()}><Copy aria-hidden="true" /> Copy link</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void handleCopyMeetingCode()}><Copy aria-hidden="true" /> Copy code</Button>
          </div>
          {canCreateMeeting && <Button type="button" variant="outline" size="sm" className="mt-2" disabled={creatingMeeting} onClick={() => void handleCreateMeeting()}>{creatingMeeting ? "Checking room…" : "Refresh meeting link"}</Button>}
        </>
      ) : isStudent ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">The educator has not created a meeting room for this class yet.</p>
      ) : canCreateMeeting ? (
        <Button type="button" size="sm" className="mt-3" disabled={creatingMeeting} onClick={() => void handleCreateMeeting()}>{creatingMeeting ? "Creating room…" : "Create meeting room"}</Button>
      ) : classroom.isMock ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">Create a connected classroom before attaching a real meeting room.</p>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">An educator account must create the meeting room.</p>
      )}
      {meetingError && <p role="alert" className="mt-2 text-xs text-rose-700">{meetingError}</p>}
      <p className="mt-2 text-[11px] leading-4 text-slate-500">{classroom.isMock ? "Demo classrooms are not stored by the API." : "Meeting links use the connected classroom record."}</p>
    </section>
  )

  const inviteCard = isClassOwner && classroom.joinCode ? (
    <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="invite-code-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="invite-code-heading" className="text-sm font-semibold text-slate-900">Student invite code</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Share this code with students to join the classroom.</p>
        </div>
        <Badge variant="outline" className={classroom.isMock ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}>{classroom.isMock ? "Demo" : "Connected"}</Badge>
      </div>
      <code className="mt-3 block break-all rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold tracking-wider text-slate-800">{classroom.joinCode}</code>
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void handleCopyInviteCode()}><Copy aria-hidden="true" /> {classroom.isMock ? "Copy demo code" : "Copy invite code"}</Button>
    </section>
  ) : null

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <Link
        to={`/${role}/classrooms`}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> All classrooms
      </Link>

      {role === "educators" && (
        <div aria-hidden="true" className="relative h-36 overflow-hidden rounded-t-2xl bg-[radial-gradient(ellipse_at_18%_110%,rgba(56,189,248,0.8),transparent_48%),radial-gradient(ellipse_at_85%_-15%,rgba(129,140,248,0.75),transparent_44%),linear-gradient(115deg,#1d4ed8,#4338ca_52%,#0369a1)] sm:h-48">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.8)_0.7px,transparent_0.7px)] [background-size:14px_14px]" />
          <div className="absolute -right-10 -top-40 size-96 rounded-full border border-white/20" />
          <div className="absolute right-24 -top-36 size-80 rounded-full border border-white/15" />
          <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-slate-950/20 to-transparent" />
        </div>
      )}
      <header className={`overflow-hidden border border-slate-200 bg-white shadow-sm ${role === "educators" ? "-mt-5 rounded-b-2xl rounded-t-none" : "rounded-2xl"}`}>
        <div className={`relative isolate overflow-hidden px-5 py-5 sm:px-8 sm:py-6 ${role === "educators" ? "bg-white" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"}`}>
          {role !== "educators" && <div aria-hidden="true" className="absolute -right-12 -top-24 -z-10 size-72 rounded-full border border-blue-100" />}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex max-w-3xl items-start gap-4">
              {role === "educators" && (
                <span aria-hidden="true" className="mt-1 flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-700 text-lg font-bold text-white shadow-md sm:size-16">
                  {classroom.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                </span>
              )}
              <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={classroom.isMock ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}>
                  {classroom.isMock ? "Mock classroom" : "Connected classroom"}
                </Badge>
                <Badge variant="outline">{classroom.subject}</Badge>
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{classroom.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{classroom.description}</p>
              <p className="mt-3 text-sm font-medium text-slate-700">Educator: {classroom.instructorName}
                {classroom.isMock && <span className="font-normal text-slate-500"> · {classroom.members.length} demo members</span>}
              </p>
              </div>
            </div>
            {role === "educators" ? (
              <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                {meetingUrl ? (
                  <>
                    <Link to={`/${role}/classrooms/meeting-room?room=${encodeURIComponent(formatMeetingCode(classroom.meetingId ?? ""))}`} className="inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Join meeting</Link>
                    <Button type="button" variant="outline" onClick={() => void handleCopyMeetingLink()}><Copy aria-hidden="true" /> Copy link</Button>
                  </>
                ) : canCreateMeeting ? (
                  <Button type="button" disabled={creatingMeeting} onClick={() => void handleCreateMeeting()}>{creatingMeeting ? "Creating room…" : "Create meeting room"}</Button>
                ) : (
                  <Badge variant="outline" className="min-h-10 px-3">No meeting room</Badge>
                )}
                {isClassOwner && classroom.joinCode && (
                  <Button type="button" variant="outline" onClick={() => void handleCopyInviteCode()}><Copy aria-hidden="true" /> {classroom.isMock ? "Copy demo invite" : "Copy invite code"}</Button>
                )}
              </div>
            ) : <div className="grid w-full max-w-sm gap-3">{meetingCard}{inviteCard}</div>}
          </div>
        </div>
        {role !== "educators" && <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-8">
          <span>{classroom.isMock ? `${classroom.activities.length} demo activities` : "Classwork service unavailable"}</span>
          <span>{classroom.isMock ? `${classroom.sessions.length} demo sessions` : "Schedule service unavailable"}</span>
          <span>{classroom.isMock ? "Preview classroom" : "Classroom record connected"}</span>
        </div>}
      </header>

      {status && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{status}</p>}

      {role !== "educators" && <Alert className="border-amber-200 bg-amber-50 text-amber-900">
        <School aria-hidden="true" />
        <AlertTitle>{classroom.isMock ? "Classroom workflow preview" : "Connected classroom"}</AlertTitle>
        <AlertDescription className="text-amber-800">
          {classroom.isMock
            ? "This demo classroom and its content exist only in this app session."
            : "Classroom membership and meeting links are connected to the API. Posts, messages, classwork, attendance, sessions, and learner records remain mock data held in this app session only."}
        </AlertDescription>
      </Alert>}

      <Tabs
        value={activeTab}
        onValueChange={(value) => selectTab(String(value))}
        className="min-w-0 flex-col"
      >
        <TabsList variant="line" className="w-full max-w-full justify-start gap-1 overflow-x-auto border-b border-slate-200 p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleTabItems.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="h-11 min-w-fit flex-none rounded-none px-3 group-data-[orientation=horizontal]/tabs:after:bottom-0">
              <Icon aria-hidden="true" className="size-4" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {role === "educators" && <TabsContent value="about" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">About this class</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{classroom.description || "No class description has been provided."}</p>
                </div>
                <dl className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div><dt className="text-xs text-slate-500">Subject</dt><dd className="mt-1 text-sm font-medium text-slate-900">{classroom.subject}</dd></div>
                  <div><dt className="text-xs text-slate-500">Educator</dt><dd className="mt-1 text-sm font-medium text-slate-900">{classroom.instructorName}</dd></div>
                  <div><dt className="text-xs text-slate-500">Class record</dt><dd className="mt-1 text-sm font-medium text-slate-900">{classroom.isMock ? "Demo preview" : "Connected"}</dd></div>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-slate-900">Class access</h2>
                <p className="text-sm leading-5 text-slate-600">Use the class actions in the header to open its meeting room or share the student invite code.</p>
                {classroom.isMock && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo controls only</Badge>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>}
        <TabsContent value="feed" className="pt-4">
          <ClassroomFeedView classroom={classroom} role={role as WorkspaceRole} onOpenMembers={() => selectTab("people")} />
        </TabsContent>
        <TabsContent value="chat" className="pt-4">
          <ClassroomChatView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
        <TabsContent value="classwork" className="pt-4">
          <ClassroomClassworkView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
        <TabsContent value="people" className="pt-4">
          <ClassroomMembersView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
        {visibleTabItems.filter(({ value }) => underDevelopmentTabs.has(value)).map(({ value, label }) => (
          <TabsContent key={value} value={value} className="pt-4">
            <UnderDevelopment title={label} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
