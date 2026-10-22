import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { API_INTEGRATION_ENABLED } from "@/lib/api-mode"
import { getApiErrorMessage } from "@/services/api/api-error"
import {
  createClassroom as createClassroomRequest,
  getClassrooms,
  joinClassroomByCode,
  type ApiClassroom,
} from "@/services/api/classroom.service"
import { DEMO_LEARNER_ID, initialClassrooms } from "./classroom-mock-data"
import { ClassroomPrototypeContext, type ClassroomPrototypeContextValue } from "./classroom-prototype-context"
import type {
  ActivityQuestion,
  Classroom,
  ClassroomActivity,
  ClassroomComment,
  ClassroomPost,
  CreateActivityInput,
} from "./classroom-types"

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function demoTime() {
  return "Just now · demo"
}

function fromApiClassroom(record: ApiClassroom): Classroom {
  const members: Classroom["members"] = [
    { id: `educator-${record.id}`, name: record.instructorName, role: "educator" },
  ]
  if (record.access === "student") {
    members.push({ id: DEMO_LEARNER_ID, name: "You", role: "student" })
  }

  return {
    id: record.id,
    name: record.name,
    subject: record.subject,
    description: record.description,
    instructorName: record.instructorName,
    ownerWorkspace: "educators",
    joinCode: record.joinCode,
    meetingId: record.meetingId,
    access: record.access,
    members,
    memberRequests: [],
    enrolledLearnerIds: record.access === "student" ? [DEMO_LEARNER_ID] : [],
    posts: [],
    chatMessages: [],
    materials: [],
    sessions: [],
    attendance: [],
    activities: [],
    progress: [],
    isMock: false,
  }
}

function buildPost(title: string, body: string, authorRole: "student" | "educator"): ClassroomPost {
  const isStudent = authorRole === "student"
  return {
    id: newId("post"),
    authorId: isStudent ? DEMO_LEARNER_ID : "demo-educator",
    authorName: isStudent ? "You · demo learner" : "You · demo educator",
    authorRole,
    kind: isStudent ? "discussion" : "announcement",
    title: title.trim() || undefined,
    views: 0,
    body: body.trim(),
    createdAt: demoTime(),
    comments: [],
  }
}

