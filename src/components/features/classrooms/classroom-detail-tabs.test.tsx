import { cleanup, render, screen } from "@testing-library/react"
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
        </Routes>
      </ClassroomPrototypeProvider>
    </MemoryRouter>,
  )
}

describe("classroom detail deep links", () => {
  it("opens the classwork tab when the card shortcut adds ?tab=classwork", async () => {
    renderDetail("/students/classrooms/biology-101?tab=classwork")

    const classworkTab = await screen.findByRole("tab", { name: /Classwork/ })
    expect(classworkTab.getAttribute("aria-selected")).toBe("true")
  })

  it("opens the materials tab when the card shortcut adds ?tab=materials", async () => {
    renderDetail("/students/classrooms/biology-101?tab=materials")

    const materialsTab = await screen.findByRole("tab", { name: /Materials/ })
    expect(materialsTab.getAttribute("aria-selected")).toBe("true")
  })

  it("falls back to the feed when the tab is unknown", async () => {
    renderDetail("/students/classrooms/biology-101?tab=not-a-tab")

    const feedTab = await screen.findByRole("tab", { name: /Feed/ })
    expect(feedTab.getAttribute("aria-selected")).toBe("true")
  })
})
