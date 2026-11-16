import { CalendarCheck, Users } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../../ui/tutor-workspace-ui"

export default function TutorAttendanceView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Session Attendance"
      description="Record attendance explicitly for an actual tutoring session, including each participant in a supported group session."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Session roll call" description="Select an authorized session and use only its eligible participants.">
          <CalendarCheck aria-hidden="true" className="size-5 text-blue-700 surface-dark:text-blue-300" />
        </TutorSection>
        <TutorSection title="Learner history" description="Individual attendance history and corrections require service-defined rules.">
          <Users aria-hidden="true" className="size-5 text-blue-700 surface-dark:text-blue-300" />
        </TutorSection>
      </div>
      <TutorUnavailable
        title="Attendance records are unavailable"
        description="No tutor attendance service or session roster is connected. LiveKit presence, room duration, chat, and screen sharing are not attendance."
      />
    </TutorPage>
  )
}
