import { useEffect, useState } from "react"
import { BedDouble, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const REMINDERS = [0, 10, 20, 30]

function format(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
}

// Shown while the student rests on a nap mat. Mounting starts the rest timer.
export function NapBanner({ onWake }: { onWake: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [reminder, setReminder] = useState(20)

  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((current) => current + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const due = reminder > 0 && elapsed >= reminder * 60

  return (
    <div
      role="region"
      aria-label="Nap status"
      className={`absolute left-1/2 top-3 z-20 flex max-w-[94%] -translate-x-1/2 flex-wrap items-center gap-3 rounded-2xl border px-4 py-2 text-sm shadow-lg ${
        due ? "border-amber-300 bg-amber-50 text-amber-900" : "border-violet-200 bg-violet-50/95 text-violet-900"
      }`}
    >
      <BedDouble className="size-4 shrink-0" aria-hidden="true" />
      <p className="font-medium">
        You&apos;re napping · <span className="tabular-nums">{format(elapsed)}</span>
      </p>
      <p role="status" className="text-xs">
        {due ? "Rest time is up." : "Your owl shows a napping status in this room preview only."}
      </p>
      <label className="flex items-center gap-1 text-xs">
        Wake reminder
        <select
          value={reminder}
          onChange={(event) => setReminder(Number(event.target.value))}
          className="rounded-md border border-violet-200 bg-white px-1.5 py-0.5 text-xs text-slate-800"
        >
          {REMINDERS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes === 0 ? "Off" : `${minutes} min`}
            </option>
          ))}
        </select>
      </label>
      <Button type="button" size="sm" onClick={onWake} className="bg-violet-700 text-white hover:bg-violet-600">
        <Sun aria-hidden="true" />
        Wake up
      </Button>
    </div>
  )
}
