import type { StudySpaceKind } from "../study-spaces-records"

// Shared with space-room-scene.tsx and the dialog floor-plan previews.
// Every plan coordinate below was authored for a 14x10 room and is spread by ROOM_SCALE.
export const ROOM_SCALE = 1.5
export const roomPlan = { halfWidth: 7 * ROOM_SCALE, halfDepth: 5 * ROOM_SCALE }

export type StudyZone = "quiet" | "collaborative" | "reading" | "lounge" | "meeting"

export type SeatFurniture = "desk" | "stool" | "armchair" | "chair"

export type SeatDef = {
  id: string
  name: string
  zone: StudyZone
  zoneLabel: string
  characteristic: string
  furniture: SeatFurniture
  // Where the desk/stool/armchair renders in the room.
  anchor: { x: number; z: number }
  // Rotation applied to desk furniture so its chair faces the room.
  furnitureRotationY: number
  // Where the character stands/sits and the direction it faces when seated.
  sitPoint: { x: number; z: number }
  faceRotation: number
}

const ZONE_LABELS: Record<StudyZone, string> = {
  quiet: "Quiet study",
  collaborative: "Collaborative tables",
  reading: "Reading corner",
  lounge: "Lounge",
  meeting: "Meeting room",
}

type SeatSpec = Omit<SeatDef, "id" | "zoneLabel">

function spread(specs: SeatSpec[]): SeatSpec[] {
  return specs.map((spec) => {
    const anchor = { x: spec.anchor.x * ROOM_SCALE, z: spec.anchor.z * ROOM_SCALE }
    return {
      ...spec,
      anchor,
      sitPoint: {
        x: anchor.x + (spec.sitPoint.x - spec.anchor.x),
        z: anchor.z + (spec.sitPoint.z - spec.anchor.z),
      },
    }
  })
}

// Working area: desks along the back wall and paired tables, left of the glass meeting room.
const QUIET_DESKS: SeatSpec[] = [
  {
    name: "Window Seat 1",
    zone: "quiet",
    characteristic: "Natural light from the window",
    furniture: "desk",
    anchor: { x: -8.4, z: -5.25 },
    furnitureRotationY: 0,
    sitPoint: { x: -8.4, z: -4.51 },
    faceRotation: Math.PI,
  },
  {
    name: "Window Seat 2",
    zone: "quiet",
    characteristic: "Natural light from the window",
    furniture: "desk",
    anchor: { x: -5, z: -5.25 },
    furnitureRotationY: 0,
    sitPoint: { x: -5, z: -4.51 },
    faceRotation: Math.PI,
  },
  {
    name: "Focus Desk 3",
    zone: "quiet",
    characteristic: "Facing the board",
    furniture: "desk",
    anchor: { x: -1.6, z: -5.25 },
    furnitureRotationY: 0,
    sitPoint: { x: -1.6, z: -4.51 },
    faceRotation: Math.PI,
  },
  {
    name: "Focus Desk 4",
    zone: "quiet",
    characteristic: "Facing the board",
    furniture: "desk",
    anchor: { x: 1.8, z: -5.25 },
    furnitureRotationY: 0,
    sitPoint: { x: 1.8, z: -4.51 },
    faceRotation: Math.PI,
  },
]

const COLLAB_DESKS: SeatSpec[] = [
  {
    name: "Shared Table A",
    zone: "collaborative",
    characteristic: "Face-to-face partner desk",
    furniture: "desk",
    anchor: { x: -6.6, z: -1.7 },
    furnitureRotationY: 0,
    sitPoint: { x: -6.6, z: -0.98 },
    faceRotation: Math.PI,
  },
  {
    name: "Shared Table B",
    zone: "collaborative",
    characteristic: "Face-to-face partner desk",
    furniture: "desk",
    anchor: { x: -6.6, z: 0.5 },
    furnitureRotationY: Math.PI,
    sitPoint: { x: -6.6, z: -0.22 },
    faceRotation: 0,
  },
  {
    name: "Shared Table C",
    zone: "collaborative",
    characteristic: "Face-to-face partner desk",
    furniture: "desk",
    anchor: { x: -2.6, z: -1.7 },
    furnitureRotationY: 0,
    sitPoint: { x: -2.6, z: -0.98 },
    faceRotation: Math.PI,
  },
  {
    name: "Shared Table D",
    zone: "collaborative",
    characteristic: "Face-to-face partner desk",
    furniture: "desk",
    anchor: { x: -2.6, z: 0.5 },
    furnitureRotationY: Math.PI,
    sitPoint: { x: -2.6, z: -0.22 },
    faceRotation: 0,
  },
]

const LOUNGE_TABLE = { x: 4.6 * ROOM_SCALE, z: 3.0 * ROOM_SCALE }

