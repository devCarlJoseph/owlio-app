import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { authPrimaryButtonClassName } from "../shared/auth-input-styles"
import { PasswordField } from "../shared/password-field"
import { PasswordGuidance } from "../shared/password-guidance"
import type { PasswordResetValues } from "./password-reset.schema"

type PasswordResetFormProps = {
  onSubmit: (values: PasswordResetValues) => void
}

export function PasswordResetForm({ onSubmit }: PasswordResetFormProps) {
  const form = useFormContext<PasswordResetValues>()
  const error = form.formState.errors.passwordConfirmation?.message

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <PasswordField id="resetPassword" label="New password" placeholder="Create a new password" autoComplete="new-password" registration={form.register("password")} error={form.formState.errors.password?.message} />
      <PasswordGuidance />
      <PasswordField id="resetPasswordConfirmation" label="Confirm new password" placeholder="Confirm your new password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={error} />
      <Button type="submit" disabled={form.formState.isSubmitting} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Updating…' : 'Set new password'}</Button>
    </form>
  )
}
