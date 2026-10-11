import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthSplitLayout } from "../shared/auth-split-layout"
import { registerSchema, type RegisterValues } from "./register.schema"
import { RegisterForm } from "./register-form"
import { Link } from "react-router"

export function RegisterView() {
  const [requestNotice, setRequestNotice] = useState(false)
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", accountType: undefined, password: "", passwordConfirmation: "", acceptTerms: false },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <FormProvider {...form}>
      <AuthSplitLayout
        title="Create your account"
        headingRef={headingRef}
        contentClassName="max-w-[400px]"
        footer={<>Already have an account? <Link to="/auth/login" className="ml-1 font-semibold text-blue-700 underline-offset-4 hover:underline">Log in</Link></>}
      >
        <RegisterForm requestNotice={requestNotice} onSubmit={() => setRequestNotice(true)} />
      </AuthSplitLayout>
    </FormProvider>
  )
}
