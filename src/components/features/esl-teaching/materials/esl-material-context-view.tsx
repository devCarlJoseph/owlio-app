import { ArrowLeft, BookOpenText, GraduationCap, Info } from "lucide-react"
import { Link, useParams } from "react-router"

const contexts = {
  classrooms: {
    label: "Classroom materials",
    description: "Resources associated with a class and the language lessons taught there.",
    guidance: "Use this area when a resource belongs to a classroom context. Classroom membership and resource access are determined by the service when connected.",
    icon: GraduationCap,
  },
  lessons: {
    label: "Lesson resources",
    description: "Resources prepared for reuse with a lesson, topic, or language skill.",
    guidance: "Lesson plans and resource links are not connected yet. Private teacher materials remain private until an explicit sharing workflow is available.",
    icon: BookOpenText,
  },
}

export default function EslMaterialContextView() {
  const { context } = useParams()
  const selected = context === "classrooms" || context === "lessons" ? contexts[context] : null
  const Icon = selected?.icon ?? Info

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link to="/esl/materials" className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to Teaching Materials
      </Link>
      <header className="rounded-3xl bg-slate-950 p-6 text-white sm:p-9">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white/10 text-emerald-200">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Teaching Materials</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{selected?.label ?? "Resource context"}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{selected?.description ?? "This resource context is not available."}</p>
      </header>
      <section aria-labelledby="materials-empty-heading" className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Info aria-hidden="true" className="size-5" /></span>
          <div>
            <h3 id="materials-empty-heading" className="font-semibold text-slate-900">Materials are not connected yet</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{selected?.guidance ?? "Return to Teaching Materials and choose a classroom or lesson context."} Resource browsing, uploads, previews, and sharing are unavailable until a materials service is implemented.</p>
            <Link to="/esl/materials" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">Back to contexts <ArrowLeft aria-hidden="true" className="size-4 rotate-180" /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
