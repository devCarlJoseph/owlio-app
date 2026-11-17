import { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { OwlioMascotArtwork } from "./owlio-mascot-artwork"

export type OwlioMascotState = "idle" | "welcome" | "selection" | "next" | "complete" | "flying"

type OwlioMascotProps = {
  state?: OwlioMascotState
  replayKey?: string | number
  size?: number | string
  className?: string
}

function MascotScene({ state, id }: { state: OwlioMascotState; id: string }) {
  const [settled, setSettled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const settle = (event: AnimationEvent) => {
      if (state !== "flying" && event.target instanceof Element && event.target.getAttribute("data-part") === "interaction") {
        setSettled(true)
      }
    }
    element.addEventListener("animationend", settle)
    return () => element.removeEventListener("animationend", settle)
  }, [state])

  return (
    <div ref={ref} className="owlio-mascot-scene group/scene size-full" data-state={settled && state !== "complete" ? "idle" : state}>
      <OwlioMascotArtwork id={id} />
    </div>
  )
}

export function OwlioMascot({ state = "idle", replayKey = 0, size = 240, className }: OwlioMascotProps) {
  const id = useId().replace(/:/g, "")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const reducedMotion = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
    let isVisible = true
    const updateMotion = () => {
      element.dataset.motion = document.hidden || !isVisible ? "paused" : "running"
      element.dataset.reducedMotion = String(reducedMotion?.matches ?? true)
    }
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      updateMotion()
    })
    observer?.observe(element)
    document.addEventListener("visibilitychange", updateMotion)
    reducedMotion?.addEventListener("change", updateMotion)
    updateMotion()

    return () => {
      observer?.disconnect()
      document.removeEventListener("visibilitychange", updateMotion)
      reducedMotion?.removeEventListener("change", updateMotion)
    }
  }, [])

  return (
    <div ref={ref} className={cn("owlio-mascot aspect-square max-w-full shrink-0 pointer-events-none select-none data-[motion=paused]:[&_*]:[animation-play-state:paused]! data-[reduced-motion=true]:[&_*]:animate-none! motion-reduce:[&_*]:animate-none!", className)} style={{ width: size }} aria-hidden="true">
      <MascotScene key={`${state}-${replayKey}`} state={state} id={`owlio-${id}`} />
    </div>
  )
}
