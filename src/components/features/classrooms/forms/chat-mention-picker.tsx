import { useEffect, useImperativeHandle, useState, type Ref } from 'react'
import { Button } from '@/components/ui/button'
import { getClassroomMembers, type ApiClassroomMember } from '@/services/api/classroom.service'

export type ChatMentionPickerHandle = { handleKey: (key: string) => boolean }

export function ChatMentionPicker({ classroomId, userId, canMentionStudents, query, open, listId, ref, onSelect, onClose, onActiveChange }: {
  classroomId: string; userId?: string; canMentionStudents: boolean
  query: string; open: boolean; listId: string; ref: Ref<ChatMentionPickerHandle>
  onActiveChange: (id: string | undefined) => void
  onSelect: (member: { id: string; name: string }) => void; onClose: () => void
}) {
  const [members, setMembers] = useState<ApiClassroomMember[]>([])
  const [selection, setSelection] = useState({ query: '', index: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    async function load() {
      setLoading(true); setError(''); setMembers([])
      try {
        let cursor: string | undefined
        const seen = new Set<string>()
        do {
          const page = await getClassroomMembers(classroomId, cursor, controller.signal)
          if (controller.signal.aborted) return
          setMembers(current => [...new Map([...current, ...page.items].map(member => [member.id, member])).values()])
          cursor = page.nextCursor ?? undefined
          if (cursor && seen.has(cursor)) throw new Error('Member pagination did not advance.')
          if (cursor) seen.add(cursor)
        } while (cursor)
      } catch { if (!controller.signal.aborted) { setMembers([]); setError('Members could not be loaded.') } }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void load()
    return () => controller.abort()
  }, [classroomId, open, retry])
  const search = query.toLocaleLowerCase()
  const options = [
    ...(canMentionStudents && 'students'.startsWith(search) ? [{ id: 'students', name: 'students', label: '@students · All enrolled students' }] : []),
    ...members.filter(member => member.id !== userId && member.name.toLocaleLowerCase().split(/\s+/).some(part => part.startsWith(search)))
      .map(member => ({ ...member, label: `@${member.name}${member.role === 'owner' ? ' · Class owner' : ''}` })),
  ]
  const activeIndex = Math.min(selection.query === query ? selection.index : 0, Math.max(options.length - 1, 0))
  const activeId = open && options.length ? `${listId}-${options[activeIndex].id}` : undefined
  useEffect(() => {
    onActiveChange(activeId)
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' })
  }, [activeId, onActiveChange])
  useImperativeHandle(ref, () => ({ handleKey(key) {
    if (!open) return false
    if (key === 'Escape') { onClose(); return true }
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      if (options.length) setSelection({ query, index: (activeIndex + (key === 'ArrowDown' ? 1 : options.length - 1)) % options.length })
      return true
    }
    if (key === 'Enter') { if (options[activeIndex]) onSelect(options[activeIndex]); return true }
    return false
  } }))
  if (!open) return null
  return <section aria-label="Mention a classroom member" className="mb-2 space-y-1 rounded-lg border border-border bg-card p-2 shadow-sm">
    {loading && <p role="status" className="text-xs text-muted-foreground">Loading members…</p>}
    {error && <p role="alert" className="text-xs text-destructive">{error} <Button variant="link" size="sm" onClick={() => setRetry(value => value + 1)}>Retry</Button></p>}
    <ul id={listId} role="listbox" aria-label="Mention suggestions" className="max-h-40 overflow-y-auto">{options.map((member, index) => <li key={member.id} role="presentation"><button type="button" role="option" id={`${listId}-${member.id}`} aria-selected={index === activeIndex} tabIndex={-1} className={`w-full rounded-md px-3 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${index === activeIndex ? 'bg-muted' : ''}`} onMouseDown={event => event.preventDefault()} onClick={() => onSelect(member)}>{member.label}</button></li>)}</ul>
    {!loading && !error && options.length === 0 && <p role="status" className="px-2 py-1 text-xs text-muted-foreground">No matching members.</p>}
  </section>
}
