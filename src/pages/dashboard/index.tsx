import { BookOpenCheck, GraduationCap, Languages } from "lucide-react"
import { Link } from "react-router"

const workspaces = [
  { title: "Students", description: "A focused home for lessons, tasks, and personal learning progress.", href: "/students", icon: GraduationCap },
  { title: "Educators", description: "A shared space for classes, teaching materials, and learner progress.", href: "/educators", icon: BookOpenCheck },
  { title: "Tutors & ESL", description: "Flexible tools for tutoring, language learning, and learner support.", href: "/tutors", icon: Languages },
]

export default function DashboardOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Owlio workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Welcome to your Owlio workspace.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Choose a workspace to get started. Your dashboard layout stays consistent as you move between roles.</p>
      </section>
      <section aria-label="Available workspaces" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {workspaces.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} to={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-5 text-slate-500">{description}</p>
          </Link>
        ))}
      </section>
      <p className="flex items-center gap-2 text-sm text-slate-500"><BookOpenCheck className="size-4 text-blue-600" aria-hidden="true" /> Pick the workspace that best fits what you do in Owlio.</p>
    </div>
  )
}
