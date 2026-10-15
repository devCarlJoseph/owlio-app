import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft,
  Copy,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Users,
  Video,
  VideoOff,
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
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const roomRef = useRef<Room | null>(null)
  const isEducator = user?.roles.includes('EDUCATOR') ?? false

  useEffect(() => {
    if (!room) return

    const refresh = () => setRevision((current) => current + 1)
    const reconnecting = () => setStatus('reconnecting')
    const reconnected = () => setStatus('connected')
    const disconnected = () => {
      setStatus('ended')
      setRoom(null)
      setJoinInfo(null)
      setMicOn(false)
      setCameraOn(false)
      setScreenOn(false)
    }

    room
      .on(RoomEvent.ParticipantConnected, refresh)
      .on(RoomEvent.ParticipantDisconnected, refresh)
      .on(RoomEvent.TrackSubscribed, refresh)
      .on(RoomEvent.TrackUnsubscribed, refresh)
      .on(RoomEvent.TrackMuted, refresh)
      .on(RoomEvent.TrackUnmuted, refresh)
      .on(RoomEvent.Reconnecting, reconnecting)
      .on(RoomEvent.Reconnected, reconnected)
      .on(RoomEvent.Disconnected, disconnected)

    return () => {
      room
        .off(RoomEvent.ParticipantConnected, refresh)
        .off(RoomEvent.ParticipantDisconnected, refresh)
        .off(RoomEvent.TrackSubscribed, refresh)
        .off(RoomEvent.TrackUnsubscribed, refresh)
        .off(RoomEvent.TrackMuted, refresh)
        .off(RoomEvent.TrackUnmuted, refresh)
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
    <main className="fixed inset-0 z-50 flex min-h-svh flex-col overflow-hidden bg-[#111817] text-white">
      <header className="flex min-h-[4.5rem] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#151d1b] px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            to={classroomPath}
            aria-label="Back to classrooms"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">Classroom meeting</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {roomId ? `Room ${roomId.slice(0, 8)}…` : 'LiveKit group meeting'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {roomId && (
            <button
              type="button"
              onClick={() => void copyInvite()}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 px-3 text-xs text-slate-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <Copy aria-hidden="true" className="size-3.5" />
              <span className="hidden sm:inline">Copy invite</span>
            </button>
          )}
          {room && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-medium text-emerald-100">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              {status === 'reconnecting' ? 'Reconnecting' : 'Live'}
            </span>
          )}
        </div>
      </header>

      {room ? (
        <section className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-3 sm:p-5">
            <div className="flex shrink-0 items-center justify-between gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2"><Users aria-hidden="true" className="size-4" />{participants.length} connected</span>
              <span>{status === 'reconnecting' ? 'Restoring your connection…' : 'Audio and video are live'}</span>
            </div>
            <div className="grid min-h-0 flex-1 auto-rows-fr gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
              {participants.map((participant) => (
                <ParticipantTile
                  key={participant.identity}
                  participant={participant}
                  local={participant.identity === room.localParticipant.identity}
                  updateKey={revision}
                />
              ))}
            </div>
            {error && <p role="alert" className="shrink-0 text-center text-sm text-rose-300">{error}</p>}
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#151d1b] px-3 py-3 sm:px-5">
            <p className="hidden text-xs text-slate-400 lg:block">{participants.length} of {room.numParticipants || participants.length} participants</p>
            <div className="mx-auto flex items-center gap-3">
              <ControlButton label={micOn ? 'Turn microphone off' : 'Turn microphone on'} active={micOn} onClick={() => void toggleMicrophone()} icon={micOn ? <Mic /> : <MicOff />} />
              <ControlButton label={cameraOn ? 'Turn camera off' : 'Turn camera on'} active={cameraOn} onClick={() => void toggleCamera()} icon={cameraOn ? <Video /> : <VideoOff />} />
              <ControlButton label={screenOn ? 'Stop presenting' : 'Share screen'} active={screenOn} onClick={() => void toggleScreenShare()} icon={<MonitorUp />} />
              {isHost && <button type="button" disabled={busy} onClick={() => void endRoom()} className="h-11 rounded-full border border-rose-300/30 px-4 text-xs font-semibold text-rose-200 hover:bg-rose-400/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">End meeting</button>}
              <button type="button" onClick={() => void leaveRoom()} className="flex h-11 items-center gap-2 rounded-full bg-[#d84b4b] px-4 text-xs font-semibold text-white hover:bg-[#ec5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <PhoneOff aria-hidden="true" className="size-4" /><span>Leave</span>
              </button>
            </div>
          </footer>
        </section>
      ) : (
        <section className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 sm:p-8" aria-labelledby="meeting-heading">
          <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
            <div className="relative flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-[#202a28] p-6 sm:min-h-[25rem] sm:p-8">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_10%,rgba(103,157,128,0.28),transparent_42%),radial-gradient(ellipse_at_15%_100%,rgba(232,175,101,0.12),transparent_40%),linear-gradient(145deg,#263431,#151c1b)]" />
              <div className="relative max-w-lg">
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100/15 bg-white/5 px-3 py-1.5 text-xs text-emerald-100">
                  <span className={`size-1.5 rounded-full ${meetingEnded ? 'bg-slate-400' : 'bg-emerald-300'}`} />
                  {meetingEnded ? 'Meeting ended' : 'Live group room'}
                </p>
                <h1 id="meeting-heading" className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {meetingEnded ? 'This room has ended.' : roomId ? 'You are invited.' : 'Bring the class together.'}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                  {meetingEnded
                    ? 'Ask the educator to create a new meeting invite.'
                    : 'Join a shared classroom meeting. Your camera and microphone stay off until you turn them on.'}
                </p>
              </div>
              {message && <p role="status" className="relative mt-6 text-sm text-emerald-200">{message}</p>}
              {error && <p role="alert" className="relative mt-4 text-sm text-rose-300">{error}</p>}
            </div>

            <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-[#192220] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Meeting access</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                {roomId ? 'Ready when you are' : 'Join with an invite'}
              </h2>
              <form key={roomId} onSubmit={(event) => void joinRoom(event)} className="mt-6 space-y-3">
                <label htmlFor="meeting-invite" className="block text-sm font-medium text-slate-200">Invite link or room code</label>
                <input
                  ref={roomInputRef}
                  id="meeting-invite"
                  defaultValue={roomId}
                  autoComplete="url"
                  placeholder="Paste the classroom meeting invite"
                  className="min-h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                />
                <button type="submit" disabled={busy} className="min-h-11 w-full rounded-xl bg-[#f1c078] px-4 text-sm font-semibold text-[#1e332d] transition hover:bg-[#f6ce91] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  {busy && status === 'joining' ? 'Connecting…' : 'Join meeting'}
                </button>
              </form>
              {isEducator && (
                <>
                  <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-slate-500"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
                  <button type="button" disabled={busy} onClick={() => void createRoom()} className="min-h-11 w-full rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
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
  updateKey,
}: {
  participant: LiveKitParticipant
  local: boolean
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
    <article className="relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-[#202a28]">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_35%,rgba(103,157,128,0.2),transparent_50%),linear-gradient(145deg,#263431,#151c1b)]">
          <span className="flex size-16 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl font-semibold text-emerald-100">
            {(participant.name || 'O').slice(0, 1).toUpperCase()}
          </span>
          <span className="mt-3 text-xs text-slate-300">{participant.isCameraEnabled ? 'Camera starting…' : 'Camera off'}</span>
        </div>
      )}
      {audioPublications.map((publication) => (
        publication.track && !local
          ? <AudioTrack key={publication.trackSid} track={publication.track} />
          : null
      ))}
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
  onClick,
  icon,
}: {
  label: string
  active: boolean
  onClick: () => void
  icon: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex size-11 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:size-12 ${active ? 'border-emerald-200/20 bg-emerald-100/15 text-emerald-100 hover:bg-emerald-100/25' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
    >
      {icon}
    </button>
  )
}
