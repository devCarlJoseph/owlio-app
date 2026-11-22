import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"
import { connectStudyRoom, type StudyPosition, type StudyRoomAvatar, type StudyRoomChange, type StudyRoomPose } from "@/services/api/study-space-realtime"
import type { StudySpaceCharacter } from "../utils/study-spaces-records"

export function useStudyPresence(scope: string | undefined, userId: string | undefined, character: StudySpaceCharacter | null,
  spawn: StudyPosition, onChange?: (event: StudyRoomChange) => void) {
  const [members, setMembers] = useState<StudyRoomAvatar[]>([])
  const area = scope === "hall" ? "Study Hall" : "room"
  const [status, setStatus] = useState(`Connecting to the ${area}…`)
  const poses = useRef(new Map<string, StudyRoomPose>())
  const connection = useRef<ReturnType<typeof connectStudyRoom> | null>(null)
  const position = useRef(spawn)
  const receive = useEffectEvent((event: StudyRoomChange) => onChange?.(event))
  const bodyColor = character?.bodyColor
  const accentColor = character?.accentColor
  const initialPose = useEffectEvent(() => ({
    ...position.current, bodyColor: bodyColor ?? "#2563eb", accentColor: accentColor ?? "#f59e0b",
  }))

  useEffect(() => {
    if (!scope || !userId) return
    const activePoses = poses.current
    const live = connectStudyRoom(scope, initialPose(), {
      onReady(peers) {
        activePoses.clear()
        const others = peers.filter((peer) => peer.userId !== userId)
        for (const peer of others) if (peer.pose) activePoses.set(peer.userId, peer.pose)
        setMembers(others)
        setStatus("")
        if (scope !== "hall") {
          receive({ kind: "members" })
          receive({ kind: "tasks" })
        }
      },
      onOffline(code) {
        activePoses.clear()
        setMembers([])
        setStatus(code === "REPLACED" ? `The ${area} is open in another tab or device.`
          : code === "NOT_FOUND" ? `Access to the ${area} is unavailable.`
          : `Reconnecting to the ${area}…`)
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
      onChange: (event) => receive(event),
    })
    connection.current = live
    return () => {
      live.disconnect()
      activePoses.clear()
      connection.current = null
    }
  }, [area, scope, userId])

  useEffect(() => {
    if (bodyColor && accentColor) connection.current?.publish({ ...position.current, bodyColor, accentColor })
  }, [bodyColor, accentColor])

  const publish = useCallback((next: StudyPosition) => {
    position.current = next
    if (bodyColor && accentColor) connection.current?.publish({ ...next, bodyColor, accentColor })
  }, [bodyColor, accentColor])

  function stopWalking() {
    if (position.current.mode === "walk") publish({ ...position.current, mode: "idle" })
  }

  return { members, status, poses, publish, stopWalking }
}
