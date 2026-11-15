import { useEffect, useRef } from 'react'
import { LockKeyhole, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import type { LocalVideoTrack } from 'livekit-client'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'

export function PrejoinDevicePreview({ cameraTrack, micOn, cameraOn, disabled, onMicrophone, onCamera }: {
  cameraTrack?: LocalVideoTrack; micOn: boolean; cameraOn: boolean; disabled: boolean
  onMicrophone: () => void; onCamera: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !cameraTrack) return
    cameraTrack.attach(video)
    return () => { cameraTrack.detach(video) }
  }, [cameraTrack])
  return <div>
    <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-slate-200">
      {cameraTrack ? <video ref={videoRef} autoPlay playsInline muted aria-label="Your camera preview" className="absolute inset-0 size-full -scale-x-100 object-cover" />
        : <div className="flex flex-col items-center gap-3 text-center"><span className="grid size-20 place-items-center rounded-full bg-slate-500 text-white"><VideoOff aria-hidden="true" className="size-8" /></span><p className="text-sm font-medium">Camera is off</p></div>}
      <div role="group" aria-label="Prepare your devices" className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
        <Button type="button" size="icon" variant="ghost" aria-label={micOn ? 'Turn microphone off' : 'Turn microphone on'} aria-pressed={micOn} disabled={disabled} onClick={onMicrophone}
          className={cn('size-12 rounded-full text-white', micOn ? 'bg-slate-700 hover:bg-slate-800 hover:text-white' : 'bg-rose-600 hover:bg-rose-700 hover:text-white')}>
          {micOn ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
        </Button>
        <Button type="button" size="icon" variant="ghost" aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'} aria-pressed={cameraOn} disabled={disabled} onClick={onCamera}
          className={cn('size-12 rounded-full text-white', cameraOn ? 'bg-slate-700 hover:bg-slate-800 hover:text-white' : 'bg-rose-600 hover:bg-rose-700 hover:text-white')}>
          {cameraOn ? <Video aria-hidden="true" /> : <VideoOff aria-hidden="true" />}
        </Button>
      </div>
    </div>
    <p role="status" className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><LockKeyhole aria-hidden="true" className="size-3.5 shrink-0" />{micOn || cameraOn ? 'Local preview only. Your selected devices will be shared when you join.' : 'Your devices stay off until you choose otherwise'}</p>
  </div>
}
