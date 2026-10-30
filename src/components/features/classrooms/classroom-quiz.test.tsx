import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { ClassroomActivityView } from './classroom-activity-view'
vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: true }))
afterEach(cleanup)
it('does not render sample quizzes or accept submissions without an activity API', () => {
  render(<MemoryRouter initialEntries={['/students/classrooms/biology-101/classwork/sample-quiz']}><ClassroomActivityView /></MemoryRouter>)
  expect(screen.getByText('Classroom activities are not available yet')).toBeTruthy()
  expect(screen.queryByRole('button', { name: /start|submit|return/i })).toBeNull()
  expect(screen.getByRole('link', { name: 'Back to classrooms' }).getAttribute('href')).toBe('/students/classrooms')
})
