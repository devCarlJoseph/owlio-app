import { ClipboardCheck, ClipboardList, MessageSquareText } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

const activityAreas = [
  { title: "Practice and activities", description: "Prepare work linked to an authorized learner/group and tutoring context.", icon: ClipboardList },
  { title: "Learner responses", description: "Review learner-specific work only when submission types and lifecycle are defined.", icon: ClipboardCheck },
  { title: "Evaluation and feedback", description: "Keep tutor evaluations distinct from school grades and private observations.", icon: MessageSquareText },
]

export default function TutorActivitiesView() {
  return (
    <TutorPage
      eyebrow="Learner management"
      title="Activities & Evaluations"
      description="Prepare tutoring practice, review learner work, and provide tutor-controlled evaluations without assuming school grading rules."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {activityAreas.map(({ title, description, icon: Icon }) => (
          <TutorSection key={title} title={title}>
            <Icon aria-hidden="true" className="size-5 text-blue-700" />
            <p className="text-sm leading-6 text-slate-600">{description}</p>
          </TutorSection>
        ))}
      </div>
      <TutorUnavailable
        title="Activities and learner work are unavailable"
        description="Tutor activity, submission, evaluation, and feedback services are not connected. No learner work, grades, scores, or review states are being fabricated."
      />
      <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Activity types, response rules, evaluation criteria, and release states must come from an approved tutoring contract.
      </p>
    </TutorPage>
  )
}
