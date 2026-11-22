import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Mic, Send, Square, X } from 'lucide-react'
import { getApiErrorMessage } from '@/services/api/api-error'
import { classroomVoiceLimit } from '@/services/api/classroom-chat.service'
import { useAudioObjectUrl } from '../hooks/use-audio-object-url'
import { ChatVoiceWaveform } from '../ui/chat-voice-waveform'
import { chatDurationLabel } from '../utils/chat-format'

const recordingTypes = ['audio/mp4;codecs=mp4a.40.2', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4']
const maxSeconds = 30

type Capture = { stream?: MediaStream; recorder?: MediaRecorder; timer?: number; clock?: number; sendOnStop?: boolean; replyToId: string | null }
type Recording = { audio: Blob; requestId: string; replyToId: string | null }

function releaseCapture(capture: Capture) {
  window.clearTimeout(capture.timer)
  window.clearInterval(capture.clock)
  const { recorder, stream } = capture
  if (recorder) {
    recorder.ondataavailable = null
    recorder.onstop = null
    recorder.onerror = null
    if (recorder.state !== 'inactive') recorder.stop()
  }
  stream?.getTracks().forEach(track => track.stop())
}

export function ChatVoiceRecorder({ disabled, triggerClassName, onStart, onSend, replyToId, renderComposer }: {
  disabled: boolean
  triggerClassName: string
  onStart: () => void
  onSend: (audio: Blob, requestId: string, replyToId: string | null) => Promise<boolean>
  replyToId: string | null
  renderComposer: (mic?: ReactNode) => ReactNode
}) {
  const [sending, setSending] = useState(false)
  const activeCapture = useRef<Capture | null>(null)
  const activeSend = useRef<Recording | null>(null)
  const mic = useRef<HTMLButtonElement>(null)
  const stopButton = useRef<HTMLButtonElement>(null)
  const sendButton = useRef<HTMLButtonElement>(null)
  const discardButton = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef(false)
  const [phase, setPhase] = useState<'idle' | 'requesting' | 'recording' | 'stopping'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [recording, setRecording] = useState<Recording | null>(null)
  const [error, setError] = useState('')
  const { url, setAudio } = useAudioObjectUrl()

  useEffect(() => () => {
    if (activeCapture.current) releaseCapture(activeCapture.current)
    activeCapture.current = null
    activeSend.current = null
  }, [])

  useEffect(() => {
    if (phase === 'requesting') discardButton.current?.focus()
    else if (phase === 'recording') stopButton.current?.focus()
    else if (recording && !sending) sendButton.current?.focus()
    else if (phase === 'idle' && !recording && restoreFocus.current) {
      if (disabled) return
      mic.current?.focus()
      restoreFocus.current = false
    }
  }, [disabled, phase, recording, sending])

  const send = async (clip: Recording) => {
    if (activeSend.current) return
    activeSend.current = clip
    setSending(true)
    setError('')
    try {
      const sent = await onSend(clip.audio, clip.requestId, clip.replyToId)
      if (activeSend.current !== clip) return
      if (sent) { setAudio(null); setRecording(null) }
      else setError('The recording could not be sent. Try again.')
    } catch (cause) {
      if (activeSend.current === clip) setError(getApiErrorMessage(cause, 'The recording could not be sent. Try again.'))
    } finally {
      if (activeSend.current === clip) {
        activeSend.current = null
        setSending(false)
      }
    }
  }

  const start = async () => {
    if (activeCapture.current) return
    const type = typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function'
      && recordingTypes.find(format => MediaRecorder.isTypeSupported(format))
    if (!type || !navigator.mediaDevices?.getUserMedia) {
      setError('Voice recording is unavailable in this browser.')
      return
    }
    const capture: Capture = { replyToId }
    activeCapture.current = capture
    restoreFocus.current = true
    onStart()
    setError('')
    setElapsed(0)
    setPhase('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (activeCapture.current !== capture) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      capture.stream = stream
      const recorder = new MediaRecorder(stream, { mimeType: type, audioBitsPerSecond: 48_000 })
      capture.recorder = recorder
      const chunks: Blob[] = []
      let size = 0
      recorder.ondataavailable = event => {
        if (!event.data.size) return
        size += event.data.size
        if (size <= classroomVoiceLimit) chunks.push(event.data)
        else if (recorder.state === 'recording') recorder.stop()
      }
      recorder.onstop = () => {
        releaseCapture(capture)
        activeCapture.current = null
        setPhase('idle')
        if (size > classroomVoiceLimit) setError('The recording was too large. Try a shorter clip.')
        else if (!size) setError('No audio was recorded. Try again.')
        else {
          const audio = new Blob(chunks, { type: type.split(';')[0] })
          const clip = { audio, requestId: crypto.randomUUID(), replyToId: capture.replyToId }
          setAudio(audio)
          setRecording(clip)
          if (capture.sendOnStop) void send(clip)
        }
      }
      recorder.onerror = () => {
        releaseCapture(capture)
        activeCapture.current = null
        setPhase('idle')
        setError('Recording stopped unexpectedly. Try again.')
      }
      recorder.start(250)
      const startedAt = performance.now()
      capture.clock = window.setInterval(() => setElapsed(Math.min(maxSeconds, (performance.now() - startedAt) / 1000)), 250)
      capture.timer = window.setTimeout(() => { if (recorder.state === 'recording') recorder.stop() }, maxSeconds * 1000)
      setPhase('recording')
    } catch (cause) {
      if (activeCapture.current !== capture) return
      releaseCapture(capture)
      activeCapture.current = null
      setPhase('idle')
      setError(cause instanceof DOMException && cause.name === 'NotAllowedError'
        ? 'Allow microphone access in your browser to record a voice message.'
        : 'The microphone could not be started. Check your audio input and try again.')
    }
  }

  const stop = (sendOnStop = false) => {
    const capture = activeCapture.current
    if (capture?.recorder?.state !== 'recording') return
    capture.sendOnStop = sendOnStop
    setPhase('stopping')
    capture.recorder.stop()
  }

  const discard = () => {
    if (activeSend.current) return
    if (activeCapture.current) releaseCapture(activeCapture.current)
    activeCapture.current = null
    setAudio(null)
    setRecording(null)
    setPhase('idle')
    setError('')
  }

  if (phase === 'idle' && !recording) return <>
    {error && <p role="alert" className="mb-1 text-xs text-destructive">{error}</p>}
    {renderComposer(<button ref={mic} type="button" disabled={disabled} className={triggerClassName} aria-label="Record voice message" onClick={() => void start()}>
      <Mic aria-hidden="true" className="size-4" />
    </button>)}
  </>

  return <>
    {error && <p role="alert" className="mb-1 text-xs text-destructive">{error}</p>}
    <div role="group" aria-label="Voice recording" className="flex min-w-0 items-center gap-1 text-brand"
      onKeyDown={event => {
        if (event.key === 'Escape' && !sending) { event.preventDefault(); discard() }
      }}>
      {recording ? <ChatVoiceWaveform audio={recording.audio} url={url} audioLabel="Preview voice message"
        className="min-w-0 flex-1 rounded-full bg-brand-soft px-2 py-1 text-brand-soft-foreground" />
        : <div className="flex min-h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-brand px-1.5 py-1 text-brand-foreground">
          {phase === 'recording' && <button ref={stopButton} type="button" aria-label="Stop recording" onClick={() => stop()}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-foreground text-brand outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-brand">
            <Square aria-hidden="true" className="size-3.5 fill-current" />
          </button>}
          <span role="status" className={phase === 'recording' ? 'sr-only' : 'px-2 text-xs'}>{phase === 'recording' ? 'Recording voice message' : phase === 'requesting' ? 'Waiting for microphone…' : 'Finishing recording…'}</span>
          {phase === 'recording' && <span className="shrink-0 rounded-full bg-brand-foreground px-2 py-0.5 text-xs font-medium text-brand tabular-nums">{chatDurationLabel(elapsed)}</span>}
        </div>}
      <button ref={sendButton} type="button" disabled={sending || disabled || (!recording && phase !== 'recording')}
        className={triggerClassName} aria-label={sending ? 'Sending voice message' : 'Send voice message'}
        onClick={() => recording ? void send(recording) : stop(true)}><Send aria-hidden="true" className="size-5" /></button>
      <button ref={discardButton} type="button" disabled={sending} className={triggerClassName} aria-label="Discard recording" onClick={discard}>
        <span className="grid size-5 place-items-center rounded-full bg-brand text-brand-foreground"><X aria-hidden="true" className="size-3.5" /></span>
      </button>
    </div>
  </>
}
