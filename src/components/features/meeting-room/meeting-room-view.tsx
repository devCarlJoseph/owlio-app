import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Room, RoomEvent } from 'livekit-client'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import { Button } from '@/components/ui/button'
import { formatSessionCode, getSessionIdFromInvite } from '@/lib/session-code'
import { getApiErrorMessage } from '@/services/api/api-error'
import { createMeeting, endMeeting, joinMeeting, sendMeetingMessage, setMeetingHand } from '@/services/api/meeting.service'
import { ClassroomSessions } from '@/components/features/connected-workspace/classroom-sessions'
import { MeetingRoomScreen } from './meeting-room-screen'
import { useNativeMeetingData } from './use-native-meeting-data'
import type { MeetingCategory, MeetingPanel, RoomStatus } from './meeting-room-types'

export default function MeetingRoomPage() {
  const [params] = useSearchParams()
  return params.has('session') || params.has('join') || params.has('room') ? <MeetingRoomSession key={params.get('session') ?? 'join'} /> : <MeetingDirectory />
}
function MeetingDirectory() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  return <div className="space-y-6"><header className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold">Meeting Room</h2><Link className="text-sm underline" to={'/' + role + '/classrooms/meeting-room?join=1'}>Use a session invite</Link></header><ClassroomSessions /></div>
}
function MeetingRoomSession() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { user } = useAuthSession()
  const [params, setParams] = useSearchParams()
  const sessionId = getSessionIdFromInvite(params.get('session') ?? '')
  const [activeSessionId, setActiveSessionId] = useState(sessionId)
  const code = activeSessionId ? formatSessionCode(activeSessionId) : ''
  const category = ['educators', 'esl', 'tutors'].includes(params.get('category') ?? '') ? params.get('category') as MeetingCategory : null
  const roomInputRef = useRef<HTMLInputElement>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const roomRef = useRef<Room | null>(null)
  const operation = useRef(0)
  const pending = useRef(false)
  const [status, setStatus] = useState<RoomStatus>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [micOn, setMicOn] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [screenOn, setScreenOn] = useState(false)
  const [revision, setRevision] = useState(0)
  const [pinned, setPinned] = useState<string | null>(null)
  const [panel, setPanel] = useState<MeetingPanel | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [handUpdating, setHandUpdating] = useState(false)
  const retryMessage = useRef<{ body: string; requestId: string } | null>(null)
  const data = useNativeMeetingData(room, activeSessionId)
  const canManage = Boolean(user?.roles.some(item => ['EDUCATOR', 'ESL', 'TUTOR'].includes(item)))
  useEffect(() => () => { ++operation.current; void roomRef.current?.disconnect(true); roomRef.current = null }, [])
  useEffect(() => {
    if (!room) return
    const update = () => {
      setRevision(value => value + 1)
      setMicOn(room.localParticipant.isMicrophoneEnabled)
      setCameraOn(room.localParticipant.isCameraEnabled)
      setScreenOn(room.localParticipant.isScreenShareEnabled)
    }
    const reconnecting = () => setStatus('reconnecting')
    const reconnected = () => setStatus('connected')
    const disconnected = () => { setRoom(null); roomRef.current = null; setStatus('ended'); setMicOn(false); setCameraOn(false); setScreenOn(false); setChatDraft(''); retryMessage.current = null }
    const events = [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.TrackSubscribed, RoomEvent.TrackUnsubscribed, RoomEvent.TrackMuted, RoomEvent.TrackUnmuted, RoomEvent.LocalTrackPublished, RoomEvent.LocalTrackUnpublished] as const
    events.forEach(event => room.on(event, update))
    room.on(RoomEvent.Reconnecting, reconnecting).on(RoomEvent.Reconnected, reconnected).on(RoomEvent.Disconnected, disconnected)
    return () => {
      events.forEach(event => room.off(event, update))
      room.off(RoomEvent.Reconnecting, reconnecting).off(RoomEvent.Reconnected, reconnected).off(RoomEvent.Disconnected, disconnected)
    }
  }, [room])
  const readInvite = () => {
    const value = getSessionIdFromInvite(roomInputRef.current?.value ?? code)
    if (!value) throw new Error('Enter a scheduled-session invite or an OWLIO-SESSION code. Older room codes are not supported.')
    return value
  }
  const open = async () => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError(''); setMessage('')
    try {
      const selected = readInvite()
      await createMeeting(selected)
      setActiveSessionId(selected)
      setMessage('Session room opened. You can now join and share the session invite.')
    } catch (cause) { setError(getApiErrorMessage(cause, 'Could not open this session room.')) }
    finally { pending.current = false; setBusy(false) }
  }
  const join = async (event?: FormEvent) => {
    event?.preventDefault()
    if (pending.current) return
    let selected: string
    try { selected = readInvite() } catch (cause) { setError((cause as Error).message); return }
    pending.current = true; setBusy(true); setError(''); setMessage(''); setStatus('joining')
    const request = ++operation.current
    const next = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = next
    try {
      const credentials = await joinMeeting(selected)
      if (request !== operation.current) return
      await next.connect(credentials.url, credentials.token, { autoSubscribe: true })
      if (request !== operation.current) { await next.disconnect(true); return }
      setActiveSessionId(selected); setRoom(next); setStatus('connected')
    } catch (cause) {
      await next.disconnect(true).catch(() => undefined)
      if (request !== operation.current) return
      roomRef.current = null; setStatus('idle'); setError(getApiErrorMessage(cause, 'Could not join this session room.'))
    } finally { if (request === operation.current) { pending.current = false; setBusy(false) } }
  }
  const leave = async () => {
    ++operation.current
    const current = roomRef.current; roomRef.current = null
    setRoom(null); setStatus('idle'); setMicOn(false); setCameraOn(false); setScreenOn(false); setChatDraft(''); setPanel(null); retryMessage.current = null
    await current?.disconnect(true)
  }
  const end = async () => {
    if (!activeSessionId || pending.current) return
    pending.current = true; setBusy(true); setError('')
    try { await endMeeting(activeSessionId); await leave(); setStatus('ended'); setMessage('Meeting closure requested. Participants will be disconnected as the service completes cleanup.') }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not end this meeting.')) }
    finally { pending.current = false; setBusy(false) }
  }
  const device = async (kind: 'microphone' | 'camera' | 'screen') => {
    if (!room) return
    setError('')
    try {
      if (kind === 'microphone') { await room.localParticipant.setMicrophoneEnabled(!micOn); setMicOn(!micOn) }
      if (kind === 'camera') { await room.localParticipant.setCameraEnabled(!cameraOn); setCameraOn(!cameraOn) }
      if (kind === 'screen') { await room.localParticipant.setScreenShareEnabled(!screenOn); setScreenOn(!screenOn) }
    } catch { setError('Could not change your ' + kind + '. Check device permissions and room settings.') }
  }
  const hand = async () => {
    const own = data.state?.ownParticipant
    if (!room || !own || handUpdating) return
    setHandUpdating(true); setError('')
    try { await setMeetingHand(activeSessionId, !own.handRaisedAt, own.version); data.refresh() }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not change your raised hand.')); data.refresh() }
    finally { setHandUpdating(false) }
  }
  const send = async (event: FormEvent) => {
    event.preventDefault()
    const body = chatDraft.trim()
    if (!room || !body || chatSending) return
    if (body.length > 2000) { setError('Messages must be 2000 characters or fewer.'); return }
    if (retryMessage.current?.body !== body) retryMessage.current = { body, requestId: crypto.randomUUID() }
    const requestId = retryMessage.current.requestId
    setChatSending(true); setError('')
    try { await sendMeetingMessage(activeSessionId, requestId, body); setChatDraft(''); retryMessage.current = null; data.refresh() }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not send your message. Your draft is still here.')) }
    finally { setChatSending(false) }
  }
  const identity = (userId: string) => userId === user?.id ? room?.localParticipant.identity ?? userId : data.directory.find(item => item.userId === userId)?.mediaIdentity ?? userId
  const copy = async () => {
    const invite = new URL(window.location.href); invite.search = ''; invite.searchParams.set('session', activeSessionId)
    try { await navigator.clipboard.writeText(invite.toString()); setMessage('Session invite copied.') }
    catch { setMessage('Share this session code: ' + formatSessionCode(activeSessionId)) }
  }
  return <div className="space-y-4">
    {!room && <p className="text-sm text-muted-foreground">Use a scheduled-session invite. Teachers can open their own session room before joining. <Link className="underline" to={'/' + role + '/schedule'}>View sessions</Link></p>}
    {room && <p className="text-xs text-muted-foreground">Connected to a scheduled session. Presence is not official attendance.</p>}
    <MeetingRoomScreen role={role} meetingCategory={category} backHref={'/' + role + '/classrooms/meeting-room'} roomId={activeSessionId} meetingCode={code} roomInputRef={roomInputRef}
      status={status} preview={false} hasRoom={Boolean(room)} apiEnabled canCreate={canManage} isHost={data.state?.isHost ?? false} busy={busy}
      message={message} error={error || data.error} participants={room ? [room.localParticipant, ...room.remoteParticipants.values()] : []} localIdentity={room?.localParticipant.identity}
      pinnedIdentity={pinned} onPin={setPinned} raisedHands={Object.fromEntries((data.state?.raisedHands ?? []).map(item => [identity(item.userId), true]))} revision={revision}
      micOn={micOn} cameraOn={cameraOn} screenOn={screenOn} handUpdating={handUpdating} activePanel={panel} onPanel={next => setPanel(current => current === next ? null : next)} unreadMessages={0}
      messages={data.messages.map(item => ({ id: item.id, identity: identity(item.authorId), authorName: item.authorName, text: item.body, sentAt: Date.parse(item.createdAt) }))}
      chatDraft={chatDraft} onChatDraft={setChatDraft} chatSending={chatSending} onSendChat={event => void send(event)} onJoin={event => void join(event)} onCreate={() => void open()}
      onPreview={() => {}} onCopy={() => void copy()} onLeave={() => void leave()} onEnd={() => void end()} onMicrophone={() => void device('microphone')} onCamera={() => void device('camera')} onScreen={() => void device('screen')} onHand={() => void hand()} />
    {!room && <Button variant="outline" onClick={() => { setError(''); setParams({ join: '1' }) }}>Use another invite</Button>}
  </div>
}
