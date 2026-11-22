import { Navigate, useLocation } from "react-router"

const legacyAuthPaths: Record<string, string> = {
  "/auth/register": "/register",
  "/auth/login": "/login",
  "/auth/email-verification": "/email-verification",
  "/auth/forgot-password": "/forgot-password",
  "/auth/password-reset": "/password-reset",
}

export function AuthRouteRedirect() {
  const { pathname, search, hash } = useLocation()
  const legacyPath = pathname.replace(/\/+$/, "")
  const destination = legacyAuthPaths[legacyPath]

  return <Navigate to={destination ? `${destination}${search}${hash}` : "/"} replace />
}
