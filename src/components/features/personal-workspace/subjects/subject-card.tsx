import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { subjectStatusMeta, type SubjectRecord } from "./sample-subjects"

export function SubjectCard({ subject }: { subject: SubjectRecord }) {
  const status = subjectStatusMeta[subject.status]
  const StatusIcon = status.icon

  return (
    <Card size="sm" className="h-full border border-slate-200 bg-white shadow-sm ring-0">
      <CardContent className="h-full gap-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white"
          >
            {subject.name.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-base font-semibold text-slate-900">{subject.name}</h4>
            <p className="mt-0.5 truncate text-xs text-slate-500">{subject.summary}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-slate-100 text-slate-700">
            {subject.code}
          </Badge>
        </div>

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span>
            {subject.chaptersCompleted} of {subject.chapterCount} chapters
          </span>
          <span aria-hidden="true" className="size-1 rounded-full bg-slate-300" />
          <span>{subject.lessonCount} lessons</span>
        </p>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-500">Progress</p>
            <p className="text-xs font-semibold tabular-nums text-slate-900">{subject.progress}%</p>
          </div>
          <Progress
            aria-hidden="true"
            value={subject.progress}
            className="mt-2 gap-0 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-slate-100 [&_[data-slot=progress-indicator]]:bg-blue-700"
          />
        </div>

        <Badge variant="outline" className={`w-fit ${status.badge}`}>
          <StatusIcon aria-hidden="true" data-slot="icon" />
          {status.label}
        </Badge>
      </CardContent>
    </Card>
  )
}