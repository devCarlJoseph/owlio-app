import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TimingFormResult } from "./quiz-timing"

export function QuizTimerSettings({
  required,
  isQuizOrTest,
  errors,
}: {
  required: boolean
  isQuizOrTest: boolean
  errors: TimingFormResult["errors"]
}) {
  const [optionalEnabled, setOptionalEnabled] = useState(false)
  const [duration, setDuration] = useState("30")
  const enabled = required || optionalEnabled
  const minutes = Number(duration)
  const summary = Number.isInteger(minutes) && minutes >= 1 && minutes <= 300
    ? `Students get ${minutes} ${minutes === 1 ? "minute" : "minutes"} once they start.`
    : ""

  return (
    <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">Timer and availability</legend>

      {!required && (
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="timer-enabled" checked={optionalEnabled} onChange={(event) => setOptionalEnabled(event.currentTarget.checked)} />
          Add a time limit
        </label>
      )}

      {enabled && (
        <>
          <input type="hidden" name="timer-active" value="1" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="timer-duration">Duration (minutes)</Label>
              <Input
                id="timer-duration"
                name="timer-duration"
                type="number"
                min={1}
                max={300}
                step={1}
                inputMode="numeric"
                required
                value={duration}
                onChange={(event) => setDuration(event.currentTarget.value)}
                aria-invalid={Boolean(errors.duration)}
                aria-describedby={errors.duration ? "timer-duration-error" : "timer-summary"}
              />
              {errors.duration && <p id="timer-duration-error" role="alert" className="text-xs text-rose-700">{errors.duration}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timer-opens">Opens <span className="font-normal text-slate-500">(optional)</span></Label>
              <Input id="timer-opens" name="timer-opens" type="datetime-local" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timer-closes">Closes <span className="font-normal text-slate-500">(optional)</span></Label>
              <Input
                id="timer-closes"
                name="timer-closes"
                type="datetime-local"
                aria-invalid={Boolean(errors.closesAt)}
                aria-describedby={errors.closesAt ? "timer-closes-error" : undefined}
              />
              {errors.closesAt && <p id="timer-closes-error" role="alert" className="text-xs text-rose-700">{errors.closesAt}</p>}
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="timer-auto-submit" defaultChecked />
            Auto-submit when time is up
          </label>
          {summary && <p id="timer-summary" className="text-xs text-slate-500">{summary} If a closing time is set, it ends the attempt early.</p>}
        </>
      )}

      {isQuizOrTest && (
        <label className="grid gap-1 text-sm text-slate-700">
          <span className="inline-flex items-center gap-2">
            <input type="checkbox" name="show-leaderboard" aria-describedby="leaderboard-help" />
            Show leaderboard to students
          </span>
          <span id="leaderboard-help" className="pl-6 text-xs text-slate-500">Off by default. Only returned results with points are ranked, and students see first names with an initial.</span>
        </label>
      )}
      <p className="text-xs text-slate-500">Preview: the timer runs in the student's browser session only. A real service must record the start time and enforce the deadline.</p>
    </fieldset>
  )
}
