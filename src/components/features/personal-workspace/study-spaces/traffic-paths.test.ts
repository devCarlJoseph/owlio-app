import { describe, expect, it } from "vitest"
import { layoutCity } from "./city-layout"
import { sampleCreatedSpaces, sampleDiscoverySpaces, sampleJoinedSpaces } from "./study-spaces-records"
import {
  buildLoop,
  cityLoops,
  pointAt,
  SIGNAL_CYCLE,
  signalFor,
  signalizedIntersections,
} from "./traffic-paths"

const city = layoutCity([
  { role: "owner", spaces: sampleCreatedSpaces },
  { role: "member", spaces: sampleJoinedSpaces },
  { role: "visitor", spaces: sampleDiscoverySpaces },
])

describe("traffic signals", () => {
  it("never shows green to both roads at once and gives each road a green phase", () => {
    let nsGreen = false
    let ewGreen = false
    for (let time = 0; time < SIGNAL_CYCLE; time += 0.25) {
      for (const group of [0, 1] as const) {
        const ns = signalFor("ns", time, group)
        const ew = signalFor("ew", time, group)
        expect(ns !== "red" && ew !== "red").toBe(false)
        nsGreen ||= ns === "green"
        ewGreen ||= ew === "green"
      }
    }
    expect(nsGreen && ewGreen).toBe(true)
  })

  it("puts no signal on the roundabout or the outer corners", () => {
    const intersections = signalizedIntersections(city)
    expect(intersections.length).toBeGreaterThan(0)
    expect(intersections.some((item) => item.x === city.roundabout.x && item.z === city.roundabout.z)).toBe(false)
    const corner = { x: city.roadsX[0], z: city.roadsZ[0] }
    expect(intersections.some((item) => item.x === corner.x && item.z === corner.z)).toBe(false)
  })
})

describe("traffic loops", () => {
  const intersections = signalizedIntersections(city)
  const paths = cityLoops(city).map((corners) => buildLoop(city, corners, intersections))

  it("keeps every car path out of the fountain island and inside the city", () => {
    for (const path of paths) {
      expect(path.total).toBeGreaterThan(0)
      for (const point of path.points) {
        expect(Math.hypot(point.x - city.roundabout.x, point.z - city.roundabout.z)).toBeGreaterThan(city.roundabout.island)
        expect(Math.abs(point.x)).toBeLessThan(city.width / 2)
        expect(Math.abs(point.z)).toBeLessThan(city.depth / 2)
      }
    }
  })

  it("routes at least one loop round the roundabout and adds stop points at signals", () => {
    const circles = paths.some((path) =>
      path.points.some((point) => Math.hypot(point.x - city.roundabout.x, point.z - city.roundabout.z) < city.roundabout.ring)
    )
    expect(circles).toBe(true)
    expect(paths.every((path) => path.stops.length > 0)).toBe(true)
  })

  it("samples positions continuously along a loop", () => {
    const path = paths[0]
    const a = pointAt(path, 1)
    const b = pointAt(path, 1.2)
    expect(Math.hypot(b.x - a.x, b.z - a.z)).toBeLessThan(0.5)
    const wrapped = pointAt(path, path.total + 1)
    expect(wrapped.x).toBeCloseTo(a.x)
    expect(wrapped.z).toBeCloseTo(a.z)
  })
})
