export default function StudentNotesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Personal workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">My notes</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Keep your own study notes organized by subject, lesson, or topic.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_2fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="note-subjects-heading">
          <h3 id="note-subjects-heading" className="text-sm font-semibold text-slate-900">Subjects</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Choose a subject to organize related notes and references.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No saved subjects are connected.</p>
        </article>
        <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm" aria-labelledby="note-content-heading">
          <h3 id="note-content-heading" className="text-sm font-semibold text-slate-900">Note details</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Select a subject to view its notes. Personal notes are not shared with a classroom unless you explicitly choose to share them.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Note editing and storage are not connected yet.</p>
        </article>
      </section>
    </div>
  )
}