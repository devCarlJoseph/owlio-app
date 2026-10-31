import { useEffect, useRef } from 'react'
import { Hand, Mic, MicOff, Pin } from 'lucide-react'
import { Participant, Track, type Track as LiveKitTrack } from 'livekit-client'

export function ParticipantTile({ participant, local, raised, pinned, onPinToggle, updateKey }: {
  participant: Participant
  local: boolean
  raised: boolean
  pinned: boolean
  onPinToggle: () => void
  updateKey: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const camera = participant.getTrackPublication(Track.Source.Camera)
  const screen = participant.getTrackPublication(Track.Source.ScreenShare)
  const screenTrack = screen?.isMuted ? undefined : screen?.track
  const videoTrack = screenTrack ?? (camera?.isMuted ? undefined : camera?.track)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoTrack) return
    videoTrack.attach(video)
    return () => { videoTrack.detach(video) }
  }, [videoTrack, updateKey])
  return <article className={`meeting-tile ${pinned ? 'meeting-tile-pinned' : ''}`} aria-label={`${participant.name || 'Participant'}${local ? ', you' : ''}`}>
    {videoTrack ? <video ref={videoRef} autoPlay playsInline muted={local} aria-label={`${participant.name || 'Participant'} video`} className={`absolute inset-0 size-full ${screenTrack ? 'object-contain' : 'object-cover'}`} />
      : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><span className="meeting-avatar text-2xl">{(participant.name || 'O').slice(0, 1).toUpperCase()}</span><span className="text-xs opacity-65">{participant.isCameraEnabled ? 'Camera starting…' : 'Camera off'}</span></div>}
    {[...participant.audioTrackPublications.values()].map(publication => publication.track && !local ? <AudioTrack key={publication.trackSid} track={publication.track} /> : null)}
    {raised && <span className="meeting-hand"><Hand aria-hidden="true" className="size-3" />Hand raised</span>}
    <button type="button" onClick={onPinToggle} aria-label={`${pinned ? 'Unpin' : 'Pin'} ${participant.name || 'participant'} ${pinned ? 'from' : 'for'} your view`} aria-pressed={pinned} className="meeting-tile-pin"><Pin aria-hidden="true" className="size-3.5" /></button>
    <div className="meeting-tile-caption"><span className="truncate">{participant.name || 'Participant'}{local ? ' · You' : ''}{screenTrack ? ' · Presenting' : ''}</span><span aria-label={participant.isMicrophoneEnabled ? 'Microphone on' : 'Microphone off'}>{participant.isMicrophoneEnabled ? <Mic aria-hidden="true" className="size-3.5" /> : <MicOff aria-hidden="true" className="size-3.5" />}</span></div>
  </article>
}

function AudioTrack({ track }: { track: LiveKitTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    track.attach(audio)
    return () => { track.detach(audio) }
  }, [track])
  return <audio ref={audioRef} autoPlay />
}
