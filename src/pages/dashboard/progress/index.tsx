export default function ProgressPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Learning history</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Progress</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Personal learning activity and educator-controlled classroom records have different owners and should be reviewed in their proper context.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Progress views">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Personal learning</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">A learner's own study tasks, history, and goals belong to their personal workspace.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Personal progress data is not connected.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Classroom progress</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Grades, attendance, feedback, and official class activity are educator-controlled records.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No classroom records are loaded here.</p>
        </article>
      </section>
    </div>
  )
}