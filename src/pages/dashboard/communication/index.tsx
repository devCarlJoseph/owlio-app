import { useState } from "react"
import { Link, useLocation } from "react-router"
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenText,
  Megaphone,
  MessagesSquare,
  School,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDashboardRole } from "@/components/common/dashboard-navigation"

const communicationTypes = [
  {
    id: "discussions",
    label: "Discussions",
    icon: MessagesSquare,
    heading: "Discussions will live here",
    description: "Questions and replies stay connected to the classroom, lesson, or peer space they belong to.",
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: Megaphone,
    heading: "Announcements will appear here",
    description: "Classroom updates and supported study-space notices keep their author and context visible.",
  },
  {
    id: "polls",
    label: "Polls",
    icon: BarChart3,
    heading: "Polls will appear here",
    description: "Polls belong to the class or study space where they were created.",
  },
] as const

type CommunicationType = (typeof communicationTypes)[number]["id"]

export default function CommunicationPage() {
  const [activeType, setActiveType] = useState<CommunicationType>("discussions")
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname)
  const activeItem = communicationTypes.find(({ id }) => id === activeType) ?? communicationTypes[0]
  const ActiveIcon = activeItem.icon
  const classroomsHref = role ? `/${role}/classrooms` : null
  const isStudentWorkspace = role === "students"

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative isolate overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 text-white shadow-sm sm:p-8">
        <div aria-hidden="true" className="absolute -right-14 -top-24 -z-10 size-72 rounded-full border border-teal-200/10 surface-dark:border-surface-teal-border/10" />
        <div aria-hidden="true" className="absolute -right-2 -top-12 -z-10 size-48 rounded-full border border-teal-200/10 surface-dark:border-surface-teal-border/10" />
        <div className="max-w-3xl">
          <Badge className="border border-teal-200/20 surface-dark:border-surface-teal-border/20 bg-teal-300/10 surface-dark:bg-surface-teal-strong/10 text-teal-100 hover:bg-teal-300/10 surface-dark:hover:bg-surface-teal-strong/10">
            Shared workspace
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Communication</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Keep conversations connected to the classroom, lesson, or peer space they belong to.
            Clear context helps everyone know where a message fits.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Communication formats">
          {communicationTypes.map(({ id, label, icon: Icon }) => (
            <span key={id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
              <Icon className="size-3.5 text-teal-200" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card shadow-sm" aria-labelledby="communication-feed-title">
          <div className="flex flex-col gap-3 border-b border-slate-100 surface-dark:border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 id="communication-feed-title" className="text-base font-semibold text-slate-900 surface-dark:text-foreground">Your communication</h3>
              <p className="mt-1 text-sm text-slate-500 surface-dark:text-muted-foreground">Choose a format to see its context and availability.</p>
            </div>
            <Badge variant="outline" className="w-fit border-amber-200 surface-dark:border-surface-amber-border bg-amber-50 surface-dark:bg-surface-amber-soft text-amber-800 surface-dark:text-amber-300">
              Not connected
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4 sm:px-6" role="group" aria-label="Communication format">
            {communicationTypes.map(({ id, label, icon: Icon }) => {
              const selected = id === activeType
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveType(id)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:text-sm ${
                    selected
                      ? "border-teal-200 surface-dark:border-surface-teal-border bg-teal-50 surface-dark:bg-surface-teal-soft text-teal-900 surface-dark:text-teal-200"
                      : "border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card text-slate-600 surface-dark:text-muted-foreground hover:bg-slate-50 surface-dark:hover:bg-background"
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 surface-dark:border-border bg-slate-50/70 surface-dark:bg-background/70 px-5 py-8 text-center">
              <div aria-hidden="true" className="absolute -right-8 -top-8 size-36 rounded-full bg-teal-100/50 surface-dark:bg-surface-teal-soft/50 blur-2xl" />
              <div className="relative flex size-14 items-center justify-center rounded-2xl border border-teal-100 surface-dark:border-surface-teal-border bg-white surface-dark:bg-card text-teal-700 surface-dark:text-teal-300 shadow-sm">
                <ActiveIcon className="size-6" aria-hidden="true" />
              </div>
              <h4 className="relative mt-4 text-base font-semibold text-slate-900 surface-dark:text-foreground">{activeItem.heading}</h4>
              <p className="relative mt-2 max-w-md text-sm leading-6 text-slate-600 surface-dark:text-muted-foreground">{activeItem.description}</p>
              <p className="relative mt-4 max-w-lg text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground" role="status">
                Posts, replies, and polls are not connected yet, so this page is not showing live activity.
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-5" aria-label="Communication context">
          <section className="rounded-2xl border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 surface-dark:bg-surface-cyan-soft text-cyan-800 surface-dark:text-cyan-300">
                <BookOpenText className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 surface-dark:text-foreground">Start with a space</h3>
                <p className="mt-1 text-sm leading-5 text-slate-600 surface-dark:text-muted-foreground">
                  Messages should stay with the class, lesson, or group they are about.
                </p>
              </div>
            </div>
            {classroomsHref && (
              <Button
                render={<Link to={classroomsHref} />}
                variant="outline"
                className="mt-5 w-full justify-between border-slate-200 surface-dark:border-border text-slate-700 surface-dark:text-foreground hover:border-teal-200 surface-dark:hover:border-surface-teal-border hover:bg-teal-50 surface-dark:hover:bg-surface-teal-soft hover:text-teal-900 surface-dark:hover:text-teal-200"
              >
                <span className="inline-flex items-center gap-2">
                  <School className="size-4" aria-hidden="true" />
                  Open classrooms
                </span>
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Button>
            )}
          </section>

          {isStudentWorkspace && (
            <section className="rounded-2xl border border-sky-200 surface-dark:border-surface-sky-border bg-sky-50/60 surface-dark:bg-surface-sky-soft/60 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white surface-dark:bg-card text-sky-800 surface-dark:text-sky-300">
                  <Users className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 surface-dark:text-foreground">Peer spaces stay peer-led</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600 surface-dark:text-muted-foreground">
                    Study-space conversations are separate from official classroom records.
                  </p>
                </div>
              </div>
              <Button
                render={<Link to="/students/study-spaces" />}
                variant="outline"
                className="mt-5 w-full justify-between border-sky-200 surface-dark:border-surface-sky-border bg-white surface-dark:bg-card text-sky-900 surface-dark:text-sky-200 hover:bg-sky-100 surface-dark:hover:bg-surface-sky-soft"
              >
                Open study spaces
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </section>
          )}

          <p className="px-1 text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">
            Communication features are a UI preview only. Creating, sending, replying, and voting require a supported service.
          </p>
        </aside>
      </div>
    </div>
  )
}
