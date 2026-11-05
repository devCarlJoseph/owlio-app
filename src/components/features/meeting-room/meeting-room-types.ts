import type { Participant } from 'livekit-client'
import type { FormEvent, RefObject } from 'react'
import type { getDashboardRole } from '@/components/common/dashboard-navigation'

export type RoomStatus = 'idle' | 'joining' | 'connected' | 'reconnecting' | 'ended'
export type MeetingPanel = 'chat' | 'people'
export type MeetingMessage = { id: string; identity: string; text: string; sentAt: number }

export type MeetingRoomScreenProps = {
  role: NonNullable<ReturnType<typeof getDashboardRole>>
  backHref: string
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
  localIdentity?: string
  pinnedIdentity: string | null
  onPin: (identity: string | null) => void
  raisedHands: Record<string, boolean>
  revision: number
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
  onPreview: () => void
  onCopy: () => void
  onLeave: () => void
  onEnd: () => void
  onMicrophone: () => void
  onCamera: () => void
  onScreen: () => void
  onHand: () => void
}
