import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { ClassroomPrototypeContext, type ClassroomPrototypeContextValue } from './classroom-prototype-context'
import { classroomForPreviewRole, classroomPreviewStore, previewAuthor } from './classroom-preview-store'
import { makePreviewClass, PREVIEW_LEARNER_ID } from './classroom-preview-data'
import type { Classroom } from './classroom-types'

function unavailable(): never { throw new Error('This action is not included in the classroom preview.') }

export function ClassroomPreviewProvider({ children }: { children: ReactNode }) {
  const records = useSyncExternalStore(classroomPreviewStore.subscribe, classroomPreviewStore.getSnapshot)
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const value = useMemo<ClassroomPrototypeContextValue>(() => {
    const author = previewAuthor(role)
    const visible = (workspace = role) => records.flatMap(item => {
      const classroom = classroomForPreviewRole(item, workspace)
      return classroom ? [classroom] : []
    })
    const update = (id: string, change: (record: Classroom) => Classroom, ownerOnly = false) => classroomPreviewStore.update(id, role, change, ownerOnly)
    return {
      classrooms: visible(), classroomsLoading: false, classroomsError: null, connectedModeEnabled: false,
      currentLearnerId: PREVIEW_LEARNER_ID,
      getClassroom: id => visible().find(item => item.id === id),
      getClassroomsForWorkspace: visible,
      reloadClassrooms: () => {},
      createClassroom: async (input, workspace) => {
        if (role === 'students' || role !== workspace) throw new Error('Select a teaching workspace to create a preview class.')
        if (!input.name.trim()) throw new Error('Enter a classroom name.')
        const classroom = makePreviewClass(`preview-${crypto.randomUUID()}`, input.name.trim(), 'Learning together', workspace, false)
        classroom.description = input.description.trim()
        classroom.members = classroom.members.filter(member => member.role === 'educator')
        classroom.enrolledLearnerIds = []
        classroom.posts = []; classroom.materials = []; classroom.sessions = []; classroom.activities = []; classroom.attendance = []; classroom.progress = []
        classroomPreviewStore.insert(classroom)
        return classroom
      },
      joinClassroom: async code => {
        if (role !== 'students') throw new Error('Use the student preview to join a class.')
        const classroom = classroomPreviewStore.join(code)
        return { status: 'joined', classroomId: classroom.id, classroomName: classroom.name, source: 'demo' }
      },
      createPost: (id, input) => {
        if (!input.body.trim()) return
        if (input.kind === 'announcement' && role === 'students') throw new Error('Announcements are teacher-authored in this preview.')
        update(id, classroom => ({ ...classroom, posts: [{ id: crypto.randomUUID(), authorId: author.id, authorName: author.name,
          authorRole: author.role, title: input.title.trim(), body: input.body.trim(), kind: input.kind ?? 'discussion', createdAt: new Date().toISOString(), comments: [],
        }, ...classroom.posts] }))
      },
      addComment: (id, postId, body) => {
        if (!body.trim()) return
        update(id, classroom => ({ ...classroom, posts: classroom.posts.map(post => post.id === postId ? { ...post, comments: [...post.comments, {
          id: crypto.randomUUID(), authorId: author.id, authorName: author.name, authorRole: author.role, body: body.trim(), createdAt: new Date().toISOString(),
        }] } : post) }))
      },
      togglePostReaction: (id, postId, emoji) => update(id, classroom => ({ ...classroom, posts: classroom.posts.map(post => {
        if (post.id !== postId) return post
        const members = post.reactionMembers?.[emoji] ?? []
        return { ...post, reactionMembers: { ...post.reactionMembers, [emoji]: members.includes(author.id) ? members.filter(item => item !== author.id) : [...members, author.id] } }
      }) })),
      createActivity: (id, input) => {
        const activityId = crypto.randomUUID()
        update(id, classroom => ({ ...classroom, activities: [{ ...input, id: activityId, title: input.title.trim(), status: 'Published', submissions: [] }, ...classroom.activities] }), true)
        return activityId
      },
      submitActivity: (id, activityId, response, fileName) => {
        if (role !== 'students') throw new Error('Use the student preview to submit work.')
        update(id, classroom => ({ ...classroom, activities: classroom.activities.map(activity => activity.id === activityId && activity.status === 'Published' ? {
          ...activity, submissions: [...activity.submissions.filter(item => item.learnerId !== PREVIEW_LEARNER_ID), {
            id: crypto.randomUUID(), learnerId: PREVIEW_LEARNER_ID, learnerName: author.name, response, fileName,
            submittedAt: new Date().toISOString(), status: 'Submitted', released: false,
          }],
        } : activity) }))
      },
      reviewSubmission: (id, activityId, submissionId, evaluation, feedback, score) => update(id, classroom => {
        const submission = classroom.activities.find(item => item.id === activityId)?.submissions.find(item => item.id === submissionId)
        if (!submission) throw new Error('Submission unavailable.')
        return { ...classroom,
          activities: classroom.activities.map(activity => activity.id === activityId ? { ...activity, submissions: activity.submissions.map(item => item.id === submissionId ? {
            ...item, evaluation, feedback, score, released: true, status: 'Returned',
          } : item) } : activity),
          progress: [...classroom.progress.filter(item => item.id !== submissionId), { id: submissionId, learnerId: submission.learnerId, learnerName: submission.learnerName,
            activityTitle: classroom.activities.find(item => item.id === activityId)!.title, evaluation, feedback, released: true }],
        }
      }, true),
      markAttendance: (id, sessionId, learnerId, status) => update(id, classroom => ({ ...classroom, attendance: [
        ...classroom.attendance.filter(item => item.sessionId !== sessionId || item.learnerId !== learnerId),
        { id: crypto.randomUUID(), sessionId, learnerId, status },
      ] }), true),
      addSession: (id, session) => update(id, classroom => ({ ...classroom, sessions: [...classroom.sessions, { ...session, id: crypto.randomUUID() }] }), true),
      startActivityAttempt: (id, activityId) => {
        if (role !== 'students') throw new Error('Use the student preview to start an activity.')
        update(id, classroom => ({ ...classroom, activities: classroom.activities.map(activity => activity.id === activityId && activity.status === 'Published' && !activity.attempts?.some(item => item.learnerId === PREVIEW_LEARNER_ID) ? {
          ...activity, attempts: [...(activity.attempts ?? []), { learnerId: PREVIEW_LEARNER_ID, startedAt: new Date().toISOString() }],
        } : activity) }))
      },
      createMeetingLink: unavailable, requestMember: unavailable, resolveMemberRequest: unavailable, removeMember: unavailable,
      sendChatMessage: unavailable,
    }
  }, [records, role])
  return <ClassroomPrototypeContext.Provider value={value}>{children}</ClassroomPrototypeContext.Provider>
}
