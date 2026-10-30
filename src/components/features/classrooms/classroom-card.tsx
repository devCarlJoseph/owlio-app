import { ArrowRight, MoreHorizontal } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getClassroomCoverUrl } from "./classroom-covers"
import { getClassroomCategory, getClassroomMeta } from "./classroom-list-meta"
import { StatusChip } from "./classroom-list-ui"
import type { Classroom, WorkspaceRole } from "./classroom-types"

type ClassroomCardProps = {
  classroom: Classroom
  href: string
  role: WorkspaceRole
}

function ClassroomMenu({ classroom, href }: { classroom: Classroom; href: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`More options for ${classroom.name}`}
            className="h-10 w-12 rounded-xl text-muted-foreground"
          />
        }
      >
        <MoreHorizontal aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link to={href} />}>Open class</DropdownMenuItem>
        <DropdownMenuItem render={<Link to={`${href}?tab=classwork`} />}>Classwork</DropdownMenuItem>
        <DropdownMenuItem render={<Link to={`${href}?tab=materials`} />}>Materials</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ClassroomCard({ classroom, href }: ClassroomCardProps) {
  return <Card className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-none ring-0">
    <div className="flex flex-1 items-start gap-4">
      <div className="relative shrink-0">
        <img src={getClassroomCoverUrl(classroom.id)} alt="" className="size-20 rounded-xl object-cover sm:size-24" />
        <img src="/mascot/owlio-mark.png" alt="" className="absolute inset-0 m-auto size-10 object-contain drop-shadow-sm" />
      </div>
      <div className="min-w-0 py-0.5">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-soft-foreground">{getClassroomCategory(classroom)}</p>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug"><Link to={href} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand">{classroom.name}</Link></h3>
        <p className="mt-2 text-xs text-muted-foreground">{classroom.instructorName || 'Instructor details unavailable'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{classroom.isMock ? `${classroom.previewStatus === 'inactive' ? 'Inactive' : 'Active'} · preview` : classroom.access === 'owner' ? 'Connected classroom' : 'Enrolled classroom'}</p>
      </div>
    </div>
    <div className="flex items-center gap-2.5">
      <Link to={href} aria-label={`View class ${classroom.name}`} className={cn(buttonVariants({ variant: 'secondary' }), 'h-10 flex-1 rounded-xl bg-brand-soft text-brand-soft-foreground hover:bg-brand-soft/70')}>View class</Link>
      <ClassroomMenu classroom={classroom} href={href} />
    </div>
  </Card>
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
