import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"
import StudentClassroomMaterialsPage from "@/pages/dashboard/students/materials/classroom"
import StudentMaterialsPage from "@/pages/dashboard/students/materials"
import StudentPersonalMaterialsPage from "@/pages/dashboard/students/materials/personal"
import StudentStudySpaceMaterialsPage from "@/pages/dashboard/students/materials/study-spaces"

function renderPage(page: React.ReactElement) {
  const { container } = render(
    <MemoryRouter>
      {page}
    </MemoryRouter>
  )

  return {
    container,
    hrefs: Array.from(container.querySelectorAll("a")).map((link) => link.getAttribute("href")),
    text: container.textContent ?? "",
  }
}

describe("student Study Library", () => {
  it("gives every source card its own library route and its owning context", () => {
    const { hrefs, text } = renderPage(<StudentMaterialsPage />)

    expect(text).toContain("Study Library")
    expect(hrefs).toContain("/students/materials/personal")
    expect(hrefs).toContain("/students/materials/classroom")
    expect(hrefs).toContain("/students/materials/study-spaces")
    expect(hrefs).toContain("/students/notes")
    expect(hrefs).toContain("/students/classrooms")
    expect(hrefs).toContain("/students/study-spaces")
  })

  it("keeps personal resources on the personal library route", () => {
    const { hrefs, text } = renderPage(<StudentPersonalMaterialsPage />)

    expect(text).toContain("Personal resources")
    expect(text).toContain("Wave equation checklist")
    expect(hrefs).toContain("/students/materials")
    expect(hrefs).toContain("/students/notes")
  })

  it("keeps classroom resources on the classroom library route", () => {
    const { hrefs, text } = renderPage(<StudentClassroomMaterialsPage />)

    expect(text).toContain("Classroom materials")
    expect(text).toContain("Ecosystem field notes")
    expect(hrefs).toContain("/students/classrooms/biology-101")
  })

  it("hides details for a classroom resource the student cannot open", () => {
    const { text } = renderPage(<StudentClassroomMaterialsPage />)

    expect(text).toContain("Resource unavailable")
    expect(text).not.toContain("Restricted practice set")
  })

  it("keeps peer-shared resources on the study space library route", () => {
    const { hrefs, text } = renderPage(<StudentStudySpaceMaterialsPage />)

    expect(text).toContain("Study space resources")
    expect(text).toContain("Problem set")
    expect(hrefs).toContain("/students/study-spaces")
  })
})
