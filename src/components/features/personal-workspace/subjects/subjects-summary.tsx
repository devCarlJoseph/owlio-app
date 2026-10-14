import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { subjectSummaryTiles } from "./sample-subjects"

type SubjectsSummaryProps = {
  totals: { subjects: number; chapters: number; lessons: number; averageProgress: number }
}

export function SubjectsSummary({ totals }: SubjectsSummaryProps) {
  const values = [
    String(totals.subjects),
    `${totals.chapters}`,
    String(totals.lessons),
    `${totals.averageProgress}%`,
  ]

  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900">At a glance</h3>
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Totals across the subjects listed below.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
            Sample totals
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-1 sm:grid-cols-2">
        {subjectSummaryTiles.map(({ label, icon: Icon }, index) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50/60 px-3 py-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500">{label}</p>
              <p className="text-lg font-semibold tabular-nums text-slate-900">{values[index]}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}