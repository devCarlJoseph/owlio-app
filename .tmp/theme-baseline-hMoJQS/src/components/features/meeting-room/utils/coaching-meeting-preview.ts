import type { MeetingRoomScreenProps } from '../types/meeting-room-types'

export type CoachingSamplePerson = { identity: string; name: string; detail: string; micOn: boolean; cameraOn: boolean; raised?: boolean }
export type CoachingRole = Extract<MeetingRoomScreenProps['role'], 'esl' | 'tutors'>

export const coachingSessionPreview: Record<CoachingRole, { title: string; hostLabel: string; people: CoachingSamplePerson[] }> = {
  esl: {
    title: 'Language learning session',
    hostLabel: 'ESL teacher',
    people: [],
  },
  tutors: {
    title: 'Tutoring session',
    hostLabel: 'Tutor',
    people: [],
  },
}
