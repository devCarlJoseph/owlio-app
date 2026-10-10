import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthLayout } from "../shared/auth-layout"
import { AuthPreviewControls } from "../shared/auth-preview-controls"
import { SessionExpiredState } from "../shared/session-expired-state"
import { LoginForm } from "./login-form"
import { loginSchema, type LoginValues } from "./login.schema"

type LoginState = "form" | "submitting" | "invalid" | "unverified" | "unavailable" | "destination" | "session-expired"

const previewOptions: Array<{ value: LoginState; label: string }> = [
  { value: "form", label: "Sign-in form" },
  { value: "submitting", label: "Submitting" },
  { value: "invalid", label: "Invalid credentials" },
  { value: "unverified", label: "Unverified-email guidance" },
  { value: "unavailable", label: "Unavailable service" },
  { value: "destination", label: "Future destination" },
  { value: "session-expired", label: "Session expired" },
]

export function LoginView() {
  const [state, setState] = useState<LoginState>("form")
  const [requestNotice, setRequestNotice] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [state])

  function preview(nextState: LoginState) {
    setRequestNotice(false)
    if (nextState !== "form") form.resetField("password", { defaultValue: "" })
    setState(nextState)
  }

  const pageTitle = state === "session-expired" ? "Session expired" : state === "destination" ? "Sign-in destination preview" : "Welcome back"
  const pageDescription = state === "form" ? "Sign in to continue to your Owlio learning space." : "UI-only preview. No sign-in request or session is created."

  return (
    <FormProvider {...form}>
      <AuthLayout title={pageTitle} description={pageDescription} headingRef={headingRef}>
        {state === "form" && <LoginForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />}
        {state === "submitting" && (
          <AuthFeedback title="Signing in" preview>
            <span className="flex items-center gap-2"><Spinner aria-label="Preview loading" />Submitting state preview. No request is running.</span>
          </AuthFeedback>
        )}
        {state === "invalid" && (
          <div className="space-y-4">
            <AuthFeedback title="Email or password not recognized" tone="error" preview>
              Check your sign-in details and try again. This generic error does not identify which detail was incorrect.
            </AuthFeedback>
            <Button type="button" variant="outline" onClick={() => preview("form")}>Return to sign in</Button>
          </div>
        )}
        {state === "unverified" && (
          <div className="space-y-4">
            <AuthFeedback title="Email confirmation may be needed" preview>
              If your email still needs confirmation, follow the message in your inbox or open the verification page. This preview does not check account status.
            </AuthFeedback>
            <Button render={<Link to="/auth/email-verification" />} className="bg-indigo-600 text-white hover:bg-indigo-700">Open verification UI</Button>
          </div>
        )}
        {state === "unavailable" && (
          <div className="space-y-4">
            <AuthFeedback title="Sign-in is temporarily unavailable" tone="error" preview>
              This generic service-error preview does not contact an authentication service.
            </AuthFeedback>
            <Button type="button" variant="outline" onClick={() => preview("form")}>Try again</Button>
          </div>
        )}
        {state === "destination" && (
          <AuthFeedback title="Future authenticated destination" preview>
            A connected sign-in flow will continue to an account destination. This preview did not sign you in or create a session.
          </AuthFeedback>
        )}
        {state === "session-expired" && <SessionExpiredState onReturn={() => preview("form")} />}
        <AuthPreviewControls options={previewOptions} onSelect={preview} />
      </AuthLayout>
    </FormProvider>
  )
}
