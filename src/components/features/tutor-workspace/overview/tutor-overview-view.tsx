import {
  ArrowUpRight,
  BookOpen,
  BookOpenText,
  CalendarDays,
  ClipboardList,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router"
import { TutorPage } from "../tutor-workspace-ui"

const workspaces = [
  {
    title: "Learning Plans",
    description: "Open the multi-session planning workspace.",
    href: "/tutors/learning-plans",
    icon: BookOpen,
    iconClassName: "bg-amber-100 text-amber-900",
  },
  {
    title: "Teaching Materials",
    description: "Open the tutor resource workspace.",
    href: "/tutors/materials",
    icon: BookOpenText,
    iconClassName: "bg-sky-100 text-sky-900",
  },
  {
    title: "My Learners",
    description: "Open individual and group learner contexts.",
    href: "/tutors/learners",
    icon: Users,
    iconClassName: "bg-emerald-100 text-emerald-900",
  },
]

export default function TutorOverviewView() {
  return (
    <TutorPage
      eyebrow="Tutor workspace"
      title="Your day, in focus"
      description="A practical starting point for independent and group tutoring. Session and learner records will appear here when their services are connected."
    >
      <section
        aria-label="Overview data status"
        className="relative isolate overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-5 sm:p-7"
      >
        <div aria-hidden="true" className="absolute -right-12 -top-20 -z-10 size-56 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">A workspace for your next step</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Keep sessions, learner work, and follow-ups in view.
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700">
              This overview is ready to organize your tutoring day, but it won&apos;t show activity until authorized tutor records are available.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950">
            <span aria-hidden="true" className="size-2 rounded-full bg-amber-500" />
            Tutor data not connected
          </span>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.85fr)]">
        <section aria-labelledby="upcoming-sessions-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Session agenda</p>
              <h3 id="upcoming-sessions-title" className="mt-1 text-lg font-semibold text-slate-950">Upcoming sessions</h3>
            </div>
            <Link
              to="/tutors/sessions"
              className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-blue-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Open sessions <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="mt-5 flex min-h-40 items-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-800 shadow-sm">
              <CalendarDays aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Session details aren&apos;t available yet</p>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                Session scheduling isn&apos;t connected, so no appointments, times, or Meeting Room links are shown here.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <UnavailableQueue
            id="activity-review"
            title="Activity review"
            description="Activity and evaluation records aren&apos;t connected, so there are no learner submissions to review here."
            href="/tutors/classwork"
            linkLabel="Open activities"
            icon={ClipboardList}
            tone="orange"
          />
          <UnavailableQueue
            id="learner-follow-ups"
            title="Learner follow-ups"
            description="Learner, attendance, and feedback records aren&apos;t connected. No follow-ups or progress metrics are being inferred."
            href="/tutors/learners"
            linkLabel="Open learners"
            icon={Users}
            tone="green"
          />
        </div>
      </div>

      <section aria-labelledby="tutor-workspaces-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Continue your work</p>
            <h3 id="tutor-workspaces-title" className="mt-1 text-lg font-semibold text-slate-950">Tutoring workspaces</h3>
          </div>
          <p className="text-sm text-slate-600">These links open workspaces; they don&apos;t create or save records.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {workspaces.map(({ title, description, href, icon: Icon, iconClassName }) => (
            <Link
              key={href}
              to={href}
              className="group flex min-h-32 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  {title}
                  <ArrowUpRight aria-hidden="true" className="size-4 text-blue-800 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-600">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </TutorPage>
  )
}

function UnavailableQueue({
  id,
  title,
  description,
  href,
  linkLabel,
  icon: Icon,
  tone,
}: {
  id: string
  title: string
  description: string
  href: string
  linkLabel: string
  icon: LucideIcon
  tone: "orange" | "green"
}) {
  const toneClasses = tone === "orange"
    ? "bg-orange-50 text-orange-950 border-orange-100"
    : "bg-emerald-50 text-emerald-950 border-emerald-100"

  return (
    <section aria-labelledby={`${id}-title`} className={`flex min-h-52 flex-col rounded-3xl border p-5 shadow-sm sm:p-6 ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">Not connected</p>
          <h3 id={`${id}-title`} className="mt-1 text-lg font-semibold">{title}</h3>
        </div>
        <Icon aria-hidden="true" className="size-5 shrink-0 opacity-80" />
      </div>
      <p className="mt-3 text-sm leading-6 opacity-85">{description}</p>
      <Link
        to={href}
        className="mt-auto inline-flex min-h-10 w-fit items-center gap-1 pt-4 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
      >
        {linkLabel} <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}
