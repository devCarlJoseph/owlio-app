import { postApiWithCsrf } from './auth.service'

export type MeetingJoin = {
  meetingId: string
  participantId: string
  participantName: string
  hostId?: string
  token: string
  serverUrl: string
}

export async function createMeeting() {
  return postApiWithCsrf<{ meetingId: string }>('/api/v1/meetings', {})
}

export async function joinMeeting(meetingId: string) {
  return postApiWithCsrf<MeetingJoin>('/api/v1/meetings/join', { meetingId })
}

export async function endMeeting(meetingId: string) {
  return postApiWithCsrf<{ message: string }>('/api/v1/meetings/end', { meetingId })
}
