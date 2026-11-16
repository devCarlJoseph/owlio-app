import { useId, type Ref } from 'react'
import { Info, Search, Video, X } from 'lucide-react'
import { Link } from 'react-router'
import { Input } from '@/components/ui/input'
import type { Classroom, WorkspaceRole } from './classroom-types'
import { getInitials } from './classroom-utils'

const iconButton = 'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#0866ff] outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring dark:text-[#75b6ff]'

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

  return <header className="z-10 shrink-0 border-b border-border bg-card px-3 py-3 shadow-xs sm:px-5">
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand">{getInitials(classroom.name)}</span>
      <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold sm:text-base">{classroom.name}</h3><p className="mt-0.5 truncate text-xs text-muted-foreground">Classroom group conversation</p></div>
      {meetingHref && <Link to={meetingHref} className={iconButton} aria-label="Join class meeting" title="Join class meeting"><Video aria-hidden="true" className="size-5" /></Link>}
      <button type="button" className={iconButton} aria-label={searchOpen ? 'Close message search' : 'Search messages'} aria-expanded={searchOpen} aria-controls={searchId} onClick={onToggleSearch}>{searchOpen ? <X aria-hidden="true" className="size-5" /> : <Search aria-hidden="true" className="size-5" />}</button>
      <button ref={detailsToggleRef} type="button" className={iconButton + (detailsOpen ? ' bg-muted' : '')} aria-label="Conversation details" aria-expanded={detailsOpen} aria-controls={detailsId} onClick={onToggleDetails}><Info aria-hidden="true" className="size-5" /></button>
    </div>
    {searchOpen && <div id={searchId} className="mt-3"><label htmlFor={`${searchId}-input`} className="sr-only">Search messages in this class chat</label><Input id={`${searchId}-input`} type="search" autoFocus value={query} onChange={event => onQueryChange(event.currentTarget.value)} placeholder="Search in conversation" className="rounded-full border-0 bg-muted shadow-none" /></div>}
  </header>
}
