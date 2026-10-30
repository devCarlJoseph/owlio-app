import { MoreVertical, Palette, Trash } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSubjectCoverColor, getSubjectProgress, type SubjectRecord } from "./subject-records"

type SubjectCardProps = {
  subject: SubjectRecord
  href: string
  onCustomize: (subject: SubjectRecord) => void
  onDelete: (subject: SubjectRecord) => void
}

export function SubjectCard({ subject, href, onCustomize, onDelete }: SubjectCardProps) {
  const coverColor = getSubjectCoverColor(subject.coverColor)
  const progress = getSubjectProgress(subject)

  return (
    <Card size="sm" className="group/subject relative h-full gap-0 overflow-hidden rounded-2xl border-violet-100 bg-white py-0 shadow-sm ring-0 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/70 motion-reduce:transform-none motion-reduce:transition-none">
      <div className="relative h-40 overflow-hidden bg-slate-100 sm:h-44">
        {subject.coverImage ? (
          <img
            src={subject.coverImage}
            alt=""
            aria-hidden="true"
            className="size-full object-cover transition-transform duration-300 group-hover/subject:scale-[1.025] motion-reduce:transition-none"
          />
        ) : (
          <div aria-hidden="true" className={`absolute inset-0 ${coverColor.className}`} />
        )}

        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-white/10" />
        <div className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
          {progress >= 100 ? "Completed" : progress > 0 ? "In progress" : "Not started"}
        </div>
        {progress > 0 ? (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-white/40" aria-hidden="true">
            <div className="h-full bg-violet-500" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </div>

      <CardContent className="flex-row items-start gap-2 px-4 py-4">
        <div className="min-w-0 flex-1">
          <Link
            to={href}
            className="block truncate rounded text-[15px] font-semibold tracking-tight text-[#1b1a21] outline-none after:absolute after:inset-0 after:content-[''] hover:text-[#6842c5] hover:underline focus-visible:ring-2 focus-visible:ring-[#8a60f1] focus-visible:ring-offset-2"
          >
            {subject.name}
          </Link>
          {subject.instructor ? (
            <p className="truncate text-[11px] uppercase tracking-wide text-slate-500">
              Instructor: {subject.instructor}
            </p>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Options for ${subject.name}`}
                className="relative z-10 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              />
            }
          >
            <MoreVertical aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCustomize(subject)}>
              <Palette aria-hidden="true" />
              Customize
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(subject)}>
              <Trash aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
