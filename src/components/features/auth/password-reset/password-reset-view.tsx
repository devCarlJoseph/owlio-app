import { useEffect, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthShowcaseLayout } from "../shared/auth-showcase-layout"
import { authLinkClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"
import { PasswordResetForm } from "./password-reset-form"
import { passwordResetSchema, type PasswordResetValues } from "./password-reset.schema"

export function PasswordResetView() {
  const location = useLocation()
  const linkProvided = new URLSearchParams(location.search).has("token")
  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout>
        <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">Choose a new password</h1>
        <p className="mt-1.5 text-sm text-slate-500">{linkProvided ? "Set a new password for your Owlio account." : "Request a password-reset link to continue."}</p>
        <div className="mt-7 space-y-5">
          {linkProvided ? (
            <PasswordResetForm onSubmit={() => undefined} />
          ) : (
            <Button render={<Link to="/forgot-password" />} className={authPrimaryButtonClassName}>Request a new reset link</Button>
          )}
          <p className="text-center text-sm text-slate-500">
            Remembered your password? <Link to="/login" className={authLinkClassName}>Log in</Link>
          </p>
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
