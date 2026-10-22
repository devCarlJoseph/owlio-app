import {
  ChartNoAxesCombined,
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

export type SubjectStatusMeta = {
  label: string
  icon: LucideIcon
}

export type SubjectMilestoneStatus = "not-started" | "in-progress" | "completed"

export type SubjectMilestone = {
  id: string
  title: string
  status: SubjectMilestoneStatus
}

export type SubjectRecord = {
  id: string
  name: string
  code: string
  instructor: string
  coverColor: string
  coverImage: string | null
  milestones: SubjectMilestone[]
  progressStarted: boolean
  createdAt: string
  updatedAt: string
  seeded: boolean
}

export type SubjectDraft = {
  name: string
  code: string
  instructor: string
}

export type SubjectCoverMeta = {
  value: string
  label: string
  className: string
  pastelClassName: string
}

export type SubjectCoverPreset = {
  id: string
  label: string
  file: string
}

export type SubjectTheme = {
  id: string
  text: string
  icon: string
  solid: string
  button: string
  buttonHover: string
  bar: string
  soft: string
  ring: string
  hoverText: string
}

export type SubjectNoteLink = {
  id: string
  title: string
  body: string
  labels: string[]
}

export type SubjectTaskLink = {
  id: string
  title: string
  subject: string
  status: string
  dueDate: string
}

export type SubjectSummaryTile = {
  label: string
  icon: LucideIcon
}

export type SubjectMilestoneState = {
  total: number
  completed: number
  active: SubjectMilestone | null
  allDone: boolean
  progress: number
}

export const subjectsStorageKey = "owlio.student-subjects.v1"

export const subjectCoverImageLimitBytes = 1_000_000

export const subjectCoverImageLimitLabel = "1 MB"

export const subjectsGuidance =
  "Your subjects are personal, not an educator's official course."

export const subjectsStorageNotice =
  "Your subjects are kept in this browser for preview. Nothing is sent to a server, and no subject is shared with any classroom."

export const subjectCoverColors: SubjectCoverMeta[] = [
  {
    value: "blue",
    label: "Blue",
    className: "bg-gradient-to-br from-blue-500 to-blue-800",
    pastelClassName: "bg-blue-50",
  },
  {
    value: "emerald",
    label: "Green",
    className: "bg-gradient-to-br from-emerald-500 to-emerald-800",
    pastelClassName: "bg-emerald-50",
  },
  {
    value: "violet",
    label: "Purple",
    className: "bg-gradient-to-br from-violet-500 to-violet-800",
    pastelClassName: "bg-violet-50",
  },
  {
    value: "amber",
    label: "Amber",
    className: "bg-gradient-to-br from-amber-400 to-amber-700",
    pastelClassName: "bg-amber-50",
  },
  {
    value: "rose",
    label: "Rose",
    className: "bg-gradient-to-br from-rose-500 to-rose-800",
    pastelClassName: "bg-rose-50",
  },
  {
    value: "slate",
    label: "Slate",
    className: "bg-gradient-to-br from-slate-500 to-slate-800",
    pastelClassName: "bg-slate-100",
  },
]

export const subjectCoverPresets: SubjectCoverPreset[] = [
  { id: "orbit", label: "Orbit", file: "/subject-covers/orbit.svg" },
  { id: "flask", label: "Flask", file: "/subject-covers/flask.svg" },
  { id: "books", label: "Books", file: "/subject-covers/books.svg" },
  { id: "globe", label: "Globe", file: "/subject-covers/globe.svg" },
  { id: "graph", label: "Graph", file: "/subject-covers/graph.svg" },
  { id: "atom", label: "Atom", file: "/subject-covers/atom.svg" },
]

export const defaultSubjectCoverColor = "blue"

export const subjectImageListBackground = "bg-blue-100"

export const subjectThemes: Record<string, SubjectTheme> = {
  blue: {
    id: "blue",
    text: "text-blue-700",
    icon: "text-blue-600",
    solid: "bg-blue-600",
    button: "bg-blue-700",
    buttonHover: "hover:bg-blue-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-blue-600",
    soft: "bg-blue-50 text-blue-700",
    ring: "ring-blue-500",
    hoverText: "hover:text-blue-700",
  },
  emerald: {
    id: "emerald",
    text: "text-emerald-700",
    icon: "text-emerald-600",
    solid: "bg-emerald-600",
    button: "bg-emerald-700",
    buttonHover: "hover:bg-emerald-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-emerald-600",
    soft: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-500",
    hoverText: "hover:text-emerald-700",
  },
  violet: {
    id: "violet",
    text: "text-violet-700",
    icon: "text-violet-600",
    solid: "bg-violet-600",
    button: "bg-violet-700",
    buttonHover: "hover:bg-violet-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-violet-600",
    soft: "bg-violet-50 text-violet-700",
    ring: "ring-violet-500",
    hoverText: "hover:text-violet-700",
  },
  amber: {
    id: "amber",
    text: "text-amber-800",
    icon: "text-amber-600",
    solid: "bg-amber-500",
    button: "bg-amber-600",
    buttonHover: "hover:bg-amber-700",
    bar: "[&_[data-slot=progress-indicator]]:bg-amber-500",
    soft: "bg-amber-50 text-amber-800",
    ring: "ring-amber-500",
    hoverText: "hover:text-amber-800",
  },
  rose: {
    id: "rose",
    text: "text-rose-700",
    icon: "text-rose-600",
    solid: "bg-rose-600",
    button: "bg-rose-700",
    buttonHover: "hover:bg-rose-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-rose-600",
    soft: "bg-rose-50 text-rose-700",
    ring: "ring-rose-500",
    hoverText: "hover:text-rose-700",
  },
  slate: {
    id: "slate",
    text: "text-slate-700",
    icon: "text-slate-600",
    solid: "bg-slate-600",
    button: "bg-slate-700",
    buttonHover: "hover:bg-slate-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-slate-600",
    soft: "bg-slate-100 text-slate-700",
    ring: "ring-slate-500",
    hoverText: "hover:text-slate-700",
  },
}

export const subjectStatusMeta: Record<SubjectStatus, SubjectStatusMeta> = {
  "in-progress": { label: "In progress", icon: Clock },
  completed: { label: "Completed", icon: CircleCheck },
  "not-started": { label: "Not started", icon: Circle },
}

export const subjectFilterOptions: { value: SubjectFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "not-started", label: "Not started" },
]

