import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudySpaceDetailView } from "./study-space-detail-view"
import { getSampleRoster } from "../space-roster"
import {
  sampleCreatedSpaces,
  studyHallCharacterStorageKey,
  studySpaceCharacterStoragePrefix,
} from "../study-spaces-records"
import { buildSeats } from "./study-space-seats"
import { getSampleLockers } from "./room-lockers"
import type { SpaceRoomSceneProps } from "./space-room-scene"

vi.mock("./space-room-scene", () => ({
  SpaceRoomScene: (props: SpaceRoomSceneProps) => (
    <div data-testid="room-scene">
      {props.showNameTag ? <span data-testid="name-tag">{props.character.name}</span> : null}
      {props.bubbleText ? <span data-testid="chat-bubble">{props.bubbleText}</span> : null}
      <button type="button" onClick={() => props.onFloorPoint({ x: 0, z: 0 })}>
        Room floor
      </button>
      {props.seats.map((seat) => (
        <button key={seat.id} type="button" onClick={() => props.onSeatSelect(seat.id)}>
          {seat.name}
        </button>
      ))}
    </div>
  ),
}))

afterEach(cleanup)

beforeEach(() => {
  window.localStorage.clear()
})

function renderAt(spaceId: string) {
  return render(
    <MemoryRouter initialEntries={[`/students/study-spaces/${spaceId}`]}>
      <Routes>
        <Route path="/students/study-spaces/:spaceId" element={<StudySpaceDetailView />} />
      </Routes>
    </MemoryRouter>
  )
}

const sampleSpaceId = "sample-space-physics"

function freeAndTakenSeats() {
  const space = sampleCreatedSpaces.find((record) => record.id === sampleSpaceId)!
  const seats = buildSeats(space.kind, space.capacity)
  const roster = getSampleRoster(space, seats.length)
  const taken = roster.map((person) => ({ person, seat: seats[person.seatIndex] }))
  const free = seats.find((_, index) => !roster.some((person) => person.seatIndex === index))!
  return { free, taken: taken[0] }
}

function seedCharacter(name = "Sam") {
  window.localStorage.setItem(
    `${studySpaceCharacterStoragePrefix}${sampleSpaceId}`,
    JSON.stringify({ name, bodyColor: "#2563eb", accentColor: "#f59e0b", createdAt: "2026-10-01T00:00:00.000Z" })
  )
}

