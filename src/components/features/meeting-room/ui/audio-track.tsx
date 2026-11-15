import { useEffect, useRef } from 'react'
import type { Track } from 'livekit-client'

export function AudioTrack({ track }: { track: Track }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    track.attach(audio)
    return () => { track.detach(audio) }
  }, [track])
  return <audio ref={audioRef} autoPlay />
}
