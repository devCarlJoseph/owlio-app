import { useEffect, useRef, useState } from 'react'
import { Mic, Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/services/api/api-error'
import { classroomVoiceLimit } from '@/services/api/classroom-chat.service'
import { useAudioObjectUrl } from '../hooks/use-audio-object-url'

const recordingTypes = ['audio/mp4;codecs=mp4a.40.2', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4']
const maxSeconds = 30

type Capture = { stream?: MediaStream; recorder?: MediaRecorder; timer?: number }
type Recording = { audio: Blob; requestId: string }

function releaseCapture(capture: Capture) {
  window.clearTimeout(capture.timer)
  const { recorder, stream } = capture
  if (recorder) {
    recorder.ondataavailable = null
    recorder.onstop = null
    recorder.onerror = null
    if (recorder.state !== 'inactive') recorder.stop()
  }
  stream?.getTracks().forEach(track => track.stop())
}

export function ChatVoiceRecorder({ disabled, triggerClassName, onSend }: {
  disabled: boolean
  triggerClassName: string
  onSend: (audio: Blob, requestId: string) => Promise<boolean>
}) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)

  return <Dialog open={open} onOpenChange={next => { if (!sending) setOpen(next) }}>
    <DialogTrigger render={<button type="button" disabled={disabled} className={triggerClassName} />} aria-label="Record voice message" title="Record voice message">
      <Mic aria-hidden="true" className="size-4" />
    </DialogTrigger>
    <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto rounded-2xl" showCloseButton={!sending}>
      {open && <VoiceRecording onSend={onSend} onClose={() => setOpen(false)} sending={sending} onSendingChange={setSending} />}
    </DialogContent>
  </Dialog>
}

function VoiceRecording({ sending, onSendingChange, onSend, onClose }: {
  sending: boolean
  onSendingChange: (sending: boolean) => void
  onSend: (audio: Blob, requestId: string) => Promise<boolean>
  onClose: () => void
}) {
  const activeCapture = useRef<Capture | null>(null)
  const activeSend = useRef<Blob | null>(null)
  const [phase, setPhase] = useState<'idle' | 'requesting' | 'recording' | 'stopping'>('idle')
  const [recording, setRecording] = useState<Recording | null>(null)
  const [error, setError] = useState('')
  const { url, setAudio } = useAudioObjectUrl()

  useEffect(() => () => {
    if (activeCapture.current) releaseCapture(activeCapture.current)
    activeCapture.current = null
    activeSend.current = null
  }, [])

  const start = async () => {
    if (activeCapture.current) return
    const type = typeof MediaRecorder !== 'undefined' && recordingTypes.find(format => MediaRecorder.isTypeSupported(format))
    if (!type || !navigator.mediaDevices?.getUserMedia) {
      setError('Voice recording is unavailable in this browser.')
      return
    }
    const capture: Capture = {}
    activeCapture.current = capture
    setError('')
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
          setAudio(audio)
          setRecording({ audio, requestId: crypto.randomUUID() })
        }
      }
      recorder.onerror = () => {
        releaseCapture(capture)
        activeCapture.current = null
        setPhase('idle')
        setError('Recording stopped unexpectedly. Try again.')
      }
      recorder.start(250)
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

  const stop = () => {
    const recorder = activeCapture.current?.recorder
    if (recorder?.state !== 'recording') return
    setPhase('stopping')
    recorder.stop()
  }

  const send = async () => {
    if (!recording || activeSend.current) return
    activeSend.current = recording.audio
    onSendingChange(true)
    setError('')
    try {
      const sent = await onSend(recording.audio, recording.requestId)
      if (activeSend.current !== recording.audio) return
      if (sent) onClose()
      else setError('The recording could not be sent. Try again.')
    } catch (cause) {
      if (activeSend.current === recording.audio) setError(getApiErrorMessage(cause, 'The recording could not be sent. Try again.'))
    } finally {
      if (activeSend.current === recording.audio) {
        activeSend.current = null
        onSendingChange(false)
      }
    }
  }

  return <>
    <DialogHeader>
      <DialogTitle className="pr-8 text-base font-semibold">Voice message</DialogTitle>
      <DialogDescription>Record up to {maxSeconds} seconds and listen before sending.</DialogDescription>
    </DialogHeader>
    {phase === 'recording' && <p role="status" className="flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand-soft-foreground"><span className="size-2 rounded-full bg-destructive" />Recording…</p>}
    {url && <audio aria-label="Preview voice message" controls controlsList="nodownload" className="w-full min-w-0" src={url} />}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <DialogFooter>
      {recording ? <>
        <Button type="button" variant="outline" disabled={sending} onClick={() => { setAudio(null); setRecording(null); setError('') }}>Discard recording</Button>
        <Button type="button" disabled={sending} className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => void send()}><Send />{sending ? 'Sending…' : 'Send voice message'}</Button>
      </> : phase === 'recording' ? <Button type="button" onClick={stop}><Square />Stop recording</Button>
        : <Button type="button" disabled={phase !== 'idle'} onClick={() => void start()}><Mic />{phase === 'requesting' ? 'Waiting for microphone…' : phase === 'stopping' ? 'Finishing recording…' : 'Start recording'}</Button>}
    </DialogFooter>
  </>
}
