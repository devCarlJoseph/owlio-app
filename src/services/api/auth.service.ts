import axios from 'axios'
import api from '@/lib/axios'
import type {
  ApiSuccess,
  AuthMessage,
  AuthSession,
  AuthUser,
  GoogleLinkStatus,
  GoogleStartRequest,
  GoogleStartResponse,
  LoginRequest,
  RegisterRequest,
} from './api.types'

const authPath = '/api/v1/auth'
type CsrfResponse = { csrfToken: string }
type RegisterResponse = AuthMessage
type CsrfErrorResponse = { code?: string }

let csrfToken: string | undefined
let csrfRequest: Promise<string> | undefined

function rememberCsrfToken(data: unknown) {
  if (typeof data === 'object' && data !== null && 'csrfToken' in data && typeof data.csrfToken === 'string') {
    csrfToken = data.csrfToken
  }
}

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) {
    csrfToken = undefined
    csrfRequest = undefined
  }
  if (csrfToken) return csrfToken
  if (!csrfRequest) {
    const request: Promise<string> = api.get<ApiSuccess<CsrfResponse>>(`${authPath}/csrf`)
      .then(({ data }) => {
        if (typeof data?.data?.csrfToken !== 'string' || !data.data.csrfToken) {
          throw new Error('The API did not return a CSRF token.')
        }
        if (csrfRequest === request) csrfToken = data.data.csrfToken
        return data.data.csrfToken
      })
      .finally(() => {
        if (csrfRequest === request) csrfRequest = undefined
      })
    csrfRequest = request
  }
  return csrfRequest
}

export async function postApiWithCsrf<T>(path: string, body?: unknown): Promise<T> {
  return mutateApiWithCsrf<T>('POST', path, body)
}

export async function mutateApiWithCsrf<T>(method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const send = (token: string) => {
    const config = { headers: { 'x-csrf-token': token } }
    if (method === 'POST') return api.post<ApiSuccess<T>>(path, body, config)
    if (method === 'PATCH') return api.patch<ApiSuccess<T>>(path, body, config)
    return api.delete<ApiSuccess<T>>(path, { ...config, data: body })
  }

  let response
  try {
    response = await send(await getCsrfToken())
  } catch (error) {
    if (!axios.isAxiosError<CsrfErrorResponse>(error) || error.response?.status !== 403 || error.response.data?.code !== 'INVALID_CSRF') {
      throw error
    }
    response = await send(await getCsrfToken(true))
  }

  rememberCsrfToken(response.data.data)
  return response.data.data
}

async function postAuth<T>(path: string, body?: unknown): Promise<T> {
  return postApiWithCsrf<T>(`${authPath}${path}`, body)
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

export function verifyEmailCode(email: string, code: string) {
  return postAuth<AuthMessage>('/verify-email', { email, code })
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

export function startGoogleOAuth(input: GoogleStartRequest) {
  return postAuth<GoogleStartResponse>('/google/start', input)
}

export function getGoogleLinkStatus() {
  return api.get<ApiSuccess<GoogleLinkStatus>>(`${authPath}/google/link-status`).then(({ data }) => data.data)
}

export function startGoogleLink() {
  return postAuth<GoogleStartResponse>('/google/link/start', {})
}
