import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ClassroomPrototypeProvider } from "./classroom-prototype-provider"
import { ClassroomDetailView } from "./classroom-detail-view"

vi.mock("@/lib/api-mode", () => ({ API_INTEGRATION_ENABLED: false }))

vi.mock("@/components/features/auth/auth-session-context", () => ({
  useAuthSession: () => ({ user: null, signOut: vi.fn() }),
}))

window.HTMLElement.prototype.scrollTo = vi.fn()
window.matchMedia = window.matchMedia ?? ((query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia

afterEach(cleanup)

function renderChat(role: "students" | "educators") {
  return render(
    <MemoryRouter initialEntries={[`/${role}/classrooms/biology-101?tab=chat`]}>
      <ClassroomPrototypeProvider>
        <Routes>
          <Route path="/:role/classrooms/:classroomId" element={<ClassroomDetailView />} />
        </Routes>
      </ClassroomPrototypeProvider>
    </MemoryRouter>,
  )
}

describe("classroom chat", () => {
  it("guards empty sends and sends a message with a safe link", async () => {
    renderChat("students")
    const box = await screen.findByLabelText("Message this class")
    const send = screen.getByRole("button", { name: "Send class chat message" }) as HTMLButtonElement

    expect(send.disabled).toBe(true)
    fireEvent.change(box, { target: { value: "   " } })
    expect(send.disabled).toBe(true)

    fireEvent.change(box, { target: { value: "Notes https://example.com/a javascript:alert(1)" } })
    fireEvent.keyDown(box, { key: "Enter" })

    const link = await screen.findByRole("link", { name: "https://example.com/a" })
    expect(link.getAttribute("rel")).toBe("noopener noreferrer")
    expect(screen.queryByRole("link", { name: /javascript/ })).toBeNull()
    expect((box as HTMLTextAreaElement).value).toBe("")
  })

  it("does not send on Shift+Enter", async () => {
    renderChat("educators")
    const box = await screen.findByLabelText("Message this class")
    fireEvent.change(box, { target: { value: "draft" } })
    fireEvent.keyDown(box, { key: "Enter", shiftKey: true })
    expect((box as HTMLTextAreaElement).value).toBe("draft")
  })

  it("replies to another person's message with a quoted preview", async () => {
    renderChat("students")
    fireEvent.click((await screen.findAllByRole("button", { name: /^Reply to (?!You)/ }))[0])

    expect(screen.getByText(/^Replying to /)).toBeTruthy()
    const box = screen.getByLabelText("Message this class")
    fireEvent.change(box, { target: { value: "Good point" } })
    fireEvent.keyDown(box, { key: "Enter" })

    expect(await screen.findByRole("button", { name: /Go to original message/ })).toBeTruthy()
    expect(screen.queryByText(/^Replying to /)).toBeNull()
  })

  it("cancels a pending reply", async () => {
    renderChat("educators")
    fireEvent.click((await screen.findAllByRole("button", { name: /^Reply to / }))[0])
    fireEvent.click(screen.getByRole("button", { name: "Cancel reply" }))
    expect(screen.queryByText(/^Replying to /)).toBeNull()
  })

  it("filters messages with search and toggles a reaction", async () => {
    renderChat("students")
    fireEvent.click(await screen.findByRole("button", { name: "Search messages" }))
    fireEvent.change(screen.getByLabelText("Search messages in this class chat"), { target: { value: "zzzz-none" } })
    expect(screen.getByText("No messages match your search.")).toBeTruthy()

    fireEvent.change(screen.getByLabelText("Search messages in this class chat"), { target: { value: "" } })
    fireEvent.click(screen.getAllByRole("button", { name: "Add reaction" })[0])
    fireEvent.click(screen.getByRole("button", { name: "Add Thumbs up reaction" }))
    expect(screen.getByRole("button", { name: "Thumbs up, 1 reaction" }).getAttribute("aria-pressed")).toBe("true")
  })
})
