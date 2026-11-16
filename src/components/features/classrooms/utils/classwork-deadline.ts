import type { Classwork, Submission } from '@/services/api/academic.service'

export function classworkClosed(dueAt: string | null, now = Date.now()) {
  return dueAt !== null && now >= Date.parse(dueAt)
}

export function classworkStatus(work: Classwork, submission: Pick<Submission, 'status'> | null, now = Date.now()) {
  if (work.status === 'DRAFT') return 'Draft'
  if (submission?.status === 'SUBMITTED') return 'Submitted'
  if (classworkClosed(work.dueAt, now)) return 'Missing'
  return submission ? 'In progress' : 'Assigned'
}

export function formatClassworkDate(value: string | null) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'No deadline'
}

export function localClassworkDate(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

export function readClassworkFields(form: FormData) {
  const title = String(form.get('title') ?? '').trim()
  const instructions = String(form.get('instructions') ?? '').trim()
  const closing = String(form.get('dueAt') ?? '')
  const dueAt = new Date(closing)
  if (!title || !instructions) throw new Error('Add a title and instructions.')
  if (!closing || !Number.isFinite(dueAt.getTime()) || dueAt.getTime() <= Date.now()) throw new Error('Choose a closing date and time in the future.')
  const points = String(form.get('maxPoints') ?? '').trim()
  const maxPoints = points === '' ? null : Number(points)
  if (maxPoints !== null && (!Number.isInteger(maxPoints) || maxPoints < 1 || maxPoints > 10000)) throw new Error('Maximum points must be a whole number from 1 to 10,000.')
  return { title, instructions, dueAt: dueAt.toISOString(), maxPoints }
}
