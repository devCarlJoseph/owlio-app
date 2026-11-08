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
