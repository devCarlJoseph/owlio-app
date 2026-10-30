import { PREVIEW_LEARNER_ID, PREVIEW_LEARNER_NAME, previewTeachers, seedPreviewClassrooms } from './classroom-preview-data'
import type { Classroom, WorkspaceRole } from './classroom-types'

export function classroomForPreviewRole(classroom: Classroom, role: WorkspaceRole): Classroom | undefined {
  if (role !== 'students') return classroom.ownerWorkspace === role ? { ...classroom, access: 'owner' } : undefined
  if (!classroom.enrolledLearnerIds.includes(PREVIEW_LEARNER_ID)) return undefined
  return {
    ...classroom, access: 'student', joinCode: null, memberRequests: [], chatMessages: [],
    members: classroom.members.filter(member => member.id === PREVIEW_LEARNER_ID || member.id === classroom.ownerId),
    enrolledLearnerIds: [PREVIEW_LEARNER_ID],
    activities: classroom.activities.filter(activity => activity.status === 'Published').map(activity => ({ ...activity,
      submissions: activity.submissions.filter(item => item.learnerId === PREVIEW_LEARNER_ID).map(item => item.released ? item : {
        id: item.id, learnerId: item.learnerId, learnerName: item.learnerName, response: item.response,
        fileName: item.fileName, submittedAt: item.submittedAt, status: item.status, released: false,
      }),
      attempts: activity.attempts?.filter(item => item.learnerId === PREVIEW_LEARNER_ID),
    })),
    attendance: classroom.attendance.filter(record => record.learnerId === PREVIEW_LEARNER_ID),
    progress: classroom.progress.filter(record => record.learnerId === PREVIEW_LEARNER_ID && record.released),
  }
}

export function createClassroomPreviewStore(initial = seedPreviewClassrooms()) {
  let records = initial
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach(listener => listener())
  return {
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    getSnapshot: () => records,
    reset: () => { records = seedPreviewClassrooms(); emit() },
    insert: (classroom: Classroom) => { records = [classroom, ...records]; emit() },
    update: (id: string, role: WorkspaceRole, change: (record: Classroom) => Classroom, ownerOnly = false) => {
      const classroom = records.find(item => item.id === id)
      const visible = classroom && classroomForPreviewRole(classroom, role)
      if (!visible || (ownerOnly && visible.access !== 'owner')) throw new Error('This action is unavailable in this classroom preview.')
      records = records.map(item => item.id === id ? change(item) : item)
      emit()
    },
    join: (code: string) => {
      const classroom = records.find(item => item.joinCode === code.trim().toUpperCase())
      if (!classroom) throw new Error('That preview code was not found. Check the code and try again.')
      if (classroom.previewStatus === 'inactive') throw new Error('This preview class is inactive.')
      if (!classroom.enrolledLearnerIds.includes(PREVIEW_LEARNER_ID)) {
        records = records.map(item => item.id === classroom.id ? { ...item,
          enrolledLearnerIds: [...item.enrolledLearnerIds, PREVIEW_LEARNER_ID],
          members: [...item.members, { id: PREVIEW_LEARNER_ID, name: PREVIEW_LEARNER_NAME, role: 'student' }],
        } : item)
        emit()
      }
      return classroomForPreviewRole(records.find(item => item.id === classroom.id)!, 'students')!
    },
  }
}

export function previewAuthor(role: WorkspaceRole) {
  return role === 'students'
    ? { id: PREVIEW_LEARNER_ID, name: PREVIEW_LEARNER_NAME, role: 'student' as const }
    : { ...previewTeachers[role], role: 'educator' as const }
}

export const classroomPreviewStore = createClassroomPreviewStore()
