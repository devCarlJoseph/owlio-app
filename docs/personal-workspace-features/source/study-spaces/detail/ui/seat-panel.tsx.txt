import { Armchair, BedDouble, Tv, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SeatDef } from "./study-space-seats"

type SeatPanelProps = {
  seat: SeatDef
  occupied: boolean
  takenBy?: string | null
  onSit: () => void
  onClose: () => void
}

const ACTION: Record<SeatDef["furniture"], string> = {
  chair: "Sit here",
  armchair: "Sit here",
  mat: "Rest here",
  sofa: "Sit and watch",
}

export function SeatPanel({ seat, occupied, takenBy = null, onSit, onClose }: SeatPanelProps) {
  const Icon = seat.furniture === "mat" ? BedDouble : seat.furniture === "sofa" ? Tv : Armchair
  const status = occupied
    ? seat.furniture === "mat"
      ? "You are resting here"
      : "You are seated here"
    : takenBy
      ? seat.furniture === "mat"
        ? `${takenBy} (sample) is napping here`
        : `${takenBy} (sample) sits here`
      : "Available"

  return (
    <div
      role="dialog"
      aria-label={`Seat: ${seat.name}`}
      className="absolute bottom-16 left-1/2 z-20 w-72 max-w-[92%] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon className="size-4 text-emerald-800" aria-hidden="true" />
            {seat.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{seat.characteristic}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close seat details">
          <X aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
          {seat.zoneLabel}
        </Badge>
        <Badge variant="secondary" className={occupied ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}>
          {status}
        </Badge>
      </div>

      {seat.furniture === "mat" && !occupied && !takenBy ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Resting shows a napping status in this room preview. It is not shared with other students yet.
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        {occupied || takenBy ? null : (
          <Button type="button" size="sm" className="flex-1 bg-emerald-800 text-white hover:bg-emerald-700" onClick={onSit}>
            {ACTION[seat.furniture]}
          </Button>
        )}
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          {occupied ? "Close" : "Not now"}
        </Button>
      </div>
    </div>
  )
}
