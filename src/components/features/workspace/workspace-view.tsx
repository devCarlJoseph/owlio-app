import { useState, type FormEvent, type ReactNode } from "react"
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router"
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListChecks,
  MessageSquareText,
  NotebookPen,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  previewAssignments,
  previewClasses,
  roleNavigation,
  roleOptions,
  sectionDetails,
  type WorkspaceNavigationItem,
  type WorkspaceSection,
} from "./workspace-preview-data"
import type { WorkspaceRole } from "./workspace-types"

type DemoClass = { name: string; detail: string; color: string; initials: string }

const roleLabels: Record<WorkspaceRole, string> = {
  student: "Student workspace",
  educator: "Educator workspace",
  esl: "ESL teaching workspace",
  tutor: "Tutor workspace",
}

const iconBySection: Record<WorkspaceSection, LucideIcon> = {
  overview: LayoutDashboard,
  classes: GraduationCap,
  classwork: ClipboardCheck,
  assignments: ClipboardList,
  assessments: FileCheck2,
  materials: Library,
  schedule: CalendarDays,
  progress: ChartNoAxesCombined,
  notifications: Bell,
  settings: Settings,
  courses: BookOpen,
  attendance: CheckCircle2,
  grades: ChartNoAxesCombined,
  students: Users,
  "lesson-library": Library,
  feedback: MessageSquareText,
  sessions: Clock3,
  activities: ListChecks,
  "session-notes": NotebookPen,
  "ai-assistant": Sparkles,
}

const demoGroups: Record<Exclude<WorkspaceRole, "student">, DemoClass[]> = {
  educator: [
    { name: "Biology · Group A", detail: "18 learners · Next class today, 10:00 AM", color: "bg-emerald-100 text-emerald-700", initials: "BA" },
    { name: "Writing workshop", detail: "24 learners · Next class tomorrow, 1:30 PM", color: "bg-violet-100 text-violet-700", initials: "WW" },
    { name: "World history", detail: "16 learners · Next class Friday, 9:00 AM", color: "bg-amber-100 text-amber-700", initials: "WH" },
  ],
  esl: [
    { name: "Everyday conversation", detail: "Small group · Speaking & listening", color: "bg-sky-100 text-sky-700", initials: "EC" },
    { name: "Academic English", detail: "Lesson planning · Reading & writing", color: "bg-violet-100 text-violet-700", initials: "AE" },
    { name: "Vocabulary practice", detail: "Reusable activities · Mixed levels", color: "bg-amber-100 text-amber-700", initials: "VP" },
  ],
  tutor: [
    { name: "Study skills · 1:1", detail: "Individual learner · Next session today", color: "bg-sky-100 text-sky-700", initials: "SS" },
    { name: "Math foundations", detail: "Small group · Next session tomorrow", color: "bg-violet-100 text-violet-700", initials: "MF" },
    { name: "Writing support", detail: "Individual learner · Weekly session", color: "bg-amber-100 text-amber-700", initials: "WS" },
  ],
}

function isWorkspaceRole(value: string | null): value is WorkspaceRole {
  return roleOptions.some((option) => option.id === value)
}

function getActiveSection(pathname: string, role: WorkspaceRole): WorkspaceSection {
  const lastSegment = pathname.split("/").filter(Boolean).at(-1)
  return roleNavigation[role].some((item) => item.id === lastSegment)
    ? (lastSegment as WorkspaceSection)
    : "overview"
}

function sectionPath(section: WorkspaceSection, role: WorkspaceRole) {
  return `/workspace/${section}?role=${role}`
}

function Brand() {
  return (
    <Link to="/" className="flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">
      <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <GraduationCap size={21} aria-hidden="true" />
      </span>
      <span className="text-xl font-bold tracking-tight text-slate-950">owlio<span className="text-indigo-600">.</span></span>
    </Link>
  )
}

function PreviewBanner() {
  return (
    <div role="status" className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-indigo-100 bg-indigo-50 px-4 py-2 text-xs text-indigo-950 sm:px-6 lg:px-8">
      <span className="rounded-full bg-indigo-600 px-2 py-0.5 font-semibold text-white">Preview</span>
      <span><strong>Demo workspace:</strong> sample content only. No account session or backend data is connected.</span>
    </div>
  )
}

