import { Megaphone } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../../ui/tutor-workspace-ui"

export default function TutorAnnouncementsView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Announcements"
      description="Tutor-authored notices need an explicitly selected learner or group audience and service-confirmed publication."
    >
      <TutorSection title="Notice audience" description="No learner/group audience can be selected until authorized tutoring relationships are loaded.">
        <Megaphone aria-hidden="true" className="size-5 text-blue-700 surface-dark:text-blue-300" />
      </TutorSection>
      <TutorUnavailable
        title="Announcements are unavailable"
        description="No announcement service is connected. Drafting, publishing, scheduling, retracting, and delivery status are not represented as available."
      />
    </TutorPage>
  )
}
