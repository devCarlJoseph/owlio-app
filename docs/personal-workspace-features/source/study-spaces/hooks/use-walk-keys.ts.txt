import { useCallback, useEffect, useRef } from "react"
import type { Camera } from "three"

export type WalkKey = "up" | "down" | "left" | "right"

const KEY_CODES: Record<string, WalkKey> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target.closest("[role='dialog'], [role='menu'], [role='listbox']")) return true
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

// Held movement keys (WASD/arrows) plus on-screen pad presses, read every frame by the scene.
export function useWalkKeys(enabled: boolean, onPress?: () => void) {
  const heldRef = useRef(new Set<WalkKey>())
  const onPressRef = useRef(onPress)

  useEffect(() => {
    onPressRef.current = onPress
  }, [onPress])

  useEffect(() => {
    const keys = heldRef.current
    if (!enabled) {
      keys.clear()
      return
    }

    function down(event: KeyboardEvent) {
      const key = KEY_CODES[event.code]
      if (!key || event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return
      event.preventDefault()
      if (!keys.has(key)) onPressRef.current?.()
      keys.add(key)
    }
    function up(event: KeyboardEvent) {
      const key = KEY_CODES[event.code]
      if (key) keys.delete(key)
    }
    function clear() {
      keys.clear()
    }

    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", clear)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", clear)
      keys.clear()
    }
  }, [enabled])

  const setPad = useCallback((key: WalkKey, pressed: boolean) => {
    if (pressed) {
      if (!heldRef.current.has(key)) onPressRef.current?.()
      heldRef.current.add(key)
    } else {
      heldRef.current.delete(key)
    }
  }, [])

  return { heldRef, setPad }
}

// Converts heldRef keys into a ground-plane direction relative to where the camera looks.
export function walkDirection(keys: Set<WalkKey>, camera: Camera, target: { x: number; z: number }) {
  const forward = (keys.has("up") ? 1 : 0) - (keys.has("down") ? 1 : 0)
  const strafe = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0)
  if (forward === 0 && strafe === 0) return null

  let fx = target.x - camera.position.x
  let fz = target.z - camera.position.z
  const length = Math.hypot(fx, fz) || 1
  fx /= length
  fz /= length

  const x = fx * forward - fz * strafe
  const z = fz * forward + fx * strafe
  const size = Math.hypot(x, z) || 1
  return { x: x / size, z: z / size }
}
