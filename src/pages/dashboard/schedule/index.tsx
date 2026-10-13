export default function SchedulePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Calendar</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Schedule</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Keep personal study plans, classroom sessions, tutoring lessons, and learning deadlines in view.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Schedule categories">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Personal study</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Study sessions and personal deadlines belong to your own workspace.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Classes and lessons</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Classroom schedules and flexible tutoring sessions stay attached to their learning context.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Deadlines</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Personal task due dates remain distinct from educator-assigned deadlines.</p>
        </article>
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-label="Schedule availability">
        <p className="text-sm font-semibold text-slate-900">No schedule data is connected</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Events and time-zone-aware calendar views will appear here when scheduling is implemented.</p>
      </section>
    </div>
  )
}