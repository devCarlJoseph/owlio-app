import { describe, expect, it } from "vitest"
import type { ClassroomActivity } from "./classroom-types"
import {
  buildLeaderboard,
  formatRemaining,
  getQuizTimingState,
  getTimerAnnouncement,
  getTimerUrgency,
  parseTimingFields,
  shortLearnerName,
} from "./quiz-timing"

const timing = { durationMinutes: 30, autoSubmitOnTimeUp: true }
const start = Date.parse("2026-10-23T09:00:00")

describe("getQuizTimingState", () => {
  it("is ready before starting and counts down from the start time", () => {
    expect(getQuizTimingState(timing, undefined, start, false).phase).toBe("ready")
    const running = getQuizTimingState(timing, new Date(start).toISOString(), start + 10 * 60_000, false)
    expect(running.phase).toBe("running")
    expect(running.remainingMs).toBe(20 * 60_000)
  })

  it("expires when the duration has elapsed", () => {
    const state = getQuizTimingState(timing, new Date(start).toISOString(), start + 31 * 60_000, false)
    expect(state.phase).toBe("expired")
    expect(state.remainingMs).toBe(0)
  })

  it("caps the deadline at the closing time", () => {
    const closing = { ...timing, closesAt: "2026-10-23T09:10:00" }
    const state = getQuizTimingState(closing, new Date(start).toISOString(), start + 5 * 60_000, false)
    expect(state.remainingMs).toBe(5 * 60_000)
  })

  it("reports not-open and closed windows only before starting", () => {
    const window = { ...timing, opensAt: "2026-10-23T10:00:00", closesAt: "2026-10-23T11:00:00" }
    expect(getQuizTimingState(window, undefined, start, false).phase).toBe("not-open")
    expect(getQuizTimingState(window, undefined, Date.parse("2026-10-23T11:30:00"), false).phase).toBe("closed")
  })

  it("is submitted once a submission exists", () => {
    expect(getQuizTimingState(timing, undefined, start, true).phase).toBe("submitted")
  })
})

describe("timer display helpers", () => {
  it("formats mm:ss and h:mm:ss", () => {
    expect(formatRemaining(65_000)).toBe("01:05")
    expect(formatRemaining(3_661_000)).toBe("1:01:01")
    expect(formatRemaining(-5)).toBe("00:00")
  })

  it("announces only threshold states", () => {
    expect(getTimerAnnouncement(getTimerUrgency(10 * 60_000))).toBe("")
    expect(getTimerAnnouncement(getTimerUrgency(4 * 60_000))).toBe("5 minutes remaining")
    expect(getTimerAnnouncement(getTimerUrgency(30_000))).toBe("1 minute remaining")
    expect(getTimerAnnouncement(getTimerUrgency(0))).toBe("Time is up")
  })
})

describe("parseTimingFields", () => {
  it("rejects invalid durations and reversed windows", () => {
    expect(parseTimingFields({ duration: "0", opensAt: "", closesAt: "", autoSubmit: true }).errors.duration).toBeTruthy()
    expect(parseTimingFields({ duration: "301", opensAt: "", closesAt: "", autoSubmit: true }).errors.duration).toBeTruthy()
    expect(parseTimingFields({ duration: "20", opensAt: "2026-10-23T10:00", closesAt: "2026-10-23T09:00", autoSubmit: true }).errors.closesAt).toBeTruthy()
  })

  it("accepts valid timing", () => {
    const result = parseTimingFields({ duration: "45", opensAt: "", closesAt: "", autoSubmit: false })
    expect(result.timing).toEqual({ durationMinutes: 45, opensAt: undefined, closesAt: undefined, autoSubmitOnTimeUp: false })
  })
})

describe("buildLeaderboard", () => {
  const base: Omit<ClassroomActivity, "submissions"> = {
    id: "a", title: "t", type: "Quiz", instructions: "", dueDate: "", scoringNote: "",
    questions: [], responseType: "Quiz", status: "Published",
  }
  const submission = (id: string, name: string, score: number | undefined, released: boolean) => ({
    id, learnerId: id, learnerName: name, response: "", submittedAt: "", status: "Returned" as const, score, released,
  })

  it("is empty unless the educator enabled it", () => {
    const activity: ClassroomActivity = { ...base, submissions: [submission("1", "Ana Cruz", 5, true)] }
    expect(buildLeaderboard(activity)).toEqual([])
  })

  it("ranks released scored results with ties and first-name display", () => {
    const activity: ClassroomActivity = {
      ...base,
      showLeaderboard: true,
      submissions: [
        submission("1", "Ana Cruz", 8, true),
        submission("2", "Ben Lee", 9, true),
        submission("3", "Cy Diaz", 8, true),
        submission("4", "Dee Fox", 10, false),
        submission("5", "Eli Ray", undefined, true),
      ],
    }
    const board = buildLeaderboard(activity)
    expect(board.map((entry) => [entry.displayName, entry.rank])).toEqual([["Ben L.", 1], ["Ana C.", 2], ["Cy D.", 2]])
  })

  it("shortens names", () => {
    expect(shortLearnerName("You · demo learner")).toBe("You")
    expect(shortLearnerName("Jordan Rivera")).toBe("Jordan R.")
  })
})
