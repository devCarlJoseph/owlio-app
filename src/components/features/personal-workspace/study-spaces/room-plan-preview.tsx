import {
  buildSeats,
  loungeTable,
  meetingRoom,
  roomPlan,
  ROOM_SCALE as K,
  workRug,
  type SeatDef,
} from "./detail/study-space-seats"
import type { StudySpaceKind } from "./study-spaces-records"

type RoomPlanPreviewProps = {
  kind: StudySpaceKind
  capacity: number
  className?: string
}

// Top-down floor plan rendered from the same coordinates the 3D room uses,
// so the preview honestly shows the layout the student will enter.
export function RoomPlanPreview({ kind, capacity, className }: RoomPlanPreviewProps) {
  const seats = buildSeats(kind, Math.min(Math.max(capacity, 0), 8))
  const { halfWidth: w, halfDepth: d } = roomPlan

  return (
    <svg
      viewBox={`${-w} ${-d} ${w * 2} ${d * 2}`}
      aria-hidden="true"
      role="presentation"
      className={className}
    >
      <rect
        x={-w}
        y={-d}
        width={w * 2}
        height={d * 2}
        rx={0.4}
        fill="#f3ead9"
        stroke="#d8cdb8"
        strokeWidth={0.18}
      />

      {[-3.2 * K, 3.2 * K].map((x) => (
        <rect key={x} x={x - 0.95} y={-d + 0.04} width={1.9} height={0.14} rx={0.04} fill="#bfe0f0" />
      ))}
      <rect x={-w + 0.03} y={3.6 * K} width={0.14} height={1.1} rx={0.04} fill="#a5854f" />
      <rect x={5.05 * K} y={-d + 0.38} width={1.55} height={0.14} rx={0.04} fill="#e8eef2" />
      {[0.6 * K, -1.6 * K].map((z) => (
        <rect key={z} x={-w + 0.06} y={z - 1} width={0.45} height={2} rx={0.06} fill="#8a6d42" />
      ))}

      <circle cx={workRug.x} cy={workRug.z} r={workRug.radius} fill="#33415c" opacity={0.14} />
      <rect
        x={meetingRoom.minX}
        y={meetingRoom.minZ}
        width={meetingRoom.maxX - meetingRoom.minX}
        height={meetingRoom.maxZ - meetingRoom.minZ}
        fill="#e6c78f"
        stroke="#7aa7bd"
        strokeWidth={0.18}
        opacity={0.8}
      />
      <rect x={meetingRoom.table.x - 2.3} y={meetingRoom.table.z - 0.75} width={4.6} height={1.5} rx={0.1} fill="#a5854f" />
      <circle cx={loungeTable.x} cy={loungeTable.z} r={1.7} fill="#2f6b4f" opacity={0.2} />
      <circle cx={loungeTable.x} cy={loungeTable.z} r={0.72} fill="#8a6d42" />

      {[
        [-6.2 * K, -4.1 * K],
        [6.2 * K, 4.3 * K],
        [1.9 * K, 4.4 * K],
      ].map(([x, z]) => (
        <circle key={`${x}-${z}`} cx={x} cy={z} r={0.26} fill="#3f7d4e" />
      ))}

      {seats.map((seat) => (
        <SeatPlanMarker key={seat.id} seat={seat} />
      ))}
    </svg>
  )
}

function SeatPlanMarker({ seat }: { seat: SeatDef }) {
  if (seat.furniture === "stool") {
    return <circle cx={seat.anchor.x} cy={seat.anchor.z} r={0.24} fill="#33415c" />
  }

  if (seat.furniture === "chair") {
    return <rect x={seat.anchor.x - 0.25} y={seat.anchor.z - 0.25} width={0.5} height={0.5} rx={0.12} fill="#33415c" />
  }

  if (seat.furniture === "armchair") {
    return (
      <rect
        x={seat.anchor.x - 0.33}
        y={seat.anchor.z - 0.3}
        width={0.66}
        height={0.6}
        rx={0.14}
        fill="#33415c"
      />
    )
  }

  return (
    <g>
      <rect
        x={seat.anchor.x - 0.8}
        y={seat.anchor.z - 0.4}
        width={1.6}
        height={0.8}
        rx={0.08}
        fill="#a5854f"
      />
      <rect
        x={seat.sitPoint.x - 0.14}
        y={seat.sitPoint.z - 0.14}
        width={0.28}
        height={0.28}
        rx={0.07}
        fill="#33415c"
      />
    </g>
  )
}
