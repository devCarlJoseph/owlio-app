export default function EducatorClassworkPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Educator workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Classwork and assessment</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Prepare activities, review learner submissions, and provide grades or feedback in the correct classroom.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Classwork management">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Create activities</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">The product plan includes quizzes, exams, assignments, discussions, reading activities, and practical work.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Activity authoring is not connected.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Review submissions</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review files, links, and responses, then provide educator-controlled evaluations and feedback.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No classroom submissions are loaded.</p>
        </article>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="assessment-control-heading">
        <h3 id="assessment-control-heading" className="text-base font-semibold text-slate-900">Assessment control</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Objective grading may use educator-defined rules. AI suggestions must remain editable and cannot publish final grades on an educator's behalf.</p>
      </section>
    </div>
  )
}