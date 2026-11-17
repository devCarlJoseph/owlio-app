import { BookOpen, ClipboardList, FolderOpen, NotebookPen, School, Users } from "lucide-react"
import type { ScheduleContent, ScheduleRole } from "../types/schedule-types"

export const scheduleContent: Record<ScheduleRole, ScheduleContent> = {
  students: {
    role: "students", workspace: "Student workspace", title: "Calendar and Schedule",
    description: "A little structure for your learning day. Keep your study time, class sessions, and deadlines in view.",
    createLabel: "Add study block", unavailableTitle: "Student scheduling is unavailable",
    emptyDescription: "Your personal study blocks, joined-class sessions, and learning deadlines are not connected yet.",
    boundary: "Your personal study plans are yours. Class sessions and educator-assigned deadlines stay separate from personal work.",
    categories: [
      { id: "personal", label: "Personal study", color: "teal", icon: BookOpen },
      { id: "classes", label: "Class sessions", color: "violet", icon: School },
      { id: "deadlines", label: "Learning deadlines", color: "rose", icon: ClipboardList },
    ],
    links: [
      { label: "My learning", href: "/students/subjects", icon: BookOpen },
      { label: "Personal tasks", href: "/students/tasks", icon: ClipboardList },
      { label: "My classes", href: "/students/classrooms", icon: School },
    ],
    examples: [],
  },
  educators: {
    role: "educators", workspace: "Educator workspace", title: "Calendar and Schedule",
    description: "See your teaching week clearly. Bring class sessions, lesson preparation, and assessment deadlines together.",
    createLabel: "Schedule a class", unavailableTitle: "Class scheduling is unavailable",
    emptyDescription: "Class sessions, lesson preparation, and assessment deadlines are not connected yet.",
    boundary: "Teaching events belong to the classes you are authorized to manage. A calendar entry does not establish attendance or publish classwork.",
    categories: [
      { id: "classes", label: "Class sessions", color: "teal", icon: School },
      { id: "preparation", label: "Lesson preparation", color: "violet", icon: BookOpen },
      { id: "deadlines", label: "Assessment deadlines", color: "rose", icon: ClipboardList },
    ],
    links: [
      { label: "My classes", href: "/educators/classrooms", icon: School },
      { label: "Classwork & assessments", href: "/educators/classwork", icon: ClipboardList },
      { label: "Teaching materials", href: "/educators/materials", icon: FolderOpen },
    ],
    examples: [],
  },
  tutors: {
    role: "tutors", workspace: "Tutor workspace", title: "Sessions and Schedule",
    description: "Make room for focused support. Organize individual sessions, group learning, and preparation for your tutoring week.",
    createLabel: "Schedule a session", unavailableTitle: "Session scheduling is unavailable",
    emptyDescription: "Tutoring appointments, learner or group details, and session preparation are not connected yet.",
    boundary: "A session is a dated appointment; a Learning Plan spans longer-term goals. Private tutor notes stay separate from learner-visible feedback.",
    categories: [
      { id: "individual", label: "Individual sessions", color: "teal", icon: BookOpen },
      { id: "group", label: "Group sessions", color: "violet", icon: Users },
      { id: "preparation", label: "Session preparation", color: "rose", icon: NotebookPen },
    ],
    links: [
      { label: "Learning Plans", href: "/tutors/learning-plans", icon: BookOpen },
      { label: "My learners", href: "/tutors/learners", icon: Users },
      { label: "Activities & evaluations", href: "/tutors/classwork", icon: ClipboardList },
    ],
    examples: [],
  },
  esl: {
    role: "esl", workspace: "ESL teaching workspace", title: "Lesson Schedule",
    description: "Plan a week of meaningful language practice. Keep individual lessons, group lessons, and preparation in focus.",
    createLabel: "Schedule a lesson", unavailableTitle: "Lesson scheduling is unavailable",
    emptyDescription: "Dated lessons, learner or group details, and lesson preparation are not connected yet.",
    boundary: "Lesson Plans are reusable preparation. Scheduled lessons are dated sessions. Language progress and attendance require their own records.",
    categories: [
      { id: "individual", label: "Individual lessons", color: "teal", icon: BookOpen },
      { id: "group", label: "Group lessons", color: "violet", icon: Users },
      { id: "preparation", label: "Lesson preparation", color: "rose", icon: ClipboardList },
    ],
    links: [
      { label: "Lesson Plans", href: "/esl/lessons", icon: BookOpen },
      { label: "My learners", href: "/esl/learners", icon: Users },
      { label: "Teaching materials", href: "/esl/materials", icon: FolderOpen },
    ],
    examples: [],
  },
}
