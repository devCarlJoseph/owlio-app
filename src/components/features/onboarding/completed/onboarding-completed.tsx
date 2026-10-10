import type { RefObject } from "react"
import { BookOpenCheck, GraduationCap, School } from "lucide-react"
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
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700" aria-hidden="true">
          <Icon className="size-8" />
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          {entity === "student"
            ? "Build your personal learning workspace and make progress at your own pace, with or without a class."
            : "Bring your teaching, lessons, and learner progress together in Owlio."}
        </p>
        <div className="mt-7 w-full max-w-sm">
          <Button
            type="button"
            disabled
            className="w-full rounded-lg bg-indigo-600 text-white"
            aria-describedby="destination-unavailable"
          >
            {nextStep.label}
          </Button>
          <p id="destination-unavailable" className="mt-2 text-xs text-muted-foreground">
            This destination is not part of the current onboarding flow.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}
