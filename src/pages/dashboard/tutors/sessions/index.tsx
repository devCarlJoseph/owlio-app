export default function TutorSessionsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Tutoring workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Tutoring sessions</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Plan flexible one-to-one or group learning around the learner, lesson, and session format.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Tutoring session planning">
        {[
          ["Learners", "Keep the learner or group connected to each tutoring context."],
          ["Lesson focus", "Organize a session around its subject, skill, or learning objective."],
          ["Timing", "Recurring sessions and meeting details require an implemented schedule workflow."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-label="Upcoming tutoring sessions">
        <h3 className="text-base font-semibold text-slate-900">Upcoming sessions</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">No tutoring sessions are loaded. Scheduling and meeting links are not connected.</p>
      </section>
    </div>
  )
}