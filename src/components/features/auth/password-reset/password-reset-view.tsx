import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthSplitLayout } from "../shared/auth-split-layout"
import { PasswordResetForm } from "./password-reset-form"
import { passwordResetSchema, type PasswordResetValues } from "./password-reset.schema"

export function PasswordResetView() {
  const location = useLocation()
  const linkProvided = new URLSearchParams(location.search).has("token")
  const [requestNotice, setRequestNotice] = useState(false)
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
        title={linkProvided ? "Choose a new password" : "Reset link unavailable"}
        description={linkProvided ? "Set a new password for your Owlio account." : "Open the password-reset link from your email, or request a new one."}
        headingRef={headingRef}
        contentClassName="max-w-[400px]"
        footer={<>Remembered your password? <Link to="/auth/login" className="ml-1 font-semibold text-blue-700 underline-offset-4 hover:underline">Log in</Link></>}
      >
        {linkProvided ? (
          <PasswordResetForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />
        ) : (
          <div className="space-y-5">
            <AuthFeedback title="No reset link was provided">
              Open the password-reset link from your email, or request a new one. The link token is not read or displayed here.
            </AuthFeedback>
            <Button render={<Link to="/auth/forgot-password" />} className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">Request a new reset link</Button>
          </div>
        )}
      </AuthSplitLayout>
    </FormProvider>
  )
}
