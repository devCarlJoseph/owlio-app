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
    await user.click(within(dialog).getByRole("button", { name: "Increase seats" }))
    await user.click(within(dialog).getByRole("button", { name: "Increase seats" }))
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

  it("shows room layout and seat count on each space card", () => {
    renderList()

    const createdList = screen.getByRole("list", { name: "Spaces you've created" })
    expect(createdList.textContent).toContain("Shared tables · 6 seats")
    expect(createdList.textContent).toContain("browser only")
  })

  it("removes a created space from the browser after confirming", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: "More actions for Physics Group" }))
    const menu = await screen.findByRole("menu")
    await user.click(within(menu).getByRole("menuitem", { name: "Remove from this browser" }))

    const confirm = screen.getByRole("dialog")
    expect(confirm.textContent).toContain("local previews")
    await user.click(within(confirm).getByRole("button", { name: "Remove space" }))

    expect(screen.queryByRole("link", { name: /Open Physics Group/ })).toBeNull()

    const stored = window.localStorage.getItem(studySpacesStorageKey)
    const records = JSON.parse(stored as string) as { id: string }[]
    expect(records.some((record) => record.id === "sample-space-physics")).toBe(false)
  })
})
