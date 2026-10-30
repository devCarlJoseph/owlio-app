import { describe, expect, it } from "vitest"
import { addDays, dateKey, getVisibleDates, moveDate, startOfWeek } from "./calendar-dates"

describe("calendar date navigation", () => {
  it("starts the week on Monday across a year boundary", () => {
    expect(dateKey(startOfWeek(new Date(2027, 0, 3)))).toBe("2026-12-28")
    const week = getVisibleDates(new Date(2027, 0, 3), "week")
    expect(week).toHaveLength(7)
    expect(dateKey(week[6])).toBe("2027-01-03")
  })

  it("clamps month navigation to the last valid day, including leap years", () => {
    expect(dateKey(moveDate(new Date(2028, 0, 31), "month", 1))).toBe("2028-02-29")
    expect(dateKey(moveDate(new Date(2027, 0, 31), "month", 1))).toBe("2027-02-28")
    expect(dateKey(moveDate(new Date(2026, 0, 31), "month", -1))).toBe("2025-12-31")
  })

  it("moves by civil dates across month and daylight-saving boundaries", () => {
    expect(dateKey(addDays(new Date(2026, 2, 8), 1))).toBe("2026-03-09")
    expect(dateKey(moveDate(new Date(2026, 9, 30), "week", 1))).toBe("2026-11-06")
    expect(dateKey(moveDate(new Date(2026, 9, 31), "day", 1))).toBe("2026-11-01")
  })

  it("includes every day of a six-week month exactly once", () => {
    const dates = getVisibleDates(new Date(2026, 2, 1), "month")
    expect(dates).toHaveLength(42)
    expect(dates[0].getDay()).toBe(1)
    expect(new Set(dates.map(dateKey)).size).toBe(42)
    expect(dates.filter((date) => date.getMonth() === 2)).toHaveLength(31)
    expect(getVisibleDates(new Date(2026, 2, 1), "day")).toHaveLength(1)
  })
})
