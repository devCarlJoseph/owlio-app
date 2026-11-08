import { createContext, useContext } from 'react'
import type { AuthSession, AuthUser, LoginRequest } from '@/services/api/api.types'

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'unavailable'

export type AuthSessionContextValue = {
  user: AuthUser | null
  status: SessionStatus
  error: string | null
  signIn: (credentials: LoginRequest) => Promise<AuthSession>
  signOut: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

export function useAuthSession() {
  const value = useContext(AuthSessionContext)
  if (!value) throw new Error('useAuthSession must be used within AuthSessionProvider.')
  return value
}
