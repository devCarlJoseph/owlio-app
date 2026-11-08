# Onboarding component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(onboarding): add organized onboarding source copies`

Target: `src/components/features/onboarding/`. Paths below are proposals; keep existing step identity and validation intact. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `onboarding.constants.ts` (check whether a constant is a validation rule before moving it) |
| `forms/` | `onboarding.schema.ts` |
| `educator/forms/` | `educator-details-step.tsx` |
| `entity-select/forms/`, `entity-select/ui/` | `entity-select-step.tsx` -> forms; `entity-card.tsx` -> ui |
| `others/forms/` | `others-details-step.tsx` |
| `profile-basics/forms/` | `profile-basics-step.tsx` |
| `review/forms/` | `review-step.tsx` |
| `student/forms/` | `student-details-step.tsx` |
| `shared/ui/` | `choice-checkbox-group.tsx`, `field-error.tsx`, `onboarding-layout.tsx`, `onboarding-stepper.tsx`, `optional-badge.tsx`, `step-actions.tsx`, `tag-input.tsx` |
| `completed/view/` | `onboarding-completed.tsx` |
| `view/` | `onboarding-view.tsx`, `onboarding-view.test.tsx` |
| Root contract | `onboarding.types.ts` |

The plan preserves existing nested step directories (`educator`, `student`, `others`, etc.) and adds a folder inside each, rather than moving every step into one root `forms/`. Do not create both copies. Onboarding choices are browser-local and do not assign authenticated roles; keep completion messaging honest.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/onboarding/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { RequireOnboarding } from "@/components/common/require-onboarding"
import { OnboardingView } from "@/components/features/onboarding/onboarding-view"

