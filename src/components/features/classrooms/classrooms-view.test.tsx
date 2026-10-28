import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  getClassrooms,
  joinClassroomByCode,
  type ApiClassroom,
} from "@/services/api/classroom.service"
import { ClassroomPrototypeProvider } from "./classroom-prototype-provider"
import { ClassroomsView } from "./classrooms-view"

vi.mock("@/lib/api-mode", () => ({ API_INTEGRATION_ENABLED: true }))

vi.mock("@/services/api/classroom.service", () => ({
  getClassrooms: vi.fn(),
  createClassroom: vi.fn(),
  joinClassroomByCode: vi.fn(),
}))

const mockedGetClassrooms = vi.mocked(getClassrooms)
const mockedJoinClassroomByCode = vi.mocked(joinClassroomByCode)

const enrolledClassroom: ApiClassroom = {
  id: "class-biology",
  name: "Foundations of Biology",
  subject: "Life science",
  description: "Explore living systems and ecosystems.",
  instructorName: "Morgan Chen",
  joinCode: "OWLIO-1234",
  meetingId: null,
  access: "student",
}

function renderView() {
  return render(
    <MemoryRouter initialEntries={["/students/classrooms"]}>
      <ClassroomPrototypeProvider>
        <ClassroomsView />
      </ClassroomPrototypeProvider>
    </MemoryRouter>,
  )
}

async function openJoinForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole("button", { name: /join a class/i })[0])
  return screen.getByLabelText("Classroom invite code")
}

