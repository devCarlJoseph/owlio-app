export const roomTvNotice =
  "Playback is local to this browser. Other students do not see what you watch."

export const roomTvStoragePrefix = "owlio.study-space-tv.v1."

export type RoomTvVideo = { url: string; videoId: string }

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

// Accepts only https YouTube links and returns the 11-character video id.
export function parseYouTubeId(input: string): string | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== "https:") return null

  const host = url.hostname.replace(/^www\.|^m\./, "")
  let id: string | null = null

  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, value] = url.pathname.split("/")
    if (kind === "watch") id = url.searchParams.get("v")
    else if (kind === "embed" || kind === "shorts" || kind === "live") id = value ?? null
  }

  return id && VIDEO_ID.test(id) ? id : null
}

export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
}

export function loadRoomTvVideo(spaceId: string): RoomTvVideo | null {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(`${roomTvStoragePrefix}${spaceId}`)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<RoomTvVideo>
    return typeof parsed.url === "string" && typeof parsed.videoId === "string" && VIDEO_ID.test(parsed.videoId)
      ? { url: parsed.url, videoId: parsed.videoId }
      : null
  } catch {
    return null
  }
}

export function saveRoomTvVideo(spaceId: string, video: RoomTvVideo | null): void {
  if (typeof window === "undefined") return

  try {
    const key = `${roomTvStoragePrefix}${spaceId}`
    if (video) window.localStorage.setItem(key, JSON.stringify(video))
    else window.localStorage.removeItem(key)
  } catch {
    return
  }
}
