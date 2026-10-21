import { useState } from "react"
import { Link } from "react-router"
import { formatDistanceToNow } from "date-fns"
import { MoreVertical, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoomPlanPreview } from "./room-plan-preview"
import { studySpaceKinds, type StudySpaceRecord } from "./study-spaces-records"

function kindLabel(kind: StudySpaceRecord["kind"]): string {
  return studySpaceKinds.find((entry) => entry.value === kind)?.label ?? "Study space"
}

function relativeTime(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return formatDistanceToNow(date, { addSuffix: true })
}

function metaLine(space: StudySpaceRecord): string {
  const visited = space.lastVisitedAt ? relativeTime(space.lastVisitedAt) : null
  if (visited) return `Last opened ${visited}`
  const created = relativeTime(space.createdAt)
  return created ? `Added ${created}` : "Saved in this browser"
}

function SpaceCard({
  space,
  onRemove,
}: {
  space: StudySpaceRecord
  onRemove: (space: StudySpaceRecord) => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isOwner = space.role === "owner"

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300">
      <div className="flex gap-3 p-3">
        <div className="w-24 shrink-0 self-start overflow-hidden rounded-lg border border-slate-100">
          <RoomPlanPreview kind={space.kind} capacity={space.capacity} className="block h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
            {space.name}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            {kindLabel(space.kind)} · {space.capacity} seats
          </p>
          <p className="mt-1 text-xs leading-4 text-slate-500">
            {metaLine(space)} · browser only
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 p-2">
        <Link
          to={`/students/study-spaces/${space.id}`}
          aria-label={`Open ${space.name}`}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-md bg-blue-50 text-sm font-medium text-blue-700 outline-none transition-colors hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Open room
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${space.name}`}
                className="shrink-0 text-slate-500 hover:text-slate-900"
              />
            }
          >
            <MoreVertical aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" />
              {isOwner ? "Remove from this browser" : "Leave space"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {isOwner ? "Remove this study space?" : "Leave this study space?"}
            </DialogTitle>
            <DialogDescription>
              {isOwner
                ? `"${space.name}" will be removed from this browser. Study spaces are local previews, so this does not affect other students.`
                : `"${space.name}" will be removed from your joined list in this browser.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onRemove(space)
                setConfirmOpen(false)
              }}
            >
              {isOwner ? "Remove space" : "Leave space"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function SpaceGrid({
  label,
  spaces,
  onRemove,
}: {
  label: string
  spaces: StudySpaceRecord[]
  onRemove: (space: StudySpaceRecord) => void
}) {
  return (
    <ul role="list" aria-label={label} className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {spaces.map((space) => (
        <li key={space.id}>
          <SpaceCard space={space} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  )
}

export function SpaceGridEmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Users className="size-4" aria-hidden="true" />
      </span>
      <p className="text-sm leading-5 text-slate-600">{message}</p>
    </div>
  )
}
