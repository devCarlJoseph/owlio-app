import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
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

afterEach(cleanup)

describe("student Study Library", () => {
  it("gives every source card its own library route", () => {
    const { hrefs, text } = renderPage(<StudentMaterialsPage />)

    expect(text).toContain("Study Library")
    expect(hrefs).toContain("/students/materials/personal")
    expect(hrefs).toContain("/students/materials/classroom")
    expect(hrefs).toContain("/students/materials/study-spaces")
    expect(text).not.toContain("Open My Classes")
  })

  it("moves each resource card to its owning context when clicked", () => {
    const { container } = renderPage(<StudentMaterialsPage />)

    const resourceCard = container.querySelector(".group\\/resource")
    const resourceLink = resourceCard?.querySelector("a")

    expect(resourceLink?.getAttribute("href")).toBe("/students/notes")
    expect(resourceCard?.textContent).not.toContain("You own these")
    expect(resourceCard?.textContent).not.toContain("Open in Notes")
  })

  it("drops the three learning spaces card and hides the intro behind the info icon", () => {
    const { text } = renderPage(<StudentMaterialsPage />)

    expect(text).not.toContain("Three learning spaces")
    expect(text).not.toContain("Peer-shared resources")

    const tooltip = screen.getByRole("tooltip")
    expect(tooltip.textContent).toContain("Every resource you can reach")
  })

  it("gives each source card a pastel theme with the icon beside the title", () => {
    const { container } = renderPage(<StudentMaterialsPage />)

    const personal = container.querySelector(".bg-amber-50")
    const classroom = container.querySelector(".bg-sky-50")
    const studySpace = container.querySelector(".bg-emerald-50")

    expect(personal).toBeTruthy()
    expect(classroom).toBeTruthy()
    expect(studySpace).toBeTruthy()

    const heading = personal?.querySelector("h3")
    const row = heading?.parentElement
    expect(row?.className).toContain("flex")
    expect(row?.querySelector("svg")).toBeTruthy()
    expect(heading?.textContent).toBe("Personal resources")

    const footer = personal?.querySelector(".border-t")
    expect(footer?.querySelectorAll("a").length).toBe(1)
    expect(footer?.textContent).not.toContain("resources listed")
  })

  it("uses a dark teal hero instead of the dark slate gradient", () => {
    const { container } = renderPage(<StudentMaterialsPage />)

    expect(container.querySelector(".from-cyan-700")).toBeTruthy()
    expect(container.querySelector(".to-emerald-700")).toBeTruthy()
    expect(container.querySelector(".from-slate-950")).toBeNull()
  })

  it("drops the intro guidance and learning context headings", () => {
    const { text } = renderPage(<StudentMaterialsPage />)

    expect(text).not.toContain("Your Study Library collects")
    expect(text).not.toContain("The materials service is not connected yet")
    expect(text).not.toContain("Pick up where you left off")
    expect(text).not.toContain("Where are you learning?")
  })

  it("keeps the source colours on list rows", async () => {
    const user = userEvent.setup()
    const { container } = renderPage(<StudentMaterialsPage />)

    await user.click(screen.getByRole("button", { name: "List view" }))

    const row = container.querySelector("li.group\\/resource")
    const icon = row?.querySelector("span")

    expect(icon?.className).toContain("bg-amber-100")
    expect(icon?.className).toContain("text-amber-800")
  })

  it("colours the active layout and source tab", async () => {
    const user = userEvent.setup()
    renderPage(<StudentMaterialsPage />)

    const listButton = screen.getByRole("button", { name: "List view" })
    await user.click(listButton)
    expect(listButton.className).toContain("bg-sky-600")
    expect(listButton.className).toContain("text-white")

    const personalTab = screen.getByRole("tab", { name: /Personal/ })
    expect(personalTab.className).toContain("data-active:text-amber-800")
    expect(personalTab.className).toContain("data-active:after:bg-amber-500")
  })

  it("switches the resource layout and filters by kind", async () => {
    const user = userEvent.setup()
    const { container } = renderPage(<StudentMaterialsPage />)

    await user.click(screen.getByRole("button", { name: "List view" }))

    const list = container.querySelector("ul.space-y-2")
    expect(list).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Note" }))
    expect(screen.getByText(/resource(s)? shown/)).toBeTruthy()
  })

  it("keeps the display menu out of the category row", () => {
    renderPage(<StudentMaterialsPage />)

    expect(screen.queryByRole("button", { name: "Choose what to display" })).toBeNull()
    expect(screen.getByRole("group", { name: "Resource layout" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Note" })).toBeTruthy()
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

  it("uses a pastel gradient in the source family and drops the duplicated line", () => {
    const { container, text } = renderPage(<StudentPersonalMaterialsPage />)

    expect(container.querySelector(".from-amber-50")).toBeTruthy()
    expect(container.querySelector(".to-orange-50")).toBeTruthy()

    const occurrences = text.split("Your own notes and references, kept in your workspace.").length - 1
    expect(occurrences).toBe(1)
  })

  it("caps a subject preview at four resources and offers show more", () => {
    const { container } = renderPage(<StudentPersonalMaterialsPage />)

    const chemistrySection = Array.from(
      container.querySelectorAll("section")
    ).find((section) => section.textContent?.includes("Chemistry I"))

    expect(chemistrySection?.querySelectorAll("li").length).toBe(4)
    expect(chemistrySection?.textContent).toContain("5 resources")
    expect(chemistrySection?.querySelector("[role=tooltip]")?.textContent).toBe("Show more")
  })

  it("links a subject to its own resources page", () => {
    const { hrefs } = renderPage(<StudentPersonalMaterialsPage />)

    expect(hrefs).toContain("/students/materials/personal/chemistry-i")
    expect(hrefs).toContain("/students/materials/personal/mathematics")
  })

  it("lays the personal resources card out as a left-aligned banner", () => {
    renderPage(<StudentPersonalMaterialsPage />)

    const heading = screen.getByRole("heading", { level: 2, name: "Personal resources" })
    const banner = heading.closest("section")

    expect(banner?.textContent).toContain("You own these")
    expect(banner?.textContent).toContain(
      "Your own notes and references, kept in your workspace."
    )
    expect(banner?.querySelector("svg")).toBeTruthy()

    const actions = Array.from(banner?.querySelectorAll("a") ?? [])
    expect(actions.length).toBe(1)
    expect(actions[0]?.textContent?.trim()).toBe("Open My Learning")
    expect(actions[0]?.className).toContain("bg-amber-600")
    expect(screen.queryByRole("link", { name: "Open Notes" })).toBeNull()
  })

  it("adds subject categories with All selected by default", () => {
    renderPage(<StudentPersonalMaterialsPage />)

    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true")
    expect(
      screen.getByRole("button", { name: "Chemistry I" }).getAttribute("aria-pressed")
    ).toBe("false")
    expect(screen.getByRole("group", { name: "Subject categories" })).toBeTruthy()
  })

  it("hides the resource count copy once a subject category is selected", async () => {
    const user = userEvent.setup()
    renderPage(<StudentPersonalMaterialsPage />)

    expect(screen.getByText("12 resources shown")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "English" }))

    expect(screen.queryByText(/resources shown/)).toBeNull()
  })

  it("jumps to a subject category from the show more arrow", async () => {
    const user = userEvent.setup()
    const { container } = renderPage(<StudentPersonalMaterialsPage />)

    await user.click(screen.getByRole("button", { name: "Show all Chemistry I resources" }))

    expect(
      screen.getByRole("button", { name: /^Chemistry I/ }).getAttribute("aria-pressed")
    ).toBe("true")
    expect(container.querySelectorAll("ul li").length).toBe(5)
    expect(screen.queryByRole("button", { name: "Show all Chemistry I resources" })).toBeNull()
    expect(screen.queryByText("Wave equation checklist")).toBeNull()
    expect(screen.getByText("Chemical bonding recap")).toBeTruthy()
  })

  it("filters the library to one subject category", async () => {
    const user = userEvent.setup()
    const { container } = renderPage(<StudentPersonalMaterialsPage />)

    await user.click(screen.getByRole("button", { name: /^English/ }))

    expect(container.querySelectorAll("ul li").length).toBe(2)
    expect(screen.getByText("Essay intro outline")).toBeTruthy()
    expect(screen.queryByText("Chemical bonding recap")).toBeNull()
  })

  it("uses the same design for classroom and study space libraries", () => {
    const classroom = renderPage(<StudentClassroomMaterialsPage />)
    expect(classroom.container.querySelector(".from-sky-100")).toBeTruthy()
    expect(classroom.container.querySelector(".to-blue-100")).toBeTruthy()
    expect(classroom.hrefs).toContain("/students/materials/classroom/biology-101")

    const studySpace = renderPage(<StudentStudySpaceMaterialsPage />)
    expect(studySpace.container.querySelector(".from-emerald-50")).toBeTruthy()
    expect(studySpace.container.querySelector(".to-teal-50")).toBeTruthy()
    expect(studySpace.hrefs).toContain("/students/materials/study-spaces/physics-group")
  })

  it("caps the classroom and study space previews at four resources too", () => {
    const classroom = renderPage(<StudentClassroomMaterialsPage />)
    const biology = Array.from(classroom.container.querySelectorAll("section")).find(
      (section) => section.textContent?.includes("Biology 101")
    )
    expect(biology?.querySelectorAll("li").length).toBe(4)
    expect(biology?.textContent).toContain("5 resources")
    expect(biology?.querySelector("[role=tooltip]")?.textContent).toBe("Show more")

    const studySpace = renderPage(<StudentStudySpaceMaterialsPage />)
    const physics = Array.from(studySpace.container.querySelectorAll("section")).find(
      (section) => section.textContent?.includes("Physics Group")
    )
    expect(physics?.querySelectorAll("li").length).toBe(4)
    expect(physics?.textContent).toContain("5 resources")
  })
})
