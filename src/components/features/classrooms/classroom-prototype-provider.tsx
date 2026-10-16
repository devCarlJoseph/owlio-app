import { useMemo, useState, type ReactNode } from "react"
import { DEMO_LEARNER_ID, initialClassrooms } from "./classroom-mock-data"
import { ClassroomPrototypeContext, type ClassroomPrototypeContextValue } from "./classroom-prototype-context"
import type {
  ActivityQuestion,
  Classroom,
  ClassroomActivity,
  ClassroomComment,
  ClassroomPost,
  CreateActivityInput,
  CreateClassroomInput,
  WorkspaceRole,
} from "./classroom-types"

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function demoTime() {
  return "Just now · demo"
}

function buildClassroom(input: CreateClassroomInput, ownerWorkspace: Exclude<WorkspaceRole, "students">): Classroom {
  const id = newId("class")
  return {
    id,
    name: input.name.trim(),
    subject: input.subject.trim(),
    description: input.description.trim(),
    instructorName: "You · demo educator",
    ownerWorkspace,
    joinCode: `OWL-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    meetingId: null,
    members: [{ id: `owner-${id}`, name: "You · demo educator", role: "educator" }],
    enrolledLearnerIds: [],
    posts: [],
    chatMessages: [],
    materials: [],
    sessions: [],
    attendance: [],
    activities: [],
    progress: [],
    isMock: true,
  }
}

function buildPost(body: string): ClassroomPost {
  return {
    id: newId("post"),
    authorId: "demo-educator",
    authorName: "You · demo educator",
    authorRole: "educator",
    kind: "announcement",
    body: body.trim(),
    createdAt: demoTime(),
    comments: [],
  }
}

function buildComment(body: string): ClassroomComment {
  return {
    id: newId("comment"),
    authorId: DEMO_LEARNER_ID,
    authorName: "You · demo learner",
    authorRole: "student",
    body: body.trim(),
    createdAt: demoTime(),
  }
}

function buildActivity(input: CreateActivityInput): ClassroomActivity {
  return {
    ...input,
    id: newId("activity"),
    title: input.title.trim(),
    instructions: input.instructions.trim(),
    questions: input.questions.map((question: ActivityQuestion) => ({ ...question })),
    status: "Published",
    submissions: [],
  }
}

export function ClassroomPrototypeProvider({ children }: { children: ReactNode }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms)

  const value = useMemo<ClassroomPrototypeContextValue>(() => {
    const updateClassroom = (classroomId: string, update: (classroom: Classroom) => Classroom) => {
      setClassrooms((current) =>
        current.map((classroom) => classroom.id === classroomId ? update(classroom) : classroom),
      )
    }

    return {
      classrooms,
      getClassroom: (classroomId) => classrooms.find((classroom) => classroom.id === classroomId),
      getClassroomsForWorkspace: (role) => classrooms.filter((classroom) =>
        role === "students"
          ? classroom.enrolledLearnerIds.includes(DEMO_LEARNER_ID)
          : classroom.ownerWorkspace === role,
      ),
      createClassroom: (input, ownerWorkspace) => {
        const classroom = buildClassroom(input, ownerWorkspace)
        setClassrooms((current) => [classroom, ...current])
        return classroom
      },
      joinClassroom: (joinCode) => {
        const classroom = classrooms.find((item) => item.joinCode.toLowerCase() === joinCode.trim().toLowerCase())
        if (!classroom) return { error: "not-found" }
        if (classroom.enrolledLearnerIds.includes(DEMO_LEARNER_ID)) return { error: "already-enrolled" }

        updateClassroom(classroom.id, (current) => ({
          ...current,
          enrolledLearnerIds: [...current.enrolledLearnerIds, DEMO_LEARNER_ID],
          members: [...current.members, { id: DEMO_LEARNER_ID, name: "You · demo learner", role: "student" }],
        }))
        return { classroomId: classroom.id }
      },
      createMeetingLink: (classroomId, meetingId) => {
        updateClassroom(classroomId, (classroom) => classroom.meetingId
          ? classroom
          : { ...classroom, meetingId },
        )
      },
      createPost: (classroomId, body) => {
        if (!body.trim()) return
        updateClassroom(classroomId, (classroom) => ({ ...classroom, posts: [buildPost(body), ...classroom.posts] }))
      },
      addComment: (classroomId, postId, body) => {
        if (!body.trim()) return
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          posts: classroom.posts.map((post) => post.id === postId
            ? { ...post, comments: [...post.comments, buildComment(body)] }
            : post,
          ),
        }))
      },
      sendChatMessage: (classroomId, body, authorRole) => {
        if (!body.trim()) return
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          chatMessages: [
            ...classroom.chatMessages,
            {
              id: newId("message"),
              authorId: authorRole === "student" ? DEMO_LEARNER_ID : `owner-${classroom.id}`,
              authorName: authorRole === "student" ? "You · demo learner" : "You · demo educator",
              authorRole,
              body: body.trim(),
              createdAt: demoTime(),
            },
          ],
        }))
      },
      createActivity: (classroomId, input) => {
        const activity = buildActivity(input)
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          activities: [activity, ...classroom.activities],
        }))
        return activity.id
      },
      submitActivity: (classroomId, activityId, response, fileName) => {
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          activities: classroom.activities.map((activity) => activity.id === activityId
            ? {
              ...activity,
              submissions: [
                ...activity.submissions.filter((submission) => submission.learnerId !== DEMO_LEARNER_ID),
                {
                  id: newId("submission"),
                  learnerId: DEMO_LEARNER_ID,
                  learnerName: "You · demo learner",
                  response: response.trim(),
                  fileName,
                  submittedAt: demoTime(),
                  status: "Submitted",
                  released: false,
                },
              ],
            }
            : activity,
          ),
          progress: classroom.progress.filter((record) =>
            record.learnerId !== DEMO_LEARNER_ID
            || record.activityTitle !== classroom.activities.find((activity) => activity.id === activityId)?.title,
          ),
        }))
      },
      reviewSubmission: (classroomId, activityId, submissionId, evaluation, feedback) => {
        updateClassroom(classroomId, (classroom) => {
          const activity = classroom.activities.find((item) => item.id === activityId)
          const submission = activity?.submissions.find((item) => item.id === submissionId)
          if (!activity || !submission) return classroom

          return {
            ...classroom,
            activities: classroom.activities.map((item) => item.id === activityId
              ? {
                ...item,
                submissions: item.submissions.map((record) => record.id === submissionId
                  ? { ...record, status: "Returned", evaluation, feedback, released: true }
                  : record,
                ),
              }
              : item,
            ),
            progress: [
              ...classroom.progress.filter((record) =>
                record.learnerId !== submission.learnerId || record.activityTitle !== activity.title,
              ),
              {
                id: `${submissionId}-progress`,
                learnerId: submission.learnerId,
                learnerName: submission.learnerName,
                activityTitle: activity.title,
                evaluation,
                feedback,
                released: true,
              },
            ],
          }
        })
      },
      markAttendance: (classroomId, sessionId, learnerId, status) => {
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          attendance: [
            ...classroom.attendance.filter((record) => record.sessionId !== sessionId || record.learnerId !== learnerId),
            { id: newId("attendance"), sessionId, learnerId, status },
          ],
        }))
      },
      addSession: (classroomId, session) => {
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          sessions: [...classroom.sessions, { ...session, id: newId("session") }],
        }))
      },
    }
  }, [classrooms])

  return <ClassroomPrototypeContext.Provider value={value}>{children}</ClassroomPrototypeContext.Provider>
}
