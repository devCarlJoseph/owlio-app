import { ClipboardList, Folder, MoreVertical } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getClassroomCoverTheme, getClassroomCoverUrl } from "./classroom-covers"
import type { Classroom } from "./classroom-types"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

type ClassroomCardProps = {
  classroom: Classroom
  href: string
}

export function ClassroomCard({ classroom, href }: ClassroomCardProps) {
  const coverTheme = getClassroomCoverTheme(classroom.id)
  const classworkHref = `${href}?tab=classwork`
  const materialsHref = `${href}?tab=materials`

  return (
    <Card className="flex h-full flex-col overflow-hidden border-slate-200 bg-white shadow-sm ring-0 transition hover:border-blue-200 hover:shadow-md">
      <div className="relative">
        <img
          src={getClassroomCoverUrl(classroom.id)}
          alt=""
          aria-hidden="true"
          className="h-32 w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent"
        />

        <div className="absolute inset-0 flex flex-col justify-center gap-1 p-4">
          <h3 className="text-lg font-semibold leading-tight text-white drop-shadow-sm">
            <Link
              to={href}
              className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {classroom.name}
            </Link>
          </h3>
          {classroom.subject ? (
            <p className="text-sm font-medium text-white/90">{classroom.subject}</p>
          ) : null}
          <p className="text-xs text-white/80">{classroom.instructorName}</p>
        </div>

        <Badge
          variant="outline"
          className={
            classroom.isMock
              ? "absolute right-3 top-3 border-amber-200 bg-amber-50/95 text-amber-800"
              : "absolute right-3 top-3 border-emerald-200 bg-emerald-50/95 text-emerald-800"
          }
        >
          {classroom.isMock ? "Demo" : "Enrolled"}
        </Badge>

        <span
          aria-hidden="true"
          className={`absolute -bottom-6 right-4 inline-flex size-12 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-white ${coverTheme.accent}`}
          title={`${classroom.instructorName}'s profile`}
        >
          {getInitials(classroom.instructorName)}
        </span>
      </div>

      <CardContent className="flex-1 gap-3 pt-8">
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
          {classroom.description || "Your educator has not added a description yet."}
        </p>
      </CardContent>

      <div className="flex items-center justify-center gap-8 border-t border-slate-100 px-4 py-2">
        <Link
          to={classworkHref}
          aria-label={`Open ${classroom.name} classwork`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <ClipboardList aria-hidden="true" />
        </Link>

        <Link
          to={materialsHref}
          aria-label={`Open ${classroom.name} materials`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Folder aria-hidden="true" />
        </Link>

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

          <DropdownMenuContent align="center">
            <DropdownMenuItem render={<Link to={href} />}>Open class</DropdownMenuItem>
            <DropdownMenuItem render={<Link to={classworkHref} />}>Classwork</DropdownMenuItem>
            <DropdownMenuItem render={<Link to={materialsHref} />}>Materials</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
