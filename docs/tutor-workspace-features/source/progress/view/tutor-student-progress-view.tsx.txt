import { ClipboardList, CalendarDays, MessageSquareText } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

const evidence = [
  { title: "Sessions", description: "Appointments and session context.", icon: CalendarDays },
  { title: "Activities & Evaluations", description: "Tutor-defined evidence and review.", icon: ClipboardList },
  { title: "Published feedback", description: "Learner-visible feedback only.", icon: MessageSquareText },
]

export default function TutorStudentProgressView() {
  return (
    <TutorPage
      eyebrow="Resources & progress"
      title="Student Progress"
      description="Review learner progress from actual tutoring evidence, with sources, dates, and tutor-defined criteria. Tutoring evaluations are not institutional grades."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {evidence.map(({ title, description, icon: Icon }) => (
          <TutorSection key={title} title={title}>
            <p className="text-sm leading-6 text-slate-600">{description}</p>
            <Icon aria-hidden="true" className="size-5 text-blue-700" />
          </TutorSection>
        ))}
      </div>
      <TutorUnavailable
        title="Progress evidence is unavailable"
        description="No tutor sessions, attendance, activity evaluations, plans, or published feedback are connected. No mastery, grade, or progress metric is inferred."
      />
    </TutorPage>
  )
}