export const subjectSummaryTiles: SubjectSummaryTile[] = [
  { label: "My subjects", icon: Layers },
  { label: "With notes", icon: NotebookPen },
  { label: "With tasks", icon: ClipboardList },
  { label: "Average progress", icon: ChartNoAxesCombined },
]

export const subjectShortcutLinks = [
  {
    label: "Subject notes",
    description: "Keep notes with the subject they support.",
    href: "/students/notes",
    icon: NotebookPen,
  },
  {
    label: "Study materials",
    description: "Collect resources and reference links.",
    href: "/students/materials",
    icon: FolderOpen,
  },
  {
    label: "Tasks and deadlines",
    description: "Plan personal study apart from classwork.",
    href: "/students/tasks",
    icon: ClipboardList,
  },
] as const

function milestone(
  id: string,
  title: string,
  status: SubjectMilestoneStatus = "not-started"
): SubjectMilestone {
  return { id, title, status }
}

export const sampleSubjects: SubjectRecord[] = [
  {
    id: "physics-1",
    name: "Physics I",
    code: "SCI-PHY1",
    instructor: "Ramon Diaz",
    coverColor: "blue",
    coverImage: "/subject-covers/orbit.svg",
    milestones: [
      milestone("physics-m1", "Motion and displacement", "completed"),
      milestone("physics-m2", "Velocity and acceleration", "completed"),
      milestone("physics-m3", "Newton's laws of motion"),
      milestone("physics-m4", "Work and energy"),
      milestone("physics-m5", "Waves"),
    ],
    progressStarted: true,
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-10-12T09:15:00.000Z",
    seeded: true,
  },
  {
    id: "chemistry-1",
    name: "Chemistry I",
    code: "SCI-CHM1",
    instructor: "Amara Osei",
    coverColor: "emerald",
    coverImage: "/subject-covers/flask.svg",
    milestones: [
      milestone("chemistry-m1", "Atomic structure", "completed"),
      milestone("chemistry-m2", "Chemical bonding", "completed"),
      milestone("chemistry-m3", "Reactions and moles"),
      milestone("chemistry-m4", "Lab safety and technique"),
    ],
    progressStarted: true,
    createdAt: "2026-09-01T09:10:00.000Z",
    updatedAt: "2026-10-11T16:40:00.000Z",
    seeded: true,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    code: "SCI-MTH2",
    instructor: "Alex Rivera",
    coverColor: "violet",
    coverImage: "/subject-covers/graph.svg",
    milestones: [
      milestone("math-m1", "Algebra and functions", "completed"),
      milestone("math-m2", "Geometry and trigonometry", "completed"),
      milestone("math-m3", "Sequences and series", "completed"),
      milestone("math-m4", "Limits and derivatives", "completed"),
      milestone("math-m5", "Integration", "completed"),
    ],
    progressStarted: true,
    createdAt: "2026-09-02T10:00:00.000Z",
    updatedAt: "2026-10-10T11:05:00.000Z",
    seeded: true,
  },
  {
    id: "computer-science",
    name: "Computer Science",
    code: "SCI-CS1",
    instructor: "Priya Nair",
    coverColor: "slate",
    coverImage: "/subject-covers/atom.svg",
    milestones: [],
    progressStarted: false,
    createdAt: "2026-09-02T10:20:00.000Z",
    updatedAt: "2026-09-02T10:20:00.000Z",
    seeded: true,
  },
  {
    id: "english",
    name: "English",
    code: "LAN-ENG1",
    instructor: "Irene Eda",
    coverColor: "rose",
    coverImage: "/subject-covers/books.svg",
    milestones: [
      milestone("english-m1", "Reading comprehension", "completed"),
      milestone("english-m2", "Essay structure", "completed"),
      milestone("english-m3", "Speaking practice"),
      milestone("english-m4", "Vocabulary building"),
    ],
    progressStarted: true,
    createdAt: "2026-09-03T08:30:00.000Z",
    updatedAt: "2026-10-08T08:20:00.000Z",
    seeded: true,
  },
  {
    id: "history",
    name: "History",
    code: "HUM-HIS1",
    instructor: "Samuel Ortiz",
    coverColor: "amber",
    coverImage: "/subject-covers/globe.svg",
    milestones: [
      milestone("history-m1", "Source analysis", "completed"),
      milestone("history-m2", "Modern history", "completed"),
      milestone("history-m3", "Essay writing"),
    ],
    progressStarted: true,
    createdAt: "2026-09-03T08:45:00.000Z",
    updatedAt: "2026-10-09T19:30:00.000Z",
    seeded: true,
  },
]

