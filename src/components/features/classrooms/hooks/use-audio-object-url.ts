import { useEffect, useRef, useState } from 'react'

export function useAudioObjectUrl() {
  const active = useRef<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => () => {
    if (active.current) URL.revokeObjectURL(active.current)
  }, [])

  const setAudio = (audio: Blob | null) => {
    if (active.current) URL.revokeObjectURL(active.current)
    active.current = audio ? URL.createObjectURL(audio) : null
    setUrl(active.current)
  }
  return { url, setAudio }
}
