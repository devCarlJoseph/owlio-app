import { OutlineCard } from "@/components/common/outline-card"
import { PageHeader } from "@/components/common/page-header"

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning history"
        description="Personal learning activity and educator-controlled classroom records have different owners and should be reviewed in their proper context."
      />
      <section className="grid gap-4 md:grid-cols-2" aria-label="Progress views">
        <OutlineCard tone="emerald">
          <h3 className="text-base font-semibold">Personal learning</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">A learner's own study tasks, history, and goals belong to their personal workspace.</p>
          <p className="mt-4 rounded-xl border-2 border-outline bg-white p-3 text-sm text-slate-700">Personal progress data is not connected.</p>
        </OutlineCard>
        <OutlineCard tone="sky">
          <h3 className="text-base font-semibold">Classroom progress</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">Grades, attendance, feedback, and official class activity are educator-controlled records.</p>
          <p className="mt-4 rounded-xl border-2 border-outline bg-white p-3 text-sm text-slate-700">No classroom records are loaded here.</p>
        </OutlineCard>
      </section>
    </div>
  )
}
