import type { RefObject } from "react"
import { ArrowRight, BookOpenCheck, Check, GraduationCap, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OnboardingLayout } from "../shared/onboarding-layout"
import type { Entity, OnboardingFormValues } from "../onboarding.types"

type OnboardingCompletedProps = {
  entity: Entity
  values: OnboardingFormValues
  headingRef: RefObject<HTMLHeadingElement | null>
}

const destination = {
  student: { label: "Personal workspace", icon: BookOpenCheck, title: "Your learning space starts here" },
  educator: { label: "Educator dashboard", icon: School, title: "Your teaching workspace starts here" },
  others: { label: "Educator dashboard", icon: GraduationCap, title: "Flexible learning starts here" },
}

export function OnboardingCompleted({ entity, values, headingRef }: OnboardingCompletedProps) {
  const nextStep = destination[entity]
  const Icon = nextStep.icon

  return (
    <OnboardingLayout
      title={nextStep.title}
      description={`Welcome to Owlio${values.displayName ? `, ${values.displayName}` : ""}. This is your starting point.`}
      headingRef={headingRef}
      mascotState="complete"
      eyebrow={(
        <div className="mb-6 flex items-center" aria-hidden="true">
          <span className="flex size-14 -rotate-6 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-4 ring-white">
            <Icon className="size-7" />
          </span>
          <span className="-ml-3 flex size-12 rotate-6 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
            <BookOpenCheck className="size-6" />
          </span>
          <span className="-ml-3 flex size-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 ring-4 ring-white">
            <Check className="size-4" strokeWidth={3} />
          </span>
        </div>
      )}
    >
      <div className="max-w-md">
        <p className="text-sm leading-6 text-muted-foreground">
          {entity === "student"
            ? "Build your personal learning workspace and make progress at your own pace, with or without a class."
            : "Bring your teaching, lessons, and learner progress together in Owlio."}
        </p>
        <div className="mt-7">
          <Button
            type="button"
            disabled
            className="h-11 w-full rounded-lg bg-indigo-600 px-6 text-white shadow-sm shadow-indigo-600/20 sm:w-auto"
            aria-describedby="destination-unavailable"
          >
            {nextStep.label} <ArrowRight aria-hidden="true" />
          </Button>
          <p id="destination-unavailable" className="mt-2 text-xs text-muted-foreground">
            This destination is not part of the current onboarding flow.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}
