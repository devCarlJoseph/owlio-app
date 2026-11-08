import { Pause, Play, RotateCcw, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatRemaining, type PomodoroMode, type PomodoroStatus, POMODORO_DURATIONS } from "./use-pomodoro"

type PomodoroControls = {
  mode: PomodoroMode
  status: PomodoroStatus
  remainingMs: number
  start: (mode?: PomodoroMode) => void
  pause: () => void
  resume: () => void
  reset: () => void
  selectMode: (mode: PomodoroMode) => void
}

export function PomodoroChip({ timer, onOpen }: { timer: PomodoroControls; onOpen: () => void }) {
  const label =
    timer.status === "idle"
      ? "Focus timer"
      : `${timer.mode === "focus" ? "Focus" : "Break"} ${formatRemaining(timer.remainingMs)}`

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onOpen}
      aria-label={`${label}. Open focus timer`}
      className="rounded-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      <Timer aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
    </Button>
  )
}

export function PomodoroPanel({ timer, onClose }: { timer: PomodoroControls; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="Focus timer"
      className="absolute bottom-16 left-3 z-20 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Timer className="size-4 text-emerald-800" aria-hidden="true" />
          Focus timer
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close focus timer">
          ×
        </Button>
      </div>

      <div role="group" aria-label="Timer mode" className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(["focus", "break"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={timer.mode === mode}
            disabled={timer.status === "running"}
            onClick={() => timer.selectMode(mode)}
            className={`rounded-md px-2 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-700 ${
              timer.mode === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {`${mode === "focus" ? "Focus" : "Break"} · ${POMODORO_DURATIONS[mode] / 60_000}m`}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        {formatRemaining(timer.remainingMs)}
      </p>
      <p className="mt-1 text-center text-xs text-slate-500" role="status">
        {timer.status === "finished"
          ? timer.mode === "focus"
            ? "Focus session complete — take a break."
            : "Break over — ready for another session?"
          : timer.status === "paused"
            ? "Paused"
            : timer.status === "running"
              ? timer.mode === "focus"
                ? "Focusing…"
                : "On a break…"
              : "Ready when you are."}
      </p>

      <div className="mt-3 flex items-center justify-center gap-2">
        {timer.status === "running" ? (
          <Button type="button" size="sm" variant="outline" onClick={timer.pause}>
            <Pause aria-hidden="true" />
            Pause
          </Button>
        ) : timer.status === "paused" ? (
          <Button type="button" size="sm" className="bg-emerald-800 text-white hover:bg-emerald-700" onClick={timer.resume}>
            <Play aria-hidden="true" />
            Resume
          </Button>
        ) : timer.status === "finished" ? (
          <Button
            type="button"
            size="sm"
            className="bg-emerald-800 text-white hover:bg-emerald-700"
            onClick={() => timer.start(timer.mode === "focus" ? "break" : "focus")}
          >
            <Play aria-hidden="true" />
            {timer.mode === "focus" ? "Start break" : "Start focus"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="bg-emerald-800 text-white hover:bg-emerald-700"
            onClick={() => timer.start()}
          >
            <Play aria-hidden="true" />
            Start
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={timer.reset}
          disabled={timer.status === "idle"}
          aria-label="Reset timer"
        >
          <RotateCcw aria-hidden="true" />
          Reset
        </Button>
      </div>
    </div>
  )
}
