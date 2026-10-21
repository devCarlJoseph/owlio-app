import { ArrowRight, BookOpen, BookOpenText, CalendarDays, ClipboardList, Users, Video } from "lucide-react"
import { Link } from "react-router"
import { TutorPage, TutorUnavailable } from "../tutor-workspace-ui"

const nextSteps = [
  { title: "Review learners", description: "Open the individual and group tutoring directory.", href: "/tutors/learners", icon: Users },
  { title: "Prepare a learning plan", description: "View the multi-session planning workspace.", href: "/tutors/learning-plans", icon: BookOpen },
  { title: "Open sessions", description: "Review the tutoring session and schedule workspace.", href: "/tutors/sessions", icon: CalendarDays },
  { title: "Prepare activities", description: "Open activities and evaluations.", href: "/tutors/classwork", icon: ClipboardList },
  { title: "Teaching materials", description: "Open the tutor resource library context.", href: "/tutors/materials", icon: BookOpenText },
  { title: "Meeting Room", description: "Open the standalone meeting lobby; no session room is implied.", href: "/tutors/classrooms/meeting-room", icon: Video },
]

export default function TutorOverviewView() {
  return (
    <TutorPage
      eyebrow="Tutor workspace"
      title="Your tutoring at a glance"
      description="Start with the learner, plan, or session context you want to work on. Overview data will appear here when tutoring services are connected."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <TutorUnavailable
          title="Upcoming sessions are unavailable"
          description="No tutor session service is connected, so this page cannot show scheduled sessions or meeting links."
        />
        <TutorUnavailable
          title="Follow-up queue is unavailable"
          description="Learner work, attendance, and feedback are not connected. No review tasks or learner metrics are being inferred."
        />
      </div>

      <section aria-labelledby="tutor-next-steps" className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Getting started</p>
          <h3 id="tutor-next-steps" className="mt-1 text-lg font-semibold text-slate-900">Choose a tutoring workflow</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {nextSteps.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className="group flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  {title}
                  <ArrowRight aria-hidden="true" className="size-4 text-blue-700 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-600">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Tutor records are not loaded. These links open workspace pages; they do not create or save tutoring records.
      </p>
    </TutorPage>
  )
}
