import type { ReactNode } from "react"
import { Navigate } from "react-router"

type RequireOnboardingProps = {
  children: ReactNode
  needsOnboarding: boolean
}

export function RequireOnboarding({ children, needsOnboarding }: RequireOnboardingProps) {
  if (!needsOnboarding) return <Navigate to="/" replace />
  return children
}
