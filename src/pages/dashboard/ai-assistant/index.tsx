export default function AiAssistantPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Shared workspace tool</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">AI Assistant</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">This shared entry point is available to every workspace. AI generation is not connected in the current app.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2" aria-label="AI assistant use cases">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Teaching preparation</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">The product plan describes draft questions, assignment instructions, lesson ideas, and language-practice activities for educator review.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Review and feedback</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">AI suggestions must remain editable. Educators retain control over final evaluations and official grades.</p>
        </article>
      </section>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="status">No AI provider or generation workflow is connected. Do not enter learner or private data here.</p>
    </div>
  )
}