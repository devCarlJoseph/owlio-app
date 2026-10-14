import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { AuthPasswordInput } from "../shared/auth-password-input"
import { authInputClassName, authLinkClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"
import { PasswordGuidance } from "../shared/password-guidance"
import { AccountTypeSelector } from "./account-type-selector"
import type { RegisterValues } from "./register.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type RegisterFormProps = {
  onSubmit: (values: RegisterValues) => void
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const form = useFormContext<RegisterValues>()
  const errors = form.formState.errors

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="sr-only">Full name</Label>
          <Input id="fullName" autoComplete="name" placeholder="Enter your full name" required aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined} className={authInputClassName} {...form.register("fullName")} />
          <FieldError id="fullName-error" errors={[errors.fullName]} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="registerEmail" className="sr-only">Email</Label>
          <Input id="registerEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "registerEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
          <FieldError id="registerEmail-error" errors={[errors.email]} />
        </div>
        <AccountTypeSelector />
        <div className="space-y-1.5">
          <AuthPasswordInput id="registerPassword" label="Password" placeholder="Create a password" autoComplete="new-password" registration={form.register("password")} error={errors.password?.message} />
          <PasswordGuidance />
        </div>
        <AuthPasswordInput id="passwordConfirmation" label="Confirm password" placeholder="Confirm your password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={errors.passwordConfirmation?.message} />
        <div className="space-y-1.5">
          <label htmlFor="acceptTerms" className="flex cursor-pointer items-start gap-2 text-sm leading-5 text-slate-600">
            <input id="acceptTerms" type="checkbox" required className="mt-0.5 size-4 shrink-0 rounded accent-blue-600" aria-invalid={Boolean(errors.acceptTerms)} aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined} {...form.register("acceptTerms")} />
            <span>I agree to the Terms of Service and Privacy Policy <span className="text-destructive">*</span></span>
          </label>
          <FieldError id="acceptTerms-error" errors={[errors.acceptTerms]} />
        </div>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Creating account…' : 'Create account'}</Button>
      <p className="text-center text-sm text-slate-500">
        Already have an account? <Link to="/login" className={authLinkClassName}>Log in</Link>
      </p>
    </form>
  )
}
