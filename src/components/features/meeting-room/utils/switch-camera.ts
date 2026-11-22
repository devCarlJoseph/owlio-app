import type { LocalVideoTrack } from 'livekit-client'

export const cameraSwitchError = 'Could not switch cameras. Check that another camera is available and allowed by your browser.'
const lastFacingMode = new WeakMap<LocalVideoTrack, 'user' | 'environment'>()

export async function switchCamera(track: LocalVideoTrack, isCurrent: () => boolean) {
  const previous = track.mediaStreamTrack.getSettings()
  const facingMode = (previous.facingMode ?? lastFacingMode.get(track)) === 'environment' ? 'user' : 'environment'

  try {
    await track.restartTrack({ facingMode })
    const selected = track.mediaStreamTrack.getSettings()
    if (selected.facingMode ? selected.facingMode !== facingMode : !selected.deviceId || selected.deviceId === previous.deviceId) {
      return false
    }
    lastFacingMode.set(track, facingMode)
    return true
  } catch {
    if (isCurrent() && track.mediaStreamTrack.readyState === 'ended') {
      try {
        await track.restartTrack(previous.deviceId ? { deviceId: { exact: previous.deviceId } } : { facingMode: facingMode === 'user' ? 'environment' : 'user' })
      } catch {
        track.stop()
      }
    }
    return false
  } finally {
    if (!isCurrent()) track.stop()
  }
}
