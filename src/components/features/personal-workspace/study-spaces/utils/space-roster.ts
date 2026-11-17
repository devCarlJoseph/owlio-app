import type { StudySpaceRecord } from "./study-spaces-records"

// View model retained for the room scene; membership must be supplied by a real service.
export type SamplePerson = {
  id: string
  name: string
  seatIndex: number
  skin: string
  shirt: string
  hair: string
}


export const sampleRosterNotice =
  "Room membership and shared presence are not connected yet."

export function hashString(value: string): number {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
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
