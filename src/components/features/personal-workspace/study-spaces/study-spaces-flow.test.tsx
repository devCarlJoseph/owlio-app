import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudySpacesView } from "./study-spaces-view"
import { studySpacesStorageKey } from "./study-spaces-records"

afterEach(cleanup)

beforeEach(() => {
  window.localStorage.clear()
})

function renderList() {
  return render(
    <MemoryRouter initialEntries={["/students/study-spaces"]}>
      <Routes>
        <Route path="/students/study-spaces" element={<StudySpacesView />} />
        <Route path="/students/study-spaces/:spaceId" element={<div>study room route</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("study spaces create flow", () => {
  it("creates a space with a room type and seats, then opens the room", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: "Create space" }))
    const dialog = screen.getByRole("dialog")

    await user.type(within(dialog).getByLabelText("Space name"), "Exam Crew")
    await user.click(within(dialog).getByRole("radio", { name: /Focused desks/ }))
    await user.clear(within(dialog).getByLabelText("Seats in the room"))
    await user.type(within(dialog).getByLabelText("Seats in the room"), "6")
    await user.click(within(dialog).getByRole("button", { name: /Create space/ }))

    expect(screen.getByText("study room route")).toBeTruthy()

    const stored = window.localStorage.getItem(studySpacesStorageKey)
    expect(stored).toBeTruthy()
    const records = JSON.parse(stored as string) as { kind: string; capacity: number; name: string }[]
    const created = records.find((record) => record.name === "Exam Crew")
    expect(created?.kind).toBe("focused")
    expect(created?.capacity).toBe(6)
  })

  it("links each space entry to its room route", () => {
    renderList()

    const spaceLink = screen.getByRole("link", { name: /Open Physics Group/ })
    expect(spaceLink.getAttribute("href")).toBe("/students/study-spaces/sample-space-physics")
  })
})
