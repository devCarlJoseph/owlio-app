import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { getClassroomVoiceMessage, type ClassroomVoiceType } from '@/services/api/classroom-chat.service'
import { useAudioObjectUrl } from '../hooks/use-audio-object-url'

export function ChatVoicePlayer({ classroomId, messageId, voiceType }: {
  classroomId: string
  messageId: string
  voiceType: ClassroomVoiceType
}) {
  const request = useRef<AbortController | null>(null)
  const { url, setAudio } = useAudioObjectUrl()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => () => request.current?.abort(), [])

  const load = async () => {
    if (request.current && !request.current.signal.aborted) return
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError('')
    try {
      const audio = await getClassroomVoiceMessage(classroomId, messageId, controller.signal)
      if (audio.type !== voiceType) throw new Error('Unexpected audio format.')
      if (!controller.signal.aborted) setAudio(audio)
    } catch {
      if (!controller.signal.aborted) setError('Could not load audio. Try again.')
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
        request.current = null
      }
    }
  }

  return <div className="w-56 max-w-full min-w-0 space-y-1">
    {url ? <audio aria-label="Voice message playback" className="w-full min-w-0" controls controlsList="nodownload" autoPlay src={url}
      onError={() => { setAudio(null); setError('This recording could not be played.') }} />
      : <button type="button" aria-label="Play voice message" disabled={loading} onClick={() => void load()} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-1 text-left font-medium outline-none hover:bg-current/5 focus-visible:ring-2 focus-visible:ring-current disabled:opacity-70">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-foreground/25"><Play aria-hidden="true" className="size-4 fill-current" /></span>
        {loading ? 'Loading audio…' : 'Voice message'}
      </button>}
    {error && <p role="alert" className="text-xs">{error}</p>}
  </div>
}
