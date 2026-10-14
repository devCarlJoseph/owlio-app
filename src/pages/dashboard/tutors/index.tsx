import { CalendarDays, ClipboardList, Clock, Sparkles, Users, type LucideIcon } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

const stats: { label: string; icon: LucideIcon; iconColor: string }[] = [
  { label: "Active learners", icon: Users, iconColor: "bg-blue-50 text-blue-700" },
  { label: "Upcoming sessions", icon: CalendarDays, iconColor: "bg-emerald-50 text-emerald-700" },
  { label: "Hours taught", icon: Clock, iconColor: "bg-violet-50 text-violet-700" },
  { label: "Pending reviews", icon: ClipboardList, iconColor: "bg-amber-50 text-amber-700" },
]

function StatCard({ label, icon: Icon, iconColor }: { label: string; icon: LucideIcon; iconColor: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">--</p>
          <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-0.5 text-xs text-slate-400">No data yet</p>
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", iconColor)}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className="size-6 text-slate-400" aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
    </div>
  )
}

export default function TutorsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Tutors workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Your tutoring at a glance.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Track your learners, upcoming sessions, and teaching activity in one place.
        </p>
      </section>

      <section aria-label="Tutoring statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, icon, iconColor }) => (
          <StatCard key={label} label={label} icon={icon} iconColor={iconColor} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-label="Upcoming sessions"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Upcoming sessions</h3>
            <Button render={<Link to="/tutors/sessions" />} variant="link" size="sm">
              View all
            </Button>
          </div>
          <div className="mt-4">
            <EmptyState
              icon={CalendarDays}
              title="No upcoming sessions"
              description="Your scheduled tutoring sessions will appear here."
            />
          </div>
        </section>

        <section
          aria-label="AI recommendations"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600" aria-hidden="true" />
            <h3 className="text-base font-semibold text-slate-900">AI suggestions</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">Teaching ideas and activity suggestions</p>
          <div className="mt-4">
            <EmptyState
              icon={Sparkles}
              title="AI suggestions unavailable"
              description="AI-powered teaching suggestions will appear here once connected."
            />
          </div>
        </section>
      </div>
    </div>
  )
}
