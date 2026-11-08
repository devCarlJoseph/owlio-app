import { useEffect, useRef, useState } from "react"

export type PomodoroMode = "focus" | "break"
export type PomodoroStatus = "idle" | "running" | "paused" | "finished"

export const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60 * 1000,
  break: 5 * 60 * 1000,
}

export type PomodoroState = {
  mode: PomodoroMode
  status: PomodoroStatus
  remainingMs: number
}

// Remaining time is derived from an absolute end timestamp, so countdown drift
// never accumulates from interval timing.
export function usePomodoro() {
  const [mode, setMode] = useState<PomodoroMode>("focus")
  const [status, setStatus] = useState<PomodoroStatus>("idle")
  const [remainingMs, setRemainingMs] = useState(POMODORO_DURATIONS.focus)
  const endsAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (status !== "running" || endsAtRef.current === null) return

    const tick = () => {
      const remaining = (endsAtRef.current ?? 0) - Date.now()
      if (remaining <= 0) {
        setRemainingMs(0)
        setStatus("finished")
      } else {
        setRemainingMs(remaining)
      }
    }

    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [status])

  function start(nextMode: PomodoroMode = mode) {
    setMode(nextMode)
    endsAtRef.current = Date.now() + POMODORO_DURATIONS[nextMode]
    setRemainingMs(POMODORO_DURATIONS[nextMode])
    setStatus("running")
  }

  function pause() {
    if (status !== "running") return
    setRemainingMs(Math.max(0, (endsAtRef.current ?? 0) - Date.now()))
    setStatus("paused")
  }

  function resume() {
    if (status !== "paused") return
    endsAtRef.current = Date.now() + remainingMs
    setStatus("running")
  }

  function reset() {
    endsAtRef.current = null
    setRemainingMs(POMODORO_DURATIONS[mode])
    setStatus("idle")
  }

  function selectMode(nextMode: PomodoroMode) {
    if (status === "running") return
    setMode(nextMode)
    endsAtRef.current = null
    setRemainingMs(POMODORO_DURATIONS[nextMode])
    setStatus("idle")
  }

  return { mode, status, remainingMs, start, pause, resume, reset, selectMode }
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
