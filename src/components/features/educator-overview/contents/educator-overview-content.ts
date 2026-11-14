import { CalendarCheck, ClipboardList, FolderOpen, School, Users } from "lucide-react"
import type { OverviewContent } from "@/components/features/dashboard-overview/overview-types"

export const educatorOverviewContent: OverviewContent = {
  workspace: "Educator workspace",
  headline: "Make space for great teaching.",
  introduction: "Start with your classes, prepare what comes next, and keep the work that needs your attention close at hand.",
  icon: School,
  focus: ["Your classes", "Submissions to review", "Attendance records"],
  primaryAction: { label: "Open my classes", href: "/educators/classrooms" },
  summary: {
    title: "My teaching at a glance",
    items: [
      { title: "Classwork & assessments", description: "Open classroom activities and review work.", href: "/educators/classwork", icon: ClipboardList },
      { title: "Attendance", description: "Keep class attendance in its own record.", href: "/educators/attendance", icon: CalendarCheck },
      { title: "Students", description: "Focus on the students in your classes.", href: "/educators/learners", icon: Users },
    ],
  },
  explore: {
    title: "Your teaching spaces",
    description: "A starting point for classroom learning and preparation.",
    items: [
      { title: "My Classes", description: "Open the classrooms you are authorized to manage.", href: "/educators/classrooms", icon: School, category: "Classroom teaching", cover: "/classroom-covers/teal.svg" },
      { title: "Teaching Materials", description: "Find the resource workspace for your classroom context.", href: "/educators/materials", icon: FolderOpen, category: "Lesson preparation", cover: "/subject-covers/books.svg" },
    ],
  },
  agenda: {
    title: "Upcoming classes",
    emptyTitle: "Your teaching day starts here",
    description: "Class times and scheduled lessons are not available in this overview yet.",
    action: { label: "Open teaching schedule", href: "/educators/schedule" },
  },
  followUps: {
    title: "Needs attention",
    description: "Review queues are not connected yet. Open the relevant workspace to continue.",
    items: [
      { title: "Submission reviews", description: "Open classwork and assessment review.", href: "/educators/classwork", icon: ClipboardList },
      { title: "Attendance records", description: "Open educator-controlled attendance.", href: "/educators/attendance", icon: CalendarCheck },
    ],
  },
  note: { title: "Your classroom context matters", description: "Official records belong to the classes you manage. Meeting Room presence stays separate from attendance." },
}
