import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthFormActions } from "../shared/auth-form-actions"
import { PasswordField } from "../shared/password-field"
import { PasswordGuidance } from "../shared/password-guidance"
import { AccountTypeSelector } from "./account-type-selector"
import type { RegisterValues } from "./register.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type RegisterFormProps = {
  requestNotice: boolean
  onSubmit: (values: RegisterValues) => void
}

export function RegisterForm({ requestNotice, onSubmit }: RegisterFormProps) {
  const form = useFormContext<RegisterValues>()
  const errors = form.formState.errors

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="gap-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name <span className="text-destructive">*</span></Label>
          <Input id="fullName" autoComplete="name" required aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined} {...form.register("fullName")} />
          <FieldError id="fullName-error" errors={[errors.fullName]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registerEmail">Email <span className="text-destructive">*</span></Label>
          <Input id="registerEmail" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "registerEmail-error" : undefined} {...form.register("email")} />
          <FieldError id="registerEmail-error" errors={[errors.email]} />
        </div>
        <AccountTypeSelector />
        <PasswordField id="registerPassword" label="Password" autoComplete="new-password" registration={form.register("password")} error={errors.password?.message} />
        <PasswordGuidance />
        <PasswordField id="passwordConfirmation" label="Confirm password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={errors.passwordConfirmation?.message} />
        <div className="space-y-2">
          <label htmlFor="acceptTerms" className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-slate-700">
            <input id="acceptTerms" type="checkbox" required className="mt-1 size-4 shrink-0 accent-indigo-600" aria-invalid={Boolean(errors.acceptTerms)} aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined} {...form.register("acceptTerms")} />
            <span>I agree to the Terms of Service and Privacy Policy <span className="text-destructive">*</span></span>
          </label>
          <FieldError id="acceptTerms-error" errors={[errors.acceptTerms]} />
        </div>
      </FieldGroup>
      {requestNotice && (
        <AuthFeedback title="Preview only — nothing was submitted">
          Authentication is not connected. Your information was not sent or saved.
        </AuthFeedback>
      )}
      <AuthFormActions label="Create account" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/auth/login" className="font-semibold text-indigo-700 underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
