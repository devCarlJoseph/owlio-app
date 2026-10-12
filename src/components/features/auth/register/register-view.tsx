import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthShowcaseLayout } from "../shared/auth-showcase-layout"
import { registerSchema, type RegisterValues } from "./register.schema"
import { RegisterForm } from "./register-form"

export function RegisterView() {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", accountType: undefined, password: "", passwordConfirmation: "", acceptTerms: false },
    mode: "onTouched",
  })

  return (
    <FormProvider {...form}>
      <AuthShowcaseLayout context="register">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Create your account</h1>
        <div className="mt-7">
          <RegisterForm onSubmit={() => undefined} />
        </div>
      </AuthShowcaseLayout>
    </FormProvider>
  )
}
