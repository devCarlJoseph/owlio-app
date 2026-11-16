import { BookOpen, ClipboardList, FolderOpen, NotebookPen, Users, type LucideIcon } from "lucide-react"

export type MetricTile = {
  label: string
  icon: LucideIcon
}

export type UpcomingGroup = {
  title: string
  description: string
  href: string
  linkLabel: string
}

export const overviewTip =
  "Small, steady sessions add up. Plan one study block today, and keep classroom work separate from your own plans."

export const personalMetricTiles: MetricTile[] = [
  { label: "Subjects", icon: BookOpen },
  { label: "Tasks", icon: ClipboardList },
  { label: "Materials", icon: FolderOpen },
]

export const upcomingGroups: UpcomingGroup[] = [
  {
    title: "Personal schedule",
    description: "Study blocks and deadlines you set for yourself.",
    href: "/students/schedule",
    linkLabel: "View schedule",
  },
  {
    title: "Classroom sessions",
    description: "Lessons and activities shared by your educator.",
    href: "/students/classrooms",
    linkLabel: "View classrooms",
  },
]

export const personalTasksLink = {
  label: "Plan with personal tasks",
  description: "Your own study plans stay separate from assigned classwork.",
  href: "/students/tasks",
}

export const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export const personalSpaceLinks = [
  {
    label: "Organize your notes",
    href: "/students/notes",
    icon: NotebookPen,
  },
  {
    label: "Explore study spaces",
    href: "/students/study-spaces",
    icon: Users,
  },
] as const