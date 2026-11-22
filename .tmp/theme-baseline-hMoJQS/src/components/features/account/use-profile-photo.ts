import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getProfilePhoto, type ProfilePhoto } from '@/services/api/profile-photo.service'

type PhotoState = {
  owner: string
  photo?: ProfilePhoto
  revision: number
  error?: string
}
export type ProfilePhotoContext = ReturnType<typeof useProfilePhoto>

export function useProfilePhoto(userId: string | undefined) {
  const [state, setState] = useState<PhotoState>()
  const [attempt, setAttempt] = useState(0)
  const pending = useRef<{ owner: string; controller: AbortController } | null>(null)

  useEffect(() => {
    if (!userId) return
    const load = () => {
      pending.current?.controller.abort()
      const controller = new AbortController()
      pending.current = { owner: userId, controller }
      void getProfilePhoto(controller.signal)
        .then(photo => {
          if (controller.signal.aborted) return
          setState(previous => ({ owner: userId, photo, revision: (previous?.revision ?? 0) + 1 }))
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return
          setState(previous => ({
            owner: userId,
            photo: previous?.owner === userId ? previous.photo : undefined,
            revision: previous?.revision ?? 0,
            error: getApiErrorMessage(error, 'Could not load your profile photo.'),
          }))
        })
    }
    load()
    const timer = window.setInterval(load, 12 * 60 * 1000)
    return () => {
      window.clearInterval(timer)
      pending.current?.controller.abort()
    }
  }, [attempt, userId])

  const update = useCallback((photo: ProfilePhoto) => {
    if (!userId) return
    if (pending.current?.owner === userId) pending.current.controller.abort()
    setState(previous => {
      if (previous?.owner !== userId) return previous
      return { owner: userId, photo, revision: previous.revision + 1 }
    })
  }, [userId])

  return {
    current: state?.owner === userId ? state : undefined,
    reload: () => setAttempt(value => value + 1),
    update,
  }
}
