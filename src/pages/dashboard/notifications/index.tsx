export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Workspace updates</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Notifications</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Relevant updates can bring invitations, classwork, deadlines, feedback, and schedule changes back to one place.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Notification categories">
        {[
          ["Classrooms", "Invitations, announcements, and classroom updates."],
          ["Learning activity", "New materials, classwork, submissions, and discussion replies."],
          ["Schedule and feedback", "Upcoming deadlines, released feedback, and supported schedule changes."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-8" aria-label="Notification inbox">
        <h3 className="text-base font-semibold text-slate-900">Your updates will appear here</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Notification delivery and read state are not connected, so this page is not showing live account activity.</p>
      </section>
    </div>
  )
}