import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ClassroomPrototypeProvider } from "./classroom-prototype-provider"
import { ClassroomDetailView } from "./classroom-detail-view"

vi.mock("@/lib/api-mode", () => ({ API_INTEGRATION_ENABLED: false }))

vi.mock("@/components/features/auth/auth-session-context", () => ({
  useAuthSession: () => ({ user: null, signOut: vi.fn() }),
}))

afterEach(cleanup)

function renderDetail(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ClassroomPrototypeProvider>
        <Routes>
          <Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} />
          <Route path="/educators/classrooms/:classroomId" element={<ClassroomDetailView />} />
        </Routes>
      </ClassroomPrototypeProvider>
    </MemoryRouter>,
  )
}

describe("classroom discussion composer", () => {
  it("disables Submit for whitespace and clears the draft on Discard", async () => {
    renderDetail("/students/classrooms/biology-101")
    const box = await screen.findByLabelText("Write a comment for this classroom")
    const submit = screen.getAllByRole("button", { name: "Submit" }).at(-1) as HTMLButtonElement

    expect(submit.disabled).toBe(true)
    fireEvent.change(box, { target: { value: "   " } })
    expect(submit.disabled).toBe(true)

    fireEvent.change(box, { target: { value: "Hello class" } })
    expect(submit.disabled).toBe(false)

    fireEvent.click(screen.getAllByRole("button", { name: "Discard" }).at(-1) as HTMLButtonElement)
    expect((box as HTMLTextAreaElement).value).toBe("")
  })

  it("posts a comment with a safe link and toggles a reaction", async () => {
    renderDetail("/students/classrooms/biology-101")
    const box = await screen.findByLabelText("Write a comment for this classroom")

    fireEvent.change(box, { target: { value: "See https://example.com/doc and javascript:alert(1)" } })
    fireEvent.click(screen.getAllByRole("button", { name: "Submit" }).at(-1) as HTMLButtonElement)

    const link = await screen.findByRole("link", { name: "https://example.com/doc" })
    expect(link.getAttribute("rel")).toBe("noopener noreferrer")
    expect(link.getAttribute("target")).toBe("_blank")
    expect(screen.queryByRole("link", { name: /javascript/ })).toBeNull()

    fireEvent.click(screen.getAllByRole("button", { name: "Add reaction" })[0])
    fireEvent.click(screen.getByRole("button", { name: "Add Thumbs up reaction" }))
    const chip = screen.getByRole("button", { name: "Thumbs up, 1 reaction" })
    expect(chip.getAttribute("aria-pressed")).toBe("true")
  })

  it("renders the same discussion view for educators", async () => {
    renderDetail("/educators/classrooms/biology-101")
    expect(await screen.findByLabelText("Write a comment for this classroom")).toBeTruthy()
  })
})
