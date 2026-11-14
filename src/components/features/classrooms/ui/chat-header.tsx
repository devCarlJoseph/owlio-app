import { useId } from "react"
import { Search, Video, X } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatMeetingCode } from "@/lib/meeting-code"
import type { Classroom, WorkspaceRole } from "./classroom-types"
import { getInitials } from "./classroom-utils"

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

export function ChatHeader({
  classroom,
  role,
  searchOpen,
  query,
  onToggleSearch,
  onQueryChange,
}: {
  classroom: Classroom
  role: WorkspaceRole
  searchOpen: boolean
  query: string
  onToggleSearch: () => void
  onQueryChange: (value: string) => void
}) {
  const searchId = useId()
  const meetingHref = classroom.meetingId
    ? `/${role}/classrooms/meeting-room?room=${encodeURIComponent(formatMeetingCode(classroom.meetingId))}`
    : null

  return (
    <header className="border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
          {getInitials(classroom.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{classroom.name}</h3>
          <p className="text-xs text-muted-foreground">
            {classroom.members.length} {classroom.members.length === 1 ? "member" : "members"} · class only
          </p>
        </div>
        <Badge variant="outline" className="hidden border-amber-200 bg-amber-50 text-amber-800 sm:inline-flex">Preview · not synced</Badge>
        <button
          type="button"
          className={iconButton}
          aria-label={searchOpen ? "Close message search" : "Search messages"}
          aria-expanded={searchOpen}
          aria-controls={searchId}
          onClick={onToggleSearch}
        >
          {searchOpen ? <X aria-hidden="true" className="size-4" /> : <Search aria-hidden="true" className="size-4" />}
        </button>
        {meetingHref && (
          <Link to={meetingHref} className={iconButton} aria-label="Join class meeting" title="Join class meeting">
            <Video aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
      {searchOpen && (
        <div id={searchId} className="mt-3">
          <label htmlFor={`${searchId}-input`} className="sr-only">Search messages in this class chat</label>
          <Input
            id={`${searchId}-input`}
            type="search"
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            placeholder="Search messages…"
          />
        </div>
      )}
    </header>
  )
}
