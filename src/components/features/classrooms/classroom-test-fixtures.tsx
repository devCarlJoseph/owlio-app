import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { AuthSessionContext } from '@/components/features/auth/auth-session-context'
import type { AuthUser } from '@/services/api/api.types'
import { student } from './classroom-test-data'
import { ClassroomPrototypeProvider } from './classroom-prototype-provider'

export function TestSession({ user = student, path = '/students/classrooms', children }: { user?: AuthUser | null; path?: string; children: ReactNode }) {
  return <MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={{ user, status: user ? 'authenticated' : 'anonymous', error: null,
    signIn: async () => { throw new Error('Not used') }, signOut: async () => {}, refreshCurrentUser: async () => {} }}>
    <ClassroomPrototypeProvider>{children}</ClassroomPrototypeProvider>
  </AuthSessionContext.Provider></MemoryRouter>
}
