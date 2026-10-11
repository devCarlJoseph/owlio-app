import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthShowcaseLayout } from "../shared/auth-showcase-layout"
import { LoginForm } from "./login-form"
import { loginSchema, type LoginValues } from "./login.schema"

export function LoginView() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onTouched",
  })

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout>
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Welcome back!</h1>
        <p className="mt-1.5 text-sm text-slate-500">Log in to your Owlio account to continue learning.</p>
        <div className="mt-7">
          <LoginForm onSubmit={() => undefined} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
