import { useEffect, useRef, useState } from 'react'
import { Hand, Mic, MicOff, Pin } from 'lucide-react'
import { Participant, ParticipantEvent, type Track as LiveKitTrack } from 'livekit-client'
import { useParticipantVideo } from './use-participant-video'

export function ParticipantTile({ participant, local, raised, pinned, onPinToggle, updateKey, classroom = false }: {
  participant: Participant
  local: boolean
  raised: boolean
  pinned: boolean
  onPinToggle: () => void
  updateKey: number
  classroom?: boolean
}) {
  const [speaking, setSpeaking] = useState(participant.isSpeaking)
  useEffect(() => {
    if (!classroom) return
    const update = (value: boolean) => setSpeaking(value)
    participant.on(ParticipantEvent.IsSpeakingChanged, update)
    return () => { participant.off(ParticipantEvent.IsSpeakingChanged, update) }
  }, [participant, classroom])
  const { videoRef, videoTrack, screenTrack } = useParticipantVideo(participant, updateKey)
  return <article className={`meeting-tile ${pinned ? 'meeting-tile-pinned' : ''}`} data-speaking={classroom && speaking || undefined} aria-label={`${participant.name || 'Participant'}${local ? ', you' : ''}${classroom && speaking ? ', speaking' : ''}`}>
    {videoTrack ? <video ref={videoRef} autoPlay playsInline muted={local} aria-label={`${participant.name || 'Participant'} video`} className={`absolute inset-0 size-full ${screenTrack ? 'object-contain' : 'object-cover'}`} />
      : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><span className="meeting-avatar text-2xl">{(participant.name || 'O').slice(0, 1).toUpperCase()}</span><span className="text-xs opacity-65">{participant.isCameraEnabled ? 'Camera starting…' : 'Camera off'}</span></div>}
    {[...participant.audioTrackPublications.values()].map(publication => publication.track && !local ? <AudioTrack key={publication.trackSid} track={publication.track} /> : null)}
    {raised && <span className="meeting-hand"><Hand aria-hidden="true" className="size-3" />Hand raised</span>}
    <button type="button" onClick={onPinToggle} aria-label={`${pinned ? 'Unpin' : 'Pin'} ${participant.name || 'participant'} ${pinned ? 'from' : 'for'} your view`} aria-pressed={pinned} className="meeting-tile-pin"><Pin aria-hidden="true" className="size-3.5" /></button>
    <div className="meeting-tile-caption"><span className="truncate">{participant.name || 'Participant'}{local ? ' · You' : ''}{screenTrack ? ' · Presenting' : ''}</span><span aria-label={participant.isMicrophoneEnabled ? 'Microphone on' : 'Microphone off'}>{participant.isMicrophoneEnabled ? <Mic aria-hidden="true" className="size-3.5" /> : <MicOff aria-hidden="true" className="size-3.5" />}</span></div>
  </article>
}

export function AudioTrack({ track }: { track: LiveKitTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    track.attach(audio)
    return () => { track.detach(audio) }
  }, [track])
  return <audio ref={audioRef} autoPlay />
}
