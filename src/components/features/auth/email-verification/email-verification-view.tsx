import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthSplitLayout } from "../shared/auth-split-layout"
import { ResendVerificationForm } from "./resend-verification-form"
import { resendVerificationSchema, type ResendVerificationValues } from "./email-verification.schema"

export function EmailVerificationView() {
  const location = useLocation()
  const linkProvided = new URLSearchParams(location.search).has("token")
  const [isResending, setIsResending] = useState(false)
  const [requestNotice, setRequestNotice] = useState(false)
  const form = useForm<ResendVerificationValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [isResending])

  function openResendForm() {
    setRequestNotice(false)
    setIsResending(true)
  }

  function returnToVerificationNotice() {
    setRequestNotice(false)
    setIsResending(false)
  }

  return (
    <FormProvider {...form}>
      <AuthSplitLayout
        title={isResending ? "Resend verification email" : "Verify your email"}
        description={isResending
          ? "Enter the email address associated with your Owlio account."
          : linkProvided
            ? "A verification link was provided. This page cannot confirm it yet."
            : "Open the verification link sent to your email, or request a new one."}
        headingRef={headingRef}
        contentClassName="max-w-[400px]"
        footer={<>Already have an account? <Link to="/auth/login" className="ml-1 font-semibold text-blue-700 underline-offset-4 hover:underline">Log in</Link></>}
      >
        {isResending ? (
          <div className="space-y-3">
            <ResendVerificationForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />
            <Button type="button" variant="ghost" onClick={returnToVerificationNotice} className="w-full text-xs text-slate-600">Back</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <AuthFeedback title={linkProvided ? "Verification link received" : "Verification link not found"}>
              {linkProvided
                ? "This page cannot validate the link or change account status. The token is not read or displayed."
                : "If you already requested a link, check your inbox. Otherwise, request a new verification email."}
            </AuthFeedback>
            <Button type="button" onClick={openResendForm} className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">
              {linkProvided ? "Request another verification email" : "Resend verification email"}
            </Button>
          </div>
        )}
      </AuthSplitLayout>
    </FormProvider>
  )
}
