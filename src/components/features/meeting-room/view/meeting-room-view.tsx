import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Room, RoomEvent, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { Button } from '@/components/ui/button'
import { formatSessionCode, getSessionIdFromInvite } from '@/lib/session-code'
import { parseMeetingInvite } from '@/lib/meeting-invite'
import { getApiErrorMessage } from '@/services/api/api-error'
import { createMeeting, openClassroomMeeting, endMeeting, joinMeeting, sendMeetingMessage, setMeetingHand, resolveMeetingInvite } from '@/services/api/meeting.service'
import { ClassroomSessions } from '@/components/features/connected-workspace/view/classroom-sessions'
import EslWhiteboardPreview from '@/components/features/esl-teaching/meeting-room/view/esl-whiteboard-preview'
import { shouldShowEslWhiteboardPreview } from '@/components/features/esl-teaching/meeting-room/utils/esl-whiteboard-preview-route'
import { MeetingRoomHub } from './meeting-room-hub'
import { MeetingRoomScreen } from './meeting-room-screen'
import { MeetingRoomShell } from '../ui/meeting-room-shell'
import { useNativeMeetingData } from '../hooks/use-native-meeting-data'
import { usePrejoinDevices } from '../hooks/use-prejoin-devices'
import type { MeetingCategory, MeetingPanel, RoomStatus } from '../types/meeting-room-types'

export default function MeetingRoomPage() {
  const { pathname } = useLocation()
  const { user } = useAuthSession()
  const [params] = useSearchParams()
  const role = getDashboardRole(pathname) ?? 'students'
  if (shouldShowEslWhiteboardPreview(role, params.get('whiteboard-preview'))) return <EslWhiteboardPreview />
  if (params.get('layout-preview') === '1') return <MeetingLayoutPreview />
  return params.has('session') || params.has('join') || params.has('room') ? <MeetingRoomSession key={(user?.id ?? 'anonymous') + ':' + role + ':' + (params.get('session') ?? params.get('room') ?? 'join')} /> : <MeetingDirectory />
}
function MeetingDirectory() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  return params.get('source') === 'account'
    ? <div className="space-y-5"><Link className="text-sm text-muted-foreground underline" to={pathname}>Back to Meeting Room</Link><ClassroomSessions /></div>
    : <MeetingRoomHub />
}