export default function OnboardingPage() {
  return (
    <RequireOnboarding needsOnboarding={true}>
      <OnboardingView />
    </RequireOnboarding>
  )
}
```

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/onboarding/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### Nested feature guides

- [`completed/`](completed/README.md)
- [`educator/`](educator/README.md)
- [`entity-select/`](entity-select/README.md)
- [`others/`](others/README.md)
- [`profile-basics/`](profile-basics/README.md)
- [`review/`](review/README.md)
- [`shared/`](shared/README.md)
- [`student/`](student/README.md)

### `onboarding-view.test.tsx`

Current file: `src/components/features/onboarding/onboarding-view.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OnboardingView } from "./onboarding-view"

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("onboarding mascot integration", () => {
  it("reacts once per new choice and only hops after successful validation", async () => {
    const { container } = render(<OnboardingView />)
    const scene = () => container.querySelector(".owlio-mascot-scene")!
    expect(scene().getAttribute("data-state")).toBe("welcome")
    fireEvent.click(screen.getByRole("radio", { name: /^Student:/ }))
    expect(scene().getAttribute("data-state")).toBe("selection")
    const firstSelection = scene()
    fireEvent.click(screen.getByRole("radio", { name: /^Student:/ }))
    expect(scene()).toBe(firstSelection)
    fireEvent.click(screen.getByRole("radio", { name: /^Educator:/ }))
    expect(scene()).not.toBe(firstSelection)
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByRole("heading", { name: "A little about you" })
    expect(scene().getAttribute("data-state")).toBe("next")
    fireEvent.animationEnd(container.querySelector('[data-part="interaction"]')!)
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByText("Enter your name.")
    expect(scene().getAttribute("data-state")).toBe("idle")
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Preview learner" } })
    expect(scene().getAttribute("data-state")).toBe("idle")
    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    await screen.findByRole("heading", { name: "Let's make Owlio yours" })
    expect((screen.getByRole("radio", { name: /^Educator:/ }) as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await waitFor(() => expect((screen.getByLabelText("Display name") as HTMLInputElement).value).toBe("Preview learner"))
  })

  it("reacts to detail choices and celebrates the existing local completion", async () => {
    const { container } = render(<OnboardingView />)
    const scene = () => container.querySelector(".owlio-mascot-scene")!
    fireEvent.click(screen.getByRole("radio", { name: /^Others:/ }))
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByLabelText("Display name")
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Preview teacher" } })
    fireEvent.change(screen.getByLabelText("Preferred language"), { target: { value: "English" } })
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByRole("radio", { name: "Online tutor" })
    fireEvent.click(screen.getByRole("radio", { name: "Online tutor" }))
    expect(scene().getAttribute("data-state")).toBe("selection")
    fireEvent.change(screen.getByLabelText("Languages or subjects taught"), { target: { value: "Math" } })
    fireEvent.keyDown(screen.getByLabelText("Languages or subjects taught"), { key: "Enter" })
    fireEvent.click(screen.getByRole("checkbox", { name: "One-on-one" }))
    expect(scene().getAttribute("data-state")).toBe("selection")
    const selection = scene()
    fireEvent.click(screen.getByRole("checkbox", { name: "One-on-one" }))
    expect(scene()).toBe(selection)
    fireEvent.click(screen.getByRole("checkbox", { name: "One-on-one" }))
    expect(scene()).not.toBe(selection)
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByRole("heading", { name: "Take a look" })
    fireEvent.click(screen.getByRole("button", { name: "Finish" }))
    await screen.findByRole("heading", { name: "Flexible learning starts here" })
    expect(scene().getAttribute("data-state")).toBe("complete")
    expect((screen.getByRole("button", { name: "Educator dashboard" }) as HTMLButtonElement).disabled).toBe(true)
  })
})
```

### `onboarding-view.tsx`

Current file: `src/components/features/onboarding/onboarding-view.tsx`

```tsx
import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm, useWatch, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card } from "@/components/ui/card"
import type { OwlioMascotState } from "@/components/common/owlio-mascot/owlio-mascot"
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
const selectionFields = [
  "entity", "educationLevel", "teachingContext", "othersSubtype", "interests",
  "studyGoals", "subjectsTaught", "gradeLevels", "languagesOrSubjects",
  "learnerLevels", "sessionFormats", "availability",
] as const satisfies readonly (keyof OnboardingFormValues)[]
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
  const [mascot, setMascot] = useState<{ state: OwlioMascotState; replayKey: number }>({ state: "welcome", replayKey: 0 })
  const finishTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const stepInfo = ONBOARDING_STEPS.find(({ id }) => id === step)!

  useEffect(() => {
    headingRef.current?.focus()
  }, [step, isDone])

  useEffect(() => {
    let previous = form.getValues()
    return form.subscribe({
      formState: { values: true },
      callback: ({ values, name }) => {
        const field = selectionFields.find((field) => field === name)
        if (field) {
          const value = values[field]
          const oldValue = previous[field]
          const addedChoice = Array.isArray(value)
            ? value.some((item) => !Array.isArray(oldValue) || !oldValue.includes(item))
            : Boolean(value) && value !== oldValue
          if (addedChoice) setMascot((current) => ({ state: "selection", replayKey: current.replayKey + 1 }))
        }
        previous = form.getValues()
      },
    })
  }, [form])

  useEffect(() => () => {
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current)
  }, [])

  function playNext() {
    setMascot((current) => ({ state: "next", replayKey: current.replayKey + 1 }))
  }

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
    if (isFinishing) return
    if (!(await validateCurrentStep())) return
    if (step === "review") {
      setIsFinishing(true)
      finishTimer.current = window.setTimeout(() => {
        finishTimer.current = null
        setIsFinishing(false)
        setIsDone(true)
      }, 650)
      return
    }
    playNext()
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
          mascotState={mascot.state}
          mascotReplayKey={mascot.replayKey}
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
```

### `onboarding.constants.ts`

Current file: `src/components/features/onboarding/onboarding.constants.ts`

```ts
export const ENTITY_OPTIONS = [
  {
    value: "student",
    title: "Student",
    description: "Organize your learning, whether or not you have a teacher.",
    icon: "student",
  },
  {
    value: "educator",
    title: "Educator",
    description: "Bring your classes and teaching workflow together.",
    icon: "educator",
  },
  {
    value: "others",
    title: "Others",
    description: "Create flexible learning experiences for every learner.",
    icon: "others",
  },
] as const

export const EDUCATION_LEVELS = [
  { value: "high_school", label: "High school" },
  { value: "senior_high", label: "Senior high" },
  { value: "college", label: "College" },
  { value: "graduate", label: "Graduate" },
  { value: "self_learner", label: "Self-learner" },
  { value: "other", label: "Other" },
] as const

export const STUDY_GOALS = [
  { value: "stay_organized", label: "Stay organized" },
  { value: "prepare_for_exams", label: "Prepare for exams" },
  { value: "collaborate_with_peers", label: "Collaborate with peers" },
  { value: "improve_grades", label: "Improve grades" },
  { value: "learn_a_new_skill", label: "Learn a new skill" },
] as const

export const EDUCATOR_CONTEXTS = [
  { value: "school_teacher", label: "School teacher" },
  { value: "college_instructor", label: "College instructor" },
] as const

export const OTHERS_SUBTYPES = [
  { value: "esl_teacher", label: "ESL teacher" },
  { value: "online_tutor", label: "Online tutor" },
  { value: "freelance_educator", label: "Freelance educator" },
] as const

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const
export const GENERAL_LEARNER_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const
export const SESSION_FORMATS = [
  { value: "one_on_one", label: "One-on-one" },
  { value: "small_group", label: "Small group" },
  { value: "class", label: "Class" },
] as const

export const ONBOARDING_STEPS = [
  { id: "entity", label: "Your role", title: "Let's make Owlio yours", description: "First, tell us how you'll use Owlio." },
  { id: "profile", label: "Your profile", title: "A little about you", description: "Set up the basics for your Owlio profile." },
  { id: "details", label: "Your details", title: "Make it yours", description: "Add a few details to shape your Owlio experience." },
  { id: "review", label: "Review", title: "Take a look", description: "Review your details before you continue." },
] as const

