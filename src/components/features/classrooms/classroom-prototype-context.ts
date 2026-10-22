import { createContext, useContext } from "react"
import type {
  AttendanceStatus,
  Classroom,
  ClassroomChatReplyRef,
  ClassroomSession,
  CreateActivityInput,
  CreateClassroomInput,
  WorkspaceRole,
} from "./classroom-types"

export type JoinClassroomResult =
  | { status: "joined"; classroomId: string; classroomName: string; source: "connected" | "demo" }
  | { status: "already-previewed"; classroomName: string }
  | { status: "unavailable" }

export type ClassroomPrototypeContextValue = {
  classrooms: Classroom[]
  classroomsLoading: boolean
  classroomsError: string | null
  connectedModeEnabled: boolean
  getClassroom: (classroomId: string) => Classroom | undefined
  getClassroomsForWorkspace: (role: WorkspaceRole) => Classroom[]
  reloadClassrooms: () => void
  createClassroom: (input: CreateClassroomInput, ownerWorkspace: Exclude<WorkspaceRole, "students">) => Promise<Classroom>
  joinClassroom: (joinCode: string) => Promise<JoinClassroomResult>
  createMeetingLink: (classroomId: string, meetingId: string) => void
  createPost: (classroomId: string, input: { title: string; body: string; authorRole: "student" | "educator" }) => void
  addComment: (classroomId: string, postId: string, body: string, authorRole: "student" | "educator") => void
  requestMember: (classroomId: string, input: { name: string; email: string }, requestedByRole: "student" | "educator") => void
  resolveMemberRequest: (classroomId: string, requestId: string, decision: "accept" | "decline") => void
  removeMember: (classroomId: string, memberId: string) => void
  sendChatMessage: (classroomId: string, body: string, authorRole: "student" | "educator", replyTo?: ClassroomChatReplyRef) => void
  createActivity: (classroomId: string, input: CreateActivityInput) => string
  submitActivity: (classroomId: string, activityId: string, response: string, fileName?: string) => void
  reviewSubmission: (
    classroomId: string,
    activityId: string,
    submissionId: string,
    evaluation: string,
    feedback: string,
  ) => void
  markAttendance: (classroomId: string, sessionId: string, learnerId: string, status: AttendanceStatus) => void
  addSession: (classroomId: string, session: Omit<ClassroomSession, "id">) => void
}

export const ClassroomPrototypeContext = createContext<ClassroomPrototypeContextValue | null>(null)

export function useClassroomPrototype() {
  const context = useContext(ClassroomPrototypeContext)
  if (!context) throw new Error("useClassroomPrototype must be used within ClassroomPrototypeProvider")
  return context
}
