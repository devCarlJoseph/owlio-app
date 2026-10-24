import { OutlineCard } from "@/components/common/outline-card"
import { PageHeader } from "@/components/common/page-header"

export default function AiAssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shared workspace tool"
        description="This shared entry point is available to every workspace. AI generation is not connected in the current app."
      />
      <section className="grid gap-4 md:grid-cols-2" aria-label="AI assistant use cases">
        <OutlineCard tone="violet">
          <h3 className="text-base font-semibold">Teaching preparation</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">The product plan describes draft questions, assignment instructions, lesson ideas, and language-practice activities for educator review.</p>
        </OutlineCard>
        <OutlineCard tone="amber">
          <h3 className="text-base font-semibold">Review and feedback</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">AI suggestions must remain editable. Educators retain control over final evaluations and official grades.</p>
        </OutlineCard>
      </section>
      <p className="rounded-2xl border-2 border-outline bg-white p-4 text-sm leading-6" role="status">No AI provider or generation workflow is connected. Do not enter learner or private data here.</p>
    </div>
  )
}
