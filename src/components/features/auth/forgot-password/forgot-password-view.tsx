import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthSplitLayout } from "../shared/auth-split-layout"
import { ForgotPasswordForm } from "./forgot-password-form"
import { forgotPasswordSchema, type ForgotPasswordValues } from "./forgot-password.schema"

export function ForgotPasswordView() {
  const [requestNotice, setRequestNotice] = useState(false)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <FormProvider {...form}>
      <AuthSplitLayout
        title="Reset your password"
        description="Enter the email address associated with your Owlio account."
        headingRef={headingRef}
        footer={<>Remembered your password? <Link to="/auth/login" className="ml-1 font-semibold text-blue-700 underline-offset-4 hover:underline">Log in</Link></>}
      >
        <ForgotPasswordForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />
      </AuthSplitLayout>
    </FormProvider>
  )
}
