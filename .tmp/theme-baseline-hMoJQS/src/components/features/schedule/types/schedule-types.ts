import type { LucideIcon } from "lucide-react"

export type ScheduleRole = "students" | "educators" | "tutors" | "esl"
export type CalendarView = "day" | "week" | "month"
export type ScheduleCategory = {
  id: string
  label: string
  color: "teal" | "violet" | "rose"
  icon: LucideIcon
}
export type ScheduleContent = {
  role: ScheduleRole
  workspace: string
  title: string
  description: string
  createLabel: string
  unavailableTitle: string
  emptyDescription: string
  boundary: string
  categories: [ScheduleCategory, ScheduleCategory, ScheduleCategory]
  links: { label: string; href: string; icon: LucideIcon }[]
  examples: { title: string; context: string; category: string; day: number; hour: number; duration: number }[]
}
export type ScheduleExample = {
  id: string
  title: string
  context: string
  category: ScheduleCategory
  date: Date
  hour: number
  duration: number
}
