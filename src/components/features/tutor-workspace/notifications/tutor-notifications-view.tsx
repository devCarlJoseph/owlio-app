import { CalendarDays, ClipboardList, MessageCircleMore } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

const eventSources = [
  { title: "Sessions", icon: CalendarDays },
  { title: "Activities and evaluations", icon: ClipboardList },
  { title: "Discussions and feedback", icon: MessageCircleMore },
]

export default function TutorNotificationsView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Notifications"
      description="Notifications should link confirmed events back to their source without exposing private session notes or learner details unnecessarily."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {eventSources.map(({ title, icon: Icon }) => (
          <TutorSection key={title} title={title}>
            <Icon aria-hidden="true" className="size-5 text-blue-700" />
          </TutorSection>
        ))}
      </div>
      <TutorUnavailable
        title="Notification inbox is unavailable"
        description="No notification delivery or read-state service is connected. There are no live event items to display."
      />
    </TutorPage>
  )
}