export const STUDENT_DETAIL_FIELDS = ["educationLevel", "interests", "studyGoals", "classCode"] as const
export const EDUCATOR_DETAIL_FIELDS = ["teachingContext", "institutionName", "subjectsTaught", "gradeLevels"] as const
export const OTHERS_DETAIL_FIELDS = ["othersSubtype", "languagesOrSubjects", "learnerLevels", "sessionFormats", "availability"] as const
```

### `onboarding.schema.ts`

Current file: `src/components/features/onboarding/onboarding.schema.ts`

```ts
import { z } from "zod"
import {
  CEFR_LEVELS,
  EDUCATION_LEVELS,
  EDUCATOR_CONTEXTS,
  GENERAL_LEARNER_LEVELS,
  OTHERS_SUBTYPES,
  SESSION_FORMATS,
} from "./onboarding.constants"

const entityValues = ["student", "educator", "others"] as const
const educationValues = EDUCATION_LEVELS.map(({ value }) => value) as [string, ...string[]]
const educatorContextValues = EDUCATOR_CONTEXTS.map(({ value }) => value) as [string, ...string[]]
const subtypeValues = OTHERS_SUBTYPES.map(({ value }) => value) as [string, ...string[]]
const sessionFormatValues = SESSION_FORMATS.map(({ value }) => value) as [string, ...string[]]
const stringList = z.array(z.string())

export const onboardingFormSchema = z.object({
  entity: z.enum(entityValues).optional(),
  displayName: z.string().optional(),
  timezone: z.string().optional(),
  preferredLanguage: z.string().optional(),
  educationLevel: z.enum(educationValues).optional(),
  interests: stringList.optional(),
  studyGoals: stringList.optional(),
  classCode: z.string().optional(),
  teachingContext: z.enum(educatorContextValues).optional(),
  institutionName: z.string().optional(),
  subjectsTaught: stringList.optional(),
  gradeLevels: stringList.optional(),
  othersSubtype: z.enum(subtypeValues).optional(),
  languagesOrSubjects: stringList.optional(),
  learnerLevels: stringList.optional(),
  sessionFormats: stringList.optional(),
  availability: stringList.optional(),
})

const requiredTagList = (label: string) =>
  z.array(z.string().trim().min(1)).min(1, `Add at least one ${label}.`)

const entityDetailsUnion = z.discriminatedUnion("entity", [
  z.object({
    entity: z.literal("student"),
    educationLevel: z.enum(educationValues, { error: "Choose your education level." }),
    interests: stringList,
    studyGoals: stringList,
    classCode: z.string(),
  }),
  z.object({
    entity: z.literal("educator"),
    teachingContext: z.enum(educatorContextValues, { error: "Choose your teaching context." }),
    institutionName: z.string(),
    subjectsTaught: requiredTagList("subject"),
    gradeLevels: stringList,
  }),
  z.object({
    entity: z.literal("others"),
    othersSubtype: z.enum(subtypeValues, { error: "Choose your educator type." }),
    languagesOrSubjects: requiredTagList("language or subject"),
    learnerLevels: stringList,
    sessionFormats: z.array(z.enum(sessionFormatValues)).min(1, "Choose at least one session format."),
    availability: stringList,
  }),
])

export const entityDetailsSchema = entityDetailsUnion.superRefine((values, context) => {
  if (values.entity !== "others") return
  const allowedLevels = values.othersSubtype === "esl_teacher" ? CEFR_LEVELS : GENERAL_LEARNER_LEVELS
  values.learnerLevels.forEach((level, index) => {
    if (!allowedLevels.some((allowedLevel) => allowedLevel === level)) {
      context.addIssue({ code: "custom", path: ["learnerLevels", index], message: "Choose learner levels for the selected educator type." })
    }
  })
})

export const entitySelectionSchema = z.object({
  entity: z.enum(entityValues, { error: "Choose how you'll use Owlio." }),
})

export const profileBasicsSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your name."),
  timezone: z.string().trim().min(1, "Enter your time zone."),
  preferredLanguage: z.string().trim().min(1, "Enter your preferred language."),
})
```

### `onboarding.types.ts`

Current file: `src/components/features/onboarding/onboarding.types.ts`

```ts
import type { z } from "zod"
import type { onboardingFormSchema } from "./onboarding.schema"

export type Entity = "student" | "educator" | "others"
export type OthersSubtype = "esl_teacher" | "online_tutor" | "freelance_educator"
export type EducatorContext = "school_teacher" | "college_instructor"
export type StepId = "entity" | "profile" | "details" | "review"
export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>
```

<!-- END GENERATED CURRENT SOURCE -->
