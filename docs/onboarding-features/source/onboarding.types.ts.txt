import type { z } from "zod"
import type { onboardingFormSchema } from "./onboarding.schema"

export type Entity = "student" | "educator" | "others"
export type OthersSubtype = "esl_teacher" | "online_tutor" | "freelance_educator"
export type EducatorContext = "school_teacher" | "college_instructor"
export type StepId = "entity" | "profile" | "details" | "review"
export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>
