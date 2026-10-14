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