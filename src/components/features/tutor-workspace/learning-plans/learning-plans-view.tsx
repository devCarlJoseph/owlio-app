import { BookOpenCheck, CircleHelp, Flag, ListChecks } from "lucide-react"
import { TutorPage } from "../tutor-workspace-ui"

const planAreas = [
  {
    title: "Goals and outcomes",
    description: "Tutor-authored goals for an individual learner or supported group.",
    icon: Flag,
    iconClassName: "bg-blue-100 text-blue-900",
  },
  {
    title: "Milestones and next steps",
    description: "A longer-term sequence reviewed across multiple sessions.",
    icon: ListChecks,
    iconClassName: "bg-orange-100 text-orange-900",
  },
  {
    title: "Related sessions and materials",
    description: "Contextual links to the sessions and resources that support the plan.",
    icon: BookOpenCheck,
    iconClassName: "bg-emerald-100 text-emerald-900",
  },
]

export default function LearningPlansView() {
  return (
    <TutorPage
      eyebrow="Learner management"
      title="Learning Plans"
      description="Organize tutor-defined goals across multiple sessions. A learning plan is separate from a single-session agenda, school curriculum, and gradebook."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(15rem,0.78fr)_minmax(0,1.6fr)]">
        <aside
          aria-labelledby="plan-library-title"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Plan library</p>
              <h3 id="plan-library-title" className="mt-1 text-lg font-semibold text-slate-950">Your plans</h3>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950">
              Not connected
            </span>
          </div>
          <div className="p-4 sm:p-5">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
              <CircleHelp aria-hidden="true" className="size-5 text-slate-500" />
              <h4 className="mt-3 font-semibold text-slate-900">No plan records to show</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                The tutor plan service is not connected, so this list cannot load learner or group plans.
              </p>
            </div>
          </div>
          <p className="mx-4 mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-5 text-blue-950 sm:mx-5 sm:mb-5">
            Plans belong to an authorized individual learner or supported group and span multiple sessions.
          </p>
        </aside>

        <section
          aria-labelledby="plan-details-title"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Selected plan</p>
              <h3 id="plan-details-title" className="mt-1 text-lg font-semibold text-slate-950">Plan details</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              No plan selected
            </span>
          </div>

          <div role="status" className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <CircleHelp aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-900" />
            <div>
              <h4 className="font-semibold text-amber-950">Learning Plans are not connected</h4>
              <p className="mt-1 text-sm leading-6 text-amber-950/85">
                Plan details, creation, and saving are unavailable until an approved plan service and learner/group contract are in place.
              </p>
            </div>
          </div>

          <section aria-labelledby="plan-structure-title" className="mt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Multi-session structure</p>
              <h4 id="plan-structure-title" className="mt-1 text-base font-semibold text-slate-950">What a plan can organize</h4>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {planAreas.map(({ title, description, icon: Icon, iconClassName }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className={`flex size-9 items-center justify-center rounded-xl ${iconClassName}`}>
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <h5 className="mt-3 text-sm font-semibold text-slate-900">{title}</h5>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </TutorPage>
  )
}
