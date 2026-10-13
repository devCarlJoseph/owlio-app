export default function TutorLearnersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Tutoring workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Learners</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Keep learner context together across tutoring sessions, materials, activities, and feedback.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Tutoring learner context">
        {[
          ["Learning focus", "Subjects, skills, and learner level where provided."],
          ["Session history", "Sessions and attendance connected to this tutoring relationship."],
          ["Progress and feedback", "Evaluations and notes kept in the relevant learning context."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600" role="status">Learner profiles and tutoring history are not loaded. Do not treat tutoring evaluations as school grades.</p>
    </div>
  )
}