import { io } from "socket.io-client"
import { z } from "zod"
import api from "@/lib/axios"

const poseSchema = z.object({
  x: z.number(), z: z.number(), rotation: z.number(),
  mode: z.enum(["idle", "walk", "seated", "nap"]),
  seatId: z.string().nullable(),
  bodyColor: z.string().regex(/^#[a-f\d]{6}$/i),
  accentColor: z.string().regex(/^#[a-f\d]{6}$/i),
})
const avatar = z.object({ userId: z.uuid(), name: z.string(), pose: poseSchema.nullable() })
const watchReply = z.object({ status: z.literal("success"), data: z.array(avatar) })
const change = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("chat"), message: z.object({
    id: z.string(), authorId: z.uuid(), text: z.string(), sentAt: z.number(),
  }) }),
  z.object({ kind: z.literal("tasks") }),
  z.object({ kind: z.literal("members") }),
])
export type StudyRoomPose = z.infer<typeof poseSchema>
export type StudyRoomAvatar = z.infer<typeof avatar>
export type StudyRoomChange = z.infer<typeof change>

type Listener = {
  onReady: (peers: StudyRoomAvatar[]) => void
  onOffline: (code?: string) => void
  onMember: (peer: StudyRoomAvatar) => void
  onPose: (peer: StudyRoomAvatar) => void
  onLeave: (userId: string) => void
  onChange: (event: StudyRoomChange) => void
}

export function connectStudyRoom(spaceId: string, initial: StudyRoomPose, listener: Listener) {
  const socket = io(api.defaults.baseURL!, {
    path: "/api/socket.io", transports: ["websocket", "polling"], tryAllTransports: true,
    upgrade: false, withCredentials: true,
    autoConnect: false, forceNew: true, timeout: 5000,
    reconnectionDelay: 1000, reconnectionDelayMax: 5000,
  })
  let ready = false
  let stopped = false
  let current = initial
  let retry: ReturnType<typeof setTimeout> | undefined

  function reconnect() {
    if (!stopped && !retry) {
      retry = setTimeout(() => { retry = undefined; if (!stopped) socket.connect() }, 5000)
    }
  }

  function unavailable(code?: string) {
    ready = false
    listener.onOffline(code)
    socket.disconnect()
    if (code !== "REPLACED" && code !== "NOT_FOUND") reconnect()
  }

  socket.on("connect", () => {
    socket.timeout(5000).emit("study:watch", { spaceId }, (error: Error | null, value: unknown) => {
      if (stopped || !socket.connected) return
      const result = watchReply.safeParse(value)
      if (error || !result.success) {
        const failure = z.object({ code: z.string() }).safeParse(value)
        unavailable(failure.data?.code)
        return
      }
      ready = true
      listener.onReady(result.data.data)
      socket.emit("study:pose", current)
    })
  })
  socket.on("study:member", (value: unknown) => {
    const result = avatar.safeParse(value)
    if (ready && result.success) listener.onMember(result.data)
  })
  socket.on("study:pose", (value: unknown) => {
    const result = avatar.safeParse(value)
    if (ready && result.success) listener.onPose(result.data)
  })
  socket.on("study:left", (value: unknown) => {
    if (ready && typeof value === "string") listener.onLeave(value)
  })
  socket.on("study:change", (value: unknown) => {
    const result = change.safeParse(value)
    if (ready && result.success) listener.onChange(result.data)
  })
  socket.on("study:unavailable", (code: string) => unavailable(code))
  socket.on("server:closing", () => unavailable())
  socket.on("disconnect", (reason) => {
    ready = false
    if (reason === "io client disconnect") return
    listener.onOffline()
    if (reason === "io server disconnect") reconnect()
  })
  socket.on("connect_error", () => {
    listener.onOffline()
    if (!socket.active) reconnect()
  })
  socket.connect()

  return {
    publish(next: StudyRoomPose) {
      const previous = current
      current = next
      if (!ready || !socket.connected) return
      if (next.mode !== previous.mode || next.seatId !== previous.seatId ||
          next.bodyColor !== previous.bodyColor || next.accentColor !== previous.accentColor || next.mode === "idle") {
        socket.emit("study:pose", next)
      } else {
        socket.volatile.emit("study:pose", next)
      }
    },
    disconnect() {
      stopped = true
      clearTimeout(retry)
      socket.removeAllListeners()
      socket.disconnect()
    },
  }
}
