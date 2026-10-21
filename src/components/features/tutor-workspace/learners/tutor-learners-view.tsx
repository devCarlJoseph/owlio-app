import { Link } from "react-router"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorLearnersView() {
  return (
    <TutorPage
      eyebrow="Learner management"
      title="My Learners"
      description="Keep individual learners and tutoring groups distinct, with each learner’s records limited to the authorized tutoring relationship."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Individual learners" description="Learner profiles and tutoring history are not connected.">
          <p className="text-sm text-slate-600">No learner profiles are available to display.</p>
        </TutorSection>
        <TutorSection title="Learning groups" description="Group membership and shared learning context are not connected.">
          <p className="text-sm text-slate-600">No tutoring groups are available to display.</p>
        </TutorSection>
      </div>

      <TutorUnavailable
        title="Learner and group management is unavailable"
        description="A tutor learner/group service is required before profiles, membership, search, relationship status, or learner-specific records can be shown or changed."
      />

      <nav aria-label="Learner workflow links" className="flex flex-wrap gap-3">
        <Link className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" to="/tutors/learning-plans">Learning Plans</Link>
        <Link className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" to="/tutors/sessions">Sessions & Schedule</Link>
        <Link className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" to="/tutors/classwork">Activities & Evaluations</Link>
      </nav>
    </TutorPage>
  )
}
