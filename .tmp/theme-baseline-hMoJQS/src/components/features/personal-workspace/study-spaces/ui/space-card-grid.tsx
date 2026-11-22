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
  onRemove: (space: StudySpaceRecord) => void | Promise<void>
  className?: string
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const isOwner = space.role === "owner"
  const ownerAction = space.accountSpace ? "Archive" : "Remove"

  async function confirm() {
    setBusy(true)
    setError("")
    try {
      await onRemove(space)
      setConfirmOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this space.")
    } finally {
      setBusy(false)
    }
  }

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
          <DropdownMenuItem variant="destructive" onClick={() => { setError(""); setConfirmOpen(true) }}>
            <Trash2 aria-hidden="true" />
            {isOwner ? (space.accountSpace ? "Archive space" : "Remove from this browser") : "Leave space"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!busy) setConfirmOpen(open) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {isOwner ? `${ownerAction} this study space?` : "Leave this study space?"}
            </DialogTitle>
            <DialogDescription>
              {space.accountSpace
                ? (isOwner ? `“${space.name}” will close for all members.` : `You will lose access to “${space.name}”.`)
                : isOwner
                ? `"${space.name}" will be removed from this browser. Study spaces are local previews, so this does not affect other students.`
                : `"${space.name}" will be removed from your joined list in this browser.`}
            </DialogDescription>
          </DialogHeader>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void confirm()}
            >
              {isOwner ? `${ownerAction} space` : "Leave space"}
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
  onRemove: (space: StudySpaceRecord) => void | Promise<void>
}) {
  const [copyStatus, setCopyStatus] = useState("")

  async function copyInviteCode() {
    if (!space.joinCode) return
    try {
      await navigator.clipboard.writeText(space.joinCode)
      setCopyStatus("Invite code copied.")
    } catch {
      setCopyStatus("Select the invite code above and copy it manually.")
    }
  }

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
          {space.discoverySpace ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600 surface-dark:text-muted-foreground">
              {space.about || "Student-created shared study space."}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-slate-500 surface-dark:text-muted-foreground">
              {kindLabel(space.kind)} · {space.capacity} seats
            </p>
          )}
          <p className="mt-1 text-xs leading-4 text-slate-500 surface-dark:text-muted-foreground">
            {space.accountSpace ? "Shared space" : `${metaLine(space)} · browser only`}
          </p>
          {space.accountSpace && space.role === "owner" && space.joinCode ? (
            <p className="mt-1 break-all text-xs text-slate-700 surface-dark:text-foreground">
              Invite code: <code className="font-semibold">{space.joinCode}</code>
            </p>
          ) : null}
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
        {space.accountSpace && space.role === "owner" && space.joinCode ? (
          <Button type="button" size="xs" variant="outline" onClick={() => void copyInviteCode()}>
            Copy code
          </Button>
        ) : null}
        <SpaceActionsMenu space={space} onRemove={onRemove} />
      </div>
      {copyStatus && <p role="status" className="px-3 pb-2 text-xs text-muted-foreground">{copyStatus}</p>}
    </div>
  )
}

function LockedSpaceCard({
  space,
  onUnlock,
}: {
  space: StudySpaceRecord
  onUnlock: (space: StudySpaceRecord) => void | Promise<void>
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
            {space.discoverySpace ? "Student-created space · owner access code required" : studySpacesLockedTooltip}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200 surface-dark:border-border p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          aria-label={`${space.name} — access code required to join`}
          onClick={() => onUnlock(space)}
        >
          {space.discoverySpace ? "Join with code" : "Enter space code"}
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
