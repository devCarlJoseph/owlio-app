export type WorkspaceRole = "students" | "educators" | "tutors" | "esl"

export type ClassroomMember = {
  id: string
  name: string
  role: "student" | "educator"
}

export type ClassroomComment = {
  id: string
  authorId: string
  authorName: string
  authorRole: "student" | "educator"
  body: string
  createdAt: string
}

export type ClassroomPost = {
  id: string
  authorId: string
  authorName: string
  authorRole: "student" | "educator"
  kind: "announcement" | "discussion"
  body: string
  createdAt: string
  comments: ClassroomComment[]
}

export type ClassroomChatMessage = {
  id: string
  authorId: string
  authorName: string
  authorRole: "student" | "educator"
  body: string
  createdAt: string
}

export type ClassroomMaterial = {
  id: string
  title: string
  description: string
  kind: "Document" | "Link" | "Video" | "Presentation"
}

export type ClassroomSession = {
  id: string
  title: string
  date: string
  time: string
  meetingNote: string
}

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused"

export type ClassroomAttendance = {
  id: string
  sessionId: string
  learnerId: string
  status: AttendanceStatus
}

export type ActivityType =
  | "Quiz"
  | "Test"
  | "Assignment"
  | "File submission"
  | "Project"
  | "Presentation"
  | "Lab work"
  | "Practical activity"
  | "Discussion activity"
  | "Reading activity"
  | "Speaking practice"

export type QuestionType =
  | "Multiple choice"
  | "Multiple select"
  | "True or false"
  | "Identification"
  | "Short answer"
  | "Essay"

export type ActivityQuestion = {
  id: string
  type: QuestionType
  prompt: string
  options: string[]
}

export type ClassroomSubmission = {
  id: string
  learnerId: string
  learnerName: string
  response: string
  fileName?: string
  submittedAt: string
  status: "Submitted" | "In review" | "Returned"
  evaluation?: string
  feedback?: string
  released: boolean
}

export type ClassroomActivity = {
  id: string
  title: string
  type: ActivityType
  instructions: string
  dueDate: string
  scoringNote: string
  questions: ActivityQuestion[]
  responseType: "Text" | "File" | "Link" | "Quiz"
  status: "Published" | "Draft"
  submissions: ClassroomSubmission[]
}

export type ClassroomProgressRecord = {
  id: string
  learnerId: string
  learnerName: string
  activityTitle: string
  evaluation: string
  feedback: string
  released: boolean
}

export type Classroom = {
  id: string
  name: string
  subject: string
  description: string
  instructorName: string
  ownerWorkspace: Exclude<WorkspaceRole, "students">
  joinCode: string
  meetingId: string | null
  members: ClassroomMember[]
  enrolledLearnerIds: string[]
  posts: ClassroomPost[]
  chatMessages: ClassroomChatMessage[]
  materials: ClassroomMaterial[]
  sessions: ClassroomSession[]
  attendance: ClassroomAttendance[]
  activities: ClassroomActivity[]
  progress: ClassroomProgressRecord[]
  isMock: true
}

export type CreateClassroomInput = {
  name: string
  subject: string
  description: string
}

export type CreateActivityInput = {
  title: string
  type: ActivityType
  instructions: string
  dueDate: string
  scoringNote: string
  responseType: ClassroomActivity["responseType"]
  questions: ActivityQuestion[]
}
