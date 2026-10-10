import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthFormActions } from "../shared/auth-form-actions"
import type { ForgotPasswordValues } from "./forgot-password.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ForgotPasswordFormProps = {
  requestNotice: boolean
  onSubmit: (values: ForgotPasswordValues) => void
}

export function ForgotPasswordForm({ requestNotice, onSubmit }: ForgotPasswordFormProps) {
  const form = useFormContext<ForgotPasswordValues>()
  const error = form.formState.errors.email

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="gap-5">
        <div className="space-y-2">
          <Label htmlFor="forgotEmail">Email <span className="text-destructive">*</span></Label>
          <Input id="forgotEmail" type="email" autoComplete="email" required aria-invalid={Boolean(error)} aria-describedby={error ? "forgotEmail-error" : undefined} {...form.register("email")} />
          <FieldError id="forgotEmail-error" errors={[error]} />
        </div>
      </FieldGroup>
      {requestNotice && (
        <AuthFeedback title="Preview only — no request was sent">
          This UI does not send email or save your address.
        </AuthFeedback>
      )}
      <AuthFormActions label="Send reset instructions" />
      <p className="text-center text-sm text-muted-foreground">
        Remembered your password? <Link to="/auth/login" className="font-semibold text-indigo-700 underline-offset-4 hover:underline">Back to sign in</Link>
      </p>
    </form>
  )
}
