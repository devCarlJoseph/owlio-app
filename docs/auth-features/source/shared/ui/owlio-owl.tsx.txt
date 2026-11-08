import { useEffect, useRef, type CSSProperties } from "react"
import { cn } from "cn"

type OwlioOwlProps = {
  className?: string
}

const image = { src: "/mascot/owlio-owl.png", width: 385, height: 420 }

const eyes = [
  { side: "left", cx: 143, cy: 169, rx: 35, ry: 34 },
  { side: "right", cx: 245.5, cy: 141.5, rx: 29, ry: 33 },
] as const

const percent = (value: number) => `${(value * 100).toFixed(3)}%`
const clamp = (value: number) => Math.max(-1, Math.min(1, value))

function eyeGeometry({ cx, cy, rx, ry }: (typeof eyes)[number]) {
  const left = cx - rx
  const top = cy - ry
  const width = rx * 2
  const height = ry * 2

  return {
    eye: { left: percent(left / image.width), top: percent(top / image.height), width: percent(width / image.width), height: percent(height / image.height) } satisfies CSSProperties,
    iris: { left: percent(-left / width), top: percent(-top / height), width: percent(image.width / width), height: percent(image.height / height) } satisfies CSSProperties,
  }
}

export function OwlioOwl({ className }: OwlioOwlProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timers = new Set<number>()
    const later = (callback: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        callback()
      }, delay)
      timers.add(id)
    }

    const blink = (again: boolean) => {
      root.dataset.blink = "true"
      later(() => {
        delete root.dataset.blink
        if (again) later(() => blink(false), 170)
      }, 130)
    }

    const scheduleBlink = () => later(() => {
      blink(Math.random() < 0.25)
      scheduleBlink()
    }, 2200 + Math.random() * 3600)

    let frame = 0
    let pointerX = 0
    let pointerY = 0

    const look = (x: number, y: number) => {
      root.style.setProperty("--gaze-x", x.toFixed(3))
      root.style.setProperty("--gaze-y", y.toFixed(3))
    }

    const update = () => {
      frame = 0
      const rect = root.getBoundingClientRect()
      look(
        clamp((pointerX - (rect.left + rect.width * 0.5)) / (window.innerWidth * 0.4)),
        clamp((pointerY - (rect.top + rect.height * 0.37)) / (window.innerHeight * 0.4)),
      )
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const rest = () => look(0, 0)

    scheduleBlink()
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", rest)

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      window.cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onPointerMove)
      document.documentElement.removeEventListener("pointerleave", rest)
      delete root.dataset.blink
      rest()
    }
  }, [])

  return (
    <div ref={rootRef} className={cn("group/owl pointer-events-none relative aspect-[385/420] select-none [-webkit-user-drag:none]", className)} aria-hidden="true" onDragStart={(event) => event.preventDefault()}>
      <img src={image.src} width={image.width} height={image.height} alt="" draggable={false} className="absolute inset-0 size-full drop-shadow-[0_18px_30px_rgba(23,37,84,0.35)]" />
      {eyes.map((eye) => {
        const geometry = eyeGeometry(eye)
        return (
          <span key={eye.side} className="absolute overflow-hidden rounded-full bg-[#f6f4fb]" style={geometry.eye}>
            <img src={image.src} alt="" draggable={false} className="absolute max-w-none translate-x-[calc(var(--gaze-x,0)*1.25%)] translate-y-[calc(var(--gaze-y,0)*0.9%)] transition-transform duration-200 ease-out motion-reduce:transition-none" style={geometry.iris} />
            <span className="absolute -left-[4%] -right-[4%] -top-[2%] h-[62%] -translate-y-[104%] rounded-b-[50%_46%] border-b-[3px] border-[#1e1b3a] bg-linear-to-b from-[#d9d2e4] via-[#ece6ef] via-70% to-[#f3eef3] transition-transform duration-100 ease-in-out group-data-[blink=true]/owl:translate-y-0 group-data-[blink=true]/owl:duration-75 motion-reduce:transition-none" />
            <span className="absolute -bottom-[2%] -left-[4%] -right-[4%] h-[46%] translate-y-[104%] bg-linear-to-t from-[#fdf8f6] to-[#f6f0f3] transition-transform duration-100 ease-in-out group-data-[blink=true]/owl:translate-y-0 group-data-[blink=true]/owl:duration-75 motion-reduce:transition-none" />
          </span>
        )
      })}
    </div>
  )
}
