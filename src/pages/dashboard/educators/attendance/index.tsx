export default function EducatorAttendancePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Classroom records</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Attendance</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Review attendance by classroom and session. Official attendance is managed by authorized educators.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Attendance workflows">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Active sessions</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Open a check-in period or record a roll call for an authorized classroom session.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No active classroom sessions are loaded.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Attendance history</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review session and learner records with statuses such as present, absent, late, or excused.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Attendance history is not connected.</p>
        </article>
      </section>
    </div>
  )
}