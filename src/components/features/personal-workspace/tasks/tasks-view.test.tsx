import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TasksView } from "./tasks-view"
import { loadPersonalTasks, sampleTasks, tasksStorageKey, type TaskRecord } from "./task-records"
import { createWork, saveWork, workHref } from "@/components/features/materials/workspace/work-records"

const first: TaskRecord = { id: "my-physics-task", title: "Outline my physics report", subject: "Physics", notes: "Compare two experiments", status: "todo", priority: "high", dueDate: "2030-11-10", createdAt: "2026-10-30T09:00:00.000Z" }
const second: TaskRecord = { ...first, id: "my-biology-task", title: "Review cell structure", subject: "Biology", status: "in-progress", notes: "Draw a cell diagram" }
function show(tasks?: TaskRecord[]) {
  if (tasks) localStorage.setItem(tasksStorageKey, JSON.stringify(tasks))
  return render(<MemoryRouter><TasksView /></MemoryRouter>)
}
function stored(): TaskRecord[] { return JSON.parse(localStorage.getItem(tasksStorageKey) ?? "[]") }

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe("reference-aligned personal tasks", () => {
  it("keeps the example board read-only and does not persist samples on page load", async () => {
    const user = userEvent.setup()
    const writes = vi.spyOn(Storage.prototype, "setItem")
    show()
    expect(screen.getByRole("status").textContent).toBe("Preview only")
    await user.click(screen.getByRole("button", { name: `Open task ${sampleTasks[0].title}` }))
    const detail = within(screen.getByRole("dialog"))
    expect(detail.getByText("Example task")).toBeTruthy()
    expect(detail.queryByRole("button", { name: "Edit task" })).toBeNull()
    expect(detail.queryByRole("combobox", { name: "Status" })).toBeNull()
    expect(writes).not.toHaveBeenCalled()
  })

  it("creates directly in a board column and saves only the student’s task", async () => {
    const user = userEvent.setup()
    show()
    await user.click(screen.getByRole("button", { name: "Add in progress task" }))
    const form = within(screen.getByRole("dialog"))
    expect(form.getByRole("button", { name: "In progress" }).getAttribute("aria-pressed")).toBe("true")
    await user.click(form.getByRole("button", { name: "Save task" }))
    expect(form.getByText(/at least 3 characters/)).toBeTruthy()
    await user.type(form.getByRole("textbox", { name: "Title" }), "Prepare a history outline")
    fireEvent.change(form.getByLabelText("Due date"), { target: { value: "2030-11-10" } })
    await user.click(form.getByRole("button", { name: "Save task" }))
    expect(stored()).toHaveLength(1)
    expect(stored()[0]).toMatchObject({ title: "Prepare a history outline", status: "in-progress", dueDate: "2030-11-10" })
    expect(within(screen.getByRole("region", { name: "In progress tasks" })).getByRole("button", { name: /Open task Prepare/ })).toBeTruthy()
  })

  it("moves tasks between columns through the detail panel and restores focus on close", async () => {
    const user = userEvent.setup()
    show([first, second])
    const trigger = screen.getByRole("button", { name: `Open task ${first.title}` })
    await user.click(trigger)
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "done")
    expect(stored()[0].status).toBe("done")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(within(screen.getByRole("region", { name: "Done tasks" })).getByRole("button", { name: `Open task ${first.title}` })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: `Open task ${first.title}` }))
  })

  it("supports quick completion and reopening without touching other records", async () => {
    const user = userEvent.setup()
    show([first, second])
    await user.click(screen.getByRole("button", { name: `Complete task ${first.title}` }))
    expect(stored()[0].status).toBe("done")
    expect(stored()[1]).toEqual(second)
    await user.click(screen.getByRole("button", { name: `Reopen task ${first.title}` }))
    expect(stored()[0].status).toBe("todo")
  })

  it("applies search and subject/status filters across board, list, and subject views", async () => {
    const user = userEvent.setup()
    show([first, second])
    await user.selectOptions(screen.getByRole("combobox", { name: "Filter tasks by subject" }), "Biology")
    await user.click(screen.getByRole("button", { name: "List" }))
    expect(screen.getByRole("button", { name: `Open task ${second.title}` })).toBeTruthy()
    expect(screen.queryByRole("button", { name: `Open task ${first.title}` })).toBeNull()
    await user.type(screen.getByRole("searchbox", { name: "Search tasks" }), "nothing matches")
    expect(screen.getByRole("heading", { name: "No tasks match this view" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Reset filters" }))
    await user.click(screen.getByRole("button", { name: "By subject" }))
    expect(screen.getByRole("heading", { name: "Physics" })).toBeTruthy()
    expect(screen.getAllByRole("link", { name: "Assigned classwork" })[0].getAttribute("href")).toBe("/students/classwork")
  })

  it("edits and deletes through the existing dialogs", async () => {
    const user = userEvent.setup()
    show([first])
    await user.click(screen.getByRole("button", { name: `Open task ${first.title}` }))
    await user.click(screen.getByRole("button", { name: "Edit task" }))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Title" })))
    await user.clear(screen.getByRole("textbox", { name: "Title" }))
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Updated physics outline")
    await user.click(screen.getByRole("button", { name: "Save task" }))
    expect(stored()[0].id).toBe(first.id)
    expect(stored()[0].title).toBe("Updated physics outline")
    await user.click(screen.getByRole("button", { name: "Open task Updated physics outline" }))
    await user.click(screen.getByRole("button", { name: "Delete task" }))
    expect(stored()).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "Delete task" }))
    expect(stored()).toHaveLength(0)
    expect(screen.getByRole("heading", { name: "Make room for your next goal" })).toBeTruthy()
  })

  it("shows only study files linked to the selected personal task", async () => {
    const user = userEvent.setup()
    const linked = { ...createWork("document", "Physics study draft"), taskId: first.id }
    const other = { ...createWork("presentation", "Unrelated presentation"), taskId: second.id }
    saveWork(linked, null); saveWork(other, null)
    show([first, second])
    await user.click(screen.getByRole("button", { name: `Open task ${first.title}` }))
    expect(screen.getByRole("link", { name: /Physics study draft/ }).getAttribute("href")).toBe(workHref(linked.id))
    expect(screen.queryByRole("link", { name: /Unrelated presentation/ })).toBeNull()
    expect(screen.queryByRole("button", { name: /upload|invite|comments/i })).toBeNull()
  })

  it("preserves edited legacy samples while separating untouched examples", () => {
    const edited = { ...sampleTasks[0], notes: "My own changed plan" }
    localStorage.setItem(tasksStorageKey, JSON.stringify([edited, sampleTasks[1]]))
    expect(loadPersonalTasks().tasks).toEqual([edited])
    show()
    expect(screen.getByText("My own changed plan")).toBeTruthy()
    expect(stored()).toHaveLength(2)
  })

  it("protects unreadable saved data and can retry after storage is repaired", async () => {
    const user = userEvent.setup()
    localStorage.setItem(tasksStorageKey, "unreadable")
    show()
    expect(screen.getByRole("button", { name: "New task" }).hasAttribute("disabled")).toBe(true)
    expect(localStorage.getItem(tasksStorageKey)).toBe("unreadable")
    localStorage.setItem(tasksStorageKey, JSON.stringify([first]))
    await user.click(screen.getByRole("button", { name: "Retry loading tasks" }))
    expect(screen.getByRole("button", { name: `Open task ${first.title}` })).toBeTruthy()
  })

  it("keeps failed changes on the page and reports a successful retry accurately", async () => {
    const user = userEvent.setup()
    show([first])
    const writes = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    await user.click(screen.getByRole("button", { name: `Complete task ${first.title}` }))
    expect(screen.getByRole("status").textContent).toBe("Latest changes aren’t saved")
    expect(stored()[0].status).toBe("todo")
    writes.mockRestore()
    await user.click(screen.getByRole("button", { name: "Retry save" }))
    expect(stored()[0].status).toBe("done")
    expect(screen.getByRole("status").textContent).not.toContain("aren’t saved")
  })

  it("shows a failed status save inside the detail panel and retries without closing it", async () => {
    const user = userEvent.setup()
    show([first])
    await user.click(screen.getByRole("button", { name: `Open task ${first.title}` }))
    const writes = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "done")
    const detail = within(screen.getByRole("dialog"))
    expect(detail.getByRole("alert").textContent).toContain("aren’t saved")
    writes.mockRestore()
    await user.click(detail.getByRole("button", { name: "Retry save" }))
    expect(stored()[0].status).toBe("done")
    expect(detail.queryByRole("alert")).toBeNull()
  })
})
