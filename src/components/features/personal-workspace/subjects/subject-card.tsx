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
import { getSubjectCoverColor, type SubjectRecord } from "./subject-records"

type SubjectCardProps = {
  subject: SubjectRecord
  href: string
  onCustomize: (subject: SubjectRecord) => void
  onDelete: (subject: SubjectRecord) => void
}

export function SubjectCard({ subject, href, onCustomize, onDelete }: SubjectCardProps) {
  const coverColor = getSubjectCoverColor(subject.coverColor)

  return (
    <Card size="sm" className="group/subject relative h-full gap-0 overflow-hidden border-slate-200 bg-white py-0 shadow-sm ring-0 transition hover:shadow-md">
      <div className="relative h-36 overflow-hidden">
        {subject.coverImage ? (
          <img
            src={subject.coverImage}
            alt=""
            aria-hidden="true"
            className="size-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className={`absolute inset-0 ${coverColor.className}`} />
        )}

        <div aria-hidden="true" className="absolute inset-0 bg-white/25" />
      </div>

      <CardContent className="flex-row items-start gap-2 py-3">
        <div className="min-w-0 flex-1">
          <Link
            to={href}
            className="block truncate rounded text-sm font-semibold text-slate-600 outline-none after:absolute after:inset-0 after:content-[''] hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
