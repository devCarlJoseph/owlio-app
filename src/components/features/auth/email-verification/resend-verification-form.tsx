import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { ResendVerificationValues } from "./email-verification.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authInputClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"

type ResendVerificationFormProps = {
  onSubmit: (values: ResendVerificationValues) => void
}

export function ResendVerificationForm({ onSubmit }: ResendVerificationFormProps) {
  const form = useFormContext<ResendVerificationValues>()
  const error = form.formState.errors.email

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="verificationEmail" className="sr-only">Email</Label>
          <Input id="verificationEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(error)} aria-describedby={error ? "verificationEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
          <FieldError id="verificationEmail-error" errors={[error]} />
        </div>
      </FieldGroup>
      <Button type="submit" className={authPrimaryButtonClassName}>Resend verification email</Button>
    </form>
  )
}
