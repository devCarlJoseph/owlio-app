import type { ActivityTiming, ClassroomActivity, ClassroomSubmission } from "./classroom-types"

export type QuizPhase = "not-open" | "closed" | "ready" | "running" | "expired" | "submitted"

export type QuizTimingState = {
  phase: QuizPhase
  remainingMs: number
  deadlineMs: number | null
}

function parseTime(value?: string) {
  if (!value) return null
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : time
}

export function getQuizTimingState(
  timing: ActivityTiming,
  startedAt: string | undefined,
  nowMs: number,
  submitted: boolean,
): QuizTimingState {
  const opensAt = parseTime(timing.opensAt)
  const closesAt = parseTime(timing.closesAt)
  const startedMs = parseTime(startedAt)

  if (submitted) return { phase: "submitted", remainingMs: 0, deadlineMs: null }

  if (startedMs === null) {
    if (opensAt !== null && nowMs < opensAt) return { phase: "not-open", remainingMs: 0, deadlineMs: null }
    if (closesAt !== null && nowMs >= closesAt) return { phase: "closed", remainingMs: 0, deadlineMs: null }
    return { phase: "ready", remainingMs: timing.durationMinutes * 60_000, deadlineMs: null }
  }

  const byDuration = startedMs + timing.durationMinutes * 60_000
  const deadlineMs = closesAt !== null ? Math.min(byDuration, closesAt) : byDuration
  const remainingMs = Math.max(0, deadlineMs - nowMs)
  return { phase: remainingMs > 0 ? "running" : "expired", remainingMs, deadlineMs }
}

export function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, "0")
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

export type TimerUrgency = "normal" | "warning" | "critical" | "over"

export function getTimerUrgency(remainingMs: number): TimerUrgency {
  if (remainingMs <= 0) return "over"
  if (remainingMs <= 60_000) return "critical"
  if (remainingMs <= 300_000) return "warning"
  return "normal"
}

export function getTimerAnnouncement(urgency: TimerUrgency) {
  if (urgency === "over") return "Time is up"
  if (urgency === "critical") return "1 minute remaining"
  if (urgency === "warning") return "5 minutes remaining"
  return ""
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export function formatDateTime(value?: string) {
  const time = parseTime(value)
  if (time === null) return ""
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(time)
}

export type TimingFormResult = {
  timing?: ActivityTiming
  errors: Partial<Record<"duration" | "opensAt" | "closesAt", string>>
}

export function parseTimingFields(values: {
  duration: string
  opensAt: string
  closesAt: string
  autoSubmit: boolean
}): TimingFormResult {
  const errors: TimingFormResult["errors"] = {}
  const duration = Number(values.duration)
  if (!values.duration.trim() || !Number.isInteger(duration) || duration < 1 || duration > 300) {
    errors.duration = "Enter a whole number of minutes from 1 to 300."
  }
  const opens = parseTime(values.opensAt || undefined)
  const closes = parseTime(values.closesAt || undefined)
  if (opens !== null && closes !== null && closes <= opens) {
    errors.closesAt = "Closing time must be after the opening time."
  }
  if (Object.keys(errors).length) return { errors }
  return {
    errors,
    timing: {
      durationMinutes: duration,
      opensAt: values.opensAt || undefined,
      closesAt: values.closesAt || undefined,
      autoSubmitOnTimeUp: values.autoSubmit,
    },
  }
}

export type LeaderboardEntry = {
  learnerId: string
  displayName: string
  score: number
  rank: number
}

export function shortLearnerName(name: string) {
  const parts = name.replace(/·.*$/, "").trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return parts[0] ?? "Learner"
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export function buildLeaderboard(activity: ClassroomActivity): LeaderboardEntry[] {
  if (!activity.showLeaderboard) return []
  const scored = activity.submissions
    .filter((submission: ClassroomSubmission) => submission.released && typeof submission.score === "number")
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  let previous: number | null = null
  let rank = 0
  return scored.map((submission, index) => {
    if (submission.score !== previous) rank = index + 1
    previous = submission.score ?? null
    return {
      learnerId: submission.learnerId,
      displayName: shortLearnerName(submission.learnerName),
      score: submission.score ?? 0,
      rank,
    }
  })
}

export function isTimedActivity(activity: ClassroomActivity) {
  return Boolean(activity.timing)
}

export function isQuizLike(activity: ClassroomActivity) {
  return activity.type === "Quiz" || activity.type === "Test"
}
