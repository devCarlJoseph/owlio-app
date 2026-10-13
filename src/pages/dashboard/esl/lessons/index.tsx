export default function EslLessonsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">ESL workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Language lessons</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Organize English-language lessons around learner needs, clear objectives, and practical language use.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Language lesson skills">
        {[
          ["Speaking", "Conversation and spoken practice."],
          ["Listening", "Listening comprehension and response."],
          ["Reading", "Reading practice and comprehension."],
          ["Writing", "Writing practice, grammar, and vocabulary."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-label="Language lessons">
        <h3 className="text-base font-semibold text-slate-900">Your lessons</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Lesson plans, learner levels, and session schedules are not connected yet.</p>
      </section>
    </div>
  )
}