function WorkspaceSidebar({ role, section }: { role: WorkspaceRole; section: WorkspaceSection }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-[72px] items-center border-b border-slate-100 px-6"><Brand /></div>
      <div className="px-4 pt-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</p>
        <nav aria-label={`${roleLabels[role]} navigation`} className="space-y-1">
          {roleNavigation[role].map((item) => <NavigationLink key={item.id} item={item} role={role} active={section === item.id} />)}
        </nav>
      </div>
      <div className="mt-auto px-4 pb-5">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Learning works better together</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Your preview helps explore the shape of an Owlio workspace.</p>
        </div>
      </div>
    </aside>
  )
}

function NavigationLink({ item, role, active }: { item: WorkspaceNavigationItem; role: WorkspaceRole; active: boolean }) {
  const Icon = iconBySection[item.id]
  return (
    <NavLink
      to={sectionPath(item.id, role)}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
    >
      <Icon size={17} aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  )
}

function WorkspaceHeader({ role, onRoleChange, section }: { role: WorkspaceRole; onRoleChange: (role: WorkspaceRole) => void; section: WorkspaceSection }) {
  const navigate = useNavigate()
  const sectionLabel = roleNavigation[role].find((item) => item.id === section)?.label ?? "Overview"

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:hidden"><Brand /></div>
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold text-slate-900">{sectionLabel}</p>
          <p className="text-xs text-slate-500">{roleLabels[role]}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <label className="sr-only" htmlFor="workspace-role">Choose a workspace preview</label>
          <select
            id="workspace-role"
            value={role}
            onChange={(event) => onRoleChange(event.target.value as WorkspaceRole)}
            className="h-9 max-w-36 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:max-w-none sm:px-3 sm:text-sm"
          >
            {roleOptions.map((option) => <option key={option.id} value={option.id}>{option.label} preview</option>)}
          </select>
          <Button variant="ghost" size="icon" aria-label="Open notifications" onClick={() => navigate(sectionPath("notifications", role))} className="hidden text-slate-600 sm:inline-flex">
            <Bell size={18} />
          </Button>
          <Link to="/auth/login" className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:px-4 sm:text-sm">
            Sign in
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-2 lg:hidden">
        <label htmlFor="workspace-section" className="sr-only">Workspace page</label>
        <select
          id="workspace-section"
          value={section}
          onChange={(event) => navigate(sectionPath(event.target.value as WorkspaceSection, role))}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {roleNavigation[role].map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </div>
    </header>
  )
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

function StatCard({ label, value, detail, icon: Icon, tint }: { label: string; value: string; detail: string; icon: LucideIcon; tint: string }) {
  return (
    <Card className="gap-0 border-slate-200 py-0 shadow-none">
      <CardContent className="flex min-h-[116px] flex-row items-start justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tint}`}><Icon size={18} aria-hidden="true" /></span>
      </CardContent>
    </Card>
  )
}

function OverviewDashboard({ role, classes, onCreateClass }: { role: WorkspaceRole; classes: DemoClass[]; onCreateClass: () => void }) {
  const isStudent = role === "student"
  const isEsl = role === "esl"
  const isTutor = role === "tutor"
  const groups = isStudent ? classes : demoGroups[role]
  const label = isStudent ? "My classes" : isTutor ? "Tutoring plan" : isEsl ? "Teaching focus" : "My classrooms"

  return (
    <>
      <PageHeading
        eyebrow={isStudent ? "Your learning space" : isTutor ? "Independent teaching" : isEsl ? "English language teaching" : "Teaching workspace"}
        title={isStudent ? "Good morning, Maya" : isTutor ? "Your tutoring day" : isEsl ? "Your English teaching overview" : "Your teaching overview"}
        description={isStudent ? "A clear view of what to learn next, what is coming up, and where to find your class resources." : isTutor ? "Keep upcoming sessions, learner practice, and your teaching notes in one flexible workspace." : isEsl ? "Plan language lessons and keep speaking, listening, reading, and writing activities close at hand." : "Keep your classes, learner activity, and work to review moving forward."}
        action={!isStudent ? <Button onClick={onCreateClass} className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700"><span aria-hidden="true">+</span>{isTutor ? "Plan a session" : "Create a class"}</Button> : undefined}
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isStudent ? <>
          <StatCard label="My classes" value="03" detail="Sample enrolled classes" icon={GraduationCap} tint="bg-indigo-50 text-indigo-700" />
          <StatCard label="Due this week" value="03" detail="Sample assignments" icon={ClipboardList} tint="bg-amber-50 text-amber-700" />
          <StatCard label="Next session" value="10:00" detail="Biology · sample schedule" icon={CalendarDays} tint="bg-emerald-50 text-emerald-700" />
          <StatCard label="Learning streak" value="4 days" detail="Sample personal goal" icon={ChartNoAxesCombined} tint="bg-violet-50 text-violet-700" />
        </> : <>
          <StatCard label={isTutor ? "Learners" : "Active learning groups"} value={isTutor ? "08" : "04"} detail="Sample workspace data" icon={Users} tint="bg-indigo-50 text-indigo-700" />
          <StatCard label={isTutor ? "Sessions this week" : "Upcoming sessions"} value={isTutor ? "06" : "05"} detail="Sample schedule" icon={CalendarDays} tint="bg-emerald-50 text-emerald-700" />
          <StatCard label="Work to review" value="07" detail="Sample review queue" icon={ClipboardCheck} tint="bg-amber-50 text-amber-700" />
          <StatCard label={isEsl ? "Lesson activities" : "Learning materials"} value="12" detail="Sample teaching resources" icon={Library} tint="bg-violet-50 text-violet-700" />
        </>}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.9fr)]">
        <Card className="border-slate-200 py-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-4">
            <div><CardTitle className="text-base font-semibold">{label}</CardTitle><p className="mt-1 text-xs text-slate-500">{isStudent ? "Your current learning spaces" : isTutor ? "Flexible learner and session groups" : isEsl ? "Language-learning spaces and lesson themes" : "Classes and learner groups"}</p></div>
            <Link to={sectionPath("classes", role)} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900">View all <ArrowRight size={14} /></Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {groups.map((item) => <div key={item.name} className="flex items-center gap-3 px-4 py-4 sm:px-5">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${item.color}`}>{item.initials}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{item.name}</p><p className="mt-1 truncate text-xs text-slate-500">{item.detail}</p></div>
              <ArrowRight size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
            </div>)}
          </CardContent>
        </Card>
        {isStudent ? <AssignmentPanel role={role} /> : <EducatorPanel role={role} />}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SchedulePanel role={role} />
        <AnnouncementPanel role={role} />
      </div>
    </>
  )
}

