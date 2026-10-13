export default function TutorClassworkPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Tutoring workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Activities and evaluations</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Prepare practice for a tutoring lesson, review learner work, and give actionable feedback.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Tutoring activity workflows">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Lesson activities</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Connect exercises and materials to a learner, skill, topic, or tutoring session.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Activity creation is not connected.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Evaluations and feedback</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Record learner evaluations and feedback in the appropriate tutoring context.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No learner work or evaluations are loaded.</p>
        </article>
      </section>
    </div>
  )
}