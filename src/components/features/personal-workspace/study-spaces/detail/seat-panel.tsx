import { Armchair, X } from "lucide-react"
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

export function SeatPanel({ seat, occupied, takenBy = null, onSit, onClose }: SeatPanelProps) {
  return (
    <div
      role="dialog"
      aria-label={`Seat: ${seat.name}`}
      className="absolute bottom-16 left-1/2 z-20 w-72 max-w-[92%] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Armchair className="size-4 text-emerald-800" aria-hidden="true" />
            {seat.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{seat.characteristic}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close seat details">
          <X aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
          {seat.zoneLabel}
        </Badge>
        <Badge
          variant="secondary"
          className={occupied ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}
        >
          {occupied ? "You are seated here" : takenBy ? `${takenBy} (sample) sits here` : "Available"}
        </Badge>
      </div>

      <div className="mt-3 flex gap-2">
        {occupied || takenBy ? null : (
          <Button
            type="button"
            size="sm"
            className="flex-1 bg-emerald-800 text-white hover:bg-emerald-700"
            onClick={onSit}
          >
            Sit here
          </Button>
        )}
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          {occupied ? "Close" : "Not now"}
        </Button>
      </div>
    </div>
  )
}
