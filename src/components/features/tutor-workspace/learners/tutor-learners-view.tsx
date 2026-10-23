import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  type LucideIcon,
  Users,
  UserRound,
} from "lucide-react"
import { Link } from "react-router"
import { TutorPage } from "../tutor-workspace-ui"

const relatedWorkspaces = [
  {
    title: "Learning Plans",
    description: "Open the general multi-session planning workspace.",
    href: "/tutors/learning-plans",
    icon: BookOpen,
    iconClassName: "bg-amber-100 text-amber-900",
  },
  {
    title: "Sessions & Schedule",
    description: "Open the general tutoring session workspace.",
    href: "/tutors/sessions",
    icon: CalendarDays,
    iconClassName: "bg-sky-100 text-sky-900",
  },
  {
    title: "Activities & Evaluations",
    description: "Open the general activities workspace.",
    href: "/tutors/classwork",
    icon: ClipboardList,
    iconClassName: "bg-emerald-100 text-emerald-900",
  },
]

export default function TutorLearnersView() {
  return (
    <TutorPage
      eyebrow="Learner management"
      title="My Learners"
      description="Keep individual learners and tutoring groups distinct, with each learner's records limited to the authorized tutoring relationship."
    >
      <section
        aria-label="Learner directory status"
        className="relative isolate overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-5 sm:p-7"
      >
        <div aria-hidden="true" className="absolute -right-12 -top-20 -z-10 size-56 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">Your tutoring relationships</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              One directory for individuals and groups.
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Learner and group records will appear here when an authorized tutor directory is connected. No profiles or memberships are loaded in this version.
            </p>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950">
            <span aria-hidden="true" className="size-2 rounded-full bg-amber-500" />
            Directory unavailable
          </span>
        </div>
      </section>

      <section aria-labelledby="learner-contexts-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Browse by relationship</p>
            <h3 id="learner-contexts-title" className="mt-1 text-lg font-semibold text-slate-950">Learner contexts</h3>
          </div>
          <p className="text-sm text-slate-600">Search and filtering are unavailable until records can be loaded.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <LearnerContextCard
            id="individual-learners"
            title="Individual learners"
            description="One-to-one tutoring relationships and their authorized learning context."
            unavailable="Individual learner profiles are not connected."
            icon={UserRound}
            tone="blue"
          />
          <LearnerContextCard
            id="learning-groups"
            title="Learning groups"
            description="Shared tutoring context, kept separate from each member's private records."
            unavailable="Group records and membership are not connected."
            icon={Users}
            tone="orange"
          />
        </div>
      </section>

      <section aria-labelledby="related-workspaces-title" className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Continue tutoring</p>
          <h3 id="related-workspaces-title" className="mt-1 text-lg font-semibold text-slate-950">Related workspaces</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            These links open general tutor workspaces; they do not open a learner-specific record or save changes.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {relatedWorkspaces.map(({ title, description, href, icon: Icon, iconClassName }) => (
            <Link
              key={href}
              to={href}
              className="group flex min-h-28 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
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

function LearnerContextCard({
  id,
  title,
  description,
  unavailable,
  icon: Icon,
  tone,
}: {
  id: string
  title: string
  description: string
  unavailable: string
  icon: LucideIcon
  tone: "blue" | "orange"
}) {
  const toneClasses = tone === "blue"
    ? "border-blue-100 bg-blue-50/70 text-blue-950"
    : "border-orange-100 bg-orange-50/70 text-orange-950"

  return (
    <section aria-labelledby={`${id}-title`} className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${toneClasses}`}>
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <h4 id={`${id}-title`} className="text-base font-semibold">{title}</h4>
          <p className="mt-1 text-sm leading-5 opacity-80">{description}</p>
        </div>
      </div>
      <div className="mt-5 flex min-h-24 items-center gap-3 rounded-2xl border border-dashed border-current/20 bg-white/70 p-4">
        <CircleHelp aria-hidden="true" className="size-5 shrink-0 opacity-70" />
        <p className="text-sm font-medium leading-5">{unavailable}</p>
      </div>
    </section>
  )
}
