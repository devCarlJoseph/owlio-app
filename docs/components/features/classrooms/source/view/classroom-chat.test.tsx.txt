import { cleanup, render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { getClassrooms } from '@/services/api/classroom.service'
import { ClassroomDetailView } from './classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
it('Chat does not offer local-only writes or sample messages', async () => {
  vi.mocked(getClassrooms).mockResolvedValue([classroom])
  render(<TestSession path="/students/classrooms/class-id?tab=chat"><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
  expect(await screen.findByText('This section is under development.')).toBeTruthy()
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(screen.queryByRole('button', { name: /send|post|publish/i })).toBeNull()
})
