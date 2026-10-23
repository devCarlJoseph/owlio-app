import {
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react"
import { TutorPage } from "../tutor-workspace-ui"

const activityAreas = [
  {
    title: "Practice and activities",
    description: "Tutor-authored work tied to an authorized learner or supported group.",
    icon: ClipboardList,
    iconClassName: "bg-blue-100 text-blue-900",
  },
  {
    title: "Learner responses",
    description: "Review learner-specific work only when submission types and lifecycle are defined.",
    icon: ClipboardCheck,
    iconClassName: "bg-orange-100 text-orange-900",
  },
  {
    title: "Evaluation and feedback",
    description: "Keep tutor evaluation separate from private Session Notes and publish feedback deliberately.",
    icon: MessageSquareText,
    iconClassName: "bg-emerald-100 text-emerald-900",
  },
]

export default function TutorActivitiesView() {
  return (
    <TutorPage
      eyebrow="Learner management"
      title="Activities & Evaluations"
      description="Prepare tutoring practice, review learner work, and provide tutor-controlled evaluations without assuming school grading rules."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.6fr)]">
        <aside
          aria-labelledby="activity-library-title"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Tutor workspace</p>
              <h3 id="activity-library-title" className="mt-1 text-lg font-semibold text-slate-950">Activity library</h3>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950">
              Not connected
            </span>
          </div>
          <div className="p-4 sm:p-5">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
              <CircleHelp aria-hidden="true" className="size-5 text-slate-500" />
              <h4 className="mt-3 font-semibold text-slate-900">Activity list unavailable</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Tutor activity records cannot be loaded until an approved service is connected.
              </p>
            </div>
          </div>
          <p className="mx-4 mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-5 text-blue-950 sm:mx-5 sm:mb-5">
            Activities should stay linked to their learner or group and relevant tutoring context.
          </p>
        </aside>

        <section
          aria-labelledby="activity-details-title"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Selected activity</p>
              <h3 id="activity-details-title" className="mt-1 text-lg font-semibold text-slate-950">Activity details</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              No activity selected
            </span>
          </div>

          <div role="status" className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <CircleHelp aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-900" />
            <div>
              <h4 className="font-semibold text-amber-950">Activities and learner work are unavailable</h4>
              <p className="mt-1 text-sm leading-6 text-amber-950/85">
                Tutor activity, submission, evaluation, and feedback services are not connected. No learner work, scores, or review states are shown.
              </p>
            </div>
          </div>

          <section aria-labelledby="activity-workflow-title" className="mt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tutoring workflow</p>
              <h4 id="activity-workflow-title" className="mt-1 text-base font-semibold text-slate-950">What belongs here</h4>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {activityAreas.map(({ title, description, icon: Icon, iconClassName }) => (
                <ActivityAreaCard
                  key={title}
                  title={title}
                  description={description}
                  icon={Icon}
                  iconClassName={iconClassName}
                />
              ))}
            </div>
          </section>

          <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Activity types, response rules, evaluation criteria, and feedback release states must come from an approved tutoring contract.
          </p>
        </section>
      </div>
    </TutorPage>
  )
}

function ActivityAreaCard({
  title,
  description,
  icon: Icon,
  iconClassName,
}: {
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <span className={`flex size-9 items-center justify-center rounded-xl ${iconClassName}`}>
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <h5 className="mt-3 text-sm font-semibold text-slate-900">{title}</h5>
      <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
    </article>
  )
}
