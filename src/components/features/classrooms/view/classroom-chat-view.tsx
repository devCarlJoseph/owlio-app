import { ClassroomChatSkeleton } from '../ui/classroom-skeletons'
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronDown, ChevronRight, MessageCircle, Users, X } from 'lucide-react'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useClassroomChat } from '../hooks/use-classroom-chat'
import { ClassroomMembersView } from './classroom-members-view'
import type { Classroom, ClassroomChatMessage, ClassroomChatReplyRef, WorkspaceRole } from '../types/classroom-types'
import { ChatComposer } from '../forms/chat-composer'
import { ChatHeader } from '../ui/chat-header'
import { ChatMessageBubble } from '../ui/chat-message-bubble'
import { chatDateLabel, chatDay } from '../utils/chat-format'
import { getInitials } from '../utils/classroom-utils'
import type { ChatMentions } from '@/services/api/classroom-chat.service'

export function ClassroomChatView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { user } = useAuthSession()
  const chat = useClassroomChat(classroom.id)
  const { loading, denied, findUnread, markRead } = chat
  const [params] = useSearchParams()
  const linkedMessage = params.get('message')
  const handledLink = useRef<string | null>(null)
  const [status, setStatus] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ClassroomChatReplyRef | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const detailsToggleRef = useRef<HTMLButtonElement>(null)
  const closeDetailsRef = useRef<HTMLButtonElement>(null)
  const savedScroll = useRef<{ top: number; atBottom: boolean } | null>(null)
  const detailsId = useId()
  const membersId = useId()
  const normalizedQuery = query.trim().toLowerCase()
  const newestMessageId = chat.messages.at(-1)?.id
  const atBottom = useRef(true)
  const hasUnread = (chat.unread?.unreadCount ?? 0) > 0

  const messages = useMemo(() => normalizedQuery
    ? chat.messages.filter(message => `${message.body} ${message.authorName}`.toLowerCase().includes(normalizedQuery))
    : chat.messages, [chat.messages, normalizedQuery])

  useEffect(() => {
    if (normalizedQuery || !chat.unread || hasUnread || !atBottom.current) return
    const list = listRef.current
    if (list?.getClientRects().length) list.scrollTo?.({ top: list.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [newestMessageId, normalizedQuery, chat.unread, hasUnread])

  useEffect(() => {
    const list = listRef.current
    const latest = newestMessageId ? document.getElementById(`chat-message-${newestMessageId}`) : null
    if (!hasUnread || !list || !latest || normalizedQuery || detailsOpen || loading || chat.findingUnread) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const check = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (document.visibilityState !== 'visible' || !document.hasFocus() || !list.getClientRects().length) return
        const viewport = list.getBoundingClientRect(), message = latest.getBoundingClientRect()
        if (message.top >= viewport.top && message.bottom <= viewport.bottom && newestMessageId) void markRead(newestMessageId)
      }, 500)
    }
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(check, { root: list, threshold: 1 }) : null
    observer?.observe(latest)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', check)
    check()
    return () => { if (timer) clearTimeout(timer); observer?.disconnect(); window.removeEventListener('focus', check); document.removeEventListener('visibilitychange', check) }
  }, [newestMessageId, hasUnread, normalizedQuery, detailsOpen, loading, chat.findingUnread, markRead])

  useEffect(() => {
    if (detailsOpen) closeDetailsRef.current?.focus({ preventScroll: true })
  }, [detailsOpen])

  const closeDetails = () => {
    setDetailsOpen(false)
    requestAnimationFrame(() => {
      const list = listRef.current
      const saved = savedScroll.current
      if (list && saved) list.scrollTo?.({ top: saved.atBottom ? list.scrollHeight : saved.top })
      detailsToggleRef.current?.focus({ preventScroll: true })
    })
  }

  const toggleDetails = () => {
    if (detailsOpen) { closeDetails(); return }
    const list = listRef.current
    if (list) savedScroll.current = { top: list.scrollTop, atBottom: list.scrollHeight - list.scrollTop - list.clientHeight < 32 }
    setDetailsOpen(true)
  }

  const startReply = (message: Pick<ClassroomChatMessage, 'id' | 'authorName' | 'body'>) => {
    setReplyingTo({ messageId: message.id, authorName: message.authorName, excerpt: message.body.replace(/\s+/g, ' ').trim().slice(0, 120) })
  }

  const jumpToMessage = useCallback((messageId: string) => {
    atBottom.current = false
    if (normalizedQuery) { setQuery(''); setSearchOpen(false) }
    requestAnimationFrame(() => {
      document.getElementById(`chat-message-${messageId}`)?.scrollIntoView?.({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    })
    setHighlightedId(messageId)
    window.setTimeout(() => setHighlightedId(current => current === messageId ? null : current), 1600)
  }, [normalizedQuery])

  useEffect(() => {
    if (!linkedMessage || loading || denied || handledLink.current === linkedMessage) return
    handledLink.current = linkedMessage
    void findUnread(linkedMessage).then(id => {
      if (id) { jumpToMessage(id); void markRead(id) }
    })
  }, [linkedMessage, loading, denied, findUnread, markRead, jumpToMessage])

  const handleSend = async (body: string, mentions?: ChatMentions) => {
    setQuery('')
    const sent = await chat.send(body, replyingTo?.messageId ?? null, mentions)
    if (sent) setReplyingTo(null)
    return sent
  }

  return <div className={`scheme-light dark:scheme-dark grid h-[clamp(20rem,calc(100dvh-15rem),48rem)] min-h-0 min-w-0 grid-rows-[minmax(0,1fr)] gap-3 rounded-xl bg-background p-2 text-foreground ${detailsOpen ? 'xl:grid-cols-[minmax(0,1fr)_18rem]' : ''}`} onKeyDown={event => {
    if (event.key === 'Escape' && detailsOpen && !event.defaultPrevented) { event.preventDefault(); closeDetails() }
  }}>
    <section aria-label={`${classroom.name} group chat`} className={`${detailsOpen ? 'hidden xl:flex' : 'flex'} min-h-0 min-w-0 flex-col overflow-hidden rounded-xl bg-card`}>
      <ChatHeader classroom={classroom} role={role} searchOpen={searchOpen} query={query} onToggleSearch={() => { setSearchOpen(current => !current); setQuery('') }} onQueryChange={setQuery} detailsOpen={detailsOpen} detailsId={detailsId} onToggleDetails={toggleDetails} detailsToggleRef={detailsToggleRef} />
      {chat.unread && <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-2 text-xs"><span className="text-muted-foreground">{chat.unread.total} {chat.unread.total === 1 ? 'message' : 'messages'}</span><span role="status" className="font-medium text-brand">{chat.unread.unreadCount} unread{chat.unread.mentionCount > 0 ? ` · ${chat.unread.mentionCount} mentions` : ''}</span>{hasUnread && <><Button variant="link" size="sm" className="h-auto p-0 text-xs" disabled={chat.findingUnread} onClick={async () => {
        const id = await chat.findUnread()
        if (id) { jumpToMessage(id); void chat.markRead(id); setStatus('Showing the first unread message.') }
      }}>{chat.findingUnread ? 'Finding unread messages…' : 'View all unread messages'}</Button><Button variant="ghost" size="sm" className="ml-auto h-auto px-1 py-0 text-xs" disabled={chat.markingRead || !newestMessageId || chat.findingUnread} onClick={() => { if (newestMessageId) void chat.markRead(newestMessageId) }}>Mark all as read</Button></>}</div>}
      {chat.unreadError && <p role="alert" className="px-4 py-1 text-xs text-destructive">{chat.unreadError}</p>}
      <ScrollArea viewportRef={listRef} onScrollCapture={() => {
        const list = listRef.current
        if (list) {
          atBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 32
          if (atBottom.current && list.clientHeight > 0 && hasUnread && newestMessageId && !normalizedQuery && !detailsOpen && !chat.findingUnread && document.visibilityState === 'visible' && document.hasFocus()) void chat.markRead(newestMessageId)
        }
      }} role="log" aria-live="polite" aria-relevant="additions" aria-label={`${classroom.name} group chat messages`} className="min-h-0 min-w-0 flex-1 basis-0" viewportClassName="overscroll-contain overflow-x-hidden!" contentClassName="flex min-h-full min-w-0! w-full flex-col px-3 py-5 sm:px-5">
        {chat.next && <Button variant="ghost" className="mx-auto mb-4 shrink-0 text-xs text-muted-foreground" disabled={chat.loadingOlder} onClick={() => void chat.loadOlder()}>{chat.loadingOlder ? 'Loading older messages…' : 'Load older messages'}</Button>}
        {chat.loading ? <ClassroomChatSkeleton /> : messages.length === 0 ? <div className="m-auto flex max-w-sm flex-col items-center gap-3 py-8 text-center"><span className="grid size-16 place-items-center rounded-full bg-brand-soft text-brand"><MessageCircle aria-hidden="true" className="size-7" /></span><h4 className="font-semibold">{normalizedQuery ? 'No matching messages' : classroom.name}</h4><p className="text-sm leading-6 text-muted-foreground">{normalizedQuery ? 'No messages match your search.' : 'No messages yet. Start the class-only conversation.'}</p></div> : <ol className="flex min-w-0 flex-col gap-1">
          {messages.map((message, index) => {
            const previous = messages[index - 1]
            const newDay = !previous || chatDay(previous.createdAt) !== chatDay(message.createdAt)
            const showHeader = !previous || previous.authorId !== message.authorId || newDay
            return <Fragment key={message.id}>{newDay && <li className="my-4 self-center rounded-full px-3 text-center text-[11px] font-medium text-muted-foreground">{chatDateLabel(message.createdAt)}</li>}<ChatMessageBubble classroomId={classroom.id} mentioned={message.authorId !== user?.id && (message.mentionUserIds?.includes(user?.id ?? "") || Boolean(message.mentionStudents && classroom.ownerId !== user?.id))} message={{ ...message, replyTo: message.replyTo ?? undefined }} mine={message.authorId === user?.id} showHeader={showHeader} highlighted={highlightedId === message.id} onReply={() => startReply(message)} onJumpToMessage={jumpToMessage} /></Fragment>
          })}
        </ol>}
      </ScrollArea>
      <p role="status" className="shrink-0 px-4 py-1 text-xs text-muted-foreground empty:hidden">{status}</p>
      {chat.error && <p role="alert" className="shrink-0 px-4 py-1 text-xs text-destructive [overflow-wrap:anywhere]">{chat.error}</p>}
      <ChatComposer classroomId={classroom.id} userId={user?.id} canMentionStudents={classroom.ownerId === user?.id && classroom.access === 'owner'} disabled={chat.busy || chat.loading || chat.denied} onSend={handleSend} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />
    </section>
    {detailsOpen && <aside id={detailsId} aria-label="Conversation details" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl bg-card">
      <header className="flex shrink-0 items-center justify-between gap-2 px-5 py-3"><h3 className="text-xs font-medium text-muted-foreground">Conversation details</h3><Button ref={closeDetailsRef} variant="ghost" size="icon" aria-label="Close conversation details" onClick={closeDetails}><X aria-hidden="true" className="size-4" /></Button></header>
      <ScrollArea className="min-h-0 min-w-0 flex-1" viewportClassName="overscroll-contain overflow-x-hidden!" contentClassName="min-w-0! w-full space-y-5 p-5">
        <div className="flex flex-col items-center text-center"><span aria-hidden="true" className="mb-3 grid size-18 place-items-center rounded-full bg-brand-soft text-xl font-semibold text-brand">{getInitials(classroom.name)}</span><h4 className="max-w-full text-base font-semibold [overflow-wrap:anywhere]">{classroom.name}</h4><p className="mt-1 text-xs text-muted-foreground">Classroom group conversation</p></div>
        <section className="space-y-2 pt-4"><h4 className="text-sm font-semibold">Chat info</h4><p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{classroom.description || 'A conversation for this classroom.'}</p><p className="text-xs leading-5 text-muted-foreground">Messages are shared with the class owner and enrolled students.</p></section>
        <section className="pt-2"><button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-3 text-left text-sm font-semibold outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" aria-expanded={membersOpen} aria-controls={membersId} onClick={() => setMembersOpen(current => !current)}><Users aria-hidden="true" className="size-4" />Chat members{membersOpen ? <ChevronDown aria-hidden="true" className="ml-auto size-4" /> : <ChevronRight aria-hidden="true" className="ml-auto size-4" />}</button>{membersOpen && <div id={membersId} className="pt-2"><ClassroomMembersView classroom={classroom} role={role} /></div>}</section>
      </ScrollArea>
    </aside>}
  </div>
}
