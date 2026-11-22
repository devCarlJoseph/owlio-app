import { ROAD, type CityLayout } from "./city-layout"

export type Axis = "ns" | "ew"
export type Signal = "green" | "yellow" | "red"

export type Intersection = { id: string; x: number; z: number; group: 0 | 1 }

export type StopEvent = { s: number; intersection: Intersection; axis: Axis }

export type TrafficPath = {
  points: { x: number; z: number }[]
  headings: number[]
  lengths: number[]
  total: number
  stops: StopEvent[]
}

export const LANE_OFFSET = 0.95
const SAMPLE_STEP = 0.25
const TURN_RADIUS = 1.4
// Cars stop before the crosswalk that sits just outside each intersection.
const STOP_BACKOFF = 3.1

// Signal cycle in seconds: north-south green, yellow, all red, east-west green, yellow, all red.
const GREEN = 9
const YELLOW = 2
const ALL_RED = 1
export const SIGNAL_CYCLE = (GREEN + YELLOW + ALL_RED) * 2

export function signalFor(axis: Axis, time: number, group: 0 | 1): Signal {
  const t = (((time + group * (SIGNAL_CYCLE / 2)) % SIGNAL_CYCLE) + SIGNAL_CYCLE) % SIGNAL_CYCLE
  const half = GREEN + YELLOW + ALL_RED
  const local = axis === "ns" ? t : (t + half) % SIGNAL_CYCLE
  if (local < GREEN) return "green"
  if (local < GREEN + YELLOW) return "yellow"
  return "red"
}

// Signalized intersections: every crossing except the roundabout and the four outer corners.
export function signalizedIntersections(layout: CityLayout): Intersection[] {
  const result: Intersection[] = []
  layout.roadsX.forEach((x, i) =>
    layout.roadsZ.forEach((z, j) => {
      const corner = (i === 0 || i === layout.roadsX.length - 1) && (j === 0 || j === layout.roadsZ.length - 1)
      const roundabout = Math.abs(x - layout.roundabout.x) < 0.01 && Math.abs(z - layout.roundabout.z) < 0.01
      if (!corner && !roundabout) result.push({ id: `${i}-${j}`, x, z, group: ((i + j) % 2) as 0 | 1 })
    })
  )
  return result
}

type Pt = { x: number; z: number }

function rightOf(dx: number, dz: number) {
  return { x: -dz, z: dx }
}

// Builds the lane polyline for a loop around a rectangle of road centerlines,
// with rounded corners and a counter-clockwise detour round the roundabout island.
export function buildLoop(layout: CityLayout, corners: Pt[], intersections: Intersection[]): TrafficPath {
  const ring = layout.roundabout
  const ringLane = ring.island + (ring.ring - ring.island) / 2
  const raw: Pt[] = []

  const edges = corners.map((from, index) => ({ from, to: corners[(index + 1) % corners.length] }))
  // Lane-offset corner points: the intersection of consecutive offset edges.
  const laneCorners = corners.map((corner, index) => {
    const before = edges[(index - 1 + edges.length) % edges.length]
    const after = edges[index]
    const d1 = normalize(before.to.x - before.from.x, before.to.z - before.from.z)
    const d2 = normalize(after.to.x - after.from.x, after.to.z - after.from.z)
    const r1 = rightOf(d1.x, d1.z)
    const r2 = rightOf(d2.x, d2.z)
    return { x: corner.x + (r1.x + r2.x) * LANE_OFFSET, z: corner.z + (r1.z + r2.z) * LANE_OFFSET, d1, d2 }
  })

  laneCorners.forEach((corner, index) => {
    const next = laneCorners[(index + 1) % laneCorners.length]
    const d = corner.d2
    // Rounded corner arc.
    const start = { x: corner.x - corner.d1.x * TURN_RADIUS, z: corner.z - corner.d1.z * TURN_RADIUS }
    const end = { x: corner.x + d.x * TURN_RADIUS, z: corner.z + d.z * TURN_RADIUS }
    for (let t = 0; t <= 1; t += 0.125) {
      const a = { x: start.x + (corner.x - start.x) * t, z: start.z + (corner.z - start.z) * t }
      const b = { x: corner.x + (end.x - corner.x) * t, z: corner.z + (end.z - corner.z) * t }
      raw.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t })
    }

    // Straight run to the next corner, detouring round the roundabout if it lies on this edge.
    const from = end
    const to = { x: next.x - d.x * TURN_RADIUS, z: next.z - d.z * TURN_RADIUS }
    const length = Math.hypot(to.x - from.x, to.z - from.z)
    const center = { x: ring.x, z: ring.z }
    const along = (center.x - from.x) * d.x + (center.z - from.z) * d.z
    const across = Math.abs((center.x - from.x) * -d.z + (center.z - from.z) * d.x)
    const throughRing = along > 0 && along < length && across < LANE_OFFSET + 0.2

    if (!throughRing) {
      raw.push(from)
      return
    }
    const half = Math.sqrt(Math.max(ringLane * ringLane - LANE_OFFSET * LANE_OFFSET, 0.01))
    const entry = { x: from.x + d.x * (along - half), z: from.z + d.z * (along - half) }
    const exit = { x: from.x + d.x * (along + half), z: from.z + d.z * (along + half) }
    raw.push(from, entry)
    let a0 = Math.atan2(entry.z - center.z, entry.x - center.x)
    const a1 = Math.atan2(exit.z - center.z, exit.x - center.x)
    // Counter-clockwise on the map means decreasing angle in x/z.
    while (a0 < a1) a0 += Math.PI * 2
    const steps = 18
    for (let step = 1; step < steps; step += 1) {
      const angle = a0 + ((a1 - a0) * step) / steps
      raw.push({ x: center.x + Math.cos(angle) * ringLane, z: center.z + Math.sin(angle) * ringLane })
    }
    raw.push(exit)
  })

  return samplePath(raw, intersections)
}

