import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudySpacesView } from "./study-spaces-view"
import {
  sampleDiscoverySpaces,
  studySpaceJoinedDiscoveryStorageKey,
  studySpacesDiscoveryCaption,
  studySpacesStorageKey,
} from "./study-spaces-records"

vi.setConfig({ testTimeout: 20000 })

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

const lockedLabel = (name: string) => `${name} — locked preview, needs a space code`

describe("study space map", () => {
  it("renders user spaces plus locked discovery tiles with the preview caption", () => {
    renderList()

    expect(screen.getByRole("link", { name: "Open Physics Group" })).toBeTruthy()
    expect(screen.getAllByRole("link", { name: /^Open / })).toHaveLength(5)
    expect(screen.getByRole("button", { name: lockedLabel("Reading Room") })).toBeTruthy()
    expect(screen.getAllByRole("button", { name: /locked preview, needs a space code/ })).toHaveLength(
      sampleDiscoverySpaces.length
    )
    expect(screen.getByText(studySpacesDiscoveryCaption)).toBeTruthy()
    expect(screen.getByText(/3 yours · 2 joined · 6 locked/)).toBeTruthy()
  })

  it("opens the join dialog prefilled for a locked tile and keeps unlocked tiles as room links", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: lockedLabel("Reading Room") }))
    const dialog = screen.getByRole("dialog")
    expect((within(dialog).getByLabelText("Space name") as HTMLInputElement).value).toBe("Reading Room")
    expect(dialog.textContent).toContain("not verified")
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))

    expect(
      screen.getByRole("link", { name: "Open Maths Club" }).getAttribute("href")
    ).toBe("/students/study-spaces/sample-space-maths")
  })

  it("moves a joined discovery space out of the locked wing permanently", async () => {
    const user = userEvent.setup()
    const first = renderList()

    await user.click(screen.getByRole("button", { name: lockedLabel("Reading Room") }))
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Unlock space" }))
    expect(within(dialog).getByText("Enter a space code to unlock this preview space.")).toBeTruthy()

    await user.type(within(dialog).getByLabelText("Invite code or link"), "READ-1")
    await user.click(within(dialog).getByRole("button", { name: "Unlock space" }))

    expect(screen.queryByRole("button", { name: lockedLabel("Reading Room") })).toBeNull()
    expect(screen.getByRole("link", { name: "Open Reading Room" })).toBeTruthy()
    expect(screen.getByText(/3 yours · 3 joined · 5 locked/)).toBeTruthy()

    const records = JSON.parse(window.localStorage.getItem(studySpacesStorageKey) as string) as {
      name: string
      role: string
    }[]
    expect(records.some((record) => record.name === "Reading Room" && record.role === "member")).toBe(true)
    expect(JSON.parse(window.localStorage.getItem(studySpaceJoinedDiscoveryStorageKey) as string)).toEqual([
      "discovery-reading-room",
    ])

    first.unmount()
    renderList()
    expect(screen.queryByRole("button", { name: lockedLabel("Reading Room") })).toBeNull()
    expect(screen.getByRole("link", { name: "Open Reading Room" })).toBeTruthy()
  })

  it("filters spaces by the search box", async () => {
    const user = userEvent.setup()
    renderList()

    await user.type(screen.getByRole("searchbox", { name: "Search study spaces" }), "calc")
    expect(screen.getAllByRole("button", { name: /locked preview/ })).toHaveLength(1)
    expect(screen.queryByRole("link", { name: /Open Physics Group/ })).toBeNull()
  })

  it("lists every space as cards below the map, with locked spaces joinable", async () => {
    const user = userEvent.setup()
    renderList()

    expect(screen.getByRole("list", { name: "Spaces you've created" })).toBeTruthy()
    expect(screen.getByRole("list", { name: "Spaces you've joined" })).toBeTruthy()
    expect(screen.getByRole("list", { name: "Preview spaces (locked)" })).toBeTruthy()

    await user.click(screen.getByRole("button", { name: lockedLabel("Calculus Circle") }))
    expect((within(screen.getByRole("dialog")).getByLabelText("Space name") as HTMLInputElement).value).toBe(
      "Calculus Circle"
    )
  })

  it("zooms with the zoom buttons", async () => {
    const user = userEvent.setup()
    renderList()

    expect(screen.getByLabelText("Zoom level").textContent).toBe("100%")
    await user.click(screen.getByRole("button", { name: "Zoom in" }))
    expect(screen.getByLabelText("Zoom level").textContent).toBe("125%")
    await user.click(screen.getByRole("button", { name: "Zoom out" }))
    await user.click(screen.getByRole("button", { name: "Zoom out" }))
    expect(screen.getByLabelText("Zoom level").textContent).toBe("80%")
  })

  it("orders tiles deterministically by the selected sort", async () => {
    const user = userEvent.setup()
    renderList()

    const names = () =>
      screen
        .getAllByRole("link", { name: /^Open / })
        .map((link) => link.getAttribute("aria-label")?.replace("Open ", ""))

    expect(names().slice(0, 3)).toEqual(["Maths Club", "Essay Writers", "Physics Group"])

    await user.click(screen.getByRole("combobox", { name: "Sort spaces" }))
    await user.click(await screen.findByRole("option", { name: "Name A–Z" }))

    expect(names().slice(0, 3)).toEqual(["Essay Writers", "Maths Club", "Physics Group"])
  })
})
