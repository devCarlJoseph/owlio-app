import type { ReactNode, RefObject } from "react"
import { BookOpenCheck, CircleHelp } from "lucide-react"
import { OwlioMascot, type OwlioMascotState } from "@/components/common/owlio-mascot/owlio-mascot"
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
  mascotState?: OwlioMascotState
  mascotReplayKey?: number
}

export function OnboardingLayout({
  activeStep,
  title,
  description,
  headingRef,
  eyebrow,
  children,
  actions,
  mascotState = "idle",
  mascotReplayKey = 0,
}: OnboardingLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 sm:p-6 lg:p-8">
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl bg-background sm:min-h-[calc(100vh-3rem)] sm:rounded-3xl sm:shadow-sm sm:ring-1 sm:ring-slate-200/80 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-6 lg:p-6">
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

          <div className="mt-3 flex items-center gap-3 lg:absolute lg:inset-y-6 lg:right-6 lg:mt-0 lg:w-[calc(41.18%-2.5rem)] lg:flex-col lg:justify-center lg:gap-3 lg:rounded-2xl lg:bg-slate-50 lg:px-6 lg:py-8 lg:text-center lg:ring-1 lg:ring-slate-200/80">
            <div className="w-24 shrink-0 sm:w-28 lg:w-full lg:max-w-72">
              <OwlioMascot state={mascotState} replayKey={mascotReplayKey} size="100%" />
            </div>
            <div className="max-w-56">
              <p className="text-sm font-semibold text-slate-900 lg:text-lg">{activeStep ? "A little setup. A great start." : "You're ready to spread your wings."}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground lg:mt-2 lg:text-sm">{activeStep ? "Make Owlio feel like your own, one step at a time." : "Here's to everything you'll learn and share."}</p>
            </div>
          </div>

          <section className="mt-4 flex flex-1 flex-col lg:mt-8" aria-labelledby="onboarding-step-heading">
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
            <div key={activeStep ?? "complete"} className="onboarding-content-enter mt-6 flex-1 pb-6">
              {children}
            </div>
            {actions && (
              <div className="sticky bottom-0 -mx-5 border-t border-border/70 bg-background px-5 py-4 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-2 lg:pb-2 lg:backdrop-blur-none">
                {actions}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
