import { useState } from "react"
import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import StackIcon from "tech-stack-icons"
import { Button } from "@/components/ui/button"
import type { LoginValues } from "./login.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
}

const inputClassName = "h-11 rounded-lg border-slate-200 bg-white px-3.5 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"

export function LoginForm({ onSubmit }: LoginFormProps) {
  const form = useFormContext<LoginValues>()
  const errors = form.formState.errors
  const [passwordVisible, setPasswordVisible] = useState(false)

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
          <Input id="loginEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "loginEmail-error" : undefined} className={inputClassName} {...form.register("email")} />
          <FieldError id="loginEmail-error" errors={[errors.email]} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="loginPassword" className="sr-only">Password</Label>
          <div className="relative">
            <Input id="loginPassword" type={passwordVisible ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "loginPassword-error" : undefined} className={`${inputClassName} pr-12`} {...form.register("password")} />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              onClick={() => setPasswordVisible((visible) => !visible)}
            >
              {passwordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </Button>
          </div>
          <FieldError id="loginPassword-error" errors={[errors.password]} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input id="rememberMe" type="checkbox" className="size-4 rounded accent-blue-600" {...form.register("rememberMe")} />
            Stay signed in
          </label>
          <Link to="/auth/forgot-password" className="rounded text-sm font-medium text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Forgot password?</Link>
        </div>
      </FieldGroup>
      <Button type="submit" className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800">Log in</Button>
      <p className="text-center text-sm text-slate-500">
        Don’t have an account? <Link to="/auth/register" className="rounded font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Sign up</Link>
      </p>
    </form>
  )
}
