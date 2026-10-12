import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { ForgotPasswordValues } from "./forgot-password.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authInputClassName, authLinkClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"

type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordValues) => void
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const form = useFormContext<ForgotPasswordValues>()
  const error = form.formState.errors.email

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="forgotEmail" className="sr-only">Email</Label>
          <Input id="forgotEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(error)} aria-describedby={error ? "forgotEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
          <FieldError id="forgotEmail-error" errors={[error]} />
        </div>
      </FieldGroup>
      <Button type="submit" className={authPrimaryButtonClassName}>Send reset instructions</Button>
      <p className="text-center text-sm text-slate-500">
        Remembered your password? <Link to="/login" className={authLinkClassName}>Log in</Link>
      </p>
    </form>
  )
}
