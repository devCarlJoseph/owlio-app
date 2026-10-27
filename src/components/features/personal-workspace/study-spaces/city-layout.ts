import type { StudySpaceKind, StudySpaceRecord } from "./study-spaces-records"

export type CityRole = "owner" | "member" | "visitor"

export type Footprint = { x: number; z: number; w: number; d: number; h: number }

export type CityLot = {
  space: StudySpaceRecord
  role: CityRole
  x: number
  z: number
  street: number
  building: Footprint
  door: { x: number; z: number }
}

export type CityLayout = {
  lots: CityLot[]
  width: number
  depth: number
  roadsX: number[]
  roadsZ: number[]
  spawn: { x: number; z: number }
}

export const LOT_W = 10
export const LOT_D = 10
export const ROAD = 5
const LOTS_PER_BLOCK = 2

export const BUILDING_SIZE: Record<StudySpaceKind, { w: number; d: number; h: number }> = {
  focused: { w: 5, d: 5, h: 9 },
  collaborative: { w: 7.4, d: 5.6, h: 4.2 },
  lounge: { w: 6, d: 5, h: 3.4 },
}

export function layoutCity(groups: { role: CityRole; spaces: StudySpaceRecord[] }[]): CityLayout {
  const entries = groups.flatMap((group) => group.spaces.map((space) => ({ space, role: group.role })))
  const blockCols = entries.length > 12 ? 3 : 2
  const perRow = blockCols * LOTS_PER_BLOCK
  const rows = Math.max(1, Math.ceil(entries.length / perRow))
  const blockW = LOTS_PER_BLOCK * LOT_W
  const width = blockCols * blockW + (blockCols + 1) * ROAD
  const depth = rows * LOT_D + (rows + 1) * ROAD
  const left = -width / 2
  const top = -depth / 2

  const roadsX = Array.from({ length: blockCols + 1 }, (_, index) => left + ROAD / 2 + index * (blockW + ROAD))
  const roadsZ = Array.from({ length: rows + 1 }, (_, index) => top + ROAD / 2 + index * (LOT_D + ROAD))

  const lots = entries.map(({ space, role }, index): CityLot => {
    const row = Math.floor(index / perRow)
    const slot = index % perRow
    const block = Math.floor(slot / LOTS_PER_BLOCK)
    const inBlock = slot % LOTS_PER_BLOCK
    const x = left + ROAD + block * (blockW + ROAD) + inBlock * LOT_W + LOT_W / 2
    const z = top + ROAD + row * (LOT_D + ROAD) + LOT_D / 2
    const size = BUILDING_SIZE[space.kind]
    const buildingZ = z - LOT_D / 2 + 1.2 + size.d / 2
    return {
      space,
      role,
      x,
      z,
      street: row + 1,
      building: { x, z: buildingZ, ...size },
      door: { x, z: buildingZ + size.d / 2 + 1.1 },
    }
  })

  const first = lots[0]
  const spawn = first ? { x: first.x, z: first.z + LOT_D / 2 + ROAD / 2 } : { x: 0, z: roadsZ[0] }

  return { lots, width, depth, roadsX, roadsZ, spawn }
}

const AVATAR_RADIUS = 0.45

// Keeps a walker inside the city and outside every building footprint.
export function constrainWalker(point: { x: number; z: number }, layout: CityLayout) {
  let x = Math.min(Math.max(point.x, -layout.width / 2 + 0.6), layout.width / 2 - 0.6)
  let z = Math.min(Math.max(point.z, -layout.depth / 2 + 0.6), layout.depth / 2 - 0.6)

  for (const { building } of layout.lots) {
    const halfW = building.w / 2 + AVATAR_RADIUS
    const halfD = building.d / 2 + AVATAR_RADIUS
    const dx = x - building.x
    const dz = z - building.z
    if (Math.abs(dx) >= halfW || Math.abs(dz) >= halfD) continue
    const pushX = halfW - Math.abs(dx)
    const pushZ = halfD - Math.abs(dz)
    if (pushX < pushZ) x = building.x + Math.sign(dx || 1) * halfW
    else z = building.z + Math.sign(dz || 1) * halfD
  }

  return { x, z }
}

export const DOOR_RADIUS = 2.4

export function nearestDoor(point: { x: number; z: number }, layout: CityLayout): CityLot | null {
  let best: CityLot | null = null
  let bestDistance = DOOR_RADIUS
  for (const lot of layout.lots) {
    const distance = Math.hypot(point.x - lot.door.x, point.z - lot.door.z)
    if (distance < bestDistance) {
      bestDistance = distance
      best = lot
    }
  }
  return best
}

export function streetAt(z: number, layout: CityLayout): number {
  const pitch = LOT_D + ROAD
  const row = Math.floor((z + layout.depth / 2 - ROAD) / pitch)
  return Math.min(Math.max(row + 1, 1), layout.roadsZ.length - 1)
}
