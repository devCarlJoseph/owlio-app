import { Check } from "lucide-react"
import { ONBOARDING_STEPS } from "../onboarding.constants"
import type { StepId } from "../onboarding.types"

type OnboardingStepperProps = {
  activeStep: StepId
}

export function OnboardingStepper({ activeStep }: OnboardingStepperProps) {
  const activeIndex = ONBOARDING_STEPS.findIndex(({ id }) => id === activeStep)
  const progress = ((activeIndex + 1) / ONBOARDING_STEPS.length) * 100

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-7 sm:px-8 sm:pt-9">
      <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
        Step {activeIndex + 1} of {ONBOARDING_STEPS.length}
      </p>
      <ol className="flex items-start justify-between gap-2" aria-label="Onboarding progress">
        {ONBOARDING_STEPS.map(({ id, label }, index) => {
          const isActive = index === activeIndex
          const isComplete = index < activeIndex
          return (
            <li
              key={id}
              className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center text-xs sm:text-sm"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full border text-xs font-semibold ${
                  isComplete || isActive
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-border bg-background text-muted-foreground"
                }`}
                aria-hidden="true"
              >
                {isComplete ? <Check className="size-4" /> : index + 1}
              </span>
              <span className={isActive ? "font-semibold text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
            </li>
          )
        })}
      </ol>
      <div
        className="mt-4 h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="h-full rounded-full bg-indigo-600 transition-[width]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
