import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import StudentClassroomMaterialSubjectPage from "@/pages/dashboard/students/materials/classroom/subject"
import StudentPersonalMaterialSubjectPage from "@/pages/dashboard/students/materials/personal/subject"
import StudentStudySpaceMaterialSubjectPage from "@/pages/dashboard/students/materials/study-spaces/subject"

afterEach(cleanup)

function renderSubject(slug: string, page: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[`/students/materials/personal/${slug}`]}>
      <Routes>
        <Route path="/students/materials/personal/:subject" element={page} />
      </Routes>
    </MemoryRouter>
  )
}

describe("personal subject resources page", () => {
  it("lists every resource collected for the subject", () => {
    renderSubject("chemistry-i", <StudentPersonalMaterialSubjectPage />)

    expect(screen.getByRole("heading", { name: "Chemistry I" })).toBeTruthy()
    expect(screen.getByText("Chemical bonding recap")).toBeTruthy()
    expect(screen.getByText("Lab report template")).toBeTruthy()
    expect(screen.getByText("Titration walkthrough")).toBeTruthy()
    expect(screen.getByText("Periodic trends summary")).toBeTruthy()
    expect(screen.getByText("Lab safety checklist")).toBeTruthy()
  })

  it("keeps a breadcrumb back to the personal library", () => {
    renderSubject("mathematics", <StudentPersonalMaterialSubjectPage />)

    expect(screen.getByRole("link", { name: "Study Library" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Personal resources" })).toBeTruthy()
    expect(screen.getByText("Algebra cheat sheet")).toBeTruthy()
  })

  it("shows a safe empty state for an unknown subject", () => {
    renderSubject("does-not-exist", <StudentPersonalMaterialSubjectPage />)

    expect(screen.getByRole("heading", { name: "Subject not found" })).toBeTruthy()
  })
})

describe("classroom subject resources page", () => {
  it("lists the resources a class published", () => {
    renderSubject("biology-101", <StudentClassroomMaterialSubjectPage />)

    expect(screen.getByRole("heading", { name: "Biology 101" })).toBeTruthy()
    expect(screen.getByText("Ecosystem field notes")).toBeTruthy()
    expect(screen.getByText("Food webs overview")).toBeTruthy()
    expect(screen.getByText("Cell structure slides")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Classroom materials" })).toBeTruthy()
  })
})

describe("study space subject resources page", () => {
  it("lists the resources a space shared", () => {
    renderSubject("physics-group", <StudentStudySpaceMaterialSubjectPage />)

    expect(screen.getByRole("heading", { name: "Physics Group" })).toBeTruthy()
    expect(screen.getByText("Problem set — waves week 3")).toBeTruthy()
    expect(screen.getByText("Interference problems")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Study space resources" })).toBeTruthy()
  })
})
