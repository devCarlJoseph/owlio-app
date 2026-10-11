import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { ForgotPasswordValues } from "./forgot-password.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordValues) => void
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const form = useFormContext<ForgotPasswordValues>()
  const error = form.formState.errors.email

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-4">
        <div className="space-y-2">
          <Label htmlFor="forgotEmail" className="text-xs font-medium text-slate-700">Email</Label>
          <Input id="forgotEmail" type="email" autoComplete="email" placeholder="Your email address" required aria-invalid={Boolean(error)} aria-describedby={error ? "forgotEmail-error" : undefined} className="h-10 rounded-md border-slate-300 px-3 text-xs shadow-none placeholder:text-slate-400" {...form.register("email")} />
          <FieldError id="forgotEmail-error" errors={[error]} />
        </div>
      </FieldGroup>
      <Button type="submit" className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">Send reset instructions</Button>
    </form>
  )
}
