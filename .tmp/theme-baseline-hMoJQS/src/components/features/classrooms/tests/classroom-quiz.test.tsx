import { cleanup, render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { ClassroomActivityView } from '../view/classroom-activity-view'
import { TestSession } from './classroom-test-fixtures'
import { getClassrooms } from '@/services/api/classroom.service'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn() }))

afterEach(cleanup)
it('keeps an unavailable classroom activity read-only without sample quiz fallbacks', async () => {
  vi.mocked(getClassrooms).mockResolvedValue([])
  render(<TestSession path="/students/classrooms/biology-101/classwork/sample-quiz"><Routes><Route path="/students/classrooms/:classroomId/classwork/:activityId" element={<ClassroomActivityView />} /></Routes></TestSession>)
  expect(await screen.findByText('Classwork is not available in this workspace.')).toBeTruthy()
  expect(screen.queryByRole('button', { name: /start|submit|return/i })).toBeNull()
  expect(screen.getByRole('link', { name: 'Back to classroom' }).getAttribute('href')).toBe('/students/classrooms/biology-101?tab=classwork')
})
