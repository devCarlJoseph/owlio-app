import type { ReactNode } from "react"
import { buildSeats, discussionTable, napArea, roomPlan, watchRoom } from "./detail/study-space-seats"
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

  const { x: tx, z: tz } = discussionTable
  const shape = discussionTable.shape[kind]
  if (shape === "rect") {
    const { w, d } = discussionTable.rect
    items.push(box("table", tx - w / 2, tz - d / 2, w, d, 0.5, OAK))
  } else {
    const r = shape === "oval" ? discussionTable.oval.rx * 0.8 : discussionTable.round.r
    items.push(cylinder("table", tx, tz, r, 0.5, "#a5854f", "#6f562f"))
  }

  buildSeats(kind, Math.min(Math.max(capacity, 0), 8)).forEach((seat) => {
    const size = seat.furniture === "armchair" ? 0.8 : 0.6
    items.push(box(`seat-${seat.id}`, seat.anchor.x - size / 2, seat.anchor.z - size / 2, size, size, 0.4, NAVY))
  })

  ;([
    [-9.3, -6.2],
    [3.4, -0.9],
    [2.9, 6.6],
  ] as Pt[]).forEach(([x, z]) => {
    items.push(cylinder(`plant-${x}-${z}`, x, z, 0.5, 0.9, "#3f7d4e", "#2c5a38"))
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
      <polygon
        points={pts([project(napArea.minX, napArea.minZ), project(napArea.maxX, napArea.minZ), project(napArea.maxX, napArea.maxZ), project(napArea.minX, napArea.maxZ)])}
        fill="#a78bfa"
        opacity={0.25}
      />
      <polygon
        points={pts([project(watchRoom.minX, watchRoom.minZ), project(watchRoom.maxX, watchRoom.minZ), project(watchRoom.maxX, watchRoom.maxZ), project(watchRoom.minX, watchRoom.maxZ)])}
        fill="#2f6fe4"
        opacity={0.16}
      />
      {buildItems(kind, capacity).map((item) => item.node)}
    </svg>
  )
}