function AssignmentPanel({ role }: { role: WorkspaceRole }) {
  return (
    <Card className="border-slate-200 py-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-4">
        <div><CardTitle className="text-base font-semibold">Coming up</CardTitle><p className="mt-1 text-xs text-slate-500">Sample deadlines for your classes</p></div>
        <Link to={sectionPath("assignments", role)} aria-label="View all assignments" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><ArrowRight size={16} /></Link>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 p-0">
        {previewAssignments.map((item) => <div key={item.title} className="px-4 py-3.5 sm:px-5">
          <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold leading-5 text-slate-900">{item.title}</p><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${item.tone}`}>{item.status}</span></div>
          <p className="mt-1 text-xs text-slate-500">{item.className} · {item.due}</p>
        </div>)}
      </CardContent>
    </Card>
  )
}

function EducatorPanel({ role }: { role: WorkspaceRole }) {
  const title = role === "tutor" ? "Session preparation" : role === "esl" ? "Language lesson ideas" : "Needs your attention"
  const rows = role === "tutor"
    ? ["Review learner goals", "Prepare a practice activity", "Add a note after your session"]
    : role === "esl"
      ? ["Conversation warm-up · speaking", "Listening comprehension · short clip", "Vocabulary review · learner choice"]
      : ["Review 4 learner submissions", "Check attendance for Biology · Group A", "Share feedback on Writing workshop"]
  return (
    <Card className="border-slate-200 py-0 shadow-none">
      <CardHeader className="border-b border-slate-100 py-4"><CardTitle className="text-base font-semibold">{title}</CardTitle><p className="mt-1 text-xs text-slate-500">Sample suggestions · not live student records</p></CardHeader>
      <CardContent className="space-y-1 p-3">
        {rows.map((row, index) => <div key={row} className="flex items-start gap-3 rounded-lg px-2 py-3">
          <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${index === 0 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}><CheckCircle2 size={15} /></span>
          <p className="text-sm leading-5 text-slate-700">{row}</p>
        </div>)}
        <Link to={sectionPath(role === "tutor" ? "sessions" : "classwork", role)} className="mt-1 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100">Open {role === "tutor" ? "session planning" : "review workspace"}<ArrowRight size={15} /></Link>
      </CardContent>
    </Card>
  )
}

