import { useState, type FormEvent } from "react"
import { BookOpen, CircleHelp, Eye, EyeOff, GraduationCap, Mail, UserRound, UsersRound } from "lucide-react"

import { GoogleAuthButton } from "@/components/features/auth/shared/google-auth-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getApiErrorMessage } from "@/services/api/api-error"
import { registerAccount } from "@/services/auth/auth.service"

type AccountType = "student" | "educator" | "tutor" | "other"
type FormFeedback = { type: "success" | "error"; message: string; actionUrl?: string }

function PasswordField({ id, label, placeholder }: { id: string; label: string; placeholder: string }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="min-w-0 space-y-1.5 [@media(max-height:760px)]:space-y-1">
      <Label className="text-sm font-medium [@media(max-height:760px)]:text-xs" htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          autoComplete="new-password"
          className="h-10 rounded-xl border-transparent bg-muted/70 pr-11 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-ring [@media(max-height:760px)]:h-9"
          id={id}
          minLength={8}
          name={id}
          placeholder={placeholder}
          required
          type={isVisible ? "text" : "password"}
        />
        <Button
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground [@media(max-height:760px)]:size-7"
          onClick={() => setIsVisible((visible) => !visible)}
          size="icon"
          type="button"
          variant="ghost"
        >
          {isVisible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
        </Button>
      </div>
    </div>
  )
}

export function RegisterForm() {
  const [accountType, setAccountType] = useState<AccountType>("student")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FormFeedback | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    if (accountType === "other") {
      setFeedback({
        type: "error",
        message: "The API does not support the Other account type yet. Please choose Student, Educator, or Tutor.",
      })
      return
    }

    const formData = new FormData(event.currentTarget)
    const form = event.currentTarget
    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("register-password") ?? "")
    const confirmPassword = String(formData.get("confirm-password") ?? "")

    if (password !== confirmPassword) {
      setFeedback({ type: "error", message: "Your passwords do not match." })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await registerAccount({
        name,
        email,
        accountType: accountType === "tutor" ? "educator" : accountType,
        password,
        confirmPassword,
        termsAccepted: true,
      })
      setFeedback({
        type: "success",
        message: result.message,
        ...(result.developmentActionUrl && { actionUrl: result.developmentActionUrl }),
      })
      form.reset()
      setAccountType("student")
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(error, "Could not create your account. Please try again."),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full border-0 bg-transparent py-0 shadow-none ring-0">
      <CardContent className="gap-0 px-0">
        <div className="mb-5 text-center [@media(max-height:760px)]:mb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Start with Owlio</p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-0.045em] text-foreground sm:text-4xl [@media(max-height:760px)]:mt-1 [@media(max-height:760px)]:text-2xl">
            Create your account
          </h2>
          <p className="mt-2 text-sm leading-5 text-muted-foreground [@media(max-height:760px)]:hidden">
            One learning space for everything you want to do.
          </p>
        </div>

        <form className="space-y-3 [@media(max-height:760px)]:space-y-2" onSubmit={handleSubmit}>
          <div className="space-y-1.5 [@media(max-height:760px)]:space-y-1">
            <Label className="text-sm font-medium [@media(max-height:760px)]:text-xs" htmlFor="register-name">Full name</Label>
            <div className="relative">
              <UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="name"
                className="h-10 rounded-xl border-transparent bg-muted/70 pl-10 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-ring [@media(max-height:760px)]:h-9"
                id="register-name"
                name="name"
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 [@media(max-height:760px)]:space-y-1">
            <Label className="text-sm font-medium [@media(max-height:760px)]:text-xs" htmlFor="register-email">Email address</Label>
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="email"
                className="h-10 rounded-xl border-transparent bg-muted/70 pl-10 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-ring [@media(max-height:760px)]:h-9"
                id="register-email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>
          </div>

          <fieldset className="space-y-1.5 [@media(max-height:760px)]:space-y-1">
            <legend className="text-sm font-medium [@media(max-height:760px)]:text-xs">I’m joining as</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="relative cursor-pointer">
                <input
                  checked={accountType === "student"}
                  className="peer sr-only"
                  name="accountType"
                  onChange={() => setAccountType("student")}
                  type="radio"
                  value="student"
                />
                <span className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 [@media(max-height:760px)]:h-9">
                  <BookOpen aria-hidden="true" className="size-4" />
                  Student
                </span>
              </label>
              <label className="relative cursor-pointer">
                <input
                  checked={accountType === "educator"}
                  className="peer sr-only"
                  name="accountType"
                  onChange={() => setAccountType("educator")}
                  type="radio"
                  value="educator"
                />
                <span className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 [@media(max-height:760px)]:h-9">
                  <GraduationCap aria-hidden="true" className="size-4" />
                  Educator
                </span>
              </label>
              <label className="relative cursor-pointer">
                <input
                  checked={accountType === "tutor"}
                  className="peer sr-only"
                  name="accountType"
                  onChange={() => setAccountType("tutor")}
                  type="radio"
                  value="tutor"
                />
                <span className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 [@media(max-height:760px)]:h-9">
                  <UsersRound aria-hidden="true" className="size-4" />
                  Tutor
                </span>
              </label>
              <label className="relative cursor-pointer">
                <input
                  checked={accountType === "other"}
                  className="peer sr-only"
                  name="accountType"
                  onChange={() => setAccountType("other")}
                  type="radio"
                  value="other"
                />
                <span className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 [@media(max-height:760px)]:h-9">
                  <CircleHelp aria-hidden="true" className="size-4" />
                  Other
                </span>
              </label>
            </div>
            <p className="text-xs leading-4 text-muted-foreground">Tutor accounts are registered with the API’s educator account type.</p>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <PasswordField id="register-password" label="Password" placeholder="At least 8 characters" />
            <PasswordField id="confirm-password" label="Confirm" placeholder="Re-enter password" />
          </div>

          <label className="flex cursor-pointer items-start gap-2 pt-0.5 text-xs leading-5 text-muted-foreground [@media(max-height:760px)]:leading-4">
            <input className="mt-0.5 size-4 shrink-0 accent-primary [@media(max-height:760px)]:size-3.5" name="termsAccepted" required type="checkbox" />
            <span>I agree to the terms of service and privacy policy.</span>
          </label>

          <Button className="h-10 w-full rounded-xl text-sm font-semibold shadow-sm [@media(max-height:760px)]:h-9" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account…" : "Create account"}
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

        <div aria-hidden="true" className="my-3 flex items-center gap-3 sm:my-4 [@media(max-height:760px)]:my-1">
          <Separator className="flex-1" />
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">or sign up with</span>
          <Separator className="flex-1" />
        </div>

        <GoogleAuthButton />
      </CardContent>
    </Card>
  )
}

