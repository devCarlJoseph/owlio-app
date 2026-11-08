import { describe, expect, it } from "vitest"
import { constrainWalker, layoutCity, nearestDoor, ROAD, streetAt } from "./city-layout"
import { sampleCreatedSpaces, sampleDiscoverySpaces, sampleJoinedSpaces } from "./study-spaces-records"

function sampleCity() {
  return layoutCity([
    { role: "owner", spaces: sampleCreatedSpaces },
    { role: "member", spaces: sampleJoinedSpaces },
    { role: "visitor", spaces: sampleDiscoverySpaces },
  ])
}

describe("study hall city layout", () => {
  it("places every space on its own lot in one mixed grid, keeping roles", () => {
    const city = sampleCity()
    const total = sampleCreatedSpaces.length + sampleJoinedSpaces.length + sampleDiscoverySpaces.length

    expect(city.lots).toHaveLength(total)
    expect(new Set(city.lots.map((lot) => `${lot.x},${lot.z}`)).size).toBe(total)
    expect(city.lots[0].role).toBe("owner")
    expect(city.lots.at(-1)?.role).toBe("visitor")
    for (const lot of city.lots) {
      expect(Math.abs(lot.x)).toBeLessThan(city.width / 2)
      expect(Math.abs(lot.z)).toBeLessThan(city.depth / 2)
    }
  })

  it("gives each room type its own building shape", () => {
    const city = sampleCity()
    const byKind = (kind: string) => city.lots.find((lot) => lot.space.kind === kind)!.building

    expect(byKind("focused").h).toBeGreaterThan(byKind("collaborative").h)
    expect(byKind("collaborative").w).toBeGreaterThan(byKind("lounge").w)
  })

  it("keeps a walker out of buildings and finds the nearby door", () => {
    const city = sampleCity()
    const lot = city.lots[0]

    const pushed = constrainWalker({ x: lot.building.x, z: lot.building.z }, city)
    const insideX = Math.abs(pushed.x - lot.building.x) < lot.building.w / 2
    const insideZ = Math.abs(pushed.z - lot.building.z) < lot.building.d / 2
    expect(insideX && insideZ).toBe(false)

    expect(nearestDoor(lot.door, city)?.space.id).toBe(lot.space.id)
    expect(nearestDoor({ x: city.width, z: city.depth }, city)).toBeNull()
    expect(streetAt(lot.z, city)).toBe(1)
    expect(streetAt(city.lots.at(-1)!.z, city)).toBe(city.lots.at(-1)!.street)
  })

  it("handles an empty city", () => {
    const city = layoutCity([{ role: "owner", spaces: [] }])
    expect(city.lots).toHaveLength(0)
    expect(city.width).toBeGreaterThan(0)
    expect(streetAt(-city.depth / 2 + 6, city)).toBe(1)
  })

  it("keeps the central plaza free of buildings and puts the fountain roundabout on its corner intersection", () => {
    const city = sampleCity()
    const { plaza, roundabout } = city

    for (const lot of city.lots) {
      const overlapsPlaza = Math.abs(lot.x - plaza.x) < plaza.w / 2 && Math.abs(lot.z - plaza.z) < plaza.d / 2
      expect(overlapsPlaza).toBe(false)
    }
    expect(Math.abs(plaza.x)).toBeLessThan(0.01)
    expect(city.roadsX.some((x) => Math.abs(x - roundabout.x) < 0.01)).toBe(true)
    expect(city.roadsZ.some((z) => Math.abs(z - roundabout.z) < 0.01)).toBe(true)
    expect(roundabout.x).toBeCloseTo(plaza.x + plaza.w / 2 + ROAD / 2)
    expect(roundabout.z).toBeCloseTo(plaza.z + plaza.d / 2 + ROAD / 2)

    const pushed = constrainWalker({ x: roundabout.x, z: roundabout.z }, city)
    expect(Math.hypot(pushed.x - roundabout.x, pushed.z - roundabout.z)).toBeGreaterThanOrEqual(roundabout.island)
  })

  it("grows the city with more rows when there are many spaces", () => {
    const many = Array.from({ length: 30 }, (_, index) => ({ ...sampleCreatedSpaces[0], id: `space-${index}` }))
    const city = layoutCity([{ role: "owner", spaces: many }])
    expect(city.lots).toHaveLength(30)
    expect(new Set(city.lots.map((lot) => `${lot.x},${lot.z}`)).size).toBe(30)
  })
})
