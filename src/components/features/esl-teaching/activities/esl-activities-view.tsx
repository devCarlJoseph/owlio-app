import { useState } from "react"
import {
  ArrowRight,
  BookOpenText,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  MessageSquareText,
  Plus,
  UsersRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const summaryCards = [
  {
    label: "Practice activities",
    description: "Language practice",
    icon: BookOpenText,
    color: "bg-rose-100 text-rose-800",
  },
  {
    label: "Assessments",
    description: "Educator-reviewed work",
    icon: ClipboardCheck,
    color: "bg-orange-100 text-orange-800",
  },
  {
    label: "Responses to review",
    description: "Learner submissions",
    icon: UsersRound,
    color: "bg-violet-100 text-violet-800",
  },
  {
    label: "Feedback",
    description: "Learner-facing feedback",
    icon: MessageSquareText,
    color: "bg-sky-100 text-sky-800",
  },
]

const workflowCards = [
  {
    label: "Practice",
    title: "Create language practice",
    description:
      "Prepare vocabulary, grammar, reading, listening, speaking, or writing practice when activity authoring is connected.",
    icon: BookOpenText,
    tone: "border-teal-500 text-teal-700 bg-teal-50",
  },
  {
    label: "Assessment",
    title: "Review assessed work",
    description:
      "Review learner responses using the criteria and result states supported by the activity service.",
    icon: ClipboardList,
    tone: "border-indigo-500 text-indigo-700 bg-indigo-50",
  },
  {
    label: "Feedback",
    title: "Share learner feedback",
    description:
      "Keep private teaching notes separate from feedback that is deliberately published to a learner.",
    icon: FileCheck2,
    tone: "border-amber-500 text-amber-700 bg-amber-50",
  },
]

function UnavailableState({ category }: { category: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
        <ClipboardList aria-hidden="true" className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {category === "all" ? "No connected ESL activities" : `No connected ${category} work`}
      </h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
        ESL activity and submission records are not connected yet. This page does not show sample work or claim that anything has been assigned or submitted.
      </p>
      <Badge variant="outline" className="mt-4 border-slate-300 bg-white text-slate-600">
        Activity service unavailable
      </Badge>
    </div>
  )
}

export default function EslActivitiesView() {
  const [showAuthoringNotice, setShowAuthoringNotice] = useState(false)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Teaching workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Activities &amp; Assessments
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Prepare language practice, review learner work, and share feedback in the right lesson context.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowAuthoringNotice((visible) => !visible)}
          aria-expanded={showAuthoringNotice}
          aria-controls="activity-authoring-notice"
          className="w-full sm:w-auto"
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create activity
        </Button>
      </header>

      {showAuthoringNotice && (
        <div
          id="activity-authoring-notice"
          role="status"
          className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Activity authoring is not connected yet. No activity can be saved or assigned from this page.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAuthoringNotice(false)}>
            Dismiss
          </Button>
        </div>
      )}

      <section aria-label="Activity workspace status" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, description, icon: Icon, color }) => (
          <Card key={label} className="min-w-0 border-0 shadow-sm ring-1 ring-slate-200">
            <CardContent className="flex min-h-28 flex-row items-center justify-between gap-3 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-1 text-xs text-slate-600">{description}</p>
                <p className="mt-3 text-xs font-medium text-slate-500">Not connected</p>
              </div>
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="activity-list-heading" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="activity-list-heading" className="text-lg font-semibold text-slate-900">Your activity workspace</h2>
            <p className="mt-1 text-sm text-slate-600">Practice and assessed work stay distinct throughout review.</p>
          </div>
          <p className="text-xs text-slate-500">Learner and lesson records are not available here yet.</p>
        </div>

        <Tabs defaultValue="all" className="mt-5 min-w-0 gap-5">
          <TabsList
            variant="line"
            aria-label="Activity category"
            className="w-full justify-start gap-2 overflow-x-auto border-b border-slate-200"
          >
            <TabsTrigger value="all" className="min-w-fit flex-none px-3">All</TabsTrigger>
            <TabsTrigger value="practice" className="min-w-fit flex-none px-3">Practice</TabsTrigger>
            <TabsTrigger value="assessment" className="min-w-fit flex-none px-3">Assessments</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="pt-1"><UnavailableState category="all" /></TabsContent>
          <TabsContent value="practice" className="pt-1"><UnavailableState category="practice" /></TabsContent>
          <TabsContent value="assessment" className="pt-1"><UnavailableState category="assessment" /></TabsContent>
        </Tabs>
      </section>

      <section aria-labelledby="context-filters-heading" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle id="context-filters-heading" className="text-base">Filter by teaching context</CardTitle>
            <CardDescription>Learner/group and lesson filters will be available when those records are connected.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Learner or group
              <select disabled aria-describedby="context-filter-note" className="h-10 rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 disabled:cursor-not-allowed">
                <option>Not available</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Lesson
              <select disabled aria-describedby="context-filter-note" className="h-10 rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 disabled:cursor-not-allowed">
                <option>Not available</option>
              </select>
            </label>
            <p id="context-filter-note" className="text-xs leading-5 text-slate-500 sm:col-span-2">
              Filters are unavailable because no ESL learner, lesson, or activity service is connected.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Activity workflow</CardTitle>
            <CardDescription>These are planned teaching actions, not connected records or available mutations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {workflowCards.map(({ label, title, description, icon: Icon, tone }) => (
              <article key={title} className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={`max-w-full truncate ${tone}`}>{label}</Badge>
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 flex-1 text-xs leading-5 text-slate-600">{description}</p>
                <p className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-500">
                  Not connected <ArrowRight aria-hidden="true" className="size-3.5" />
                </p>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
