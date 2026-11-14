import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { LibraryWorkspaceView } from "./library-workspace-view"
import { PersonalLibraryWork } from "./personal-library-work"
import { createWork, isLibraryWork, listWork, loadWork, reviseWork, saveWork, workHref, workStoragePrefix } from "./work-records"
import { tasksStorageKey } from "@/components/features/personal-workspace/tasks/task-records"

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

function openEditor(kind: "document" | "presentation") {
  const work = createWork(kind, kind === "document" ? "Research draft" : "Research deck")
  saveWork(work, null)
  const view = render(<MemoryRouter><LibraryWorkspaceView resourceId={work.id} /></MemoryRouter>)
  return { ...view, work }
}

describe("Owlio personal editor storage", () => {
  it("keeps files separate and refuses to overwrite another tab’s newer revision", () => {
    const first = createWork("document", "First")
    const second = createWork("presentation", "Second")
    saveWork(first, null); saveWork(second, null)
    const newer = reviseWork({ ...first, title: "Changed elsewhere" })
    saveWork(newer, first.updatedAt)
    expect(() => saveWork(reviseWork({ ...first, title: "Stale" }), first.updatedAt)).toThrow()
    expect(loadWork(first.id)?.title).toBe("Changed elsewhere")
    expect(loadWork(second.id)).toEqual(second)
  })

  it("reports unreadable storage without replacing the saved content", () => {
    localStorage.setItem(workStoragePrefix + "broken", "not json")
    expect(listWork()).toEqual({ items: [], error: true })
    expect(localStorage.getItem(workStoragePrefix + "broken")).toBe("not json")
    expect(isLibraryWork({ ...createWork("presentation", "Empty"), slides: [] })).toBe(false)
  })
})

