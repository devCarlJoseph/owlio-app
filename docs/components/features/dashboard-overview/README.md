# Shared dashboard overview breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(dashboard-overview): add organized overview source copies`

Target: `src/components/features/dashboard-overview/`. These are proposed destinations, not existing imports. Use [folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `ui/` | `overview-identity-card.tsx`, `overview-sidebar.tsx`, `overview-summary.tsx`, `overview-workspaces.tsx` |
| `view/` | `dashboard-overview.tsx`, `dashboard-overview.test.tsx` |
| Root contract | `overview-types.ts` |

Keep role-specific copy and current account information separate: a shared dashboard tile should not infer educator authorization from a URL. Migrate the view and test together after checking its role consumers; do not add `forms/` or context without a real form or shared state.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

No dedicated page adapter belongs to this feature today. Do not create a route just to mirror a feature folder.

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/dashboard-overview/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `dashboard-overview.test.tsx`

Current file: `src/components/features/dashboard-overview/dashboard-overview.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudentOverviewView } from "@/components/features/personal-workspace/student-overview/student-overview-view"
import { EducatorOverviewView } from "@/components/features/educator-overview/educator-overview-view"
import TutorOverviewView from "@/components/features/tutor-workspace/overview/tutor-overview-view"
import EslOverviewView from "@/components/features/esl-teaching/overview/esl-overview-view"

afterEach(cleanup)

const pages = [
  { role: "students", View: StudentOverviewView, summary: "My learning at a glance", explore: "Your learning spaces", agenda: "Coming up", action: "Open my learning", destination: "/students/subjects" },
  { role: "educators", View: EducatorOverviewView, summary: "My teaching at a glance", explore: "Your teaching spaces", agenda: "Upcoming classes", action: "Open my classes", destination: "/educators/classrooms" },
  { role: "tutors", View: TutorOverviewView, summary: "My tutoring at a glance", explore: "Your tutoring spaces", agenda: "Upcoming sessions", action: "Open sessions", destination: "/tutors/sessions" },
  { role: "esl", View: EslOverviewView, summary: "My language teaching at a glance", explore: "Your language teaching spaces", agenda: "Upcoming lessons", action: "Open lesson plans", destination: "/esl/lessons" },
]

describe("role overview pages", () => {
  it.each(pages)("keeps the $role overview scoped and honest about unavailable records", ({ role, View, summary, explore, agenda }) => {
    render(<MemoryRouter><View /></MemoryRouter>)

    for (const name of ["Overview", summary, explore, agenda]) {
      expect(screen.getByRole("heading", { name })).toBeTruthy()
    }
    expect(screen.getByText(/Live summaries are not connected yet/)).toBeTruthy()
    expect(screen.getAllByText("Not connected")).toHaveLength(3)
    expect(screen.getByRole("complementary", { name: "Your day and follow-ups" })).toBeTruthy()
    expect(screen.getAllByRole("link").every((link) => link.getAttribute("href")?.startsWith(`/${role}/`))).toBe(true)
    expect(screen.queryByRole("link", { name: /join meeting|start session|meeting room/i })).toBeNull()
    expect(screen.queryByText(/Sarah Johnson|Michael Chen|18\.5|\+3 this week/)).toBeNull()
    expect(screen.queryByRole("table")).toBeNull()
    expect(screen.queryByRole("progressbar")).toBeNull()
  })

  it.each(pages)("opens the primary $role workspace", ({ role, View, action, destination }) => {
    render(
      <MemoryRouter initialEntries={[`/${role}`]}>
        <Routes>
          <Route path={`/${role}`} element={<View />} />
          <Route path={destination} element={<h2>Destination workspace</h2>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("link", { name: action }))
    expect(screen.getByRole("heading", { name: "Destination workspace" })).toBeTruthy()
  })
})
```

### `dashboard-overview.tsx`

Current file: `src/components/features/dashboard-overview/dashboard-overview.tsx`

```tsx
import { CircleDashed } from "lucide-react"
import { OverviewIdentityCard } from "./overview-identity-card"
import { OverviewSidebar } from "./overview-sidebar"
import { OverviewSummary } from "./overview-summary"
import { OverviewWorkspaces } from "./overview-workspaces"
import type { OverviewContent } from "./overview-types"

export function DashboardOverview({ content }: { content: OverviewContent }) {
  return (
    <div className="mx-auto w-full max-w-7xl rounded-[2rem] bg-gradient-to-br from-slate-100 via-cyan-50/60 to-brand-soft/60 p-3 text-foreground sm:p-5 lg:p-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{content.workspace}</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Overview</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-2 text-xs text-muted-foreground">
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
```

### `overview-identity-card.tsx`

Current file: `src/components/features/dashboard-overview/overview-identity-card.tsx`

```tsx
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { OverviewContent } from "./overview-types"

const accents = ["bg-rose-200", "bg-teal-300", "bg-lime-200"] as const

export function OverviewIdentityCard({ content }: { content: OverviewContent }) {
  const Icon = content.icon

  return (
    <Card className="gap-0 rounded-3xl border border-white bg-white/85 py-0 shadow-none ring-0">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="relative flex size-28 shrink-0 items-center justify-center self-start rounded-[1.5rem] bg-brand-soft sm:size-32">
          <img src="/mascot/owlio-owl.png" alt="" className="size-24 object-contain sm:size-28" />
          <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-4 border-white bg-brand text-brand-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <Badge variant="secondary" className="rounded-full bg-brand-soft px-2.5 text-brand-soft-foreground">{content.workspace}</Badge>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{content.headline}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{content.introduction}</p>
          <Button render={<Link to={content.primaryAction.href} />} variant="outline" size="sm" className="mt-4 h-9 rounded-full border-border bg-white px-3.5">
            {content.primaryAction.label}<ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-border/50 px-5 pb-4 pt-4 sm:gap-5 sm:px-6">
        {content.focus.map((label, index) => (
          <div key={label} className="min-w-0">
            <p className="text-xs leading-5 text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">Not connected</p>
            <div className={`mt-3 h-1 rounded-full ${accents[index]}`} aria-hidden="true" />
          </div>
        ))}
      </div>
    </Card>
  )
}
```

### `overview-sidebar.tsx`

Current file: `src/components/features/dashboard-overview/overview-sidebar.tsx`

```tsx
import { ArrowUpRight, CalendarDays, Clock3, ListChecks, ShieldCheck } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { OverviewContent } from "./overview-types"

export function OverviewSidebar({ content }: { content: OverviewContent }) {
  return (
    <aside aria-label="Your day and follow-ups" className="flex min-w-0 flex-col gap-4">
      <Card className="gap-0 rounded-3xl border border-white bg-white/75 p-5 shadow-none ring-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{content.agenda.title}</h3>
          <span className="flex size-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground"><CalendarDays className="size-4" aria-hidden="true" /></span>
        </div>
        <div className="my-5 rounded-2xl border border-dashed border-border bg-white/60 px-4 py-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Clock3 className="size-5" aria-hidden="true" /></span>
          <h4 className="mt-4 text-sm font-medium">{content.agenda.emptyTitle}</h4>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{content.agenda.description}</p>
        </div>
        <Button render={<Link to={content.agenda.action.href} />} variant="outline" className="h-10 w-full rounded-full bg-white text-xs">
          {content.agenda.action.label}<ArrowUpRight aria-hidden="true" />
        </Button>
      </Card>

      <Card className="gap-0 rounded-3xl border border-white bg-white/75 p-5 shadow-none ring-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{content.followUps.title}</h3>
          <ListChecks className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="mb-3 mt-2 text-xs leading-5 text-muted-foreground">{content.followUps.description}</p>
        <ul className="divide-y divide-border/60">
          {content.followUps.items.map(({ title, description, href, icon: Icon }) => (
            <li key={href}>
              <Link to={href} className="group -mx-2 flex items-start gap-3 rounded-xl px-2 py-4 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-brand">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Icon className="size-4" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium">{title}</h4>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                </div>
                <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-brand" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-auto rounded-3xl border border-white/80 bg-brand-soft/65 p-5">
        <ShieldCheck className="size-5 text-brand" aria-hidden="true" />
        <h3 className="mt-3 text-sm font-semibold">{content.note.title}</h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{content.note.description}</p>
      </div>
    </aside>
  )
}
```

### `overview-summary.tsx`

Current file: `src/components/features/dashboard-overview/overview-summary.tsx`

```tsx
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import { Card } from "@/components/ui/card"
import type { OverviewContent } from "./overview-types"

const tileColors = [
  "bg-lime-200/85 hover:bg-lime-200",
  "bg-teal-200/90 hover:bg-teal-200",
  "bg-rose-200/90 hover:bg-rose-200",
] as const

export function OverviewSummary({ summary }: { summary: OverviewContent["summary"] }) {
  return (
    <Card className="gap-4 rounded-3xl border border-white bg-white/70 p-4 shadow-none ring-0 sm:p-5">
      <h3 className="px-1 text-base font-semibold tracking-tight">{summary.title}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {summary.items.map(({ title, description, href, icon: Icon }, index) => (
          <Link key={href} to={href} className={`group flex min-h-44 flex-col rounded-[1.25rem] p-4 text-slate-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${tileColors[index]}`}>
            <div className="flex items-start justify-between gap-2">
              <Icon className="mt-1 size-5 shrink-0" aria-hidden="true" />
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-900/10 group-hover:bg-white/30">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </div>
            <h4 className="mt-4 text-sm font-semibold">{title}</h4>
            <p className="mt-1.5 text-xs leading-5 text-slate-700">{description}</p>
          </Link>
        ))}
      </div>
    </Card>
  )
}
```

### `overview-types.ts`

Current file: `src/components/features/dashboard-overview/overview-types.ts`

```ts
import type { LucideIcon } from "lucide-react"

export type OverviewLink = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export type OverviewWorkspace = OverviewLink & {
  category: string
  cover: string
}

export type OverviewContent = {
  workspace: string
  headline: string
  introduction: string
  icon: LucideIcon
  focus: [string, string, string]
  primaryAction: { label: string; href: string }
  summary: {
    title: string
    items: [OverviewLink, OverviewLink, OverviewLink]
  }
  explore: {
    title: string
    description: string
    items: [OverviewWorkspace, OverviewWorkspace]
  }
  agenda: {
    title: string
    emptyTitle: string
    description: string
    action: { label: string; href: string }
  }
  followUps: {
    title: string
    description: string
    items: [OverviewLink, OverviewLink]
  }
  note: { title: string; description: string }
}
```

### `overview-workspaces.tsx`

Current file: `src/components/features/dashboard-overview/overview-workspaces.tsx`

```tsx
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { OverviewContent } from "./overview-types"

export function OverviewWorkspaces({ explore }: { explore: OverviewContent["explore"] }) {
  return (
    <Card className="gap-4 rounded-3xl border border-white bg-white/70 p-4 shadow-none ring-0 sm:p-5">
      <div className="px-1">
        <h3 className="text-base font-semibold tracking-tight">{explore.title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{explore.description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {explore.items.map(({ title, description, href, category, cover, icon: Icon }) => (
          <Link key={href} to={href} className="group overflow-hidden rounded-[1.25rem] border border-white bg-white outline-none transition-shadow hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
            <div className="relative h-36 overflow-hidden bg-brand-soft sm:h-40">
              <img src={cover} alt="" className="size-full object-cover" />
              <Badge variant="secondary" className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 text-slate-800">{category}</Badge>
              <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-800 group-hover:bg-white"><ArrowUpRight className="size-4" aria-hidden="true" /></span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                <h4 className="text-sm font-semibold">{title}</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
