import { useState, type FormEvent } from "react"
import { login } from "@/services/auth/auth.service"
import { getApiErrorMessage } from "@/services/api/api-error"
import { Eye, EyeOff, Mail } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleAuthButton } from "@/components/features/auth/shared/google-auth-button"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    const form = event.currentTarget
    const formData = new FormData(form)

    setIsSubmitting(true)
    try {
      const { user } = await login({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
        rememberMe: formData.has("rememberMe"),
      })
      setFeedback({
        type: "success",
        message: `You’re signed in${user.name ? `, ${user.name}` : ""}. Your session is active.`,
      })
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Could not sign in. Please try again.") })
    } finally {
      setIsSubmitting(false)
    }
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

          <Button className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
          {feedback && (
            <p
              className={`rounded-xl px-3.5 py-3 text-sm leading-5 ${feedback.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-destructive/10 text-destructive"}`}
              role={feedback.type === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {feedback.message}
            </p>
          )}
        </form>

        <div className="my-4 flex items-center gap-4 sm:my-5" aria-hidden="true">
          <Separator className="flex-1" />
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">or continue with</span>
          <Separator className="flex-1" />
        </div>

        <GoogleAuthButton />
      </CardContent>
    </Card>
  )
}
