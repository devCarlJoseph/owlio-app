export default function ClassroomsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Shared learning</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Classrooms</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Classrooms connect learners and educators around lessons, learning materials, classwork, and progress.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Classroom workflows by role">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">For students</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Join a classroom and access the learning activities and materials shared with you.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">For educators</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Organize a class, learners, lessons, and official classroom records.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">For tutors and ESL teachers</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use a flexible learning space for individual or group instruction.</p>
        </article>
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-labelledby="classroom-list-heading">
        <h3 id="classroom-list-heading" className="text-base font-semibold text-slate-900">Your classrooms</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Classroom lists, joining, and management are not connected yet. No classroom data is being displayed.</p>
      </section>
    </div>
  )
}