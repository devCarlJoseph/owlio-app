import { useEffect, useRef, useState } from 'react'
import { Video } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { openPeerMeeting } from '@/services/api/meeting.service'

export function StartPeerMeeting({ spaceId }: { spaceId?: string }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const active = useRef(false)
  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])

  async function open() {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const room = await openPeerMeeting(spaceId)
      if (active.current) {
        navigate('/students/classrooms/meeting-room?' + new URLSearchParams({ room: room.meetingCode }))
      }
    } catch (cause) {
      if (active.current) setError(getApiErrorMessage(cause, 'Could not open the student meeting.'))
    } finally {
      pending.current = false
      if (active.current) setBusy(false)
    }
  }

  return <div className="min-w-0">
    <Button disabled={busy} onClick={() => void open()}>
      <Video aria-hidden="true" />{busy ? 'Opening meeting…' : spaceId ? 'Open study meeting' : 'Create meeting room'}
    </Button>
    {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
  </div>
}
