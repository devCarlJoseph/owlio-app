import { createContext, useContext } from "react"
import type {
  AttendanceStatus,
  Classroom,
  ClassroomSession,
  CreateActivityInput,
  CreateClassroomInput,
  WorkspaceRole,
} from "./classroom-types"

type JoinClassroomResult =
  | { classroomId: string }
  | { error: "not-found" | "already-enrolled" }

export type ClassroomPrototypeContextValue = {
  classrooms: Classroom[]
  getClassroom: (classroomId: string) => Classroom | undefined
  getClassroomsForWorkspace: (role: WorkspaceRole) => Classroom[]
  createClassroom: (input: CreateClassroomInput, ownerWorkspace: Exclude<WorkspaceRole, "students">) => Classroom
  joinClassroom: (joinCode: string) => JoinClassroomResult
  createMeetingLink: (classroomId: string) => void
  createPost: (classroomId: string, body: string) => void
  addComment: (classroomId: string, postId: string, body: string) => void
  sendChatMessage: (classroomId: string, body: string, authorRole: "student" | "educator") => void
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
