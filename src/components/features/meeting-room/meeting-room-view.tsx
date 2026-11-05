import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Participant as LiveKitParticipant,
  Room,
  RoomEvent,
} from 'livekit-client'
import { useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import { formatMeetingCode, getMeetingIdFromInvite } from '@/lib/meeting-code'
import { getApiErrorMessage } from '@/services/api/api-error'
import {
  createMeeting,
  endMeeting as endMeetingRequest,
  joinMeeting as joinMeetingRequest,
  type MeetingJoin,
} from '@/services/api/meeting.service'
import EslWhiteboardPreview from '@/components/features/esl-teaching/meeting-room/esl-whiteboard-preview'
import { shouldShowEslWhiteboardPreview } from '@/components/features/esl-teaching/meeting-room/esl-whiteboard-preview-route'
import { MeetingRoomHub } from '@/components/features/meeting-room/meeting-room-hub'

import type { RoomStatus, MeetingPanel, MeetingMessage } from './meeting-room-types'
import { MeetingRoomScreen } from './meeting-room-screen'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'

type MeetingSignal =
  | { type: 'chat'; id: string; text: string }
  | { type: 'hand'; raised: boolean }

function decodeMeetingSignal(payload: Uint8Array): MeetingSignal | null {
  if (payload.byteLength > 2048) return null

  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(payload))
    if (!value || typeof value !== 'object') return null

    const signal = value as Record<string, unknown>
    if (signal.type === 'chat'
      && typeof signal.id === 'string'
      && signal.id.length <= 100
      && typeof signal.text === 'string'
      && signal.text.trim().length > 0
      && signal.text.length <= 500) {
      return { type: 'chat', id: signal.id, text: signal.text.trim() }
    }
    if (signal.type === 'hand' && typeof signal.raised === 'boolean') {
      return { type: 'hand', raised: signal.raised }
    }
  } catch {
    return null
  }

  return null
}

export default function MeetingRoomPage() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const role = getDashboardRole(pathname) ?? 'students'
  const hasInvite = Boolean(getMeetingIdFromInvite(params.get('room') ?? ''))
  return hasInvite || params.get('join') === '1' || params.get('layout-preview') === '1' || shouldShowEslWhiteboardPreview(role, params.get('whiteboard-preview'))
    ? <MeetingRoomSession />
    : <MeetingRoomHub />
}

