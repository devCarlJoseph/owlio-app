import { Music, Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { focusMusicTracks, isTrackPlayable, type MusicTrack } from "./focus-music"

export type MusicPlayback = {
  trackId: string | null
  playing: boolean
  volume: number
  elapsedSeconds: number
  error: string | null
}

type FocusMusicPanelProps = {
  playback: MusicPlayback
  onPlay: (track: MusicTrack) => void
  onPause: () => void
  onPrevious: () => void
  onNext: () => void
  onVolumeChange: (volume: number) => void
  onClose: () => void
}

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function FocusMusicPanel({
  playback,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onVolumeChange,
  onClose,
}: FocusMusicPanelProps) {
  const activeTrack = focusMusicTracks.find((track) => track.id === playback.trackId) ?? null
  const playableTracks = focusMusicTracks.filter(isTrackPlayable)

  return (
    <div
      role="dialog"
      aria-label="Focus music"
      className="absolute right-3 top-3 z-20 flex w-72 max-w-[90%] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Music className="size-4 text-emerald-800" aria-hidden="true" />
          Focus music
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close focus music">
          <X aria-hidden="true" />
        </Button>
      </div>

      <ul className="max-h-56 overflow-y-auto p-2" aria-label="Music tracks">
        {focusMusicTracks.map((track) => {
          const playable = isTrackPlayable(track)
          const active = playback.trackId === track.id
          return (
            <li key={track.id}>
              <button
                type="button"
                disabled={!playable}
                onClick={() => onPlay(track)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                  active ? "bg-emerald-50" : "hover:bg-slate-50"
                } ${playable ? "" : "opacity-60"}`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
                    active ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {active && playback.playing ? (
                    <Pause className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="size-3.5" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800">{track.title}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {track.category}
                    {playable ? "" : " · needs an audio file"}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-1 border-t border-slate-100 px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onPrevious}
          disabled={playableTracks.length < 2}
          aria-label="Previous track"
        >
          <SkipBack aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!activeTrack}
          aria-label={playback.playing ? "Pause" : "Play"}
          onClick={() => (playback.playing ? onPause() : activeTrack && onPlay(activeTrack))}
        >
          {playback.playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onNext}
          disabled={playableTracks.length < 2}
          aria-label="Next track"
        >
          <SkipForward aria-hidden="true" />
        </Button>
        <span className="ml-1 flex-1 truncate text-xs text-slate-500" aria-live="polite">
          {activeTrack
            ? `${activeTrack.title} · ${formatElapsed(playback.elapsedSeconds)}`
            : "Nothing playing"}
        </span>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
        <Volume2 className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
        <label htmlFor="music-volume" className="sr-only">
          Volume
        </label>
        <input
          id="music-volume"
          type="range"
          min={0}
          max={100}
          value={Math.round(playback.volume * 100)}
          onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
          className="h-1.5 w-full accent-emerald-700"
        />
      </div>

      {playback.error ? (
        <p role="alert" className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {playback.error}
        </p>
      ) : null}
    </div>
  )
}
