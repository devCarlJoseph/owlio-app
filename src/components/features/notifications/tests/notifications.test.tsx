import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation } from "react-router"
import { NotificationsTrigger } from "../ui/notifications-trigger"
import { RoleNotificationsView } from "../view/notifications-view"
import { NotificationList } from "../ui/notification-list"
import { getNotificationExamples } from "./notification-fixtures"
import type { NotificationsRole } from "../types/notifications.types"

afterEach(cleanup)

const roles: NotificationsRole[] = ["students", "educators", "tutors", "esl"]

function LocationProbe() {
  const { pathname } = useLocation()
  return <output aria-label="Current path">{pathname}</output>
}

function renderTrigger(role: NotificationsRole = "students") {
  return render(<MemoryRouter initialEntries={[`/${role}`]}><NotificationsTrigger role={role} /><LocationProbe /></MemoryRouter>)
}

describe("shared notifications panel", () => {
  it.each(roles)("opens an unavailable %s inbox without navigating or fabricating activity", async (role) => {
    const user = userEvent.setup()
    renderTrigger(role)
    const trigger = screen.getByRole("button", { name: "Notifications" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    await user.click(trigger)

    const dialog = await screen.findByRole("dialog", { name: "Notifications" })
    expect(within(dialog).getByRole("heading", { name: "Notification inbox is unavailable" })).toBeTruthy()
    expect(within(dialog).getByText(/Notification records and read status are not connected/)).toBeTruthy()
    expect(within(dialog).queryByRole("list", { name: "Notifications" })).toBeNull()
    expect(within(dialog).getByRole("link", { name: "View all notifications" }).getAttribute("href")).toBe(`/${role}/notifications`)
    expect(screen.getByLabelText("Current path").textContent).toBe(`/${role}`)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(within(dialog).queryByRole("button", { name: /accept|decline|mark.*read|delete|dismiss/i })).toBeNull()
    await user.click(within(dialog).getByRole("tab", { name: "Unread" }))
    expect(within(dialog).getByRole("heading", { name: "Notification inbox is unavailable" })).toBeTruthy()
    expect(within(dialog).queryByText("No unread notifications")).toBeNull()
  })

  it("closes with Escape and restores focus to the bell", async () => {
    const user = userEvent.setup()
    renderTrigger()
    const trigger = screen.getByRole("button", { name: "Notifications" })
    trigger.focus()
    await user.keyboard("{Enter}")
    const dialog = await screen.findByRole("dialog")
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    for (let index = 0; index < 5; index += 1) {
      await user.tab()
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    }
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(screen.getByLabelText("Current path").textContent).toBe("/students")
  })

  it("closes with its labeled close button", async () => {
    const user = userEvent.setup()
    renderTrigger()
    await user.click(screen.getByRole("button", { name: "Notifications" }))
    await user.click(await screen.findByRole("button", { name: "Close notifications" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it.each(roles)("opens the full %s inbox from its footer", async (role) => {
    const user = userEvent.setup()
    renderTrigger(role)
    await user.click(screen.getByRole("button", { name: "Notifications" }))
    await user.click(await screen.findByRole("link", { name: "View all notifications" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByLabelText("Current path").textContent).toBe(`/${role}/notifications`)
  })

  it('does not offer fictional notifications', async () => {
    const user = userEvent.setup()
    renderTrigger()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.queryByRole('button', { name: 'Show examples' })).toBeNull()
    expect(screen.queryByText(/Fictional content/)).toBeNull()
  })
})

describe('role notification pages', () => {
  it.each(roles)('does not offer examples on the %s page', role => {
    render(<MemoryRouter initialEntries={['/' + role + '/notifications']}><RoleNotificationsView /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: 'Show examples' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Notification inbox is unavailable' })).toBeTruthy()
  })
})

describe("notification list states", () => {
  it("distinguishes an empty inbox from an unread filter with no matches", () => {
    const items = getNotificationExamples("students").map((item) => ({ ...item, unread: false }))
    const { rerender } = render(<MemoryRouter><NotificationList state={{ status: "ready", items: [] }} filter="all" /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "No notifications yet" })).toBeTruthy()
    rerender(<MemoryRouter><NotificationList state={{ status: "ready", items }} filter="unread" /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "No unread notifications" })).toBeTruthy()
  })

  it("renders recoverable errors without raw payloads", () => {
    const retry = vi.fn()
    render(<NotificationList state={{ status: "error", onRetry: retry }} filter="all" />)
    expect(screen.getByRole("alert")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it("renders a supplied timestamp and safe preview text", () => {
    const item = { ...getNotificationExamples("students")[0], example: false, timestamp: { dateTime: "2026-10-30T01:00:00Z", relativeLabel: "1 hour ago", fullLabel: "October 30, 2026" }, preview: "<script>example</script>" }
    render(<MemoryRouter><NotificationList state={{ status: "ready", items: [item] }} filter="all" /></MemoryRouter>)
    expect(screen.getByText("1 hour ago").getAttribute("datetime")).toBe(item.timestamp.dateTime)
    expect(screen.getByText(item.preview)).toBeTruthy()
    expect(document.querySelector("script")).toBeNull()
  })
})
