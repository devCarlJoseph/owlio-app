import type { StudySpaceKind } from "../study-spaces-records"

// Shared with space-room-scene.tsx and the dialog floor-plan previews.
export const roomPlan = { halfWidth: 7, halfDepth: 5 }

export type StudyZone = "quiet" | "collaborative" | "reading" | "lounge"

export type SeatFurniture = "desk" | "stool" | "armchair"

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
}

type SeatSpec = Omit<SeatDef, "id" | "zoneLabel">

const QUIET_DESKS: SeatSpec[] = [
  {
    name: "Window Seat 1",
    zone: "quiet",
    characteristic: "Natural light from the window",
    furniture: "desk",
    anchor: { x: -4.5, z: -3.5 },
    furnitureRotationY: 0,
    sitPoint: { x: -4.5, z: -2.76 },
    faceRotation: Math.PI,
  },
  {
    name: "Window Seat 2",
    zone: "quiet",
    characteristic: "Natural light from the window",
    furniture: "desk",
    anchor: { x: -1.5, z: -3.5 },
    furnitureRotationY: 0,
    sitPoint: { x: -1.5, z: -2.76 },
    faceRotation: Math.PI,
  },
  {
    name: "Focus Desk 3",
    zone: "quiet",
    characteristic: "Facing the board",
    furniture: "desk",
    anchor: { x: 1.5, z: -3.5 },
    furnitureRotationY: 0,
    sitPoint: { x: 1.5, z: -2.76 },
    faceRotation: Math.PI,
  },
  {
    name: "Focus Desk 4",
    zone: "quiet",
    characteristic: "Facing the board",
    furniture: "desk",
    anchor: { x: 4.5, z: -3.5 },
    furnitureRotationY: 0,
    sitPoint: { x: 4.5, z: -2.76 },
    faceRotation: Math.PI,
  },
]

const COLLAB_DESKS: SeatSpec[] = [
  {
    name: "Shared Table A",
    zone: "collaborative",
    characteristic: "Face-to-face partner desk",
    furniture: "desk",
    anchor: { x: -3.4, z: -1.5 },
    furnitureRotationY: 0,
    sitPoint: { x: -3.4, z: -0.78 },
    faceRotation: Math.PI,
  },
  {
    name: "Shared Table B",
    zone: "collaborative",
    characteristic: "Face-to-face partner desk",
    furniture: "desk",
    anchor: { x: -3.4, z: 0.7 },
    furnitureRotationY: Math.PI,
    sitPoint: { x: -3.4, z: -0.02 },
    faceRotation: 0,
  },
  {
    name: "Shared Table C",
    zone: "collaborative",
    characteristic: "Face-to-face partner desk",
    furniture: "desk",
    anchor: { x: 0.6, z: -1.5 },
    furnitureRotationY: 0,
    sitPoint: { x: 0.6, z: -0.78 },
    faceRotation: Math.PI,
  },
  {
    name: "Shared Table D",
    zone: "collaborative",
    characteristic: "Face-to-face partner desk",
    furniture: "desk",
    anchor: { x: 0.6, z: 0.7 },
    furnitureRotationY: Math.PI,
    sitPoint: { x: 0.6, z: -0.02 },
    faceRotation: 0,
  },
]

const LOUNGE_TABLE = { x: 4.6, z: 3.0 }

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

const READING_SEATS: SeatSpec[] = [
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
]

const SEAT_ORDER: Record<StudySpaceKind, SeatSpec[]> = {
  focused: [...QUIET_DESKS, ...COLLAB_DESKS.slice(0, 2), ...LOUNGE_STOOLS.slice(0, 2)],
  collaborative: [...COLLAB_DESKS, ...QUIET_DESKS.slice(0, 2), ...LOUNGE_STOOLS.slice(0, 2)],
  lounge: [...LOUNGE_STOOLS, ...READING_SEATS, ...QUIET_DESKS.slice(0, 2)],
}

export const loungeTable = LOUNGE_TABLE

// Characters enter near the door on the left wall.
export const roomSpawnPoint = { x: -5.4, z: 3.4 }

export function buildSeats(kind: StudySpaceKind, capacity: number): SeatDef[] {
  return SEAT_ORDER[kind].slice(0, capacity).map((spec, index) => ({
    ...spec,
    id: `${spec.furniture}-${index}`,
    zoneLabel: ZONE_LABELS[spec.zone],
  }))
}
