import { Hand, MessageCircle, Mic, MicOff, Pin, Send, Users, Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MeetingRoomScreenProps } from './meeting-room-types'

export function PeoplePanel({ state }: { state: Omit<MeetingRoomScreenProps, 'roomInputRef'> }) {
  return <section className="meeting-panel" aria-label="Meeting participants">
    <div className="meeting-panel-heading"><div className="flex items-center gap-2"><Users aria-hidden="true" className="size-4 meeting-accent-text" /><h3>Participants <span className="ml-1 text-muted-foreground">{state.participants.length}</span></h3></div><Button variant="ghost" size="xs" onClick={() => state.onPanel('people')}>{state.activePanel === 'people' ? 'Close' : 'View all'}</Button></div>
    <p className="px-4 pt-2 text-[10px] leading-4 text-muted-foreground">Connected presence · Not official attendance</p>
    {state.participants.length === 0 ? <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-y-auto p-3 text-center text-xs text-muted-foreground"><Users aria-hidden="true" className="size-6 shrink-0 opacity-40" /><p>No one connected</p></div>
      : <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">{state.participants.map(person => <li key={person.identity} className="flex items-center gap-2 rounded-lg px-2 py-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{(person.name || 'P').slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{person.name || 'Participant'}{person.identity === state.localIdentity ? ' · You' : ''}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">{person.isMicrophoneEnabled ? <Mic aria-hidden="true" className="size-3" /> : <MicOff aria-hidden="true" className="size-3" />}{person.isMicrophoneEnabled ? 'Microphone on' : 'Microphone off'}{person.isCameraEnabled ? <Video aria-label="Camera on" className="ml-1 size-3" /> : <VideoOff aria-label="Camera off" className="ml-1 size-3" />}</p></div>
        {state.raisedHands[person.identity] && <Hand aria-label="Hand raised" className="size-3.5 text-brand" />}
        <Button variant="ghost" size="icon-xs" aria-label={`${state.pinnedIdentity === person.identity ? 'Unpin' : 'Pin'} ${person.name || 'participant'} for your view`} aria-pressed={state.pinnedIdentity === person.identity} onClick={() => state.onPin(state.pinnedIdentity === person.identity ? null : person.identity)}><Pin aria-hidden="true" className="size-3" /></Button>
      </li>)}</ul>}
  </section>
}

export function ChatPanel({ state }: { state: Omit<MeetingRoomScreenProps, 'roomInputRef'> }) {
  const enabled = state.hasRoom && state.status === 'connected' && !state.preview
  return <section className="meeting-panel" aria-label="Meeting chat">
    <div className="meeting-panel-heading"><div className="flex items-center gap-2"><MessageCircle aria-hidden="true" className="size-4 meeting-accent-text" /><h3>In-call messages</h3></div><Button variant="ghost" size="xs" onClick={() => state.onPanel('chat')}>{state.activePanel === 'chat' ? 'Close' : 'View all'}</Button></div>
    <div role="log" aria-label="Meeting messages" aria-live="polite" aria-relevant="additions" className="min-h-24 flex-1 space-y-4 overflow-y-auto p-4">
      {state.messages.length === 0 ? <div className="flex h-full min-h-24 flex-col items-center justify-center gap-3 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-muted"><MessageCircle aria-hidden="true" className="size-6 text-muted-foreground" /></span><p className="text-xs font-medium">No chat yet</p><p className="max-w-52 text-[11px] leading-5 text-muted-foreground">Messages stay in this call and are cleared when you leave.</p></div> : state.messages.map(message => {
        const own = message.identity === state.localIdentity
        const sender = state.participants.find(person => person.identity === message.identity)
        return <article key={message.id} className={own ? 'ml-auto max-w-[95%]' : 'max-w-[95%]'}><div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground"><span className="font-medium">{own ? 'You' : sender?.name || 'Participant'}</span><time dateTime={new Date(message.sentAt).toISOString()}>{new Date(message.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div><p className={`whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-xs leading-5 ${own ? 'bg-brand-soft text-brand-soft-foreground' : 'bg-muted text-foreground'}`}>{message.text}</p></article>
      })}
    </div>
    <form onSubmit={state.onSendChat} className="flex gap-2 border-t border-border p-3"><label htmlFor="meeting-chat-message" className="sr-only">Write a meeting message</label><Input id="meeting-chat-message" disabled={!enabled} value={state.chatDraft} maxLength={500} onChange={event => state.onChatDraft(event.target.value)} placeholder={enabled ? 'Write a message…' : 'Join to send a message'} className="h-9 min-w-0 text-xs md:text-xs" /><Button type="submit" size="icon" variant="ghost" aria-label="Send message" disabled={!enabled || !state.chatDraft.trim() || state.chatSending} className="shrink-0 meeting-accent-text"><Send aria-hidden="true" className="size-4" /></Button></form>
  </section>
}
