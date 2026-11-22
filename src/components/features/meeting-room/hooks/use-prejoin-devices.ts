import { useCallback, useEffect, useRef, useState } from 'react'
import { createLocalAudioTrack, createLocalVideoTrack, TrackEvent, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client'
import { cameraSwitchError, switchCamera } from '../utils/switch-camera'

export type PreviewDevice = 'microphone' | 'camera'
type PreviewTrack = LocalAudioTrack | LocalVideoTrack
type Devices = Partial<Record<PreviewDevice, PreviewTrack>>

function deviceError(cause: unknown, kind: PreviewDevice) {
  const name = cause instanceof Error ? cause.name : ''
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return 'Allow ' + kind + ' access in your browser’s site settings, then try again.'
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'No ' + kind + ' was found. Connect a device, then try again.'
  if (name === 'NotReadableError' || name === 'TrackStartError') return 'Your ' + kind + ' is unavailable or in use by another app. Close that app, then try again.'
  return 'Could not start your ' + kind + '. Check device permissions and use HTTPS or localhost.'
}

// Own tracks until explicitly handed to a connected room. Never capture on mount.
export function usePrejoinDevices() {
  const owned = useRef<Devices>({})
  const generation = useRef(0)
  const endedHandlers = useRef(new Map<PreviewTrack, () => void>())
  const pending = useRef(new Set<PreviewDevice>())
  const [tracks, setTracks] = useState<Devices>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => () => {
    ++generation.current
    endedHandlers.current.forEach((handler, track) => track.off(TrackEvent.Ended, handler))
    endedHandlers.current.clear()
    Object.values(owned.current).forEach(track => track.stop())
    owned.current = {}
    pending.current.clear()
  }, [])
  const takeTracks = useCallback(() => {
    ++generation.current // Late permission results must never reopen devices.
    const selected = Object.values(owned.current)
    selected.forEach(track => {
      const ended = endedHandlers.current.get(track)
      if (ended) track.off(TrackEvent.Ended, ended)
      endedHandlers.current.delete(track)
    })
    owned.current = {}
    pending.current.clear()
    setTracks({}); setBusy(false); setError('')
    return selected
  }, [])
  const stop = useCallback(() => { takeTracks().forEach(track => track.stop()) }, [takeTracks])
  const toggle = async (kind: PreviewDevice) => {
    if (pending.current.has(kind)) return
    setError('')
    const previous = owned.current[kind]
    if (previous) {
      delete owned.current[kind]
      const ended = endedHandlers.current.get(previous)
      if (ended) previous.off(TrackEvent.Ended, ended)
      endedHandlers.current.delete(previous)
      previous.stop()
      setTracks({ ...owned.current })
      return
    }
    const request = generation.current
    pending.current.add(kind); setBusy(true)
    try {
      const track = kind === 'microphone' ? await createLocalAudioTrack() : await createLocalVideoTrack()
      if (request !== generation.current) { track.stop(); return }
      owned.current[kind] = track
      const ended = () => {
        track.off(TrackEvent.Ended, ended)
        endedHandlers.current.delete(track)
        if (owned.current[kind] !== track) return
        delete owned.current[kind]
        track.stop()
        setTracks({ ...owned.current })
      }
      endedHandlers.current.set(track, ended)
      track.on(TrackEvent.Ended, ended)
      setTracks({ ...owned.current })
    } catch (cause) {
      if (request === generation.current) setError(deviceError(cause, kind))
    } finally {
      if (request === generation.current) { pending.current.delete(kind); setBusy(pending.current.size > 0) }
    }
  }
  const flipCamera = async () => {
    const camera = owned.current.camera as LocalVideoTrack | undefined
    if (!camera || pending.current.has('camera')) return
    const request = generation.current
    const isCurrent = () => request === generation.current && owned.current.camera === camera
    pending.current.add('camera')
    setBusy(true)
    setError('')
    try {
      const switched = await switchCamera(camera, isCurrent)
      if (!isCurrent()) return
      if (camera.mediaStreamTrack.readyState === 'ended') endedHandlers.current.get(camera)?.()
      if (!switched) setError(cameraSwitchError)
    } finally {
      if (request === generation.current) {
        pending.current.delete('camera')
        setBusy(pending.current.size > 0)
      }
    }
  }
  return { cameraTrack: tracks.camera as LocalVideoTrack | undefined, micOn: Boolean(tracks.microphone), cameraOn: Boolean(tracks.camera), busy, error, toggle, flipCamera, takeTracks, stop }
}
