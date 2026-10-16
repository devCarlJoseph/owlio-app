import { useState } from "react"
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Copy,
  GraduationCap,
  MessageCircle,
  MessagesSquare,
  School,
  Users,
} from "lucide-react"
import { Link, useLocation, useParams } from "react-router"
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
import {
  ClassroomAttendanceView,
  ClassroomMaterialsView,
  ClassroomPeopleView,
  ClassroomProgressView,
  ClassroomScheduleView,
} from "./classroom-records-view"
import type { WorkspaceRole } from "./classroom-types"

const tabItems = [
  { value: "feed", label: "Feed", icon: MessagesSquare },
  { value: "chat", label: "Chat", icon: MessageCircle },
  { value: "classwork", label: "Classwork", icon: ClipboardList },
  { value: "materials", label: "Materials", icon: BookOpen },
  { value: "people", label: "People", icon: Users },
  { value: "schedule", label: "Schedule", icon: CalendarDays },
  { value: "attendance", label: "Attendance", icon: GraduationCap },
  { value: "progress", label: "Progress", icon: School },
] as const

export function ClassroomDetailView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? "students"
  const { classroomId } = useParams()
  const { getClassroom, createMeetingLink, classroomsLoading } = useClassroomPrototype()
  const { user } = useAuthSession()
  const [status, setStatus] = useState("")
  const [meetingError, setMeetingError] = useState("")
  const [creatingMeeting, setCreatingMeeting] = useState(false)
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
    ? new URL(`/students/classrooms/meeting-room?room=${encodeURIComponent(formatMeetingCode(classroom.meetingId))}`, window.location.origin).toString()
    : null

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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <Link
        to={`/${role}/classrooms`}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> All classrooms
      </Link>

      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-5 py-6 sm:px-8 sm:py-8">
          <div aria-hidden="true" className="absolute -right-12 -top-24 -z-10 size-72 rounded-full border border-blue-100" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
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
            <div className="grid w-full max-w-sm gap-3">
              <section className="rounded-xl border border-blue-100 bg-white/90 p-4 shadow-sm" aria-labelledby="meeting-link-heading">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 id="meeting-link-heading" className="text-sm font-semibold text-slate-900">Class meeting link</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">One room associated with this class</p>
                  </div>
                  <Badge variant="outline" className={classroom.meetingId
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600"}
                  >
                    {classroom.meetingId ? "Room ready" : "No room yet"}
                  </Badge>
                </div>
                {meetingUrl ? (
                  <>
                    <p className="mt-3 text-xs font-medium text-slate-500">Owlio meeting code</p>
                    <code className="mt-1 block break-all rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold tracking-wider text-slate-800">{formatMeetingCode(classroom.meetingId ?? "")}</code>
                    <code className="mt-3 block break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">{meetingUrl}</code>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => void handleCopyMeetingLink()}>
                        <Copy aria-hidden="true" /> Copy Owlio link
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => void handleCopyMeetingCode()}>
                        <Copy aria-hidden="true" /> Copy room code
                      </Button>
                      <Link
                        to={`/${role}/classrooms/meeting-room?room=${encodeURIComponent(formatMeetingCode(classroom.meetingId ?? ""))}`}
                        className="inline-flex min-h-9 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        Join meeting
                      </Link>
                      {canCreateMeeting && (
                        <Button type="button" variant="outline" size="sm" disabled={creatingMeeting} onClick={() => void handleCreateMeeting()}>
                          {creatingMeeting ? "Checking room…" : "Refresh meeting link"}
                        </Button>
                      )}
                    </div>
                  </>
                ) : isStudent ? (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">The educator has not created a meeting room for this class yet.</p>
                ) : canCreateMeeting ? (
                  <Button type="button" size="sm" className="mt-3" disabled={creatingMeeting} onClick={() => void handleCreateMeeting()}>
                    {creatingMeeting ? "Creating room…" : "Create meeting room"}
                  </Button>
                ) : classroom.isMock ? (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">Create a connected classroom before attaching a real meeting room.</p>
                ) : (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">An educator account must create the meeting room.</p>
                )}
                {meetingError && <p role="alert" className="mt-2 text-xs text-rose-700">{meetingError}</p>}
                <p className="mt-2 text-[11px] leading-4 text-slate-500">{classroom.isMock
                  ? "Demo classrooms are not stored by the API."
                  : "The meeting ID is stored with this classroom and shared with its enrolled students."}
                </p>
              </section>
              {isClassOwner && classroom.joinCode && (
                <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm" aria-labelledby="invite-code-heading">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 id="invite-code-heading" className="text-sm font-semibold text-slate-900">Student invite code</h2>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Share to preview student enrollment.</p>
                    </div>
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo</Badge>
                  </div>
                  <code className="mt-3 block rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold tracking-wider text-slate-800">{classroom.joinCode}</code>
                  <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void handleCopyInviteCode()}>
                    <Copy aria-hidden="true" /> {classroom.isMock ? "Copy demo code" : "Copy invite code"}
                  </Button>
                </section>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-8">
          <span>{classroom.activities.length} demo activities</span>
          <span>{classroom.sessions.length} demo sessions</span>
          <span>Class-only group chat</span>
        </div>
      </header>

      {status && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{status}</p>}

      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
        <School aria-hidden="true" />
        <AlertTitle>{classroom.isMock ? "Classroom workflow preview" : "Connected classroom"}</AlertTitle>
        <AlertDescription className="text-amber-800">
          {classroom.isMock
            ? "This demo classroom and its content exist only in this app session."
            : "Classroom membership and meeting links are connected to the API. Posts, messages, classwork, attendance, sessions, and learner records remain mock data held in this app session only."}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="feed" className="min-w-0">
        <TabsList variant="line" className="w-full justify-start gap-1 overflow-x-auto border-b border-slate-200">
          {tabItems.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="min-w-fit flex-none px-3">
              <Icon aria-hidden="true" className="size-4" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="feed" className="pt-4">
          <ClassroomFeedView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
        <TabsContent value="chat" className="pt-4">
          <ClassroomChatView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
        <TabsContent value="classwork" className="pt-4">
          <ClassroomClassworkView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
        <TabsContent value="materials" className="pt-4">
          <ClassroomMaterialsView classroom={classroom} />
        </TabsContent>
        <TabsContent value="people" className="pt-4">
          <ClassroomPeopleView classroom={classroom} />
        </TabsContent>
        <TabsContent value="schedule" className="pt-4">
          <ClassroomScheduleView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
        <TabsContent value="attendance" className="pt-4">
          <ClassroomAttendanceView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
        <TabsContent value="progress" className="pt-4">
          <ClassroomProgressView classroom={classroom} role={role as WorkspaceRole} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
