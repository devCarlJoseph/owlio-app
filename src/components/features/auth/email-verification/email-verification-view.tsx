import { useState, type FormEvent } from "react"
import { MailCheck } from "lucide-react"
import { Link, useSearchParams } from "react-router"

import { AuthLayout } from "@/components/features/auth/shared/auth-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/services/api/api-error"
import { resendVerification } from "@/services/auth/auth.service"

export function EmailVerificationView() {
  const [searchParams] = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string; actionUrl?: string } | null>(null)

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim()

    setIsSubmitting(true)
    try {
      const result = await resendVerification(email)
      setFeedback({
        type: "success",
        message: result.message,
        ...(result.developmentActionUrl && { actionUrl: result.developmentActionUrl }),
      })
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(error, "Could not resend the verification email. Please try again."),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      footer={
        <>
          Already verified?{" "}
          <Link className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline" to="/auth/login">
            Sign in
          </Link>
        </>
      }
    >
      <Card className="w-full border-0 bg-transparent py-0 shadow-none ring-0">
        <CardContent className="items-center gap-0 px-0 text-center">
          <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 sm:size-[72px]">
            <MailCheck aria-hidden="true" className="size-8 sm:size-9" strokeWidth={1.6} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">One last step</p>
          <h2 className="mt-3 font-serif text-4xl tracking-[-0.045em] text-foreground sm:text-[2.65rem]">
            Check your inbox
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            We sent a verification link to the email address you used to create your Owlio account. Open it to confirm your email.
          </p>

          <form className="mt-8 w-full space-y-3 text-left" onSubmit={handleResend}>
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="verification-email">Email address</Label>
              <Input
                autoComplete="email"
                className="h-11 rounded-xl border-transparent bg-muted/70 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-ring"
                defaultValue={searchParams.get("email") ?? ""}
                id="verification-email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>
            <Button className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Sending…" : "Resend verification email"}
            </Button>
            {feedback && (
              <div
                className={`rounded-xl px-3.5 py-3 text-sm leading-5 ${feedback.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-destructive/10 text-destructive"}`}
                role={feedback.type === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                <p>{feedback.message}</p>
                {feedback.actionUrl && (
                  <a className="mt-2 inline-flex font-semibold underline underline-offset-4" href={feedback.actionUrl}>
                    Open verification link
                  </a>
                )}
              </div>
            )}
          </form>
          <div className="mt-2 w-full text-center">
            <Link className="inline-flex min-h-10 items-center justify-center px-3 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" to="/auth/register">
              Use a different email
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