function normalize(x: number, z: number) {
  const length = Math.hypot(x, z) || 1
  return { x: x / length, z: z / length }
}

function samplePath(input: Pt[], intersections: Intersection[]): TrafficPath {
  const raw = input.filter((point, index) => {
    const next = input[(index + 1) % input.length]
    return Math.hypot(next.x - point.x, next.z - point.z) > 1e-4
  })
  const points: Pt[] = []
  for (let index = 0; index < raw.length; index += 1) {
    const a = raw[index]
    const b = raw[(index + 1) % raw.length]
    const length = Math.hypot(b.x - a.x, b.z - a.z)
    const steps = Math.max(1, Math.ceil(length / SAMPLE_STEP))
    for (let step = 0; step < steps; step += 1) {
      points.push({ x: a.x + ((b.x - a.x) * step) / steps, z: a.z + ((b.z - a.z) * step) / steps })
    }
  }

  const lengths: number[] = [0]
  const headings: number[] = []
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % points.length]
    headings.push(Math.atan2(b.x - a.x, b.z - a.z))
    if (index > 0) lengths.push(lengths[index - 1] + Math.hypot(a.x - points[index - 1].x, a.z - points[index - 1].z))
  }
  const last = points[points.length - 1]
  const total = lengths[lengths.length - 1] + Math.hypot(points[0].x - last.x, points[0].z - last.z)

  const stops: StopEvent[] = []
  const box = ROAD / 2
  for (const intersection of intersections) {
    for (let index = 0; index < points.length; index += 1) {
      const p = points[index]
      const previous = points[(index - 1 + points.length) % points.length]
      const inside = Math.abs(p.x - intersection.x) < box && Math.abs(p.z - intersection.z) < box
      const wasInside = Math.abs(previous.x - intersection.x) < box && Math.abs(previous.z - intersection.z) < box
      if (inside && !wasInside) {
        const dx = p.x - previous.x
        const dz = p.z - previous.z
        stops.push({
          s: (lengths[index] - STOP_BACKOFF + total) % total,
          intersection,
          axis: Math.abs(dx) > Math.abs(dz) ? "ew" : "ns",
        })
      }
    }
  }

  return { points, headings, lengths, total, stops }
}

export function pointAt(path: TrafficPath, s: number) {
  const wrapped = ((s % path.total) + path.total) % path.total
  let low = 0
  let high = path.lengths.length - 1
  while (low < high) {
    const mid = (low + high + 1) >> 1
    if (path.lengths[mid] <= wrapped) low = mid
    else high = mid - 1
  }
  const a = path.points[low]
  const b = path.points[(low + 1) % path.points.length]
  const next = low + 1 < path.lengths.length ? path.lengths[low + 1] : path.total
  const t = next > path.lengths[low] ? (wrapped - path.lengths[low]) / (next - path.lengths[low]) : 0
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, heading: path.headings[low] }
}

// A handful of loops: the outer ring road both ways and loops through the roundabout street.
export function cityLoops(layout: CityLayout): Pt[][] {
  const { roadsX, roadsZ, roundabout } = layout
  const xi = roadsX.findIndex((x) => Math.abs(x - roundabout.x) < 0.01)
  const zi = roadsZ.findIndex((z) => Math.abs(z - roundabout.z) < 0.01)
  const lastX = roadsX.length - 1
  const lastZ = roadsZ.length - 1
  const rect = (x0: number, x1: number, z0: number, z1: number, clockwise: boolean): Pt[] => {
    const loop = [
      { x: roadsX[x0], z: roadsZ[z0] },
      { x: roadsX[x1], z: roadsZ[z0] },
      { x: roadsX[x1], z: roadsZ[z1] },
      { x: roadsX[x0], z: roadsZ[z1] },
    ]
    return clockwise ? loop : loop.reverse()
  }
  // Loop corners never sit on the roundabout; loops cross it straight through instead.
  return [
    rect(0, lastX, 0, lastZ, true),
    rect(0, lastX, 0, lastZ, false),
    rect(0, lastX, 0, zi, true),
    rect(0, lastX, zi, lastZ, false),
    rect(0, xi, 0, lastZ, true),
    rect(xi, lastX, 0, lastZ, false),
  ]
}
