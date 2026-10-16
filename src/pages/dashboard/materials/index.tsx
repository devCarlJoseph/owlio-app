import {
  ArrowRight,
  BookOpenText,
  CircleHelp,
  FolderOpen,
  GraduationCap,
  NotebookPen,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Link, useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"

type DashboardRole = NonNullable<ReturnType<typeof getDashboardRole>>

type MaterialContext = {
  title: string
  description: string
  action: string
  href: string
  icon: LucideIcon
  iconClassName: string
  eyebrow: string
}

const materialContexts: Record<DashboardRole, MaterialContext[]> = {
  students: [
    {
      title: "Your resources",
      description: "Keep personal notes, references, and study resources in your own workspace.",
      action: "Open notes",
      href: "/students/notes",
      icon: NotebookPen,
      iconClassName: "bg-amber-100 text-amber-800",
      eyebrow: "Personal",
    },
    {
      title: "Classroom materials",
      description: "Find educator-published resources alongside the classroom or lesson they belong to.",
      action: "Browse classrooms",
      href: "/students/classrooms",
      icon: GraduationCap,
      iconClassName: "bg-sky-100 text-sky-800",
      eyebrow: "Classroom",
    },
    {
      title: "Study-space resources",
      description: "Peer-shared materials stay with the student-created space where they were shared.",
      action: "Open study spaces",
      href: "/students/study-spaces",
      icon: Users,
      iconClassName: "bg-emerald-100 text-emerald-800",
      eyebrow: "Peer-shared",
    },
  ],
  educators: [
    {
      title: "Classroom materials",
      description: "Keep teaching resources connected to the classroom, topic, or lesson they support.",
      action: "Browse classrooms",
      href: "/educators/classrooms",
      icon: GraduationCap,
      iconClassName: "bg-sky-100 text-sky-800",
      eyebrow: "Educator-published",
    },
  ],
  tutors: [
    {
      title: "Classroom materials",
      description: "Keep resources connected to the learners and teaching context they support.",
      action: "Browse classrooms",
      href: "/tutors/classrooms",
      icon: GraduationCap,
      iconClassName: "bg-sky-100 text-sky-800",
      eyebrow: "Teaching",
    },
    {
      title: "Session resources",
      description: "Tutoring materials can be organized around a learner, topic, lesson, skill, or session.",
      action: "View sessions",
      href: "/tutors/sessions",
      icon: BookOpenText,
      iconClassName: "bg-amber-100 text-amber-800",
      eyebrow: "Tutoring",
    },
  ],
  esl: [
    {
      title: "Classroom materials",
      description: "Keep resources connected to the class or language lesson they support.",
      action: "Browse classrooms",
      href: "/esl/classrooms",
      icon: GraduationCap,
      iconClassName: "bg-sky-100 text-sky-800",
      eyebrow: "Teaching",
    },
    {
      title: "Lesson resources",
      description: "Language-learning resources belong with the lesson or skill they support.",
      action: "View lessons",
      href: "/esl/lessons",
      icon: BookOpenText,
      iconClassName: "bg-amber-100 text-amber-800",
      eyebrow: "ESL",
    },
  ],
}

export default function MaterialsPage() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? "students"
  const contexts = materialContexts[role]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <section className="relative isolate overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-9 sm:py-10 lg:px-11">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-40 -z-10 size-96 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-52 left-1/3 -z-10 size-96 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.65fr)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Learning library
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Every resource has a home.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Start in the place that owns the material: your workspace, a classroom, a lesson, or a
              study space.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Keep context clear
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-amber-300" aria-hidden="true" />
                Personal work stays yours
              </li>
              <li className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-sky-300" aria-hidden="true" />
                Classroom materials stay with the class
              </li>
              {role === "students" && (
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-emerald-300" aria-hidden="true" />
                  Peer resources stay with the study space
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="material-contexts-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Start with the right context
            </p>
            <h3 id="material-contexts-heading" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Where are you learning?
            </h3>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-500">
            Personal resources, peer-shared files, and educator-published classroom materials are kept distinct.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {contexts.map((context) => {
            const Icon = context.icon

            return (
              <Link
                key={context.title}
                to={context.href}
                className="group flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`inline-flex size-11 items-center justify-center rounded-xl ${context.iconClassName}`}>
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {context.eyebrow}
                  </span>
                </div>
                <h4 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                  {context.title}
                </h4>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{context.description}</p>
                <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-slate-800">
                  {context.action}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <aside className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 sm:p-6">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <FolderOpen aria-hidden="true" className="size-4" />
        </span>
        <div className="flex gap-3">
          <CircleHelp aria-hidden="true" className="mt-0.5 hidden size-4 shrink-0 text-slate-400 sm:block" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Your material library is not connected yet</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              This page helps you find the right learning context. Resource browsing, uploads, and sharing
              will be available when the materials service is in place.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
