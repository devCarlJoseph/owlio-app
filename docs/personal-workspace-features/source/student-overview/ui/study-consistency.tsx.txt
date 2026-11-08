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