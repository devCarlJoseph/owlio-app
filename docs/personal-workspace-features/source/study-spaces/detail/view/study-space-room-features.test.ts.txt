import { describe, expect, it } from "vitest"
import { getSampleNappers, getSampleRoster, SAMPLE_NAMES } from "./space-roster"
import { buildRoomSpots, buildSeats, discussionTable, napArea, roomPlan, watchRoom } from "./detail/study-space-seats"
import { sampleCreatedSpaces, sampleJoinedSpaces, type StudySpaceRecord } from "./study-spaces-records"
import { canManageTasks, canTickTask, createRoomTask, moveRoomTask, toggleRoomTask } from "./detail/room-tasks"
import { parseYouTubeId, youTubeEmbedUrl } from "./detail/room-tv"
import { drawerMaxFileBytes, drawerMaxFiles, validateDrawerFile } from "./detail/drawer-storage"

const essayWriters = sampleCreatedSpaces.find((space) => space.id === "sample-space-essay") as StudySpaceRecord

describe("sample roster", () => {
  it("is deterministic, leaves one seat free, and never seats two people together", () => {
    for (const space of [...sampleCreatedSpaces, ...sampleJoinedSpaces]) {
      const seats = buildSeats(space.kind, space.capacity)
      const roster = getSampleRoster(space, seats.length)

      expect(roster).toEqual(getSampleRoster(space, seats.length))
      expect(roster.length).toBeGreaterThan(0)
      expect(roster.length).toBeLessThan(seats.length)
      expect(new Set(roster.map((person) => person.seatIndex)).size).toBe(roster.length)
      expect(new Set(roster.map((person) => person.name)).size).toBe(roster.length)
      roster.forEach((person) => expect(SAMPLE_NAMES).toContain(person.name))
    }
  })

  it("seats at most three people in a four-seat space", () => {
    expect(essayWriters.capacity).toBe(4)
    expect(getSampleRoster(essayWriters, 4).length).toBeLessThanOrEqual(3)
  })
})

describe("discussion table, nap area and watch room", () => {
  const inside = (point: { x: number; z: number }, area: { minX: number; maxX: number; minZ: number; maxZ: number }) =>
    point.x > area.minX && point.x < area.maxX && point.z > area.minZ && point.z < area.maxZ

  it("seats everyone at one table that matches the capacity, facing the table", () => {
    for (const kind of ["focused", "collaborative", "lounge"] as const) {
      for (const capacity of [2, 4, 8]) {
        const seats = buildSeats(kind, capacity)
        expect(seats).toHaveLength(capacity)
        for (const seat of seats) {
          expect(seat.zone).toBe("discussion")
          expect(Math.abs(seat.sitPoint.x)).toBeLessThan(roomPlan.halfWidth)
          expect(Math.abs(seat.sitPoint.z)).toBeLessThan(roomPlan.halfDepth)
          expect(inside(seat.sitPoint, napArea) || inside(seat.sitPoint, watchRoom)).toBe(false)
          const toTable = Math.atan2(discussionTable.x - seat.sitPoint.x, discussionTable.z - seat.sitPoint.z)
          expect(seat.faceRotation).toBeCloseTo(toTable)
        }
      }
    }
    expect(buildSeats("lounge", 4).every((seat) => seat.furniture === "armchair")).toBe(true)
    expect(buildSeats("focused", 4).every((seat) => seat.furniture === "chair")).toBe(true)
  })

  it("puts nap mats in the nap area and sofa seats facing the watch-room screen", () => {
    const spots = buildRoomSpots()
    const mats = spots.filter((spot) => spot.furniture === "mat")
    const sofas = spots.filter((spot) => spot.furniture === "sofa")

    expect(mats.length).toBeGreaterThanOrEqual(2)
    mats.forEach((mat) => expect(inside(mat.anchor, napArea)).toBe(true))
    expect(sofas.length).toBeGreaterThanOrEqual(2)
    sofas.forEach((sofa) => {
      expect(inside(sofa.sitPoint, watchRoom)).toBe(true)
      expect(sofa.faceRotation).toBeCloseTo(Math.PI / 2)
    })
    expect(new Set(spots.map((spot) => spot.id)).size).toBe(spots.length)
  })

  it("adds at most one sample napper on a free mat with a name not already in the room", () => {
    for (const space of [...sampleCreatedSpaces, ...sampleJoinedSpaces]) {
      const seats = buildSeats(space.kind, space.capacity)
      const roster = getSampleRoster(space, seats.length)
      const nappers = getSampleNappers(space, roster, seats.length, 3)
      expect(nappers.length).toBeLessThanOrEqual(1)
      nappers.forEach((napper) => {
        expect(roster.map((person) => person.name)).not.toContain(napper.name)
        expect(napper.seatIndex).toBeGreaterThanOrEqual(seats.length)
        expect(napper.seatIndex).toBeLessThan(seats.length + 3)
      })
    }
  })
})

