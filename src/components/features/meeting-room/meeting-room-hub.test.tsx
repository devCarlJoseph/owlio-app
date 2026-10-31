import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthSessionContext } from '@/components/features/auth/auth-session-context'
import { ClassroomPreviewProvider } from '@/components/features/classrooms/classroom-preview-provider'
import { classroomPreviewStore } from '@/components/features/classrooms/classroom-preview-store'
import MeetingRoomPage from '@/pages/dashboard/classroom/meeting-room'

beforeEach(() => classroomPreviewStore.reset())
afterEach(cleanup)

function open(path = '/students/classrooms/meeting-room') {
  render(<MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={{ user: null, status: 'anonymous', error: null,
    signIn: async () => { throw new Error('Preview only') }, signOut: async () => {}, refreshCurrentUser: async () => {} }}>
    <ClassroomPreviewProvider><Routes>
      <Route element={<><nav aria-label="Workspace navigation">Sidebar</nav><Outlet /></>}>
        <Route path="/:role/classrooms/meeting-room" element={<MeetingRoomPage />} />
      </Route>
    </Routes></ClassroomPreviewProvider>
  </AuthSessionContext.Provider></MemoryRouter>)
}

describe('meeting room entry', () => {
  it('shows three categories and filters enrolled classes while keeping the student workspace', () => {
    open()
    expect(screen.getByRole('navigation', { name: 'Workspace navigation' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Classroom/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Classroom/ }))
    expect(screen.getByRole('heading', { name: 'Human Computer Interaction · BSIT 3A' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Algebra coaching circle' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Tutor/ }))
    expect(screen.getByRole('heading', { name: 'Tutor meetings' })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Open class' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Open class' }).every(link => link.getAttribute('href')?.startsWith('/students/classrooms/'))).toBe(true)
    expect(screen.queryByRole('heading', { name: 'Human Computer Interaction · BSIT 3A' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /ESL/ }))
    expect(screen.getByRole('heading', { name: 'ESL meetings' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Everyday English' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'English conversation club' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Use a meeting invite' }).getAttribute('href')).toBe('/students/classrooms/meeting-room?category=esl&join=1')
    expect(screen.queryByRole('link', { name: 'Join meeting' })).toBeNull()
  })

  it('opens invite entry inside the dashboard and returns to the category page', () => {
    open('/students/classrooms/meeting-room?category=tutors')
    fireEvent.click(screen.getByRole('link', { name: 'Use a meeting invite' }))
    expect(screen.getByLabelText('Invite link or room code')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Meeting room' }).className).not.toContain('fixed')
    expect(screen.getByRole('navigation', { name: 'Workspace navigation' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Back to Meeting Room' }))
    expect(screen.getByRole('group', { name: 'Meeting categories' })).toBeTruthy()
  })

  it('preserves a teacher workspace and keeps direct invites supported', () => {
    open('/tutors/classrooms/meeting-room?category=tutors')
    expect(screen.getAllByRole('link', { name: 'Open class' }).every(link => link.getAttribute('href')?.startsWith('/tutors/classrooms/'))).toBe(true)
    cleanup()
    open('/students/classrooms/meeting-room?room=12345678-1234-1234-1234-123456789abc')
    expect(screen.getByLabelText('Invite link or room code')).toBeTruthy()
    expect(screen.queryByRole('group', { name: 'Meeting categories' })).toBeNull()
  })
})
