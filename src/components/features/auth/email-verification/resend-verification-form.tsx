import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { AuthFeedback } from "../shared/auth-feedback"
import type { ResendVerificationValues } from "./email-verification.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ResendVerificationFormProps = {
  requestNotice: boolean
  onSubmit: (values: ResendVerificationValues) => void
}

export function ResendVerificationForm({ requestNotice, onSubmit }: ResendVerificationFormProps) {
  const form = useFormContext<ResendVerificationValues>()
  const error = form.formState.errors.email

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-4">
        <div className="space-y-2">
          <Label htmlFor="verificationEmail" className="text-xs font-medium text-slate-700">Email</Label>
          <Input id="verificationEmail" type="email" autoComplete="email" placeholder="Your email address" required aria-invalid={Boolean(error)} aria-describedby={error ? "verificationEmail-error" : undefined} className="h-10 rounded-md border-slate-300 px-3 text-xs shadow-none placeholder:text-slate-400" {...form.register("email")} />
          <FieldError id="verificationEmail-error" errors={[error]} />
        </div>
      </FieldGroup>
      {requestNotice && (
        <AuthFeedback title="Verification email is not connected yet">
          No message was sent and your address was not saved.
        </AuthFeedback>
      )}
      <Button type="submit" className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">Resend verification email</Button>
    </form>
  )
}