function SchedulePanel({ role }: { role: WorkspaceRole }) {
  const entries = role === "student"
    ? [{ time: "10:00 AM", title: "Foundations of Biology", detail: "Room B · Sample class" }, { time: "1:30 PM", title: "Writing Workshop", detail: "Bring your draft · Sample class" }]
    : role === "tutor"
      ? [{ time: "10:00 AM", title: "Study skills session", detail: "One-to-one · Sample appointment" }, { time: "2:30 PM", title: "Math foundations", detail: "Small group · Sample appointment" }]
      : [{ time: "10:00 AM", title: role === "esl" ? "Conversation practice" : "Biology · Group A", detail: "Sample learning session" }, { time: "1:30 PM", title: role === "esl" ? "Academic English" : "Writing workshop", detail: "Sample learning session" }]
  return (
    <Card className="border-slate-200 py-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-4"><div><CardTitle className="text-base font-semibold">Today’s schedule</CardTitle><p className="mt-1 text-xs text-slate-500">Times shown are sample data</p></div><Link to={sectionPath("schedule", role)} className="text-xs font-semibold text-indigo-700 hover:text-indigo-900">Open schedule</Link></CardHeader>
      <CardContent className="divide-y divide-slate-100 p-0">
        {entries.map((entry) => <div key={entry.title} className="flex gap-4 px-4 py-4 sm:px-5"><div className="w-20 shrink-0 text-xs font-semibold text-indigo-700">{entry.time}</div><div className="border-l-2 border-indigo-100 pl-4"><p className="text-sm font-semibold text-slate-900">{entry.title}</p><p className="mt-1 text-xs text-slate-500">{entry.detail}</p></div></div>)}
      </CardContent>
    </Card>
  )
}

function AnnouncementPanel({ role }: { role: WorkspaceRole }) {
  const title = role === "student" ? "Class note" : role === "esl" ? "Teaching reminder" : role === "tutor" ? "Session note" : "Workspace update"
  const message = role === "student"
    ? "Your next biology activity is ready to review. Check the class materials before your sample session."
    : role === "esl"
      ? "Keep lesson activities adaptable to each learner’s goals and preferred practice format."
      : role === "tutor"
        ? "Add a short reflection after each session to make the next meeting easier to prepare."
        : "Review learner work alongside the lesson and criteria shared with your class."
  return (
    <Card className="border-slate-200 py-0 shadow-none">
      <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-100 py-4"><span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><MessageSquareText size={17} /></span><div><CardTitle className="text-base font-semibold">{title}</CardTitle><p className="mt-1 text-xs text-slate-500">Sample content · Preview only</p></div></CardHeader>
      <CardContent className="py-4"><p className="text-sm leading-6 text-slate-600">{message}</p></CardContent>
    </Card>
  )
}

function DevelopmentSection({ role, section }: { role: WorkspaceRole; section: WorkspaceSection }) {
  const details = sectionDetails[section]
  if (!details) return <OverviewDashboard role={role} classes={previewClasses} onCreateClass={() => {}} />
  const Icon = iconBySection[section]
  return (
    <>
      <PageHeading eyebrow={roleLabels[role]} title={details.title} description={details.description} />
      <Card className="border-dashed border-indigo-200 bg-white py-0 shadow-none">
        <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-7">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><Icon size={23} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">Development placeholder</span>
            <p className="mt-3 text-sm font-semibold text-slate-900">This area is not connected to live product data.</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{details.nextStep}</p>
          </div>
          <Link to={sectionPath("overview", role)} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to overview <ArrowRight size={15} /></Link>
        </CardContent>
      </Card>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200 py-0 shadow-none"><CardContent className="flex gap-3 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600"><GraduationCap size={17} /></span><div><p className="text-sm font-semibold text-slate-900">Role-aware workspace</p><p className="mt-1 text-xs leading-5 text-slate-500">This page is part of the {roleOptions.find((option) => option.id === role)?.label.toLowerCase()} navigation. Protected access still requires server-side authorization.</p></div></CardContent></Card>
        <Card className="border-slate-200 py-0 shadow-none"><CardContent className="flex gap-3 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600"><Settings size={17} /></span><div><p className="text-sm font-semibold text-slate-900">What is needed next</p><p className="mt-1 text-xs leading-5 text-slate-500">Confirm API response shapes, permissions, and data ownership before connecting this workflow.</p></div></CardContent></Card>
      </div>
    </>
  )
}

