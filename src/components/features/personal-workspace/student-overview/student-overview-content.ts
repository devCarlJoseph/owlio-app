import { BookOpen, ClipboardList, FolderOpen, GraduationCap, NotebookPen, School, Users } from "lucide-react"
import type { OverviewContent } from "@/components/features/dashboard-overview/overview-types"

export const studentOverviewContent: OverviewContent = {
  workspace: "Student workspace",
  headline: "A little learning, every day.",
  introduction: "Make room for your own goals. Keep personal study, classroom work, and time with your study community in view.",
  icon: GraduationCap,
  focus: ["Personal subjects", "Personal tasks", "Joined classes"],
  primaryAction: { label: "Open my learning", href: "/students/subjects" },
  summary: {
    title: "My learning at a glance",
    items: [
      { title: "Personal tasks", description: "Make space for your next study goal.", href: "/students/tasks", icon: ClipboardList },
      { title: "My notes", description: "Keep ideas and discoveries together.", href: "/students/notes", icon: NotebookPen },
      { title: "Assigned classwork", description: "Find work shared by your educator.", href: "/students/classwork", icon: School },
    ],
  },
  explore: {
    title: "Your learning spaces",
    description: "Learn independently or spend time learning with others.",
    items: [
      { title: "My Learning", description: "Your subjects and personal study goals, at your own pace.", href: "/students/subjects", icon: BookOpen, category: "Personal learning", cover: "/subject-covers/books.svg" },
      { title: "Study Spaces", description: "Explore student-created spaces for peer study and collaboration.", href: "/students/study-spaces", icon: Users, category: "Peer learning", cover: "/subject-covers/globe.svg" },
    ],
  },
  agenda: {
    title: "Coming up",
    emptyTitle: "Your next study moment",
    description: "Personal deadlines and class sessions are not available in this overview yet.",
    action: { label: "Open my schedule", href: "/students/schedule" },
  },
  followUps: {
    title: "Keep learning",
    description: "Class updates and released feedback are not available here yet. Continue in your learning workspaces.",
    items: [
      { title: "My classes", description: "Find your educator-led classroom work.", href: "/students/classrooms", icon: School },
      { title: "Study library", description: "Find resources for your next study block.", href: "/students/materials", icon: FolderOpen },
    ],
  },
  note: { title: "Your learning, your pace", description: "You can study without joining a class. Personal work and peer study stay separate from official class records." },
}