const LOUNGE_STOOLS: SeatSpec[] = [
  {
    name: "Lounge Stool 1",
    zone: "lounge",
    characteristic: "Casual round-table seat",
    furniture: "stool",
    anchor: { x: LOUNGE_TABLE.x, z: LOUNGE_TABLE.z - 1.15 },
    furnitureRotationY: 0,
    sitPoint: { x: LOUNGE_TABLE.x, z: LOUNGE_TABLE.z - 1.15 },
    faceRotation: 0,
  },
  {
    name: "Lounge Stool 2",
    zone: "lounge",
    characteristic: "Casual round-table seat",
    furniture: "stool",
    anchor: { x: LOUNGE_TABLE.x + 1.15, z: LOUNGE_TABLE.z },
    furnitureRotationY: 0,
    sitPoint: { x: LOUNGE_TABLE.x + 1.15, z: LOUNGE_TABLE.z },
    faceRotation: -Math.PI / 2,
  },
  {
    name: "Lounge Stool 3",
    zone: "lounge",
    characteristic: "Casual round-table seat",
    furniture: "stool",
    anchor: { x: LOUNGE_TABLE.x, z: LOUNGE_TABLE.z + 1.15 },
    furnitureRotationY: 0,
    sitPoint: { x: LOUNGE_TABLE.x, z: LOUNGE_TABLE.z + 1.15 },
    faceRotation: Math.PI,
  },
  {
    name: "Lounge Stool 4",
    zone: "lounge",
    characteristic: "Casual round-table seat",
    furniture: "stool",
    anchor: { x: LOUNGE_TABLE.x - 1.15, z: LOUNGE_TABLE.z },
    furnitureRotationY: 0,
    sitPoint: { x: LOUNGE_TABLE.x - 1.15, z: LOUNGE_TABLE.z },
    faceRotation: Math.PI / 2,
  },
]

export const meetingRoom = { minX: 3.2, maxX: 10.3, minZ: -7.3, maxZ: -0.2, table: { x: 6.8, z: -3.6 } }

const MEETING_CHAIRS: SeatSpec[] = [
  [5.4, -1.25],
  [5.4, 1.25],
  [6.8, -1.25],
  [6.8, 1.25],
  [8.2, -1.25],
  [8.2, 1.25],
].map(([x, offset], index) => {
  const north = offset < 0
  const z = meetingRoom.table.z + offset
  return {
    name: `Meeting Seat ${index + 1}`,
    zone: "meeting" as const,
    characteristic: "Glass-walled meeting room",
    furniture: "chair" as const,
    anchor: { x, z },
    furnitureRotationY: north ? 0 : Math.PI,
    sitPoint: { x, z },
    faceRotation: north ? 0 : Math.PI,
  }
})

// Center of the rug under the paired working tables.
export const workRug = { x: -4.6, z: -0.6, radius: 3.7 }

const READING_SEATS: SeatSpec[] = spread([
  {
    name: "Reading Armchair",
    zone: "reading",
    characteristic: "By the bookshelf",
    furniture: "armchair",
    anchor: { x: -5.4, z: 2.4 },
    furnitureRotationY: Math.PI / 2,
    sitPoint: { x: -5.4, z: 2.4 },
    faceRotation: Math.PI / 2,
  },
  {
    name: "Quiet Corner",
    zone: "reading",
    characteristic: "Tucked beside the plants",
    furniture: "armchair",
    anchor: { x: -5.4, z: 4.1 },
    furnitureRotationY: Math.PI / 2,
    sitPoint: { x: -5.4, z: 4.1 },
    faceRotation: Math.PI / 2,
  },
])

const SEAT_ORDER: Record<StudySpaceKind, SeatSpec[]> = {
  focused: [...QUIET_DESKS, ...COLLAB_DESKS.slice(0, 2), ...MEETING_CHAIRS.slice(0, 2)],
  collaborative: [...COLLAB_DESKS, ...MEETING_CHAIRS.slice(0, 4)],
  lounge: [...LOUNGE_STOOLS, ...READING_SEATS, ...MEETING_CHAIRS.slice(0, 2)],
}

export const loungeTable = LOUNGE_TABLE

// Characters enter near the door on the left wall.
export const roomSpawnPoint = { x: -roomPlan.halfWidth + 2, z: roomPlan.halfDepth - 3 }

export function buildSeats(kind: StudySpaceKind, capacity: number): SeatDef[] {
  return SEAT_ORDER[kind].slice(0, capacity).map((spec, index) => ({
    ...spec,
    id: `${spec.furniture}-${index}`,
    zoneLabel: ZONE_LABELS[spec.zone],
  }))
}