describe("study space detail room", () => {
  it("shows a not-found state for an unknown space id", () => {
    renderAt("missing-space-id")

    expect(screen.getByRole("heading", { name: "Study space not found" })).toBeTruthy()
    const backLink = screen.getByRole("button", { name: "Back to study spaces" })
    expect(backLink.tagName).toBe("A")
  })

  it("asks for a character before entering the room", async () => {
    const user = userEvent.setup()
    renderAt(sampleSpaceId)

    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(screen.getByText("Create your character")).toBeTruthy()
    expect(screen.queryByTestId("room-scene")).toBeNull()

    await user.type(screen.getByLabelText("Display name"), "Alex")
    await user.click(screen.getByRole("button", { name: /Enter room/ }))

    expect(screen.getByTestId("room-scene")).toBeTruthy()
    expect(screen.getByTestId("name-tag").textContent).toBe("Alex")
  })

  it("remembers a saved character and skips the dialog", () => {
    seedCharacter()

    renderAt(sampleSpaceId)

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByTestId("name-tag").textContent).toBe("Sam")
    expect(screen.getByRole("button", { name: "Edit character" })).toBeTruthy()
  })

  it("uses the study hall character by default when the room has none", () => {
    window.localStorage.setItem(
      studyHallCharacterStorageKey,
      JSON.stringify({ name: "Hall Walker", bodyColor: "#16a34a", accentColor: "#f59e0b", createdAt: "2026-10-01T00:00:00.000Z" })
    )
    renderAt(sampleSpaceId)

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByTestId("name-tag").textContent).toBe("Hall Walker")
  })

  it("prefers a room-specific character over the hall character", () => {
    window.localStorage.setItem(
      studyHallCharacterStorageKey,
      JSON.stringify({ name: "Hall Walker", bodyColor: "#16a34a", accentColor: "#f59e0b", createdAt: "2026-10-01T00:00:00.000Z" })
    )
    seedCharacter("Room Sam")
    renderAt(sampleSpaceId)

    expect(screen.getByTestId("name-tag").textContent).toBe("Room Sam")
  })

  it("shows sent messages in the chat panel and as a bubble", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Toggle chat" }))
    await user.type(screen.getByLabelText(/Message in/), "Anyone up for calculus review?")
    await user.click(screen.getByRole("button", { name: /Send/ }))

    expect(screen.getByTestId("chat-bubble").textContent).toBe("Anyone up for calculus review?")
    expect(screen.getByRole("complementary", { name: "Space chat" }).textContent).toContain(
      "Anyone up for calculus review?"
    )
  })

  it("lets the user choose a seat, sit down, and stand up", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const { free } = freeAndTakenSeats()
    await user.click(screen.getByRole("button", { name: free.name }))

    const seatDialog = screen.getByRole("dialog", { name: `Seat: ${free.name}` })
    expect(seatDialog.textContent).toContain("Available")
    expect(seatDialog.textContent).toContain(free.zoneLabel)

    await user.click(screen.getByRole("button", { name: "Sit here" }))

    expect(screen.getByText(`Seated at ${free.name}`)).toBeTruthy()
    expect(screen.queryByRole("dialog", { name: /Seat:/ })).toBeNull()

    await user.click(screen.getByRole("button", { name: "Stand up" }))
    expect(screen.queryByText(/Seated at/)).toBeNull()
    expect(screen.getByText("Choose a seat in the room")).toBeTruthy()
  })

  it("toggles name tags and labels the room as a local preview", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    expect(screen.getByText(/only you are in this room/)).toBeTruthy()
    expect(screen.getByTestId("name-tag")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Toggle name tags" }))
    expect(screen.queryByTestId("name-tag")).toBeNull()
  })

  it("opens the focus timer and starts a focus session", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: /Open focus timer/ }))
    const panel = screen.getByRole("dialog", { name: "Focus timer" })
    expect(panel.textContent).toContain("25:00")

    await user.click(screen.getByRole("button", { name: /^Start$/ }))
    expect(screen.getByText("Focusing…")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy()
  })

  it("lists focus-music categories and marks file tracks as needing audio", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Focus music" }))
    const panel = screen.getByRole("dialog", { name: "Focus music" })

    expect(panel.textContent).toContain("Gentle Rain")
    expect(panel.textContent).toContain("Deep Focus Pad")
    expect(panel.textContent).toContain("needs an audio file")
  })

  it("keeps the character seated when the room floor is clicked", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const { free } = freeAndTakenSeats()
    await user.click(screen.getByRole("button", { name: free.name }))
    await user.click(screen.getByRole("button", { name: "Sit here" }))

    await user.click(screen.getByRole("button", { name: "Room floor" }))
    expect(screen.getByText(`Seated at ${free.name}`)).toBeTruthy()
    expect(screen.getByText("Stand up to walk around.")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Stand up" }))
    expect(screen.queryByText(/Seated at/)).toBeNull()
  })

  it("shows seats held by sample people as taken and does not offer to sit", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const { taken } = freeAndTakenSeats()
    await user.click(screen.getByRole("button", { name: taken.seat.name }))

    const seatDialog = screen.getByRole("dialog", { name: `Seat: ${taken.seat.name}` })
    expect(seatDialog.textContent).toContain(`${taken.person.name} (sample) sits here`)
    expect(screen.queryByRole("button", { name: "Sit here" })).toBeNull()
    expect(screen.getByText(/Sample study-mates are illustrations only/)).toBeTruthy()
  })

  it("lets the leader of a created space add a group task", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Group tasks" }))
    const board = screen.getByRole("dialog", { name: "Group task board" })
    expect(board.textContent).toContain("You are the leader")
    expect(board.textContent).toContain("not sent to other students")

    await user.type(within(board).getByLabelText("Task title"), "Finish problem set 4")
    await user.click(within(board).getByRole("button", { name: "Add task" }))

    expect(within(board).getByRole("checkbox", { name: /Finish problem set 4/ })).toBeTruthy()
    const stored = window.localStorage.getItem(`owlio.study-space-tasks.v1.${sampleSpaceId}`)
    expect(stored).toContain("Finish problem set 4")
  })

  it("lets a group mate tick their own task but not add tasks", async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(
      `${studySpaceCharacterStoragePrefix}sample-space-history`,
      JSON.stringify({ name: "Sam", bodyColor: "#2563eb", accentColor: "#f59e0b", createdAt: "2026-10-01T00:00:00.000Z" })
    )
    renderAt("sample-space-history")

    await user.click(screen.getByRole("button", { name: "Group tasks" }))
    const board = screen.getByRole("dialog", { name: "Group task board" })
    expect(board.textContent).toContain("Group mate")
    expect(within(board).queryByRole("button", { name: "Add task" })).toBeNull()

    const box = within(board).getByRole('checkbox', { name: /Bring one question to the group/ }) as HTMLInputElement
    await user.click(box)
    expect(box.checked).toBe(true)
  })

  it("opens the drawer and the TV, and rejects a non-YouTube link", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "My drawer" }))
    expect(screen.getByRole("dialog", { name: "My drawer" }).textContent).toContain("stay on this device")

    await user.click(screen.getByRole("button", { name: "Room TV" }))
    const tv = screen.getByRole("dialog", { name: "Room TV" })
    await user.type(within(tv).getByLabelText(/Video for the group/), "https://example.com/video")
    await user.click(within(tv).getByRole("button", { name: "Play" }))
    expect(within(tv).getByRole("alert").textContent).toContain("YouTube")

    await user.clear(within(tv).getByLabelText(/Video for the group/))
    await user.type(within(tv).getByLabelText(/Video for the group/), "https://youtu.be/dQw4w9WgXcQ")
    await user.click(within(tv).getByRole("button", { name: "Play" }))
    expect(within(tv).getByTitle("Room TV video").getAttribute("src")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
  })

  it("keeps sample study-mate lockers locked until their code is entered", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const space = sampleCreatedSpaces.find((record) => record.id === sampleSpaceId)!
    const roster = getSampleRoster(space, buildSeats(space.kind, space.capacity).length)
    const [locker] = getSampleLockers(sampleSpaceId, roster)
    const name = locker.owner.name

    await user.click(screen.getByRole("button", { name: "Lockers" }))
    const panel = screen.getByRole("dialog", { name: "Study room lockers" })
    expect(panel.textContent).toContain("Preview lockers")

    await user.click(within(panel).getByRole("button", { name: `Enter code for ${name}'s locker` }))
    const input = within(panel).getByLabelText("Locker code")
    await user.type(input, locker.code === "0000" ? "1111" : "0000")
    await user.click(within(panel).getByRole("button", { name: "Unlock locker" }))
    expect(within(panel).getByText(`That code does not open ${name}'s locker.`)).toBeTruthy()
    expect(within(panel).queryByRole("list", { name: `${name}'s files` })).toBeNull()

    await user.clear(input)
    await user.type(input, locker.code)
    await user.click(within(panel).getByRole("button", { name: "Unlock locker" }))
    const files = within(panel).getByRole("list", { name: `${name}'s files` })
    expect(files.textContent).toContain(locker.files[0].name)
    expect(files.textContent).toContain("sample")
  })

  it("saves the user's own locker code in this browser", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Lockers" }))
    const panel = screen.getByRole("dialog", { name: "Study room lockers" })
    await user.click(within(panel).getByRole("button", { name: "Set a code" }))
    await user.type(within(panel).getByLabelText("New locker code"), "12")
    await user.click(within(panel).getByRole("button", { name: "Save code" }))
    expect(within(panel).getByText("Use 4 to 6 digits.")).toBeTruthy()

    await user.type(within(panel).getByLabelText("New locker code"), "34")
    await user.click(within(panel).getByRole("button", { name: "Save code" }))
    expect(within(panel).getByText("Code set")).toBeTruthy()
    expect(window.localStorage.getItem(`owlio.study-space-locker-code.${sampleSpaceId}`)).toBe("1234")
  })

  it("expands the room to full screen and cycles room lighting", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Expand room to full screen" }))
    expect(screen.getByRole("button", { name: "Exit full screen" }).getAttribute("aria-pressed")).toBe("true")

    await user.click(screen.getByRole("button", { name: "Room lighting: Auto light" }))
    expect(screen.getByRole("button", { name: "Room lighting: Morning light" })).toBeTruthy()
  })

  it("offers generated lo-fi and piano tracks that need no audio file", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Focus music" }))
    const panel = screen.getByRole("dialog", { name: "Focus music" })
    expect(panel.textContent).toContain("Lo-fi Study Loop")
    expect(panel.textContent).toContain("Quiet Piano Arpeggio")
  })
})
