import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router"
import userEvent from "@testing-library/user-event"
import { RoleScheduleView } from "./role-schedule-view"
import TutorSessionsView from "@/components/features/tutor-workspace/sessions/tutor-sessions-view"

afterEach(cleanup)

const roles = [
  { role: "students", title: "Calendar and Schedule", action: "Add study block", category: "Personal study" },
  { role: "educators", title: "Calendar and Schedule", action: "Schedule a class", category: "Class sessions" },
  { role: "tutors", title: "Sessions and Schedule", action: "Schedule a session", category: "Individual sessions" },
  { role: "esl", title: "Lesson Schedule", action: "Schedule a lesson", category: "Individual lessons" },
]

function renderSchedule(role = "students") {
  return render(<MemoryRouter initialEntries={[`/${role}/schedule`]}><RoleScheduleView /></MemoryRouter>)
}

describe("workspace schedules", () => {
  it.each(roles)("scopes the $role schedule and keeps unavailable actions disabled", ({ role, title, action, category }) => {
    renderSchedule(role)

    expect(screen.getByRole("heading", { name: title })).toBeTruthy()
    expect((screen.getByRole("button", { name: action }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByRole("tab", { name: "Week" }).getAttribute("aria-selected")).toBe("true")
    expect(within(screen.getByRole("list", { name: "Event type legend" })).getByText(category)).toBeTruthy()
    expect(screen.getAllByLabelText("Unavailable")).toHaveLength(4)
    expect(screen.getAllByRole("link").every((link) => link.getAttribute("href")?.startsWith(`/${role}/`))).toBe(true)
    expect(screen.queryByRole("button", { name: /^Example:/ })).toBeNull()
    expect(screen.queryByRole("link", { name: /join|meeting room/i })).toBeNull()
  })

  it("uses the same calendar on the tutor sidebar sessions page", () => {
    render(<MemoryRouter initialEntries={["/tutors/sessions"]}><TutorSessionsView /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "Sessions and Schedule" })).toBeTruthy()
    expect(screen.getByRole("region", { name: /Week calendar/ })).toBeTruthy()
  })

  it("navigates weeks and returns to today", () => {
    renderSchedule()
    const original = screen.getByLabelText("Visible date range").textContent
    fireEvent.click(screen.getByRole("button", { name: "Next week" }))
    expect(screen.getByLabelText("Visible date range").textContent).not.toBe(original)
    fireEvent.click(screen.getByRole("button", { name: "Today" }))
    expect(screen.getByLabelText("Visible date range").textContent).toBe(original)
    fireEvent.click(screen.getByRole("button", { name: "Previous week" }))
    expect(screen.getByLabelText("Visible date range").textContent).not.toBe(original)
  })

  it("switches Day and Month views and selects dates without changing route", async () => {
    renderSchedule()
    fireEvent.click(screen.getByRole("tab", { name: "Day" }))
    expect(await screen.findByRole("region", { name: /Day calendar/ })).toBeTruthy()
    fireEvent.click(screen.getByRole("tab", { name: "Month" }))
    const calendar = await screen.findByRole("table", { name: /Month calendar/ })
    expect(within(calendar).getAllByRole("button", { name: /^Select/ })).toHaveLength(42)
    const day = within(calendar).getAllByRole("button", { name: /^Select/ })[10]
    const label = day.getAttribute("aria-label")!.replace("Select ", "")
    fireEvent.click(day)
    expect(within(screen.getByRole("region", { name: "Selected day agenda" })).getByRole("heading", { name: label })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Next month" })).toBeTruthy()
  })

  it("shows fictional examples only when requested and opens accessible details", async () => {
    renderSchedule()
    fireEvent.click(screen.getByRole("button", { name: "Show examples" }))
    expect(screen.getByText(/Showing fictional examples/)).toBeTruthy()
    fireEvent.click(screen.getAllByRole("button", { name: /^Example: Independent reading/ })[0])
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText(/not a saved appointment/)).toBeTruthy()
    expect(within(dialog).queryByRole("button", { name: /save|join|publish/i })).toBeNull()
    fireEvent.click(within(dialog).getAllByRole("button", { name: "Close" })[0])
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    fireEvent.click(screen.getByRole("button", { name: "Hide examples" }))
    expect(screen.queryByRole("button", { name: /^Example:/ })).toBeNull()
    expect(screen.getAllByLabelText("Unavailable")).toHaveLength(4)
  })

  it("filters examples by their owning event type", async () => {
    const user = userEvent.setup()
    renderSchedule()
    await user.click(screen.getByRole("button", { name: "Show examples" }))
    await user.click(screen.getByRole("combobox", { name: "Filter calendar by event type" }))
    await user.click(await screen.findByRole("option", { name: "Class sessions" }))
    await waitFor(() => expect(screen.queryByRole("button", { name: /^Example: Independent reading/ })).toBeNull())
    expect(screen.getAllByRole("button", { name: /^Example: Class lesson/ }).length).toBeGreaterThan(0)
  })
})
