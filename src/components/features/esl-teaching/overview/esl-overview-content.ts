import { BookOpen, CalendarCheck, ClipboardList, FolderOpen, Languages, Users } from "lucide-react"
import type { OverviewContent } from "@/components/features/dashboard-overview/overview-types"

export const eslOverviewContent: OverviewContent = {
  workspace: "ESL teaching workspace",
  headline: "Build confidence, one lesson at a time.",
  introduction: "A thoughtful starting point for language teaching. Bring lesson preparation, learner support, and practice into focus.",
  icon: Languages,
  focus: ["Lesson plans", "Upcoming lessons", "Activity reviews"],
  primaryAction: { label: "Open lesson plans", href: "/esl/lessons" },
  summary: {
    title: "My language teaching at a glance",
    items: [
      { title: "Lesson Plans", description: "Prepare reusable language-learning lessons.", href: "/esl/lessons", icon: BookOpen },
      { title: "Activities & assessments", description: "Explore language practice and learner work.", href: "/esl/classwork", icon: ClipboardList },
      { title: "My learners", description: "Open individual and group learner contexts.", href: "/esl/learners", icon: Users },
    ],
  },
  explore: {
    title: "Your language teaching spaces",
    description: "Connect thoughtful preparation with meaningful practice.",
    items: [
      { title: "Lesson Plans", description: "Keep reusable lesson preparation separate from dated sessions.", href: "/esl/lessons", icon: Languages, category: "Language learning", cover: "/subject-covers/globe.svg" },
      { title: "Teaching Materials", description: "Open the resource workspace for your lesson context.", href: "/esl/materials", icon: FolderOpen, category: "Lesson resources", cover: "/subject-covers/books.svg" },
    ],
  },
  agenda: {
    title: "Upcoming lessons",
    emptyTitle: "Make room for your next lesson",
    description: "One-to-one and group lesson times are not available in this overview yet.",
    action: { label: "Open lesson schedule", href: "/esl/schedule" },
  },
  followUps: {
    title: "Lesson follow-ups",
    description: "Activity reviews and attendance tasks are not connected yet. Open a teaching workspace to continue.",
    items: [
      { title: "Activity reviews", description: "Open language activities and assessments.", href: "/esl/classwork", icon: ClipboardList },
      { title: "Lesson attendance", description: "Open teacher-controlled lesson records.", href: "/esl/attendance", icon: CalendarCheck },
    ],
  },
  note: { title: "Support every learner thoughtfully", description: "Keep private teaching notes separate from published feedback. Language progress needs actual learning evidence." },
}
