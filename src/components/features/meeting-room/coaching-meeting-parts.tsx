import type { FormEvent, ReactNode } from 'react'
import type { Participant } from 'livekit-client'
import { Hand, Info, Mic, MicOff, Pin, Send, Video, VideoOff, X } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AudioTrack } from './audio-track'
import { useParticipantVideo } from './use-participant-video'
import type { MeetingMessage } from './meeting-room-types'

export type CallPerson = {
  identity: string
  name: string
  detail: string
  micOn: boolean
  cameraOn: boolean
  raised: boolean
  local: boolean
  participant?: Participant
}

const avatarTones = ['bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700']
const tileSurface = 'bg-linear-to-br from-brand-soft via-muted/80 to-brand-soft/70'

function toneFor(identity: string) {
  let hash = 0
  for (const character of identity) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return avatarTones[hash % avatarTones.length]
}

export function Avatar({ person, className }: { person: Pick<CallPerson, 'identity' | 'name'>; className?: string }) {
  const initials = person.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'O'
  return <span aria-hidden="true" className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', toneFor(person.identity), className)}>{initials}</span>
}

export function CallTile({ person, updateKey, featured = false, className }: { person: CallPerson; updateKey: number; featured?: boolean; className?: string }) {
  const { videoRef, videoTrack, screenTrack } = useParticipantVideo(person.participant, updateKey)
  return <article aria-label={`${person.name}${person.local ? ', you' : ''}`} className={cn('@container relative isolate min-h-0 min-w-0 overflow-hidden rounded-2xl text-foreground', tileSurface, className)}>
    {videoTrack ? <video ref={videoRef} autoPlay playsInline muted={person.local} aria-label={`${person.name} video`} className={cn('absolute inset-0 size-full', screenTrack ? 'object-contain' : 'object-cover')} />
      : <div className="absolute inset-0 grid place-items-center pb-6">
        <Avatar person={person} className={featured ? 'size-20 text-2xl ring-4 ring-card/70 @md:size-28 @md:text-4xl' : 'size-10 text-sm ring-2 ring-card/70 @[11rem]:size-14 @[11rem]:text-lg @[20rem]:size-20 @[20rem]:text-2xl'} />
      </div>}
    {person.participant && !person.local && [...person.participant.audioTrackPublications.values()].map(publication => publication.track ? <AudioTrack key={publication.trackSid} track={publication.track} /> : null)}
    {person.raised && <span title="Hand raised" className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-700 shadow-sm"><Hand aria-hidden="true" className="size-3.5" /><span className="sr-only @[14rem]:not-sr-only">Hand raised</span></span>}
    <span role="img" aria-label={person.micOn ? 'Microphone on' : 'Microphone off'} className={cn('absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-full shadow-sm', person.micOn ? 'bg-card/85 text-foreground' : 'bg-rose-100 text-rose-700')}>
      {person.micOn ? <Mic aria-hidden="true" className="size-3.5" /> : <MicOff aria-hidden="true" className="size-3.5" />}
    </span>
    <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-md bg-card/85 px-2 py-0.5 text-xs font-medium text-foreground shadow-sm">{person.name}{person.local ? ' (You)' : ''}{screenTrack ? ' · Presenting' : ''}</span>
  </article>
}

export function CallButton({ label, pressed, disabled, onClick, tone, badge, wide, className, children }: {
  label: string; pressed?: boolean; disabled?: boolean; onClick: () => void; tone?: 'off' | 'leave'; badge?: number; wide?: boolean; className?: string; children: ReactNode
}) {
  return <Button variant="ghost" title={label} aria-label={label} aria-pressed={tone === 'leave' ? undefined : pressed} disabled={disabled} onClick={onClick}
    className={cn('relative h-10 rounded-full px-0 disabled:opacity-60 sm:h-11 [&_svg:not([class*=size-])]:size-5', wide ? 'w-14 sm:w-16' : 'w-10 sm:w-11', className,
      tone === 'leave' ? 'bg-rose-600 text-white hover:bg-rose-700 hover:text-white dark:hover:bg-rose-700'
        : tone === 'off' ? 'bg-rose-100 text-rose-700 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-100'
          : 'bg-muted text-foreground hover:bg-accent dark:hover:bg-accent aria-pressed:bg-brand-soft aria-pressed:text-brand-soft-foreground')}>
    {children}
    {Boolean(badge) && <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-4.5 rounded-full bg-brand px-1 text-[10px] leading-4.5 font-semibold text-brand-foreground">{Math.min(badge ?? 0, 99)}</span>}
  </Button>
}

function Panel({ label, title, onClose, children }: { label: string; title: string; onClose: () => void; children: ReactNode }) {
  return <section aria-label={label} className="flex min-h-0 flex-1 flex-col">
    <div className="flex shrink-0 items-center justify-between gap-2 py-3 pr-2 pl-5"><h3 className="text-base font-semibold">{title}</h3><Button variant="ghost" size="icon" className="rounded-full" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}><X aria-hidden="true" /></Button></div>
    {children}
  </section>
}

export function PeoplePanel({ people, preview, pinnedIdentity, onPin, onClose }: { people: CallPerson[]; preview: boolean; pinnedIdentity: string | null; onPin: (identity: string | null) => void; onClose: () => void }) {
  return <Panel label="Meeting participants" title="People" onClose={onClose}>
    <p className="px-5 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{preview ? `${people.length} sample people` : `In call · ${people.length}`}</p>
    {people.length === 0 ? <p className="flex-1 px-5 py-6 text-center text-xs text-muted-foreground">No one connected</p>
      : <ul className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">{people.map(person => {
        const pinned = pinnedIdentity === person.identity
        return <li key={person.identity} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/60">
          <Avatar person={person} className="size-9 text-xs" />
          <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium">{person.name}{person.local ? ' (You)' : ''}</p><p className="truncate text-[11px] text-muted-foreground">{person.detail}</p></div>
          <div className="flex shrink-0 items-center gap-1.5">
            {person.raised && <Hand role="img" aria-label="Hand raised" className="size-4 text-amber-600" />}
            <Button variant="ghost" size="icon-xs" className="text-muted-foreground aria-pressed:text-brand" aria-label={`${pinned ? 'Unpin' : 'Pin'} ${person.name} ${pinned ? 'from' : 'for'} your view`} aria-pressed={pinned} onClick={() => onPin(pinned ? null : person.identity)}><Pin aria-hidden="true" className={cn('size-4', pinned && 'fill-current')} /></Button>
            {person.micOn ? <Mic role="img" aria-label="Microphone on" className="size-4 text-foreground/80" /> : <MicOff role="img" aria-label="Microphone off" className="size-4 text-rose-600" />}
            {person.cameraOn ? <Video role="img" aria-label="Camera on" className="size-4 text-foreground/80" /> : <VideoOff role="img" aria-label="Camera off" className="size-4 text-muted-foreground/70" />}
          </div>
        </li>
      })}</ul>}
    <p className="shrink-0 px-5 pt-1 pb-4 text-[10px] leading-4 text-muted-foreground">Connected presence · Not official attendance</p>
  </Panel>
}

