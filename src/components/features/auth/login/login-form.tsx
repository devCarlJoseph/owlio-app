import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import StackIcon from "tech-stack-icons"
import { Button } from "@/components/ui/button"
import { PasswordField } from "../shared/password-field"
import type { LoginValues } from "./login.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const form = useFormContext<LoginValues>()
  const errors = form.formState.errors
  const [passwordStep, setPasswordStep] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!passwordStep) {
      if (await form.trigger("email")) setPasswordStep(true)
      return
    }
    await form.handleSubmit(onSubmit)(event)
  }

  function changeEmail() {
    setPasswordStep(false)
    form.setFocus("email")
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <FieldGroup className="gap-4">
        <div className="space-y-2">
          <Label htmlFor="loginEmail" className="text-xs font-medium text-slate-700">Email</Label>
          <Input id="loginEmail" type="email" autoComplete="email" placeholder="Your email address" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "loginEmail-error" : undefined} className="h-10 rounded-md border-slate-300 px-3 text-xs shadow-none placeholder:text-slate-400" {...form.register("email")} />
          <FieldError id="loginEmail-error" errors={[errors.email]} />
        </div>
        {passwordStep && (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="max-w-[70%] truncate text-xs text-slate-500">{form.getValues("email")}</span>
              <button type="button" onClick={changeEmail} className="text-xs font-medium text-blue-700 underline-offset-4 hover:underline">Change email</button>
            </div>
            <PasswordField id="loginPassword" label="Password" autoComplete="current-password" registration={form.register("password")} error={errors.password?.message} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input id="rememberMe" type="checkbox" className="size-3.5 accent-blue-600" {...form.register("rememberMe")} />
                Remember me
              </label>
              <Link to="/auth/forgot-password" className="text-xs font-medium text-blue-700 underline-offset-4 hover:underline">Forgot password?</Link>
            </div>
          </>
        )}
      </FieldGroup>
      <Button type="submit" className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">
        {passwordStep ? "Log in" : "Continue with email"}
      </Button>
      {!passwordStep && (
        <>
          <div className="my-5 flex items-center gap-4 text-[10px] text-slate-400"><span className="h-px flex-1 bg-slate-200" />OR<span className="h-px flex-1 bg-slate-200" /></div>
          <Button type="button" variant="outline" className="h-10 w-full justify-center rounded-md border-slate-300 bg-white text-xs font-medium text-slate-700 shadow-none hover:bg-slate-50">
            <StackIcon name="google" className="size-3.5" aria-hidden="true" />
            Continue with Google
          </Button>
        </>
      )}
    </form>
  )
}
