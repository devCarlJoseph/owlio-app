import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chatDurationLabel } from '../utils/chat-format'

const barCount = 32
const placeholder = Array<number>(barCount).fill(0.22)

async function analyzeAudio(audio: Blob) {
  const context = new OfflineAudioContext(1, 1, 16000)
  const decoded = await context.decodeAudioData(await audio.arrayBuffer())
  const samples = decoded.getChannelData(0)
  const bars = Array.from({ length: barCount }, (_, index) => {
    const start = Math.floor(index * samples.length / barCount)
    const end = Math.floor((index + 1) * samples.length / barCount)
    let energy = 0
    for (let sample = start; sample < end; sample++) energy += samples[sample] ** 2
    return Math.sqrt(energy / Math.max(1, end - start))
  })
  const max = Math.max(0.03, ...bars)
  return { duration: decoded.duration, bars: bars.map(level => 0.14 + 0.86 * (level / max) ** 1.4) }
}

export function ChatVoiceWaveform({ audio, url, loading, onLoad, audioLabel, onError, className }: {
  audio: Blob | null
  url: string | null
  loading?: boolean
  onLoad?: () => void
  audioLabel: string
  onError?: () => void
  className?: string
}) {
  const player = useRef<HTMLAudioElement>(null)
  const [analysis, setAnalysis] = useState<{ audio: Blob; duration: number; bars: number[] } | null>(null)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!audio || typeof OfflineAudioContext === 'undefined') return
    let active = true
    void analyzeAudio(audio).then(result => {
      if (active) setAnalysis({ audio, ...result })
    }).catch(() => { /* Playback can still be supported by the media element. */ })
    return () => { active = false }
  }, [audio])

  const currentWave = analysis?.audio === audio ? analysis : null
  const total = url ? duration || currentWave?.duration || 0 : 0
  const progress = total ? Math.min(position / total, 1) : 0
  const label = onLoad ? 'voice message' : 'recording preview'

  const syncDuration = (element: HTMLAudioElement) => {
    if (Number.isFinite(element.duration)) setDuration(element.duration)
  }
  const handleError = () => {
    setPlaying(false)
    setPosition(0)
    setDuration(0)
    setError('This recording could not be played.')
    onError?.()
  }
  const toggle = async () => {
    setError('')
    if (!player.current) { onLoad?.(); return }
    if (!player.current.paused) { player.current.pause(); return }
    try { await player.current.play() }
    catch { setError('Playback could not start. Try again.') }
  }

  return <div className={cn('min-w-0 space-y-1', className)}>
    {url && <audio ref={player} aria-label={audioLabel} src={url} preload="metadata" autoPlay={Boolean(onLoad)}
      onLoadedMetadata={event => syncDuration(event.currentTarget)}
      onDurationChange={event => syncDuration(event.currentTarget)}
      onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onEnded={event => { event.currentTarget.currentTime = 0; setPosition(0); setPlaying(false) }}
      onError={handleError} />}
    <div className="flex min-w-0 items-center gap-1.5">
      <button type="button" disabled={loading} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`}
        onClick={() => void toggle()} className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground ring-1 ring-current outline-none hover:bg-brand/85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70">
        {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
          : playing ? <Pause aria-hidden="true" className="size-4 fill-current" />
            : <Play aria-hidden="true" className="ml-0.5 size-4 fill-current" />}
      </button>
      <div className="relative flex h-8 min-w-0 flex-1 items-center rounded-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2">
        <div aria-hidden="true" className="flex h-5 w-full items-end gap-px">
          {(currentWave?.bars ?? placeholder).map((bar, index) => <span key={index}
            className={cn('min-w-0 flex-1 rounded-full bg-current', !currentWave ? 'opacity-35' : progress > 0 && (index + 0.5) / barCount > progress && 'opacity-45')}
            style={{ height: `${bar * 100}%` }} />)}
        </div>
        {url && total > 0 && <input type="range" aria-label={`Seek ${label}`} min={0} max={total} step={0.05}
          value={Math.min(position, total)} className="absolute inset-0 size-full cursor-pointer opacity-0"
          onChange={event => {
            const next = event.currentTarget.valueAsNumber
            if (player.current) { player.current.currentTime = next; setPosition(next) }
          }} />}
      </div>
      <span className="shrink-0 text-[11px] tabular-nums">{total ? chatDurationLabel(Math.ceil(position || total)) : '–:––'}</span>
    </div>
    {error && <p role="alert" className="text-xs">{error}</p>}
  </div>
}
