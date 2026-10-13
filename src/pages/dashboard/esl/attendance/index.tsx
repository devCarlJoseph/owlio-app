export default function EslAttendancePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">ESL classroom records</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Lesson attendance</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Review participation for language lessons and learner groups in their session context.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="ESL attendance views">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Lesson check-in</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Any check-in window must be opened for an active lesson and verified by the service.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No active lessons are loaded.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Participation history</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Lesson attendance is an educator-controlled classroom record.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Attendance history is not connected.</p>
        </article>
      </section>
    </div>
  )
}