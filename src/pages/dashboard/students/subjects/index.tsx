export default function StudentSubjectsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Personal workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">My subjects</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Organize learning by subject whether or not your school or instructor uses Owlio.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Subject workspace sections">
        {[
          ["Notes", "Keep personal notes connected to the subject they support."],
          ["Materials", "Collect study resources and reference links in one place."],
          ["Tasks and deadlines", "Plan personal study alongside, but separately from, assigned classwork."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-label="Subject list">
        <h3 className="text-base font-semibold text-slate-900">Your subjects</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Personal subject creation and saved subject data are not connected yet.</p>
      </section>
    </div>
  )
}