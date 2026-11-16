import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GridListToggle, type ClassroomView } from './classroom-list-ui'

type ClassroomListToolbarProps = {
  query: string
  onQueryChange: (query: string) => void
  sort: string
  onSortChange: (sort: string) => void
  view: ClassroomView
  onViewChange: (view: ClassroomView) => void
}

export function ClassroomListToolbar({ query, onQueryChange, sort, onSortChange, view, onViewChange }: ClassroomListToolbarProps) {
  return <div className="flex flex-wrap items-center gap-3">
    <label className="relative min-w-0 flex-1 basis-64"><Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-muted-foreground" /><span className="sr-only">Search classes</span>
      <Input type="search" value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Search classes or instructors" className="h-10 bg-card pl-10" /></label>
    <label className="flex items-center gap-2 text-sm text-muted-foreground">Sort
      <select value={sort} onChange={event => onSortChange(event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <option value="active">Name A–Z</option><option value="za">Name Z–A</option>
      </select>
    </label><GridListToggle value={view} onValueChange={onViewChange} />
  </div>
}
