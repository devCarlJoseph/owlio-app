import type { MeetingRoomScreenProps } from './meeting-room-types'

export type CoachingSamplePerson = { identity: string; name: string; detail: string; micOn: boolean; cameraOn: boolean; raised?: boolean }
export type CoachingRole = Extract<MeetingRoomScreenProps['role'], 'esl' | 'tutors'>

export const coachingSessionPreview: Record<CoachingRole, { title: string; hostLabel: string; people: CoachingSamplePerson[] }> = {
  esl: {
    title: 'Conversation Practice · Travel English',
    hostLabel: 'ESL teacher',
    people: [
      { identity: 'sample-esl-host', name: 'Maya Santos', detail: 'ESL teacher · Host', micOn: true, cameraOn: true },
      { identity: 'sample-esl-1', name: 'Kenji Watanabe', detail: 'Learner · B1', micOn: true, cameraOn: true },
      { identity: 'sample-esl-2', name: 'Lucía Fernández', detail: 'Learner · A2', micOn: false, cameraOn: true, raised: true },
      { identity: 'sample-esl-3', name: 'Amira Haddad', detail: 'Learner · B2', micOn: false, cameraOn: false },
      { identity: 'sample-esl-4', name: 'Daniel Kim', detail: 'Learner · B1', micOn: true, cameraOn: false },
      { identity: 'sample-esl-5', name: 'Sofia Rossi', detail: 'Learner · A2', micOn: false, cameraOn: true },
      { identity: 'sample-esl-6', name: 'Omar Khalid', detail: 'Learner · B1', micOn: false, cameraOn: false },
      { identity: 'sample-esl-7', name: 'Hana Lee', detail: 'Learner · A1', micOn: false, cameraOn: true },
    ],
  },
  tutors: {
    title: 'Algebra Tutoring · Linear Equations',
    hostLabel: 'Tutor',
    people: [
      { identity: 'sample-tutor-host', name: 'Jordan Lee', detail: 'Tutor · Host', micOn: true, cameraOn: true },
      { identity: 'sample-tutor-1', name: 'Priya Nair', detail: 'Learner · Grade 9', micOn: true, cameraOn: true },
      { identity: 'sample-tutor-2', name: 'Marcus Allen', detail: 'Learner · Grade 9', micOn: false, cameraOn: true, raised: true },
      { identity: 'sample-tutor-3', name: 'Sofia Rossi', detail: 'Learner · Grade 10', micOn: false, cameraOn: false },
      { identity: 'sample-tutor-4', name: 'Ethan Brooks', detail: 'Learner · Grade 9', micOn: true, cameraOn: false },
      { identity: 'sample-tutor-5', name: 'Ava Martinez', detail: 'Learner · Grade 9', micOn: false, cameraOn: true },
    ],
  },
}
