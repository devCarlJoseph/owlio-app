import {
  Bell,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  Languages,
  MessagesSquare,
  NotebookPen,
  School,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

const dashboardRoles = ["students", "educators", "tutors", "esl"] as const
type DashboardRole = (typeof dashboardRoles)[number]
type DashboardNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  pageTitle?: string
}
type DashboardNavigationGroup = {
  label: string
  items: DashboardNavigationItem[]
}

const workspaceLabels: Record<DashboardRole, string> = {
  students: "Students",
  educators: "Educators",
  tutors: "Tutors",
  esl: "ESL",
}

const roleNavigation: Record<DashboardRole, DashboardNavigationItem[]> = {
  students: [
    { label: "Overview", pageTitle: "Students", href: "/students", icon: GraduationCap },
    { label: "Subjects", href: "/students/subjects", icon: BookOpen },
    { label: "Tasks", href: "/students/tasks", icon: ClipboardList },
    { label: "Notes", href: "/students/notes", icon: NotebookPen },
    { label: "Study spaces", href: "/students/study-spaces", icon: Users },
    { label: "Classwork", href: "/students/classwork", icon: BookOpenCheck },
  ],
  educators: [
    { label: "Overview", pageTitle: "Educators", href: "/educators", icon: School },
    { label: "Classwork & assessment", href: "/educators/classwork", icon: ClipboardList },
    { label: "Attendance", href: "/educators/attendance", icon: CalendarDays },
    { label: "Learners", href: "/educators/learners", icon: Users },
  ],
  tutors: [
    { label: "Overview", pageTitle: "Tutors", href: "/tutors", icon: UserRound },
    { label: "Sessions", href: "/tutors/sessions", icon: CalendarDays },
    { label: "Activities & evaluations", href: "/tutors/classwork", icon: ClipboardList },
    { label: "Attendance", href: "/tutors/attendance", icon: CalendarDays },
    { label: "Learners", href: "/tutors/learners", icon: Users },
  ],
  esl: [
    { label: "Overview", pageTitle: "ESL", href: "/esl", icon: Languages },
    { label: "Lessons", href: "/esl/lessons", icon: BookOpen },
    { label: "Activities & assessments", href: "/esl/classwork", icon: ClipboardList },
    { label: "Attendance", href: "/esl/attendance", icon: CalendarDays },
    { label: "Learners", href: "/esl/learners", icon: Users },
  ],
}

const sharedNavigation: DashboardNavigationItem[] = [
  { label: "Classrooms", href: "/classrooms", icon: School },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "Materials", href: "/materials", icon: FolderOpen },
  { label: "Communication", href: "/communication", icon: MessagesSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Progress", href: "/progress", icon: ChartNoAxesCombined },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
]

export function getDashboardRole(pathname: string): DashboardRole | undefined {
  const roleSegment = pathname.split("/").filter(Boolean)[0]
  return dashboardRoles.find((role) => role === roleSegment)
}

export function getDashboardNavigation(pathname: string): DashboardNavigationGroup[] {
  const role = getDashboardRole(pathname)

  return [
    ...(role ? [{ label: workspaceLabels[role], items: roleNavigation[role] }] : []),
    { label: "Shared", items: sharedNavigation },
  ]
}

export function getDashboardPageTitle(pathname: string): string {
  const role = getDashboardRole(pathname)
  const items = [...(role ? roleNavigation[role] : []), ...sharedNavigation]
  const currentPage = items.find(({ href }) => pathname === href)

  return currentPage?.pageTitle ?? currentPage?.label ?? (role ? workspaceLabels[role] : "Workspace")
}
