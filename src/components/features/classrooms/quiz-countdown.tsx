import { AlarmClock, Clock, Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActivityTiming } from "./classroom-types"
import {
  formatDateTime,
  formatDuration,
  formatRemaining,
  getTimerAnnouncement,
  getTimerUrgency,
  type QuizTimingState,
  type TimerUrgency,
} from "./quiz-timing"

const urgencyStyles: Record<TimerUrgency, string> = {
  normal: "border-border bg-card",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  critical: "border-rose-300 bg-rose-50 text-rose-950",
  over: "border-rose-400 bg-rose-100 text-rose-950",
}

const urgencyLabels: Record<TimerUrgency, string> = {
  normal: "",
  warning: "Running low",
  critical: "Almost out of time",
  over: "Time is up",
}

export function QuizCountdown({
  timing,
  state,
  onStart,
}: {
  timing: ActivityTiming
  state: QuizTimingState
  onStart: () => void
}) {
  const { phase, remainingMs } = state
  const urgency = phase === "running" || phase === "expired" ? getTimerUrgency(remainingMs) : "normal"
  const totalMs = timing.durationMinutes * 60_000
  const percent = phase === "running" ? Math.min(100, Math.max(0, (remainingMs / totalMs) * 100)) : phase === "expired" ? 0 : 100

  return (
    <section aria-label="Quiz timer" className={`rounded-2xl border p-4 sm:p-5 ${urgencyStyles[urgency]}`}>
      <p className="sr-only" role="status" aria-live="polite">{getTimerAnnouncement(urgency)}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {phase === "closed" || phase === "not-open" ? <Lock className="size-5" /> : <AlarmClock className="size-5" />}
          </span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {phase === "running" || phase === "expired" ? "Time remaining" : "Time allowed"}
            </p>
            {phase === "running" || phase === "expired" ? (
              <p role="timer" aria-live="off" aria-label={`Time remaining ${formatRemaining(remainingMs)}`} className="text-3xl font-semibold tabular-nums tracking-tight">
                {formatRemaining(remainingMs)}
              </p>
            ) : (
              <p className="text-xl font-semibold">{formatDuration(timing.durationMinutes)}</p>
            )}
          </div>
        </div>
        {urgencyLabels[urgency] && (
          <span className="rounded-full bg-background/70 px-3 py-1 text-xs font-semibold">{urgencyLabels[urgency]}</span>
        )}
        {phase === "ready" && (
          <Button type="button" onClick={onStart}><Play aria-hidden="true" /> Start quiz</Button>
        )}
      </div>

      {(phase === "running" || phase === "expired") && (
        <div
          role="progressbar"
          aria-label="Time left"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/70"
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear motion-reduce:transition-none" style={{ width: `${percent}%` }} />
        </div>
      )}

      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        {phase === "ready" && <li className="flex items-center gap-1.5"><Clock aria-hidden="true" className="size-3.5" /> The timer starts when you press Start and cannot be paused.</li>}
        {phase === "not-open" && <li>Opens {formatDateTime(timing.opensAt)}.</li>}
        {phase === "closed" && <li>This quiz closed {formatDateTime(timing.closesAt)}.</li>}
        {timing.opensAt && phase !== "not-open" && <li>Opens {formatDateTime(timing.opensAt)}</li>}
        {timing.closesAt && phase !== "closed" && <li>Closes {formatDateTime(timing.closesAt)}</li>}
        <li>{timing.autoSubmitOnTimeUp ? "Your answers are submitted automatically when time is up." : "When time is up, answers lock and you submit what you have."}</li>
        <li>Preview only: the timer is enforced in this browser session, not by a server.</li>
      </ul>
    </section>
  )
}
