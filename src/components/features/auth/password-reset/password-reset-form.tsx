import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
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
      <PasswordField id="resetPassword" label="New password" autoComplete="new-password" registration={form.register("password")} error={form.formState.errors.password?.message} />
      <PasswordGuidance />
      <PasswordField id="resetPasswordConfirmation" label="Confirm new password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={error} />
      <Button type="submit" className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">Set new password</Button>
    </form>
  )
}
