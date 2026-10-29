import {
  ArrowUpRight,
  BookOpen,
  BookOpenText,
  CalendarDays,
  ClipboardList,
  Users,
  Video,
  Clock,
  CheckCircle2,
  TrendingUp,
  Play,
  GraduationCap,
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

const upcomingSessions = [
  {
    id: 1,
    learner: "Sarah Johnson",
    subject: "Calculus",
    time: "Today, 3:00 PM",
    duration: "1 hour",
    type: "online",
    hasMeetingRoom: true,
  },
  {
    id: 2,
    learner: "Michael Chen",
    subject: "Physics",
    time: "Tomorrow, 10:00 AM",
    duration: "45 min",
    type: "online",
    hasMeetingRoom: true,
  },
  {
    id: 3,
    learner: "Study Group - Python",
    subject: "Programming",
    time: "Fri, 2:00 PM",
    duration: "1.5 hours",
    type: "online",
    hasMeetingRoom: true,
  },
]

const pendingActivities = [
  {
    id: 1,
    learner: "Sarah Johnson",
    activity: "Calculus Quiz #3",
    submitted: "2 hours ago",
    status: "needs review",
  },
  {
    id: 2,
    learner: "Emma Wilson",
    activity: "Physics Lab Report",
    submitted: "Yesterday",
    status: "needs review",
  },
]

const followUpItems = [
  {
    id: 1,
    learner: "Michael Chen",
    task: "Review feedback from last session",
    priority: "high",
  },
  {
    id: 2,
    learner: "Study Group - Python",
    task: "Prepare group project materials",
    priority: "medium",
  },
]

const stats = [
  {
    label: "Total Sessions",
    value: "12",
    change: "+3 this week",
    changeType: "positive",
    icon: CalendarDays,
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    label: "Total Hours",
    value: "18.5",
    change: "+4.5 this week",
    changeType: "positive",
    icon: Clock,
    iconColor: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Active Learners",
    value: "4",
    change: "+1 this month",
    changeType: "positive",
    icon: Users,
    iconColor: "bg-purple-100 text-purple-600",
  },
  {
    label: "Activities Reviewed",
    value: "8",
    change: "+2 this week",
    changeType: "positive",
    icon: ClipboardList,
    iconColor: "bg-amber-100 text-amber-600",
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">Welcome back</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Keep sessions, learner work, and follow-ups in view.
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700">
              You have {upcomingSessions.length} upcoming sessions and {pendingActivities.length} activities to review.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950">
            <span aria-hidden="true" className="size-2 rounded-full bg-emerald-500" />
            Preview mode active
          </span>
        </div>
      </section>

      <section aria-label="Statistics" className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Your progress</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">This week's overview</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.iconColor}`}>
                  <stat.icon aria-hidden="true" className="size-5" />
                </span>
                <TrendingUp aria-hidden="true" className="size-4 text-emerald-600" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
              </div>
              <p className="mt-2 text-xs text-emerald-600">{stat.change}</p>
            </article>
          ))}
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
              View all <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {upcomingSessions.map((session) => (
              <article
                key={session.id}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <CalendarDays aria-hidden="true" className="size-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{session.learner}</p>
                      <p className="mt-0.5 text-sm text-slate-600">{session.subject}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900">
                      {session.type}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock aria-hidden="true" className="size-3.5" />
                      {session.time}
                    </span>
                    <span>• {session.duration}</span>
                    {session.hasMeetingRoom && (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Video aria-hidden="true" className="size-3.5" />
                        Meeting Room
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <ActionQueue
            id="activity-review"
            title="Activity review"
            count={pendingActivities.length}
            items={pendingActivities}
            href="/tutors/classwork"
            linkLabel="Open activities"
            icon={ClipboardList}
            tone="orange"
          />
          <ActionQueue
            id="learner-follow-ups"
            title="Learner follow-ups"
            count={followUpItems.length}
            items={followUpItems}
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
              className="group flex min-h-32 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:transform-none"
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

function ActionQueue({
  id,
  title,
  count,
  items,
  href,
  linkLabel,
  icon: Icon,
  tone,
}: {
  id: string
  title: string
  count: number
  items: Array<{ learner: string; activity?: string; task?: string; priority?: string; submitted?: string }>
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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">
            {count} {count === 1 ? 'item' : 'items'}
          </p>
          <h3 id={`${id}-title`} className="mt-1 text-lg font-semibold">{title}</h3>
        </div>
        <Icon aria-hidden="true" className="size-5 shrink-0 opacity-80" />
      </div>
      <div className="mt-3 space-y-2.5 flex-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2 rounded-lg bg-white/50 p-2.5">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 opacity-60" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.learner}</p>
              <p className="text-xs opacity-80">{item.activity || item.task}</p>
            </div>
          </div>
        ))}
      </div>
      <Link
        to={href}
        className="mt-auto inline-flex min-h-10 w-fit items-center gap-1 pt-4 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
      >
        {linkLabel} <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}
