import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { sampleTasks, tasksStorageKey, type TaskRecord } from "@/components/features/personal-workspace/tasks/task-records"
import { StudentProgressView } from "./student-progress-view"

const personal: TaskRecord = { id: "personal-review", title: "Review my vocabulary", subject: "English", notes: "Focus on verbs", status: "done", priority: "medium", dueDate: "", createdAt: "2026-10-30T09:00:00.000Z" }

function Location() {
  return <output aria-label="Current URL">{useLocation().pathname}</output>
}

function show(tasks?: TaskRecord[]) {
  if (tasks) localStorage.setItem(tasksStorageKey, JSON.stringify(tasks))
  return render(<MemoryRouter initialEntries={["/students/progress"]}><StudentProgressView /><Location /></MemoryRouter>)
}

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe("student Progress & Grades", () => {
  it("keeps a first visit empty and never writes example data", () => {
    const writes = vi.spyOn(Storage.prototype, "setItem")
    show()
    expect(screen.getByRole("heading", { name: "Small steps, visible progress" })).toBeTruthy()
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.getByRole("link", { name: /Go to personal tasks/ }).getAttribute("href")).toBe("/students/tasks")
    expect(screen.getByRole("link", { name: /Open My Learning/ }).getAttribute("href")).toBe("/students/subjects")
    expect(writes).not.toHaveBeenCalled()
  })

  it("counts only saved personal tasks, retaining edited legacy examples", () => {
    show([...sampleTasks, personal, { ...sampleTasks[0], title: "My revised task", status: "todo" }])
    expect(screen.getByRole("progressbar", { name: "Personal task completion" }).getAttribute("aria-valuenow")).toBe("50")
    expect(screen.getByText("2 of 2 personal tasks shown")).toBeTruthy()
    expect(screen.queryByRole("button", { name: `View task ${sampleTasks[0].title}` })).toBeNull()
    expect(screen.getByRole("button", { name: "View task My revised task" })).toBeTruthy()
  })

  it("opens read-only source details and restores focus without mutating tasks", async () => {
    const user = userEvent.setup()
    show([personal])
    const saved = localStorage.getItem(tasksStorageKey)
    const writes = vi.spyOn(Storage.prototype, "setItem")
    const trigger = screen.getByRole("button", { name: `View task ${personal.title}` })
    await user.click(trigger)
    const dialog = within(screen.getByRole("dialog"))
    expect(dialog.getByText(personal.notes)).toBeTruthy()
    expect(dialog.getByText("Done")).toBeTruthy()
    expect(dialog.queryByRole("textbox")).toBeNull()
    expect(dialog.getByRole("link", { name: /Manage in My tasks/ }).getAttribute("href")).toBe("/students/tasks")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(document.activeElement).toBe(trigger)
    expect(localStorage.getItem(tasksStorageKey)).toBe(saved)
    expect(writes).not.toHaveBeenCalled()
  })

  it("filters the list without changing completion totals and resets an empty filter", async () => {
    const user = userEvent.setup()
    show([personal])
    await user.selectOptions(screen.getByRole("combobox", { name: "Show" }), "todo")
    expect(screen.getByRole("heading", { name: "No tasks with this status" })).toBeTruthy()
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100")
    await user.click(screen.getByRole("button", { name: "Show all tasks" }))
    expect(screen.getByRole("button", { name: `View task ${personal.title}` })).toBeTruthy()
  })

  it("does not treat unreadable data as empty or overwrite it, and supports retry", async () => {
    const user = userEvent.setup()
    localStorage.setItem(tasksStorageKey, "broken-json")
    const writes = vi.spyOn(Storage.prototype, "setItem")
    show()
    expect(screen.getByRole("alert").textContent).toContain("couldn’t read your saved tasks")
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.queryByRole("heading", { name: "Small steps, visible progress" })).toBeNull()
    expect(localStorage.getItem(tasksStorageKey)).toBe("broken-json")
    expect(writes).not.toHaveBeenCalled()
    localStorage.setItem(tasksStorageKey, JSON.stringify([personal]))
    await user.click(screen.getByRole("button", { name: /Retry loading tasks/ }))
    expect(screen.queryByRole("alert")).toBeNull()
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100")
  })

  it("refreshes the snapshot on another tab’s saved-task changes or cleared storage", () => {
    show([personal])
    localStorage.setItem(tasksStorageKey, JSON.stringify([{ ...personal, status: "todo" }]))
    fireEvent(window, new StorageEvent("storage", { key: tasksStorageKey }))
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0")
    localStorage.clear()
    fireEvent(window, new StorageEvent("storage", { key: null }))
    expect(screen.getByRole("heading", { name: "Small steps, visible progress" })).toBeTruthy()
  })

  it("switches scopes by keyboard on the same URL and shows unavailable official records", async () => {
    const user = userEvent.setup()
    show([personal])
    screen.getByRole("tab", { name: "Personal learning" }).focus()
    await user.keyboard("{ArrowRight}{Enter}")
    await waitFor(() => expect(screen.getByRole("tab", { name: "Classroom results" }).getAttribute("aria-selected")).toBe("true"))
    expect(screen.getByRole("heading", { name: "Classroom results aren’t connected yet" })).toBeTruthy()
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.getByRole("link", { name: /Open My Classes/ }).getAttribute("href")).toBe("/students/classrooms")
    expect(screen.getByLabelText("Current URL").textContent).toBe("/students/progress")
    await user.click(screen.getByRole("tab", { name: "Personal learning" }))
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100")
  })
})
