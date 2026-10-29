import { Link } from "react-router"
import { cn } from "cn"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  getSubjectListBackground,
  getSubjectProgress,
  type SubjectRecord,
} from "./subject-records"

type SubjectListRowProps = {
  subject: SubjectRecord
  href: string
}

export function SubjectListRow({ subject, href }: SubjectListRowProps) {
  const progress = getSubjectProgress(subject)

  return (
    <li>
      <Card
        size="sm"
        className="relative gap-0 border border-transparent py-0 shadow-sm ring-0"
      >
        <CardContent
          className={cn(
            "grid items-center gap-3 py-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)]",
            getSubjectListBackground(subject)
          )}
        >
          <div className="min-w-0">
            <Link
              to={href}
              className="block truncate rounded text-sm font-semibold text-slate-900 outline-none after:absolute after:inset-0 after:content-[''] hover:text-[#6842c5] hover:underline focus-visible:ring-2 focus-visible:ring-[#8a60f1] focus-visible:ring-offset-2"
            >
              {subject.name}
            </Link>
            {subject.code ? (
              <p className="truncate text-[11px] uppercase tracking-wide text-slate-500">
                {subject.code}
              </p>
            ) : null}
          </div>

          <p className="truncate text-sm text-slate-600">
            {subject.instructor || "No instructor set"}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-slate-600">{progress}%</span>
            <Progress
              aria-hidden="true"
              value={progress}
              className="h-2 flex-1 gap-0 [&_[data-slot=progress-track]]:bg-white/70 [&_[data-slot=progress-indicator]]:bg-[#8a60f1]"
            />
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
