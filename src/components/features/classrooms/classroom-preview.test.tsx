import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthSessionContext, type AuthSessionContextValue } from '@/components/features/auth/auth-session-context'
import { getClassrooms } from '@/services/api/classroom.service'
import { ClassroomPrototypeProvider } from './classroom-prototype-provider'
import { ClassroomsView } from './classrooms-view'
vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: false }))
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)
const session: AuthSessionContextValue = { user: { id: 'student', name: 'Test learner', email: 'test@example.test', roles: ['STUDENT'], status: 'ACTIVE', emailVerifiedAt: '2026-11-14T00:00:00Z', createdAt: '2026-11-14T00:00:00Z' }, status: 'authenticated', error: null, signIn: vi.fn(), signOut: vi.fn(), refreshCurrentUser: vi.fn() }
function open(value = session) { render(<MemoryRouter initialEntries={['/students/classrooms']}><AuthSessionContext.Provider value={value}><ClassroomPrototypeProvider><ClassroomsView /></ClassroomPrototypeProvider></AuthSessionContext.Provider></MemoryRouter>) }
describe('classrooms have no preview fallback', () => {
  it('loads only authenticated records, even with a stale preview flag', async () => {
    vi.mocked(getClassrooms).mockResolvedValue([{ id: 'class', ownerId: 'teacher', name: 'Actual classroom', description: '', createdAt: '2026-11-14T00:00:00Z' }]); open()
    expect(await screen.findByText('Actual classroom')).toBeTruthy(); expect(getClassrooms).toHaveBeenCalledOnce(); expect(screen.queryByText('Demo / Preview data')).toBeNull(); expect(screen.queryByText(/OWL-CONVERSATION/)).toBeNull()
  })
  it('shows an empty collection without seeded classrooms', async () => {
    vi.mocked(getClassrooms).mockResolvedValue([]); open(); expect(await screen.findByText('No classes joined yet')).toBeTruthy(); expect(screen.queryByRole('link', { name: /^View class/ })).toBeNull()
  })
  it('shows a failure without sample records', async () => {
    vi.mocked(getClassrooms).mockRejectedValue(new Error('API unavailable')); open(); expect(await screen.findByRole('alert')).toBeTruthy(); expect(screen.queryByRole('link', { name: /^View class/ })).toBeNull()
  })
  it('does not load account records for an anonymous session', async () => {
    open({ ...session, user: null, status: 'anonymous' }); expect(await screen.findByText('No classes joined yet')).toBeTruthy(); expect(getClassrooms).not.toHaveBeenCalled()
  })
})
