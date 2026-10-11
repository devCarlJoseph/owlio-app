import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginLayout } from "./login-layout"
import { LoginForm } from "./login-form"
import { loginSchema, type LoginValues } from "./login.schema"

export function LoginView() {
  const [requestNotice, setRequestNotice] = useState<string | null>(null)
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
        <LoginForm
          requestNotice={requestNotice}
          onSubmit={() => setRequestNotice("Sign-in is not connected yet. No request was sent.")}
          onGoogleSelect={() => setRequestNotice("Google sign-in is not connected yet.")}
        />
      </LoginLayout>
    </FormProvider>
  )
}
