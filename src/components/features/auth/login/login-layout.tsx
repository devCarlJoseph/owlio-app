import type { ReactNode, RefObject } from "react"
import { Link } from "react-router"
import { AuthSplitLayout } from "../shared/auth-split-layout"

type LoginLayoutProps = {
  headingRef: RefObject<HTMLHeadingElement | null>
  children: ReactNode
}

export function LoginLayout({ headingRef, children }: LoginLayoutProps) {
  return (
    <AuthSplitLayout
      context="login"
      title="Log in"
      headingRef={headingRef}
      footer={<>New to Owlio? <Link to="/auth/register" className="ml-1 font-semibold text-blue-700 underline-offset-4 hover:underline">Get Started</Link></>}
    >
      {children}
    </AuthSplitLayout>
  )
}
