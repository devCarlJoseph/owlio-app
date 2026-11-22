import { BookOpen, CalendarDays, ChartNoAxesCombined, ClipboardCheck, FolderOpen, Info, MessageCircle, MessagesSquare, Users } from 'lucide-react'

export const classroomSections = [
  { value: 'feed', label: 'Discussion', icon: MessagesSquare },
  { value: 'classwork', label: 'Classwork', icon: BookOpen },
  { value: 'materials', label: 'Materials', icon: FolderOpen },
  { value: 'schedule', label: 'Schedule', icon: CalendarDays },
  { value: 'people', label: 'Members', icon: Users },
  { value: 'about', label: 'About', icon: Info },
  { value: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { value: 'progress', label: 'Grades & Feedback', icon: ChartNoAxesCombined },
  { value: 'chat', label: 'Chat', icon: MessageCircle },
]

