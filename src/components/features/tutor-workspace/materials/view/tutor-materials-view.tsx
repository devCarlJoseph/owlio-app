import { BookOpenText, FolderOpen, Users } from "lucide-react"
import { Link } from "react-router"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorMaterialsView() {
  return (
    <TutorPage
      eyebrow="Resources & progress"
      title="Teaching Materials"
      description="Use one tutor resource library with an explicit owner and audience. Private resources must be shared deliberately before learners can see them."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TutorSection title="Learner context" description="Select an authorized learner or group before attaching a resource.">
          <Users aria-hidden="true" className="size-5 text-blue-700" />
          <Link className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" to="/tutors/learners">Open My Learners</Link>
        </TutorSection>
        <TutorSection title="Session context" description="Materials may be linked to an appointment when sessions are available.">
          <BookOpenText aria-hidden="true" className="size-5 text-blue-700" />
          <Link className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" to="/tutors/sessions">Open Sessions</Link>
        </TutorSection>
        <TutorSection title="Tutor library" description="Browse, upload, preview, and share only when storage rules are confirmed.">
          <FolderOpen aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
      </div>
      <TutorUnavailable
        title="The materials library is not connected"
        description="Resource browsing, upload, storage, preview, and sharing require an approved materials service. No file types or upload limits are assumed."
      />
    </TutorPage>
  )
}
