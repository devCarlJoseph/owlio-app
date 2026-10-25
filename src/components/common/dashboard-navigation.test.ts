import { describe, expect, it } from "vitest"
import { getActiveDashboardHref, getDashboardNavigation, getDashboardPageTitle } from "./dashboard-navigation"

const classroomRoles = ["students", "educators", "esl", "tutors"] as const

describe("My Classes sidebar item", () => {
  it.each(classroomRoles)("is available for %s", (role) => {
    const items = getDashboardNavigation(`/${role}`).flatMap(({ items: groupItems }) => groupItems)

    expect(items.find(({ label }) => label === "My Classes")?.href).toBe(`/${role}/classrooms`)
  })

  it.each(classroomRoles)("is active on %s class routes only", (role) => {
    expect(getActiveDashboardHref(`/${role}/classrooms`)).toBe(`/${role}/classrooms`)
    expect(getActiveDashboardHref(`/${role}/classrooms/class-1`)).toBe(`/${role}/classrooms`)
    expect(getActiveDashboardHref(`/${role}/classrooms/class-1/classwork/activity-1`)).toBe(`/${role}/classrooms`)
    expect(getActiveDashboardHref(`/${role}/classrooms/meeting-room`)).toBe(`/${role}/classrooms/meeting-room`)
    expect(getDashboardPageTitle(`/${role}/classrooms/meeting-room`)).toBe("Meeting Room")
  })
})
