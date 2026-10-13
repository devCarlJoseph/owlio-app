export default function StudentClassworkPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Classroom learning</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">My classwork</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Find educator-assigned activities, complete the work, and review released feedback in its classroom context.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Classwork stages">
        {[
          ["To do", "Activities assigned to you will appear here."],
          ["Submitted", "Submission status belongs to the relevant classroom activity."],
          ["Feedback", "Released grades and educator feedback appear with the work."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600" role="status">Classroom assignments and submissions are not loaded on this page yet. Personal tasks remain separate from official classwork.</p>
    </div>
  )
}