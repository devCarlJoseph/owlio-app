import { describe, expect, it } from "vitest"
import { getActiveDashboardHref, getDashboardNavigation, getDashboardNotificationHref, getDashboardPageTitle, getDashboardSidebarNavigation, getPlannedDashboardPages } from "./dashboard-navigation"

const classroomRoles = ["students", "educators", "esl", "tutors"] as const

it.each(classroomRoles)('gives every %s sidebar destination a searchable, role-prefixed link', role => {
  const items = getDashboardSidebarNavigation('/' + role).flatMap(group => group.items)
  const searchable = getDashboardNavigation('/' + role).flatMap(group => group.items)
  for (const item of items) {
    expect(item.href).toMatch(new RegExp(`^/${role}(?:/|$)`))
    expect(item.href).not.toContain('undefined')
    expect(searchable.some(result => result.href === item.href)).toBe(true)
    expect(getActiveDashboardHref(item.href!)).toBe(item.href)
  }
})

it.each(classroomRoles)('keeps planned %s pages titled and excludes implemented account pages', role => {
  const pages = getPlannedDashboardPages('/' + role)
  for (const [path, title] of [['profile', 'My Profile'], ['settings', 'Settings'], ['help', 'Help & Support']]) {
    const href = `/${role}/${path}`
    expect(pages.some(page => page.href === href)).toBe(false)
    expect(getDashboardPageTitle(href)).toBe(title)
  }
  for (const page of pages) expect(getDashboardPageTitle(page.href)).toBe(page.label)
})

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

describe("workspace notification destinations", () => {
  it.each(classroomRoles)("resolves %s without relying on sidebar items", (role) => {
    expect(getDashboardNotificationHref(`/${role}`)).toBe(`/${role}/notifications`)
    expect(getDashboardNotificationHref(`/${role}/classrooms/class-1`)).toBe(`/${role}/notifications`)
    expect(getDashboardPageTitle(`/${role}/notifications`)).toBe("Notifications")
  })

  it("does not invent a destination for an unknown workspace", () => {
    expect(getDashboardNotificationHref("/")).toBeUndefined()
    expect(getDashboardNotificationHref("/students-other")).toBeUndefined()
  })
})

it.each(classroomRoles)('makes Account security reachable for %s', (role) => {
  const href = '/' + role + '/account/security'
  expect(getDashboardNavigation('/' + role).flatMap(group => group.items).find(item => item.label === 'Account security')?.href).toBe(href)
  expect(getDashboardPageTitle(href)).toBe('Account security')
})
