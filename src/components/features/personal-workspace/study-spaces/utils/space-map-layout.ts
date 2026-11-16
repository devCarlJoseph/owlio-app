import type { StudySpaceRecord } from "./study-spaces-records"

export type MapRole = "owner" | "member" | "visitor"

export const CELL_W = 300
export const CELL_H = 220
export const COLS = 3
export const TILE_W = 220
export const TILE_H = 228
export const TILE_ART_CX = 110
export const TILE_ART_CY = 110

type Point = { x: number; y: number }

export type MapTile = {
  space: StudySpaceRecord
  role: MapRole
  center: Point
}

export type MapZone = {
  role: MapRole
  label: string
  emptyMessage: string
  tiles: MapTile[]
  rug: Point[]
  labelAt: Point
  center: Point
}

export type MapLayout = {
  zones: MapZone[]
  floor: Point[]
  walkways: { strip: Point[]; line: [Point, Point] }[]
  bounds: { minX: number; minY: number; width: number; height: number }
  focus: Point
}

export function gridToWorld(c: number, r: number): Point {
  return { x: ((c - r) * CELL_W) / 2, y: ((c + r) * CELL_H) / 2 }
}

function quad(c0: number, r0: number, c1: number, r1: number): Point[] {
  return [gridToWorld(c0, r0), gridToWorld(c1, r0), gridToWorld(c1, r1), gridToWorld(c0, r1)]
}

export type MapZoneInput = {
  role: MapRole
  label: string
  emptyMessage: string
  spaces: StudySpaceRecord[]
}

export function layoutMap(inputs: MapZoneInput[]): MapLayout {
  let cursor = 0
  const rowStarts: { row0: number; rows: number }[] = []

  const zones = inputs.map((input): MapZone => {
    const rows = Math.max(1, Math.ceil(input.spaces.length / COLS))
    const row0 = cursor
    cursor += rows + 1
    rowStarts.push({ row0, rows })

    const tiles = input.spaces.map((space, index): MapTile => {
      const row = Math.floor(index / COLS)
      const offset = index % COLS
      const col = row % 2 === 0 ? offset : COLS - 1 - offset
      return { space, role: input.role, center: gridToWorld(col, row0 + row) }
    })

    return {
      role: input.role,
      label: input.label,
      emptyMessage: input.emptyMessage,
      tiles,
      rug: quad(-0.6, row0 - 0.6, COLS - 0.4, row0 + rows - 0.4),
      labelAt: gridToWorld(-0.6, row0 - 0.6),
      center: gridToWorld((COLS - 1) / 2, row0 + (rows - 1) / 2),
    }
  })

  const totalRows = cursor - 1
  const floor = quad(-1.6, -1.6, COLS + 0.6, totalRows + 0.6)

  const walkways = rowStarts.slice(0, -1).map(({ row0, rows }) => {
    const edge = row0 + rows
    return {
      strip: quad(-1.6, edge - 0.4, COLS + 0.6, edge + 0.4),
      line: [gridToWorld(-1.3, edge), gridToWorld(COLS + 0.3, edge)] as [Point, Point],
    }
  })

  const xs = floor.map((point) => point.x)
  const ys = floor.map((point) => point.y)
  const pad = 24
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad

  return {
    zones,
    floor,
    walkways,
    bounds: {
      minX,
      minY,
      width: Math.max(...xs) + pad - minX,
      height: Math.max(...ys) + pad - minY,
    },
    focus: { x: gridToWorld((COLS - 1) / 2, 0).x, y: zones[0].labelAt.y - 30 },
  }
}

export function pointsAttr(points: Point[], origin?: Point): string {
  return points.map((point) => `${point.x - (origin?.x ?? 0)},${point.y - (origin?.y ?? 0)}`).join(" ")
}
