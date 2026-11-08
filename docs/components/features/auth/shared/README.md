# shared

This directory mirrors `src/components/features/auth/shared/`. For the current files, proposed component folders, and manual migration checks, use the [auth guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/auth/shared/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `auth-brand-panel.tsx`

Current file: `src/components/features/auth/shared/auth-brand-panel.tsx`

```tsx
import { BookOpenCheck, NotebookPen, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-indigo-50/70 px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-14" aria-label="About Owlio">
      <div className="absolute -right-20 top-24 size-72 rounded-full bg-indigo-200/30 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 flex items-center gap-2.5 font-semibold tracking-tight text-slate-950">
        <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <BookOpenCheck className="size-5" aria-hidden="true" />
        </span>
        <span className="text-2xl">owlio<span className="text-indigo-600">.</span></span>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-lg py-12">
        <div className="mb-8 flex items-center gap-3 text-indigo-700">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm"><NotebookPen aria-hidden="true" /></span>
          <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm"><Sparkles aria-hidden="true" /></span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight text-slate-950 xl:text-5xl">Make room for learning.</h2>
        <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">A calm space for students and educators to bring learning together.</p>
        <Card className="mt-10 rotate-1 rounded-2xl border-white/80 bg-white/80 p-5 shadow-sm ring-0">
          <p className="text-sm font-medium text-slate-800">One learning space, shaped around you.</p>
          <div className="mt-4 flex gap-2" aria-hidden="true">
            <span className="h-2 w-20 rounded-full bg-indigo-200" />
            <span className="h-2 w-12 rounded-full bg-slate-200" />
            <span className="h-2 w-16 rounded-full bg-slate-100" />
          </div>
        </Card>
      </div>
      <p className="relative z-10 text-xs text-slate-500">A little more space to learn, teach, and grow.</p>
    </aside>
  )
}
```

### `auth-feedback.tsx`

Current file: `src/components/features/auth/shared/auth-feedback.tsx`

```tsx
import type { ReactNode } from "react"
import { CheckCircle2, Info, TriangleAlert } from "lucide-react"

type AuthFeedbackProps = {
  title: string
  children: ReactNode
  tone?: "info" | "error" | "success"
  preview?: boolean
}

const toneStyles = {
  info: "border-indigo-200 bg-indigo-50/70 text-indigo-950",
  error: "border-destructive/30 bg-destructive/5 text-foreground",
  success: "border-indigo-200 bg-indigo-50/70 text-indigo-950",
}

const toneIcons = {
  info: Info,
  error: TriangleAlert,
  success: CheckCircle2,
}

export function AuthFeedback({ title, children, tone = "info", preview = false }: AuthFeedbackProps) {
  const Icon = toneIcons[tone]
  const liveRole = tone === "error" ? "alert" : "status"

  return (
    <div className={`rounded-xl border p-4 ${toneStyles[tone]}`} role={liveRole} aria-live={tone === "error" ? "assertive" : "polite"}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{title}</p>
            {preview && <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">Preview only</span>}
          </div>
          <div className="mt-1 text-sm leading-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
```

### `auth-form-actions.tsx`

Current file: `src/components/features/auth/shared/auth-form-actions.tsx`

```tsx
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type AuthFormActionsProps = {
  label: string
  disabled?: boolean
}

export function AuthFormActions({ label, disabled }: AuthFormActionsProps) {
  return (
    <Button type="submit" disabled={disabled} className="h-11 w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
      {label}<ArrowRight aria-hidden="true" />
    </Button>
  )
}
```

### `auth-input-styles.ts`

Current file: `src/components/features/auth/shared/auth-input-styles.ts`

```ts
export const authInputClassName = "h-11 rounded-lg border-slate-200 bg-white px-3.5 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"

export const authPrimaryButtonClassName = "h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800"

export const authLinkClassName = "rounded font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
```

### `auth-layout.tsx`

Current file: `src/components/features/auth/shared/auth-layout.tsx`

```tsx
import type { ReactNode, RefObject } from "react"
import { BookOpenCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { AuthBrandPanel } from "./auth-brand-panel"

type AuthLayoutProps = {
  title: string
  description: string
  headingRef: RefObject<HTMLHeadingElement | null>
  children: ReactNode
}

export function AuthLayout({ title, description, headingRef, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <AuthBrandPanel />
      <main className="flex min-w-0 flex-col items-center px-4 py-6 sm:px-8 sm:py-10 lg:justify-center lg:px-10 xl:px-16">
        <div className="mb-8 flex w-full max-w-xl items-center gap-2.5 font-semibold tracking-tight text-slate-950 lg:hidden" aria-label="Owlio">
          <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BookOpenCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl">owlio<span className="text-indigo-600">.</span></span>
        </div>
        <Card className="w-full max-w-xl overflow-visible rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="gap-2 px-5 pt-6 sm:px-8 sm:pt-8">
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-3xl">
              {title}
            </h1>
            <CardDescription className="text-sm leading-6 sm:text-base">{description}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
```

### `auth-password-input.tsx`

Current file: `src/components/features/auth/shared/auth-password-input.tsx`

```tsx
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authInputClassName } from "./auth-input-styles"

type AuthPasswordInputProps = {
  id: string
  label: string
  placeholder: string
  autoComplete: "current-password" | "new-password"
  registration: UseFormRegisterReturn
  error?: string
}

export function AuthPasswordInput({ id, label, placeholder, autoComplete, registration, error }: AuthPasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <div className="relative">
        <Input id={id} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} required aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={`${authInputClassName} pr-12`} {...registration} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1.5 top-0 bottom-0 my-auto text-slate-500 active:!translate-y-0"
          aria-label={visible ? `Hide ${label.toLocaleLowerCase()}` : `Show ${label.toLocaleLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      <FieldError id={errorId} errors={[error ? { message: error } : undefined]} />
    </div>
  )
}
```

### `auth-preview-controls.tsx`

Current file: `src/components/features/auth/shared/auth-preview-controls.tsx`

```tsx
import { Button } from "@/components/ui/button"

