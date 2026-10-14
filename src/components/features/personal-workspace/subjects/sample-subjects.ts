import {
  BookOpen,
  Circle,
  CircleCheck,
  ClipboardList,
  Clock,
  FolderOpen,
  Layers,
  NotebookPen,
  type LucideIcon,
} from "lucide-react"

export type SubjectStatus = "in-progress" | "completed" | "not-started"

export type SubjectFilter = "all" | SubjectStatus

export type SubjectRecord = {
  id: string
  name: string
  code: string
  summary: string
  chaptersCompleted: number
  chapterCount: number
  lessonCount: number
  progress: number
  status: SubjectStatus
}

export type SubjectStatusMeta = {
  label: string
  icon: LucideIcon
  badge: string
}

export type SubjectFilterOption = {
  value: SubjectFilter
  label: string
}

export const subjectStatusMeta: Record<SubjectStatus, SubjectStatusMeta> = {
  "in-progress": { label: "In progress", icon: Clock, badge: "bg-blue-50 text-blue-700" },
  completed: { label: "Completed", icon: CircleCheck, badge: "bg-blue-700 text-white" },
  "not-started": { label: "Not started", icon: Circle, badge: "border-slate-200 bg-slate-50 text-slate-600" },
}

export const subjectFilterOptions: SubjectFilterOption[] = [
  { value: "all", label: "All" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "not-started", label: "Not started" },
]

export const subjectSummaryTiles = [
  { label: "Subjects", icon: Layers },
  { label: "Chapters done", icon: BookOpen },
  { label: "Lessons", icon: NotebookPen },
  { label: "Average progress", icon: Clock },
] as const

export const subjectShortcutLinks = [
  { label: "Subject notes", description: "Keep notes with the subject they support.", href: "/students/notes", icon: NotebookPen },
  { label: "Study materials", description: "Collect resources and reference links.", href: "/students/materials", icon: FolderOpen },
  { label: "Tasks and deadlines", description: "Plan personal study apart from classwork.", href: "/students/tasks", icon: ClipboardList },
] as const

export const sampleSubjects: SubjectRecord[] = [
  {
    id: "physics-1",
    name: "Physics I",
    code: "SCI-PHY1",
    summary: "Mechanics, waves, and energy.",
    chaptersCompleted: 5,
    chapterCount: 12,
    lessonCount: 30,
    progress: 48,
    status: "in-progress",
  },
  {
    id: "chemistry-1",
    name: "Chemistry I",
    code: "SCI-CHM1",
    summary: "Bonding, reactions, and lab safety.",
    chaptersCompleted: 7,
    chapterCount: 12,
    lessonCount: 24,
    progress: 62,
    status: "in-progress",
  },
  {
    id: "mathematics",
    name: "Mathematics",
    code: "SCI-MTH2",
    summary: "Algebra through calculus.",
    chaptersCompleted: 12,
    chapterCount: 12,
    lessonCount: 40,
    progress: 100,
    status: "completed",
  },
  {
    id: "computer-science",
    name: "Computer Science",
    code: "SCI-CS1",
    summary: "Programming fundamentals.",
    chaptersCompleted: 0,
    chapterCount: 8,
    lessonCount: 18,
    progress: 0,
    status: "not-started",
  },
  {
    id: "english",
    name: "English",
    code: "LAN-ENG1",
    summary: "Reading, writing, and speaking practice.",
    chaptersCompleted: 4,
    chapterCount: 10,
    lessonCount: 20,
    progress: 45,
    status: "in-progress",
  },
  {
    id: "history",
    name: "History",
    code: "HUM-HIS1",
    summary: "Modern history and source analysis.",
    chaptersCompleted: 6,
    chapterCount: 9,
    lessonCount: 15,
    progress: 66,
    status: "in-progress",
  },
]

export const activeSubjectNames = sampleSubjects.map((subject) => subject.name)