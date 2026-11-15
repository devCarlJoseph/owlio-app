import { BookOpen, CalendarDays, GraduationCap, MessageCircleMore, Users } from "lucide-react"
import type { NotificationAppearance, NotificationCategory, NotificationsContent, NotificationsRole } from "./notifications.types"

export const notificationsContent: Record<NotificationsRole, NotificationsContent> = {
  students: {
    workspace: "Student workspace",
    description: "A place for your class updates, learning deadlines, released feedback, and peer study updates.",
    categories: ["Classroom updates", "Classwork & deadlines", "Released feedback", "Study spaces"],
  },
  educators: {
    workspace: "Educator workspace",
    description: "Keep classroom updates, submission reviews, assessment deadlines, and teaching conversations in view.",
    categories: ["Your classrooms", "Submission reviews", "Teaching schedule", "Class discussions"],
  },
  tutors: {
    workspace: "Tutor workspace",
    description: "Keep up with individual and group sessions, learner activities, and published feedback in your tutoring context.",
    categories: ["Tutoring sessions", "Activities & evaluations", "Published feedback", "Contextual discussions"],
  },
  esl: {
    workspace: "ESL teaching workspace",
    description: "A place for lesson updates, language activities, schedule changes, and learner conversations.",
    categories: ["Individual & group lessons", "Language activities", "Lesson schedule", "Published feedback"],
  },
}

export const notificationAppearance: Record<NotificationCategory, NotificationAppearance> = {
  classroom: { icon: GraduationCap, avatar: "bg-brand-soft text-brand-soft-foreground", badge: "bg-brand text-brand-foreground" },
  activity: { icon: BookOpen, avatar: "bg-amber-50 text-amber-800", badge: "bg-amber-600 text-white" },
  schedule: { icon: CalendarDays, avatar: "bg-sky-50 text-sky-800", badge: "bg-sky-600 text-white" },
  feedback: { icon: MessageCircleMore, avatar: "bg-rose-50 text-rose-800", badge: "bg-rose-500 text-white" },
  community: { icon: Users, avatar: "bg-teal-50 text-teal-800", badge: "bg-teal-600 text-white" },
}
