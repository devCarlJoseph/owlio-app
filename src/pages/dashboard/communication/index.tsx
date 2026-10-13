export default function CommunicationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Stay connected</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Communication</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Keep conversations connected to the classroom, lesson, or study space they belong to.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Communication areas">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Discussions</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Classroom and peer-space conversations can stay organized by topic and context.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Announcements</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Educator updates and study-space notices remain clearly identified by their author and space.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Polls</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Supported polls can gather class or study-group responses in context.</p>
        </article>
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-label="Communication availability">
        <p className="text-sm font-semibold text-slate-900">Conversations are not connected</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">No messages or announcements are being loaded or sent from this page yet.</p>
      </section>
    </div>
  )
}