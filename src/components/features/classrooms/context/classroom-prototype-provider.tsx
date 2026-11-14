import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { AuthUser } from '@/services/api/api.types'
import { createClassroom, getClassrooms, joinClassroomByCode, type ApiClassroom } from '@/services/api/classroom.service'
import { ClassroomPrototypeContext, type ClassroomPrototypeContextValue } from './classroom-prototype-context'
import type { Classroom } from './classroom-types'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { ClassroomPreviewProvider } from './classroom-preview-provider'

function unsupported(): never { throw new Error('This classroom feature is not available yet.') }

function fromApi(record: ApiClassroom, user: AuthUser, joinCode: string | null = null): Classroom {
  const owned = record.ownerId === user.id
  return { id: record.id, ownerId: record.ownerId, name: record.name, description: record.description,
    subject: '', instructorName: owned ? user.name : '', ownerWorkspace: null,
    joinCode: owned ? joinCode : null, meetingId: null, access: owned ? 'owner' : 'student',
    members: [], memberRequests: [], enrolledLearnerIds: [], posts: [], chatMessages: [],
    materials: [], sessions: [], attendance: [], activities: [], progress: [], isMock: false }
}

export function ClassroomPrototypeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthSession()
  if (!API_INTEGRATION_ENABLED) return <ClassroomPreviewProvider>{children}</ClassroomPreviewProvider>
  // Remount on account/role changes so data and one-time invite codes cannot cross sessions.
  return <ClassroomSessionProvider key={user ? user.id + ':' + user.roles.join(',') : 'anonymous'} user={user}>{children}</ClassroomSessionProvider>
}

function ClassroomSessionProvider({ user, children }: { user: AuthUser | null; children: ReactNode }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [classroomsLoading, setLoading] = useState(Boolean(user))
  const [classroomsError, setError] = useState<string | null>(null)
  const generation = useRef(0)
  const load = useCallback((signal?: AbortSignal) => {
    if (!user) return Promise.resolve()
    const request = ++generation.current
    return getClassrooms(signal).then(records => {
      if (signal?.aborted || request !== generation.current) return
      setClassrooms(current => records.map(record => fromApi(record, user,
        current.find(item => item.id === record.id)?.joinCode ?? null)))
      setError(null)
    }).catch(error => {
      if (signal?.aborted || request !== generation.current) return
      setClassrooms([])
      setError(getApiErrorMessage(error, 'Your classes could not be loaded.'))
    }).finally(() => {
      if (!signal?.aborted && request === generation.current) setLoading(false)
    })
  }, [user])
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])
  const reloadClassrooms = useCallback(() => { setLoading(Boolean(user)); void load() }, [load, user])
  const value = useMemo<ClassroomPrototypeContextValue>(() => ({
    classrooms, classroomsLoading, classroomsError, connectedModeEnabled: true, currentLearnerId: user?.id,
    getClassroom: id => classrooms.find(item => item.id === id),
    getClassroomsForWorkspace: role => classrooms.filter(item => role === 'students' ? item.access === 'student' : item.access === 'owner'),
    reloadClassrooms,
    createClassroom: async input => {
      if (!user) throw new Error('Sign in before creating a classroom.')
      const result = await createClassroom(input)
      const classroom = fromApi(result.classroom, user, result.joinCode)
      generation.current++
      setClassrooms(current => [classroom, ...current.filter(item => item.id !== classroom.id)])
      setLoading(false); setError(null)
      return classroom
    },
    joinClassroom: async code => {
      if (!user) throw new Error('Sign in before joining a classroom.')
      const classroom = fromApi(await joinClassroomByCode(code.trim()), user)
      generation.current++
      setClassrooms(current => [classroom, ...current.filter(item => item.id !== classroom.id)])
      setLoading(false); setError(null)
      return { status: 'joined', classroomId: classroom.id, classroomName: classroom.name, source: 'connected' }
    },
    // These screens have no API contract yet; never simulate a successful write.
    createMeetingLink: unsupported, createPost: unsupported, addComment: unsupported, togglePostReaction: unsupported,
    requestMember: unsupported, resolveMemberRequest: unsupported, removeMember: unsupported,
    sendChatMessage: unsupported, createActivity: unsupported, submitActivity: unsupported,
    startActivityAttempt: unsupported, reviewSubmission: unsupported, markAttendance: unsupported, addSession: unsupported,
  }), [classrooms, classroomsLoading, classroomsError, reloadClassrooms, user])
  return <ClassroomPrototypeContext.Provider value={value}>{children}</ClassroomPrototypeContext.Provider>
}
