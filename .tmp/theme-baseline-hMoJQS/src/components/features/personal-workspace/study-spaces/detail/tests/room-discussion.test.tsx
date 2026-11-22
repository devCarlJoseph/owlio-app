import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { useRoomDiscussion } from "@/components/features/connected-workspace/hooks/use-room-discussion"
import { createRoomDiscussion, getDiscussionReplies, listRoomDiscussions, postRoomReply } from "@/services/api/study-space.service"

vi.mock("@/services/api/study-space.service", () => ({
  createRoomDiscussion: vi.fn(),
  getDiscussionReplies: vi.fn(),
  listRoomDiscussions: vi.fn(),
  postRoomReply: vi.fn(),
}))

const account = { id: "me", name: "Sam" }
const roomThread = { id: "thread-one", title: "Room discussion", lockedAt: null }
const sentAt = "2026-11-19T00:00:00Z"

beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)

it("combines room replies across simultaneous threads and reads them in timestamp order", async () => {
  vi.mocked(listRoomDiscussions).mockResolvedValue([roomThread, { ...roomThread, id: "thread-two" }])
  vi.mocked(getDiscussionReplies)
    .mockResolvedValueOnce([{ id: "newer", authorId: account.id, body: "My message", createdAt: sentAt }])
    .mockResolvedValueOnce([{ id: "older", authorId: "peer", body: "Hi from a peer", createdAt: "2026-11-18T00:00:00Z" }])
  const { result } = renderHook(() => useRoomDiscussion("room", account))

  await waitFor(() => expect(result.current.messages.map(({ id, author }) => [id, author])).toEqual([
    ["older", "Member"], ["newer", "Sam"],
  ]))
})

it("shows only confirmed replies and preserves failures for the composer", async () => {
  vi.mocked(listRoomDiscussions).mockResolvedValue([roomThread])
  vi.mocked(getDiscussionReplies).mockResolvedValue([])
  vi.mocked(postRoomReply)
    .mockRejectedValueOnce(new Error("Reply failed"))
    .mockResolvedValueOnce({ id: "reply", discussionId: roomThread.id, createdAt: sentAt })
  const { result } = renderHook(() => useRoomDiscussion("room", account))

  await act(async () => { await result.current.send("Hello") })
  expect(result.current.messages).toEqual([])
  expect(result.current.sendError).toBe("Reply failed")

  await act(async () => { await result.current.send("Hello") })
  expect(result.current.messages[0]).toMatchObject({ id: "reply", text: "Hello" })
  expect(postRoomReply).toHaveBeenLastCalledWith(roomThread.id, "Hello")
  expect(createRoomDiscussion).not.toHaveBeenCalled()
})