function isSubjectRecord(value: unknown): value is SubjectRecord {
  if (typeof value !== "object" || value === null) return false
  const subject = value as Record<string, unknown>

  return typeof subject.id === "string" && typeof subject.name === "string"
}

function isSubjectMilestone(value: unknown): value is SubjectMilestone {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    isSubjectMilestoneStatus(item.status)
  )
}

function isSubjectMilestoneStatus(
  value: unknown
): value is SubjectMilestoneStatus {
  return (
    value === "not-started" || value === "in-progress" || value === "completed"
  )
}
export function normalizeSubject(subject: SubjectRecord): SubjectRecord {
  const milestones = Array.isArray(subject.milestones)
    ? subject.milestones.filter(isSubjectMilestone)
    : []

  return {
    ...subject,
    code: typeof subject.code === "string" ? subject.code : "",
    instructor: typeof subject.instructor === "string" ? subject.instructor : "",
    coverColor: getSubjectCoverColor(subject.coverColor).value,
    coverImage: typeof subject.coverImage === "string" ? subject.coverImage : null,
    milestones,
    progressStarted: subject.progressStarted === true,
    createdAt: typeof subject.createdAt === "string" ? subject.createdAt : new Date().toISOString(),
    updatedAt: typeof subject.updatedAt === "string" ? subject.updatedAt : new Date().toISOString(),
    seeded: subject.seeded === true,
  }
}

export function createSubjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `subject-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createMilestoneId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `milestone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getSubjectInitials(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length === 0) return "?"

  return trimmed.slice(0, 1).toUpperCase()
}

export function normalizeSubjectKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