export function ChatPanel({ people, messages, localIdentity, enabled, draft, sending, onDraft, onSend, onClose }: {
  people: CallPerson[]; messages: MeetingMessage[]; localIdentity?: string; enabled: boolean; draft: string; sending: boolean
  onDraft: (value: string) => void; onSend: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void
}) {
  return <Panel label="Meeting chat" title="In-call messages" onClose={onClose}>
    <p className="mx-4 flex gap-2 rounded-xl bg-muted px-3 py-2.5 text-[11px] leading-4 text-muted-foreground"><Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />Messages can only be seen by people in the call and are deleted when the call ends.</p>
    <div role="log" aria-label="Meeting messages" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
      {messages.length === 0 ? <div className="flex h-full min-h-40 flex-col items-center justify-center gap-1 text-center">
        <span className="mb-2 grid size-20 place-items-center rounded-full bg-brand-soft"><img src="/mascot/owlio-owl.png" alt="" className="h-16 w-auto" /></span>
        <p className="text-xs font-semibold">No chat yet</p>
        <p className="max-w-52 text-[11px] leading-5 text-muted-foreground">{enabled ? 'Say hello to the group.' : 'Join a live room to send messages.'}</p>
      </div> : messages.map(message => {
        const own = message.identity === localIdentity
        const sender = people.find(person => person.identity === message.identity)
        return <article key={message.id}>
          <div className="mb-0.5 flex flex-wrap items-baseline gap-2 text-[11px]"><span className="font-semibold">{own ? 'You' : message.authorName || sender?.name || 'Participant'}</span><time className="text-muted-foreground" dateTime={new Date(message.sentAt).toISOString()}>{new Date(message.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div>
          <p className="text-[13px] leading-5 break-words whitespace-pre-wrap">{message.text}</p>
        </article>
      })}
    </div>
    <form onSubmit={onSend} className="relative mx-4 mb-4 shrink-0">
      <label htmlFor="meeting-chat-message" className="sr-only">Write a meeting message</label>
      <Input id="meeting-chat-message" disabled={!enabled} value={draft} maxLength={500} onChange={event => onDraft(event.target.value)} placeholder={enabled ? 'Send a message' : 'Join to send a message'} className="h-11 rounded-full border-transparent bg-muted pr-12 pl-4 text-sm dark:bg-muted" />
      <Button type="submit" size="icon-sm" variant="ghost" aria-label="Send message" disabled={!enabled || !draft.trim() || sending} className="absolute top-1.5 right-1.5 rounded-full text-brand hover:text-brand"><Send aria-hidden="true" className="size-4" /></Button>
    </form>
  </Panel>
}
