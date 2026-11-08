import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import api from '@/lib/axios'
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
  const changingSession = useRef(false)
  const pendingSession = useRef<Promise<AuthUser | null> | null>(null)
  const { pathname } = useLocation()

  const loadCurrentUser = useCallback((): Promise<AuthUser | null> => {
    if (!pendingSession.current) {
      const request = (async () => {
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
      })()
      const trackedRequest = request.finally(() => {
        if (pendingSession.current === trackedRequest) pendingSession.current = null
      })
      pendingSession.current = trackedRequest
    }
    return pendingSession.current
  }, [])

  const checkCurrentUser = useCallback(async (background = false) => {
    if (!API_INTEGRATION_ENABLED || changingSession.current) return
    const operation = ++operationVersion.current
    setStatus((current) => background && current === 'authenticated' ? current : 'loading')
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

  const refreshCurrentUser = useCallback(() => checkCurrentUser(), [checkCurrentUser])

  const invalidatePendingChecks = useCallback(() => { ++operationVersion.current }, [])

  useEffect(() => {
    void refreshCurrentUser()
    return invalidatePendingChecks
  }, [refreshCurrentUser, invalidatePendingChecks])

  useEffect(() => {
    if (!API_INTEGRATION_ENABLED) return
    const recheck = () => { void checkCurrentUser(true) }
    const onVisible = () => { if (document.visibilityState === 'visible') recheck() }
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void refreshCurrentUser() }
    window.addEventListener('focus', recheck)
    window.addEventListener('pageshow', onPageShow)
    document.addEventListener('visibilitychange', onVisible)
    const interceptor = api.interceptors.response.use(undefined, (requestError: unknown) => {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401 &&
          !requestError.config?.url?.startsWith('/api/v1/auth/')) void refreshCurrentUser()
      return Promise.reject(requestError)
    })
    return () => {
      window.removeEventListener('focus', recheck)
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('visibilitychange', onVisible)
      api.interceptors.response.eject(interceptor)
    }
  }, [refreshCurrentUser, checkCurrentUser])

  useEffect(() => {
    if (/^\/(students|educators|tutors|esl)(\/|$)/.test(pathname)) {
      void checkCurrentUser(true)
    }
  }, [pathname, checkCurrentUser])

  const signIn = useCallback(async (credentials: LoginRequest) => {
    if (!API_INTEGRATION_ENABLED) throw new Error('Sign-in is unavailable while the UI is in preview mode.')
    const operation = ++operationVersion.current
    changingSession.current = true
    pendingSession.current = null
    try {
      const session = await loginAccount(credentials)
      if (operation === operationVersion.current) {
        setUser(session.user)
        setStatus('authenticated')
        setError(null)
      }
      return session
    } finally {
      changingSession.current = false
    }
  }, [])

  const signOut = useCallback(async () => {
    const operation = ++operationVersion.current
    changingSession.current = true
    pendingSession.current = null
    try {
      if (API_INTEGRATION_ENABLED) await logoutAccount()
      if (operation === operationVersion.current) {
        setUser(null)
        setStatus('anonymous')
        setError(null)
      }
    } finally {
      changingSession.current = false
    }
  }, [])

  const value = useMemo<AuthSessionContextValue>(() => ({
    user, status, error, signIn, signOut, refreshCurrentUser,
  }), [user, status, error, signIn, signOut, refreshCurrentUser])

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
