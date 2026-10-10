import type { ReactNode, RefObject } from "react"
import { BookOpen, BookOpenCheck, CircleHelp, GraduationCap, Languages, School } from "lucide-react"
import { OnboardingStepper } from "./onboarding-stepper"
import type { StepId } from "../onboarding.types"

type OnboardingLayoutProps = {
  activeStep?: StepId
  title: string
  description: string
  headingRef: RefObject<HTMLHeadingElement | null>
  eyebrow?: ReactNode
  children: ReactNode
  actions?: ReactNode
}

function LearningMotif() {
  return (
    <aside
      className="relative hidden overflow-hidden rounded-2xl bg-linear-to-br from-indigo-50 via-white to-slate-50 ring-1 ring-indigo-100 lg:flex lg:items-center lg:justify-center"
      aria-hidden="true"
    >
      <span className="absolute top-12 left-14 size-2.5 rounded-full bg-indigo-300" />
      <span className="absolute top-24 right-16 size-2 rounded-full bg-slate-300" />
      <span className="absolute bottom-20 left-20 size-2 rounded-full bg-indigo-200" />
      <span className="absolute right-24 bottom-32 size-3 rounded-full bg-indigo-400/60" />
      <span className="absolute top-1/3 left-10 h-px w-24 bg-linear-to-r from-transparent via-indigo-200 to-transparent" />
      <span className="absolute right-8 bottom-1/3 h-px w-28 bg-linear-to-r from-transparent via-slate-200 to-transparent" />

      <div className="relative w-full max-w-xs">
        <div className="absolute inset-x-8 -top-6 h-40 -rotate-6 rounded-2xl bg-white/70 shadow-sm ring-1 ring-slate-200/70" />
        <div className="absolute inset-x-4 -top-3 h-40 rotate-3 rounded-2xl bg-white/85 shadow-sm ring-1 ring-slate-200/70" />
        <div className="relative rounded-2xl bg-white p-5 shadow-lg shadow-indigo-600/5 ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
              <BookOpen className="size-5" />
            </span>
            <div className="flex-1 space-y-2">
              <span className="block h-2.5 w-3/4 rounded-full bg-slate-200" />
              <span className="block h-2 w-1/2 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            <span className="block h-2 w-full rounded-full bg-slate-100" />
            <span className="block h-2 w-5/6 rounded-full bg-slate-100" />
            <span className="block h-2 w-2/3 rounded-full bg-slate-100" />
          </div>
          <div className="mt-5 flex items-center gap-2">
            <span className="h-1.5 flex-1 rounded-full bg-indigo-600" />
            <span className="h-1.5 flex-1 rounded-full bg-indigo-600" />
            <span className="h-1.5 flex-1 rounded-full bg-indigo-200" />
            <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          {[GraduationCap, School, Languages].map((Icon, index) => (
            <span key={index} className="flex size-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
              <Icon className="size-5" />
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function OnboardingLayout({
  activeStep,
  title,
  description,
  headingRef,
  eyebrow,
  children,
  actions,
}: OnboardingLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl bg-background sm:min-h-[calc(100vh-3rem)] sm:rounded-3xl sm:shadow-sm sm:ring-1 sm:ring-slate-200/80 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-6 lg:p-6">
        <div className="flex min-w-0 flex-col px-5 pt-5 sm:px-8 sm:pt-7 lg:px-4 lg:pt-2">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-950" aria-label="Owlio">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                <BookOpenCheck className="size-5" aria-hidden="true" />
              </span>
              <span className="text-xl">owlio<span className="text-indigo-600">.</span></span>
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <CircleHelp className="size-4" aria-hidden="true" />
              Need help?
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                Soon<span className="sr-only"> — help center coming later</span>
              </span>
            </p>
          </header>

          <OnboardingStepper activeStep={activeStep} />

          <section className="mt-8 flex flex-1 flex-col sm:mt-10" aria-labelledby="onboarding-step-heading">
            {eyebrow}
            <h1
              ref={headingRef}
              id="onboarding-step-heading"
              tabIndex={-1}
              className="rounded-md text-3xl font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 sm:text-4xl"
            >
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
            <div className="mt-7 flex-1 pb-8 sm:mt-8">
              {children}
            </div>
            {actions && (
              <div className="sticky bottom-0 -mx-5 border-t border-border/70 bg-background/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-2 lg:pb-2 lg:backdrop-blur-none">
                {actions}
              </div>
            )}
          </section>
        </div>
        <LearningMotif />
      </div>
    </main>
  )
}
