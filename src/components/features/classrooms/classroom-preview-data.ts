import type { Classroom, WorkspaceRole } from './classroom-types'

export const PREVIEW_LEARNER_ID = 'preview-learner'
export const PREVIEW_LEARNER_NAME = 'Alex Rivera'
export const previewTeachers = {
  educators: { id: 'preview-educator', name: 'Sofia Reyes' },
  tutors: { id: 'preview-tutor', name: 'Daniel Cruz' },
  esl: { id: 'preview-esl', name: 'Mia Santos' },
} satisfies Record<Exclude<WorkspaceRole, 'students'>, { id: string; name: string }>

export function makePreviewClass(id: string, name: string, subject: string, workspace: Exclude<WorkspaceRole, 'students'>, enrolled = true, offset = 1): Classroom {
  const teacher = previewTeachers[workspace]
  const future = new Date()
  future.setDate(future.getDate() + offset)
  const date = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`
  const past = new Date()
  past.setDate(past.getDate() - 2)
  const pastDate = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`
  const learner = { id: PREVIEW_LEARNER_ID, name: PREVIEW_LEARNER_NAME, role: 'student' as const }
  const peer = { id: 'preview-peer', name: 'Jamie Tan', role: 'student' as const }
  const activityTitle = workspace === 'esl' ? 'Introduce your favorite place' : workspace === 'tutors' ? 'Guided practice reflection' : 'Apply what we learned'
  return {
    id, name, subject, ownerId: teacher.id, instructorName: teacher.name, ownerWorkspace: workspace,
    description: `A place to learn ${subject.toLowerCase()}, ask questions, and build confidence together. Find our shared resources, upcoming sessions, and activities here.`,
    joinCode: id === 'conversation-club' ? 'OWL-CONVERSATION' : `OWL-${id.toUpperCase()}`,
    meetingId: null, access: 'owner', previewStatus: 'active', isMock: true,
    enrolledLearnerIds: [peer.id, ...(enrolled ? [learner.id] : [])],
    members: [{ ...teacher, role: 'educator' }, peer, ...(enrolled ? [learner] : [])], memberRequests: [], chatMessages: [],
    posts: [
      { id: `${id}-welcome`, authorId: teacher.id, authorName: teacher.name, authorRole: 'educator', kind: 'announcement',
        title: 'Start here · welcome to our class', body: `Welcome to ${name}! Explore Materials before our next session. Use Discussion to ask questions and help each other. Individual feedback stays in your own results.`,
        createdAt: past.toISOString(), comments: [] },
      { id: `${id}-discussion`, authorId: peer.id, authorName: peer.name, authorRole: 'student', kind: 'discussion',
        title: 'What would you like to practice together?', body: `I found the examples in our ${subject.toLowerCase()} guide helpful. Which part would you like us to go over next?`,
        createdAt: new Date(past.getTime() + 3600000).toISOString(), comments: [{ id: `${id}-reply`, authorId: teacher.id, authorName: teacher.name, authorRole: 'educator', body: 'Bring one example to our next session and we will work through it together.', createdAt: new Date(past.getTime() + 7200000).toISOString() }] },
    ],
    materials: [
      { id: `${id}-guide`, title: `${subject} · getting started`, description: 'Instructor-published study guide and worked examples. Shared with enrolled class members.', kind: 'Document' },
      { id: `${id}-practice`, title: 'Practice prompts', description: 'Use these prompts to prepare for our next class discussion. Shared with enrolled class members.', kind: 'Presentation' },
    ],
    sessions: [
      { id: `${id}-previous`, title: `${subject} · foundations`, date: pastDate, time: '16:00', meetingNote: 'Preview · browser local time' },
      { id: `${id}-next`, title: `${subject} · practice together`, date, time: '16:00', meetingNote: 'Preview · browser local time; no meeting connected' },
    ],
    attendance: [{ id: `${id}-attendance`, sessionId: `${id}-previous`, learnerId: PREVIEW_LEARNER_ID, status: 'Present' }],
    activities: [
      { id: `${id}-activity`, title: activityTitle, type: 'Assignment', instructions: `Choose one idea from our ${subject.toLowerCase()} session. Explain it in your own words and include an example.`, dueDate: date, scoringNote: 'Instructor-reviewed feedback', questions: [], responseType: 'Text', status: 'Published', submissions: [] },
      { id: `${id}-draft`, title: 'Next session preparation · teacher draft', type: 'Reading activity', instructions: 'Unpublished preparation for the next session.', dueDate: '', scoringNote: '', questions: [], responseType: 'Text', status: 'Draft', submissions: [] },
    ],
    progress: [
      { id: `${id}-feedback`, learnerId: PREVIEW_LEARNER_ID, learnerName: PREVIEW_LEARNER_NAME, activityTitle: `${subject} · introductory practice`, evaluation: 'Reviewed', feedback: 'Your explanation is clear. Try adding one concrete example in your next response.', released: true },
      { id: `${id}-unreleased`, learnerId: PREVIEW_LEARNER_ID, learnerName: PREVIEW_LEARNER_NAME, activityTitle: 'Teacher review in progress', evaluation: 'Draft evaluation', feedback: 'Unreleased individual feedback.', released: false },
      { id: `${id}-peer-feedback`, learnerId: peer.id, learnerName: peer.name, activityTitle: 'Individual practice', evaluation: 'Reviewed', feedback: 'Private feedback for another learner.', released: true },
    ],
  }
}

export function seedPreviewClassrooms(): Classroom[] {
  return [
    makePreviewClass('human-computer-interaction', 'Human Computer Interaction · BSIT 3A', 'Human Computer Interaction', 'educators'),
    makePreviewClass('quantitative-methods', 'Quantitative Methods · BSIT 2A', 'Quantitative Methods', 'educators', true, 3),
    makePreviewClass('algebra-coaching', 'Algebra coaching circle', 'Algebra', 'tutors', true, 2),
    makePreviewClass('coding-studio', 'The coding studio', 'Programming', 'tutors', true, 4),
    makePreviewClass('everyday-english', 'Everyday English', 'Speaking & listening', 'esl', true, 1),
    makePreviewClass('writing-workshop', 'English writing workshop', 'Writing', 'esl', true, 5),
    makePreviewClass('conversation-club', 'English conversation club', 'Conversation', 'esl', false, 6),
    { ...makePreviewClass('past-math', 'Math foundations · completed preview', 'Mathematics', 'educators'), previewStatus: 'inactive' },
  ]
}
