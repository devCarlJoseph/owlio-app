import type { LocalVideoTrack, Participant } from 'livekit-client'
import type { FormEvent, RefObject } from 'react'
import type { getDashboardRole } from '@/components/common/dashboard-navigation'

export type RoomStatus = 'idle' | 'joining' | 'connected' | 'reconnecting' | 'ended'
export type MeetingPanel = 'chat' | 'people' | 'info'
export type MeetingCategory = 'educators' | 'tutors' | 'esl'
export type MeetingMessage = { id: string; identity: string; authorName?: string; text: string; sentAt: number; delivery?: 'sending' | 'failed'; onRetry?: () => void }

export type MeetingRoomScreenProps = {
  role: NonNullable<ReturnType<typeof getDashboardRole>>
  backHref: string
  meetingCategory?: MeetingCategory | null
  roomId: string | null
  meetingCode: string
  roomInputRef: RefObject<HTMLInputElement | null>
  status: RoomStatus
  preview: boolean
  hasRoom: boolean
  apiEnabled: boolean
  canCreate: boolean
  isHost: boolean
  busy: boolean
  message: string
  error: string
  participants: Participant[]
  participantNames?: Record<string, string>
  localIdentity?: string
  pinnedIdentity: string | null
  onPin: (identity: string | null) => void
  raisedHands: Record<string, boolean>
  revision: number
  previewCameraTrack?: LocalVideoTrack
  deviceBusy?: boolean
  micOn: boolean
  cameraOn: boolean
  screenOn: boolean
  handUpdating: boolean
  activePanel: MeetingPanel | null
  onPanel: (panel: MeetingPanel) => void
  unreadMessages: number
  messages: MeetingMessage[]
  chatDraft: string
  onChatDraft: (value: string) => void
  chatSending: boolean
  onSendChat: (event: FormEvent<HTMLFormElement>) => void
  onJoin: (event: FormEvent<HTMLFormElement>) => void
  onCreate: () => void
  onCopy: () => void
  onLeave: () => void
  onEnd: () => void
  onMicrophone: () => void
  onCamera: () => void
  onSwitchCamera: () => void
  onScreen: () => void
  onHand: () => void
}
