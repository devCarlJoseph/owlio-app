import {
  buildRoomSpots,
  buildSeats,
  discussionTable,
  napArea,
  roomPlan,
  watchRoom,
  type SeatDef,
} from "./detail/study-space-seats"
import type { StudySpaceKind } from "./study-spaces-records"

type RoomPlanPreviewProps = {
  kind: StudySpaceKind
  capacity: number
  className?: string
}

const spots = buildRoomSpots()

// Top-down floor plan rendered from the same coordinates the 3D room uses,
// so the preview honestly shows the layout the student will enter.
export function RoomPlanPreview({ kind, capacity, className }: RoomPlanPreviewProps) {
  const seats = buildSeats(kind, Math.min(Math.max(capacity, 0), 8))
  const { halfWidth: w, halfDepth: d } = roomPlan
  const shape = discussionTable.shape[kind]
  const { x: tx, z: tz } = discussionTable

  return (
    <svg viewBox={`${-w} ${-d} ${w * 2} ${d * 2}`} aria-hidden="true" role="presentation" className={className}>
      <rect x={-w} y={-d} width={w * 2} height={d * 2} rx={0.4} fill="#fbf3e2" stroke="#2f6fe4" strokeWidth={0.25} />
      <rect
        x={napArea.minX}
        y={napArea.minZ}
        width={napArea.maxX - napArea.minX}
        height={napArea.maxZ - napArea.minZ}
        fill="#ece4f8"
      />
      <rect
        x={watchRoom.minX}
        y={watchRoom.minZ}
        width={watchRoom.maxX - watchRoom.minX}
        height={watchRoom.maxZ - watchRoom.minZ}
        fill="#dde6f6"
      />
      <rect x={watchRoom.maxX - 0.5} y={watchRoom.screenZ - 2} width={0.3} height={4} fill="#1e293b" />
      <rect x={-2.6} y={4.85} width={4.6} height={2.3} rx={0.3} fill="#a7d796" />
      <rect x={-w + 0.1} y={0.8} width={0.6} height={3.6} fill="#94a3b8" />

      {shape === "rect" ? (
        <rect
          x={tx - discussionTable.rect.w / 2}
          y={tz - discussionTable.rect.d / 2}
          width={discussionTable.rect.w}
          height={discussionTable.rect.d}
          rx={0.15}
          fill="#a5854f"
        />
      ) : shape === "oval" ? (
        <ellipse cx={tx} cy={tz} rx={discussionTable.oval.rx} ry={discussionTable.oval.rz} fill="#a5854f" />
      ) : (
        <circle cx={tx} cy={tz} r={discussionTable.round.r} fill="#a5854f" />
      )}

      {[...seats, ...spots].map((seat) => (
        <SeatPlanMarker key={seat.id} seat={seat} />
      ))}
    </svg>
  )
}

function SeatPlanMarker({ seat }: { seat: SeatDef }) {
  const { x, z } = seat.anchor
  if (seat.furniture === "mat") return <rect x={x - 0.45} y={z - 0.95} width={0.9} height={1.9} rx={0.2} fill="#a78bfa" />
  if (seat.furniture === "sofa") return <rect x={x - 0.4} y={z - 0.55} width={0.8} height={1.1} rx={0.15} fill="#475569" />
  if (seat.furniture === "armchair") return <circle cx={x} cy={z} r={0.4} fill="#33415c" />
  return <rect x={x - 0.27} y={z - 0.27} width={0.54} height={0.54} rx={0.12} fill="#33415c" />
}
