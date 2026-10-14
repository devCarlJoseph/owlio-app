import axios from 'axios'
import api from '@/lib/axios'
import type {
  ApiSuccess,
  AuthMessage,
  AuthSession,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from './api.types'

const authPath = '/api/v1/auth'
type CsrfResponse = { csrfToken: string }
type RegisterResponse = AuthMessage & { user: AuthUser }
type CsrfErrorResponse = { code?: string }

let csrfToken: string | undefined
let csrfRequest: Promise<string> | undefined

function rememberCsrfToken(data: unknown) {
  if (typeof data === 'object' && data !== null && 'csrfToken' in data && typeof data.csrfToken === 'string') {
    csrfToken = data.csrfToken
  }
}

async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) {
    csrfToken = undefined
    csrfRequest = undefined
  }
  if (csrfToken) return csrfToken
  if (!csrfRequest) {
    csrfRequest = api.get<ApiSuccess<CsrfResponse>>(`${authPath}/csrf`)
      .then(({ data }) => {
        csrfToken = data.data.csrfToken
        return csrfToken
      })
      .finally(() => {
        csrfRequest = undefined
      })
  }
  return csrfRequest
}

async function postAuth<T>(path: string, body?: unknown): Promise<T> {
  const send = (token: string) => api.post<ApiSuccess<T>>(`${authPath}${path}`, body, {
    headers: { 'x-csrf-token': token },
  })

  let response
  try {
    response = await send(await getCsrfToken())
  } catch (error) {
    if (!axios.isAxiosError<CsrfErrorResponse>(error) || error.response?.data.code !== 'EBADCSRFTOKEN') {
      throw error
    }
    response = await send(await getCsrfToken(true))
  }

  rememberCsrfToken(response.data.data)
  return response.data.data
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<ApiSuccess<AuthUser>>(`${authPath}/me`)
  return data.data
}

export function registerAccount(input: RegisterRequest) {
  return postAuth<RegisterResponse>('/register', input)
}

export function loginAccount(input: LoginRequest) {
  return postAuth<AuthSession>('/login', input)
}

export function refreshSession() {
  return postAuth<AuthSession>('/refresh')
}

export function logoutAccount() {
  return postAuth<AuthMessage>('/logout')
}

export function verifyEmail(token: string) {
  return postAuth<AuthMessage>('/verify-email', { token })
}

export function resendVerification(email: string) {
  return postAuth<AuthMessage>('/resend-verification', { email })
}

export function requestPasswordReset(email: string) {
  return postAuth<AuthMessage>('/forgot-password', { email })
}

export function resetPassword(token: string, password: string, confirmPassword: string) {
  return postAuth<AuthMessage>('/reset-password', { token, password, confirmPassword })
}
