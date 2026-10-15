import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft,
  Hand,
  Copy,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Send,
  Users,
  Video,
  VideoOff,
  X,
} from 'lucide-react'
import {
  Participant as LiveKitParticipant,
  Room,
  RoomEvent,
  Track,
  type Track as LiveKitTrack,
} from 'livekit-client'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import { getApiErrorMessage } from '@/services/api/api-error'
import {
  createMeeting,
  endMeeting as endMeetingRequest,
  joinMeeting as joinMeetingRequest,
  type MeetingJoin,
} from '@/services/api/meeting.service'

type RoomStatus = 'idle' | 'joining' | 'connected' | 'reconnecting' | 'ended'
type MeetingPanel = 'chat' | 'people'
type MeetingSignal =
  | { type: 'chat'; id: string; text: string }
  | { type: 'hand'; raised: boolean }
type MeetingMessage = { id: string; identity: string; text: string; sentAt: number }

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

function getRoomId(value: string) {
  try {
    const url = new URL(value)
    return url.searchParams.get('room') ?? ''
  } catch {
    return value.trim()
  }
}

export default function MeetingRoomPage() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const classroomPath = `/${role}/classrooms`
  const { user } = useAuthSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const roomId = searchParams.get('room') ?? ''
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
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await createMeeting()
      setSearchParams({ room: result.meetingId })
      setMessage('Meeting created. Copy the invite and share it with your class.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not create the meeting.'))
    } finally {
      setBusy(false)
    }
  }

  const joinRoom = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const normalizedRoomId = getRoomId(roomInputRef.current?.value ?? '')
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
    setUnreadMessages(0)
    setActivePanel(null)
    seenMessageIdsRef.current.clear()
    setSearchParams({ room: normalizedRoomId })

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
          ? 'Could not reach the meeting service. Check that LIVEKIT_PUBLIC_URL points to a running LiveKit server.'
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
    invite.searchParams.set('room', roomId)
    try {
      await navigator.clipboard.writeText(invite.toString())
      setMessage('Meeting invite copied.')
    } catch {
      setMessage(`Share this room code: ${roomId}`)
    }
  }

  const meetingEnded = status === 'ended' && !room
  const isHost = Boolean(user && joinInfo?.hostId === user.id)

  return (
    <main className="fixed inset-0 z-50 flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className="flex min-h-[4.5rem] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            to={classroomPath}
            aria-label="Back to classrooms"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">Classroom meeting</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {roomId ? `Room ${roomId.slice(0, 8)}…` : 'LiveKit group meeting'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {roomId && (
            <button
              type="button"
              onClick={() => void copyInvite()}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 px-3 text-xs text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Copy aria-hidden="true" className="size-3.5" />
              <span className="hidden sm:inline">Copy invite</span>
            </button>
          )}
          {room && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700">
              <span className="size-1.5 rounded-full bg-blue-600" />
              {status === 'reconnecting' ? 'Reconnecting' : 'Live'}
            </span>
          )}
        </div>
      </header>

      {room ? (
        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-3 sm:p-5">
            <div className="flex shrink-0 items-center justify-between gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2"><Users aria-hidden="true" className="size-4" />{participants.length} connected</span>
              <span>{status === 'reconnecting' ? 'Restoring your connection...' : 'Meeting room is live'}</span>
            </div>
            <div className="grid min-h-0 flex-1 auto-rows-[minmax(9rem,1fr)] gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
              {participants.map((participant) => (
                <ParticipantTile
                  key={participant.identity}
                  participant={participant}
                  local={participant.identity === room.localParticipant.identity}
                  raised={Boolean(raisedHands[participant.identity])}
                  updateKey={revision}
                />
              ))}
            </div>
            {error && <p role="alert" className="shrink-0 text-center text-sm text-rose-700">{error}</p>}
          </div>

          {activePanel && (
            <aside
              aria-label={activePanel === 'chat' ? 'Meeting chat' : 'Meeting participants'}
              className="absolute inset-x-2 bottom-2 z-10 flex max-h-[min(52vh,28rem)] min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-xl lg:static lg:max-h-none lg:min-h-0 lg:w-80 lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:shadow-none"
            >
              <div className="flex min-h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  {activePanel === 'chat' ? 'In-call messages' : `People (${participants.length})`}
                </h2>
                <button
                  type="button"
                  onClick={() => openPanel(activePanel)}
                  aria-label="Close meeting panel"
                  className="flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>

              {activePanel === 'chat' ? (
                <>
                  <div role="log" aria-label="Meeting messages" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                      <p className="py-8 text-center text-xs leading-5 text-slate-400">
                        No messages yet. Messages are only available while this room is connected.
                      </p>
                    ) : messages.map((chatMessage) => {
                      const sender = participants.find((person) => person.identity === chatMessage.identity)
                      const ownMessage = chatMessage.identity === room.localParticipant.identity
                      return (
                        <article key={chatMessage.id} className={`max-w-[90%] ${ownMessage ? 'ml-auto text-right' : ''}`}>
                          <div className="mb-1 flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-medium text-slate-700">
                              {ownMessage ? 'You' : sender?.name || 'Participant'}
                            </span>
                            <time dateTime={new Date(chatMessage.sentAt).toISOString()}>
                              {new Date(chatMessage.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </time>
                          </div>
                          <p className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left text-xs leading-5 ${ownMessage ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            {chatMessage.text}
                          </p>
                        </article>
                      )
                    })}
                  </div>
                  <form onSubmit={(event) => void sendChatMessage(event)} className="flex shrink-0 gap-2 border-t border-slate-200 p-3">
                    <label htmlFor="meeting-chat-message" className="sr-only">Write a meeting message</label>
                    <input
                      id="meeting-chat-message"
                      value={chatDraft}
                      maxLength={500}
                      onChange={(event) => setChatDraft(event.target.value)}
                      placeholder="Write a message..."
                      className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatDraft.trim() || chatSending}
                      aria-label="Send message"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <Send aria-hidden="true" className="size-4" />
                    </button>
                  </form>
                </>
              ) : (
                <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                  {participants.map((participant) => (
                    <li key={participant.identity} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {(participant.name || 'P').slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-slate-900">
                          {participant.name || 'Participant'}{participant.identity === room.localParticipant.identity ? ' (you)' : ''}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                          {participant.isMicrophoneEnabled
                            ? <Mic aria-hidden="true" className="size-3" />
                            : <MicOff aria-hidden="true" className="size-3" />}
                          {participant.isMicrophoneEnabled ? 'Microphone on' : 'Microphone off'}
                        </span>
                      </span>
                      {raisedHands[participant.identity] && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-800">
                          <Hand aria-hidden="true" className="size-3" />
                          Hand raised
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          )}
        </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-3 sm:px-5">
            <p className="hidden text-xs text-slate-500 lg:block">{participants.length} of {room.numParticipants || participants.length} participants</p>
            <div className="mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <ControlButton label={micOn ? 'Turn microphone off' : 'Turn microphone on'} active={micOn} onClick={() => void toggleMicrophone()} icon={micOn ? <Mic /> : <MicOff />} />
              <ControlButton label={cameraOn ? 'Turn camera off' : 'Turn camera on'} active={cameraOn} onClick={() => void toggleCamera()} icon={cameraOn ? <Video /> : <VideoOff />} />
              <ControlButton label={screenOn ? 'Stop presenting' : 'Share screen'} active={screenOn} onClick={() => void toggleScreenShare()} icon={<MonitorUp />} />
              <ControlButton label={raisedHands[room.localParticipant.identity] ? 'Lower hand' : 'Raise hand'} active={Boolean(raisedHands[room.localParticipant.identity])} disabled={handUpdating} onClick={() => void toggleRaisedHand()} icon={<Hand />} />
              <button type="button" onClick={() => openPanel('chat')} aria-pressed={activePanel === 'chat'} aria-label={`Open chat${unreadMessages ? `, ${unreadMessages} unread` : ''}`} className={`relative flex size-11 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:size-12 ${activePanel === 'chat' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                <MessageCircle aria-hidden="true" className="size-4" />
                {unreadMessages > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">{Math.min(unreadMessages, 9)}</span>}
              </button>
              <button type="button" onClick={() => openPanel('people')} aria-pressed={activePanel === 'people'} aria-label={`Open participants, ${participants.length} connected`} className={`flex size-11 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:size-12 ${activePanel === 'people' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                <Users aria-hidden="true" className="size-4" />
              </button>
              {isHost && <button type="button" disabled={busy} onClick={() => void endRoom()} className="h-11 rounded-full border border-rose-200 px-4 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">End meeting</button>}
              <button type="button" onClick={() => void leaveRoom()} className="flex h-11 items-center gap-2 rounded-full bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
                <PhoneOff aria-hidden="true" className="size-4" /><span>Leave</span>
              </button>
            </div>
          </footer>
        </section>
      ) : (
        <section className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 sm:p-8" aria-labelledby="meeting-heading">
          <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
          <div className="relative flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:min-h-[25rem] sm:p-8">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_10%,rgba(59,130,246,0.12),transparent_42%),linear-gradient(145deg,#ffffff,#f8fafc)]" />
              <div className="relative max-w-lg">
                <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
                  <span className={`size-1.5 rounded-full ${meetingEnded ? 'bg-slate-400' : 'bg-blue-600'}`} />
                  {meetingEnded ? 'Meeting ended' : 'Live group room'}
                </p>
                <h1 id="meeting-heading" className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {meetingEnded ? 'This room has ended.' : roomId ? 'You are invited.' : 'Bring the class together.'}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                  {meetingEnded
                    ? 'Ask the educator to create a new meeting invite.'
                    : 'Join a shared classroom meeting. Your camera and microphone stay off until you turn them on.'}
                </p>
              </div>
              {message && <p role="status" className="relative mt-6 text-sm text-blue-700">{message}</p>}
              {error && <p role="alert" className="relative mt-4 text-sm text-rose-700">{error}</p>}
            </div>

            <div className="flex flex-col justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Meeting access</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                {roomId ? 'Ready when you are' : 'Join with an invite'}
              </h2>
              <form key={roomId} onSubmit={(event) => void joinRoom(event)} className="mt-6 space-y-3">
                <label htmlFor="meeting-invite" className="block text-sm font-medium text-slate-700">Invite link or room code</label>
                <input
                  ref={roomInputRef}
                  id="meeting-invite"
                  defaultValue={roomId}
                  autoComplete="url"
                  placeholder="Paste the classroom meeting invite"
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                <button type="submit" disabled={busy} className="min-h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  {busy && status === 'joining' ? 'Connecting…' : 'Join meeting'}
                </button>
              </form>
              {isEducator && (
                <>
                  <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-slate-500"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
                  <button type="button" disabled={busy} onClick={() => void createRoom()} className="min-h-11 w-full rounded-xl border border-blue-200 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {busy && status !== 'joining' ? 'Creating…' : 'Create a meeting'}
                  </button>
                </>
              )}
        <p className="mt-5 text-xs leading-5 text-slate-500">
                Only signed-in students and educators can join. Camera and microphone permissions are requested only when you enable those controls.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

function ParticipantTile({
  participant,
  local,
  raised,
  updateKey,
}: {
  participant: LiveKitParticipant
  local: boolean
  raised: boolean
  updateKey: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioPublications = [...participant.audioTrackPublications.values()]
  const cameraTrack = participant.getTrackPublication(Track.Source.Camera)?.track
  const screenTrack = participant.getTrackPublication(Track.Source.ScreenShare)?.track
  const videoTrack = screenTrack ?? cameraTrack

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoTrack) return
    videoTrack.attach(video)
    return () => {
      videoTrack.detach(video)
    }
  }, [videoTrack, updateKey])

  return (
    <article className="relative min-h-36 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      {videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={local}
          aria-label={`${participant.name || 'Participant'} video`}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_35%,rgba(59,130,246,0.12),transparent_50%),linear-gradient(145deg,#e2e8f0,#f8fafc)]">
          <span className="flex size-16 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xl font-semibold text-blue-700">
            {(participant.name || 'O').slice(0, 1).toUpperCase()}
          </span>
          <span className="mt-3 text-xs text-slate-600">{participant.isCameraEnabled ? 'Camera starting…' : 'Camera off'}</span>
        </div>
      )}
      {audioPublications.map((publication) => (
        publication.track && !local
          ? <AudioTrack key={publication.trackSid} track={publication.track} />
          : null
      ))}
      {raised && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1.5 text-[10px] font-semibold text-amber-800 shadow-lg">
          <Hand aria-hidden="true" className="size-3.5" />
          Hand raised
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
        <span className="max-w-[75%] truncate text-xs font-medium text-white">{participant.name || 'Participant'}{local ? ' · You' : ''}</span>
        <span className="rounded-full bg-black/40 p-1.5 text-white" aria-label={participant.isMicrophoneEnabled ? 'Microphone on' : 'Microphone off'}>
          {participant.isMicrophoneEnabled ? <Mic aria-hidden="true" className="size-3.5" /> : <MicOff aria-hidden="true" className="size-3.5" />}
        </span>
      </div>
    </article>
  )
}

function AudioTrack({ track }: { track: LiveKitTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    track.attach(audio)
    return () => {
      track.detach(audio)
    }
  }, [track])

  return <audio ref={audioRef} autoPlay />
}

function ControlButton({
  label,
  active,
  disabled = false,
  onClick,
  icon,
}: {
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
  icon: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex size-11 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:size-12 ${active ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
    >
      {icon}
    </button>
  )
}