// Layout previews never request media permissions or call meeting mutation APIs.
function MeetingLayoutPreview() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const [params, setParams] = useSearchParams()
  const roomInputRef = useRef<HTMLInputElement>(null)
  const [panel, setPanel] = useState<MeetingPanel | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const category = ['educators', 'esl', 'tutors'].includes(params.get('category') ?? '') ? params.get('category') as MeetingCategory : null
  const leave = () => { const next = new URLSearchParams(params); next.delete('layout-preview'); next.delete('join'); setParams(next) }
  return <MeetingRoomScreen role={role} meetingCategory={category} backHref={'/' + role + '/classrooms/meeting-room'}
    roomId={null} meetingCode="" roomInputRef={roomInputRef} status="idle" preview hasRoom={false} apiEnabled={false}
    canCreate={false} isHost={false} busy={false} message="" error="" participants={[]} pinnedIdentity={pinned} onPin={setPinned}
    raisedHands={{}} revision={0} micOn={false} cameraOn={false} screenOn={false} handUpdating={false}
    activePanel={panel} onPanel={next => setPanel(current => current === next ? null : next)} unreadMessages={0} messages={[]}
    chatDraft="" onChatDraft={() => {}} chatSending={false} onSendChat={event => event.preventDefault()}
    onJoin={event => event.preventDefault()} onCreate={() => {}} onPreview={() => {}} onCopy={() => {}} onLeave={leave}
    onEnd={() => {}} onMicrophone={() => {}} onCamera={() => {}} onScreen={() => {}} onHand={() => {}} />
}
function MeetingRoomSession() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { user } = useAuthSession()
  const [params, setParams] = useSearchParams()
  const sessionId = getSessionIdFromInvite(params.get('session') ?? '')
  const [activeSessionId, setActiveSessionId] = useState(sessionId)
  const [shortCode, setShortCode] = useState(() => {
    const value = params.get('code') ?? params.get('room') ?? ''
    return /^OWLIO-?(?:[A-Z0-9]{4}|[A-Z0-9]{8})$/i.test(value) ? value.toUpperCase() : ''
  })
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
  const devices = usePrejoinDevices()
  const devicePending = useRef(false)
  const [deviceBusy, setDeviceBusy] = useState(false)
  const [revision, setRevision] = useState(0)
  const [pinned, setPinned] = useState<string | null>(null)
  const [panel, setPanel] = useState<MeetingPanel | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const chatPending = useRef(false)
  const [outgoing, setOutgoing] = useState<{ requestId: string; body: string; sentAt: number; failed?: boolean }[]>([])
  const [handUpdating, setHandUpdating] = useState(false)
  const data = useNativeMeetingData(room, activeSessionId)
  const code = shortCode || data.state?.meetingCode || (activeSessionId ? formatSessionCode(activeSessionId) : '')
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
    const disconnected = () => { if (roomRef.current !== room) return; ++operation.current; setRoom(null); roomRef.current = null; setStatus('ended'); setMicOn(false); setCameraOn(false); setScreenOn(false); setChatDraft(''); setOutgoing([]); chatPending.current = false; setChatSending(false) }
    const events = [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.TrackSubscribed, RoomEvent.TrackUnsubscribed, RoomEvent.TrackMuted, RoomEvent.TrackUnmuted, RoomEvent.LocalTrackPublished, RoomEvent.LocalTrackUnpublished] as const
    events.forEach(event => room.on(event, update))
    room.on(RoomEvent.Reconnecting, reconnecting).on(RoomEvent.Reconnected, reconnected).on(RoomEvent.Disconnected, disconnected)
    return () => {
      events.forEach(event => room.off(event, update))
      room.off(RoomEvent.Reconnecting, reconnecting).off(RoomEvent.Reconnected, reconnected).off(RoomEvent.Disconnected, disconnected)
    }
  }, [room])
  const readInvite = async () => {
    const input = (roomInputRef.current?.value || code || activeSessionId).trim()
    const invite = parseMeetingInvite(input)
    if (invite && 'code' in invite) {
      const resolved = await resolveMeetingInvite(invite.code)
      setShortCode(resolved.meetingCode)
      return { ...resolved, reusable: /^OWLIO-?[A-Z0-9]{8}$/.test(invite.code) }
    }
    if (!invite) throw new Error('Enter your classroom meeting code or a scheduled-session invite.')
    return { sessionId: invite.sessionId, classroomId: null, reusable: false }
  }
  const open = async () => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError(''); setMessage('')
    try {
      const selected = await readInvite()
      if (selected.reusable && selected.classroomId) {
        const opened = await openClassroomMeeting(selected.classroomId)
        setActiveSessionId(opened.sessionId)
        if (opened.meetingCode) setShortCode(opened.meetingCode)
      } else {
        if (!selected.sessionId) throw new Error('The teacher has not opened this meeting yet.')
        const opened = await createMeeting(selected.sessionId)
        if (opened.meetingCode) setShortCode(opened.meetingCode)
        setActiveSessionId(selected.sessionId)
      }
      setMessage('Session room opened. You can now join and share the session invite.')
    } catch (cause) { setError(getApiErrorMessage(cause, 'Could not open this session room.')) }
    finally { pending.current = false; setBusy(false) }
  }
  const join = async (event?: FormEvent) => {
    event?.preventDefault()
    if (pending.current || devices.busy || devicePending.current) return
    pending.current = true; setBusy(true); setError('')
    const request = ++operation.current
    let selected: string
    try {
      const invite = await readInvite()
      if (!invite.sessionId) throw new Error('Your teacher has not opened this classroom meeting yet. Try again when it starts.')
      selected = invite.sessionId
    } catch (cause) { if (request !== operation.current) return; pending.current = false; setBusy(false); setError(getApiErrorMessage(cause, 'Could not resolve this meeting invite.')); return }
    if (request !== operation.current) return
    pending.current = true; setBusy(true); setError(''); setMessage(''); setStatus('joining')
    const next = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = next
    let joiningTracks: (LocalAudioTrack | LocalVideoTrack)[] = []
    try {
      const credentials = await joinMeeting(selected)
      if (request !== operation.current) return
      await next.connect(credentials.url, credentials.token, { autoSubscribe: true })
      if (request !== operation.current) { await next.disconnect(true); return }
      joiningTracks = devices.takeTracks()
      const publications = await Promise.allSettled(joiningTracks.map(track => next.localParticipant.publishTrack(track)))
      publications.forEach((result, index) => { if (result.status === 'rejected') joiningTracks[index].stop() })
      if (request !== operation.current || next.state !== 'connected') {
        joiningTracks.forEach(track => track.stop())
        await next.disconnect(true)
        if (request === operation.current) throw new Error('The meeting disconnected. Please join again.')
        return
      }
      setMicOn(next.localParticipant.isMicrophoneEnabled); setCameraOn(next.localParticipant.isCameraEnabled)
      if (publications.some(result => result.status === 'rejected')) setError('Connected, but a selected device could not be shared. Try enabling it again in the meeting.')
      setActiveSessionId(selected); setRoom(next); setStatus('connected')
    } catch (cause) {
      joiningTracks.forEach(track => track.stop())
      await next.disconnect(true).catch(() => undefined)
      if (request !== operation.current) return
      roomRef.current = null; setStatus('idle'); setError(getApiErrorMessage(cause, 'Could not join this session room.'))
    } finally { if (request === operation.current) { pending.current = false; setBusy(false) } }
  }
  const leave = async () => {
    ++operation.current
    pending.current = false; setBusy(false); devices.stop()
    const current = roomRef.current; roomRef.current = null
    setRoom(null); setStatus('idle'); setMicOn(false); setCameraOn(false); setScreenOn(false); setChatDraft(''); setOutgoing([]); chatPending.current = false; setChatSending(false); setPanel(null)
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
    if (pending.current || devicePending.current) return
    if (!room) {
      if (kind !== 'screen') { setError(''); await devices.toggle(kind) }
      return
    }
    if (status !== 'connected') return
    const current = room
    devicePending.current = true; setDeviceBusy(true); setError('')
    try {
      if (kind === 'microphone') await current.localParticipant.setMicrophoneEnabled(!current.localParticipant.isMicrophoneEnabled)
      if (kind === 'camera') await current.localParticipant.setCameraEnabled(!current.localParticipant.isCameraEnabled)
      if (kind === 'screen') await current.localParticipant.setScreenShareEnabled(!current.localParticipant.isScreenShareEnabled)
      if (roomRef.current !== current) { await current.disconnect(true); return }
      setMicOn(current.localParticipant.isMicrophoneEnabled); setCameraOn(current.localParticipant.isCameraEnabled); setScreenOn(current.localParticipant.isScreenShareEnabled)
    } catch { if (roomRef.current === current) setError('Could not change your ' + kind + '. Check device permissions and room settings.') }
    finally { devicePending.current = false; setDeviceBusy(false) }
  }
  const hand = async () => {
    const own = data.state?.ownParticipant
    if (!room || !own || handUpdating) return
    setHandUpdating(true); setError('')
    try { await setMeetingHand(activeSessionId, !own.handRaisedAt, own.version); data.refresh() }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not change your raised hand.')); data.refresh() }
    finally { setHandUpdating(false) }
  }
  const sendMessage = async (body: string, requestId: string = crypto.randomUUID()) => {
    if (!room || !body || chatPending.current || status !== 'connected') return
    if (body.length > 2000) { setError('Messages must be 2000 characters or fewer.'); return }
    const current = room, request = operation.current
    chatPending.current = true; setChatSending(true); setError('')
    setOutgoing(items => [...items.filter(item => item.requestId !== requestId), { requestId, body, sentAt: Date.now() }])
    try {
      const saved = await sendMeetingMessage(activeSessionId, requestId, body)
      if (request !== operation.current || roomRef.current !== current) return
      data.addMessage(saved); setOutgoing(items => items.filter(item => item.requestId !== requestId))
    } catch (cause) {
      if (request !== operation.current || roomRef.current !== current) return
      setOutgoing(items => items.map(item => item.requestId === requestId ? { ...item, failed: true } : item))
      setError(getApiErrorMessage(cause, 'Could not send your message. Retry it in the chat.'))
    } finally {
      if (request === operation.current && roomRef.current === current) { chatPending.current = false; setChatSending(false) }
    }
  }
  const send = (event: FormEvent) => {
    event.preventDefault()
    const body = chatDraft.trim()
    if (!room || !body || chatPending.current || status !== 'connected' || body.length > 2000) return
    setChatDraft(''); void sendMessage(body)
  }
  const identity = (userId: string) => userId === user?.id ? room?.localParticipant.identity ?? userId : data.directory.find(item => item.userId === userId)?.mediaIdentity ?? userId
  const copy = async () => {
    const invite = new URL(window.location.href); invite.search = ''; if (/^OWLIO-?(?:[A-Z0-9]{4}|[A-Z0-9]{8})$/.test(code)) invite.searchParams.set('room', code); else invite.searchParams.set('session', activeSessionId)
    try { await navigator.clipboard.writeText(invite.toString()); setMessage('Session invite copied.') }
    catch { setMessage('Share this session code: ' + code) }
  }
  return <MeetingRoomShell connected={Boolean(room)}>
    {!room && <p className="text-sm text-muted-foreground">Use your classroom meeting code or a scheduled-session invite. Teachers can open their classroom room before joining. <Link className="underline" to={'/' + role + '/schedule?source=account'}>View sessions</Link></p>}
    {room && <p className="shrink-0 text-xs text-muted-foreground">Connected to a scheduled session. Presence is not official attendance.</p>}
    <MeetingRoomScreen role={role} meetingCategory={category} backHref={'/' + role + '/classrooms/meeting-room'} roomId={activeSessionId} meetingCode={code} roomInputRef={roomInputRef}
      status={status} preview={false} hasRoom={Boolean(room)} apiEnabled canCreate={canManage} isHost={data.state?.isHost ?? false} busy={busy}
      message={message} error={error || devices.error || data.error} participants={room ? [room.localParticipant, ...room.remoteParticipants.values()] : []} localIdentity={room?.localParticipant.identity}
      participantNames={Object.fromEntries(data.directory.map(item => [item.mediaIdentity, item.name]))}
      pinnedIdentity={pinned} onPin={setPinned} raisedHands={Object.fromEntries((data.state?.raisedHands ?? []).map(item => [identity(item.userId), true]))} revision={revision}
      previewCameraTrack={devices.cameraTrack} deviceBusy={devices.busy || deviceBusy} micOn={room ? micOn : devices.micOn} cameraOn={room ? cameraOn : devices.cameraOn} screenOn={screenOn} handUpdating={handUpdating} activePanel={panel} onPanel={next => setPanel(current => current === next ? null : next)} unreadMessages={0}
      messages={[...data.messages.map(item => ({ id: item.id, identity: identity(item.authorId), authorName: item.authorName, text: item.body, sentAt: Date.parse(item.createdAt) })), ...outgoing.map(item => ({ id: item.requestId, identity: room?.localParticipant.identity ?? '', text: item.body, sentAt: item.sentAt, delivery: item.failed ? 'failed' as const : 'sending' as const, onRetry: () => { void sendMessage(item.body, item.requestId) } }))]}
      chatDraft={chatDraft} onChatDraft={setChatDraft} chatSending={chatSending} onSendChat={event => void send(event)} onJoin={event => void join(event)} onCreate={() => void open()}
      onPreview={() => {}} onCopy={() => void copy()} onLeave={() => void leave()} onEnd={() => void end()} onMicrophone={() => void device('microphone')} onCamera={() => void device('camera')} onScreen={() => void device('screen')} onHand={() => void hand()} />
    {!room && <Button variant="outline" disabled={busy} onClick={() => { void leave(); setError(''); setShortCode(''); setActiveSessionId(''); setParams({ join: '1' }) }}>Use another invite</Button>}
  </MeetingRoomShell>
}
