import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudySpaceDetailView } from "./study-space-detail-view"
import { studySpaceCharacterStoragePrefix } from "../study-spaces-records"
import type { SpaceRoomSceneProps } from "./space-room-scene"

vi.mock("./space-room-scene", () => ({
  SpaceRoomScene: (props: SpaceRoomSceneProps) => (
    <div data-testid="room-scene">
      {props.showNameTag ? <span data-testid="name-tag">{props.character.name}</span> : null}
      {props.bubbleText ? <span data-testid="chat-bubble">{props.bubbleText}</span> : null}
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

    // sample-space-physics is collaborative: first seat is "Shared Table A".
    await user.click(screen.getByRole("button", { name: "Shared Table A" }))

    const seatDialog = screen.getByRole("dialog", { name: "Seat: Shared Table A" })
    expect(seatDialog.textContent).toContain("Available")
    expect(seatDialog.textContent).toContain("Collaborative tables")

    await user.click(screen.getByRole("button", { name: "Sit here" }))

    expect(screen.getByText(/Seated at Shared Table A/)).toBeTruthy()
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
})
