import type { ReactNode } from "react"
import { buildSeats, loungeTable, roomPlan, ROOM_SCALE, workRug } from "./detail/study-space-seats"
import { TILE_ART_CX, TILE_ART_CY, TILE_H, TILE_W } from "./space-map-layout"
import type { StudySpaceKind } from "./study-spaces-records"

const HW = 96
const HH = 48
const THICK = 14
const HEIGHT_UNIT = 14
const { halfWidth: PW, halfDepth: PD } = roomPlan

type Pt = [number, number]

function project(x: number, z: number, h = 0): Pt {
  return [
    TILE_ART_CX + HW * (x / (PW * 2) - z / (PD * 2)),
    TILE_ART_CY + HH * (x / (PW * 2) + z / (PD * 2)) - h * HEIGHT_UNIT,
  ]
}

function pts(points: Pt[]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
}

function circle(cx: number, cz: number, r: number, h = 0): Pt[] {
  return Array.from({ length: 20 }, (_, index) => {
    const angle = (index / 20) * Math.PI * 2
    return project(cx + Math.cos(angle) * r, cz + Math.sin(angle) * r, h)
  })
}

type Item = { depth: number; node: ReactNode }

function box(
  key: string,
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  colors: { top: string; left: string; right: string }
): Item {
  return {
    depth: x + w / 2 + z + d / 2,
    node: (
      <g key={key}>
        <polygon
          points={pts([project(x, z + d), project(x + w, z + d), project(x + w, z + d, h), project(x, z + d, h)])}
          fill={colors.left}
        />
        <polygon
          points={pts([project(x + w, z), project(x + w, z + d), project(x + w, z + d, h), project(x + w, z, h)])}
          fill={colors.right}
        />
        <polygon
          points={pts([project(x, z, h), project(x + w, z, h), project(x + w, z + d, h), project(x, z + d, h)])}
          fill={colors.top}
        />
      </g>
    ),
  }
}

function cylinder(key: string, x: number, z: number, r: number, h: number, top: string, side: string): Item {
  const layers = [0, 0.25, 0.5, 0.75]
  return {
    depth: x + z,
    node: (
      <g key={key}>
        {layers.map((layer) => (
          <polygon key={layer} points={pts(circle(x, z, r, h * layer))} fill={side} />
        ))}
        <polygon points={pts(circle(x, z, r, h))} fill={top} />
      </g>
    ),
  }
}

const OAK = { top: "#c4a266", left: "#7d6238", right: "#98793f" }
const NAVY = { top: "#4a5a80", left: "#262f45", right: "#33415c" }

function buildItems(kind: StudySpaceKind, capacity: number): Item[] {
  const items: Item[] = []

  buildSeats(kind, Math.min(Math.max(capacity, 0), 8)).forEach((seat) => {
    if (seat.furniture === "desk") {
      items.push(box(`desk-${seat.id}`, seat.anchor.x - 0.8, seat.anchor.z - 0.4, 1.6, 0.8, 0.45, OAK))
      items.push({
        depth: seat.anchor.x + seat.anchor.z + 0.5,
        node: <circle key={`lamp-${seat.id}`} cx={project(seat.anchor.x + 0.55, seat.anchor.z - 0.2, 0.7)[0]} cy={project(seat.anchor.x + 0.55, seat.anchor.z - 0.2, 0.7)[1]} r={1.8} fill="#f2b84b" />,
      })
      items.push(box(`chair-${seat.id}`, seat.sitPoint.x - 0.18, seat.sitPoint.z - 0.18, 0.36, 0.36, 0.3, NAVY))
    } else if (seat.furniture === "stool") {
      items.push(cylinder(`stool-${seat.id}`, seat.anchor.x, seat.anchor.z, 0.38, 0.28, "#4a5a80", "#33415c"))
    } else {
      items.push(box(`arm-${seat.id}`, seat.anchor.x - 0.33, seat.anchor.z - 0.3, 0.66, 0.6, 0.45, NAVY))
    }
  })

  items.push(cylinder("lounge-table", loungeTable.x, loungeTable.z, 0.72, 0.5, "#a5854f", "#6f562f"))

  ;([
    [-6.2, -4.1],
    [6.2, 4.3],
    [1.9, 4.4],
  ] as Pt[]).forEach(([x, z]) => {
    x *= ROOM_SCALE
    z *= ROOM_SCALE
    items.push(cylinder(`plant-${x}-${z}`, x, z, 0.4, 0.9, "#3f7d4e", "#2c5a38"))
  })

  return items.sort((a, b) => a.depth - b.depth)
}

type SpaceMapArtProps = {
  kind: StudySpaceKind
  capacity: number
  locked: boolean
  className?: string
}

export function SpaceMapArt({ kind, capacity, locked, className }: SpaceMapArtProps) {
  const top = [project(-PW, -PD), project(PW, -PD), project(PW, PD), project(-PW, PD)]
  const [north, east, south, west] = top
  const thick = (point: Pt): Pt => [point[0], point[1] + THICK]

  return (
    <svg
      viewBox={`0 0 ${TILE_W} ${TILE_H - 40}`}
      width={TILE_W}
      height={TILE_H - 40}
      aria-hidden="true"
      focusable="false"
      className={className}
      data-locked={locked ? "true" : undefined}
    >
      <ellipse cx={TILE_ART_CX} cy={TILE_ART_CY + THICK + 10} rx={HW + 8} ry={HH * 0.55} fill="#33415c" opacity={0.12} />
      <polygon points={pts([west, south, thick(south), thick(west)])} fill="#262f45" />
      <polygon points={pts([south, east, thick(east), thick(south)])} fill="#33415c" />
      <polygon points={pts([north, east, south, west])} fill="#f3ead9" stroke="#a5854f" strokeWidth={3} strokeLinejoin="round" />
      <polygon points={pts(circle(workRug.x, workRug.z, workRug.radius))} fill="#33415c" opacity={0.14} />
      <polygon points={pts(circle(loungeTable.x, loungeTable.z, 1.7))} fill="#2f6b4f" opacity={0.28} />
      {buildItems(kind, capacity).map((item) => item.node)}
    </svg>
  )
}
