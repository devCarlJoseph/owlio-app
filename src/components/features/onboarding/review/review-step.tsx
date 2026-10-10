import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EDUCATION_LEVELS, EDUCATOR_CONTEXTS, ENTITY_OPTIONS, OTHERS_SUBTYPES, SESSION_FORMATS, STUDY_GOALS } from "../onboarding.constants"
import type { OnboardingFormValues, StepId } from "../onboarding.types"

type ReviewStepProps = {
  values: OnboardingFormValues
  onEdit: (step: StepId) => void
}

type SummaryGroupProps = {
  title: string
  step: StepId
  rows: Array<{ label: string; value: string }>
  onEdit: (step: StepId) => void
}

function SummaryGroup({ title, step, rows, onEdit }: SummaryGroupProps) {
  return (
    <Card className="gap-0 rounded-xl border border-border/70 p-0 shadow-none ring-0">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
        <h2 className="font-semibold">{title}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(step)} aria-label={`Edit ${title}`}>
          <Pencil aria-hidden="true" /> Edit
        </Button>
      </div>
      <dl className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
        {rows.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 break-words text-sm text-foreground">{value || "Not added"}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function list(values?: string[]) {
  return values?.length ? values.join(", ") : "Not added"
}

export function ReviewStep({ values, onEdit }: ReviewStepProps) {
  const entity = ENTITY_OPTIONS.find(({ value }) => value === values.entity)?.title ?? "Not selected"
  const details = values.entity === "student"
    ? [
        { label: "Education level", value: EDUCATION_LEVELS.find(({ value }) => value === values.educationLevel)?.label ?? "" },
        { label: "Subjects or interests", value: list(values.interests) },
        { label: "Study goals", value: values.studyGoals?.map((value) => STUDY_GOALS.find((goal) => goal.value === value)?.label ?? value).join(", ") || "Not added" },
        { label: "Class code", value: values.classCode?.trim() || "Not added" },
      ]
    : values.entity === "educator"
      ? [
          { label: "Teaching context", value: EDUCATOR_CONTEXTS.find(({ value }) => value === values.teachingContext)?.label ?? "" },
          { label: "Institution", value: values.institutionName?.trim() || "Not added" },
          { label: "Subjects taught", value: list(values.subjectsTaught) },
          { label: "Grade or year levels", value: list(values.gradeLevels) },
        ]
      : [
          { label: "Educator type", value: OTHERS_SUBTYPES.find(({ value }) => value === values.othersSubtype)?.label ?? "" },
          { label: "Languages or subjects", value: list(values.languagesOrSubjects) },
          { label: "Learner levels", value: list(values.learnerLevels) },
          { label: "Session formats", value: values.sessionFormats?.map((value) => SESSION_FORMATS.find((format) => format.value === value)?.label ?? value).join(", ") || "Not added" },
          { label: "Typical availability", value: list(values.availability) },
        ]

  return (
    <div className="space-y-4">
      <SummaryGroup title="Your role" step="entity" onEdit={onEdit} rows={[{ label: "Using Owlio as", value: entity }]} />
      <SummaryGroup
        title="Profile basics"
        step="profile"
        onEdit={onEdit}
        rows={[
          { label: "Display name", value: values.displayName ?? "" },
          { label: "Time zone", value: values.timezone ?? "" },
          { label: "Preferred language", value: values.preferredLanguage ?? "" },
        ]}
      />
      <SummaryGroup title="Your details" step="details" onEdit={onEdit} rows={details} />
    </div>
  )
}
