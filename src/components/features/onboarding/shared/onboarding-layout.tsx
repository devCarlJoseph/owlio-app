import type { ReactNode, RefObject } from "react"
import { BookOpenCheck } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { OnboardingStepper } from "./onboarding-stepper"
import type { StepId } from "../onboarding.types"

type OnboardingLayoutProps = {
  activeStep?: StepId
  title: string
  description: string
  headingRef: RefObject<HTMLHeadingElement | null>
  children: ReactNode
  actions?: ReactNode
}

export function OnboardingLayout({
  activeStep,
  title,
  description,
  headingRef,
  children,
  actions,
}: OnboardingLayoutProps) {
  return (
    <main className="min-h-screen bg-background pb-10 sm:pb-14">
      <header className="mx-auto flex w-full max-w-6xl items-center px-5 pt-5 sm:px-8 sm:pt-7">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-950" aria-label="Owlio">
          <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            <BookOpenCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl">owlio<span className="text-indigo-600">.</span></span>
        </div>
      </header>
      {activeStep && <OnboardingStepper activeStep={activeStep} />}
      <section className="mx-auto mt-7 w-full max-w-4xl px-4 sm:mt-9 sm:px-8" aria-labelledby="onboarding-step-heading">
        <Card className="overflow-visible rounded-2xl border border-border/70 shadow-sm">
          <CardHeader className="gap-2 px-5 pt-6 sm:px-9 sm:pt-9">
            <h1
              ref={headingRef}
              id="onboarding-step-heading"
              tabIndex={-1}
              className="text-2xl font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-3xl"
            >
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </CardHeader>
          <CardContent className="px-5 pb-6 pt-5 sm:px-9 sm:pb-8 sm:pt-7">
            {children}
          </CardContent>
          {actions && <CardFooter className="border-t border-border/70 px-5 py-4 sm:px-9 sm:py-5">{actions}</CardFooter>}
        </Card>
      </section>
    </main>
  )
}
