import type { StudySpaceKind } from "../study-spaces-records"

// Shared with space-room-scene.tsx and the floor-plan previews.
export const roomPlan = { halfWidth: 10.5, halfDepth: 7.5 }

export type StudyZone = "discussion" | "nap" | "watch"

export type SeatFurniture = "chair" | "armchair" | "mat" | "sofa"

export type SeatDef = {
  id: string
  name: string
  zone: StudyZone
  zoneLabel: string
  characteristic: string
  furniture: SeatFurniture
  // Where the chair, mat or sofa seat renders in the room.
  anchor: { x: number; z: number }
  furnitureRotationY: number
  // Where the character sits or lies and the direction it faces.
  sitPoint: { x: number; z: number }
  faceRotation: number
}

export type TableShape = "rect" | "oval" | "round"

// One discussion table per room; the room type picks its shape.
export const discussionTable = {
  x: -3.4,
  z: -1.6,
  shape: { focused: "rect", collaborative: "oval", lounge: "round" } as Record<StudySpaceKind, TableShape>,
  rect: { w: 4.6, d: 1.7 },
  oval: { rx: 2.5, rz: 1.35 },
  round: { r: 1.35 },
}

export const napArea = { minX: 4.2, maxX: 10.5, minZ: -7.5, maxZ: -1.8 }
export const watchRoom = { minX: 4.2, maxX: 10.5, minZ: 0.4, maxZ: 7.5, screenZ: 3.95 }

const ZONE_LABELS: Record<StudyZone, string> = {
  discussion: "Discussion table",
  nap: "Nap area",
  watch: "Watch room",
}

const face = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z)

type Spot = { x: number; z: number; characteristic: string }

function rectSpots(capacity: number): Spot[] {
  const { x: tx, z: tz, rect } = discussionTable
  const north = Math.ceil(capacity / 2)
  const south = capacity - north
  const side = (count: number, z: number, characteristic: string) =>
    Array.from({ length: count }, (_, index) => ({
      x: tx + (index - (count - 1) / 2) * 1.1,
      z,
      characteristic,
    }))
  return [
    ...side(north, tz - rect.d / 2 - 0.55, "Facing the room, back to the whiteboard"),
    ...side(south, tz + rect.d / 2 + 0.55, "Facing the whiteboard"),
  ]
}

function ellipseSpots(capacity: number, rx: number, rz: number, characteristic: string): Spot[] {
  const { x: tx, z: tz } = discussionTable
  return Array.from({ length: capacity }, (_, index) => {
    const angle = -Math.PI / 2 + (index / capacity) * Math.PI * 2
    return { x: tx + Math.cos(angle) * rx, z: tz + Math.sin(angle) * rz, characteristic }
  })
}

export function buildSeats(kind: StudySpaceKind, capacity: number): SeatDef[] {
  const count = Math.max(0, Math.min(capacity, 8))
  const shape = discussionTable.shape[kind]
  const spots =
    shape === "rect"
      ? rectSpots(count)
      : shape === "oval"
        ? ellipseSpots(count, discussionTable.oval.rx + 0.75, discussionTable.oval.rz + 0.75, "Around the oval table")
        : ellipseSpots(count, discussionTable.round.r + 0.95, discussionTable.round.r + 0.95, "Cosy armchair by the round table")
  const furniture: SeatFurniture = shape === "round" ? "armchair" : "chair"

  return spots.map((spot, index) => {
    const rotation = face(spot.x, spot.z, discussionTable.x, discussionTable.z)
    return {
      id: `${furniture}-${index}`,
      name: `Table seat ${index + 1}`,
      zone: "discussion",
      zoneLabel: ZONE_LABELS.discussion,
      characteristic: spot.characteristic,
      furniture,
      anchor: { x: spot.x, z: spot.z },
      furnitureRotationY: rotation,
      sitPoint: { x: spot.x, z: spot.z },
      faceRotation: rotation,
    }
  })
}

// Nap mats and watch-room sofa seats, the same in every room.
export function buildRoomSpots(): SeatDef[] {
  const mats: SeatDef[] = [6, 7.8, 9.6].map((x, index) => ({
    id: `mat-${index}`,
    name: `Nap mat ${index + 1}`,
    zone: "nap",
    zoneLabel: ZONE_LABELS.nap,
    characteristic: "Soft mat with a pillow and blanket",
    furniture: "mat",
    anchor: { x, z: -5 },
    furnitureRotationY: 0,
    sitPoint: { x, z: -5.45 },
    faceRotation: 0,
  }))
  const sofas: SeatDef[] = [2.4, 5.4].flatMap((z, sofa) =>
    [-0.6, 0.6].map((offset, index) => ({
      id: `sofa-${sofa * 2 + index}`,
      name: `Sofa seat ${sofa * 2 + index + 1}`,
      zone: "watch" as const,
      zoneLabel: ZONE_LABELS.watch,
      characteristic: "Faces the big screen",
      furniture: "sofa" as const,
      anchor: { x: 6.6, z: z + offset },
      furnitureRotationY: Math.PI / 2,
      sitPoint: { x: 6.6, z: z + offset },
      faceRotation: Math.PI / 2,
    }))
  )
  return [...mats, ...sofas]
}

// Characters enter near the exit portal in the front-left corner.
export const roomSpawnPoint = { x: -roomPlan.halfWidth + 2.4, z: roomPlan.halfDepth - 2.4 }
