import { useId, type Ref } from 'react'
import { EllipsisVertical, Search, Video, X } from 'lucide-react'
import { Link } from 'react-router'
import { Input } from '@/components/ui/input'
import type { Classroom, WorkspaceRole } from '../types/classroom-types'
const iconButton = 'inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none hover:bg-brand-soft hover:text-brand-soft-foreground focus-visible:ring-2 focus-visible:ring-ring'

export function ChatHeader({ classroom, role, searchOpen, query, onToggleSearch, onQueryChange, detailsOpen, detailsId, onToggleDetails, detailsToggleRef }: {
  classroom: Classroom
  role: WorkspaceRole
  searchOpen: boolean
  query: string
  onToggleSearch: () => void
  onQueryChange: (value: string) => void
  detailsOpen: boolean
  detailsId: string
  onToggleDetails: () => void
  detailsToggleRef: Ref<HTMLButtonElement>
}) {
  const searchId = useId()
  const meetingHref = classroom.meetingCode && !classroom.meetingId
    ? `/${role}/classrooms/meeting-room?room=${encodeURIComponent(classroom.meetingCode)}`
    : classroom.meetingId
    ? `/${role}/classrooms/meeting-room?session=${encodeURIComponent(classroom.meetingId)}&code=${encodeURIComponent(classroom.meetingCode ?? '')}`
    : null

  return <header className="z-10 shrink-0 px-3 pt-4 pb-2 @min-[30rem]/class-chat:px-6">
    <div className="flex min-w-0 items-center gap-1">
      <div className="mr-auto min-w-0"><h3 className="truncate text-lg font-semibold tracking-tight @min-[30rem]/class-chat:text-2xl">{classroom.name}</h3><p className="mt-0.5 text-xs text-muted-foreground">Classroom group conversation</p></div>
      <button type="button" className={iconButton} aria-label={searchOpen ? 'Close message search' : 'Search messages'} aria-expanded={searchOpen} aria-controls={searchId} onClick={onToggleSearch}>{searchOpen ? <X aria-hidden="true" className="size-5" /> : <Search aria-hidden="true" className="size-5" />}</button>
      {meetingHref && <Link to={meetingHref} className={iconButton} aria-label="Join class meeting" title="Join class meeting"><Video aria-hidden="true" className="size-5" /></Link>}
      <button ref={detailsToggleRef} type="button" className={iconButton + (detailsOpen ? ' bg-brand-soft text-brand-soft-foreground' : '')} aria-label="Conversation details" aria-expanded={detailsOpen} aria-controls={detailsId} onClick={onToggleDetails}><EllipsisVertical aria-hidden="true" className="size-5" /></button>
    </div>
    {searchOpen && <div id={searchId} className="mt-3"><label htmlFor={`${searchId}-input`} className="sr-only">Search messages in this class chat</label><Input id={`${searchId}-input`} type="search" autoFocus value={query} onChange={event => onQueryChange(event.currentTarget.value)} placeholder="Search in conversation" className="rounded-xl border-0 bg-muted shadow-none" /></div>}
  </header>
}
