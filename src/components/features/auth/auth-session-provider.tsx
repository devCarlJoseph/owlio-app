import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { AuthUser, LoginRequest } from '@/services/api/api.types'
import { getCurrentUser, loginAccount, logoutAccount, refreshSession } from '@/services/api/auth.service'
import { AuthSessionContext, type AuthSessionContextValue, type SessionStatus } from './auth-session-context'

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<SessionStatus>(API_INTEGRATION_ENABLED ? 'loading' : 'anonymous')
  const [error, setError] = useState<string | null>(null)
  const operationVersion = useRef(0)

  const loadCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      return await getCurrentUser()
    } catch (requestError) {
      if (!(axios.isAxiosError(requestError) && requestError.response?.status === 401)) throw requestError
      try {
        return (await refreshSession()).user
      } catch (refreshError) {
        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) return null
        throw refreshError
      }
    }
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    if (!API_INTEGRATION_ENABLED) return
    const operation = ++operationVersion.current
    setStatus('loading')
    setError(null)
    try {
      const currentUser = await loadCurrentUser()
      if (operation !== operationVersion.current) return
      setUser(currentUser)
      setStatus(currentUser ? 'authenticated' : 'anonymous')
    } catch (requestError) {
      if (operation !== operationVersion.current) return
      setUser(null)
      setStatus('unavailable')
      setError(getApiErrorMessage(requestError, 'Could not check your Owlio session.'))
    }
  }, [loadCurrentUser])

  useEffect(() => {
    if (!API_INTEGRATION_ENABLED) return
    const operation = ++operationVersion.current
    let active = true
    void loadCurrentUser()
      .then((currentUser) => {
        if (!active || operation !== operationVersion.current) return
        setUser(currentUser)
        setStatus(currentUser ? 'authenticated' : 'anonymous')
      })
      .catch((requestError: unknown) => {
        if (!active || operation !== operationVersion.current) return
        setUser(null)
        setStatus('unavailable')
        setError(getApiErrorMessage(requestError, 'Could not check your Owlio session.'))
      })
    return () => {
      active = false
    }
  }, [loadCurrentUser])

  const signIn = useCallback(async (credentials: LoginRequest) => {
    if (!API_INTEGRATION_ENABLED) {
      throw new Error('Sign-in is unavailable while the UI is in preview mode.')
    }
    const operation = ++operationVersion.current
    const session = await loginAccount(credentials)
    if (operation === operationVersion.current) {
      setUser(session.user)
      setStatus('authenticated')
      setError(null)
    }
    return session
  }, [])

  const signOut = useCallback(async () => {
    if (!API_INTEGRATION_ENABLED) {
      setUser(null)
      setStatus('anonymous')
      setError(null)
      return
    }
    const operation = ++operationVersion.current
    await logoutAccount()
    if (operation === operationVersion.current) {
      setUser(null)
      setStatus('anonymous')
      setError(null)
    }
  }, [])

  const value = useMemo<AuthSessionContextValue>(() => ({
    user,
    status,
    error,
    signIn,
    signOut,
    refreshCurrentUser,
  }), [user, status, error, signIn, signOut, refreshCurrentUser])

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
