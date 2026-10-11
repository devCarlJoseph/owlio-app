import { useEffect, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthSplitLayout } from "../shared/auth-split-layout"
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
      <AuthSplitLayout
        context="password-reset"
        title="Choose a new password"
        description={linkProvided ? "Set a new password for your Owlio account." : "Request a password-reset link to continue."}
        headingRef={headingRef}
        footer={<>Remembered your password? <Link to="/auth/login" className="ml-1 font-semibold text-blue-700 underline-offset-4 hover:underline">Log in</Link></>}
      >
        {linkProvided ? (
          <PasswordResetForm onSubmit={() => undefined} />
        ) : (
          <Button render={<Link to="/auth/forgot-password" />} className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">Request a new reset link</Button>
        )}
      </AuthSplitLayout>
    </FormProvider>
  )
}
