export default function StudentStudySpacesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Peer learning</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Study spaces</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Create or join a peer learning space for group projects, shared study, and collaboration without an instructor.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="Study space actions">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Spaces you create</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Organize shared tasks, study notes, materials, discussions, and polls for your peers.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Spaces you join</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Join by an approved invitation, code, or link when that workflow is available.</p>
        </article>
      </section>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-label="Study space list">
        <h3 className="text-base font-semibold text-slate-900">Your study spaces</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Study-space creation, membership, and shared content are not connected yet. A study space is for peer collaboration, not an official classroom or academic record.</p>
      </section>
    </div>
  )
}