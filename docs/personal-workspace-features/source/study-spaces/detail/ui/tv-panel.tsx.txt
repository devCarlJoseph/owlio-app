import { useState } from "react"
import { Tv, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseYouTubeId, roomTvNotice, youTubeEmbedUrl, type RoomTvVideo } from "./room-tv"

type TvPanelProps = {
  video: RoomTvVideo | null
  isLeader: boolean
  onSave: (video: RoomTvVideo | null) => void
  onClose: () => void
}

export function TvPanel({ video, isLeader, onSave, onClose }: TvPanelProps) {
  const [draft, setDraft] = useState(video?.url ?? "")
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const videoId = parseYouTubeId(draft)
    if (!videoId) {
      setError("Paste a full https YouTube link, for example https://www.youtube.com/watch?v=…")
      return
    }
    setError(null)
    onSave({ url: draft.trim(), videoId })
  }

  return (
    <div
      role="dialog"
      aria-label="Room TV"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-x-3 top-3 z-20 mx-auto flex w-[720px] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Tv className="size-4 text-emerald-800" aria-hidden="true" />
          Room TV
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close room TV">
          <X aria-hidden="true" />
        </Button>
      </div>

      {video ? (
        <div className="aspect-video w-full bg-black">
          <iframe
            title="Room TV video"
            src={youTubeEmbedUrl(video.videoId)}
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="size-full border-0"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-slate-900 px-6 text-center text-sm text-slate-300">
          {isLeader
            ? "The TV is off. Paste a YouTube link below to set the video for this room."
            : "No video is set. Paste a YouTube link below to watch something on your own TV."}
        </div>
      )}

      <form
        className="space-y-2 border-t border-slate-100 p-3"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <label htmlFor="tv-url" className="text-xs font-medium text-slate-600">
          {isLeader ? "Video for the group (leader)" : "Your video (only you see this)"}
        </label>
        <div className="flex gap-2">
          <Input
            id="tv-url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            aria-invalid={error !== null}
            inputMode="url"
          />
          <Button type="submit" size="sm">
            Play
          </Button>
          {video ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setDraft("")
                setError(null)
                onSave(null)
              }}
            >
              Turn off
            </Button>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-xs text-red-700">
            {error}
          </p>
        ) : null}
        <p className="text-xs leading-5 text-slate-500">{roomTvNotice} Only https YouTube links are accepted.</p>
      </form>
    </div>
  )
}
