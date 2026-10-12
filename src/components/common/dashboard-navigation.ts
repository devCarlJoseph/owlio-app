import { GraduationCap, House, Languages, School, UserRound } from "lucide-react"

export const dashboardNavigation = [
  { label: "Overview", href: "/workspace", icon: House },
  { label: "Students", href: "/students", icon: GraduationCap },
  { label: "Educators", href: "/educators", icon: School },
  { label: "Tutors", href: "/tutors", icon: UserRound },
  { label: "ESL", href: "/esl", icon: Languages },
] as const
