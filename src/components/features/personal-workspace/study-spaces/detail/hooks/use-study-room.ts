import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import { connectStudyRoom, type StudyRoomAvatar, type StudyRoomChange, type StudyRoomPose } from "@/services/api/study-space-realtime"
import type { StudySpaceCharacter } from "../../utils/study-spaces-records"
import { roomSpawnPoint } from "../utils/study-space-seats"

type Position = Omit<StudyRoomPose, "bodyColor" | "accentColor">
const spawn: Position = { ...roomSpawnPoint, rotation: 0, mode: "idle", seatId: null }

export function useStudyRoom(spaceId: string | undefined, userId: string | undefined, character: StudySpaceCharacter | null, onChange: (event: StudyRoomChange) => void) {
  const [members, setMembers] = useState<StudyRoomAvatar[]>([])
  const [status, setStatus] = useState("Connecting to the room…")
  const poses = useRef(new Map<string, StudyRoomPose>())
  const connection = useRef<ReturnType<typeof connectStudyRoom> | null>(null)
  const position = useRef<Position>(spawn)
  const receive = useEffectEvent(onChange)
  const bodyColor = character?.bodyColor
  const accentColor = character?.accentColor
  const initialPose = useEffectEvent(() => ({
    ...position.current, bodyColor: bodyColor ?? "#2563eb", accentColor: accentColor ?? "#f59e0b",
  }))

  useEffect(() => {
    if (!spaceId || !userId) return
    const activePoses = poses.current
    const live = connectStudyRoom(spaceId, initialPose(), {
      onReady(peers) {
        activePoses.clear()
        const others = peers.filter((peer) => peer.userId !== userId)
        for (const peer of others) if (peer.pose) activePoses.set(peer.userId, peer.pose)
        setMembers(others)
        setStatus("")
        receive({ kind: "members" })
        receive({ kind: "tasks" })
      },
      onOffline(code) {
        activePoses.clear()
        setMembers([])
        setStatus(code === "REPLACED" ? "This room is open in another tab or device."
          : code === "NOT_FOUND" ? "Room access is unavailable."
          : "Reconnecting live room…")
      },
      onMember(peer) {
        if (peer.userId === userId) return
        if (peer.pose) activePoses.set(peer.userId, peer.pose)
        else activePoses.delete(peer.userId)
        setMembers((current) => [...current.filter((entry) => entry.userId !== peer.userId), peer])
      },
      onPose(peer) {
        if (peer.pose && activePoses.has(peer.userId)) activePoses.set(peer.userId, peer.pose)
      },
      onLeave(id) {
        activePoses.delete(id)
        setMembers((current) => current.filter((entry) => entry.userId !== id))
      },
      onChange: receive,
    })
    connection.current = live
    return () => {
      live.disconnect()
      activePoses.clear()
      connection.current = null
    }
  }, [spaceId, userId])

  useEffect(() => {
    if (bodyColor && accentColor) connection.current?.publish({ ...position.current, bodyColor, accentColor })
  }, [bodyColor, accentColor])

  const publish = useCallback((next: Position) => {
    position.current = next
    if (bodyColor && accentColor) connection.current?.publish({ ...next, bodyColor, accentColor })
  }, [bodyColor, accentColor])

  return { members, status, poses, publish }
}
