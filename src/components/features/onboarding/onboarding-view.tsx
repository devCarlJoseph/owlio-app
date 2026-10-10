import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm, useWatch, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card } from "@/components/ui/card"
import { ONBOARDING_STEPS } from "./onboarding.constants"
import { entityDetailsSchema, entitySelectionSchema, onboardingFormSchema, profileBasicsSchema } from "./onboarding.schema"
import type { Entity, OnboardingFormValues, StepId } from "./onboarding.types"
import { OnboardingCompleted } from "./completed/onboarding-completed"
import { EducatorDetailsStep } from "./educator/educator-details-step"
import { EntitySelectStep } from "./entity-select/entity-select-step"
import { OthersDetailsStep } from "./others/others-details-step"
import { ProfileBasicsStep } from "./profile-basics/profile-basics-step"
import { ReviewStep } from "./review/review-step"
import { OnboardingLayout } from "./shared/onboarding-layout"
import { StepActions } from "./shared/step-actions"
import { StudentDetailsStep } from "./student/student-details-step"

const stepOrder: StepId[] = ["entity", "profile", "details", "review"]
const fieldsByStep: Record<StepId, FieldPath<OnboardingFormValues>[]> = {
  entity: ["entity"],
  profile: ["displayName", "timezone", "preferredLanguage"],
  details: [
    "educationLevel",
    "interests",
    "studyGoals",
    "classCode",
    "teachingContext",
    "institutionName",
    "subjectsTaught",
    "gradeLevels",
    "othersSubtype",
    "languagesOrSubjects",
    "learnerLevels",
    "sessionFormats",
    "availability",
  ],
  review: [],
}

function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function hasAnswers(value: unknown) {
  if (Array.isArray(value)) return value.length > 0
  return typeof value === "string" && value.trim().length > 0
}

function hasEntityDetails(values: OnboardingFormValues) {
  return [
    values.educationLevel,
    values.interests,
    values.studyGoals,
    values.classCode,
    values.teachingContext,
    values.institutionName,
    values.subjectsTaught,
    values.gradeLevels,
    values.othersSubtype,
    values.languagesOrSubjects,
    values.learnerLevels,
    values.sessionFormats,
    values.availability,
  ].some(hasAnswers)
}

export function OnboardingView() {
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      entity: undefined,
      displayName: "",
      timezone: browserTimezone(),
      preferredLanguage: "",
      educationLevel: undefined,
      interests: [],
      studyGoals: [],
      classCode: "",
      teachingContext: undefined,
      institutionName: "",
      subjectsTaught: [],
      gradeLevels: [],
      othersSubtype: undefined,
      languagesOrSubjects: [],
      learnerLevels: [],
      sessionFormats: [],
      availability: [],
    },
    mode: "onTouched",
    shouldUnregister: false,
  })
  const entity = useWatch({ control: form.control, name: "entity" })
  const [step, setStep] = useState<StepId>("entity")
  const [returnToReview, setReturnToReview] = useState<StepId | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const stepInfo = ONBOARDING_STEPS.find(({ id }) => id === step)!

  useEffect(() => {
    headingRef.current?.focus()
  }, [step, isDone])

  function resetEntityDetails() {
    form.setValue("educationLevel", undefined)
    form.setValue("interests", [])
    form.setValue("studyGoals", [])
    form.setValue("classCode", "")
    form.setValue("teachingContext", undefined)
    form.setValue("institutionName", "")
    form.setValue("subjectsTaught", [])
    form.setValue("gradeLevels", [])
    form.setValue("othersSubtype", undefined)
    form.setValue("languagesOrSubjects", [])
    form.setValue("learnerLevels", [])
    form.setValue("sessionFormats", [])
    form.setValue("availability", [])
    form.clearErrors(fieldsByStep.details)
  }

  function selectEntity(nextEntity: Entity) {
    if (entity === nextEntity) return
    if (entity && hasEntityDetails(form.getValues())) {
      const shouldChange = window.confirm("Changing your role will clear your role-specific answers. Your profile basics will be kept. Continue?")
      if (!shouldChange) return
      resetEntityDetails()
      setReturnToReview(null)
    }
    form.setValue("entity", nextEntity, { shouldDirty: true, shouldValidate: true })
    form.clearErrors("entity")
  }

  async function validateCurrentStep() {
    const fields = fieldsByStep[step]
    form.clearErrors(fields)
    const valid = await form.trigger(fields)
    if (!valid) return false

    const values = form.getValues()
    const schema = step === "entity"
      ? entitySelectionSchema
      : step === "profile"
        ? profileBasicsSchema
        : step === "details"
          ? entityDetailsSchema
          : null
    if (!schema) return true

    const result = schema.safeParse(values)
    if (result.success) return true

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0]
      if (typeof fieldName === "string" && fieldName in values) {
        form.setError(fieldName as FieldPath<OnboardingFormValues>, {
          type: "manual",
          message: issue.message,
        })
      }
    }
    return false
  }

  async function goNext() {
    if (!(await validateCurrentStep())) return
    if (step === "review") {
      setIsFinishing(true)
      window.setTimeout(() => {
        setIsFinishing(false)
        setIsDone(true)
      }, 650)
      return
    }
    if (returnToReview === step) {
      setReturnToReview(null)
      setStep("review")
      return
    }
    setStep(stepOrder[stepOrder.indexOf(step) + 1])
  }

  function goBack() {
    const currentIndex = stepOrder.indexOf(step)
    if (currentIndex > 0) {
      setReturnToReview(null)
      form.clearErrors()
      setStep(stepOrder[currentIndex - 1])
    }
  }

  function editStep(target: StepId) {
    setReturnToReview(target)
    setStep(target)
  }

  if (isDone && entity) {
    return <OnboardingCompleted entity={entity} values={form.getValues()} headingRef={headingRef} />
  }

  const content = step === "entity"
    ? <EntitySelectStep value={entity} error={form.formState.errors.entity?.message} onSelect={selectEntity} />
    : step === "profile"
      ? <ProfileBasicsStep />
      : step === "details"
        ? entity === "student"
          ? <StudentDetailsStep />
          : entity === "educator"
            ? <EducatorDetailsStep />
            : entity === "others"
              ? <OthersDetailsStep />
              : <Card className="border-dashed p-5 text-sm text-muted-foreground shadow-none">Choose a role to see your details.</Card>
        : <ReviewStep values={form.getValues()} onEdit={editStep} />

  return (
    <FormProvider {...form}>
      <form onSubmit={(event) => event.preventDefault()}>
        <OnboardingLayout
          activeStep={step}
          title={stepInfo.title}
          description={stepInfo.description}
          headingRef={headingRef}
          actions={(
            <StepActions
              onBack={step === "entity" ? undefined : goBack}
              onNext={goNext}
              nextLabel={step === "review" ? "Finish" : "Continue"}
              nextDisabled={step === "entity" && !entity}
              isFinishing={isFinishing}
            />
          )}
        >
          {content}
        </OnboardingLayout>
      </form>
    </FormProvider>
  )
}
