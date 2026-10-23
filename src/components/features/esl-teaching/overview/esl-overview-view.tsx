import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  FolderOpen,
  Languages,
  LockKeyhole,
  MessagesSquare,
  Sparkles,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router"

const workflowGroups: {
  title: string
  description: string
  links: { label: string; description: string; href: string; icon: LucideIcon }[]
}[] = [
  {
    title: "Teaching",
    description: "Prepare learning and support your learners.",
    links: [
      { label: "My Learners", description: "Learner and group workspace", href: "/esl/learners", icon: UsersRound },
      { label: "Lesson Plans", description: "Reusable lesson preparation", href: "/esl/lessons", icon: BookOpen },
      { label: "Teaching Materials", description: "Browse lesson contexts", href: "/esl/materials", icon: FolderOpen },
      { label: "Activities & Assessments", description: "Language practice activities", href: "/esl/classwork", icon: ClipboardList },
      { label: "Lesson Attendance", description: "Attendance workspace", href: "/esl/attendance", icon: CalendarCheck },
    ],
  },
  {
    title: "Live learning",
    description: "Move between scheduled lessons and live sessions.",
    links: [
      { label: "Meeting Room", description: "Open the standalone live room", href: "/esl/classrooms/meeting-room", icon: Video },
      { label: "Lesson Schedule", description: "View the schedule workspace", href: "/esl/schedule", icon: CalendarDays },
    ],
  },
  {
    title: "Communication",
    description: "Open contextual conversations and updates.",
    links: [
      { label: "Discussions", description: "Discussion workspace preview", href: "/esl/communication", icon: MessagesSquare },
      { label: "Notifications", description: "Notification workspace", href: "/esl/notifications", icon: Bell },
    ],
  },
  {
    title: "Progress & support",
    description: "Explore learner progress and teaching support.",
    links: [
      { label: "Learner Progress", description: "Progress workspace", href: "/esl/progress", icon: ChartNoAxesCombined },
      { label: "AI Lesson Assistant", description: "Teacher support workspace", href: "/esl/ai-assistant", icon: Sparkles },
    ],
  },
]

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  href: string
  action: string
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h4 className="mt-3 text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>
      <Link to={href} className="mt-3 inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-sky-800 underline-offset-4 hover:text-sky-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2">
        {action}<ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}

export default function EslOverviewView() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 pb-8">
      <header className="relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-24 -z-10 size-72 rounded-full bg-sky-100/70 blur-3xl" aria-hidden="true" />
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800">
              <Languages className="size-3.5" aria-hidden="true" /> ESL teaching workspace
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Your teaching, in one place.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Your teaching workspace for lesson preparation, learner support, and live learning.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/esl/lessons" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2">
              <BookOpen className="size-4" aria-hidden="true" /> Lesson Plans <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <Link to="/esl/classrooms/meeting-room" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2">
              <Video className="size-4" aria-hidden="true" /> Meeting Room <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.85fr)]">
        <section aria-labelledby="upcoming-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-800">Live learning</p>
              <h3 id="upcoming-heading" className="mt-1 text-base font-semibold text-slate-900">Today / Upcoming Lessons</h3>
              <p className="mt-1 text-xs text-slate-500">One-to-one and group lessons</p>
            </div>
            <Link to="/esl/schedule" className="inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-xs font-semibold text-sky-800 underline-offset-4 hover:text-sky-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700">Open schedule <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
          </div>
          <EmptyState icon={CalendarDays} title="Lesson details will appear here" description="Lesson times and learner or group details are not connected yet, so this overview has no live sessions to show." href="/esl/schedule" action="View lesson schedule" />
        </section>

        <section aria-labelledby="followups-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-800">Your next steps</p>
            <h3 id="followups-heading" className="mt-1 text-base font-semibold text-slate-900">Action Needed</h3>
            <p className="mt-1 text-xs text-slate-500">Follow-ups from your teaching records</p>
          </div>
          <EmptyState icon={ClipboardList} title="No connected follow-ups" description="Lesson preparation, activity reviews, feedback, and attendance tasks are not loaded here." href="/esl/classwork" action="Open activities" />
        </section>
      </div>

      <section aria-labelledby="workspaces-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-800">Explore your workspace</p>
            <h3 id="workspaces-heading" className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Teaching Shortcuts</h3>
          </div>
          <p className="max-w-lg text-xs leading-5 text-slate-500">These links open registered pages. Connected records and actions depend on the services available in each workspace.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {workflowGroups.map((group) => (
            <section key={group.title} aria-label={group.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h4 className="text-sm font-semibold text-slate-900">{group.title}</h4>
              <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{group.description}</p>
              <ul className="mt-3 space-y-1">
                {group.links.map(({ label, description, href, icon: Icon }) => (
                  <li key={href}>
                    <Link to={href} className="group flex min-h-12 items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 transition-colors hover:border-sky-100 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-1">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-sky-50 group-hover:text-sky-800"><Icon className="size-4" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-900">{label}</span>
                        <span className="mt-0.5 block text-xs leading-4 text-slate-500">{description}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-slate-400 transition-colors group-hover:text-sky-800" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <footer className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600 sm:flex-row sm:items-center">
        <LockKeyhole className="size-4 shrink-0 text-sky-800" aria-hidden="true" />
        <p>Private teaching notes and learner-visible feedback have separate audiences. Meeting Room presence is not an attendance record.</p>
        <Link to="/esl/account/security" className="inline-flex min-h-9 shrink-0 items-center gap-1 font-semibold text-sky-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700">Account security <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
      </footer>
    </main>
  )
}