function ClassAction({ role, onCreateClass }: { role: WorkspaceRole; onCreateClass: (name: string) => void }) {
  const [value, setValue] = useState("")
  const [message, setMessage] = useState("")
  const isStudent = role === "student"

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanValue = value.trim()
    if (isStudent) {
      if (!/^[a-zA-Z0-9-]{5,12}$/.test(cleanValue)) {
        setMessage("Enter a class code between 5 and 12 letters, numbers, or hyphens.")
        return
      }
      setMessage("This code format is valid, but the preview cannot verify it or enroll you. No membership was created.")
      return
    }
    if (cleanValue.length < 3) {
      setMessage("Use at least 3 characters for the class name.")
      return
    }
    onCreateClass(cleanValue)
    setMessage(`“${cleanValue}” was added to this preview only. It has not been saved to an account.`)
    setValue("")
  }

  return (
    <Card className="mt-5 border-slate-200 py-0 shadow-none">
      <CardHeader className="border-b border-slate-100 py-4"><CardTitle className="text-base font-semibold">{isStudent ? "Join a class" : role === "tutor" ? "Plan a learning group" : "Create a learning space"}</CardTitle><p className="mt-1 text-xs text-slate-500">{isStudent ? "Preview validation only — enrollment requires the Owlio service." : "This creates a temporary preview item in this browser session only."}</p></CardHeader>
      <CardContent className="py-4">
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
          <label className="sr-only" htmlFor="class-action-input">{isStudent ? "Class code" : "Class name"}</label>
          <Input id="class-action-input" value={value} onChange={(event) => { setValue(event.target.value); setMessage("") }} placeholder={isStudent ? "Enter class code" : "e.g. Intro to biology"} maxLength={60} aria-describedby={message ? "class-action-message" : undefined} />
          <Button type="submit" className="shrink-0 bg-indigo-600 text-white hover:bg-indigo-700">{isStudent ? "Check code" : "Add to preview"}</Button>
        </form>
        {message && <p id="class-action-message" role="status" className="mt-3 text-sm leading-5 text-slate-600">{message}</p>}
      </CardContent>
    </Card>
  )
}

function WorkspaceContent({ role, section, classes, onCreateClass, onOpenClasses }: { role: WorkspaceRole; section: WorkspaceSection; classes: DemoClass[]; onCreateClass: (name: string) => void; onOpenClasses: () => void }) {
  if (section === "overview") return <OverviewDashboard role={role} classes={classes} onCreateClass={onOpenClasses} />
  return (
    <>
      <DevelopmentSection role={role} section={section} />
      {section === "classes" && <ClassAction role={role} onCreateClass={onCreateClass} />}
    </>
  )
}

export function WorkspaceView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const roleValue = searchParams.get("role")
  const role: WorkspaceRole = isWorkspaceRole(roleValue) ? roleValue : "student"
  const location = useLocation()
  const section = getActiveSection(location.pathname, role)
  const [classes, setClasses] = useState<DemoClass[]>(previewClasses)

  function changeRole(nextRole: WorkspaceRole) {
    setSearchParams({ role: nextRole })
  }

  function addClass(name: string) {
    setClasses((current) => [{ name, detail: "Created locally · Preview only", color: "bg-indigo-100 text-indigo-700", initials: name.split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") }, ...current])
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PreviewBanner />
      <div className="flex min-h-[calc(100vh-33px)]">
        <WorkspaceSidebar role={role} section={section} />
        <div className="flex min-w-0 flex-1 flex-col">
          <WorkspaceHeader role={role} onRoleChange={changeRole} section={section} />
          <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <WorkspaceContent role={role} section={section} classes={classes} onCreateClass={addClass} onOpenClasses={() => navigate(sectionPath("classes", role))} />
            </div>
          </main>
          <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
            Owlio workspace preview · Sample content is not account data. <Link to="/auth/register" className="font-semibold text-indigo-700 hover:underline">Create an account</Link>
          </footer>
        </div>
      </div>
    </div>
  )
}
