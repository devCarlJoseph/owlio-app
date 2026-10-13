export default function StudentTasksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Personal workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">My tasks</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Plan your own learning work, study sessions, and personal deadlines independently.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Task ownership">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Personal tasks</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Examples include preparing for an exam, reading a chapter, or practicing a skill.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Your personal task list is not connected yet.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Assigned classwork</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Educator-assigned work has its own classroom, submission, and feedback workflow.</p>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Classroom tasks are not loaded on this personal task page.</p>
        </article>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="task-planning-heading">
        <h3 id="task-planning-heading" className="text-base font-semibold text-slate-900">Task planning</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">A connected task can include a title, subject, due date, priority, status, and personal notes.</p>
      </section>
    </div>
  )
}