import { BookOpenCheck, Flag, ListChecks } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

const planAreas = [
  { title: "Goals and outcomes", description: "Tutor-authored goals for an individual learner or supported group.", icon: Flag },
  { title: "Milestones and next steps", description: "A longer-term sequence reviewed across multiple sessions.", icon: ListChecks },
  { title: "Related sessions and materials", description: "Contextual links to the sessions and resources that support the plan.", icon: BookOpenCheck },
]

export default function LearningPlansView() {
  return (
    <TutorPage
      eyebrow="Learner management"
      title="Learning Plans"
      description="Organize tutor-defined goals across multiple sessions. A learning plan is separate from a single-session agenda, school curriculum, and gradebook."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {planAreas.map(({ title, description, icon: Icon }) => (
          <TutorSection key={title} title={title}>
            <Icon aria-hidden="true" className="size-5 text-blue-700" />
            <p className="text-sm leading-6 text-slate-600">{description}</p>
          </TutorSection>
        ))}
      </div>
      <TutorUnavailable
        title="Learning Plans are not connected"
        description="Plan records, learner/group ownership, milestone updates, and persistence require an approved tutoring-plan service. No example plans or progress are shown."
      />
      <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Drafting and saving a plan is unavailable until the plan service and its authorized learner/group contract are in place.
      </p>
    </TutorPage>
  )
}
