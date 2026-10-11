import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { PasswordField } from "../shared/password-field"
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
      <FieldGroup className="gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-xs font-medium text-slate-700">Full name</Label>
          <Input id="fullName" autoComplete="name" required aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined} className="h-10 rounded-md border-slate-300 px-3 text-xs shadow-none" {...form.register("fullName")} />
          <FieldError id="fullName-error" errors={[errors.fullName]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registerEmail" className="text-xs font-medium text-slate-700">Email</Label>
          <Input id="registerEmail" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "registerEmail-error" : undefined} className="h-10 rounded-md border-slate-300 px-3 text-xs shadow-none" {...form.register("email")} />
          <FieldError id="registerEmail-error" errors={[errors.email]} />
        </div>
        <AccountTypeSelector />
        <PasswordField id="registerPassword" label="Password" autoComplete="new-password" registration={form.register("password")} error={errors.password?.message} />
        <PasswordGuidance />
        <PasswordField id="passwordConfirmation" label="Confirm password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={errors.passwordConfirmation?.message} />
        <div className="space-y-2">
          <label htmlFor="acceptTerms" className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-700">
            <input id="acceptTerms" type="checkbox" required className="mt-1 size-4 shrink-0 accent-blue-600" aria-invalid={Boolean(errors.acceptTerms)} aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined} {...form.register("acceptTerms")} />
            <span>I agree to the Terms of Service and Privacy Policy <span className="text-destructive">*</span></span>
          </label>
          <FieldError id="acceptTerms-error" errors={[errors.acceptTerms]} />
        </div>
      </FieldGroup>
      <Button type="submit" className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">Create account</Button>
    </form>
  )
}