describe("student My Classes", () => {
  beforeEach(() => {
    mockedGetClassrooms.mockResolvedValue([])
    mockedJoinClassroomByCode.mockResolvedValue(enrolledClassroom)
  })

  afterEach(() => {
    cleanup()
  })

  it("shows service-confirmed classes and demo previews in one gallery", async () => {
    mockedGetClassrooms.mockResolvedValue([enrolledClassroom])
    renderView()

    expect(await screen.findByText("Foundations of Biology")).toBeTruthy()
    expect(screen.getByText("My Classes")).toBeTruthy()
    expect(screen.getByText(/1 connected · 3 demo previews/)).toBeTruthy()
    expect(screen.getByText("Enrolled")).toBeTruthy()
    expect(screen.getAllByText("Demo").length).toBeGreaterThan(0)
    expect(screen.getByText(/Membership comes from the classroom service/)).toBeTruthy()
  })

  it("gives every class card classwork and materials shortcuts", async () => {
    mockedGetClassrooms.mockResolvedValue([enrolledClassroom])
    renderView()

    const classworkLink = await screen.findByRole("link", {
      name: "Open Foundations of Biology classwork",
    })
    const materialsLink = screen.getByRole("link", {
      name: "Open Foundations of Biology materials",
    })

    expect(classworkLink.getAttribute("href")).toBe(
      "/students/classrooms/class-biology?tab=classwork",
    )
    expect(materialsLink.getAttribute("href")).toBe(
      "/students/classrooms/class-biology?tab=materials",
    )
  })

  it("navigates to the classwork tab from the card menu", async () => {
    const user = userEvent.setup()
    mockedGetClassrooms.mockResolvedValue([enrolledClassroom])

    let currentPath = ""
    function LocationProbe() {
      const location = useLocation()
      currentPath = `${location.pathname}${location.search}`
      return null
    }

    render(
      <MemoryRouter initialEntries={["/students/classrooms"]}>
        <ClassroomPrototypeProvider>
          <ClassroomsView />
          <LocationProbe />
        </ClassroomPrototypeProvider>
      </MemoryRouter>,
    )

    await user.click(
      await screen.findByRole("button", { name: "More options for Foundations of Biology" }),
    )
    const menu = await screen.findByRole("menu")
    await user.click(within(menu).getByRole("menuitem", { name: "Classwork" }))

    expect(currentPath).toBe("/students/classrooms/class-biology?tab=classwork")
  })

  it("switches between grid and list layouts without changing the classes shown", async () => {
    const user = userEvent.setup()
    mockedGetClassrooms.mockResolvedValue([enrolledClassroom])
    renderView()

    expect(await screen.findByText("Foundations of Biology")).toBeTruthy()
    expect(screen.queryByRole("table", { name: "Classes" })).toBeNull()

    const listToggle = screen.getByRole("button", { name: "List view" })
    await user.click(listToggle)

    const table = await screen.findByRole("table", { name: "Classes" })
    expect(within(table).getByText("Foundations of Biology")).toBeTruthy()
    expect(within(table).getAllByRole("row").length).toBeGreaterThan(1)
    expect(screen.getByRole("button", { name: "List view" }).getAttribute("aria-pressed")).toBe("true")

    await user.click(screen.getByRole("button", { name: "Grid view" }))
    expect(screen.queryByRole("table", { name: "Classes" })).toBeNull()
    expect(screen.getByText("Foundations of Biology")).toBeTruthy()
  })

  it("filters classes by subject and search", async () => {
    const user = userEvent.setup()
    mockedGetClassrooms.mockResolvedValue([enrolledClassroom])
    renderView()

    expect(await screen.findByText("Foundations of Biology")).toBeTruthy()

    const filters = screen.getByRole("group", { name: "Filter classes by subject" })
    await user.click(within(filters).getByRole("button", { name: /Life science/ }))
    expect(screen.getByText("Foundations of Biology")).toBeTruthy()
    expect(screen.queryByText("Biology 101")).toBeNull()

    await user.click(within(filters).getByRole("button", { name: /^All/ }))
    await user.type(screen.getByRole("searchbox", { name: "Search classes" }), "zzz-no-match")
    expect(screen.getByText("No classes match your filters")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByText("Foundations of Biology")).toBeTruthy()
  })

  it("lets the connected-vs-demo notice be dismissed", async () => {
    const user = userEvent.setup()
    renderView()

    expect(await screen.findByText(/connected · 3 demo previews/)).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Dismiss notice" }))
    expect(screen.queryByText(/connected · 3 demo previews/)).toBeNull()
  })

  it("confirms a join only after the classroom service responds", async () => {
    const user = userEvent.setup()
    let resolveJoin: ((classroom: ApiClassroom) => void) | undefined
    mockedJoinClassroomByCode.mockImplementation(() => new Promise((resolve) => {
      resolveJoin = resolve
    }))
    renderView()

    const input = await openJoinForm(user)
    await user.type(input, "OWLIO-ABCD")
    await user.click(screen.getByRole("button", { name: /^Join class$/ }))

    expect(await screen.findByRole("button", { name: /Joining/ })).toBeTruthy()
    expect(screen.queryByText(/was added to your class list/)).toBeNull()

    resolveJoin?.(enrolledClassroom)

    expect(await screen.findByText(/was added to your class list/)).toBeTruthy()
    expect(await screen.findByText("Foundations of Biology")).toBeTruthy()
  })

  it("does not submit a second join while a request is in flight", async () => {
    const user = userEvent.setup()
    mockedJoinClassroomByCode.mockImplementation(() => new Promise(() => {}))
    renderView()

    const input = await openJoinForm(user)
    await user.type(input, "OWLIO-ABCD")
    await user.click(screen.getByRole("button", { name: /^Join class$/ }))

    const pendingButton = await screen.findByRole("button", { name: /Joining/ })
    expect((pendingButton as HTMLButtonElement).disabled).toBe(true)
    expect(mockedJoinClassroomByCode).toHaveBeenCalledTimes(1)
  })

  it("keeps the list unchanged and explains the next step when the join fails", async () => {
    const user = userEvent.setup()
    mockedJoinClassroomByCode.mockRejectedValue(new Error("Invite code not found"))
    renderView()

    const input = await openJoinForm(user)
    await user.type(input, "OWLIO-ABCD")
    await user.click(screen.getByRole("button", { name: /^Join class$/ }))

    expect(await screen.findByText("Invite code not found")).toBeTruthy()
    expect(screen.getAllByText("Biology 101").length).toBeGreaterThan(0)
    expect((input as HTMLInputElement).value).toBe("OWLIO-ABCD")
  })
})
