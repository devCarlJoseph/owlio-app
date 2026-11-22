import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { TvPanel } from "../ui/tv-panel"
import { TaskBoardPanel } from "../ui/task-board-panel"
import { focusMusicTracks, isTrackPlayable } from "../utils/focus-music"

afterEach(cleanup)

it("requests playback when the TV Play button is pressed for the already selected video", async () => {
  const user = userEvent.setup()
  const video = { videoId: "dQw4w9WgXcQ", url: "https://youtu.be/dQw4w9WgXcQ" }
  render(<TvPanel video={video} isLeader onSave={vi.fn()} onClose={vi.fn()} />)
  expect(screen.getByTitle("Room TV video").getAttribute("src")).not.toContain("autoplay=1")
  await user.click(screen.getByRole("button", { name: "Play" }))
  expect(screen.getByTitle("Room TV video").getAttribute("src")).toContain("autoplay=1")
  expect(screen.getByTitle("Room TV video").getAttribute("allow")).toContain("autoplay")
})

it("offers active member assignments and disables earlier due dates", async () => {
  const user = userEvent.setup()
  const add = vi.fn(async () => true)
  render(<TaskBoardPanel shared isLeader tasks={[]} people={[{ id: "alex", name: "Alex Chen" }]}
    onAdd={add} onClose={vi.fn()} onMove={vi.fn()} onRemove={vi.fn()} onToggle={vi.fn()} />)
  await user.type(screen.getByLabelText("Task title"), "Review the notes")
  await user.click(screen.getByRole("combobox", { name: "Assign to" }))
  await user.click(screen.getByRole("option", { name: "Alex Chen" }))
  await user.click(screen.getByRole("button", { name: "Due date (optional)" }))
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const previousLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(yesterday)
  const picker = within(screen.getByRole("region", { name: "Due date" }))
  const previousDay = picker.queryByRole("button", { name: previousLabel })
  if (previousDay) expect((previousDay as HTMLButtonElement).disabled).toBe(true)
  expect((picker.getByRole("button", { name: "Previous month" }) as HTMLButtonElement).disabled).toBe(true)
  const today = new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())
  await user.click(picker.getByRole("button", { name: today }))
  await user.click(picker.getByRole("button", { name: "Done" }))
  await user.click(screen.getByRole("button", { name: "Add task" }))
  expect(add).toHaveBeenCalledWith(expect.objectContaining({ title: "Review the notes", assignee: "alex", due: expect.any(String) }))
})

it("includes playable generated audio for every focus music track", () => {
  expect(focusMusicTracks.every(isTrackPlayable)).toBe(true)
  expect(focusMusicTracks.slice(-2).map((track) => track.source.type)).toEqual(["generated", "generated"])
})