function buildComment(body: string, authorRole: "student" | "educator"): ClassroomComment {
  const isStudent = authorRole === "student"
  return {
    id: newId("comment"),
    authorId: isStudent ? DEMO_LEARNER_ID : "demo-educator",
    authorName: isStudent ? "You · demo learner" : "You · demo educator",
    authorRole,
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
  const [classroomsLoading, setClassroomsLoading] = useState(API_INTEGRATION_ENABLED)
  const [classroomsError, setClassroomsError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const requestClassrooms = useCallback(() => {
    return getClassrooms()
      .then((records) => {
        if (!mountedRef.current) return
        const apiClassrooms = records.map(fromApiClassroom)
        const apiIds = new Set(apiClassrooms.map((classroom) => classroom.id))
        setClassrooms((current) => [
          ...current.filter((classroom) => classroom.isMock || !apiIds.has(classroom.id)),
          ...apiClassrooms,
        ])
        setClassroomsError(null)
      })
      .catch((error) => {
        if (mountedRef.current) setClassroomsError(getApiErrorMessage(error, "Connected classrooms are unavailable."))
      })
  }, [])

  const loadClassrooms = useCallback(() => {
    if (!API_INTEGRATION_ENABLED) return
    void requestClassrooms().finally(() => {
      if (mountedRef.current) setClassroomsLoading(false)
    })
  }, [requestClassrooms])

  const reloadClassrooms = useCallback(() => {
    if (!API_INTEGRATION_ENABLED) return
    setClassroomsLoading(true)
    void requestClassrooms().finally(() => setClassroomsLoading(false))
  }, [requestClassrooms])

  useEffect(() => {
    mountedRef.current = true
    loadClassrooms()
    return () => { mountedRef.current = false }
  }, [loadClassrooms])

  const value = useMemo<ClassroomPrototypeContextValue>(() => {
    const updateClassroom = (classroomId: string, update: (classroom: Classroom) => Classroom) => {
      setClassrooms((current) =>
        current.map((classroom) => classroom.id === classroomId ? update(classroom) : classroom),
      )
    }

    return {
      classrooms,
      classroomsLoading,
      classroomsError,
      connectedModeEnabled: API_INTEGRATION_ENABLED,
      getClassroom: (classroomId) => classrooms.find((classroom) => classroom.id === classroomId),
      getClassroomsForWorkspace: (role) => classrooms.filter((classroom) =>
        classroom.isMock
          ? role === "students"
            ? classroom.enrolledLearnerIds.includes(DEMO_LEARNER_ID)
            : classroom.ownerWorkspace === role
          : role === "students"
            ? classroom.access === "student"
            : classroom.access === "owner",
      ),
      reloadClassrooms,
      createClassroom: async (input, ownerWorkspace) => {
        const classroom = fromApiClassroom(await createClassroomRequest(input))
        classroom.ownerWorkspace = ownerWorkspace
        setClassrooms((current) => [classroom, ...current.filter((item) => item.id !== classroom.id)])
        setClassroomsError(null)
        return classroom
      },
      joinClassroom: async (joinCode) => {
        const requestedCode = joinCode.trim().toLowerCase()
        const mockClassroom = classrooms.find((item) =>
          item.isMock && item.joinCode?.toLowerCase() === requestedCode,
        )
        if (mockClassroom) {
          if (mockClassroom.enrolledLearnerIds.includes(DEMO_LEARNER_ID)) {
            return { status: "already-previewed", classroomName: mockClassroom.name }
          }
          updateClassroom(mockClassroom.id, (current) => ({
            ...current,
            enrolledLearnerIds: [...current.enrolledLearnerIds, DEMO_LEARNER_ID],
            members: [...current.members, { id: DEMO_LEARNER_ID, name: "You · demo learner", role: "student" }],
          }))
          return { status: "joined", classroomId: mockClassroom.id, classroomName: mockClassroom.name, source: "demo" }
        }

        if (!API_INTEGRATION_ENABLED) return { status: "unavailable" }

        const classroom = fromApiClassroom(await joinClassroomByCode(joinCode.trim()))
        setClassrooms((current) => [classroom, ...current.filter((item) => item.id !== classroom.id)])
        setClassroomsError(null)
        return { status: "joined", classroomId: classroom.id, classroomName: classroom.name, source: "connected" }
      },
      createMeetingLink: (classroomId, meetingId) => {
        updateClassroom(classroomId, (classroom) => ({ ...classroom, meetingId }))
      },
      createPost: (classroomId, { title, body, authorRole }) => {
        if (!body.trim()) return
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          posts: [buildPost(title, body, authorRole), ...classroom.posts],
        }))
      },
      addComment: (classroomId, postId, body, authorRole) => {
        if (!body.trim()) return
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          posts: classroom.posts.map((post) => post.id === postId
            ? { ...post, comments: [...post.comments, buildComment(body, authorRole)] }
            : post,
          ),
        }))
      },
      requestMember: (classroomId, { name, email }, requestedByRole) => {
        if (!name.trim() || !email.trim()) return
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          memberRequests: [
            ...classroom.memberRequests,
            {
              id: newId("request"),
              name: name.trim(),
              email: email.trim(),
              requestedBy: requestedByRole === "student" ? "You · demo learner" : "You · demo educator",
              requestedByRole,
              status: "pending",
            },
          ],
        }))
      },
      resolveMemberRequest: (classroomId, requestId, decision) => {
        updateClassroom(classroomId, (classroom) => {
          const request = classroom.memberRequests.find((item) => item.id === requestId)
          if (!request || request.status !== "pending") return classroom
          if (decision === "decline") {
            return {
              ...classroom,
              memberRequests: classroom.memberRequests.map((item) => item.id === requestId ? { ...item, status: "declined" } : item),
            }
          }
          const memberId = newId("learner")
          return {
            ...classroom,
            memberRequests: classroom.memberRequests.filter((item) => item.id !== requestId),
            members: [...classroom.members, { id: memberId, name: request.name, role: "student" }],
            enrolledLearnerIds: [...classroom.enrolledLearnerIds, memberId],
          }
        })
      },
      removeMember: (classroomId, memberId) => {
        updateClassroom(classroomId, (classroom) => ({
          ...classroom,
          members: classroom.members.filter((member) => member.id !== memberId),
          enrolledLearnerIds: classroom.enrolledLearnerIds.filter((id) => id !== memberId),
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
  }, [classrooms, classroomsError, classroomsLoading, reloadClassrooms])

  return <ClassroomPrototypeContext.Provider value={value}>{children}</ClassroomPrototypeContext.Provider>
}
