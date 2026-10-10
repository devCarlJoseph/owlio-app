import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthLayout } from "../shared/auth-layout"
import { AuthPreviewControls } from "../shared/auth-preview-controls"
import { AuthStatusPanel } from "../shared/auth-status-page"
import { PasswordResetForm } from "./password-reset-form"
import { passwordResetSchema, type PasswordResetValues } from "./password-reset.schema"

type ResetState = "form" | "submitting" | "invalid" | "completed"

const previewOptions: Array<{ value: ResetState; label: string }> = [
  { value: "form", label: "Set-password form" },
  { value: "submitting", label: "Submitting" },
  { value: "invalid", label: "Expired-link error" },
  { value: "completed", label: "Reset confirmation" },
]

export function PasswordResetView() {
  const location = useLocation()
  const linkProvided = new URLSearchParams(location.search).has("token")
  const [state, setState] = useState<ResetState>(linkProvided ? "form" : "invalid")
  const [requestNotice, setRequestNotice] = useState(false)
  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [state])

  function preview(nextState: ResetState) {
    setRequestNotice(false)
    if (nextState !== "form") {
      form.resetField("password", { defaultValue: "" })
      form.resetField("passwordConfirmation", { defaultValue: "" })
    }
    setState(nextState)
  }

  const title = state === "completed" ? "Password reset confirmation" : state === "invalid" ? "Reset link unavailable" : "Choose a new password"
  const description = state === "form"
    ? "Choose a new password for your Owlio account."
    : "UI-only preview. This page cannot validate a link or change a password."

  return (
    <FormProvider {...form}>
      <AuthLayout title={title} description={description} headingRef={headingRef}>
        {state === "form" && (
          <div className="space-y-5">
            <AuthFeedback title="Reset-link form preview" preview>
              The link is not validated here. No password or token is sent or saved.
            </AuthFeedback>
            <PasswordResetForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />
          </div>
        )}
        {state === "submitting" && (
          <AuthFeedback title="Setting your new password" preview>
            <span className="flex items-center gap-2"><Spinner aria-label="Preview loading" />Submitting state preview. No request is running.</span>
          </AuthFeedback>
        )}
        {state === "invalid" && (
          <div className="space-y-5">
            <AuthFeedback title={linkProvided ? "This reset link may be invalid or expired" : "No reset link was provided"} tone="error" preview={linkProvided}>
              {linkProvided
                ? "This is an invalid-or-expired-link preview. The UI cannot check the link or its token."
                : "Open a password-reset link from your email, or request a new one. This screen does not read or display token values."}
            </AuthFeedback>
            <Button render={<Link to="/auth/forgot-password" />} className="w-full bg-indigo-600 text-white hover:bg-indigo-700">Request a new reset link</Button>
          </div>
        )}
        {state === "completed" && (
          <AuthStatusPanel
            statusTitle="Password-reset confirmation preview"
            status={<>No password was changed. In the connected product, this confirmation follows a successful reset.</>}
            actionLabel="Continue to sign in"
            actionTo="/auth/login"
          />
        )}
        <AuthPreviewControls options={previewOptions} onSelect={preview} />
      </AuthLayout>
    </FormProvider>
  )
}
