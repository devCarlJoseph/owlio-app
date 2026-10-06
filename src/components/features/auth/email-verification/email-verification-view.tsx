import { MailCheck } from "lucide-react"
import { Link } from "react-router"

import { AuthLayout } from "@/components/features/auth/shared/auth-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function EmailVerificationView() {
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

          <div className="mt-8 w-full space-y-3">
            <Button className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm" type="button">
              Resend verification email
            </Button>
            <Link className="inline-flex min-h-10 items-center justify-center px-3 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" to="/auth/register">
              Use a different email
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
