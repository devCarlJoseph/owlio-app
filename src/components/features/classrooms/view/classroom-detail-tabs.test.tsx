import { cleanup, render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getClassrooms } from '@/services/api/classroom.service'
import { ClassroomDetailView } from './classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, teacher } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), getClassroomStudents: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
beforeEach(() => { vi.mocked(getClassrooms).mockResolvedValue([classroom]) })
describe('connected classroom details', () => {
  it.each(['classwork','materials','chat','feed'])('preserves %s deep links without simulated activities', async tab => {
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
    expect(await screen.findByText(/Retrieving or replacing a lost code/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Copy invite code' })).toBeNull()
  })
})
