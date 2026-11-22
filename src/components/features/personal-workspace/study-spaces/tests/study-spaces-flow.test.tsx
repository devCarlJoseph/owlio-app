import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudySpacesView } from "../view/study-spaces-view"
import { studySpacesStorageKey, type StudySpaceRecord } from "../utils/study-spaces-records"
import { AuthSessionContext, type AuthSessionContextValue } from "@/components/features/auth/context/auth-session-context"
import { createStudySpace, getStudySpaces, joinStudySpace } from "@/services/api/study-space.service"

vi.mock("@/services/api/study-space.service", () => ({
  createStudySpace: vi.fn(),
  getStudySpaces: vi.fn(),
  getDiscoverableStudySpaces: vi.fn(async () => []),
  joinStudySpace: vi.fn(),
}))

vi.setConfig({ testTimeout: 20000 })

afterEach(cleanup)

beforeEach(() => {
  window.localStorage.clear()
  vi.resetAllMocks()
})

const accountId = "11111111-1111-4111-8111-111111111111"
const session: AuthSessionContextValue = {
  status: "authenticated",
  user: { id: accountId, name: "Sam", email: "sam@example.test", roles: ["STUDENT"], status: "ACTIVE", emailVerifiedAt: null, createdAt: "2026-01-01T00:00:00Z" },
  error: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  refreshCurrentUser: vi.fn(),
}
const sharedSpace: StudySpaceRecord = {
  id: "22222222-2222-4222-8222-222222222222", name: "Peer study", about: "", kind: "collaborative", capacity: 4, role: "owner", createdAt: "",
}

function renderList(account = false, path = "/students/study-spaces") {
  const router = (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/students" element={<h1>Student home</h1>} />
        <Route path="/students/study-spaces" element={<StudySpacesView />} />
        <Route path="/students/study-spaces/:spaceId" element={<div>study room route</div>} />
      </Routes>
    </MemoryRouter>
  )
  return render(account ? <AuthSessionContext.Provider value={session}>{router}</AuthSessionContext.Provider> : router)
}

describe("study spaces create flow", () => {
  it("keeps Exit available in both hall views and returns to student home", async () => {
    const user = userEvent.setup()
    renderList()

    expect(screen.getByRole("link", { name: "Exit" }).getAttribute("href")).toBe("/students")
    await user.click(screen.getByRole("button", { name: "World" }))
    await user.click(screen.getByRole("link", { name: "Exit" }))

    expect(screen.getByRole("heading", { name: "Student home" })).toBeTruthy()
  })

  it("creates a space with a room type and seats, then opens the room", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: "Create space" }))
    const dialog = screen.getByRole("dialog")

    await user.type(within(dialog).getByLabelText("Space name"), "Exam Crew")
    await user.click(within(dialog).getByRole("radio", { name: /Focused desks/ }))
    await user.click(within(dialog).getByRole("button", { name: "Increase seats" }))
    await user.click(within(dialog).getByRole("button", { name: "Increase seats" }))
    await user.click(within(dialog).getByRole("button", { name: /Create space/ }))

    expect(screen.getByText("study room route")).toBeTruthy()

    const stored = window.localStorage.getItem(studySpacesStorageKey)
    expect(stored).toBeTruthy()
    const records = JSON.parse(stored as string) as { kind: string; capacity: number; name: string }[]
    const created = records.find((record) => record.name === "Exam Crew")
    expect(created?.kind).toBe("focused")
    expect(created?.capacity).toBe(6)
  })

  it("links each space entry to its room route", () => {
    renderList()

    const spaceLink = screen.getByRole("link", { name: /Open Physics Group/ })
    expect(spaceLink.getAttribute("href")).toBe("/students/study-spaces/sample-space-physics")
  })

  it("shows room layout and seat count on each space card", () => {
    renderList()

    const createdList = screen.getByRole("list", { name: "Spaces you've created" })
    expect(createdList.textContent).toContain("Shared tables · 6 seats")
    expect(createdList.textContent).toContain("browser only")
  })

  it("removes a created space from the browser after confirming", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: "More actions for Physics Group" }))
    const menu = await screen.findByRole("menu")
    await user.click(within(menu).getByRole("menuitem", { name: "Remove from this browser" }))

    const confirm = screen.getByRole("dialog")
    expect(confirm.textContent).toContain("local previews")
    await user.click(within(confirm).getByRole("button", { name: "Remove space" }))

    expect(screen.queryByRole("link", { name: /Open Physics Group/ })).toBeNull()

    const stored = window.localStorage.getItem(studySpacesStorageKey)
    const records = JSON.parse(stored as string) as { id: string }[]
    expect(records.some((record) => record.id === "sample-space-physics")).toBe(false)
  })
})

