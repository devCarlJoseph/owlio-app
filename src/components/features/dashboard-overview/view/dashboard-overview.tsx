import { CircleDashed } from "lucide-react"
import { OverviewIdentityCard } from "../ui/overview-identity-card"
import { OverviewSidebar } from "../ui/overview-sidebar"
import { OverviewSummary } from "../ui/overview-summary"
import { OverviewWorkspaces } from "../ui/overview-workspaces"
import type { OverviewContent } from "../types/overview-types"

export function DashboardOverview({ content }: { content: OverviewContent }) {
  return (
    <div className="mx-auto w-full max-w-7xl rounded-[2rem] p-3 text-foreground sm:p-5 lg:p-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{content.workspace}</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Overview</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white surface-dark:border-border bg-white/70 surface-dark:bg-card/70 px-3 py-2 text-xs text-muted-foreground">
          <CircleDashed className="size-3.5" aria-hidden="true" />Overview preview
        </span>
      </header>
      <p className="mb-5 px-1 text-xs leading-5 text-muted-foreground">Live summaries are not connected yet. Open a workspace below to continue.</p>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-4">
          <OverviewIdentityCard content={content} />
          <OverviewSummary summary={content.summary} />
          <OverviewWorkspaces explore={content.explore} />
        </div>
        <OverviewSidebar content={content} />
      </div>
    </div>
  )
}
