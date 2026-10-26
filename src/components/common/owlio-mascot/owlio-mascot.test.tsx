import { act, cleanup, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OwlioMascot } from "./owlio-mascot"

const disconnect = vi.fn()
let visibilityCallback: IntersectionObserverCallback
const media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }

beforeEach(() => {
  media.matches = false
  vi.stubGlobal("matchMedia", vi.fn(() => media))
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { visibilityCallback = callback }
    observe = vi.fn()
    disconnect = disconnect
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("OwlioMascot", () => {
  it("isolates vector definitions between instances and hides decorative artwork", () => {
    const { container } = render(<><OwlioMascot /><OwlioMascot /></>)
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const element of container.querySelectorAll('[fill^="url"]')) {
      const id = element.getAttribute("fill")!.slice(5, -1)
      expect(ids).toContain(id)
    }
    expect(container.querySelectorAll('.owlio-mascot[aria-hidden="true"]')).toHaveLength(2)
    expect(container.querySelectorAll("button, a, [tabindex]")).toHaveLength(0)
  })

  it.each(["welcome", "selection", "next"] as const)("settles %s to idle and replays with a new key", (state) => {
    const { container, rerender } = render(<OwlioMascot state={state} replayKey={0} />)
    const scene = () => container.querySelector(".owlio-mascot-scene")!
    fireEvent.animationEnd(container.querySelector('[data-part="wing-right"]')!)
    expect(scene().getAttribute("data-state")).toBe(state)
    fireEvent.animationEnd(container.querySelector('[data-part="interaction"]')!)
    expect(scene().getAttribute("data-state")).toBe("idle")
    rerender(<OwlioMascot state={state} replayKey={1} />)
    expect(scene().getAttribute("data-state")).toBe(state)
  })

  it("keeps the completion pose after the celebration ends", () => {
    const { container } = render(<OwlioMascot state="complete" />)
    fireEvent.animationEnd(container.querySelector('[data-part="interaction"]')!)
    expect(container.querySelector(".owlio-mascot-scene")!.getAttribute("data-state")).toBe("complete")
  })

  it("tracks changes to the reduced-motion preference", () => {
    media.matches = true
    const { container } = render(<OwlioMascot />)
    const mascot = container.querySelector<HTMLElement>(".owlio-mascot")!
    expect(mascot.dataset.reducedMotion).toBe("true")
    media.matches = false
    act(() => media.addEventListener.mock.calls[0][1]())
    expect(mascot.dataset.reducedMotion).toBe("false")
  })

  it("pauses offscreen and hidden motion and removes subscriptions on unmount", () => {
    const removeListener = vi.spyOn(document, "removeEventListener")
    const { container, unmount } = render(<OwlioMascot />)
    const removeAnimationListener = vi.spyOn(container.querySelector(".owlio-mascot-scene")!, "removeEventListener")
    const mascot = container.querySelector<HTMLElement>(".owlio-mascot")!
    act(() => visibilityCallback([{ isIntersecting: false }] as IntersectionObserverEntry[], {} as IntersectionObserver))
    expect(mascot.dataset.motion).toBe("paused")
    act(() => visibilityCallback([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver))
    expect(mascot.dataset.motion).toBe("running")
    vi.spyOn(document, "hidden", "get").mockReturnValue(true)
    fireEvent(document, new Event("visibilitychange"))
    expect(mascot.dataset.motion).toBe("paused")
    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(removeListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function))
    expect(media.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function))
    expect(removeAnimationListener).toHaveBeenCalledWith("animationend", expect.any(Function))
  })
})
