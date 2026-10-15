import { ArrowRight, BookOpen, Check, CircleHelp, MonitorUp, Users } from "lucide-react"
import { Link, useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"

const steps = [
  {
    number: "01",
    title: "Classroom",
    description: "A shared home for the people and learning context.",
    icon: Users,
  },
  {
    number: "02",
    title: "Lesson or session",
    description: "Bring the lesson plan, materials, and class activity together.",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "Room",
    description: "Meet, present, and keep the conversation in context.",
    icon: MonitorUp,
  },
]

export default function ClassroomsPage() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? "students"
  const roomPath = `/${role}/classrooms/meeting-room`
  const workspaceLabel = role === "students" ? "Student workspace" : role === "esl" ? "ESL workspace" : `${role[0].toUpperCase()}${role.slice(1)} workspace`

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section className="relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-8 text-slate-900 shadow-sm sm:px-10 sm:py-11">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_12%,rgba(59,130,246,0.1),transparent_34%),linear-gradient(135deg,#ffffff,#f8fafc)]" />
        <div aria-hidden="true" className="absolute -right-16 -top-20 -z-10 size-80 rounded-full border border-blue-100 sm:size-[28rem]" />
        <div aria-hidden="true" className="absolute -right-5 -top-9 -z-10 size-60 rounded-full border border-blue-100 sm:size-[21rem]" />
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
            <span className="size-1.5 rounded-full bg-blue-600" />
            {workspaceLabel}
          </p>
          <h2 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A shared space for every lesson.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Start a live classroom meeting, share an invite, and let learners participate with in-room chat and hand raises.
          </p>
          <Link
            to={roomPath}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Open meeting room
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-xs text-slate-600 sm:absolute sm:bottom-9 sm:right-10 sm:mt-0 sm:border-0 sm:pt-0">
          <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-3.5 text-blue-600" />Live audio and video</span>
          <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-3.5 text-blue-600" />Chat and hand raise</span>
          <span className="inline-flex items-center gap-2"><CircleHelp aria-hidden="true" className="size-3.5 text-blue-600" />Room roster only</span>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
        <section aria-labelledby="classrooms-heading" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Your learning spaces</p>
              <h3 id="classrooms-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Classrooms</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">Not connected</span>
          </div>
          <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center sm:px-8 sm:py-10">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100">
              <BookOpen aria-hidden="true" className="size-5" />
            </div>
            <h4 className="mt-4 text-base font-semibold text-slate-900">Classroom data will appear here</h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Creating classrooms, joining with an invite, and lesson management need a backend contract. No sample classes or participants are shown as real data.
            </p>
          </div>
        </section>

        <section aria-labelledby="flow-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">A connected workflow</p>
          <h3 id="flow-heading" className="mt-2 text-xl font-semibold tracking-tight text-slate-900">From class to conversation</h3>
          <ol className="mt-6 space-y-5">
            {steps.map(({ number, title, description, icon: Icon }, index) => (
              <li key={number} className="relative flex gap-4">
                {index < steps.length - 1 && <span aria-hidden="true" className="absolute left-5 top-11 h-[calc(100%-0.75rem)] w-px bg-slate-200" />}
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-slate-900"><span className="mr-2 font-mono text-xs text-slate-400">{number}</span>{title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-xl bg-white px-4 py-3 text-xs leading-5 text-slate-500 ring-1 ring-slate-200">
            This is the intended product structure, not a connected classroom or meeting service.
          </p>
        </section>
      </div>
    </div>
  )
}
