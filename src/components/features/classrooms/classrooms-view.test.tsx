import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
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

  it("separates service-confirmed classes from demo previews", async () => {
    mockedGetClassrooms.mockResolvedValue([enrolledClassroom])
    renderView()

    expect(await screen.findByText("Foundations of Biology")).toBeTruthy()
    expect(screen.getByText("Your connected classes")).toBeTruthy()
    expect(screen.getByText("Demo previews")).toBeTruthy()
    expect(screen.getByText("Connected")).toBeTruthy()
    expect(screen.getAllByText("Demo preview").length).toBeGreaterThan(0)
    expect(screen.getByText(/not real enrollments/)).toBeTruthy()
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
    expect(screen.getByText("No connected classes yet")).toBeTruthy()
    expect((input as HTMLInputElement).value).toBe("OWLIO-ABCD")
  })
})
