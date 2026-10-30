import {
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  CircleHelp,
  FolderOpen,
  GraduationCap,
  Languages,
  Megaphone,
  NotebookPen,
  School,
  Sparkles,
  UserRound,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react"

const dashboardRoles = ["students", "educators", "tutors", "esl"] as const
type DashboardRole = (typeof dashboardRoles)[number]
type DashboardNavigationItem = {
  label: string
  href?: string
  icon: LucideIcon
  pageTitle?: string
}
type DashboardNavigationGroup = {
  label: string
  showLabel?: boolean
  placement?: "footer"
  items: DashboardNavigationItem[]
}
type NavigableDashboardNavigationItem = DashboardNavigationItem & { href: string }
type NavigableDashboardNavigationGroup = Omit<DashboardNavigationGroup, "items"> & {
  items: NavigableDashboardNavigationItem[]
}

const workspaceLabels: Record<DashboardRole, string> = {
  students: "Students",
  educators: "Educators",
  tutors: "Tutors",
  esl: "ESL",
}

const roleNavigation: Record<DashboardRole, DashboardNavigationGroup[]> = {
  students: [
    {
      label: "Overview",
      showLabel: false,
      items: [
        { label: "Overview", href: "/students", icon: GraduationCap },
      ],
    },
    {
      label: "Learning",
      items: [
        { label: "My Learning", href: "/students/subjects", icon: BookOpen },
        { label: "My Classes", href: "/students/classrooms", icon: School },
        { label: "Study Library", href: "/students/materials", icon: FolderOpen },
        { label: "Study Spaces", href: "/students/study-spaces", icon: Users },
      ],
    },
    {
      label: "Communication",
      items: [
        { label: "Meeting Room", href: "/students/classrooms/meeting-room", icon: Video },
      ],
    },
    {
      label: "Academic",
      items: [
        { label: "Calendar and Schedule", href: "/students/schedule", icon: CalendarDays },
        { label: "Task and Assessments", href: "/students/tasks", icon: ClipboardList },
        { label: "Progress and Grade", href: "/students/progress", icon: ChartNoAxesCombined },
      ],
    },
    {
      label: "Tools & Support",
      items: [
        { label: "AI Assistant", icon: Sparkles },
        { label: "Help and Support", icon: CircleHelp },
      ],
    },
  ],
  educators: [
    {
      label: "Overview",
      showLabel: false,
      items: [
        { label: "Overview", href: "/educators", icon: School },
      ],
    },
    {
      label: "Teaching & Management",
      items: [
        { label: "My Classes", href: "/educators/classrooms", icon: School },
        { label: "Classworks and Assessments", href: "/educators/classwork", icon: ClipboardList },
        { label: "Students", href: "/educators/learners", icon: Users },
        { label: "Attendance", href: "/educators/attendance", icon: CalendarCheck },
        { label: "Grade Book", icon: BookOpenCheck },
      ],
    },
    {
      label: "Communication",
      items: [
        { label: "Announcements", icon: Megaphone },
        { label: "Meeting Room", href: "/educators/classrooms/meeting-room", icon: Video },
      ],
    },
    {
      label: "Planning",
      items: [
        { label: "Lesson Planner", icon: BookOpen },
        { label: "Teaching Materials", href: "/educators/materials", icon: FolderOpen },
        { label: "Calendar and Schedule", href: "/educators/schedule", icon: CalendarDays },
      ],
    },
    {
      label: "AI & Insights",
      items: [
        { label: "AI Form Assistant", href: "/educators/ai-assistant", icon: Sparkles },
        { label: "Teaching Insights", href: "/educators/progress", icon: ChartNoAxesCombined },
      ],
    },
  ],
  esl: [
    {
      label: "Overview",
      showLabel: false,
      items: [
        { label: "Overview", href: "/esl", icon: Languages },
      ],
    },
    {
      label: "Teaching",
      items: [
        { label: "My Learning", icon: Users },
        { label: "My Classes", href: "/esl/classrooms", icon: School },
        { label: "Lesson Plans", href: "/esl/lessons", icon: BookOpen },
        { label: "Teaching Materials", href: "/esl/materials", icon: FolderOpen },
        { label: "Activities and Assessment", href: "/esl/classwork", icon: ClipboardList },
      ],
    },
    {
      label: "Live Learning",
      items: [
        { label: "Lesson Schedule", href: "/esl/schedule", icon: CalendarDays },
        { label: "Meeting Room", href: "/esl/classrooms/meeting-room", icon: Video },
      ],
    },
    {
      label: "Communication",
      items: [
        { label: "Announcements", icon: Megaphone },
      ],
    },
    {
      label: "Progress & AI",
      items: [
        { label: "Learner Progress", href: "/esl/progress", icon: ChartNoAxesCombined },
        { label: "Feedback and Notes", icon: NotebookPen },
        { label: "AI Lesson Assistant", href: "/esl/ai-assistant", icon: Sparkles },
      ],
    },
  ],
  tutors: [
    {
      label: "Overview",
      showLabel: false,
      items: [
        { label: "Overview", href: "/tutors", icon: UserRound },
      ],
    },
    {
      label: "Learner Management",
      items: [
        { label: "My Learners", href: "/tutors/learners", icon: Users },
        { label: "My Classes", href: "/tutors/classrooms", icon: School },
        { label: "Learning Plans", href: "/tutors/learning-plans", icon: BookOpen },
        { label: "Activities and Evaluation", href: "/tutors/classwork", icon: ClipboardList },
      ],
    },
    {
      label: "Sessions & Communication",
      items: [
        { label: "Sessions and Schedule", href: "/tutors/sessions", icon: CalendarDays },
        { label: "Session Notes", href: "/tutors/session-notes", icon: NotebookPen },
        { label: "Meeting Room", href: "/tutors/classrooms/meeting-room", icon: Video },
        { label: "Announcements", href: "/tutors/announcements", icon: Megaphone },
      ],
    },
    {
      label: "Resources & Progress",
      items: [
        { label: "Teaching Materials", href: "/tutors/materials", icon: FolderOpen },
        { label: "Student Progress", href: "/tutors/progress", icon: ChartNoAxesCombined },
        { label: "AI Tutor Assistant", href: "/tutors/ai-assistant", icon: Sparkles },
      ],
    },
  ],
}

function isNavigableItem(item: DashboardNavigationItem): item is NavigableDashboardNavigationItem {
  return typeof item.href === "string"
}

export function getDashboardRole(pathname: string): DashboardRole | undefined {
  const roleSegment = pathname.split("/").filter(Boolean)[0]
  return dashboardRoles.find((role) => role === roleSegment)
}

const workspaceIcons: Record<DashboardRole, LucideIcon> = {
  students: GraduationCap,
  educators: School,
  tutors: UserRound,
  esl: Languages,
}

export function getDashboardWorkspace(pathname: string): { label: string; icon: LucideIcon; homeHref: string } | undefined {
  const role = getDashboardRole(pathname)

  return role ? { label: `${workspaceLabels[role]} workspace`, icon: workspaceIcons[role], homeHref: `/${role}` } : undefined
}

export function getDashboardNotificationHref(pathname: string): string | undefined {
  const role = getDashboardRole(pathname)
  return role ? `/${role}/notifications` : undefined
}

export function getActiveDashboardHref(pathname: string): string | undefined {
  const role = getDashboardRole(pathname)

  return getDashboardSidebarNavigation(pathname)
    .flatMap(({ items }) => items)
    .filter((item): item is NavigableDashboardNavigationItem => isNavigableItem(item) && matchesRoute(pathname, item.href, role))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href
}

export function getDashboardSidebarNavigation(pathname: string): DashboardNavigationGroup[] {
  const role = getDashboardRole(pathname)

  return role ? roleNavigation[role] : []
}

export function getDashboardNavigation(pathname: string): NavigableDashboardNavigationGroup[] {
  return getDashboardSidebarNavigation(pathname)
    .map((group) => ({ ...group, items: group.items.filter(isNavigableItem) }))
    .filter(({ items }) => items.length > 0)
}

function matchesRoute(pathname: string, href: string, role: DashboardRole | undefined) {
  return pathname === href || (href !== `/${role}` && pathname.startsWith(`${href}/`))
}

export function getDashboardPageTitle(pathname: string): string {
  const role = getDashboardRole(pathname)
  if (pathname === getDashboardNotificationHref(pathname)) return "Notifications"
  const currentPage = getDashboardNavigation(pathname)
    .flatMap(({ items }) => items)
    .filter(({ href }) => matchesRoute(pathname, href, role))
    .sort((first, second) => second.href.length - first.href.length)[0]

  return currentPage?.pageTitle ?? currentPage?.label ?? (role ? workspaceLabels[role] : "Workspace")
}
