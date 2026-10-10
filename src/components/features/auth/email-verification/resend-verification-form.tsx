import { useFormContext } from "react-hook-form"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthFormActions } from "../shared/auth-form-actions"
import type { ResendVerificationValues } from "./email-verification.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ResendVerificationFormProps = {
  requestNotice: boolean
  onSubmit: (values: ResendVerificationValues) => void
}

export function ResendVerificationForm({ requestNotice, onSubmit }: ResendVerificationFormProps) {
  const form = useFormContext<ResendVerificationValues>()
  const error = form.formState.errors.email

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-5">
        <div className="space-y-2">
          <Label htmlFor="verificationEmail">Email <span className="text-destructive">*</span></Label>
          <Input id="verificationEmail" type="email" autoComplete="email" required aria-invalid={Boolean(error)} aria-describedby={error ? "verificationEmail-error" : undefined} {...form.register("email")} />
          <FieldError id="verificationEmail-error" errors={[error]} />
        </div>
      </FieldGroup>
      {requestNotice && (
        <AuthFeedback title="Preview only — no message was sent">
          If an account can be verified for this email, a new verification message would be sent. This preview does not check whether the address has an account.
        </AuthFeedback>
      )}
      <AuthFormActions label="Resend verification email" />
    </form>
  )
}
