import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthFormActions } from "../shared/auth-form-actions"
import { PasswordField } from "../shared/password-field"
import { PasswordGuidance } from "../shared/password-guidance"
import type { PasswordResetValues } from "./password-reset.schema"

type PasswordResetFormProps = {
  requestNotice: boolean
  onSubmit: (values: PasswordResetValues) => void
}

export function PasswordResetForm({ requestNotice, onSubmit }: PasswordResetFormProps) {
  const form = useFormContext<PasswordResetValues>()
  const error = form.formState.errors.passwordConfirmation?.message

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <PasswordField id="resetPassword" label="New password" autoComplete="new-password" registration={form.register("password")} error={form.formState.errors.password?.message} />
      <PasswordGuidance />
      <PasswordField id="resetPasswordConfirmation" label="Confirm new password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={error} />
      {requestNotice && (
        <AuthFeedback title="Preview only — no password was changed">
          This page is not connected to a reset service. Your new password was not sent or saved.
        </AuthFeedback>
      )}
      <AuthFormActions label="Set new password" />
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/auth/login" className="font-semibold text-indigo-700 underline-offset-4 hover:underline">Return to sign in</Link>
      </p>
    </form>
  )
}
