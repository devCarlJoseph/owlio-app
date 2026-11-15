import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthSessionContext } from '@/components/features/auth/auth-session-context'
import { ClassroomPrototypeProvider } from '@/components/features/classrooms/classroom-prototype-provider'
import { getClassrooms } from '@/services/api/classroom.service'
import { createMeeting, getClassroomSessions } from '@/services/api/meeting.service'
import MeetingRoomPage from './meeting-room-view'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
vi.mock('@/services/api/meeting.service', () => ({ createMeeting: vi.fn(), endMeeting: vi.fn(), joinMeeting: vi.fn(), getClassroomSessions: vi.fn(), scheduleClassroomSession: vi.fn(), getMeetingState: vi.fn(), getMeetingParticipants: vi.fn(), getMeetingMessages: vi.fn(), sendMeetingMessage: vi.fn(), setMeetingHand: vi.fn() }))
const id = '11111111-1111-4111-8111-111111111111'
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getClassrooms).mockResolvedValue([]); vi.mocked(getClassroomSessions).mockResolvedValue([]) })
afterEach(cleanup)
function open(path = '/students/classrooms/meeting-room', teacher = false) {
  return render(<MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={{ user: { id: 'user', name: 'Test', email: 'test@example.test', roles: teacher ? ['EDUCATOR'] : ['STUDENT'], status: 'ACTIVE', emailVerifiedAt: '2026-11-14T00:00:00Z', createdAt: '2026-11-14T00:00:00Z' }, status: 'authenticated', error: null, signIn: vi.fn(), signOut: vi.fn(), refreshCurrentUser: vi.fn() }}><ClassroomPrototypeProvider><MeetingRoomPage /></ClassroomPrototypeProvider></AuthSessionContext.Provider></MemoryRouter>)
}
describe('connected meeting entry', () => {
  it.each(['students', 'educators', 'tutors', 'esl'])('restores the %s meeting hub without opening a live room', async role => {
    open('/' + role + '/classrooms/meeting-room')
    expect(await screen.findByRole('group', { name: 'Meeting categories' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Preview room layout' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Scheduled sessions' }).getAttribute('href')).toContain('source=account')
    expect(createMeeting).not.toHaveBeenCalled()
  })
  it.each(['students', 'educators', 'tutors', 'esl'])('opens the %s room layout without connecting to media', async role => {
    open('/' + role + '/classrooms/meeting-room?layout-preview=1')
    expect(await screen.findByText('Layout preview')).toBeTruthy()
    expect(createMeeting).not.toHaveBeenCalled()
  })
  it('keeps connected scheduled sessions accessible from the restored hub', async () => {
    open('/students/classrooms/meeting-room?source=account')
    expect(await screen.findByText('Join or create a class to see its sessions.')).toBeTruthy()
    expect(screen.queryByRole('group', { name: 'Meeting categories' })).toBeNull()
  })
  it('returns from a layout preview to the category hub without opening a live room', async () => {
    open('/tutors/classrooms/meeting-room?layout-preview=1&join=1')
    fireEvent.click(await screen.findByRole('button', { name: 'Exit preview' }))
    expect(await screen.findByRole('group', { name: 'Meeting categories' })).toBeTruthy()
    expect(createMeeting).not.toHaveBeenCalled()
  })
  it('rejects legacy room invites without opening a fabricated live room', async () => {
    open('/students/classrooms/meeting-room?room=' + id)
    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' }))
    expect((await screen.findByRole('alert')).textContent).toContain('scheduled-session invite')
  })
  it('opens an owned scheduled-session room and reports backend confirmation', async () => {
    vi.mocked(createMeeting).mockResolvedValue({ id, status: 'OPEN' })
    open('/educators/classrooms/meeting-room?session=' + id, true)
    expect((screen.getByLabelText('Invite link or room code') as HTMLInputElement).value).toBe('OWLIO-SESSION-' + id)
    fireEvent.click(screen.getByRole('button', { name: 'Open session room' }))
    await waitFor(() => expect(createMeeting).toHaveBeenCalledWith(id))
    expect(await screen.findByText(/Session room opened/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'End meeting for everyone' })).toBeNull()
  })
  it('reports a disabled provider without previewing a successful room', async () => {
    vi.mocked(createMeeting).mockRejectedValue(new Error('Native meetings unavailable.'))
    open('/educators/classrooms/meeting-room?session=' + id, true)
    fireEvent.click(screen.getByRole('button', { name: 'Open session room' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Native meetings unavailable.')
    expect(screen.queryByText(/Session room opened/)).toBeNull()
  })
})
