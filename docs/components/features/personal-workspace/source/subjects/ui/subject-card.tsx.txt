import { ArrowUpRight, BookOpen, Layers3, MoreVertical, Palette, Trash } from "lucide-react"
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
import { getSubjectCoverColor, getSubjectProgress, getSubjectStatus, type SubjectRecord } from "./subject-records"

type SubjectCardProps = {
  subject: SubjectRecord
  href: string
  onCustomize: (subject: SubjectRecord) => void
  onDelete: (subject: SubjectRecord) => void
}

export function SubjectCard({ subject, href, onCustomize, onDelete }: SubjectCardProps) {
  const coverColor = getSubjectCoverColor(subject.coverColor)
  const progress = getSubjectProgress(subject)
  const status = getSubjectStatus(subject)

  return (
    <Card size="sm" className="group/subject relative h-full gap-0 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xs ring-0 transition-shadow hover:shadow-md motion-reduce:transition-none">
      <div className="relative h-32 overflow-hidden rounded-lg bg-muted">
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

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-slate-950/65 px-1.5 py-1 text-[10px] font-medium text-white"><Layers3 aria-hidden="true" className="size-3" />{subject.milestones.length} topics</span>
      </div>

      <CardContent className="flex-1 gap-0 px-3 py-3">
        <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><BookOpen aria-hidden="true" className="size-3.5 text-brand" />Personal subject{subject.seeded ? <span className="ml-auto text-[10px]">Example</span> : null}</p>
        <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Link
            to={href}
            className="block rounded text-sm font-semibold leading-5 tracking-tight text-foreground outline-none after:absolute after:inset-0 after:content-[''] hover:text-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {subject.name}
          </Link>
          {subject.instructor ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {subject.instructor}
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
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
          {subject.code ? <span className="rounded bg-muted px-2 py-0.5">{subject.code}</span> : null}
          <span className="rounded bg-muted px-2 py-0.5">{status === "completed" ? "Completed" : status === "in-progress" ? "In progress" : "Not started"}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-xs text-muted-foreground">{subject.milestones.length === 0 ? "Build your study plan" : <><span className="font-medium text-foreground">{progress}%</span> of topics complete</>}</span>
          <span aria-hidden="true" className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xs">{progress >= 100 ? "Review" : progress > 0 ? "Continue" : "Open"}<ArrowUpRight className="size-3" /></span>
        </div>
      </CardContent>
    </Card>
  )
}
