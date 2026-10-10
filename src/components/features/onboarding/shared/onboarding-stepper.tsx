import { ONBOARDING_STEPS } from "../onboarding.constants"
import type { StepId } from "../onboarding.types"

type OnboardingStepperProps = {
  activeStep?: StepId
}

export function OnboardingStepper({ activeStep }: OnboardingStepperProps) {
  const activeIndex = activeStep ? ONBOARDING_STEPS.findIndex(({ id }) => id === activeStep) : ONBOARDING_STEPS.length

  return (
    <div className="mt-6 sm:mt-8">
      <p className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground sm:text-sm">
        {activeStep ? (
          <>
            <span>Step {activeIndex + 1} of {ONBOARDING_STEPS.length}</span>
            <span className="text-foreground sm:hidden">{ONBOARDING_STEPS[activeIndex].label}</span>
          </>
        ) : (
          <span>Setup complete</span>
        )}
      </p>
      <ol className="grid grid-cols-4 gap-2" aria-label="Onboarding progress">
        {ONBOARDING_STEPS.map(({ id, label }, index) => {
          const isActive = index === activeIndex
          const isComplete = index < activeIndex
          return (
            <li key={id} className="min-w-0" aria-current={isActive ? "step" : undefined}>
              <span
                className={`block h-1.5 rounded-full transition-colors ${
                  isActive ? "bg-indigo-600" : isComplete ? "bg-indigo-400" : "bg-slate-200"
                }`}
                aria-hidden="true"
              />
              <span
                className={`mt-2 hidden truncate text-xs sm:block ${
                  isActive ? "font-semibold text-foreground" : isComplete ? "text-slate-600" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              <span className="sr-only sm:hidden">{label}</span>
              <span className="sr-only">{isComplete ? " (completed)" : isActive ? " (current)" : ""}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
