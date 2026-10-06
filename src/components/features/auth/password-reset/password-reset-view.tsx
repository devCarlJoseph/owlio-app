import { Link } from "react-router"

import { AuthLayout } from "@/components/features/auth/shared/auth-layout"
import { PasswordResetForm } from "./password-reset-form"

export function PasswordResetView() {
  return (
    <AuthLayout
      footer={
        <>
          Remembered your password?{" "}
          <Link className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline" to="/auth/login">
            Sign in
          </Link>
        </>
      }
    >
      <PasswordResetForm />
    </AuthLayout>
  )
}
