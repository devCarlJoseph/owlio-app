import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthLayout } from "../shared/auth-layout"
import { AuthPreviewControls } from "../shared/auth-preview-controls"
import { AuthStatusPanel } from "../shared/auth-status-page"
import { ResendVerificationForm } from "./resend-verification-form"
import { resendVerificationSchema, type ResendVerificationValues } from "./email-verification.schema"

type VerificationState = "link-provided" | "processing" | "verified" | "invalid" | "missing-link" | "resend" | "resend-confirmation" | "resend-error"

const previewOptions: Array<{ value: VerificationState; label: string }> = [
  { value: "link-provided", label: "Verification screen" },
  { value: "processing", label: "Processing" },
  { value: "verified", label: "Verified" },
  { value: "invalid", label: "Invalid or expired link" },
  { value: "missing-link", label: "Missing link" },
  { value: "resend", label: "Resend form" },
  { value: "resend-confirmation", label: "Resend confirmation" },
  { value: "resend-error", label: "Resend error" },
]

export function EmailVerificationView() {
  const location = useLocation()
  const linkProvided = new URLSearchParams(location.search).has("token")
  const [state, setState] = useState<VerificationState>(linkProvided ? "link-provided" : "missing-link")
  const [requestNotice, setRequestNotice] = useState(false)
  const form = useForm<ResendVerificationValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [state])

  function preview(nextState: VerificationState) {
    setRequestNotice(false)
    setState(nextState)
  }

  const title = state === "verified" ? "Email verified" : state === "resend-confirmation" ? "Check your inbox" : state === "resend" ? "Resend verification email" : "Verify your email"
  const description = state === "link-provided"
    ? "A verification link was provided. This UI-only page cannot validate it."
    : state === "resend" ? "Enter your email to preview the resend form." : "View email-verification states or request a new verification message."

  return (
    <FormProvider {...form}>
      <AuthLayout title={title} description={description} headingRef={headingRef}>
        {state === "link-provided" && (
          <div className="space-y-5">
            <AuthFeedback title="Verification link received" preview>
              This screen cannot confirm the link or change account status. The token value is not read or displayed.
            </AuthFeedback>
            <Button type="button" variant="outline" onClick={() => preview("resend")}>Request another verification email</Button>
          </div>
        )}
        {state === "processing" && (
          <AuthFeedback title="Checking your email link" preview>
            <span className="flex items-center gap-2"><Spinner aria-label="Preview loading" />Processing-state preview. No link was checked.</span>
          </AuthFeedback>
        )}
        {state === "verified" && (
          <AuthStatusPanel
            statusTitle="Email-verified confirmation preview"
            status={<>The link was not validated and account status was not changed.</>}
            actionLabel="Continue to sign in"
            actionTo="/auth/login"
          />
        )}
        {state === "invalid" && (
          <div className="space-y-5">
            <AuthFeedback title="This verification link may be invalid or expired" tone="error" preview>
              This is a status preview only. Request a fresh link to continue; no account status was checked.
            </AuthFeedback>
            <Button type="button" variant="outline" onClick={() => preview("resend")}>Request a new link</Button>
          </div>
        )}
        {state === "missing-link" && (
          <div className="space-y-5">
            <AuthFeedback title="Verification link not found" tone="error" preview={false}>
              Open the verification link from your email, or request another one below.
            </AuthFeedback>
            <Button type="button" variant="outline" onClick={() => preview("resend")}>Resend verification email</Button>
          </div>
        )}
        {state === "resend" && (
          <ResendVerificationForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />
        )}
        {state === "resend-confirmation" && (
          <AuthStatusPanel
            statusTitle="Check your inbox"
            status={<>If an account can be verified for this address, a new message would be sent. This preview does not check account existence and no email was sent.</>}
            actionLabel="Back to sign in"
            actionTo="/auth/login"
          />
        )}
        {state === "resend-error" && (
          <div className="space-y-5">
            <AuthFeedback title="We couldn’t process the request" tone="error" preview>
              This generic retryable-error preview does not contact a service.
            </AuthFeedback>
            <Button type="button" variant="outline" onClick={() => preview("resend")}>Try again</Button>
          </div>
        )}
        <AuthPreviewControls options={previewOptions} onSelect={preview} />
      </AuthLayout>
    </FormProvider>
  )
}
