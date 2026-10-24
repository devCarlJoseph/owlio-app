import {
  Bell,
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
  MessagesSquare,
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
      items: [{ label: "Overview", href: "/students", icon: GraduationCap }],
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
        { label: "Discussions", href: "/students/communication", icon: MessagesSquare },
        { label: "Notifications", href: "/students/notifications", icon: Bell },
      ],
    },
    {
      label: "Academic",
      items: [
        { label: "Calendar & Schedule", href: "/students/schedule", icon: CalendarDays },
        { label: "Tasks & Assessments", href: "/students/tasks", icon: ClipboardList },
        { label: "Progress & Grades", href: "/students/progress", icon: ChartNoAxesCombined },
      ],
    },
    {
      label: "Tools & Support",
      items: [
        { label: "AI Study Assistant", icon: Sparkles },
        { label: "Help & Support", icon: CircleHelp },
      ],
    },
    {
      label: "Account",
      placement: "footer",
      items: [{ label: "Account security", href: "/students/account/security", icon: UserRound }],
    },
  ],
  educators: [
    {
      label: "Overview",
      showLabel: false,
      items: [{ label: "Overview", href: "/educators", icon: School }],
    },
    {
      label: "Teaching & Management",
      items: [
        { label: "My Classes", href: "/educators/classrooms", icon: School },
        { label: "Classwork & Assessments", href: "/educators/classwork", icon: ClipboardList },
        { label: "Students", href: "/educators/learners", icon: Users },
        { label: "Attendance", href: "/educators/attendance", icon: CalendarCheck },
        { label: "Gradebook", icon: BookOpenCheck },
      ],
    },
    {
      label: "Communication",
      items: [
        { label: "Meeting Room", href: "/educators/classrooms/meeting-room", icon: Video },
        { label: "Discussions", href: "/educators/communication", icon: MessagesSquare },
        { label: "Announcements", icon: Megaphone },
        { label: "Notifications", href: "/educators/notifications", icon: Bell },
      ],
    },
    {
      label: "Planning",
      items: [
        { label: "Lesson Planner", icon: BookOpen },
        { label: "Calendar & Schedule", href: "/educators/schedule", icon: CalendarDays },
        { label: "Teaching Materials", href: "/educators/materials", icon: FolderOpen },
      ],
    },
    {
      label: "AI & Insights",
      items: [
        { label: "AI Form Assistant", href: "/educators/ai-assistant", icon: Sparkles },
        { label: "Teaching Insights", href: "/educators/progress", icon: ChartNoAxesCombined },
      ],
    },
    {
      label: "Account",
      placement: "footer",
      items: [{ label: "Account security", href: "/educators/account/security", icon: UserRound }],
    },
  ],
  tutors: [
    {
      label: "Overview",
      showLabel: false,
      items: [{ label: "Overview", href: "/tutors", icon: UserRound }],
    },
    {
      label: "Learner Management",
      items: [
        { label: "My Learners", href: "/tutors/learners", icon: Users },
        { label: "Learning Plans", href: "/tutors/learning-plans", icon: BookOpen },
        { label: "Activities & Evaluations", href: "/tutors/classwork", icon: ClipboardList },
      ],
    },
    {
      label: "Sessions & Communication",
      items: [
        { label: "Sessions & Schedule", href: "/tutors/sessions", icon: CalendarDays },
        { label: "Session Attendance", href: "/tutors/attendance", icon: CalendarCheck },
        { label: "Session Notes", href: "/tutors/session-notes", icon: NotebookPen },
        { label: "Meeting Room", href: "/tutors/classrooms/meeting-room", icon: Video },
        { label: "Discussions", href: "/tutors/communication", icon: MessagesSquare },
        { label: "Announcements", href: "/tutors/announcements", icon: Megaphone },
        { label: "Notifications", href: "/tutors/notifications", icon: Bell },
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
    {
      label: "Account",
      placement: "footer",
      items: [
        { label: "Profile & Settings", href: "/tutors/settings", icon: UserRound },
        { label: "Account security", href: "/tutors/account/security", icon: UserRound },
      ],
    },
  ],
  esl: [
    {
      label: "Overview",
      showLabel: false,
      items: [{ label: "Overview", href: "/esl", icon: Languages }],
    },
    {
      label: "Teaching",
      items: [
        { label: "My Learners", href: "/esl/learners", icon: Users },
        { label: "Lesson Plans", href: "/esl/lessons", icon: BookOpen },
        { label: "Teaching Materials", href: "/esl/materials", icon: FolderOpen },
        { label: "Activities & Assessments", href: "/esl/classwork", icon: ClipboardList },
        { label: "Lesson Attendance", href: "/esl/attendance", icon: CalendarCheck },
      ],
    },
    {
      label: "Live Learning",
      items: [
        { label: "Meeting Room", href: "/esl/classrooms/meeting-room", icon: Video },
        { label: "Lesson Schedule", href: "/esl/schedule", icon: CalendarDays },
      ],
    },
    {
      label: "Communication",
      items: [
        { label: "Discussions", href: "/esl/communication", icon: MessagesSquare },
        { label: "Announcements", icon: Megaphone },
        { label: "Notifications", href: "/esl/notifications", icon: Bell },
      ],
    },
    {
      label: "Progress & AI",
      items: [
        { label: "Learner Progress", href: "/esl/progress", icon: ChartNoAxesCombined },
        { label: "Feedback & Notes", icon: NotebookPen },
        { label: "AI Lesson Assistant", href: "/esl/ai-assistant", icon: Sparkles },
      ],
    },
    {
      label: "Account",
      placement: "footer",
      items: [{ label: "Account security", href: "/esl/account/security", icon: UserRound }],
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
  const currentPage = getDashboardNavigation(pathname)
    .flatMap(({ items }) => items)
    .filter(({ href }) => matchesRoute(pathname, href, role))
    .sort((first, second) => second.href.length - first.href.length)[0]

  return currentPage?.pageTitle ?? currentPage?.label ?? (role ? workspaceLabels[role] : "Workspace")
}
