import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthLayout } from "../shared/auth-layout"
import { AuthPreviewControls } from "../shared/auth-preview-controls"
import { registerSchema, type RegisterValues } from "./register.schema"
import { RegisterForm } from "./register-form"

type RegisterState = "form" | "submitting" | "form-error" | "account-created"

const previewOptions: Array<{ value: RegisterState; label: string }> = [
  { value: "form", label: "Registration form" },
  { value: "submitting", label: "Submitting" },
  { value: "form-error", label: "Form error" },
  { value: "account-created", label: "Check-email screen" },
]

export function RegisterView() {
  const [state, setState] = useState<RegisterState>("form")
  const [requestNotice, setRequestNotice] = useState(false)
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", accountType: undefined, password: "", passwordConfirmation: "", acceptTerms: false },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [state])

  function preview(nextState: RegisterState) {
    setRequestNotice(false)
    if (nextState !== "form") {
      form.resetField("password", { defaultValue: "" })
      form.resetField("passwordConfirmation", { defaultValue: "" })
    }
    setState(nextState)
  }

  const heading = state === "account-created" ? "Check your email" : "Create your Owlio account"
  const description = state === "account-created"
    ? "A preview of the next step after registration."
    : "A learning space for students and educators starts here."

  return (
    <FormProvider {...form}>
      <AuthLayout title={heading} description={description} headingRef={headingRef}>
        {state === "form" && (
          <RegisterForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />
        )}
        {state === "submitting" && (
          <AuthFeedback title="Creating your account" preview>
            <span className="flex items-center gap-2"><Spinner aria-label="Preview loading" />Submitting state preview. No request is running.</span>
          </AuthFeedback>
        )}
        {state === "form-error" && (
          <div className="space-y-5">
            <AuthFeedback title="We couldn’t continue" tone="error" preview>
              This is a generic form-error preview. Your information was not submitted.
            </AuthFeedback>
            <Button type="button" variant="outline" onClick={() => preview("form")}>Return to registration</Button>
          </div>
        )}
        {state === "account-created" && (
          <div className="space-y-5">
            <AuthFeedback title="Account-created screen preview" tone="success" preview>
              No account was created and no email was sent. In the connected product, this step asks you to check your inbox.
            </AuthFeedback>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={() => preview("form")}>Back to registration</Button>
              <Button render={<Link to="/auth/email-verification" />} className="bg-indigo-600 text-white hover:bg-indigo-700">Open verification UI</Button>
            </div>
          </div>
        )}
        <AuthPreviewControls options={previewOptions} onSelect={preview} />
      </AuthLayout>
    </FormProvider>
  )
}
