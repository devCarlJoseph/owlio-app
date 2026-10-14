export type ApiSuccess<T> = {
  status: "success"
  data: T
}

export type ApiHealth = {
  status: "success"
  message: string
  timestamp: string
}

export type AuthRole = "STUDENT" | "EDUCATOR"

export type AuthUser = {
  id: string
  email: string
  name: string
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED"
  emailVerifiedAt: string | null
  roles: AuthRole[]
  createdAt: string
}

export type AuthMessage = {
  message: string
  developmentActionUrl?: string
  csrfToken?: string
}

export type AuthSession = {
  user: AuthUser
  csrfToken: string
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
  rememberMe: boolean
}
