import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthSplitLayout } from "../shared/auth-split-layout"
import { ResendVerificationForm } from "./resend-verification-form"
import { resendVerificationSchema, type ResendVerificationValues } from "./email-verification.schema"

const verificationSteps = [
  { title: "Check your inbox", description: "Look for an email from Owlio." },
  { title: "Open your verification link", description: "Use the link to confirm your email address." },
  { title: "Start learning", description: "Continue to your Owlio learning space." },
]

const linkOpenedSteps = [
  { title: "Verification link opened", description: "You’re in the right place to verify your email." },
  { title: "Confirm your address", description: "Complete the email-verification step." },
  { title: "Start learning", description: "Continue to your Owlio learning space." },
]

export function EmailVerificationView() {
  const location = useLocation()
  const linkProvided = new URLSearchParams(location.search).has("token")
  const [isResending, setIsResending] = useState(false)
  const form = useForm<ResendVerificationValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [isResending])

  return (
    <FormProvider {...form}>
      <AuthSplitLayout
        context="email-verification"
        title={isResending ? "Resend verification email" : "Verify your email"}
        description={isResending
          ? "Enter the email address associated with your Owlio account."
          : "Confirm your email to keep your Owlio learning space connected."}
        headingRef={headingRef}
        footer={<>Already have an account? <Link to="/auth/login" className="ml-1 font-semibold text-blue-700 underline-offset-4 hover:underline">Log in</Link></>}
      >
        {isResending ? (
          <div className="space-y-3">
            <ResendVerificationForm onSubmit={() => undefined} />
            <Button type="button" variant="ghost" onClick={() => setIsResending(false)} className="w-full text-xs text-slate-600">Back</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <ol className="space-y-3">
              {(linkProvided ? linkOpenedSteps : verificationSteps).map(({ title, description }, index) => (
                <li key={title} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/80 px-3 py-3 shadow-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-700">0{index + 1}</span>
                  <span><span className="block text-xs font-semibold text-slate-800">{title}</span><span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{description}</span></span>
                </li>
              ))}
            </ol>
            <Button type="button" onClick={() => setIsResending(true)} className="h-10 w-full rounded-md bg-[#89a6e8] text-xs font-medium text-white hover:bg-[#7898e2]">
              {linkProvided ? "Request another verification email" : "Resend verification email"}
            </Button>
          </div>
        )}
      </AuthSplitLayout>
    </FormProvider>
  )
}
