import type { MeetingRoomScreenProps } from './meeting-room-types'

export type CoachingSamplePerson = { identity: string; name: string; detail: string; micOn: boolean; cameraOn: boolean; raised?: boolean }
export type CoachingSampleNote = { time: string; speaker: string; text: string }
export type CoachingSampleSummary = { title: string; range: string; text: string }

type CoachingRole = Extract<MeetingRoomScreenProps['role'], 'esl' | 'tutors'>

export const coachingSessionPreview: Record<CoachingRole, {
  title: string
  people: CoachingSamplePerson[]
  notesTitle: string
  notes: CoachingSampleNote[]
  summary: CoachingSampleSummary[]
}> = {
  esl: {
    title: 'Conversation Practice · Travel English',
    people: [
      { identity: 'sample-esl-host', name: 'Maya Santos', detail: 'ESL teacher · Host', micOn: true, cameraOn: true },
      { identity: 'sample-esl-1', name: 'Kenji Watanabe', detail: 'Learner · B1', micOn: true, cameraOn: true },
      { identity: 'sample-esl-2', name: 'Lucía Fernández', detail: 'Learner · A2', micOn: false, cameraOn: true, raised: true },
      { identity: 'sample-esl-3', name: 'Amira Haddad', detail: 'Learner · B2', micOn: false, cameraOn: false },
      { identity: 'sample-esl-4', name: 'Daniel Kim', detail: 'Learner · B1', micOn: true, cameraOn: false },
    ],
    notesTitle: 'Speaking practice',
    notes: [
      { time: '00:15', speaker: 'Maya Santos', text: 'Let’s practise checking in at a hotel. Kenji, can you ask for a room with a view?' },
      { time: '00:42', speaker: 'Kenji Watanabe', text: 'Good evening. I would like to book a room with a view of the sea, please.' },
      { time: '01:10', speaker: 'Lucía Fernández', text: 'How much does it cost for one night, and is breakfast included?' },
    ],
    summary: [
      { title: 'Hotel check-in phrases', range: '00:15 – 01:00', text: 'Learners practised polite requests such as “I would like…” and “Could I have…” for booking rooms.' },
      { title: 'Asking about prices', range: '01:00 – 02:00', text: 'The group compared “How much is…” and “How much does it cost…” and used them in short role plays.' },
      { title: 'Pronunciation focus', range: '02:00 – 03:00', text: 'Linking sounds in “a room with a view” were modelled and repeated in pairs.' },
    ],
  },
  tutors: {
    title: 'Algebra Tutoring · Linear Equations',
    people: [
      { identity: 'sample-tutor-host', name: 'Jordan Lee', detail: 'Tutor · Host', micOn: true, cameraOn: true },
      { identity: 'sample-tutor-1', name: 'Priya Nair', detail: 'Learner · Grade 9', micOn: true, cameraOn: true },
      { identity: 'sample-tutor-2', name: 'Marcus Allen', detail: 'Learner · Grade 9', micOn: false, cameraOn: true, raised: true },
      { identity: 'sample-tutor-3', name: 'Sofia Rossi', detail: 'Learner · Grade 10', micOn: false, cameraOn: false },
      { identity: 'sample-tutor-4', name: 'Ethan Brooks', detail: 'Learner · Grade 9', micOn: true, cameraOn: false },
    ],
    notesTitle: 'Problem walkthrough',
    notes: [
      { time: '00:15', speaker: 'Jordan Lee', text: 'Let’s solve 3x + 5 = 20 together. What should we do first?' },
      { time: '00:38', speaker: 'Priya Nair', text: 'Subtract 5 from both sides, so 3x equals 15.' },
      { time: '01:05', speaker: 'Marcus Allen', text: 'Then divide by 3, so x is 5. Can we check it by substituting?' },
    ],
    summary: [
      { title: 'Isolating the variable', range: '00:15 – 01:00', text: 'Learners practised undoing addition before division when solving one-variable equations.' },
      { title: 'Checking answers', range: '01:00 – 02:00', text: 'The group substituted solutions back into the original equation to confirm them.' },
      { title: 'Next practice set', range: '02:00 – 03:00', text: 'Equations with variables on both sides were introduced for the next session.' },
    ],
  },
}
