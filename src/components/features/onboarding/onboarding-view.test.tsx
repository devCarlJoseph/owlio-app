import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OnboardingView } from "./onboarding-view"

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("onboarding mascot integration", () => {
  it("reacts once per new choice and only hops after successful validation", async () => {
    const { container } = render(<OnboardingView />)
    const scene = () => container.querySelector(".owlio-mascot-scene")!
    expect(scene().getAttribute("data-state")).toBe("welcome")
    fireEvent.click(screen.getByRole("radio", { name: /^Student:/ }))
    expect(scene().getAttribute("data-state")).toBe("selection")
    const firstSelection = scene()
    fireEvent.click(screen.getByRole("radio", { name: /^Student:/ }))
    expect(scene()).toBe(firstSelection)
    fireEvent.click(screen.getByRole("radio", { name: /^Educator:/ }))
    expect(scene()).not.toBe(firstSelection)
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByRole("heading", { name: "A little about you" })
    expect(scene().getAttribute("data-state")).toBe("next")
    fireEvent.animationEnd(container.querySelector('[data-part="interaction"]')!)
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByText("Enter your name.")
    expect(scene().getAttribute("data-state")).toBe("idle")
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Preview learner" } })
    expect(scene().getAttribute("data-state")).toBe("idle")
    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    await screen.findByRole("heading", { name: "Let's make Owlio yours" })
    expect((screen.getByRole("radio", { name: /^Educator:/ }) as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await waitFor(() => expect((screen.getByLabelText("Display name") as HTMLInputElement).value).toBe("Preview learner"))
  })

  it("reacts to detail choices and celebrates the existing local completion", async () => {
    const { container } = render(<OnboardingView />)
    const scene = () => container.querySelector(".owlio-mascot-scene")!
    fireEvent.click(screen.getByRole("radio", { name: /^Others:/ }))
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByLabelText("Display name")
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Preview teacher" } })
    fireEvent.change(screen.getByLabelText("Preferred language"), { target: { value: "English" } })
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByRole("radio", { name: "Online tutor" })
    fireEvent.click(screen.getByRole("radio", { name: "Online tutor" }))
    expect(scene().getAttribute("data-state")).toBe("selection")
    fireEvent.change(screen.getByLabelText("Languages or subjects taught"), { target: { value: "Math" } })
    fireEvent.keyDown(screen.getByLabelText("Languages or subjects taught"), { key: "Enter" })
    fireEvent.click(screen.getByRole("checkbox", { name: "One-on-one" }))
    expect(scene().getAttribute("data-state")).toBe("selection")
    const selection = scene()
    fireEvent.click(screen.getByRole("checkbox", { name: "One-on-one" }))
    expect(scene()).toBe(selection)
    fireEvent.click(screen.getByRole("checkbox", { name: "One-on-one" }))
    expect(scene()).not.toBe(selection)
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    await screen.findByRole("heading", { name: "Take a look" })
    fireEvent.click(screen.getByRole("button", { name: "Finish" }))
    await screen.findByRole("heading", { name: "Flexible learning starts here" })
    expect(scene().getAttribute("data-state")).toBe("complete")
    expect((screen.getByRole("button", { name: "Educator dashboard" }) as HTMLButtonElement).disabled).toBe(true)
  })
})