describe("shared study spaces", () => {
  it("creates a shared room without inserting it into the local directory", async () => {
    vi.mocked(getStudySpaces).mockResolvedValue([])
    vi.mocked(createStudySpace).mockResolvedValue(sharedSpace)
    const user = userEvent.setup()
    renderList(true)

    await user.click(screen.getByRole("button", { name: "Create space" }))
    const form = within(screen.getByRole("dialog"))
    await user.type(form.getByLabelText("Space name"), "Peer study")
    await user.click(form.getByRole("radio", { name: "Study lounge" }))
    await user.click(form.getByRole("button", { name: "Increase seats" }))
    await user.click(form.getByRole("button", { name: "Create space" }))

    expect(await screen.findByText("study room route")).toBeTruthy()
    expect(createStudySpace).toHaveBeenCalledWith("Peer study", "", { name: "Peer study", about: "", kind: "lounge", capacity: 5 })
    expect(JSON.parse(localStorage.getItem(studySpacesStorageKey) ?? "[]")).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: sharedSpace.id })]))
  })

  it("opens a reusable invitation link with its short code prefilled", async () => {
    vi.mocked(getStudySpaces).mockResolvedValue([])
    vi.mocked(joinStudySpace).mockResolvedValue({ ...sharedSpace, role: "member" })
    const user = userEvent.setup()
    renderList(true, "/students/study-spaces#join=SPS-OWLIO-XW2A")
    const dialog = within(screen.getByRole("dialog", { name: "Join a study space" }))
    expect((dialog.getByLabelText("Invitation code") as HTMLInputElement).value).toBe("SPS-OWLIO-XW2A")
    await user.click(dialog.getByRole("button", { name: "Join space" }))
    expect(await screen.findByText("study room route")).toBeTruthy()
    expect(joinStudySpace).toHaveBeenCalledWith("SPS-OWLIO-XW2A")
  })

  it("opens the accepted room with the exact invitation code", async () => {
    vi.mocked(getStudySpaces).mockResolvedValue([sharedSpace])
    vi.mocked(joinStudySpace).mockResolvedValue({ ...sharedSpace, role: "member" })
    const user = userEvent.setup()
    renderList(true)

    expect(await screen.findByRole("link", { name: "Open Peer study" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Join by code" }))
    const dialog = within(screen.getByRole("dialog"))
    const input = dialog.getByLabelText("Invitation code")
    await user.type(input, "wrong")
    await user.click(dialog.getByRole("button", { name: "Join space" }))
    expect(await dialog.findByRole("alert")).toBeTruthy()
    expect(joinStudySpace).not.toHaveBeenCalled()

    const code = "owlio-sps-a7k2"
    await user.clear(input)
    await user.type(input, ` ${code} `)
    await user.click(dialog.getByRole("button", { name: "Join space" }))
    expect(await screen.findByText("study room route")).toBeTruthy()
    expect(joinStudySpace).toHaveBeenCalledWith(code)
  })

  it("preserves the local joined-room flow for a signed-in student", async () => {
    vi.mocked(getStudySpaces).mockResolvedValue([])
    const user = userEvent.setup()
    renderList(true)

    await user.click(screen.getByRole("button", { name: "Add a browser-only joined room" }))
    const dialog = within(screen.getByRole("dialog"))
    await user.type(dialog.getByLabelText("Space name"), "Offline circle")
    await user.click(dialog.getByRole("button", { name: "Join space" }))

    expect(await screen.findByRole("link", { name: "Open Offline circle" })).toBeTruthy()
    expect(joinStudySpace).not.toHaveBeenCalled()
    expect(JSON.parse(localStorage.getItem(studySpacesStorageKey) ?? "[]")).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "Offline circle", role: "member" }),
    ]))
  })
})

// Supply explicit test data instead of relying on production demo seeds.
vi.mock('../utils/study-spaces-records', async importOriginal => {
  const actual = await importOriginal<typeof import('../utils/study-spaces-records')>()
  const fixtures = await import('@/test/legacy-demo-fixtures')
  return { ...actual, sampleCreatedSpaces: fixtures.sampleCreatedSpaces, sampleJoinedSpaces: fixtures.sampleJoinedSpaces, sampleDiscoverySpaces: fixtures.sampleDiscoverySpaces, loadStudySpaces: () => JSON.parse(localStorage.getItem(actual.studySpacesStorageKey) ?? JSON.stringify([...fixtures.sampleCreatedSpaces, ...fixtures.sampleJoinedSpaces])) }
})
