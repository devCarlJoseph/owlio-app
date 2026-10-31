import { BookOpen, ClipboardCheck, FileText, FlaskConical, MessageSquare, Mic, Paperclip, Presentation, Wrench } from 'lucide-react'
import type { ActivityType, Classroom, ClassroomActivity, WorkspaceRole } from '@/components/features/classrooms/classroom-types'

export type TeachingRole = Exclude<WorkspaceRole, 'students'>
export type ActivityEntry = { key: string; classroom: Classroom; activity: ClassroomActivity }
export type ActivityFilter = 'all' | 'review' | 'Draft' | 'Published'
export type DueFilter = 'all' | 'upcoming' | 'past' | 'undated'
export const activityTypes: ActivityType[] = ['Quiz', 'Test', 'Assignment', 'File submission', 'Project', 'Presentation', 'Lab work', 'Practical activity', 'Discussion activity', 'Reading activity', 'Speaking practice']
export const questionTypes = ['Multiple choice', 'Multiple select', 'True or false', 'Identification', 'Short answer', 'Essay'] as const
export const activityKey = (classroomId: string, activityId: string) => JSON.stringify([classroomId, activityId])
export const pendingResponses = (activity: ClassroomActivity) => activity.submissions.filter(item => !item.released).length
export const activityIcon = (type: ActivityType) => ({ Quiz: ClipboardCheck, Test: ClipboardCheck, Assignment: FileText, 'File submission': Paperclip, Project: Wrench, Presentation, 'Lab work': FlaskConical, 'Practical activity': Wrench, 'Discussion activity': MessageSquare, 'Reading activity': BookOpen, 'Speaking practice': Mic })[type]

export const workspaceCopy = {
  educators: { title: 'Classwork & Assessments', eyebrow: 'Teaching workspace', description: 'Organize classwork, review responses, and return useful feedback.', context: 'Classroom', contexts: 'All classrooms', openContext: 'Open classroom', criteria: 'Assessment criteria', review: 'Evaluation', boundary: 'Classwork and feedback stay with their owning class. Official grades belong in the separate Gradebook workflow.' },
  esl: { title: 'Activities & Assessments', eyebrow: 'Language teaching', description: 'Prepare language practice, review responses, and guide the next step.', context: 'Learning group', contexts: 'All learning groups', openContext: 'Open learning group', criteria: 'Practice / assessment criteria', review: 'Teacher evaluation', boundary: 'Language practice does not automatically create a grade or proficiency level. Private teaching notes stay separate from released feedback.' },
  tutors: { title: 'Activities & Evaluations', eyebrow: 'Tutoring workspace', description: 'Prepare practice, review learner work, and share tutor feedback.', context: 'Learner / group', contexts: 'All learner groups', openContext: 'Open learner group', criteria: 'Practice / evaluation criteria', review: 'Tutor evaluation', boundary: 'Tutor evaluations are separate from school grades. Private Session Notes stay outside learner-visible feedback.' },
} satisfies Record<TeachingRole, { title: string; eyebrow: string; description: string; context: string; contexts: string; openContext: string; criteria: string; review: string; boundary: string }>

export function ownedPreviewClasses(classrooms: Classroom[], role: TeachingRole): Classroom[] {
  return classrooms.filter(item => item.isMock && item.access === 'owner' && item.ownerWorkspace === role)
}
export function activityEntries(classrooms: Classroom[]): ActivityEntry[] {
  return classrooms.flatMap(classroom => classroom.activities.map(activity => ({ key: activityKey(classroom.id, activity.id), classroom, activity })))
}
export function formatActivityDate(value: string): string {
  if (!value) return 'No due date'
  const date = new Date(`${value}T00:00:00`)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unavailable'
}
export function filterActivities(entries: ActivityEntry[], filters: { query: string; context: string; type: string; status: ActivityFilter; due: DueFilter; sort: 'due' | 'title' }, today = new Date()): ActivityEntry[] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).getTime()
  const query = filters.query.trim().toLowerCase()
  return entries.filter(({ activity, classroom }) => {
    const date = new Date(`${activity.dueDate}T00:00:00`).getTime()
    return (filters.context === 'all' || classroom.id === filters.context) &&
      (filters.type === 'all' || activity.type === filters.type) &&
      (filters.status === 'all' || (filters.status === 'review' ? pendingResponses(activity) > 0 : activity.status === filters.status)) &&
      (filters.due === 'all' || (filters.due === 'undated' ? !activity.dueDate : filters.due === 'past' ? date < start : date >= start && date < end)) &&
      `${activity.title} ${activity.instructions} ${activity.type} ${classroom.name} ${classroom.subject}`.toLowerCase().includes(query)
  }).sort((a, b) => filters.sort === 'title' ? a.activity.title.localeCompare(b.activity.title) :
    (a.activity.dueDate || '9999').localeCompare(b.activity.dueDate || '9999') || a.activity.title.localeCompare(b.activity.title))
}
