import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthLayout } from "../shared/auth-layout"
import { AuthPreviewControls } from "../shared/auth-preview-controls"
import { AuthStatusPanel } from "../shared/auth-status-page"
import { ForgotPasswordForm } from "./forgot-password-form"
import { forgotPasswordSchema, type ForgotPasswordValues } from "./forgot-password.schema"

type ForgotState = "form" | "submitting" | "confirmation" | "error"

const previewOptions: Array<{ value: ForgotState; label: string }> = [
  { value: "form", label: "Request form" },
  { value: "submitting", label: "Submitting" },
  { value: "confirmation", label: "Check-email confirmation" },
  { value: "error", label: "Retryable error" },
]

export function ForgotPasswordView() {
  const [state, setState] = useState<ForgotState>("form")
  const [requestNotice, setRequestNotice] = useState(false)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [state])

  function preview(nextState: ForgotState) {
    setRequestNotice(false)
    setState(nextState)
  }

  const title = state === "confirmation" ? "Check your email" : "Reset your password"
  const description = state === "form" ? "Enter the email address associated with your Owlio account." : "UI-only preview. No reset request or email is sent."

  return (
    <FormProvider {...form}>
      <AuthLayout title={title} description={description} headingRef={headingRef}>
        {state === "form" && <ForgotPasswordForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />}
        {state === "submitting" && (
          <AuthFeedback title="Requesting reset instructions" preview>
            <span className="flex items-center gap-2"><Spinner aria-label="Preview loading" />Submitting state preview. No request is running.</span>
          </AuthFeedback>
        )}
        {state === "confirmation" && (
          <AuthStatusPanel
            statusTitle="Check your inbox"
            status={<>If an account can be verified for this email, reset instructions would be sent. This preview does not check whether an account exists and no email was sent.</>}
            actionLabel="Return to sign in"
            actionTo="/auth/login"
          />
        )}
        {state === "error" && (
          <div className="space-y-5">
            <AuthFeedback title="We couldn’t process this request" tone="error" preview>
              This generic retryable-error preview does not contact an authentication service.
            </AuthFeedback>
            <Button type="button" variant="outline" onClick={() => preview("form")}>Try again</Button>
          </div>
        )}
        <AuthPreviewControls options={previewOptions} onSelect={preview} />
      </AuthLayout>
    </FormProvider>
  )
}
