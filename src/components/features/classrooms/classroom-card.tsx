import { ArrowRight, ClipboardList, Folder, MoreVertical } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getClassroomCoverUrl } from "./classroom-covers"
import { getClassroomMeta } from "./classroom-list-meta"
import { MetaCell, StatusChip } from "./classroom-list-ui"
import type { Classroom, WorkspaceRole } from "./classroom-types"

type ClassroomCardProps = {
  classroom: Classroom
  href: string
  role: WorkspaceRole
}

const shortcutClassName = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900",
)

function ClassroomMenu({ classroom, href }: { classroom: Classroom; href: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`More options for ${classroom.name}`}
            className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          />
        }
      >
        <MoreVertical aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link to={href} />}>Open class</DropdownMenuItem>
        <DropdownMenuItem render={<Link to={`${href}?tab=classwork`} />}>Classwork</DropdownMenuItem>
        <DropdownMenuItem render={<Link to={`${href}?tab=materials`} />}>Materials</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ClassroomCard({ classroom, href, role }: ClassroomCardProps) {
  const { cells, status } = getClassroomMeta(classroom, role)

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm ring-0 transition-shadow hover:shadow-md">
      <div className="relative p-2 pb-0">
        <img
          src={getClassroomCoverUrl(classroom.id)}
          alt=""
          aria-hidden="true"
          className="h-36 w-full rounded-xl object-cover"
        />
        {classroom.subject ? (
          <span className="absolute left-5 top-5 max-w-[70%] truncate rounded-md bg-white/95 px-2 py-0.5 text-xs font-medium text-slate-800 shadow-sm">
            {classroom.subject}
          </span>
        ) : null}
      </div>

      <CardContent className="flex-1 gap-4 pt-3">
        <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-slate-900">
          <Link
            to={href}
            className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
          >
            {classroom.name}
          </Link>
        </h3>
        <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
          {cells.map((cell) => (
            <MetaCell key={cell.label} label={cell.label}>{cell.value}</MetaCell>
          ))}
          <MetaCell label="Status"><StatusChip status={status} /></MetaCell>
        </div>
      </CardContent>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
        <div className="flex items-center">
          <Link to={`${href}?tab=classwork`} aria-label={`Open ${classroom.name} classwork`} className={shortcutClassName}>
            <ClipboardList aria-hidden="true" />
          </Link>
          <Link to={`${href}?tab=materials`} aria-label={`Open ${classroom.name} materials`} className={shortcutClassName}>
            <Folder aria-hidden="true" />
          </Link>
          <ClassroomMenu classroom={classroom} href={href} />
        </div>
        <Link
          to={href}
          aria-label={`Open class ${classroom.name}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-brand-soft-foreground outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand"
        >
          Open class <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </Card>
  )
}

const listColumns = "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_8rem_auto]"

export function ClassroomListHeader({ role }: { role: WorkspaceRole }) {
  const [first, second] = role === "students" ? ["Educator", "Next session"] : ["Learners", "Next session"]

  return (
    <div role="row" className={cn("hidden gap-4 border-b border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 md:grid", listColumns)}>
      <div role="columnheader">Class</div>
      <div role="columnheader">{first}</div>
      <div role="columnheader">{second}</div>
      <div role="columnheader">Status</div>
      <div role="columnheader"><span className="sr-only">Actions</span></div>
    </div>
  )
}

export function ClassroomListRow({ classroom, href, role }: ClassroomCardProps) {
  const { cells, status } = getClassroomMeta(classroom, role)

  return (
    <div role="row" className={cn("grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 md:items-center md:gap-4", listColumns)}>
      <div role="cell" className="flex min-w-0 items-center gap-3">
        <img
          src={getClassroomCoverUrl(classroom.id)}
          alt=""
          aria-hidden="true"
          className="size-12 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <Link to={href} className="block truncate rounded text-sm font-semibold text-slate-900 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand">
            {classroom.name}
          </Link>
          {classroom.subject ? (
            <span className="mt-0.5 inline-block max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{classroom.subject}</span>
          ) : null}
        </div>
      </div>
      {cells.map((cell) => (
        <div key={cell.label} role="cell" className="min-w-0 truncate text-sm text-slate-700">
          <span className="mr-1 text-xs text-slate-500 md:sr-only">{cell.label}:</span>
          {cell.value}
        </div>
      ))}
      <div role="cell">
        <span className="mr-1 text-xs text-slate-500 md:sr-only">Status:</span>
        <StatusChip status={status} />
      </div>
      <div role="cell" className="flex items-center justify-between gap-1 md:justify-end">
        <Link
          to={href}
          aria-label={`Open class ${classroom.name}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-brand-soft-foreground outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand"
        >
          Open class <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <ClassroomMenu classroom={classroom} href={href} />
      </div>
    </div>
  )
}
