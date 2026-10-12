import { GraduationCap, House, Languages, School, UserRound } from "lucide-react"

export const dashboardNavigation = [
  { label: "Overview", href: "/workspace", icon: House },
  { label: "Students", href: "/workspace/students", icon: GraduationCap },
  { label: "Educators", href: "/workspace/educators", icon: School },
  { label: "Tutors", href: "/workspace/tutors", icon: UserRound },
  { label: "ESL", href: "/workspace/esl", icon: Languages },
] as const
