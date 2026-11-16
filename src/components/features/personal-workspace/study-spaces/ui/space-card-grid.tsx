import { useState } from "react"
import { Link } from "react-router"
import { Lock, MoreVertical, Trash2, Users } from "lucide-react"
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
import { kindLabel, metaLine } from "../utils/space-format"
import { studySpacesLockedTooltip, type StudySpaceRecord } from "../utils/study-spaces-records"

export function SpaceActionsMenu({
  space,
  onRemove,
  className,
}: {
  space: StudySpaceRecord
  onRemove: (space: StudySpaceRecord) => void
  className?: string
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isOwner = space.role === "owner"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`More actions for ${space.name}`}
              className={className ?? "shrink-0 text-slate-500 surface-dark:text-muted-foreground hover:text-slate-900 surface-dark:hover:text-foreground"}
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
    </>
  )
}

function SpaceCard({
  space,
  onRemove,
}: {
  space: StudySpaceRecord
  onRemove: (space: StudySpaceRecord) => void
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card shadow-sm transition-colors hover:border-slate-300 surface-dark:hover:border-border">
      <div className="flex gap-3 p-3">
        <div className="w-24 shrink-0 self-start overflow-hidden rounded-lg border border-slate-100 surface-dark:border-border">
          <RoomPlanPreview kind={space.kind} capacity={space.capacity} className="block h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 surface-dark:text-foreground">
            {space.name}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500 surface-dark:text-muted-foreground">
            {kindLabel(space.kind)} · {space.capacity} seats
          </p>
          <p className="mt-1 text-xs leading-4 text-slate-500 surface-dark:text-muted-foreground">
            {metaLine(space)} · browser only
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 surface-dark:border-border p-2">
        <Link
          to={`/students/study-spaces/${space.id}`}
          aria-label={`Open ${space.name}`}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-md bg-blue-50 surface-dark:bg-surface-blue-soft text-sm font-medium text-blue-700 surface-dark:text-blue-300 outline-none transition-colors hover:bg-blue-100 surface-dark:hover:bg-surface-blue-soft focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Open room
        </Link>
        <SpaceActionsMenu space={space} onRemove={onRemove} />
      </div>
    </div>
  )
}

function LockedSpaceCard({
  space,
  onUnlock,
}: {
  space: StudySpaceRecord
  onUnlock: (space: StudySpaceRecord) => void
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-dashed border-slate-300 surface-dark:border-border bg-slate-50 surface-dark:bg-background shadow-sm">
      <div className="flex gap-3 p-3">
        <div className="w-24 shrink-0 self-start overflow-hidden rounded-lg border border-slate-200 surface-dark:border-border opacity-55 grayscale">
          <RoomPlanPreview kind={space.kind} capacity={space.capacity} className="block h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800 surface-dark:text-foreground">{space.name}</h4>
          <p className="mt-0.5 text-xs text-slate-500 surface-dark:text-muted-foreground">
            {kindLabel(space.kind)} · {space.capacity} seats
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs leading-4 text-slate-600 surface-dark:text-muted-foreground">
            <Lock className="size-3 shrink-0" aria-hidden="true" />
            {studySpacesLockedTooltip}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200 surface-dark:border-border p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          aria-label={`${space.name} — locked preview, needs a space code`}
          onClick={() => onUnlock(space)}
        >
          Enter space code
        </Button>
      </div>
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
    <ul role="list" aria-label={label} className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {spaces.map((space) => (
        <li key={space.id}>
          <SpaceCard space={space} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  )
}

export function LockedSpaceGrid({
  label,
  spaces,
  onUnlock,
}: {
  label: string
  spaces: StudySpaceRecord[]
  onUnlock: (space: StudySpaceRecord) => void
}) {
  return (
    <ul role="list" aria-label={label} className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {spaces.map((space) => (
        <li key={space.id}>
          <LockedSpaceCard space={space} onUnlock={onUnlock} />
        </li>
      ))}
    </ul>
  )
}

export function SpaceGridEmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 surface-dark:border-border bg-slate-50/60 surface-dark:bg-background/60 p-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 surface-dark:bg-muted text-slate-500 surface-dark:text-muted-foreground">
        <Users className="size-4" aria-hidden="true" />
      </span>
      <p className="text-sm leading-5 text-slate-600 surface-dark:text-muted-foreground">{message}</p>
    </div>
  )
}
