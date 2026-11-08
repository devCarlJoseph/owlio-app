# Student overview

Target: `src/components/features/personal-workspace/student-overview/`. Keep copy, calculations, cards and route composition separate.

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `student-overview-content.ts`, `student-overview-copy.ts` |
| `utils/` | `time-greeting.ts` |
| `ui/` | `classwork-highlight.tsx`, `overview-tip-banner.tsx`, `personal-metrics.tsx`, `progress-summary.tsx`, `quick-links.tsx`, `study-consistency.tsx`, `subjects-table.tsx`, `upcoming-items.tsx` |
| `view/` | `student-overview-view.tsx` |

Use actual local personal-workspace sources for summary cards. Keep examples labeled and do not display them as official school metrics.

[Personal workspace plans](../README.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/personal-workspace/student-overview/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `classwork-highlight.tsx`

Current file: `src/components/features/personal-workspace/student-overview/classwork-highlight.tsx`

```tsx
import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ClassworkHighlight() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <CardTitle>
          <h3 className="text-base font-semibold text-slate-900">Classwork</h3>
        </CardTitle>
        <CardDescription className="mt-1 text-slate-500">
          Activities and quizzes your educator assigned in a classroom.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <ul className="space-y-2" aria-hidden="true">
          {[0, 1].map((row) => (
            <li key={row} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <Skeleton className="size-9 shrink-0 rounded-lg motion-reduce:animate-none" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-3/5 motion-reduce:animate-none" />
                <Skeleton className="h-3 w-1/4 motion-reduce:animate-none" />
              </div>
              <Skeleton className="h-8 w-16 shrink-0 rounded-md motion-reduce:animate-none" />
            </li>
          ))}
        </ul>
        <p className="text-sm leading-5 text-slate-500">
          Assigned work, submissions, and released results are not connected yet.
        </p>
        <Button
          render={<Link to="/students/classwork" />}
          size="sm"
          className="w-fit bg-blue-700 text-white hover:bg-blue-800"
        >
          View classwork
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  )
}
```

### `overview-tip-banner.tsx`

Current file: `src/components/features/personal-workspace/student-overview/overview-tip-banner.tsx`

```tsx
import { useState } from "react"
import { Lightbulb, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { overviewTip } from "./student-overview-copy"

export function OverviewTipBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <section
      aria-label="Study tip"
      className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
    >
      <Lightbulb className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
      <p className="flex-1 text-sm leading-6 text-blue-800">{overviewTip}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss study tip"
        onClick={() => setVisible(false)}
        className="text-blue-700 hover:bg-blue-100 hover:text-blue-800"
      >
        <X aria-hidden="true" />
      </Button>
    </section>
  )
}
```

### `personal-metrics.tsx`

Current file: `src/components/features/personal-workspace/student-overview/personal-metrics.tsx`

```tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { personalMetricTiles } from "./student-overview-copy"

export function PersonalMetrics() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900">My learning</h3>
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">Counts from your own workspace.</CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
            No data yet
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="gap-1">
        {personalMetricTiles.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">{label}</span>
            <span className="size-10 shrink-0 rounded-full border-[5px] border-slate-100" aria-hidden="true" />
          </div>
        ))}
        <p className="mt-2 px-2 text-xs leading-5 text-slate-500">
          These totals are not connected yet, so nothing is counted here.
        </p>
      </CardContent>
    </Card>
  )
}
```

### `progress-summary.tsx`

Current file: `src/components/features/personal-workspace/student-overview/progress-summary.tsx`

```tsx
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProgressSummary() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <CardTitle>
          <h3 className="text-base font-semibold text-slate-900">Learning at a glance</h3>
        </CardTitle>
        <CardDescription className="mt-1 text-slate-500">Overall completion across your workspace.</CardDescription>
        <Badge variant="outline" className="mt-2 w-fit border-slate-200 bg-slate-50 text-slate-600">
          Not connected
        </Badge>
      </CardHeader>
      <CardContent className="items-center gap-4">
        <div className="relative w-full max-w-56">
          <svg viewBox="0 0 200 124" className="w-full" role="presentation" aria-hidden="true" focusable="false">
            <path
              d="M20 110 A 80 80 0 0 1 180 110"
              fill="none"
              strokeWidth="18"
              strokeLinecap="round"
              className="stroke-slate-100"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-2 flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-24 motion-reduce:animate-none" />
            <Skeleton className="h-3 w-32 motion-reduce:animate-none" />
          </div>
        </div>
        <p className="text-center text-sm leading-5 text-slate-500">
          Study activity and completion totals are not connected yet.
        </p>
        <Button render={<Link to="/students/progress" />} variant="outline" size="sm" className="w-fit">
          View progress
        </Button>
      </CardContent>
    </Card>
  )
}
```

### `quick-links.tsx`

Current file: `src/components/features/personal-workspace/student-overview/quick-links.tsx`

```tsx
import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { personalSpaceLinks } from "./student-overview-copy"

export function PersonalSpacePromo() {
  return (
    <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm ring-0">
      <CardContent className="gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Make this space your own</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Independent learning comes first. A classroom is optional.
          </p>
        </div>
        {personalSpaceLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="flex items-center gap-3 rounded-lg bg-white/80 p-3 text-sm font-medium text-slate-800 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Icon className="size-4 text-blue-700" aria-hidden="true" />
            {label}
            <ArrowUpRight className="ml-auto size-4 text-blue-700" aria-hidden="true" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
```

### `student-overview-content.ts`

Current file: `src/components/features/personal-workspace/student-overview/student-overview-content.ts`

```ts
import { BookOpen, ClipboardList, FolderOpen, GraduationCap, NotebookPen, School, Users } from "lucide-react"
import type { OverviewContent } from "@/components/features/dashboard-overview/overview-types"

export const studentOverviewContent: OverviewContent = {
  workspace: "Student workspace",
  headline: "A little learning, every day.",
  introduction: "Make room for your own goals. Keep personal study, classroom work, and time with your study community in view.",
  icon: GraduationCap,
  focus: ["Personal subjects", "Personal tasks", "Joined classes"],
  primaryAction: { label: "Open my learning", href: "/students/subjects" },
  summary: {
    title: "My learning at a glance",
    items: [
      { title: "Personal tasks", description: "Make space for your next study goal.", href: "/students/tasks", icon: ClipboardList },
      { title: "My notes", description: "Keep ideas and discoveries together.", href: "/students/notes", icon: NotebookPen },
      { title: "Assigned classwork", description: "Find work shared by your educator.", href: "/students/classwork", icon: School },
    ],
  },
  explore: {
    title: "Your learning spaces",
    description: "Learn independently or spend time learning with others.",
    items: [
      { title: "My Learning", description: "Your subjects and personal study goals, at your own pace.", href: "/students/subjects", icon: BookOpen, category: "Personal learning", cover: "/subject-covers/books.svg" },
      { title: "Study Spaces", description: "Explore student-created spaces for peer study and collaboration.", href: "/students/study-spaces", icon: Users, category: "Peer learning", cover: "/subject-covers/globe.svg" },
    ],
  },
  agenda: {
    title: "Coming up",
    emptyTitle: "Your next study moment",
    description: "Personal deadlines and class sessions are not available in this overview yet.",
    action: { label: "Open my schedule", href: "/students/schedule" },
  },
  followUps: {
    title: "Keep learning",
    description: "Class updates and released feedback are not available here yet. Continue in your learning workspaces.",
    items: [
      { title: "My classes", description: "Find your educator-led classroom work.", href: "/students/classrooms", icon: School },
      { title: "Study library", description: "Find resources for your next study block.", href: "/students/materials", icon: FolderOpen },
    ],
  },
  note: { title: "Your learning, your pace", description: "You can study without joining a class. Personal work and peer study stay separate from official class records." },
}
```

### `student-overview-copy.ts`

Current file: `src/components/features/personal-workspace/student-overview/student-overview-copy.ts`

```ts
import { BookOpen, ClipboardList, FolderOpen, NotebookPen, Users, type LucideIcon } from "lucide-react"

export type MetricTile = {
  label: string
  icon: LucideIcon
}

export type UpcomingGroup = {
  title: string
  description: string
  href: string
  linkLabel: string
}

export const overviewTip =
  "Small, steady sessions add up. Plan one study block today, and keep classroom work separate from your own plans."

export const personalMetricTiles: MetricTile[] = [
  { label: "Subjects", icon: BookOpen },
  { label: "Tasks", icon: ClipboardList },
  { label: "Materials", icon: FolderOpen },
]

export const upcomingGroups: UpcomingGroup[] = [
  {
    title: "Personal schedule",
    description: "Study blocks and deadlines you set for yourself.",
    href: "/students/schedule",
    linkLabel: "View schedule",
  },
  {
    title: "Classroom sessions",
    description: "Lessons and activities shared by your educator.",
    href: "/students/classrooms",
    linkLabel: "View classrooms",
  },
]

export const personalTasksLink = {
  label: "Plan with personal tasks",
  description: "Your own study plans stay separate from assigned classwork.",
  href: "/students/tasks",
}

export const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export const personalSpaceLinks = [
  {
    label: "Organize your notes",
    href: "/students/notes",
    icon: NotebookPen,
  },
  {
    label: "Explore study spaces",
    href: "/students/study-spaces",
    icon: Users,
  },
] as const
```

### `student-overview-view.tsx`

Current file: `src/components/features/personal-workspace/student-overview/student-overview-view.tsx`

```tsx
import { DashboardOverview } from "@/components/features/dashboard-overview/dashboard-overview"
import { studentOverviewContent } from "./student-overview-content"
import { getTimeGreeting } from "./time-greeting"

export function StudentOverviewView({ userName }: { userName?: string }) {
  const content = userName
    ? { ...studentOverviewContent, headline: `${getTimeGreeting()}, ${userName}` }
    : studentOverviewContent

  return <DashboardOverview content={content} />
}
```

### `study-consistency.tsx`

Current file: `src/components/features/personal-workspace/student-overview/study-consistency.tsx`

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { weekDayLabels } from "./student-overview-copy"

export function StudyConsistency() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <CardTitle>
          <h3 className="text-base font-semibold text-slate-900">Study consistency</h3>
        </CardTitle>
        <CardDescription className="mt-1 text-slate-500">Your activity across the current week.</CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <ul className="grid grid-cols-7 gap-2">
          {weekDayLabels.map((day) => (
            <li key={day} className="flex flex-col items-center gap-2">
              <Skeleton
                className="size-9 rounded-full motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span className="text-[11px] font-medium text-slate-400">{day}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm leading-5 text-slate-500">
          Study history is not connected, so no streak is counted.
        </p>
      </CardContent>
    </Card>
  )
}
```

### `subjects-table.tsx`

Current file: `src/components/features/personal-workspace/student-overview/subjects-table.tsx`

```tsx
import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function SubjectsTable() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900">My subjects</h3>
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Progress and status for each subject you track.
            </CardDescription>
          </div>
          <Button
            render={<Link to="/students/subjects" />}
            variant="outline"
            size="sm"
            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
          >
            Manage subjects
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="gap-4">
        <Table aria-label="Subject progress">
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead scope="col" className="text-slate-500">
                Subject
              </TableHead>
              <TableHead scope="col" className="text-slate-500">
                Progress
              </TableHead>
              <TableHead scope="col" className="text-slate-500">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody aria-hidden="true">
            {[0, 1, 2].map((row) => (
              <TableRow key={row}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-lg motion-reduce:animate-none" />
                    <div className="space-y-2">
                      <Skeleton className="h-3.5 w-32 motion-reduce:animate-none" />
                      <Skeleton className="h-3 w-20 motion-reduce:animate-none" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-2 w-28 rounded-full motion-reduce:animate-none" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24 rounded-4xl motion-reduce:animate-none" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-sm leading-5 text-slate-500">
          Your subject list is not connected yet, so there is nothing to show here.
        </p>
      </CardContent>
    </Card>
  )
}
```

### `time-greeting.ts`

Current file: `src/components/features/personal-workspace/student-overview/time-greeting.ts`

```ts
export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours()

  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}
```

### `upcoming-items.tsx`

Current file: `src/components/features/personal-workspace/student-overview/upcoming-items.tsx`

```tsx
import { Link } from "react-router"
import { ArrowUpRight, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { personalTasksLink, upcomingGroups } from "./student-overview-copy"

export function UpcomingItems() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900">Upcoming</h3>
            </CardTitle>
            <CardDescription className="mt-1">
              Personal plans stay separate from educator-assigned sessions.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
            Nothing scheduled yet
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="gap-6">
        {upcomingGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{group.title}</h4>
                <p className="mt-0.5 text-xs text-slate-500">{group.description}</p>
              </div>
              <Link
                to={group.href}
                className="inline-flex items-center gap-1 rounded text-xs font-semibold text-blue-700 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {group.linkLabel}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <ul className="space-y-2" aria-hidden="true">
              {[0, 1].map((row) => (
                <li key={row} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <Skeleton className="size-11 shrink-0 rounded-lg motion-reduce:animate-none" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3 motion-reduce:animate-none" />
                    <Skeleton className="h-3 w-1/3 motion-reduce:animate-none" />
                  </div>
                  <Skeleton className="h-8 w-20 shrink-0 rounded-md motion-reduce:animate-none" />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
              <ClipboardList className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">{personalTasksLink.label}</h4>
              <p className="mt-0.5 text-xs leading-5 text-slate-600">{personalTasksLink.description}</p>
            </div>
          </div>
          <Link
            to={personalTasksLink.href}
            className="inline-flex items-center gap-1 rounded text-xs font-semibold text-blue-700 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Open tasks
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
