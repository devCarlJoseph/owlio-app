export type ApiSuccess<T> = {
  status: "success"
  data: T
}

export type ApiHealth = {
  status: "success"
  message: string
  timestamp: string
}

export type AuthUser = {
  id: number
  email: string
  name: string | null
  status: string
  roles: string[]
}

export type AuthMessage = {
  message: string
  email?: string
  developmentActionUrl?: string
}

export type AuthSession = {
  user: AuthUser
}
