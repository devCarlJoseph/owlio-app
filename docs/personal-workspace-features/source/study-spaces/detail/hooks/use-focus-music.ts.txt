import { useEffect, useRef, useState } from "react"
import { FocusMusicEngine, focusMusicTracks, isTrackPlayable, type MusicTrack } from "./focus-music"
import type { MusicPlayback } from "./focus-music-panel"

const MUSIC_STORAGE_KEY = "owlio.study-space-music.v1"
const DEFAULT_TRACK_ID = "lofi-loop"

function loadMusicPreference(): { trackId: string | null; volume: number } {
  const fallback = { trackId: null, volume: 0.7 }
  if (typeof window === "undefined") return fallback

  try {
    const parsed = JSON.parse(window.localStorage.getItem(MUSIC_STORAGE_KEY) ?? "null") as {
      trackId?: unknown
      volume?: unknown
    } | null
    return {
      trackId: typeof parsed?.trackId === "string" ? parsed.trackId : null,
      volume: typeof parsed?.volume === "number" ? Math.min(Math.max(parsed.volume, 0), 1) : 0.7,
    }
  } catch {
    return fallback
  }
}

export function useFocusMusic() {
  const engineRef = useRef<FocusMusicEngine | null>(null)
  const [playback, setPlayback] = useState<MusicPlayback>(() => ({
    ...loadMusicPreference(),
    playing: false,
    elapsedSeconds: 0,
    error: null,
  }))

  useEffect(() => {
    try {
      window.localStorage.setItem(
        MUSIC_STORAGE_KEY,
        JSON.stringify({ trackId: playback.trackId, volume: playback.volume })
      )
    } catch {
      return
    }
  }, [playback.trackId, playback.volume])

  useEffect(() => {
    return () => {
      engineRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (!playback.playing) return
    const interval = window.setInterval(
      () => setPlayback((current) => ({ ...current, elapsedSeconds: current.elapsedSeconds + 1 })),
      1000
    )
    return () => window.clearInterval(interval)
  }, [playback.playing])

  function getEngine(): FocusMusicEngine | null {
    if (!engineRef.current) {
      const engine = new FocusMusicEngine()
      if (!engine.supported) return null
      engine.setVolume(playback.volume)
      engineRef.current = engine
    }
    return engineRef.current
  }

  function play(track: MusicTrack) {
    if (!isTrackPlayable(track)) return
    const engine = getEngine()
    if (!engine) {
      setPlayback((current) => ({ ...current, error: "Audio playback is not supported in this browser." }))
      return
    }

    try {
      engine.play(track)
      setPlayback((current) => ({
        ...current,
        trackId: track.id,
        playing: true,
        elapsedSeconds: current.trackId === track.id ? current.elapsedSeconds : 0,
        error: null,
      }))
    } catch {
      setPlayback((current) => ({ ...current, playing: false, error: "This track could not be played." }))
    }
  }

  function pause() {
    const engine = engineRef.current
    if (!engine) return
    // Generated ambience is continuous, so pausing stops its nodes; resuming restarts the sound.
    engine.stop()
    setPlayback((current) => ({ ...current, playing: false }))
  }

  // Starts the last chosen track (or Lo-fi) from a user gesture, or pauses the current one.
  function toggle() {
    if (playback.playing) {
      pause()
      return
    }
    const track =
      focusMusicTracks.find((entry) => entry.id === playback.trackId && isTrackPlayable(entry)) ??
      focusMusicTracks.find((entry) => entry.id === DEFAULT_TRACK_ID) ??
      focusMusicTracks.find(isTrackPlayable)
    if (track) play(track)
  }

  function playAdjacent(direction: 1 | -1) {
    const playable = focusMusicTracks.filter(isTrackPlayable)
    if (playable.length === 0) return
    const index = playable.findIndex((track) => track.id === playback.trackId)
    const next = playable[(index + direction + playable.length) % playable.length]
    play(next)
  }

  function setVolume(volume: number) {
    engineRef.current?.setVolume(volume)
    setPlayback((current) => ({ ...current, volume }))
  }

  return {
    playback,
    play,
    pause,
    toggle,
    next: () => playAdjacent(1),
    previous: () => playAdjacent(-1),
    setVolume,
  }
}
