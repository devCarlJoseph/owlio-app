import { Link } from "react-router"
import { useParams } from "react-router"
import { TutorPage, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorLearnerDetailView() {
  const { learnerId } = useParams()

  return (
    <TutorPage
      eyebrow="Learner management"
      title="Learner details"
      description="Learner-specific plans, sessions, activities, attendance, notes, feedback, materials, and progress require an authorized tutor relationship."
    >
      <TutorUnavailable
        title="Learner details are unavailable"
        description={learnerId
          ? "The tutor learner service is not connected, so this record cannot be loaded or verified."
          : "A learner record must be selected before private tutoring details can be displayed."}
      />
      <Link to="/tutors/learners" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        Back to My Learners
      </Link>
    </TutorPage>
  )
}
