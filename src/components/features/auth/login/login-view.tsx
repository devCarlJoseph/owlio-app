import { useEffect, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginLayout } from "./login-layout"
import { LoginForm } from "./login-form"
import { loginSchema, type LoginValues } from "./login.schema"

export function LoginView() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <FormProvider {...form}>
      <LoginLayout headingRef={headingRef}>
        <LoginForm onSubmit={() => undefined} />
      </LoginLayout>
    </FormProvider>
  )
}
