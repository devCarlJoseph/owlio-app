import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LibraryBig,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router"

type WorkspaceLink = {
  title: string
  description: string
  href: string
  action: string
  icon: LucideIcon
}

const workspaces: WorkspaceLink[] = [
  {
    title: "Lesson plans",
    description: "Prepare reusable language-learning sessions and teaching sequences.",
    href: "/esl/lessons",
    action: "Open lesson plans",
    icon: BookOpenCheck,
  },
  {
    title: "Activities & assessments",
    description: "Explore the activity workspace for language practice and review.",
    href: "/esl/classwork",
    action: "Open activities",
    icon: ClipboardList,
  },
  {
    title: "Lesson attendance",
    description: "Open the attendance workspace for educator-recorded session attendance.",
    href: "/esl/attendance",
    action: "Open attendance",
    icon: UsersRound,
  },
  {
    title: "Lesson schedule",
    description: "View the lesson schedule workspace for dated teaching sessions.",
    href: "/esl/schedule",
    action: "Open schedule",
    icon: CalendarDays,
  },
  {
    title: "Teaching materials",
    description: "Browse the current teaching-material context selector.",
    href: "/esl/materials",
    action: "Open materials",
    icon: LibraryBig,
  },
  {
    title: "Learner progress",
    description: "Open the progress workspace; learner progress records are not connected yet.",
    href: "/esl/progress",
    action: "Open progress",
    icon: GraduationCap,
  },
]

export default function EslLearnersView() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">ESL teaching workspace</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">My Learners</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Organize individual and group teaching contexts, then move into the tools that support your lessons.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-500" />
          Learner records unavailable
        </span>
      </header>

      <section aria-labelledby="directory-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <UsersRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 id="directory-heading" className="text-base font-semibold text-slate-900">Learners &amp; groups</h3>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                Authorized learner and group profiles will appear here when a learner service is available.
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            Not connected
          </span>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center">
          <div className="max-w-2xl">
            <h4 className="text-lg font-semibold tracking-tight text-slate-900">Your learner directory isn’t connected yet</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Learner and group profiles aren’t available in this workspace, so there are no records to display, search, or filter. This page won’t fill the gap with sample learners or unsupported profile details.
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Language levels, lesson history, activities, attendance, feedback, and progress will only appear when their authorized records are supported.
            </p>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Learner data status">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Directory status</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">No learner data loaded</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Learner access must come from an authorized teaching relationship confirmed by the service.
            </p>
          </aside>
        </div>
      </section>

      <section aria-labelledby="teaching-tools-heading">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="teaching-tools-heading" className="text-base font-semibold text-slate-900">Teaching workspaces</h3>
            <p className="mt-1 text-sm text-slate-500">Open a related area. These destinations do not show learner-specific records yet.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map(({ title, description, href, action, icon: Icon }) => (
            <Link
              key={title}
              to={href}
              className="group flex min-h-32 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-white group-hover:text-sky-800">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-800">
                  {action}<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
