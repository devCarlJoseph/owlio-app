import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { notesStorageKey } from "@/components/features/personal-workspace/notes/note-records"
import { tasksStorageKey } from "@/components/features/personal-workspace/tasks/task-records"
import { SubjectDetailView } from "./subject-detail-view"
import {
  getSubjectTheme,
  sampleSubjects,
  subjectThemes,
  subjectsStorageKey,
} from "./subject-records"
import { SubjectsView } from "./subjects-view"

function renderSubjects() {
  return render(
    <MemoryRouter initialEntries={["/students/subjects"]}>
      <Routes>
        <Route path="/students/subjects" element={<SubjectsView />} />
        <Route path="/students/subjects/:subjectId" element={<SubjectDetailView />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("SubjectsView", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("names the page My Subjects and puts the create action on the right", () => {
    renderSubjects()

    expect(screen.getByRole("heading", { name: "My Subjects" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "New subject" })).toBeTruthy()
  })

  it("drops the At a glance card and folds the workspace into the hero", () => {
    renderSubjects()

    expect(screen.queryByRole("heading", { name: "At a glance" })).toBeNull()
    expect(screen.queryByRole("heading", { name: "Subject workspace" })).toBeNull()
    expect(screen.getByRole("link", { name: /Subject notes/ })).toBeTruthy()
    expect(screen.getByRole("link", { name: /Study materials/ })).toBeTruthy()
    expect(screen.getByRole("link", { name: /Tasks and deadlines/ })).toBeTruthy()
  })

  it("moves the My Subjects copy behind a hoverable info icon", () => {
    renderSubjects()

    const infoButton = screen.getByRole("button", { name: "About My Subjects" })
    expect(infoButton).toBeTruthy()

    const tooltip = screen.getByRole("tooltip")
    expect(tooltip.textContent).toContain("Organize learning by subject whether or not")
    expect(tooltip.className).toContain("opacity-0")
  })

  it("drops the stat tiles and keeps a single create action", () => {
    renderSubjects()

    expect(screen.queryByRole("list", { name: "Subject totals" })).toBeNull()
    expect(screen.queryByText("Created by you")).toBeNull()
    expect(screen.getAllByRole("button", { name: "New subject" })).toHaveLength(1)
  })

  it("shows the cover illustration on a subject card and hides the progress", () => {
    renderSubjects()

    const card = screen.getByRole("link", { name: "Physics I" }).closest("li")
    expect(card?.querySelector("img")).toBeTruthy()
    expect(card?.textContent).not.toContain("%")
  })

  it("keeps the subject name out of the card background", () => {
    renderSubjects()

    const card = screen.getByRole("link", { name: "Physics I" }).closest("li")
    const artwork = card?.querySelector("img")?.parentElement

    expect(artwork?.textContent).not.toContain("Physics I")
  })

  it("puts a fully completed subject at the bottom of the list", () => {
    renderSubjects()

    const names = screen
      .getAllByRole("link")
      .map((link) => link.textContent)
      .filter((name) => name && !name.includes(" "))

    expect(names.indexOf("Mathematics")).toBe(names.length - 1)
  })

  it("switches to a one column list with the cover colour background", async () => {
    const user = userEvent.setup()
    renderSubjects()

    await user.click(screen.getByRole("button", { name: "List view" }))

    const row = screen.getByRole("link", { name: "Physics I" }).closest("li")
    expect(row?.textContent).toContain("Ramon Diaz")
    expect(row?.textContent).toContain("%")
    expect(row?.querySelector("[data-slot=card-content]")?.className).toContain("bg-blue-100")
  })

  it("drops the chapters, lessons, and status badge from a subject card", () => {
    renderSubjects()

    const card = screen.getByRole("link", { name: "Physics I" }).closest("li")

    expect(card?.textContent).not.toContain("chapters")
    expect(card?.textContent).not.toContain("lessons")
    expect(card?.textContent).not.toMatch(/in progress|not started|completed/i)
  })

  it("gives every subject its own page", () => {
    renderSubjects()

    expect(screen.getByRole("link", { name: "Physics I" }).getAttribute("href")).toBe(
      "/students/subjects/physics-1",
    )
  })

  it("filters subjects by status beside the search bar", async () => {
    const user = userEvent.setup()
    renderSubjects()

    const filters = screen.getByRole("group", { name: "Filter subjects by status" })
    expect(within(filters).getByRole("button", { name: "All" })).toBeTruthy()
    expect(within(filters).getByRole("button", { name: "In progress" })).toBeTruthy()
    expect(within(filters).getByRole("button", { name: "Completed" })).toBeTruthy()
    expect(within(filters).getByRole("button", { name: "Not started" })).toBeTruthy()

    await user.click(within(filters).getByRole("button", { name: "Completed" }))

    expect(screen.getByRole("link", { name: "Mathematics" })).toBeTruthy()
    expect(screen.queryByRole("link", { name: "Physics I" })).toBeNull()
  })

  it("creates a subject in a modal instead of adding a card inline", async () => {
    const user = userEvent.setup()
    renderSubjects()

    expect(screen.queryByRole("dialog")).toBeNull()

    await user.click(screen.getByRole("button", { name: "New subject" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "New subject" })).toBeTruthy()
    expect(within(dialog).queryByText(/Create a subject you are tracking/)).toBeNull()
    expect(
      within(dialog).getByText("Your subjects are personal, not an educator's official course."),
    ).toBeTruthy()

    await user.type(within(dialog).getByLabelText("Subject name"), "Latin")
    await user.type(within(dialog).getByLabelText(/Code/), "LAN-LAT1")
    await user.click(within(dialog).getByRole("button", { name: "Create subject" }))

    expect(await screen.findByRole("link", { name: "Latin" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Latin" }).getAttribute("href")).toMatch(
      /^\/students\/subjects\/.+/,
    )
    expect(window.localStorage.getItem(subjectsStorageKey)).toContain("Latin")
  })

  it("keeps the create modal open when the name is missing", async () => {
    const user = userEvent.setup()
    renderSubjects()

    await user.click(screen.getByRole("button", { name: "New subject" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Create subject" }))

    expect(await screen.findByText("Give your subject a name.")).toBeTruthy()
    expect(screen.getByRole("dialog")).toBeTruthy()
  })
})

describe("SubjectDetailView", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  function renderDetail(path = "/students/subjects/physics-1") {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/students/subjects/:subjectId" element={<SubjectDetailView />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it("opens the subject page with its own notes and tasks sections", async () => {
    renderDetail()

    expect(await screen.findByRole("heading", { name: "Physics I" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Your notes" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Your tasks" })).toBeTruthy()
    expect(screen.getByText("Personal subject")).toBeTruthy()
  })

  it("shows a safe not-found state for an unknown subject", async () => {
    renderDetail("/students/subjects/does-not-exist")

    expect(await screen.findByRole("heading", { name: "Subject not found" })).toBeTruthy()
  })

  it("shows the cover, vertical icon actions, and no progress on the title card", async () => {
    renderDetail()

    expect(await screen.findByRole("heading", { name: "Physics I" })).toBeTruthy()
    expect(screen.getByText("Ramon Diaz")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Customize" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy()

    const cover = screen.getByRole("region", { name: "Subject cover" })
    expect(cover.textContent).not.toContain("%")
    expect(cover.textContent).not.toContain("milestones")
  })

  it("walks the milestone flow from start to completion", async () => {
    const user = userEvent.setup()
    renderDetail()

    expect(await screen.findByText("2 of 5 topics")).toBeTruthy()
    expect(screen.getByText("40%")).toBeTruthy()
    expect(screen.getByText("Motion and displacement")).toBeTruthy()

    const nextButton = screen.getByRole("button", { name: "Start next milestone" })
    await user.click(nextButton)

    expect(screen.getByRole("button", { name: "Milestone completed" })).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Milestone completed" }))

    expect(screen.getByText("3 of 5 topics")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Start next milestone" })).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Undo milestones" }))

    expect(screen.getByText("2 of 5 topics")).toBeTruthy()
  })

  it("completes the final milestone with a congrats modal", async () => {
    const user = userEvent.setup()
    renderDetail()

    await screen.findByText("2 of 5 topics")

    for (let step = 0; step < 3; step += 1) {
      const startNext = screen.queryByRole("button", { name: "Start next milestone" })
      if (startNext) await user.click(startNext)

      const complete = screen.queryByRole("button", { name: "Milestone completed" })
      if (complete) await user.click(complete)
    }

    const completeAll = screen.queryByRole("button", { name: "Complete milestones" })
    expect(completeAll).toBeTruthy()
    await user.click(completeAll as HTMLElement)

    expect(
      await screen.findByRole("heading", { name: /Congrats, you completed Physics I/ }),
    ).toBeTruthy()
  })

  it("adds a milestone from the empty state", async () => {
    const user = userEvent.setup()
    renderDetail("/students/subjects/computer-science")

    expect(await screen.findByText("No milestones yet")).toBeTruthy()
    expect(screen.queryByText("Learning progress")).toBeNull()

    await user.click(screen.getByRole("button", { name: "Add milestone" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Milestone"), "Recursion")
    await user.click(within(dialog).getByRole("button", { name: "Add milestone" }))

    expect(await screen.findByText("Recursion")).toBeTruthy()
    expect(screen.getByText("0 of 1 topics")).toBeTruthy()
  })

  it("undoes a removed milestone with its own button", async () => {
    const user = userEvent.setup()
    renderDetail()

    await screen.findByText("2 of 5 topics")

    await user.click(screen.getAllByRole("button", { name: "Options for Motion and displacement" })[0])

    const menu = await screen.findByRole("menu", { name: "Options for Motion and displacement" })
    await user.click(within(menu).getByRole("menuitem", { name: "Remove" }))

    const confirm = await screen.findByRole("dialog")
    expect(within(confirm).getByRole("heading", { name: "Remove this milestone?" })).toBeTruthy()

    await user.click(within(confirm).getByRole("button", { name: "Remove milestone" }))

    expect(screen.queryByText("Motion and displacement")).toBeNull()
    const undoRemoved = screen.getByRole("button", { name: "Undo removed milestone" })
    expect(undoRemoved).toBeTruthy()

    await user.click(undoRemoved)

    expect(await screen.findByText("Motion and displacement")).toBeTruthy()
  })

  it("removes all milestones and can restore them", async () => {
    const user = userEvent.setup()
    renderDetail()

    await screen.findByText("2 of 5 topics")

    await user.click(screen.getByRole("button", { name: "Remove all" }))

    expect(await screen.findByText("No milestones yet")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Undo removed milestones" }))

    expect(await screen.findByText("2 of 5 topics")).toBeTruthy()
  })

  it("creates a note tagged with the subject", async () => {
    const user = userEvent.setup()
    renderDetail("/students/subjects/mathematics")

    await user.click(await screen.findByRole("button", { name: "Add note" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText(/Title/), "Quadratic forms")
    await user.type(within(dialog).getByLabelText("Note"), "Completing the square")
    await user.click(within(dialog).getByRole("button", { name: "Save note" }))

    expect(await screen.findByText("Quadratic forms")).toBeTruthy()
    expect(window.localStorage.getItem(notesStorageKey)).toContain("mathematics")
  })

  it("creates a task with the subject already filled in", async () => {
    const user = userEvent.setup()
    renderDetail("/students/subjects/mathematics")

    await user.click(await screen.findByRole("button", { name: "Add task" }))

    const dialog = await screen.findByRole("dialog")
    const subjectField = within(dialog).getByLabelText("Subject") as HTMLInputElement
    expect(subjectField.value).toBe("Mathematics")

    await user.type(within(dialog).getByLabelText(/Title/), "Past paper")
    await user.click(within(dialog).getByRole("button", { name: "Save task" }))

    expect(await screen.findByText("Past paper")).toBeTruthy()
    expect(window.localStorage.getItem(tasksStorageKey)).toContain("Mathematics")
  })

  it("opens the customize dialog with a background colour and image option", async () => {
    const user = userEvent.setup()
    renderDetail()

    await user.click(await screen.findByRole("button", { name: "Customize" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Customize subject" })).toBeTruthy()
    expect(within(dialog).getByRole("group", { name: "Background colour" })).toBeTruthy()
    expect(within(dialog).getByRole("group", { name: "Background illustration" })).toBeTruthy()
    expect(within(dialog).getByLabelText("Background image")).toBeTruthy()
    expect(within(dialog).getByLabelText("Subject name")).toBeTruthy()
    expect(within(dialog).getByLabelText(/Code/)).toBeTruthy()
    expect(within(dialog).getByLabelText(/Instructor/)).toBeTruthy()
    expect(
      within(dialog).queryByText(/Using a solid background/),
    ).toBeNull()
  })

  it("shows an empty state for study resources with both actions", async () => {
    renderDetail()

    expect(await screen.findByText("No resources yet")).toBeTruthy()
    expect(screen.getAllByRole("link", { name: /Add resources/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("link", { name: /Open study library/ }).length).toBeGreaterThan(0)
  })

  it("follows the subject cover for the page theme", async () => {
    renderDetail("/students/subjects/mathematics")

    const progress = await screen.findByText("5 of 5 topics")
    expect(progress.className).toContain("text-blue-700")

    const imageCovered = {
      ...sampleSubjects.find((subject) => subject.id === "mathematics")!,
    }
    const colourCovered = { ...imageCovered, coverImage: null, coverColor: "emerald" }

    expect(getSubjectTheme(imageCovered)).toBe(subjectThemes.blue)
    expect(getSubjectTheme(colourCovered)).toBe(subjectThemes.emerald)
  })
})
