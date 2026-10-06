import { useState, type FormEvent } from "react"
import { Eye, EyeOff, Mail } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#4A90E2" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18l6.8-5.3Z" />
      <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.2 11.4-8.2Z" />
    </svg>
  )
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <Card className="w-full border-0 bg-transparent py-0 shadow-none ring-0">
      <CardContent className="gap-0 px-0">
        <div className="mb-6 text-center sm:mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Welcome back</p>
          <h2 className="mt-3 font-serif text-4xl tracking-[-0.045em] text-foreground sm:text-[2.65rem]">
            Sign in to Owlio
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Continue your learning journey, right where you left off.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="login-email">Email address</Label>
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="email"
              className="h-11 rounded-xl border-transparent bg-muted/70 pl-10 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-ring"
                id="login-email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm font-medium" htmlFor="login-password">Password</Label>
              <Link className="text-xs font-medium text-foreground underline-offset-4 hover:text-primary hover:underline" to="/auth/forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                autoComplete="current-password"
                className="h-11 rounded-xl border-transparent bg-muted/70 pr-12 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-ring"
                id="login-password"
                name="password"
                placeholder="Enter your password"
                required
                type={showPassword ? "text" : "password"}
              />
              <Button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((visible) => !visible)}
                size="icon"
                type="button"
                variant="ghost"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <input
              className="size-4 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              id="remember-me"
              name="rememberMe"
              type="checkbox"
            />
            <Label className="cursor-pointer text-xs font-normal text-muted-foreground" htmlFor="remember-me">
              Remember me
            </Label>
          </div>

          <Button className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm" type="submit">
            Sign in
          </Button>
        </form>

        <div className="my-4 flex items-center gap-4 sm:my-5" aria-hidden="true">
          <Separator className="flex-1" />
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">or continue with</span>
          <Separator className="flex-1" />
        </div>

        <Button className="h-11 w-full rounded-xl border-border bg-background text-sm font-medium shadow-none" type="button" variant="outline">
          <GoogleMark />
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  )
}
