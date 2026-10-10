import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { AuthFeedback } from "../shared/auth-feedback"
import { AuthFormActions } from "../shared/auth-form-actions"
import { PasswordField } from "../shared/password-field"
import type { LoginValues } from "./login.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginFormProps = {
  requestNotice: boolean
  onSubmit: (values: LoginValues) => void
}

export function LoginForm({ requestNotice, onSubmit }: LoginFormProps) {
  const form = useFormContext<LoginValues>()
  const errors = form.formState.errors

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="gap-5">
        <div className="space-y-2">
          <Label htmlFor="loginEmail">Email <span className="text-destructive">*</span></Label>
          <Input id="loginEmail" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "loginEmail-error" : undefined} {...form.register("email")} />
          <FieldError id="loginEmail-error" errors={[errors.email]} />
        </div>
        <PasswordField id="loginPassword" label="Password" autoComplete="current-password" registration={form.register("password")} error={errors.password?.message} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input id="rememberMe" type="checkbox" className="size-4 accent-indigo-600" {...form.register("rememberMe")} />
            Remember me <span className="text-xs text-muted-foreground">Optional</span>
          </label>
          <Link to="/auth/forgot-password" className="text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline">Forgot password?</Link>
        </div>
      </FieldGroup>
      {requestNotice && (
        <AuthFeedback title="Preview only — no sign-in request was sent">
          This page is not connected to an authentication service. You are not signed in.
        </AuthFeedback>
      )}
      <AuthFormActions label="Sign in" />
      <p className="text-center text-sm text-muted-foreground">
        New to Owlio? <Link to="/auth/register" className="font-semibold text-indigo-700 underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </form>
  )
}
