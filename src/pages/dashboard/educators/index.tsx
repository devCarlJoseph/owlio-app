import { BookOpenCheck, CalendarDays, ChartNoAxesCombined } from "lucide-react"

const dashboardSections = [
  { title: "My classes", description: "Your classes and learner groups will appear here.", icon: BookOpenCheck },
  { title: "Coming up", description: "Upcoming lessons and teaching tasks will appear here.", icon: CalendarDays },
  { title: "Class progress", description: "Review learning activity and milestones here.", icon: ChartNoAxesCombined },
]

export default function EducatorsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Educators workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Everything for your teaching day.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Bring your classes, learning materials, and student progress together in one workspace.</p>
      </section>
      <section aria-label="Educator dashboard sections" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardSections.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-5 text-slate-500">{description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
