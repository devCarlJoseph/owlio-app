import { cleanup, render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ClassroomScheduleView } from '../view/classroom-schedule-view'
import { eventsOnDay } from '../lib/schedule-dates'
import type { Classroom } from '../types/classroom-types'
import { getClassroomSessions, scheduleClassroomSession, type ScheduledSession } from '@/services/api/meeting.service'

const auth = vi.hoisted(() => ({ user: { id: 'student', roles: ['STUDENT'] } }))
vi.mock('@/components/features/auth/context/auth-session-context', () => ({ useAuthSession: () => auth }))
vi.mock('@/services/api/meeting.service', () => ({ getClassroomSessions: vi.fn(), scheduleClassroomSession: vi.fn() }))
const classroom = { id: 'class-id', ownerId: 'teacher', access: 'student', ownerWorkspace: 'educators' } as Classroom
const now = new Date()
const start = new Date(now.getFullYear(), now.getMonth(), 15, 9)
const end = new Date(now.getFullYear(), now.getMonth(), 15, 11)
const exam: ScheduledSession = { id: 'exam', title: 'Mock exam', startsAt: start.toISOString(), endsAt: end.toISOString(), mode: 'IN_PERSON', status: 'SCHEDULED', version: 0 }
afterEach(() => { cleanup(); vi.resetAllMocks() })
beforeEach(() => { auth.user = { id: 'student', roles: ['STUDENT'] }; vi.mocked(getClassroomSessions).mockResolvedValue([exam]) })

describe('classroom schedule', () => {
  it('shows adviser schedules in both views, opens details, and keeps learners read-only', async () => {
    render(<ClassroomScheduleView classroom={classroom} />)
    await userEvent.click(await screen.findByRole('button', { name: /Mock exam/ }))
    expect(await screen.findByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Mock exam' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await userEvent.click(screen.getByRole('button', { name: /list/i }))
    expect(screen.getAllByText('Mock exam')).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Add schedule' })).toBeNull()
    expect(scheduleClassroomSession).not.toHaveBeenCalled()
  })
  it('recovers when changing months after a denied read, and aborts the old request', async () => {
    vi.mocked(getClassroomSessions).mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue([])
    render(<ClassroomScheduleView classroom={classroom} />)
    await screen.findByRole('alert')
    const signal = vi.mocked(getClassroomSessions).mock.calls[0][3]!
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(await screen.findByText('No schedules this month')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(signal.aborted).toBe(true)
  })
  it('validates event times and saves an owner schedule through the existing service', async () => {
    auth.user = { id: 'teacher', roles: ['EDUCATOR'] }
    vi.mocked(scheduleClassroomSession).mockResolvedValue(exam)
    const { container } = render(<ClassroomScheduleView classroom={{ ...classroom, access: 'owner' }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add schedule' }))
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Prelim exam' } })
    expect(container.querySelector('input[type="datetime-local"], input[type="date"], input[type="time"], select:not([aria-hidden="true"])')).toBeNull()
    await userEvent.click(screen.getByLabelText('Starts'))
    const dayLabel = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(start)
    await userEvent.click(within(screen.getByRole('region', { name: 'Starts date and time picker' })).getByRole('button', { name: dayLabel }))
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await userEvent.click(screen.getByLabelText('Ends'))
    await userEvent.click(within(screen.getByRole('region', { name: 'Ends date and time picker' })).getByRole('button', { name: dayLabel }))
    fireEvent.change(screen.getByLabelText('Ends hour'), { target: { value: '08' } })
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('end time after'))
    expect(scheduleClassroomSession).not.toHaveBeenCalled()
    await userEvent.click(screen.getByLabelText('Ends'))
    fireEvent.change(screen.getByLabelText('Ends hour'), { target: { value: '11' } })
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await userEvent.click(screen.getByRole('combobox', { name: 'Mode' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Hybrid' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save schedule' }))
    await waitFor(() => expect(scheduleClassroomSession).toHaveBeenCalledWith('class-id', expect.objectContaining({ title: 'Prelim exam', startsAt: start.toISOString(), endsAt: end.toISOString(), mode: 'HYBRID' })))
    expect(await screen.findByText('Schedule saved and available to classroom members.')).toBeTruthy()
  })
  it('shows multi-day events on each occupied day without including an exclusive midnight end', () => {
    const item = { ...exam, startsAt: new Date(2026, 11, 15, 23).toISOString(), endsAt: new Date(2026, 11, 17, 0).toISOString() }
    expect(eventsOnDay([item], new Date(2026, 11, 16))).toEqual([item])
    expect(eventsOnDay([item], new Date(2026, 11, 17))).toEqual([])
  })
})
