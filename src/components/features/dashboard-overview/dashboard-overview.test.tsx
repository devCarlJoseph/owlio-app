import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudentOverviewView } from "@/components/features/personal-workspace/student-overview/student-overview-view"
import { EducatorOverviewView } from "@/components/features/educator-overview/educator-overview-view"
import TutorOverviewView from "@/components/features/tutor-workspace/overview/tutor-overview-view"
import EslOverviewView from "@/components/features/esl-teaching/overview/esl-overview-view"

afterEach(cleanup)

const pages = [
  { role: "students", View: StudentOverviewView, summary: "My learning at a glance", explore: "Your learning spaces", agenda: "Coming up", action: "Open my learning", destination: "/students/subjects" },
  { role: "educators", View: EducatorOverviewView, summary: "My teaching at a glance", explore: "Your teaching spaces", agenda: "Upcoming classes", action: "Open my classes", destination: "/educators/classrooms" },
  { role: "tutors", View: TutorOverviewView, summary: "My tutoring at a glance", explore: "Your tutoring spaces", agenda: "Upcoming sessions", action: "Open sessions", destination: "/tutors/sessions" },
  { role: "esl", View: EslOverviewView, summary: "My language teaching at a glance", explore: "Your language teaching spaces", agenda: "Upcoming lessons", action: "Open lesson plans", destination: "/esl/lessons" },
]

describe("role overview pages", () => {
  it.each(pages)("keeps the $role overview scoped and honest about unavailable records", ({ role, View, summary, explore, agenda }) => {
    render(<MemoryRouter><View /></MemoryRouter>)

    for (const name of ["Overview", summary, explore, agenda]) {
      expect(screen.getByRole("heading", { name })).toBeTruthy()
    }
    expect(screen.getByText(/Live summaries are not connected yet/)).toBeTruthy()
    expect(screen.getAllByText("Not connected")).toHaveLength(3)
    expect(screen.getByRole("complementary", { name: "Your day and follow-ups" })).toBeTruthy()
    expect(screen.getAllByRole("link").every((link) => link.getAttribute("href")?.startsWith(`/${role}/`))).toBe(true)
    expect(screen.queryByRole("link", { name: /join meeting|start session|meeting room/i })).toBeNull()
    expect(screen.queryByText(/Sarah Johnson|Michael Chen|18\.5|\+3 this week/)).toBeNull()
    expect(screen.queryByRole("table")).toBeNull()
    expect(screen.queryByRole("progressbar")).toBeNull()
  })

  it.each(pages)("opens the primary $role workspace", ({ role, View, action, destination }) => {
    render(
      <MemoryRouter initialEntries={[`/${role}`]}>
        <Routes>
          <Route path={`/${role}`} element={<View />} />
          <Route path={destination} element={<h2>Destination workspace</h2>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("link", { name: action }))
    expect(screen.getByRole("heading", { name: "Destination workspace" })).toBeTruthy()
  })
})
