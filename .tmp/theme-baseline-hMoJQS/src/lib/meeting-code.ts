const meetingCodePrefix = "OWLIO-"

export function formatMeetingCode(meetingId: string) {
  return `${meetingCodePrefix}${meetingId}`
}

export function getMeetingIdFromInvite(value: string) {
  let roomCode = value.trim()
  if (roomCode.includes("://") || roomCode.startsWith("/") || roomCode.includes("?")) {
    try {
      roomCode = new URL(roomCode, window.location.origin).searchParams.get("room") ?? ""
    } catch {
      return ""
    }
  }
  return roomCode.replace(/^OWLIO-/i, "")
}
