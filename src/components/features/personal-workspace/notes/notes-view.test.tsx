import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { NotesView } from "./notes-view"
import { notesStorageKey } from "./note-records"

function renderNotes() {
  return render(
    <MemoryRouter>
      <NotesView />
    </MemoryRouter>
  )
}

function notesPanel() {
  return within(screen.getByRole("tabpanel"))
}

describe("NotesView", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("shows the note buckets and the notes in each bucket", () => {
    renderNotes()

    expect(screen.getByRole("tab", { name: /Notes/ })).toBeTruthy()
    expect(screen.getByRole("tab", { name: /Archive/ })).toBeTruthy()
    expect(screen.getByRole("tab", { name: /Trash/ })).toBeTruthy()
    expect(notesPanel().getByText("Wave equation checklist")).toBeTruthy()
    expect(notesPanel().getByText("Chemical bonding recap")).toBeTruthy()
  })

  it("toggles a checklist item straight from the card", async () => {
    const user = userEvent.setup()
    renderNotes()

    const item = screen.getByRole("checkbox", { name: "Node and antinode positions" })
    expect(item.getAttribute("aria-checked")).toBe("false")

    await user.click(item)

    const updated = screen.getByRole("checkbox", { name: "Node and antinode positions" })
    expect(updated.getAttribute("aria-checked")).toBe("true")
  })

  it("filters the list with the search field", async () => {
    const user = userEvent.setup()
    renderNotes()

    await user.type(screen.getByRole("searchbox", { name: "Search notes" }), "bonding")

    expect(notesPanel().getByText("Chemical bonding recap")).toBeTruthy()
    expect(notesPanel().queryByText("Wave equation checklist")).toBeNull()
  })

  it("moves a note to the trash and restores it with undo", async () => {
    const user = userEvent.setup()
    renderNotes()

    await user.click(notesPanel().getByText("Chemical bonding recap"))
    await user.click(await screen.findByRole("button", { name: /Delete/ }))
    await user.click(await screen.findByRole("button", { name: /Move to trash/ }))

    expect(notesPanel().queryByText("Chemical bonding recap")).toBeNull()
    expect(screen.getByRole("status").textContent).toContain("moved to trash")

    await user.click(screen.getByRole("button", { name: "Undo" }))

    expect(notesPanel().getByText("Chemical bonding recap")).toBeTruthy()
  })

  it("creates a checklist note from the composer", async () => {
    const user = userEvent.setup()
    renderNotes()

    await user.click(screen.getByRole("button", { name: "New note" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText(/Title/), "Revision checklist")
    await user.click(within(dialog).getByRole("button", { name: "Checklist" }))
    await user.click(within(dialog).getByRole("button", { name: "Add item" }))
    await user.type(within(dialog).getByLabelText("Checklist item 1"), "Revise equations")
    await user.click(within(dialog).getByRole("button", { name: "Save note" }))

    expect(notesPanel().getByText("Revision checklist")).toBeTruthy()
    expect(screen.getByRole("checkbox", { name: "Revise equations" })).toBeTruthy()
    expect(window.localStorage.getItem(notesStorageKey)).toContain("Revision checklist")
  })

  it("opens the per-note menu with edit, pin, duplicate, archive, and delete", async () => {
    const user = userEvent.setup()
    renderNotes()

    await user.click(
      screen.getByRole("button", { name: "Options for Chemical bonding recap" })
    )

    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "Edit" })).toBeTruthy()
    expect(within(menu).getByRole("menuitem", { name: /Pin to top/ })).toBeTruthy()
    expect(within(menu).getByRole("menuitem", { name: "Duplicate" })).toBeTruthy()
    expect(within(menu).getByRole("menuitem", { name: "Archive" })).toBeTruthy()
    expect(within(menu).getByRole("menuitem", { name: "Move to trash" })).toBeTruthy()
  })

  it("keeps a pinned note pinned in the menu", async () => {
    const user = userEvent.setup()
    renderNotes()

    await user.click(
      screen.getByRole("button", { name: "Options for Wave equation checklist" })
    )

    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: /Unpin from top/ })).toBeTruthy()
  })
})
