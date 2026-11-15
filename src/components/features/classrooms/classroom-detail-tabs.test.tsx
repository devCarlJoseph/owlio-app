import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getClassrooms, getClassroomStudents } from '@/services/api/classroom.service'
import { ClassroomDetailView } from './classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, teacher, student } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), getClassroomStudents: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getClassrooms).mockResolvedValue([classroom])
  vi.mocked(getClassroomStudents).mockResolvedValue({ items: [], nextCursor: null })
})

function LocationProbe() {
  return <output aria-label="Current query">{useLocation().search}</output>
}
describe('connected classroom details', () => {
  it.each(['classwork','materials','feed'])('preserves %s deep links without simulated activities', async tab => {
    render(<TestSession path={'/students/classrooms/class-id?tab=' + tab}><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
    await screen.findByText(classroom.name)
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe({ classwork: 'Classwork', materials: 'Materials', chat: 'Chat', feed: 'Discussion' }[tab])
    expect(screen.getByText('This section is under development.')).toBeTruthy()
  })
  it('defaults unknown tabs to real classroom details', async () => {
    render(<TestSession path="/students/classrooms/class-id?tab=unknown"><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
    expect(await screen.findByText('About this classroom')).toBeTruthy()
  })
  it('does not invent an invite code after reloading an owner classroom', async () => {
    render(<TestSession user={teacher} path="/educators/classrooms/class-id"><Routes><Route path="/educators/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
    expect(await screen.findByText(/owner must rotate the code/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Copy invite code' })).toBeNull()
  })
  it('keeps query context and loads the owner roster only when Members is opened', async () => {
    const user = userEvent.setup()
    render(<TestSession user={teacher} path="/educators/classrooms/class-id?source=notification"><LocationProbe /><Routes><Route path="/educators/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
    await screen.findByText('About this classroom')
    expect(getClassroomStudents).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'View classwork' }))
    expect(screen.getByLabelText('Current query').textContent).toBe('?source=notification&tab=classwork')
    await user.click(screen.getByRole('tab', { name: 'Members' }))
    await screen.findByText('No students have joined yet.')
    expect(getClassroomStudents).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('tab', { name: 'About' }))
    expect(screen.getByLabelText('Current query').textContent).toBe('?source=notification')
  })
})

describe('persisted classroom invitation bindings', () => {
  it.each(['educators', 'students'])('restores the saved code and scoped meeting link for %s after loading', async role => {
    vi.mocked(getClassrooms).mockResolvedValue([{ ...classroom, joinCode: 'OWLIOA7K2', meetingId: 'session-id', meetingCode: 'OWLIOB8L3' }])
    render(<TestSession user={role === 'students' ? student : teacher} path={'/' + role + '/classrooms/class-id'}><Routes><Route path="/:role/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
    expect(await screen.findByText('OWLIOA7K2')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Copy invite code' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Meeting room' }).getAttribute('href')).toBe('/' + role + '/classrooms/meeting-room?session=session-id&code=OWLIOB8L3')
  })
})
