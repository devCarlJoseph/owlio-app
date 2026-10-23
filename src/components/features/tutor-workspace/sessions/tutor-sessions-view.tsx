import { CalendarClock, MapPin, Video } from "lucide-react"
import { Link } from "react-router"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorSessionsView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Sessions & Schedule"
      description="Manage tutoring appointments separately from longer-term Learning Plans. Session time, timezone, delivery mode, and recurrence must follow the session service contract."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TutorSection title="Session details" description="Learner/group, topic, and a session agenda belong to the appointment.">
          <CalendarClock aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
        <TutorSection title="Delivery mode" description="Online, in-person, or hybrid options require backend support.">
          <MapPin aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
        <TutorSection title="Meeting Room" description="A room link belongs only to an eligible online session with a valid room.">
          <Video aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
      </div>
      <TutorUnavailable
        title="Session scheduling is unavailable"
        description="No tutor session or schedule service is connected. This page cannot create appointments, determine a timezone, or claim a Meeting Room is attached."
      />
      <div className="flex flex-wrap gap-3">
        <Link to="/tutors/learning-plans" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Open Learning Plans</Link>
        <Link to="/tutors/classwork" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Open Activities & Evaluations</Link>
      </div>
    </TutorPage>
  )
}
