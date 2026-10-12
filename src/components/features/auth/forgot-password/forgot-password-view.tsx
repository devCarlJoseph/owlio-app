import { useEffect, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthShowcaseLayout } from "../shared/auth-showcase-layout"
import { ForgotPasswordForm } from "./forgot-password-form"
import { forgotPasswordSchema, type ForgotPasswordValues } from "./forgot-password.schema"

export function ForgotPasswordView() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout>
        <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">Reset your password</h1>
        <p className="mt-1.5 text-sm text-slate-500">Enter the email address associated with your Owlio account.</p>
        <div className="mt-7">
          <ForgotPasswordForm onSubmit={() => undefined} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
