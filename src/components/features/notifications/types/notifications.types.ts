import type { LucideIcon } from "lucide-react"

export type NotificationsRole = "students" | "educators" | "tutors" | "esl"
export type NotificationFilter = "all" | "unread"
export type NotificationCategory = "classroom" | "activity" | "schedule" | "feedback" | "community"

export type NotificationItemViewModel = {
  id: string
  actor: string
  initials: string
  action: string
  context: string
  preview: string
  category: NotificationCategory
  unread: boolean
  example: boolean
  timestamp?: { dateTime: string; relativeLabel: string; fullLabel: string }
  destination?: { href: string; label: string }
}

export type NotificationsContent = {
  workspace: string
  description: string
  categories: string[]
}

export type NotificationAppearance = {
  icon: LucideIcon
  avatar: string
  badge: string
}

export type NotificationsListState =
  | { status: "unavailable" }
  | { status: "loading" }
  | { status: "error"; onRetry?: () => void }
  | { status: "ready"; items: NotificationItemViewModel[] }
