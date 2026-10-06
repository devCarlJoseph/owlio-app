import api from "@/lib/axios"
import type { ApiSuccess, AuthMessage, AuthSession, AuthUser } from "@/services/api/api.types"

const AUTH_PATH = "/api/auth"

type CsrfResponse = ApiSuccess<{ csrfToken: string }>

async function postWithCsrf<T>(path: string, body?: unknown): Promise<T> {
  const csrfResponse = await api.get<CsrfResponse>(`${AUTH_PATH}/csrf`)
  const response = await api.post<ApiSuccess<T>>(`${AUTH_PATH}${path}`, body, {
    headers: { "x-csrf-token": csrfResponse.data.data.csrfToken },
  })
  return response.data.data
}

export type RegisterRequest = {
  name: string
  email: string
  accountType: "student" | "educator"
  password: string
  confirmPassword: string
  termsAccepted: true
}

export type LoginRequest = {
  email: string
  password: string
  rememberMe?: boolean
}

export type ResetPasswordRequest = {
  token: string
  password: string
  confirmPassword: string
}

export async function registerAccount(input: RegisterRequest): Promise<AuthMessage> {
  return postWithCsrf<AuthMessage>("/register", input)
}

export async function login(input: LoginRequest): Promise<AuthSession> {
  return postWithCsrf<AuthSession>("/login", input)
}

export async function refreshSession(): Promise<AuthSession> {
  return postWithCsrf<AuthSession>("/refresh")
}

export async function logout(): Promise<void> {
  const csrfResponse = await api.get<CsrfResponse>(`${AUTH_PATH}/csrf`)
  await api.post(`${AUTH_PATH}/logout`, undefined, {
    headers: { "x-csrf-token": csrfResponse.data.data.csrfToken },
  })
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<ApiSuccess<{ user: AuthUser }>>(`${AUTH_PATH}/me`)
  return response.data.data.user
}

export async function verifyEmail(token: string): Promise<AuthMessage> {
  return postWithCsrf<AuthMessage>("/verify-email", { token })
}

export async function resendVerification(email: string): Promise<AuthMessage> {
  return postWithCsrf<AuthMessage>("/resend-verification", { email })
}

export async function requestPasswordReset(email: string): Promise<AuthMessage> {
  return postWithCsrf<AuthMessage>("/forgot-password", { email })
}

export async function resetPassword(input: ResetPasswordRequest): Promise<AuthMessage> {
  return postWithCsrf<AuthMessage>("/reset-password", input)
}
