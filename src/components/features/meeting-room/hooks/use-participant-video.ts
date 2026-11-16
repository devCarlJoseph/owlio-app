import { useEffect, useRef } from 'react'
import { Track, type Participant } from 'livekit-client'

export function useParticipantVideo(participant: Participant | undefined, updateKey: number) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const camera = participant?.getTrackPublication(Track.Source.Camera)
  const screen = participant?.getTrackPublication(Track.Source.ScreenShare)
  const screenTrack = screen?.isMuted ? undefined : screen?.track
  const videoTrack = screenTrack ?? (camera?.isMuted ? undefined : camera?.track)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoTrack) return
    videoTrack.attach(video)
    return () => { videoTrack.detach(video) }
  }, [videoTrack, updateKey])
  return { videoRef, videoTrack, screenTrack }
}