export function getSubjectTag(subject: SubjectRecord): string {
  return subject.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function getSubjectCoverColor(value: unknown): SubjectCoverMeta {
  return subjectCoverColors.find((color) => color.value === value) ?? subjectCoverColors[0]
}

export function getSubjectCoverPreset(index: number): SubjectCoverPreset {
  return subjectCoverPresets[Math.abs(index) % subjectCoverPresets.length]
}

export function getDefaultSubjectCover(subjectId: string): SubjectCoverPreset {
  let hash = 0

  for (let index = 0; index < subjectId.length; index += 1) {
    hash = (hash * 31 + subjectId.charCodeAt(index)) % 100000
  }

  return getSubjectCoverPreset(hash)
}

export function getSubjectListBackground(subject: SubjectRecord): string {
  return subject.coverImage
    ? subjectImageListBackground
    : getSubjectCoverColor(subject.coverColor).pastelClassName
}

export function getSubjectTheme(subject: SubjectRecord): SubjectTheme {
  if (subject.coverImage) return subjectThemes.blue

  const color = getSubjectCoverColor(subject.coverColor)
  return subjectThemes[color.value] ?? subjectThemes.blue
}

export function getSubjectMilestoneState(subject: SubjectRecord): SubjectMilestoneState {
  const total = subject.milestones.length
  const completed = subject.milestones.filter((item) => item.status === "completed").length
  const active = subject.milestones.find((item) => item.status === "in-progress") ?? null

  return {
    total,
    completed,
    active,
    allDone: total > 0 && completed === total,
    progress: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

export function getSubjectProgress(subject: SubjectRecord): number {
  return getSubjectMilestoneState(subject).progress
}

export function getSubjectStatus(subject: SubjectRecord): SubjectStatus {
  const progress = getSubjectProgress(subject)

  if (progress >= 100) return "completed"
  if (progress <= 0) return "not-started"

  return "in-progress"
}

export function subjectMatchesQuery(subject: SubjectRecord, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length === 0) return true

  return (
    subject.name.toLowerCase().includes(normalizedQuery) ||
    subject.code.toLowerCase().includes(normalizedQuery) ||
    subject.instructor.toLowerCase().includes(normalizedQuery)
  )
}

export function subjectMatchesFilter(
  subject: SubjectRecord,
  filter: SubjectFilter
): boolean {
  return filter === "all" || getSubjectStatus(subject) === filter
}

export function sortSubjects(subjects: SubjectRecord[]): SubjectRecord[] {
  return [...subjects].sort((first, second) => {
    const firstCompleted = getSubjectProgress(first) >= 100 ? 1 : 0
    const secondCompleted = getSubjectProgress(second) >= 100 ? 1 : 0

    if (firstCompleted !== secondCompleted) return firstCompleted - secondCompleted

    return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  })
}

export function findSubjectById(
  subjects: SubjectRecord[],
  subjectId: string | undefined
): SubjectRecord | undefined {
  if (!subjectId) return undefined
  return subjects.find((subject) => subject.id === subjectId)
}

export function notesForSubject(
  notes: SubjectNoteLink[],
  subject: SubjectRecord
): SubjectNoteLink[] {
  const subjectKey = normalizeSubjectKey(subject.name)
  const codeKey = normalizeSubjectKey(subject.code)

  return notes.filter((note) =>
    note.labels.some((tag) => {
      const tagKey = normalizeSubjectKey(tag)
      if (tagKey.length < 3) return false

      return (
        tagKey.includes(subjectKey) ||
        subjectKey.includes(tagKey) ||
        (codeKey.length >= 3 && tagKey.includes(codeKey))
      )
    })
  )
}

export function tasksForSubject(
  tasks: SubjectTaskLink[],
  subject: SubjectRecord
): SubjectTaskLink[] {
  const subjectKey = normalizeSubjectKey(subject.name)

  return tasks.filter((task) => normalizeSubjectKey(task.subject) === subjectKey)
}

export function loadSubjects(): SubjectRecord[] {
  if (typeof window === "undefined") return sampleSubjects

  try {
    const stored = window.localStorage.getItem(subjectsStorageKey)
    if (!stored) return sampleSubjects

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return sampleSubjects

    return parsed.filter(isSubjectRecord).map(normalizeSubject)
  } catch {
    return sampleSubjects
  }
}

export function saveSubjects(subjects: SubjectRecord[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(subjectsStorageKey, JSON.stringify(subjects))
  } catch {
    return
  }
}
