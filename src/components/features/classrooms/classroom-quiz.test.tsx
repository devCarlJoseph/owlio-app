import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ClassroomActivityView } from "./classroom-activity-view"
import { ClassroomDetailView } from "./classroom-detail-view"
import { ClassroomPrototypeProvider } from "./classroom-prototype-provider"

vi.mock("@/lib/api-mode", () => ({ API_INTEGRATION_ENABLED: false }))

vi.mock("@/components/features/auth/auth-session-context", () => ({
  useAuthSession: () => ({ user: null, signOut: vi.fn() }),
}))

afterEach(cleanup)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ClassroomPrototypeProvider>
        <Routes>
          <Route path="/:role/classrooms/:classroomId/classwork/:activityId" element={<ClassroomActivityView />} />
          <Route path="/:role/classrooms/:classroomId" element={<ClassroomDetailView />} />
        </Routes>
      </ClassroomPrototypeProvider>
    </MemoryRouter>,
  )
}

describe("student timed quiz", () => {
  it("hides questions until Start, then shows the countdown and questions", async () => {
    renderAt("/students/classrooms/biology-101/classwork/biology-activity-timed-quiz")

    expect(await screen.findByRole("button", { name: /Start quiz/ })).toBeTruthy()
    expect(screen.queryByText(/Which organism is a producer/)).toBeNull()
    expect(screen.getAllByText(/5 min/).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: /Start quiz/ }))

    expect(await screen.findByText(/Which organism is a producer/)).toBeTruthy()
    const timer = screen.getByRole("timer")
    expect(timer.textContent).toMatch(/0[45]:\d\d/)
  })

  it("explains when the leaderboard is not enabled", async () => {
    renderAt("/students/classrooms/biology-101/classwork/biology-activity-timed-quiz")
    fireEvent.click(await screen.findByRole("tab", { name: "Leaderboard" }))
    expect(await screen.findByText("Leaderboard not enabled")).toBeTruthy()
  })

  it("ranks only returned scored results when the leaderboard is enabled", async () => {
    renderAt("/students/classrooms/biology-101/classwork/biology-activity-quiz")
    fireEvent.click(await screen.findByRole("tab", { name: "Leaderboard" }))

    const board = await screen.findByRole("list", { name: "Quiz leaderboard" })
    const rows = board.querySelectorAll("li")
    expect(rows.length).toBe(2)
    expect(rows[0].textContent).toContain("Sam P.")
    expect(rows[0].textContent).toContain("9 pts")
    expect(rows[1].textContent).toContain("You")
  })
})

describe("educator timer settings", () => {
  it("shows timer fields for a Quiz and a leaderboard opt-in", async () => {
    renderAt("/educators/classrooms/biology-101?tab=classwork")
    fireEvent.click(await screen.findByRole("button", { name: /Create classwork/ }))
    fireEvent.change(screen.getByLabelText("Activity type"), { target: { value: "Quiz" } })

    expect(screen.getByLabelText("Duration (minutes)")).toBeTruthy()
    expect(screen.getByLabelText("Auto-submit when time is up")).toBeTruthy()
    expect((screen.getByLabelText("Show leaderboard to students") as HTMLInputElement).checked).toBe(false)
  })

  it("makes the timer optional for other activity types", async () => {
    renderAt("/educators/classrooms/biology-101?tab=classwork")
    fireEvent.click(await screen.findByRole("button", { name: /Create classwork/ }))

    expect(screen.queryByLabelText("Duration (minutes)")).toBeNull()
    fireEvent.click(screen.getByLabelText("Add a time limit"))
    expect(screen.getByLabelText("Duration (minutes)")).toBeTruthy()
  })
})
