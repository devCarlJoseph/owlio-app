export default function TutorAttendancePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Tutoring records</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Session attendance</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Keep participation history connected to tutoring sessions and learners without assuming a school timetable.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Tutoring attendance views">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Session check-in</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">An attendance period belongs to a scheduled session and its authorized participants.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No sessions are active.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Participation history</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review attendance over time for the learners and sessions you manage.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Attendance history is not connected.</p>
        </article>
      </section>
    </div>
  )
}