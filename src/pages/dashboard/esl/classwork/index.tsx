export default function EslClassworkPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">ESL workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Activities and assessments</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Prepare language practice, review learner work, and provide clear feedback in the lesson context.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Language activity types">
        {[
          ["Vocabulary and grammar", "Practice words, structures, and usage."],
          ["Reading and listening", "Build comprehension through lesson resources."],
          ["Speaking and writing", "Support conversation, prompts, and written practice."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="esl-feedback-heading">
        <h3 id="esl-feedback-heading" className="text-base font-semibold text-slate-900">Review and feedback</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Educators retain control over assessments and learner feedback. No ESL activities or submissions are connected.</p>
      </section>
    </div>
  )
}