describe("Owlio document and slide workspaces", () => {
  it("creates a personal file and opens its own workspace in the same router", async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Routes><Route path="/" element={<PersonalLibraryWork />} /><Route path="/students/materials/workspace/:id" element={<p>Editor route opened</p>} /></Routes></MemoryRouter>)
    await user.click(screen.getByRole("button", { name: "New document" }))
    await user.type(screen.getByLabelText("File title"), "My essay")
    await user.click(screen.getByRole("button", { name: "Create document" }))
    expect(screen.getByText("Editor route opened")).toBeTruthy()
    expect(listWork().items[0].title).toBe("My essay")
  })

  it("imports a backup as a new personal file without retaining another browser’s task link", async () => {
    const user = userEvent.setup()
    const original = { ...createWork("document", "Restored research"), taskId: "another-browser-task" }
    const file = new File([JSON.stringify(original)], "research.owlio.json", { type: "application/json" })
    Object.defineProperty(file, "text", { value: async () => JSON.stringify(original) })
    render(<MemoryRouter><PersonalLibraryWork /></MemoryRouter>)
    await user.upload(screen.getByLabelText("Import Owlio backup file"), file)
    const imported = listWork().items[0]
    expect(imported.id).not.toBe(original.id)
    expect(imported.taskId).toBe("")
    expect(imported.blocks).toEqual(original.blocks)
  })

  it("rejects an invalid backup without creating a local file", async () => {
    const user = userEvent.setup()
    const file = new File(["{}"], "wrong.json", { type: "application/json" })
    Object.defineProperty(file, "text", { value: async () => "{}" })
    render(<MemoryRouter><PersonalLibraryWork /></MemoryRouter>)
    await user.upload(screen.getByLabelText("Import Owlio backup file"), file)
    expect(screen.getByRole("alert").textContent).toContain("Owlio .owlio.json backup")
    expect(listWork().items).toHaveLength(0)
  })

  it("saves document text, block formatting, undo/redo, and reloads the saved work", async () => {
    const user = userEvent.setup()
    const { work, unmount } = openEditor("document")
    fireEvent.change(screen.getByRole("textbox", { name: /1 · paragraph/i }), { target: { value: "My first paragraph" } })
    await user.click(screen.getByRole("button", { name: "Bold block" }))
    expect(loadWork(work.id)?.blocks[0]).toMatchObject({ text: "My first paragraph", bold: true })
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(loadWork(work.id)?.blocks[0].bold).toBe(false)
    await user.click(screen.getByRole("button", { name: "Redo" }))
    await user.click(screen.getByRole("button", { name: "Add block" }))
    await user.selectOptions(screen.getByRole("combobox", { name: "Block style" }), "heading")
    expect(loadWork(work.id)?.blocks[1].kind).toBe("heading")
    unmount()
    render(<MemoryRouter><LibraryWorkspaceView resourceId={work.id} /></MemoryRouter>)
    expect((screen.getByRole("textbox", { name: /1 · paragraph/i }) as HTMLTextAreaElement).value).toBe("My first paragraph")
    expect(screen.getByRole("status").textContent).toContain("Saved in this browser")
  })

  it("retains an unsaved draft when storage fails and saves it after retry", async () => {
    const user = userEvent.setup()
    const { work } = openEditor("document")
    const setter = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    fireEvent.change(screen.getByRole("textbox", { name: /1 · paragraph/i }), { target: { value: "Keep my draft" } })
    expect(screen.getByRole("status").textContent).toContain("aren’t saved")
    expect((screen.getByRole("textbox", { name: /1 · paragraph/i }) as HTMLTextAreaElement).value).toBe("Keep my draft")
    expect(loadWork(work.id)?.blocks[0].text).toBe("")
    setter.mockRestore()
    await user.click(screen.getByRole("button", { name: "Retry save" }))
    expect(loadWork(work.id)?.blocks[0].text).toBe("Keep my draft")
    expect(screen.getByRole("status").textContent).toContain("Saved in this browser")
  })

  it("recovers a failed draft after in-app navigation back to the editor", () => {
    const { work, unmount } = openEditor("document")
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    fireEvent.change(screen.getByRole("textbox", { name: /1 · paragraph/i }), { target: { value: "Draft before navigation" } })
    unmount()
    render(<MemoryRouter><LibraryWorkspaceView resourceId={work.id} /></MemoryRouter>)
    expect((screen.getByRole("textbox", { name: /1 · paragraph/i }) as HTMLTextAreaElement).value).toBe("Draft before navigation")
    expect(screen.getByRole("status").textContent).toContain("aren’t saved")
  })

  it("builds, reorders, duplicates, and presents slides without exposing speaker notes", async () => {
    const user = userEvent.setup()
    const { work } = openEditor("presentation")
    fireEvent.change(screen.getByLabelText(/Title$/, { selector: "textarea" }), { target: { value: "Opening" } })
    await user.click(screen.getByRole("button", { name: "Add slide" }))
    fireEvent.change(screen.getByLabelText(/Title$/, { selector: "textarea" }), { target: { value: "Evidence" } })
    fireEvent.change(screen.getByLabelText("Speaker notes"), { target: { value: "Private reminder" } })
    await user.selectOptions(screen.getByRole("combobox", { name: "Slide theme" }), "midnight")
    await user.click(screen.getByRole("button", { name: "Move slide earlier" }))
    expect(loadWork(work.id)?.slides.map(slide => slide.title)).toEqual(["Evidence", "Opening"])
    await user.click(screen.getByRole("button", { name: "Duplicate slide" }))
    expect(loadWork(work.id)?.slides).toHaveLength(3)
    await user.click(screen.getByRole("button", { name: "Present" }))
    const preview = within(screen.getByRole("dialog"))
    expect(preview.getByRole("heading", { name: "Evidence" })).toBeTruthy()
    expect(preview.queryByText("Private reminder")).toBeNull()
    await user.click(preview.getByRole("button", { name: "Next slide" }))
    expect(preview.getByText(/Slide 2 of 3/)).toBeTruthy()
  })

  it("links only actual personal tasks and does not change their status", async () => {
    const user = userEvent.setup()
    const task = { id: "my-task", title: "Write an essay", subject: "English", notes: "Use two sources", dueDate: "", priority: "medium", status: "todo", createdAt: new Date().toISOString() }
    localStorage.setItem(tasksStorageKey, JSON.stringify([task]))
    const { work } = openEditor("document")
    await user.selectOptions(screen.getByLabelText("Personal task"), "my-task")
    expect(loadWork(work.id)?.taskId).toBe("my-task")
    expect(JSON.parse(localStorage.getItem(tasksStorageKey)!)[0].status).toBe("todo")
    expect(screen.getByText("English · Use two sources")).toBeTruthy()
    expect(screen.queryByRole("option", { name: "Finish wave problem set" })).toBeNull()
  })

  it("discovers personal work without placing it in classroom resources", () => {
    const work = createWork("document", "My personal draft")
    saveWork(work, null)
    render(<MemoryRouter><PersonalLibraryWork /></MemoryRouter>)
    expect(screen.getByRole("link", { name: /My personal draft/ }).getAttribute("href")).toBe(workHref(work.id))
  })

  it("provides a safe state for a missing local file", () => {
    render(<MemoryRouter><LibraryWorkspaceView resourceId="missing" /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "File not found in this browser" })).toBeTruthy()
    expect(screen.queryByRole("textbox")).toBeNull()
  })
})
