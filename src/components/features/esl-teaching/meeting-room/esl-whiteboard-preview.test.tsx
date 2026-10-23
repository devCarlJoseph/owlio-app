import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import EslWhiteboardPreview from "./esl-whiteboard-preview"
import { shouldShowEslWhiteboardPreview } from "./esl-whiteboard-preview-route"

afterEach(cleanup)

function renderBoard() {
  return render(
    <MemoryRouter>
      <EslWhiteboardPreview />
    </MemoryRouter>,
  )
}

describe("ESL whiteboard preview", () => {
  it("is only enabled for the ESL workspace preview flag", () => {
    expect(shouldShowEslWhiteboardPreview("esl", "1")).toBe(true)
    expect(shouldShowEslWhiteboardPreview("esl", null)).toBe(false)
    expect(shouldShowEslWhiteboardPreview("educators", "1")).toBe(false)
  })

  it("labels the board as a local preview and shows the teaching layout", () => {
    renderBoard()

    expect(screen.getByRole("heading", { name: "ESL Meeting Room" })).toBeTruthy()
    expect(screen.getByRole("status").textContent).toContain("not shared or saved")
    expect(screen.getByRole("complementary", { name: "Library" })).toBeTruthy()
    expect(screen.getByRole("toolbar", { name: "Whiteboard tools" })).toBeTruthy()
    expect(screen.getByText("1 / 2")).toBeTruthy()
  })

  it("adds library content to the board and supports undo and redo", () => {
    renderBoard()

    fireEvent.click(screen.getByRole("button", { name: "Add Sun clipart" }))
    expect(screen.getByRole("button", { name: /^Clipart.*by Teacher$/ })).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: /^Undo/ }))
    expect(screen.queryByRole("button", { name: /^Clipart.*by Teacher$/ })).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: /^Redo/ }))
    expect(screen.getByRole("button", { name: /^Clipart.*by Teacher$/ })).toBeTruthy()
  })

  it("lets the teacher add and navigate pages", () => {
    renderBoard()

    fireEvent.click(screen.getByRole("button", { name: "Add page" }))
    expect(screen.getByText("3 / 3")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }))
    expect(screen.getByText("2 / 3")).toBeTruthy()
  })

  it("lets the teacher delete a selected item with the keyboard", () => {
    renderBoard()
    const sticky = screen.getByRole("button", { name: /Sticky note.*How are you today\?/ })

    fireEvent.focus(sticky)
    fireEvent.keyDown(sticky, { key: "Delete" })

    expect(screen.queryByRole("button", { name: /Sticky note.*How are you today\?/ })).toBeNull()
  })

  it("limits learners to their own tools and cannot remove teacher content", () => {
    renderBoard()

    fireEvent.click(screen.getByRole("button", { name: "learner" }))

    expect(screen.queryByRole("complementary", { name: "Library" })).toBeNull()
    expect(screen.queryByRole("button", { name: /^Sticky note \(N\)/ })).toBeNull()
    expect(screen.getByRole("button", { name: /^Text \(T\)/ })).toBeTruthy()
    expect(screen.queryByRole("button", { name: /^Highlighter/ })).toBeNull()
    expect(screen.queryByRole("button", { name: "Clear page" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Add page" })).toBeNull()

    const sticky = screen.getByRole("button", { name: /Sticky note.*How are you today\?/ })
    fireEvent.focus(sticky)
    fireEvent.keyDown(sticky, { key: "Delete" })

    expect(screen.getByRole("button", { name: /Sticky note.*How are you today\?/ })).toBeTruthy()
  })

  it("draws attributed pen strokes on the surface", () => {
    const { container } = renderBoard()
    const surface = screen.getByTestId("board-surface")
    const strokes = () => container.querySelectorAll('g[data-item-kind="stroke"]').length
    const before = strokes()

    fireEvent.click(screen.getByRole("button", { name: /^Pen/ }))
    fireEvent.pointerDown(surface, { button: 0, buttons: 1, pointerId: 1, clientX: 300, clientY: 500 })
    fireEvent.pointerMove(surface, { buttons: 1, pointerId: 1, clientX: 340, clientY: 520 })
    fireEvent.pointerMove(surface, { buttons: 1, pointerId: 1, clientX: 380, clientY: 540 })
    fireEvent.pointerUp(surface, { pointerId: 1, clientX: 380, clientY: 540 })

    expect(strokes()).toBe(before + 1)
    expect(container.querySelector('g[data-item-kind="stroke"][data-author="teacher"]:last-of-type')).toBeTruthy()
  })
})