describe("group tasks", () => {
  const leader = { ...essayWriters, role: "owner" as const }
  const mate = { ...essayWriters, role: "member" as const }

  it("lets only the owner manage tasks", () => {
    expect(canManageTasks(leader)).toBe(true)
    expect(canManageTasks(mate)).toBe(false)
  })

  it("lets a group mate tick only the tasks that are theirs", () => {
    const own = createRoomTask({ title: "Read chapter", notes: "", due: "", assignee: "me" })
    const everyone = createRoomTask({ title: "Bring notes", notes: "", due: "", assignee: "everyone" })
    const theirs = createRoomTask({ title: "Slides", notes: "", due: "", assignee: "sample-1" })
    const tasks = [own, everyone, theirs]

    expect(canTickTask(theirs)).toBe(false)
    const toggled = toggleRoomTask(toggleRoomTask(toggleRoomTask(tasks, own.id), everyone.id), theirs.id)
    expect(toggled.map((task) => task.done)).toEqual([true, true, false])
  })

  it("reorders tasks and ignores moves past the ends", () => {
    const a = createRoomTask({ title: "A task", notes: "", due: "", assignee: "everyone" })
    const b = createRoomTask({ title: "B task", notes: "", due: "", assignee: "everyone" })

    expect(moveRoomTask([a, b], b.id, -1).map((task) => task.title)).toEqual(["B task", "A task"])
    expect(moveRoomTask([a, b], a.id, -1)).toEqual([a, b])
  })
})

describe("room TV links", () => {
  it("accepts https YouTube links in common shapes", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=4")).toBe("dQw4w9WgXcQ")
    expect(parseYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(parseYouTubeId("https://m.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
  })

  it("rejects non-https, other hosts, and malformed ids", () => {
    expect(parseYouTubeId("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull()
    expect(parseYouTubeId("https://evil.example/watch?v=dQw4w9WgXcQ")).toBeNull()
    expect(parseYouTubeId("https://www.youtube.com/watch?v=short")).toBeNull()
    expect(parseYouTubeId("javascript:alert(1)")).toBeNull()
    expect(parseYouTubeId("not a url")).toBeNull()
  })

  it("embeds through the privacy-enhanced domain", () => {
    expect(youTubeEmbedUrl("dQw4w9WgXcQ")).toContain("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")
  })
})

describe("drawer file rules", () => {
  it("accepts supported types within the limits", () => {
    expect(validateDrawerFile({ name: "notes.PDF", size: 1000 }, 0)).toBeNull()
    expect(validateDrawerFile({ name: "essay.docx", size: drawerMaxFileBytes }, 3)).toBeNull()
  })

  it("rejects unsupported, oversized, and overflow files", () => {
    expect(validateDrawerFile({ name: "run.exe", size: 10 }, 0)).toContain("not supported")
    expect(validateDrawerFile({ name: "big.pdf", size: drawerMaxFileBytes + 1 }, 0)).toContain("10 MB")
    expect(validateDrawerFile({ name: "one-more.txt", size: 10 }, drawerMaxFiles)).toContain("full")
  })
})