type PreviewOption<State extends string> = {
  value: State
  label: string
}

type AuthPreviewControlsProps<State extends string> = {
  options: readonly PreviewOption<State>[]
  onSelect: (state: State) => void
}

export function AuthPreviewControls<State extends string>({ options, onSelect }: AuthPreviewControlsProps<State>) {
  return (
    <details className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Preview UI states
      </summary>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">These controls only show design previews. They do not send a request or change account state.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <Button key={value} type="button" size="sm" variant="outline" onClick={() => onSelect(value)}>
            {label}
          </Button>
        ))}
      </div>
    </details>
  )
}
```

### `auth-showcase-content.ts`

Current file: `src/components/features/auth/shared/auth-showcase-content.ts`

```ts
import { BookOpen, BookOpenCheck, ChartNoAxesCombined, ClipboardCheck, KeyRound, Languages, MailCheck, Presentation, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react"

export type AuthShowcaseContext = "login" | "register" | "forgot-password" | "email-verification" | "password-reset"

type Feature = {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  badge: string
}

type Question = {
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

type Guide = {
  icon: LucideIcon
  title: string
  steps: Array<{ title: string; description: string }>
}

type AuthShowcaseContent = {
  asideLabel: string
  features: Feature[]
  footer: string
  questionTitle?: string
  questions?: Question[]
  guide?: Guide
}

const loginFeatures: Feature[] = [
  { icon: Presentation, eyebrow: "Virtual classrooms", title: "Every class in one place.", description: "Join live lessons, follow along with materials, and keep your class discussions organized.", badge: "Live class at 10:00" },
  { icon: ClipboardCheck, eyebrow: "Quizzes & assessments", title: "Practice that feels like progress.", description: "Answer quizzes, submit assignments, and get feedback that shows you what to learn next.", badge: "Quiz · 9/10 correct" },
  { icon: ChartNoAxesCombined, eyebrow: "Learning progress", title: "Watch your growth add up.", description: "Track goals and lessons completed so every study session counts toward something bigger.", badge: "Weekly goal · 72%" },
  { icon: Languages, eyebrow: "Tutoring & ESL", title: "Learning that fits every teacher.", description: "Teachers, private tutors, and online ESL instructors guide learners in flexible spaces.", badge: "1:1 session today" },
]

const loginQuestions: Question[] = [
  { prompt: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter"], answer: 1, explanation: "Iron-rich dust gives Mars its reddish color." },
  { prompt: "What is 7 × 8?", options: ["54", "56", "64"], answer: 1, explanation: "Remember the sequence 5, 6, 7, 8: 56 = 7 × 8." },
  { prompt: "Which of these words is a verb?", options: ["Quickly", "Learn", "Bright"], answer: 1, explanation: "A verb is an action word, and learning is an action." },
  { prompt: "Which gas do plants absorb to make food?", options: ["Oxygen", "Carbon dioxide", "Nitrogen"], answer: 1, explanation: "Plants use carbon dioxide, water, and sunlight in photosynthesis." },
]

export const authShowcaseContent: Record<AuthShowcaseContext, AuthShowcaseContent> = {
  login: {
    asideLabel: "Discover Owlio",
    features: loginFeatures,
    footer: "For students · teachers · tutors",
    questionTitle: "Warm-up question",
    questions: loginQuestions,
  },
  register: {
    asideLabel: "Create your Owlio account",
    features: [
      { icon: Sparkles, eyebrow: "CREATE YOUR ACCOUNT", title: "Your learning space starts here.", description: "Sign up and choose the role that fits how you learn or teach with Owlio.", badge: "Account setup" },
      { icon: Users, eyebrow: "CHOOSE YOUR ROLE", title: "A workspace that fits you.", description: "Select student, teacher, or other to tailor your Owlio experience.", badge: "Made for your role" },
      { icon: BookOpenCheck, eyebrow: "GET STARTED", title: "Bring learning together.", description: "Keep lessons, resources, and learning goals organized in one place.", badge: "Ready to begin" },
    ],
    footer: "A learning space shaped around your role.",
    guide: {
      icon: Sparkles,
      title: "Create your Owlio account",
      steps: [
        { title: "Add your details", description: "Enter your name and email address." },
        { title: "Choose your role", description: "Tell Owlio how you learn or teach." },
        { title: "Set your password", description: "Create a secure password to finish." },
      ],
    },
  },
  "forgot-password": {
    asideLabel: "Password recovery guide",
    features: [
      { icon: KeyRound, eyebrow: "ACCOUNT RECOVERY", title: "Let’s get you back to learning.", description: "Use the email address linked to your Owlio account to request a reset link.", badge: "Recovery steps" },
      { icon: MailCheck, eyebrow: "CHECK YOUR INBOX", title: "Open your reset instructions.", description: "Find the password-reset email and follow its secure link.", badge: "Check your email" },
      { icon: BookOpen, eyebrow: "RETURN TO OWLIO", title: "Choose a new password.", description: "Reset your password and get back to your learning space.", badge: "Back to learning" },
    ],
    footer: "Your learning space will be here when you return.",
    guide: {
      icon: KeyRound,
      title: "Reset your password",
      steps: [
        { title: "Enter your account email", description: "Use the address connected to Owlio." },
        { title: "Open the reset email", description: "Follow the secure link in your inbox." },
        { title: "Choose a new password", description: "Then sign in to return to Owlio." },
      ],
    },
  },
  "email-verification": {
    asideLabel: "Email verification guide",
    features: [
      { icon: MailCheck, eyebrow: "VERIFY YOUR EMAIL", title: "Connect your Owlio account.", description: "Confirm your email address to keep your learning space secure.", badge: "Email confirmation" },
      { icon: KeyRound, eyebrow: "ENTER YOUR CODE", title: "One quick step to verify.", description: "Find the six-digit code in your Owlio email.", badge: "Check your inbox" },
      { icon: BookOpenCheck, eyebrow: "READY TO LEARN", title: "Your space is waiting.", description: "After confirming your address, continue to your Owlio workspace.", badge: "Continue to Owlio" },
    ],
    footer: "A verified email keeps your account connected.",
    guide: {
      icon: MailCheck,
      title: "Verify your email",
      steps: [
        { title: "Check your inbox", description: "Look for a message from Owlio." },
        { title: "Enter the six-digit code", description: "Confirm the address on your account." },
        { title: "Return to Owlio", description: "Continue setting up your learning space." },
      ],
    },
  },
  "password-reset": {
    asideLabel: "Password security guide",
    features: [
      { icon: KeyRound, eyebrow: "SET A NEW PASSWORD", title: "Secure your Owlio account.", description: "Choose a strong password you do not use for other accounts.", badge: "Account security" },
      { icon: ShieldCheck, eyebrow: "CONFIRM YOUR PASSWORD", title: "Make sure it matches.", description: "Enter your new password again to confirm it.", badge: "Quick confirmation" },
      { icon: BookOpen, eyebrow: "BACK TO YOUR SPACE", title: "Continue learning with confidence.", description: "Save your new password, then sign in to Owlio.", badge: "Ready to sign in" },
    ],
    footer: "A secure sign-in protects your learning space.",
    guide: {
      icon: ShieldCheck,
      title: "Choose a secure password",
      steps: [
        { title: "Create a strong password", description: "Follow the requirements shown on the form." },
        { title: "Confirm your password", description: "Enter the same password a second time." },
        { title: "Sign in to Owlio", description: "Use your new password to continue." },
      ],
    },
  },
}
```

### `auth-showcase-layout.tsx`

Current file: `src/components/features/auth/shared/auth-showcase-layout.tsx`

```tsx
import type { ReactNode } from "react"
import { Link } from "react-router"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AuthShowcase } from "./auth-showcase"
import type { AuthShowcaseContext } from "./auth-showcase-content"

type AuthShowcaseLayoutProps = {
  children: ReactNode
  context: AuthShowcaseContext
}

export function AuthShowcaseLayout({ children, context }: AuthShowcaseLayoutProps) {
  return (
    <div className="min-h-svh bg-white lg:grid lg:h-svh lg:grid-cols-2 lg:gap-4 lg:overflow-hidden lg:p-3">
      <main className="min-h-svh lg:h-full lg:min-h-0 lg:overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex min-h-svh flex-col px-6 py-6 sm:px-10 lg:min-h-full lg:px-8 lg:py-5">
            <Link to="/" aria-label="Owlio home" className="flex w-fit items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <img src="/mascot/owlio-mark.png" alt="" width={128} height={116} className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tight text-[#1d4ed8] dark:text-brand">Owlio</span>
            </Link>
            <div className="flex flex-1 items-center justify-center py-10 lg:py-6">
              <section className="w-full max-w-[400px]">{children}</section>
            </div>
          </div>
        </ScrollArea>
      </main>
      <AuthShowcase key={context} context={context} />
    </div>
  )
}
```

### `auth-showcase.tsx`

Current file: `src/components/features/auth/shared/auth-showcase.tsx`

```tsx
import { useEffect, useRef, useState } from "react"
import { Atom, BookOpen, Calculator, CheckCircle2, FlaskConical, Globe, GraduationCap, Lightbulb, PencilLine, RotateCcw, Ruler, XCircle, type LucideIcon } from "lucide-react"
import { authShowcaseContent, type AuthShowcaseContext } from "./auth-showcase-content"
import { OwlioOwl } from "./owlio-owl"

const patternIcons: Array<{ icon: LucideIcon; className: string }> = [
  { icon: Globe, className: "left-[10%] top-[18%] size-10" },
  { icon: Atom, className: "left-[22%] top-[6%] size-9" },
  { icon: Calculator, className: "right-[12%] top-[38%] size-8" },
  { icon: PencilLine, className: "right-[16%] top-[8%] size-8" },
  { icon: FlaskConical, className: "left-[6%] top-[44%] size-8" },
  { icon: Ruler, className: "right-[30%] top-[22%] size-7" },
  { icon: Lightbulb, className: "left-[36%] top-[30%] size-7" },
  { icon: BookOpen, className: "right-[6%] top-[58%] size-9" },
]

const rotationDelay = 6500

export function AuthShowcase({ context }: { context: AuthShowcaseContext }) {
  const celebrateTimer = useRef(0)
  const [activeFeature, setActiveFeature] = useState(0)
  const [paused, setPaused] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const content = authShowcaseContent[context]
  const { features, questions } = content

  const feature = features[activeFeature]
  const question = questions?.[questionIndex] ?? null
  const FeatureIcon = feature.icon
  const GuideIcon = content.guide?.icon ?? GraduationCap
  const answered = question !== null && selected !== null
  const isCorrect = question !== null && selected === question.answer

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(() => setActiveFeature((index) => (index + 1) % features.length), rotationDelay)
    return () => window.clearInterval(timer)
  }, [features, paused])

  useEffect(() => () => window.clearTimeout(celebrateTimer.current), [])

  function choose(option: number) {
    if (!question || answered) return
    setSelected(option)
    if (option !== question.answer) return
    setCorrectCount((count) => count + 1)
    setCelebrating(true)
    window.clearTimeout(celebrateTimer.current)
    celebrateTimer.current = window.setTimeout(() => setCelebrating(false), 900)
  }

  function nextQuestion() {
    if (!questions) return
    setSelected(null)
    setQuestionIndex((index) => (index + 1) % questions.length)
  }

  return (
    <aside
      className="relative isolate hidden h-full flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#4f7be8_0%,#3f6bdc_45%,#5b86ec_100%)] p-5 text-white lg:flex xl:p-6"
      aria-label={content.asideLabel}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.16)_1px,transparent_0)] [background-size:22px_22px]" />
        {patternIcons.map(({ icon: Icon, className }) => <Icon key={className} strokeWidth={1.2} className={`absolute text-white/25 ${className}`} />)}
        <div className="absolute -bottom-16 -left-10 h-56 w-[70%] rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-10 right-0 h-48 w-[60%] rounded-full bg-sky-200/20 blur-2xl" />
        <div className="absolute -right-20 -top-24 size-80 rounded-full bg-indigo-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-end pt-2">
        <div className="relative -mb-1 flex w-[clamp(150px,calc((100svh-440px)*1.1),396px)] flex-col items-center">
            <div className="relative z-10 -mb-[5%] w-[83%]">
              <OwlioOwl className="w-full" />
              <span key={feature.badge} className="absolute left-[86%] animate-in fade-in zoom-in-75 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none top-[10%] flex items-center gap-2 whitespace-nowrap rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.5)]" aria-hidden="true">
                <span className="flex size-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FeatureIcon className="size-4" /></span>
                {feature.badge}
              </span>
              {celebrating && <span className="absolute right-[86%] animate-in fade-in zoom-in-75 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none top-[6%] whitespace-nowrap rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-emerald-950 shadow-lg" aria-hidden="true">+1 correct!</span>}
            </div>
            <svg viewBox="0 0 320 92" className="relative w-full drop-shadow-[0_10px_14px_rgba(23,37,84,0.28)]" aria-hidden="true">
              <rect x="22" y="62" width="276" height="28" rx="7" fill="#f59e0b" />
              <rect x="34" y="67" width="252" height="18" rx="3" fill="#fff7ed" />
              <rect x="276" y="62" width="22" height="28" rx="6" fill="#d97706" />
              <rect x="34" y="33" width="252" height="30" rx="7" fill="#1d4ed8" />
              <rect x="46" y="39" width="228" height="18" rx="3" fill="#eff6ff" />
              <rect x="34" y="33" width="22" height="30" rx="6" fill="#1e3a8a" />
              <rect x="46" y="4" width="228" height="30" rx="7" fill="#dbeafe" />
              <rect x="46" y="4" width="228" height="10" rx="5" fill="#eef4ff" />
              <rect x="58" y="16" width="204" height="13" rx="3" fill="#ffffff" />
              <rect x="252" y="4" width="22" height="30" rx="6" fill="#93c5fd" />
              <path d="M226 4h11v34l-5.5-5.5L226 38z" fill="#f59e0b" />
            </svg>
        </div>
      </div>

      <div
        className="relative shrink-0 rounded-2xl border border-white/30 bg-white/15 px-5 py-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.6)] backdrop-blur-md"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div key={activeFeature} className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none" aria-live="polite">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100"><FeatureIcon className="size-3.5" aria-hidden="true" />{feature.eyebrow}</p>
          <p className="mt-1.5 text-base font-semibold leading-snug xl:text-lg">{feature.title}</p>
          <p className="mt-1 text-sm leading-6 text-blue-50/90 [@media(max-height:700px)]:hidden">{feature.description}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-blue-100">
          <span>{content.footer}</span>
          <div className="flex items-center gap-1.5">
            {features.map((item, index) => (
              <button
                key={item.eyebrow}
                type="button"
                onClick={() => setActiveFeature(index)}
                aria-label={`Show ${item.eyebrow}`}
                aria-current={index === activeFeature}
                className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${index === activeFeature ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {question ? (
        <section className="relative mt-3 shrink-0 rounded-2xl bg-white p-4 text-slate-800 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.6)]" aria-labelledby="showcase-guide-title">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><GraduationCap className="size-5" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 id="showcase-guide-title" className="text-sm font-semibold">{content.questionTitle ?? "Warm-up question"}</h2>
                <span className="text-[11px] font-medium text-slate-500">{correctCount} correct</span>
              </div>
              <p className="mt-0.5 text-[13px] leading-5 text-slate-600">{question.prompt}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {question.options.map((option, index) => {
                  const state = !answered ? "idle" : index === question.answer ? "correct" : index === selected ? "wrong" : "muted"
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(index)}
                      disabled={answered}
                      aria-pressed={selected === index}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        state === "correct" ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : state === "wrong" ? "border-rose-400 bg-rose-50 text-rose-700"
                            : state === "muted" ? "border-slate-200 text-slate-400"
                              : "border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 empty:hidden" aria-live="polite">
                {answered && (
                  <div className="flex items-center justify-between gap-3">
                    <p className={`flex items-start gap-1.5 text-xs leading-5 ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                      {isCorrect ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> : <XCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />}
                      <span><strong className="font-semibold">{isCorrect ? "Nice work!" : "Not quite."}</strong> {question.explanation}</span>
                    </p>
                    <button type="button" onClick={nextQuestion} className="flex shrink-0 items-center gap-1 rounded text-xs font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      <RotateCcw className="size-3" aria-hidden="true" />Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : content.guide ? (
        <section className="relative mt-3 shrink-0 rounded-2xl bg-white p-4 text-slate-800 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.6)]" aria-labelledby="showcase-guide-title">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><GuideIcon className="size-5" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 id="showcase-guide-title" className="text-sm font-semibold">{content.guide.title}</h2>
                <span className="text-[11px] font-medium text-slate-500">{content.guide.steps.length} steps</span>
              </div>
              <ol className="mt-2 space-y-1.5">
                {content.guide.steps.map(({ title, description }, index) => (
                  <li key={title} className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-semibold text-blue-700">{index + 1}</span>
                    <span className="min-w-0 text-xs leading-5"><strong className="font-semibold">{title}.</strong> <span className="text-slate-600">{description}</span></span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}
    </aside>
  )
}
```

### `auth-split-layout.tsx`

Current file: `src/components/features/auth/shared/auth-split-layout.tsx`

```tsx
import type { ReactNode, RefObject } from "react"
import { BookOpen, Check, Clock3, FileText, Folder, GraduationCap, Grid2X2, KeyRound, MailCheck, Plus, Search, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

type AuthDesignContext = "login" | "register" | "forgot-password" | "password-reset" | "email-verification"

type SceneCard = {
  name: string
  type: string
  tone: string
  icon: LucideIcon
}

type AuthScene = {
  eyebrow: string
  leftCaption: string
  quote: string
  attribution: string
  workspaceEyebrow: string
  workspaceTitle: string
  activeNav: string
  actionLabel: string
  footer: string
  icon: LucideIcon
  cards: SceneCard[]
}

type AuthSplitLayoutProps = {
  context: AuthDesignContext
  title: string
  description?: string
  headingRef: RefObject<HTMLHeadingElement | null>
  footer: ReactNode
  children: ReactNode
}

const scenes: Record<AuthDesignContext, AuthScene> = {
  login: {
    eyebrow: "WELCOME BACK",
    leftCaption: "Pick up where you left off.",
    quote: "A focused learning space makes it easier to pick up where you left off and keep the next goal in sight.",
    attribution: "Maya Chen · Educator",
    workspaceEyebrow: "YOUR LEARNING SPACE",
    workspaceTitle: "My learning space",
    activeNav: "My library",
    actionLabel: "Open library",
    footer: "Your classes, notes, and next steps in one place.",
    icon: BookOpen,
    cards: [
      { name: "Week 04 · Cell structure", type: "Lesson notes", tone: "bg-blue-50 text-blue-600", icon: FileText },
      { name: "The living world", type: "Study guide", tone: "bg-emerald-50 text-emerald-600", icon: BookOpen },
      { name: "Midterm review", type: "Worksheet", tone: "bg-violet-50 text-violet-600", icon: FileText },
    ],
  },
  register: {
    eyebrow: "A NEW CHAPTER",
    leftCaption: "Create a space for what’s next.",
    quote: "Every great learning journey starts with a place to explore, ask questions, and grow at your own pace.",
    attribution: "Maya Chen · Educator",
    workspaceEyebrow: "GETTING STARTED",
    workspaceTitle: "Your space starts here",
    activeNav: "Getting started",
    actionLabel: "Create workspace",
    footer: "Choose your path, then make the space your own.",
    icon: Sparkles,
    cards: [
      { name: "Choose your role", type: "Student or teacher", tone: "bg-blue-50 text-blue-600", icon: Users },
      { name: "Create your space", type: "Made for you", tone: "bg-emerald-50 text-emerald-600", icon: Folder },
      { name: "Set a first goal", type: "One step at a time", tone: "bg-violet-50 text-violet-600", icon: Check },
    ],
  },
  "forgot-password": {
    eyebrow: "ACCOUNT RECOVERY",
    leftCaption: "Get back to your learning space.",
    quote: "Your notes, plans, and learning resources will be here when you’re ready to get back in.",
    attribution: "Maya Chen · Owlio educator",
    workspaceEyebrow: "ACCOUNT ACCESS",
    workspaceTitle: "Find your way back",
    activeNav: "Account recovery",
    actionLabel: "Recovery options",
    footer: "A simple path back to the work that matters to you.",
    icon: KeyRound,
    cards: [
      { name: "Confirm your email", type: "Account detail", tone: "bg-blue-50 text-blue-600", icon: MailCheck },
      { name: "Choose a new password", type: "Security", tone: "bg-amber-50 text-amber-600", icon: KeyRound },
      { name: "Return to learning", type: "Your workspace", tone: "bg-emerald-50 text-emerald-600", icon: BookOpen },
    ],
  },
  "password-reset": {
    eyebrow: "ACCOUNT SECURITY",
    leftCaption: "Protect the space you’re building.",
    quote: "A private, secure sign-in helps protect the lessons, ideas, and goals you keep in Owlio.",
    attribution: "Owlio · Your learning space",
    workspaceEyebrow: "SECURITY SETTINGS",
    workspaceTitle: "Keep your account secure",
    activeNav: "Password & security",
    actionLabel: "Security settings",
    footer: "A safer sign-in for everything you’re learning and creating.",
    icon: ShieldCheck,
    cards: [
      { name: "Create a strong password", type: "Your choice", tone: "bg-blue-50 text-blue-600", icon: KeyRound },
      { name: "Keep your account private", type: "Security", tone: "bg-violet-50 text-violet-600", icon: ShieldCheck },
      { name: "Return to your space", type: "When you’re ready", tone: "bg-emerald-50 text-emerald-600", icon: BookOpen },
    ],
  },
  "email-verification": {
    eyebrow: "EMAIL VERIFICATION",
    leftCaption: "One step closer to getting started.",
    quote: "Confirming your email helps keep your account connected to the learning community you’re building.",
    attribution: "Maya Chen · Educator",
    workspaceEyebrow: "ACCOUNT SETUP",
    workspaceTitle: "Connect your email",
    activeNav: "Verify your email",
    actionLabel: "Continue setup",
    footer: "A connected account keeps your learning space within reach.",
    icon: MailCheck,
    cards: [
      { name: "Check your inbox", type: "Find the Owlio email", tone: "bg-blue-50 text-blue-600", icon: MailCheck },
      { name: "Open the verification link", type: "Confirm your address", tone: "bg-emerald-50 text-emerald-600", icon: Check },
      { name: "Start learning", type: "Your Owlio space", tone: "bg-violet-50 text-violet-600", icon: GraduationCap },
    ],
  },
}

function WorkspacePreview({ scene }: { scene: AuthScene }) {
  return (
    <Card className="mx-auto w-full max-w-[720px] overflow-hidden rounded-xl border border-slate-200/80 bg-white !p-0 shadow-[0_24px_70px_-30px_rgba(31,48,84,0.28)] ring-0">
      <div className="flex min-h-[min(390px,calc(100svh-220px))]">
        <aside className="hidden w-[150px] shrink-0 border-r border-slate-100 bg-white px-3 py-4 min-[860px]:flex min-[860px]:flex-col">
          <div className="flex items-center gap-2 px-2 pb-4 text-[11px] font-bold tracking-[0.12em] text-slate-700">
            <span className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-white"><GraduationCap className="size-4" /></span>
            OWLIO
          </div>
          <div className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</div>
          <div className="space-y-1 text-[10px] text-slate-600">
            <div className="flex items-center gap-2 rounded-md px-2 py-2"><Grid2X2 className="size-3.5" /> Overview</div>
            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-2 py-2 font-semibold text-blue-700"><scene.icon className="size-3.5" /> {scene.activeNav}</div>
            <div className="flex items-center gap-2 rounded-md px-2 py-2"><Users className="size-3.5" /> Shared with me</div>
            <div className="flex items-center gap-2 rounded-md px-2 py-2"><Clock3 className="size-3.5" /> Recent activity</div>
          </div>
          <div className="mt-auto rounded-lg bg-slate-50 p-2.5">
            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-700"><span>Space organized</span><Check className="size-3 text-blue-600" /></div>
            <div className="mt-2 flex gap-1"><span className="h-1 w-12 rounded-full bg-blue-500" /><span className="h-1 w-6 rounded-full bg-blue-200" /><span className="h-1 w-4 rounded-full bg-slate-200" /></div>
            <div className="mt-1.5 text-[8px] text-slate-500">A little progress each day</div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
            <div className="flex items-center gap-2 text-[10px] text-slate-400"><span className="text-slate-700">Owlio</span><span>/</span><span>{scene.workspaceEyebrow}</span></div>
            <div className="flex items-center gap-2 text-slate-400"><Search className="size-3.5" /><span className="hidden size-6 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600 sm:flex">MC</span></div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[9px] font-medium text-slate-400">YOUR OWLIO SPACE</p><h3 className="mt-1 text-base font-semibold tracking-tight text-slate-800 sm:text-lg">{scene.workspaceTitle}</h3></div>
              <div aria-hidden="true" className="flex h-7 shrink-0 items-center gap-1 rounded-md bg-blue-600 px-2 text-[9px] font-semibold text-white"><Plus className="size-3" /> {scene.actionLabel}</div>
            </div>
            <div className="mt-5 flex items-center justify-between border-b border-slate-100 text-[9px]">
              <div className="flex gap-4"><span className="border-b-2 border-blue-600 pb-2 font-semibold text-blue-700">Overview</span><span className="pb-2 text-slate-500">My space</span><span className="hidden pb-2 text-slate-500 sm:block">Resources</span></div>
              <span className="mb-1 rounded border border-slate-200 px-1.5 py-1 text-slate-500">For you</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {scene.cards.map(({ name, type, tone, icon: Icon }) => (
                <div key={name} className="min-w-0 rounded-lg border border-slate-100 bg-white p-2.5 sm:p-3">
                  <div className={`flex size-7 items-center justify-center rounded-md ${tone}`}><Icon className="size-3.5" /></div>
                  <p className="mt-3 truncate text-[9px] font-semibold text-slate-700">{name}</p>
                  <p className="mt-1 truncate text-[8px] text-slate-400">{type}</p>
                </div>
              ))}
              <div className="hidden rounded-lg border border-dashed border-slate-200 p-3 sm:block"><div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-600"><Sparkles className="size-3.5" /></div><p className="mt-3 text-[9px] font-semibold text-slate-700">Make it yours</p><p className="mt-1 text-[8px] text-slate-400">One step at a time</p></div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50/70 px-3 py-2.5 text-[9px] text-blue-800"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white"><scene.icon className="size-3 text-blue-600" /></span><span>{scene.footer}</span></div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function AuthSplitLayout({ context, title, description, headingRef, footer, children }: AuthSplitLayoutProps) {
  const scene = scenes[context]
  const SceneIcon = scene.icon

  return (
    <div className="min-h-svh bg-white">
      <div className="grid min-h-svh grid-cols-1 md:grid-cols-[46%_54%]">
        <main className="relative flex min-h-svh min-w-0 flex-col overflow-hidden dark:bg-none dark:bg-background bg-[linear-gradient(135deg,#ffffff_10%,#f9fbff_58%,#f7f5ff_100%)] px-5 pb-6 pt-6 sm:px-10 md:px-8 lg:px-[8%]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-28 top-24 size-64 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="absolute -bottom-20 right-[-4rem] size-64 rounded-full bg-violet-100/50 blur-3xl" />
          </div>
          <div className="relative z-10 mb-6 flex items-center gap-2.5 font-semibold tracking-tight text-slate-900 md:hidden" aria-label="Owlio">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white"><GraduationCap className="size-5" /></span>
            <span className="text-xl">owlio<span className="text-blue-600">.</span></span>
          </div>
          <div className="relative z-10 flex flex-1 items-center justify-center py-4">
            <section className="w-full max-w-[400px]">
              <div className="mb-6 flex items-center gap-3">
                <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 text-blue-700 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.5)]">
                  <SceneIcon className="size-5" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-emerald-400" />
                </div>
                <div className="min-w-0 rounded-xl border border-white/90 bg-white/75 px-3 py-2 shadow-sm backdrop-blur-sm">
                  <p className="text-[9px] font-bold tracking-[0.14em] text-blue-700">{scene.eyebrow}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{scene.leftCaption}</p>
                  <div className="mt-2 flex gap-1" aria-hidden="true"><span className="h-1 w-8 rounded-full bg-blue-300" /><span className="h-1 w-4 rounded-full bg-violet-200" /><span className="h-1 w-2 rounded-full bg-slate-200" /></div>
                </div>
              </div>
              <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">{title}</h1>
              {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
              <div className={description ? "mt-5" : "mt-6"}>{children}</div>
            </section>
          </div>
          <footer className="relative z-10 mt-auto pt-5 text-center text-xs text-slate-500 sm:text-sm">{footer}</footer>
        </main>
        <aside className="relative hidden min-h-svh flex-col overflow-hidden dark:bg-none dark:bg-card bg-[linear-gradient(145deg,#f1f5ff_0%,#f2f4fc_52%,#fff5ef_100%)] px-8 pb-6 pt-8 md:flex lg:px-[8.5%]" aria-label={`${scene.eyebrow.toLowerCase()} preview`}>
          <div className="pointer-events-none absolute -right-24 top-10 size-80 rounded-full bg-blue-200/20 blur-3xl" />
          <figure className="relative z-10 mx-auto w-full max-w-[600px]">
            <div className="mb-3 flex items-center gap-2 text-[9px] font-bold tracking-[0.14em] text-blue-700"><span className="flex size-6 items-center justify-center rounded-full bg-white shadow-sm"><SceneIcon className="size-3.5" /></span>{scene.eyebrow}</div>
            <blockquote className="max-w-[520px] text-sm font-semibold leading-5 text-slate-700">{scene.quote}</blockquote>
            <figcaption className="mt-2 text-[10px] text-slate-500">— {scene.attribution}</figcaption>
          </figure>
          <div className="relative z-10 mt-8 w-full flex-1">
            <WorkspacePreview scene={scene} />
          </div>
          <p className="relative z-10 mx-auto mt-3 w-full max-w-[600px] text-[10px] text-slate-400">{scene.footer}</p>
        </aside>
      </div>
    </div>
  )
}
```

### `auth-status-page.tsx`

Current file: `src/components/features/auth/shared/auth-status-page.tsx`

```tsx
import type { ReactNode } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthFeedback } from "./auth-feedback"

type AuthStatusPanelProps = {
  statusTitle: string
  status: ReactNode
  actionLabel: string
  actionTo: string
  preview?: boolean
}

export function AuthStatusPanel({ statusTitle, status, actionLabel, actionTo, preview = true }: AuthStatusPanelProps) {
  return (
    <div className="space-y-5">
      <AuthFeedback title={statusTitle} tone="success" preview={preview}>{status}</AuthFeedback>
      <Button render={<Link to={actionTo} />} className="h-11 w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
        {actionLabel}
      </Button>
    </div>
  )
}
```

### `development-action-path.ts`

Current file: `src/components/features/auth/shared/development-action-path.ts`

```ts
const allowedActionPaths = new Set(['/auth/email-verification', '/auth/password-reset'])

export function getDevelopmentActionPath(actionUrl?: string) {
  if (!import.meta.env.DEV || !actionUrl) return null

  try {
    const url = new URL(actionUrl, window.location.origin)
    if (url.origin !== window.location.origin || !allowedActionPaths.has(url.pathname)) return null
    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
}
```

### `google-auth-button.test.tsx`

Current file: `src/components/features/auth/shared/google-auth-button.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GoogleAuthButton } from './google-auth-button'

afterEach(cleanup)

describe('GoogleAuthButton', () => {
  it('starts the Google flow when activated', () => {
    const onClick = vi.fn()
    render(<GoogleAuthButton onClick={onClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not start the flow while disabled', () => {
    const onClick = vi.fn()
    render(<GoogleAuthButton onClick={onClick} disabled />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
```

### `google-auth-button.tsx`

Current file: `src/components/features/auth/shared/google-auth-button.tsx`

```tsx
import StackIcon from 'tech-stack-icons'
import { Button } from '@/components/ui/button'

type GoogleAuthButtonProps = {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export function GoogleAuthButton({
  onClick,
  disabled = false,
  label = 'Continue with Google',
}: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className="h-11 w-full justify-center rounded-lg border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:bg-slate-50"
    >
      <StackIcon name="google" className="size-4" aria-hidden="true" />
      {label}
    </Button>
  )
}
```

### `owlio-owl.tsx`

Current file: `src/components/features/auth/shared/owlio-owl.tsx`

```tsx
import { useEffect, useRef, type CSSProperties } from "react"
import { cn } from "cn"

type OwlioOwlProps = {
  className?: string
}

const image = { src: "/mascot/owlio-owl.png", width: 385, height: 420 }

const eyes = [
  { side: "left", cx: 143, cy: 169, rx: 35, ry: 34 },
  { side: "right", cx: 245.5, cy: 141.5, rx: 29, ry: 33 },
] as const

const percent = (value: number) => `${(value * 100).toFixed(3)}%`
const clamp = (value: number) => Math.max(-1, Math.min(1, value))

function eyeGeometry({ cx, cy, rx, ry }: (typeof eyes)[number]) {
  const left = cx - rx
  const top = cy - ry
  const width = rx * 2
  const height = ry * 2

  return {
    eye: { left: percent(left / image.width), top: percent(top / image.height), width: percent(width / image.width), height: percent(height / image.height) } satisfies CSSProperties,
    iris: { left: percent(-left / width), top: percent(-top / height), width: percent(image.width / width), height: percent(image.height / height) } satisfies CSSProperties,
  }
}

export function OwlioOwl({ className }: OwlioOwlProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timers = new Set<number>()
    const later = (callback: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        callback()
      }, delay)
      timers.add(id)
    }

    const blink = (again: boolean) => {
      root.dataset.blink = "true"
      later(() => {
        delete root.dataset.blink
        if (again) later(() => blink(false), 170)
      }, 130)
    }

    const scheduleBlink = () => later(() => {
      blink(Math.random() < 0.25)
      scheduleBlink()
    }, 2200 + Math.random() * 3600)

    let frame = 0
    let pointerX = 0
    let pointerY = 0

    const look = (x: number, y: number) => {
      root.style.setProperty("--gaze-x", x.toFixed(3))
      root.style.setProperty("--gaze-y", y.toFixed(3))
    }

    const update = () => {
      frame = 0
      const rect = root.getBoundingClientRect()
      look(
        clamp((pointerX - (rect.left + rect.width * 0.5)) / (window.innerWidth * 0.4)),
        clamp((pointerY - (rect.top + rect.height * 0.37)) / (window.innerHeight * 0.4)),
      )
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const rest = () => look(0, 0)

    scheduleBlink()
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", rest)

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      window.cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onPointerMove)
      document.documentElement.removeEventListener("pointerleave", rest)
      delete root.dataset.blink
      rest()
    }
  }, [])

  return (
    <div ref={rootRef} className={cn("group/owl pointer-events-none relative aspect-[385/420] select-none [-webkit-user-drag:none]", className)} aria-hidden="true" onDragStart={(event) => event.preventDefault()}>
      <img src={image.src} width={image.width} height={image.height} alt="" draggable={false} className="absolute inset-0 size-full drop-shadow-[0_18px_30px_rgba(23,37,84,0.35)]" />
      {eyes.map((eye) => {
        const geometry = eyeGeometry(eye)
        return (
          <span key={eye.side} className="absolute overflow-hidden rounded-full bg-[#f6f4fb]" style={geometry.eye}>
            <img src={image.src} alt="" draggable={false} className="absolute max-w-none translate-x-[calc(var(--gaze-x,0)*1.25%)] translate-y-[calc(var(--gaze-y,0)*0.9%)] transition-transform duration-200 ease-out motion-reduce:transition-none" style={geometry.iris} />
            <span className="absolute -left-[4%] -right-[4%] -top-[2%] h-[62%] -translate-y-[104%] rounded-b-[50%_46%] border-b-[3px] border-[#1e1b3a] bg-linear-to-b from-[#d9d2e4] via-[#ece6ef] via-70% to-[#f3eef3] transition-transform duration-100 ease-in-out group-data-[blink=true]/owl:translate-y-0 group-data-[blink=true]/owl:duration-75 motion-reduce:transition-none" />
            <span className="absolute -bottom-[2%] -left-[4%] -right-[4%] h-[46%] translate-y-[104%] bg-linear-to-t from-[#fdf8f6] to-[#f6f0f3] transition-transform duration-100 ease-in-out group-data-[blink=true]/owl:translate-y-0 group-data-[blink=true]/owl:duration-75 motion-reduce:transition-none" />
          </span>
        )
      })}
    </div>
  )
}
```

### `password-field.tsx`

Current file: `src/components/features/auth/shared/password-field.tsx`

```tsx
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError } from "@/components/ui/field"
import { authInputClassName } from "./auth-input-styles"

type PasswordFieldProps = {
  id: string
  label: string
  placeholder: string
  autoComplete: "current-password" | "new-password"
  registration: UseFormRegisterReturn
  error?: string
  description?: string
}

export function PasswordField({ id, label, placeholder, autoComplete, registration, error, description }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`
  const descriptionId = description ? `${id}-description` : undefined
  const describedBy = [error ? errorId : null, descriptionId].filter(Boolean).join(" ") || undefined

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${authInputClassName} pr-12`}
          {...registration}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1.5 top-0 bottom-0 my-auto text-slate-500 active:!translate-y-0"
          aria-label={visible ? `Hide ${label.toLocaleLowerCase()}` : `Show ${label.toLocaleLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {description && <p id={descriptionId} className="text-xs leading-5 text-muted-foreground">{description}</p>}
      <FieldError errors={[error ? { message: error } : undefined]} id={errorId} />
    </div>
  )
}
```

### `password-guidance.tsx`

Current file: `src/components/features/auth/shared/password-guidance.tsx`

```tsx
export function PasswordGuidance() {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      Use at least 8 characters and no more than 72 UTF-8 bytes. The server remains authoritative for password validation.
    </p>
  )
}
```

### `password-rules.ts`

Current file: `src/components/features/auth/shared/password-rules.ts`

```ts
import { z } from "zod"

export const passwordSchema = z.string().min(8, "Use at least 8 characters.").superRefine((password, context) => {
  if (new TextEncoder().encode(password).length > 72) {
    context.addIssue({ code: "custom", message: "Password must be no more than 72 UTF-8 bytes." })
  }
})
```

### `session-expired-state.tsx`

Current file: `src/components/features/auth/shared/session-expired-state.tsx`

```tsx
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthFeedback } from "./auth-feedback"

type SessionExpiredStateProps = {
  onReturn: () => void
}

export function SessionExpiredState({ onReturn }: SessionExpiredStateProps) {
  return (
    <div className="space-y-5">
      <AuthFeedback title="Your session has ended" preview>
        This is a sign-in screen preview. No session was checked or ended here.
      </AuthFeedback>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={onReturn}>Return to sign in</Button>
        <Button type="button" variant="outline" render={<Link to="/forgot-password" />}>Reset password</Button>
      </div>
    </div>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
