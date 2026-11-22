import type { StudySpaceRecord } from "./study-spaces-records"
import type { StudySpaceMember } from "@/services/api/study-space.service"

// View model retained for the room scene; membership must be supplied by a real service.
export type SamplePerson = {
  id: string
  name: string
  seatIndex: number
  skin: string
  shirt: string
  hair: string
  member?: true
}


export const sampleRosterNotice =
  "Room membership and shared presence are not connected yet."

export function hashString(value: string): number {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

const memberSkins = ["#f0c6a4", "#c98762", "#e2ac7b", "#8f5d48", "#f3d0b0", "#b9785b"]
const memberBodies = ["#2563eb", "#0f766e", "#7c3aed", "#db2777", "#d97706", "#475569", "#059669"]
const memberAccents = ["#f59e0b", "#f8fafc", "#0f172a", "#ec4899", "#22d3ee", "#a3e635"]

// The user's full character is browser-local. Other members get a stable room avatar
// derived from their account ID so everyone in the space sees the same named figure.
export function getMemberRoster(members: StudySpaceMember[], currentUserId: string | undefined, seatCount: number): SamplePerson[] {
  return members
    .filter((member) => member.userId !== currentUserId)
    .slice(0, Math.max(0, Math.min(seatCount, 8)))
    .map((member, seatIndex) => {
      const hash = hashString(member.userId)
      return {
        id: member.userId,
        name: member.name,
        seatIndex,
        skin: memberSkins[hash % memberSkins.length],
        shirt: memberBodies[(hash >>> 5) % memberBodies.length],
        hair: memberAccents[(hash >>> 10) % memberAccents.length],
        member: true as const,
      }
    })
}

// Membership and presence must come from the API; empty rooms have no fabricated occupants.
export function getSampleNappers(_space: StudySpaceRecord, _roster: SamplePerson[], _firstSpotIndex: number, _matCount: number): SamplePerson[] {
  void [_space, _roster, _firstSpotIndex, _matCount]
  return []
}

export function getSampleRoster(_space: StudySpaceRecord, _seatCount: number): SamplePerson[] {
  void [_space, _seatCount]
  return []
}
