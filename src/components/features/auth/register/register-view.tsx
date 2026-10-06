import { Link } from "react-router"

import { AuthLayout } from "@/components/features/auth/shared/auth-layout"
import { RegisterForm } from "./register-form"

export function RegisterView() {
  return (
    <AuthLayout
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline" to="/auth/login">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