function MeetingRoomSession() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const classroomPath = `/${role}/classrooms/meeting-room`
  const { user } = useAuthSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const roomId = getMeetingIdFromInvite(searchParams.get('room') ?? '')
  const meetingCode = roomId ? formatMeetingCode(roomId) : ''
  const roomInputRef = useRef<HTMLInputElement>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [joinInfo, setJoinInfo] = useState<MeetingJoin | null>(null)
  const [status, setStatus] = useState<RoomStatus>('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [micOn, setMicOn] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [screenOn, setScreenOn] = useState(false)
  const [raisedHands, setRaisedHands] = useState<Record<string, boolean>>({})
  const [pinnedParticipantIdentity, setPinnedParticipantIdentity] = useState<string | null>(null)
  const [messages, setMessages] = useState<MeetingMessage[]>([])
  const [chatDraft, setChatDraft] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [handUpdating, setHandUpdating] = useState(false)
  const [activePanel, setActivePanel] = useState<MeetingPanel | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const roomRef = useRef<Room | null>(null)
  const activePanelRef = useRef<MeetingPanel | null>(null)
  const seenMessageIdsRef = useRef(new Set<string>())
  const isEducator = user?.roles.includes('EDUCATOR') ?? false

  useEffect(() => {
    activePanelRef.current = activePanel
  }, [activePanel])

  useEffect(() => {
    if (!room) return

    const refresh = () => setRevision((current) => current + 1)
    const participantLeft = (participant: LiveKitParticipant) => {
      refresh()
      setPinnedParticipantIdentity((current) => current === participant.identity ? null : current)
      setRaisedHands((current) => {
        if (!current[participant.identity]) return current
        const next = { ...current }
        delete next[participant.identity]
        return next
      })
    }
    const receiveData = (payload: Uint8Array, participant?: LiveKitParticipant) => {
      if (!participant) return
      const signal = decodeMeetingSignal(payload)
      if (!signal) return

      if (signal.type === 'hand') {
        setRaisedHands((current) => ({ ...current, [participant.identity]: signal.raised }))
        return
      }

      if (seenMessageIdsRef.current.has(signal.id)) return
      seenMessageIdsRef.current.add(signal.id)
      setMessages((current) => [...current, {
        id: signal.id,
        identity: participant.identity,
        text: signal.text,
        sentAt: Date.now(),
      }].slice(-100))
      if (activePanelRef.current !== 'chat') {
        setUnreadMessages((current) => current + 1)
      }
    }
    const reconnecting = () => setStatus('reconnecting')
    const reconnected = () => setStatus('connected')
    const disconnected = () => {
      setStatus('ended')
      setRoom(null)
      setJoinInfo(null)
      setMicOn(false)
      setCameraOn(false)
      setScreenOn(false)
      setRaisedHands({})
      setPinnedParticipantIdentity(null)
      setMessages([])
      setChatDraft('')
      setUnreadMessages(0)
      seenMessageIdsRef.current.clear()
    }

    room
      .on(RoomEvent.ParticipantConnected, refresh)
      .on(RoomEvent.ParticipantDisconnected, participantLeft)
      .on(RoomEvent.TrackSubscribed, refresh)
      .on(RoomEvent.TrackUnsubscribed, refresh)
      .on(RoomEvent.TrackMuted, refresh)
      .on(RoomEvent.TrackUnmuted, refresh)
      .on(RoomEvent.DataReceived, receiveData)
      .on(RoomEvent.Reconnecting, reconnecting)
      .on(RoomEvent.Reconnected, reconnected)
      .on(RoomEvent.Disconnected, disconnected)

    return () => {
      room
        .off(RoomEvent.ParticipantConnected, refresh)
        .off(RoomEvent.ParticipantDisconnected, participantLeft)
        .off(RoomEvent.TrackSubscribed, refresh)
        .off(RoomEvent.TrackUnsubscribed, refresh)
        .off(RoomEvent.TrackMuted, refresh)
        .off(RoomEvent.TrackUnmuted, refresh)
        .off(RoomEvent.DataReceived, receiveData)
        .off(RoomEvent.Reconnecting, reconnecting)
        .off(RoomEvent.Reconnected, reconnected)
        .off(RoomEvent.Disconnected, disconnected)
    }
  }, [room])

  useEffect(() => () => {
    void roomRef.current?.disconnect(true)
  }, [])

  const participants = room
    ? [room.localParticipant, ...room.remoteParticipants.values()]
    : []
  const createRoom = async () => {
    if (!API_INTEGRATION_ENABLED) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await createMeeting()
      setSearchParams({ room: formatMeetingCode(result.meetingId) })
      setMessage('Meeting created. Copy the invite and share it with your class.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not create the meeting.'))
    } finally {
      setBusy(false)
    }
  }

  const joinRoom = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!API_INTEGRATION_ENABLED) return
    const normalizedRoomId = getMeetingIdFromInvite(roomInputRef.current?.value ?? '')
    if (!normalizedRoomId) {
      setError('Enter a meeting invite link or room code first.')
      return
    }

    setBusy(true)
    setError('')
    setMessage('')
    setStatus('joining')
    setMessages([])
    setChatDraft('')
    setRaisedHands({})
    setPinnedParticipantIdentity(null)
    setUnreadMessages(0)
    setActivePanel(null)
    seenMessageIdsRef.current.clear()
    setSearchParams({ room: formatMeetingCode(normalizedRoomId) })

    const nextRoom = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = nextRoom
    try {
      const credentials = await joinMeetingRequest(normalizedRoomId)
      await nextRoom.connect(credentials.serverUrl, credentials.token, { autoSubscribe: true })
      setJoinInfo(credentials)
      setRoom(nextRoom)
      setStatus('connected')
    } catch (requestError) {
      await nextRoom.disconnect(true).catch(() => undefined)
      roomRef.current = null
      setStatus('idle')
      const detail = requestError instanceof Error ? requestError.message.toLowerCase() : ''
      setError(
        detail.includes('signal connection') || detail.includes('failed to fetch')
          ? 'Could not reach the meeting service. Check your connection and try again.'
          : getApiErrorMessage(requestError, 'Could not join this meeting. Check the invite and try again.'),
      )
    } finally {
      setBusy(false)
    }
  }

  const leaveRoom = async () => {
    const currentRoom = roomRef.current
    roomRef.current = null
    setRoom(null)
    setJoinInfo(null)
    setStatus('idle')
    setMicOn(false)
    setCameraOn(false)
    setScreenOn(false)
    setRaisedHands({})
    setPinnedParticipantIdentity(null)
    setMessages([])
    setChatDraft('')
    setUnreadMessages(0)
    seenMessageIdsRef.current.clear()
    if (currentRoom) await currentRoom.disconnect(true)
  }

  const endRoom = async () => {
    if (!roomId) return
    setBusy(true)
    setError('')
    try {
      await endMeetingRequest(roomId)
      await leaveRoom()
      setStatus('ended')
      setMessage('The meeting has ended.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not end the meeting.'))
    } finally {
      setBusy(false)
    }
  }

  const toggleMicrophone = async () => {
    if (!room) return
    setError('')
    try {
      await room.localParticipant.setMicrophoneEnabled(!micOn)
      setMicOn(!micOn)
    } catch {
      setError('Microphone access was unavailable. Check your browser permission and try again.')
    }
  }

  const toggleCamera = async () => {
    if (!room) return
    setError('')
    try {
      await room.localParticipant.setCameraEnabled(!cameraOn)
      setCameraOn(!cameraOn)
    } catch {
      setError('Camera access was unavailable. Check your browser permission and try again.')
    }
  }

  const toggleScreenShare = async () => {
    if (!room) return
    setError('')
    try {
      await room.localParticipant.setScreenShareEnabled(!screenOn)
      setScreenOn(!screenOn)
    } catch {
      setError('Screen sharing was unavailable or cancelled.')
    }
  }

  const publishSignal = async (signal: MeetingSignal) => {
    if (!room) return
    await room.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(signal)),
      { reliable: true, topic: 'owlio-meeting' },
    )
  }

  const toggleRaisedHand = async () => {
    if (!room || handUpdating) return
    const raised = !raisedHands[room.localParticipant.identity]
    setError('')
    setHandUpdating(true)
    try {
      await publishSignal({ type: 'hand', raised })
      setRaisedHands((current) => ({ ...current, [room.localParticipant.identity]: raised }))
    } catch {
      setError('Could not update your raised hand. The meeting service may not allow room messages.')
    } finally {
      setHandUpdating(false)
    }
  }

  const sendChatMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!room || chatSending) return
    const text = chatDraft.trim()
    if (!text) return
    if (text.length > 500) {
      setError('Messages must be 500 characters or fewer.')
      return
    }

    const messageId = crypto.randomUUID()
    setError('')
    setChatSending(true)
    try {
      await publishSignal({ type: 'chat', id: messageId, text })
      seenMessageIdsRef.current.add(messageId)
      setMessages((current) => [...current, {
        id: messageId,
        identity: room.localParticipant.identity,
        text,
        sentAt: Date.now(),
      }].slice(-100))
      setChatDraft('')
    } catch {
      setError('Could not send your message. The meeting service may not allow room messages.')
    } finally {
      setChatSending(false)
    }
  }

  const openPanel = (panel: MeetingPanel) => {
    setActivePanel((current) => {
      const next = current === panel ? null : panel
      activePanelRef.current = next
      if (next === 'chat') setUnreadMessages(0)
      return next
    })
  }

  const copyInvite = async () => {
    if (!roomId) return
    const invite = new URL(window.location.href)
    invite.searchParams.set('room', formatMeetingCode(roomId))
    invite.searchParams.delete('layout-preview')
    invite.searchParams.delete('whiteboard-preview')
    try {
      await navigator.clipboard.writeText(invite.toString())
      setMessage('Meeting invite copied.')
    } catch {
      setMessage(`Share this Owlio meeting code: ${formatMeetingCode(roomId)}`)
    }
  }

  const preview = !room && searchParams.get('layout-preview') === '1'
  const isHost = Boolean(user && joinInfo?.hostId === user.id)

  if (shouldShowEslWhiteboardPreview(role, searchParams.get('whiteboard-preview'))) {
    return <EslWhiteboardPreview />
  }

  return <MeetingRoomScreen
    key={role}
    role={role} backHref={classroomPath} roomId={roomId} meetingCode={meetingCode}
    roomInputRef={roomInputRef} status={status} preview={preview} hasRoom={Boolean(room)}
    apiEnabled={API_INTEGRATION_ENABLED} canCreate={isEducator} isHost={isHost} busy={busy}
    message={message} error={error} participants={participants} localIdentity={room?.localParticipant.identity}
    pinnedIdentity={pinnedParticipantIdentity} onPin={setPinnedParticipantIdentity} raisedHands={raisedHands}
    revision={revision} micOn={micOn} cameraOn={cameraOn} screenOn={screenOn} handUpdating={handUpdating}
    activePanel={activePanel} onPanel={openPanel} unreadMessages={unreadMessages} messages={messages}
    chatDraft={chatDraft} onChatDraft={setChatDraft} chatSending={chatSending}
    onSendChat={event => void sendChatMessage(event)} onJoin={event => void joinRoom(event)}
    onCreate={() => void createRoom()} onCopy={() => void copyInvite()}
    onPreview={() => { const next = new URLSearchParams(searchParams); next.set('layout-preview', '1'); setSearchParams(next) }}
    onLeave={() => {
      if (preview) { const next = new URLSearchParams(searchParams); next.delete('layout-preview'); setSearchParams(next) }
      else void leaveRoom()
    }}
    onEnd={() => void endRoom()} onMicrophone={() => void toggleMicrophone()}
    onCamera={() => void toggleCamera()} onScreen={() => void toggleScreenShare()} onHand={() => void toggleRaisedHand()}
  />
}
