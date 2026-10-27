import { describe, expect, it } from "vitest"
import { constrainWalker, layoutCity, nearestDoor, streetAt } from "./city-layout"
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
    expect(streetAt(0, city)).toBe(1)
  })
})
