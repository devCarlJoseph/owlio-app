import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import { ClassroomPrototypeProvider } from "./classroom-prototype-provider"
import { ClassroomsView } from "./classrooms-view"

afterEach(cleanup)

function renderView() {
  return render(
    <MemoryRouter initialEntries={["/students/classrooms"]}>
      <ClassroomPrototypeProvider>
        <ClassroomsView />
      </ClassroomPrototypeProvider>
    </MemoryRouter>,
  )
}

describe("My Classes join dialog accessibility", () => {
  it("opens a labelled dialog and returns focus to the trigger when it is discarded", async () => {
    const user = userEvent.setup()
    renderView()

    const toggle = screen.getAllByRole("button", { name: /join a class/i })[0]
    expect(toggle.getAttribute("aria-haspopup")).toBe("dialog")

    await user.click(toggle)

    const dialog = await screen.findByRole("dialog", { name: /join a classroom/i })
    expect(dialog).toBeTruthy()

    await user.click(screen.getByRole("button", { name: /discard/i }))

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(toggle))
  })

  it("marks the code field invalid and keeps focus in it when a code cannot be verified", async () => {
    const user = userEvent.setup()
    renderView()

    await user.click(screen.getAllByRole("button", { name: /join a class/i })[0])
    const input = await screen.findByLabelText("Classroom invite code")
    await user.type(input, "OWLIO-NOT-A-CODE")
    await user.click(screen.getByRole("button", { name: /^Join class$/ }))

    const alert = await screen.findByRole("alert")
    expect(alert.textContent).toMatch(/not verified in preview mode/i)
    expect(input.getAttribute("aria-invalid")).toBe("true")
    expect(document.activeElement).toBe(input)
  })
})
