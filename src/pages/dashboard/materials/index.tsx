export default function MaterialsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Learning resources</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Materials</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Find learning resources in the context where they belong: your workspace, a study space, or a classroom lesson.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Material locations">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">My resources</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Personal notes, files, and reference links stay under your ownership.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Classroom materials</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Educator-published resources are organized with their classroom or lesson.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Study-space resources</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Peer-shared materials belong to the student-created space where they were shared.</p>
        </article>
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-label="Materials availability">
        <p className="text-sm font-semibold text-slate-900">No materials are connected</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Uploads, links, and resource lists will appear here when storage and sharing workflows are implemented.</p>
      </section>
    </div>
  )
}