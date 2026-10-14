import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import StackIcon from "tech-stack-icons"
import { Button } from "@/components/ui/button"
import type { LoginValues } from "./login.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthPasswordInput } from "../shared/auth-password-input"
import { authInputClassName, authLinkClassName, authPrimaryButtonClassName } from "../shared/auth-input-styles"

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const form = useFormContext<LoginValues>()
  const errors = form.formState.errors

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <Button type="button" variant="outline" className="h-11 w-full justify-center rounded-lg border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:bg-slate-50">
        <StackIcon name="google" className="size-4" aria-hidden="true" />
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or with email<span className="h-px flex-1 bg-slate-200" /></div>
      <FieldGroup className="gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="loginEmail" className="sr-only">Email</Label>
          <Input id="loginEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "loginEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
          <FieldError id="loginEmail-error" errors={[errors.email]} />
        </div>
        <AuthPasswordInput id="loginPassword" label="Password" placeholder="Enter your password" autoComplete="current-password" registration={form.register("password")} error={errors.password?.message} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input id="rememberMe" type="checkbox" className="size-4 rounded accent-blue-600" {...form.register("rememberMe")} />
            Stay signed in
          </label>
          <Link to="/forgot-password" className={`text-sm ${authLinkClassName} font-medium`}>Forgot password?</Link>
        </div>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Signing in…' : 'Log in'}</Button>
      <p className="text-center text-sm text-slate-500">
        Don’t have an account? <Link to="/register" className={authLinkClassName}>Sign up</Link>
      </p>
    </form>
  )
}
