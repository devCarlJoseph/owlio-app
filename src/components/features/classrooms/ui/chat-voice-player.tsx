import { useEffect, useRef, useState } from 'react'
import { getClassroomVoiceMessage, type ClassroomVoiceType } from '@/services/api/classroom-chat.service'
import { useAudioObjectUrl } from '../hooks/use-audio-object-url'
import { ChatVoiceWaveform } from './chat-voice-waveform'

export function ChatVoicePlayer({ classroomId, messageId, voiceType, mine }: {
  classroomId: string
  messageId: string
  voiceType: ClassroomVoiceType
  mine: boolean
}) {
  const request = useRef<AbortController | null>(null)
  const { url, setAudio } = useAudioObjectUrl()
  const [audio, setBlob] = useState<Blob | null>(null)
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
      if (!controller.signal.aborted) { setAudio(audio); setBlob(audio) }
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
    <ChatVoiceWaveform audio={audio} url={url} loading={loading} audioLabel="Voice message playback" className={mine ? undefined : 'text-brand-soft-foreground'}
      onLoad={() => void load()} onError={() => { setAudio(null); setBlob(null) }} />
    {error && <p role="alert" className="text-xs">{error}</p>}
  </div>
}
