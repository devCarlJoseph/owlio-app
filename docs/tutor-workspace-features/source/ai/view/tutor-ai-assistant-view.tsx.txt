import { BrainCircuit, FilePenLine, ShieldCheck } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

const draftTypes = [
  { title: "Preparation drafts", description: "Ideas for plans, sessions, or practice activities.", icon: FilePenLine },
  { title: "Tutor review", description: "Suggestions remain editable and require the tutor’s decision.", icon: ShieldCheck },
  { title: "Tutor-facing only", description: "This is not an autonomous learner-facing assistant.", icon: BrainCircuit },
]

export default function TutorAiAssistantView() {
  return (
    <TutorPage
      eyebrow="Resources & progress"
      title="AI Tutor Assistant"
      description="Support tutoring preparation with editable drafts only. The tutor remains responsible for all teaching decisions and learner communication."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {draftTypes.map(({ title, description, icon: Icon }) => (
          <TutorSection key={title} title={title}>
            <Icon aria-hidden="true" className="size-5 text-blue-700" />
            <p className="text-sm leading-6 text-slate-600">{description}</p>
          </TutorSection>
        ))}
      </div>
      <TutorUnavailable
        title="AI generation is not connected"
        description="No approved provider, privacy/retention contract, or tutor AI service is available. Do not enter private learner or session information."
      />
      <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        No AI output is being generated. Suggestions cannot assign work, evaluate learners, contact learners, or change records.
      </p>
    </TutorPage>
  )
}
