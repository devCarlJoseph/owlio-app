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