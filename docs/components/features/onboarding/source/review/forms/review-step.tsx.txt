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
    <section className="px-4 py-5 sm:px-6" aria-labelledby={`review-${step}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={`review-${step}`} className="text-sm font-semibold text-slate-950">{title}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-full px-3 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
          onClick={() => onEdit(step)}
          aria-label={`Edit ${title}`}
        >
          <Pencil aria-hidden="true" /> Edit
        </Button>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map(({ label, value }) => {
          const display = value || "Not added"
          return (
            <div key={label} className="min-w-0">
              <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
              <dd className={`mt-0.5 break-words text-sm ${display === "Not added" ? "text-muted-foreground italic" : "font-medium text-foreground"}`}>{display}</dd>
            </div>
          )
        })}
      </dl>
    </section>
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
    <Card className="gap-0 divide-y divide-border/70 rounded-2xl border border-border/70 bg-slate-50/40 p-0 shadow-none ring-0">
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
    </Card>
  )
}
