import { LockKeyhole, MessageCircleMore } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../../ui/tutor-workspace-ui"

export default function TutorSessionNotesView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Session Notes"
      description="Keep tutor-only observations separate from feedback intentionally published to a learner."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Private tutor notes" description="Private notes require explicit tutor-only access and retention rules.">
          <LockKeyhole aria-hidden="true" className="size-5 text-slate-700 surface-dark:text-foreground" />
          <p className="text-sm text-slate-600 surface-dark:text-muted-foreground">These notes must not appear in learner feeds, group discussions, notifications, or progress views.</p>
        </TutorSection>
        <TutorSection title="Learner-visible feedback" description="Publishing is a separate action with a confirmed audience.">
          <MessageCircleMore aria-hidden="true" className="size-5 text-blue-700 surface-dark:text-blue-300" />
          <p className="text-sm text-slate-600 surface-dark:text-muted-foreground">A private note never becomes feedback automatically.</p>
        </TutorSection>
      </div>
      <TutorUnavailable
        title="Notes and feedback are unavailable"
        description="No session-note or feedback service is connected. Creating, saving, or publishing records is unavailable."
      />
    </TutorPage>
  )
}
