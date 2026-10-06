import { Link } from "react-router"

import { AuthLayout } from "@/components/features/auth/shared/auth-layout"
import { LoginForm } from "./login-form"

export function LoginView() {
  return (
    <AuthLayout
      footer={
        <>
          Don’t have an account?{" "}
          <Link className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline" to="/auth/register">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
