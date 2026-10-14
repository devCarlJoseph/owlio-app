import { Badge } from "@/components/ui/badge"
import { ClassworkHighlight } from "./classwork-highlight"
import { OverviewTipBanner } from "./overview-tip-banner"
import { PersonalMetrics } from "./personal-metrics"
import { PersonalSpacePromo } from "./quick-links"
import { ProgressSummary } from "./progress-summary"
import { StudyConsistency } from "./study-consistency"
import { SubjectsTable } from "./subjects-table"
import { getTimeGreeting } from "./time-greeting"
import { UpcomingItems } from "./upcoming-items"

export function StudentOverviewView({ userName }: { userName?: string }) {
  const greeting = getTimeGreeting()

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Student workspace
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {greeting}
          {userName ? `, ${userName}` : ""}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Organize your own learning, keep classroom work in view, and make progress at your pace—even
          without an instructor on Owlio.
        </p>
      </section>

      <OverviewTipBanner />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <ProgressSummary />
        <PersonalMetrics />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <div className="space-y-5">
          <UpcomingItems />
          <SubjectsTable />
        </div>
        <div className="space-y-5">
          <StudyConsistency />
          <ClassworkHighlight />
          <PersonalSpacePromo />
        </div>
      </div>
    </div>
  )
}