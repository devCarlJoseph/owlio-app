import { BookOpen, ClipboardList, FolderOpen, GraduationCap, NotebookPen, Users } from "lucide-react"
import type { OverviewContent } from "@/components/features/dashboard-overview/overview-types"

export const tutorOverviewContent: OverviewContent = {
  workspace: "Tutor workspace",
  headline: "Your day, in focus",
  introduction: "Bring individual and group tutoring into focus. Keep learning goals, session preparation, and learner follow-ups together.",
  icon: GraduationCap,
  focus: ["Tutoring sessions", "Learning goals", "Activity reviews"],
  primaryAction: { label: "Open sessions", href: "/tutors/sessions" },
  summary: {
    title: "My tutoring at a glance",
    items: [
      { title: "Learning Plans", description: "Explore goals across multiple sessions.", href: "/tutors/learning-plans", icon: BookOpen },
      { title: "Activities & evaluations", description: "Open activities and learner work.", href: "/tutors/classwork", icon: ClipboardList },
      { title: "My learners", description: "Open learners and learning groups.", href: "/tutors/learners", icon: Users },
    ],
  },
  explore: {
    title: "Your tutoring spaces",
    description: "Prepare for the next conversation and the goals beyond it.",
    items: [
      { title: "Learning Plans", description: "Keep longer-term tutoring goals distinct from a single session.", href: "/tutors/learning-plans", icon: BookOpen, category: "Learning goals", cover: "/subject-covers/orbit.svg" },
      { title: "Teaching Materials", description: "Open the resource workspace for your tutoring context.", href: "/tutors/materials", icon: FolderOpen, category: "Session preparation", cover: "/subject-covers/books.svg" },
    ],
  },
  agenda: {
    title: "Upcoming sessions",
    emptyTitle: "Session details aren't available yet",
    description: "Session times and learner or group details are not connected to this overview.",
    action: { label: "Open sessions & schedule", href: "/tutors/sessions" },
  },
  followUps: {
    title: "Learner follow-ups",
    description: "Review and follow-up records are not connected yet. Continue in a tutoring workspace.",
    items: [
      { title: "Activity review", description: "Open activities for your tutoring context.", href: "/tutors/classwork", icon: ClipboardList },
      { title: "Private session notes", description: "Open your tutor-only notes workspace.", href: "/tutors/session-notes", icon: NotebookPen },
    ],
  },
  note: { title: "Personal support, clear boundaries", description: "Private session notes stay separate from learner-visible feedback. Tutoring evaluations are distinct from school grades." },
}
