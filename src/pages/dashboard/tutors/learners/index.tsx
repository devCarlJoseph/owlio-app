import { ChartNoAxesCombined, ClipboardList, GraduationCap, Users } from "lucide-react"
import { cn } from "cn"

const stats = [
  { label: "Attendance rate", icon: GraduationCap, iconColor: "bg-emerald-50 text-emerald-700" },
  { label: "Session completion", icon: ClipboardList, iconColor: "bg-blue-50 text-blue-700" },
  { label: "Average progress", icon: ChartNoAxesCombined, iconColor: "bg-violet-50 text-violet-700" },
]

function StatCard({ label, icon: Icon, iconColor }: { label: string; icon: typeof GraduationCap; iconColor: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", iconColor)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-slate-900">--</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof GraduationCap
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className="size-6 text-slate-400" aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
    </div>
  )
}

export default function TutorLearnersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Tutoring workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Learners</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Keep learner context together across tutoring sessions, materials, activities, and feedback.
        </p>
      </section>

      <div className="flex items-center gap-2" role="tablist" aria-label="Learning groups">
        {["Group A", "Group B", "Group C"].map((group, i) => (
          <button
            key={group}
            role="tab"
            aria-selected={i === 0}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              i === 0
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {group}
          </button>
        ))}
      </div>

      <section aria-label="Learning group statistics" className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, icon, iconColor }) => (
          <StatCard key={label} label={label} icon={icon} iconColor={iconColor} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-label="Learners"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Learners</h3>
            <span className="text-sm font-medium text-blue-700">View all</span>
          </div>
          <div className="mt-4">
            <EmptyState
              icon={Users}
              title="No learners yet"
              description="Your learners will appear here once they join your tutoring sessions."
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section
            aria-label="Learning group overview"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-900">Group overview</h3>
            <div className="mt-4">
              <EmptyState
                icon={GraduationCap}
                title="No overview available"
                description="Learning group details will appear here once groups are created."
              />
            </div>
          </section>

          <section
            aria-label="Learning styles"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-900">Learning styles</h3>
            <div className="mt-4">
              <EmptyState
                icon={ChartNoAxesCombined}
                title="No data yet"
                description="Learning style preferences will appear here once learners are added."
              />
            </div>
          </section>

          <section
            aria-label="Recent submissions"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Recent submissions</h3>
              <span className="text-sm font-medium text-blue-700">View all</span>
            </div>
            <div className="mt-4">
              <EmptyState
                icon={ClipboardList}
                title="No submissions yet"
                description="Learner submissions and attachments will appear here."
              />
            </div>
          </section>
        </aside>
      </div>

      <p
        className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
        role="status"
      >
        Learner profiles and tutoring history are not loaded. Do not treat tutoring evaluations as school grades.
      </p>
    </div>
  )
}
