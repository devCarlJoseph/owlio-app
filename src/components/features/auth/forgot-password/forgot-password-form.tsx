import type { FormEvent } from "react"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <Card className="w-full border-0 bg-transparent py-0 shadow-none ring-0">
      <CardContent className="gap-0 px-0">
        <div className="mb-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Account recovery</p>
          <h2 className="mt-3 font-serif text-4xl tracking-[-0.045em] text-foreground sm:text-[2.65rem]">
            Forgot your password?
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Enter the email address linked to your account and we’ll help you get back in.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="recovery-email">Email address</Label>
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="email"
                className="h-11 rounded-xl border-transparent bg-muted/70 pl-10 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-ring"
                id="recovery-email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>
          </div>

          <Button className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm" type="submit">
            Send reset instructions
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
