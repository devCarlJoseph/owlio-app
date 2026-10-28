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
  // The central block is a public plaza instead of building lots.
  plaza: { x: number; z: number; w: number; d: number }
  // Roundabout with the Owlio fountain at the plaza's front-right intersection.
  roundabout: { x: number; z: number; island: number; ring: number }
}

export const LOT_W = 10
export const LOT_D = 10
export const ROAD = 5
const LOTS_PER_BLOCK = 2
const BLOCK_COLS = 3
export const ROUNDABOUT_ISLAND = 2.2
export const ROUNDABOUT_RING = 4.4

export const BUILDING_SIZE: Record<StudySpaceKind, { w: number; d: number; h: number }> = {
  focused: { w: 5, d: 5, h: 9 },
  collaborative: { w: 7.4, d: 5.6, h: 4.2 },
  lounge: { w: 6, d: 5, h: 3.4 },
}

export function layoutCity(groups: { role: CityRole; spaces: StudySpaceRecord[] }[]): CityLayout {
  const entries = groups.flatMap((group) => group.spaces.map((space) => ({ space, role: group.role })))
  const blockW = LOTS_PER_BLOCK * LOT_W
  const plazaCol = Math.floor(BLOCK_COLS / 2)
  // Odd row count so the plaza block sits in the middle row; it takes one block's lots.
  let rows = 3
  while ((BLOCK_COLS * rows - 1) * LOTS_PER_BLOCK < entries.length) rows += 2
  const plazaRow = Math.floor(rows / 2)
  const width = BLOCK_COLS * blockW + (BLOCK_COLS + 1) * ROAD
  const depth = rows * LOT_D + (rows + 1) * ROAD
  const left = -width / 2
  const top = -depth / 2

  const roadsX = Array.from({ length: BLOCK_COLS + 1 }, (_, index) => left + ROAD / 2 + index * (blockW + ROAD))
  const roadsZ = Array.from({ length: rows + 1 }, (_, index) => top + ROAD / 2 + index * (LOT_D + ROAD))

  const slots: { row: number; block: number; inBlock: number }[] = []
  for (let row = 0; row < rows; row += 1) {
    for (let block = 0; block < BLOCK_COLS; block += 1) {
      if (row === plazaRow && block === plazaCol) continue
      for (let inBlock = 0; inBlock < LOTS_PER_BLOCK; inBlock += 1) slots.push({ row, block, inBlock })
    }
  }

  const lots = entries.map(({ space, role }, index): CityLot => {
    const { row, block, inBlock } = slots[index]
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

  const plaza = {
    x: left + ROAD + plazaCol * (blockW + ROAD) + blockW / 2,
    z: top + ROAD + plazaRow * (LOT_D + ROAD) + LOT_D / 2,
    w: blockW,
    d: LOT_D,
  }
  const roundabout = { x: roadsX[plazaCol + 1], z: roadsZ[plazaRow + 1], island: ROUNDABOUT_ISLAND, ring: ROUNDABOUT_RING }
  const spawn = { x: plaza.x - 3, z: plaza.z + 2 }

  return { lots, width, depth, roadsX, roadsZ, spawn, plaza, roundabout }
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

  const { roundabout } = layout
  const rx = x - roundabout.x
  const rz = z - roundabout.z
  const reach = roundabout.island + AVATAR_RADIUS
  const distance = Math.hypot(rx, rz)
  if (distance < reach) {
    const scale = reach / (distance || 1)
    x = roundabout.x + (distance ? rx : reach / scale) * scale
    z = roundabout.z + rz * scale
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
