import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  Clock3,
  Plus,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

const summaries: { label: string; icon: LucideIcon }[] = [
  { label: "Learners & groups", icon: UsersRound },
  { label: "Upcoming lessons", icon: CalendarDays },
  { label: "To review", icon: ClipboardCheck },
  { label: "Attendance", icon: CheckCheck },
]

const quickActions = [
  { label: "Add a learner", description: "Organize your learner context", href: "/esl/learners", icon: UsersRound },
  { label: "Create a lesson plan", description: "Prepare reusable lesson content", href: "/esl/lessons", icon: BookOpen },
  { label: "Schedule a lesson", description: "Plan a dated teaching session", href: "/esl/schedule", icon: CalendarDays },
  { label: "Open Meeting Room", description: "Start or join a teaching room", href: "/esl/classrooms/meeting-room", icon: Video },
]

function SummaryCard({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <article className="flex min-h-24 items-center gap-4 border-r border-slate-200 px-5 last:border-r-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-slate-800" aria-label={`${label}: unavailable`}>—</p>
        <p className="text-xs font-medium text-slate-600">{label}</p>
        <p className="mt-0.5 text-[10px] text-slate-400">Not connected</p>
      </div>
    </article>
  )
}

function EmptyPanel({
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
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h4 className="mt-3 text-sm font-semibold text-slate-800">{title}</h4>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{description}</p>
      <Button render={<Link to={href} />} variant="link" size="sm" className="mt-2">
        {action}<ArrowRight className="ml-1 size-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}

export default function EslOverviewView() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">ESL teaching workspace</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Your teaching at a glance</h2>
          <p className="mt-1.5 text-sm text-slate-500">Keep learners, lesson preparation, and upcoming teaching in view.</p>
        </div>
        <Button render={<Link to="/esl/learners" />}>
          <Plus className="size-4" aria-hidden="true" /> Add learner
        </Button>
      </header>

      <section aria-label="Teaching overview" className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((summary) => <SummaryCard key={summary.label} {...summary} />)}
      </section>

      <nav aria-label="ESL overview sections" className="flex gap-6 overflow-x-auto border-b border-slate-200 px-1">
        <a href="#upcoming-lessons" className="flex shrink-0 items-center gap-2 border-b-2 border-sky-700 pb-3 text-xs font-semibold text-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
          <CalendarDays className="size-4" aria-hidden="true" /> UPCOMING
        </a>
        <a href="#action-queue" className="flex shrink-0 items-center gap-2 border-b-2 border-transparent pb-3 text-xs font-medium text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
          <ClipboardCheck className="size-4" aria-hidden="true" /> PREPARATION & REVIEW
        </a>
        <a href="#quick-actions" className="flex shrink-0 items-center gap-2 border-b-2 border-transparent pb-3 text-xs font-medium text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
          <Plus className="size-4" aria-hidden="true" /> QUICK ACTIONS
        </a>
      </nav>

      <div className="grid gap-5 xl:grid-cols-3">
        <section id="upcoming-lessons" aria-label="Upcoming lessons" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Coming up</h3>
              <p className="mt-0.5 text-xs text-slate-500">One-to-one and group lessons</p>
            </div>
            <Button render={<Link to="/esl/schedule" />} variant="outline" size="sm">Lesson schedule</Button>
          </div>
          <EmptyPanel
            icon={CalendarDays}
            title="Upcoming lessons will appear here"
            description="Lesson times and learner or group details will show when connected lesson records are available."
            href="/esl/schedule"
            action="View lesson schedule"
          />
        </section>

        <section id="action-queue" aria-label="Preparation and review" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Preparation & review</h3>
            <p className="mt-0.5 text-xs text-slate-500">Follow-ups based on your teaching records</p>
          </div>
          <EmptyPanel
            icon={Clock3}
            title="No connected follow-ups"
            description="Lesson preparation, submissions to review, feedback, and attendance tasks are not loaded."
            href="/esl/classwork"
            action="View activities"
          />
        </section>
      </div>

      <section id="quick-actions" aria-label="Quick actions" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
          <p className="mt-0.5 text-xs text-slate-500">Go straight to a teaching workspace</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ label, description, href, icon: Icon }) => (
            <Link key={label} to={href} className="group flex min-h-20 items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-sky-300 hover:bg-sky-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-sky-800">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-800">{label}</span>
                <span className="mt-0.5 block text-xs leading-4 text-slate-500">{description}</span>
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 text-slate-400 group-hover:text-sky-700" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
