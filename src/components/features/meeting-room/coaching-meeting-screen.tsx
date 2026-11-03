import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import type { Participant } from 'livekit-client'
import { ArrowLeft, Copy, Download, FileText, Hand, LockKeyhole, MessageCircle, Mic, MicOff, MonitorUp, PhoneOff, Pin, Send, Sparkles, Square, Users, Video, VideoOff } from 'lucide-react'
import { cn } from 'cn'
import { useImmersiveDashboard } from '@/components/common/dashboard-chrome'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AudioTrack } from './participant-tile'
import { useParticipantVideo } from './use-participant-video'
import { coachingSessionPreview } from './coaching-meeting-preview'
import type { MeetingPanel, MeetingRoomScreenProps, RoomStatus } from './meeting-room-types'

type Person = {
  identity: string
  name: string
  detail: string
  micOn: boolean
  cameraOn: boolean
  raised: boolean
  local: boolean
  participant?: Participant
}

const statusLabels: Record<RoomStatus, string> = { idle: 'Not connected', joining: 'Connecting…', connected: 'Connected', reconnecting: 'Reconnecting', ended: 'Meeting ended' }
const avatarTones = ['bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700']
const card = 'flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-xs'
const stageSurface = 'bg-linear-to-br from-brand-soft via-muted/80 to-brand-soft/70'
const waveform = ['h-2/5', 'h-3/4', 'h-full', 'h-1/2', 'h-5/6', 'h-1/3', 'h-2/3', 'h-11/12', 'h-2/5', 'h-3/4', 'h-1/3', 'h-3/5', 'h-1/2', 'h-4/5', 'h-2/5']

function toneFor(identity: string) {
  let hash = 0
  for (const character of identity) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return avatarTones[hash % avatarTones.length]
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'O'
}

function Avatar({ person, className }: { person: Pick<Person, 'identity' | 'name'>; className?: string }) {
  return <span aria-hidden="true" className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', toneFor(person.identity), className)}>{initials(person.name)}</span>
}

function PanelHeader({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-3 px-4 pt-4 pb-3">
    <span aria-hidden="true" className="text-brand [&_svg]:size-6">{icon}</span>
    <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{title}</h3><p className="truncate text-xs text-muted-foreground">{subtitle}</p></div>
    {action}
  </div>
}

function MicBadge({ on }: { on: boolean }) {
  return <span role="img" aria-label={on ? 'Microphone on' : 'Microphone off'} className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur-sm">
    {on ? <Mic aria-hidden="true" className="size-4" /> : <MicOff aria-hidden="true" className="size-4 text-muted-foreground" />}
  </span>
}

function StageTile({ person, featured = false, preview, updateKey, className }: { person: Person; featured?: boolean; preview: boolean; updateKey: number; className?: string }) {
  const { videoRef, videoTrack, screenTrack } = useParticipantVideo(person.participant, updateKey)
  const label = `${person.name}${person.local ? ' · You' : ''}${screenTrack ? ' · Presenting' : ''}`
  const chip = <span className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-card/90 py-1 pr-3 pl-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm"><Avatar person={person} className="size-6 text-[10px]" /><span className="truncate">{label}</span></span>
  return <article aria-label={`${person.name}${person.local ? ', you' : ''}`} className={cn('relative isolate min-h-0 min-w-0 overflow-hidden rounded-2xl text-foreground', stageSurface, className)}>
    {videoTrack ? <video ref={videoRef} autoPlay playsInline muted={person.local} aria-label={`${person.name} video`} className={cn('absolute inset-0 size-full', screenTrack ? 'object-contain' : 'object-cover')} />
      : <div className={cn('absolute inset-0 flex flex-col items-center justify-center gap-3', featured ? 'pb-10' : 'pb-9')}>
        <Avatar person={person} className={featured ? 'size-20 text-2xl ring-4 ring-card/70 sm:size-24 sm:text-3xl' : 'size-10 text-sm ring-2 ring-card/70 sm:size-12 sm:text-base'} />
        {featured && <span className="text-xs text-muted-foreground">{preview ? person.cameraOn ? 'Sample participant · no live video' : 'Sample participant · camera off' : person.cameraOn ? 'Camera starting…' : 'Camera off'}</span>}
      </div>}
    {person.participant && !person.local && [...person.participant.audioTrackPublications.values()].map(publication => publication.track ? <AudioTrack key={publication.trackSid} track={publication.track} /> : null)}
    <div className="absolute top-3 left-3 flex max-w-[calc(100%-4rem)] flex-col items-start gap-2">
      {featured && chip}
      {person.raised && <span title="Hand raised" className={cn('flex items-center gap-1 rounded-full bg-amber-100 text-[11px] font-medium whitespace-nowrap text-amber-700 shadow-sm', featured ? 'px-2.5 py-1' : 'size-8 justify-center')}><Hand aria-hidden="true" className="size-3.5" /><span className={cn(!featured && 'sr-only')}>Hand raised</span></span>}
    </div>
    <MicBadge on={person.micOn} />
    {!featured && <div className="absolute right-3 bottom-3 left-3 flex">{chip}</div>}
  </article>
}

function CallButton({ label, pressed, disabled, onClick, tone, children }: { label: string; pressed?: boolean; disabled?: boolean; onClick: () => void; tone?: 'leave'; children: ReactNode }) {
  return <Button variant="ghost" size="icon-lg" title={label} aria-label={label} aria-pressed={tone ? undefined : pressed} disabled={disabled} onClick={onClick}
    className={cn('size-10 rounded-full shadow-md disabled:opacity-70 sm:size-11 [&_svg:not([class*=size-])]:size-[1.125rem]', tone === 'leave'
      ? 'bg-rose-600 text-white hover:bg-rose-700 hover:text-white dark:hover:bg-rose-700'
      : 'bg-card text-foreground hover:bg-card/90 dark:hover:bg-card/90 aria-pressed:bg-brand aria-pressed:text-brand-foreground')}>{children}</Button>
}

export function CoachingMeetingScreen({ roomInputRef, ...state }: MeetingRoomScreenProps) {
  const sample = coachingSessionPreview[state.role === 'esl' ? 'esl' : 'tutors']
  const inCall = state.hasRoom || state.preview
  const enabled = state.hasRoom && state.status === 'connected' && !state.preview
  const people: Person[] = state.preview
    ? sample.people.map(person => ({ ...person, raised: Boolean(person.raised), local: false }))
    : state.participants.map(participant => ({
      identity: participant.identity,
      name: participant.name || 'Participant',
      detail: participant.identity === state.localIdentity ? 'You' : 'Participant',
      micOn: participant.isMicrophoneEnabled,
      cameraOn: participant.isCameraEnabled,
      raised: Boolean(state.raisedHands[participant.identity]),
      local: participant.identity === state.localIdentity,
      participant,
    }))
  const messages = state.preview ? [] : state.messages
  const featured = people.find(person => person.identity === state.pinnedIdentity) ?? people.find(person => !person.local) ?? people[0]
  const others = people.filter(person => person !== featured)
  const raised = Boolean(state.raisedHands[state.localIdentity ?? ''])
  const title = state.preview ? sample.title : state.role === 'esl' ? 'Language learning session' : 'Tutoring session'
  const expanded = state.activePanel
  const togglePin = (identity: string) => state.onPin(state.pinnedIdentity === identity ? null : identity)
  const viewAll = (panel: MeetingPanel) => <Button variant="link" size="xs" className="h-auto px-0 text-xs font-medium text-brand" aria-expanded={expanded === panel} onClick={() => state.onPanel(panel)}>{expanded === panel ? 'Close' : 'View all'}</Button>

  useImmersiveDashboard(inCall)

  return <section aria-label="Meeting room" data-meeting-design="coaching" className={cn('flex min-w-0 flex-col text-foreground', inCall ? 'flex-1 gap-3 xl:min-h-[36rem]' : 'gap-4')} onKeyDown={event => {
    if (event.key === 'Escape' && expanded) { event.preventDefault(); state.onPanel(expanded) }
  }}>
    <header className={cn('flex shrink-0 flex-wrap items-center justify-between gap-3', inCall && 'rounded-2xl border border-border/70 bg-card px-3 py-2.5 shadow-xs sm:px-4')}>
      <div className="flex min-w-0 items-center gap-3">
        <Link to={state.backHref} aria-label="Back to Meeting Room" className="grid size-9 shrink-0 place-items-center rounded-full border border-border/70 bg-card text-foreground shadow-xs hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"><ArrowLeft aria-hidden="true" className="size-4" /></Link>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold sm:text-lg">{title}</h2>
          <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{state.meetingCode || (state.preview ? 'Sample session · invite link appears once a live room is created' : 'A little space for focused learning')}</span>
            {state.roomId && <Button variant="ghost" size="icon-xs" onClick={state.onCopy} aria-label="Copy meeting invite" title="Copy meeting invite"><Copy aria-hidden="true" /></Button>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {inCall && <span role="status" className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium whitespace-nowrap text-brand-soft-foreground"><span aria-hidden="true" className={cn('size-1.5 rounded-full', enabled ? 'bg-emerald-500' : 'bg-brand')} />{state.preview ? 'Layout preview' : statusLabels[state.status]}</span>}
        {state.isHost && !state.preview && <Button variant="outline" size="sm" className="rounded-full border-rose-300 text-rose-700 hover:text-rose-700" disabled={state.busy} onClick={state.onEnd}>End meeting for everyone</Button>}
        {inCall && <MeetingClock />}
        {inCall && state.userName && <div className="hidden items-center gap-2.5 border-l border-border/70 pl-3 sm:flex">
          <Avatar person={{ identity: state.userEmail ?? state.userName, name: state.userName }} className="size-9 text-xs" />
          <div className="max-w-44 min-w-0 leading-tight"><p className="truncate text-[13px] font-medium">{state.userName}</p>{state.userEmail && <p className="truncate text-[11px] text-muted-foreground">{state.userEmail}</p>}</div>
        </div>}
      </div>
    </header>

    {(state.message || state.error) && <div className="shrink-0 space-y-1 text-xs leading-5">{state.message && <p role="status">{state.message}</p>}{state.error && <p role="alert" className="font-medium text-destructive">{state.error}</p>}</div>}

    {!inCall ? <div className={cn(card, 'grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:gap-10 lg:p-8')}>
      <div>
        <div className={cn('flex h-72 flex-col items-center justify-center gap-3 rounded-2xl px-4 text-center', stageSurface)}>
          <span className="grid size-16 place-items-center rounded-full bg-card text-brand shadow-sm"><VideoOff aria-hidden="true" className="size-7" /></span>
          <p className="text-sm font-medium">Your session starts here</p>
          <p className="max-w-64 text-xs leading-5 text-muted-foreground">Camera and microphone are off. Join a live room to meet with others.</p>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">You control when your camera and microphone turn on.</p>
      </div>
      <div className="space-y-5 self-center">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-brand uppercase">Your learning session</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">{state.status === 'ended' ? 'This meeting has ended' : state.roomId ? 'Ready to join?' : 'Join your learning group'}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Use the Owlio invite from your teacher or session host.</p>
        </div>
        <form key={state.roomId} onSubmit={state.onJoin} className="space-y-3">
          <label htmlFor="meeting-invite" className="text-xs font-medium">Invite link or room code</label>
          <Input ref={roomInputRef} id="meeting-invite" defaultValue={state.meetingCode} placeholder="Paste an invite or room code" autoComplete="off" className="h-10" />
          <Button type="submit" disabled={state.busy || !state.apiEnabled} className="h-10 w-full bg-brand text-brand-foreground hover:bg-brand/90">{state.status === 'joining' ? 'Connecting…' : 'Join meeting'}</Button>
        </form>
        {state.canCreate && <Button variant="outline" className="h-10 w-full" disabled={state.busy || !state.apiEnabled} onClick={state.onCreate}>{state.busy && state.status !== 'joining' ? 'Creating…' : 'Create a meeting'}</Button>}
        {!state.apiEnabled && <p role="status" className="rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">Live meetings are unavailable while API integrations are paused. You can explore the layout without connecting or enabling devices.</p>}
        <Button variant="outline" className="h-10 w-full" onClick={state.onPreview}>Preview room layout</Button>
      </div>
    </div> : <>
      {state.preview && <p className="-mt-2 shrink-0 text-xs text-muted-foreground">Layout preview · Sample people, notes, and summaries are examples only. No live media, recording, or AI generation.</p>}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,0.42fr)] xl:grid-rows-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <section aria-label="Meeting stage" className="flex h-[26rem] min-h-0 min-w-0 flex-col gap-3 sm:grid sm:h-[22rem] sm:grid-cols-[minmax(0,1fr)_minmax(8.5rem,0.33fr)] md:col-span-2 xl:col-span-1 xl:col-start-1 xl:row-start-1 xl:h-auto">
          <div className="relative flex min-h-0 min-w-0 flex-1">
            {featured ? <StageTile person={featured} featured preview={state.preview} updateKey={state.revision} className="flex-1" />
              : <div className={cn('flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl pb-12 text-center', stageSurface)}><span className="grid size-16 place-items-center rounded-full bg-card text-brand shadow-sm"><VideoOff aria-hidden="true" className="size-7" /></span><p className="text-sm font-medium">Waiting for participants</p></div>}
            <div className="absolute inset-x-0 bottom-4 flex flex-wrap justify-center gap-2.5 px-3" role="group" aria-label="Meeting controls">
              <CallButton label={state.screenOn ? 'Stop presenting' : 'Share screen'} pressed={state.screenOn} disabled={!enabled} onClick={state.onScreen}><MonitorUp aria-hidden="true" /></CallButton>
              <CallButton label={state.cameraOn ? 'Turn camera off' : 'Turn camera on'} pressed={state.cameraOn} disabled={!enabled} onClick={state.onCamera}>{state.cameraOn ? <Video aria-hidden="true" /> : <VideoOff aria-hidden="true" />}</CallButton>
              <CallButton label={state.micOn ? 'Turn microphone off' : 'Turn microphone on'} pressed={state.micOn} disabled={!enabled} onClick={state.onMicrophone}>{state.micOn ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}</CallButton>
              <CallButton label={state.preview ? 'Exit preview' : 'Leave meeting'} tone="leave" onClick={state.onLeave}><PhoneOff aria-hidden="true" /></CallButton>
              <CallButton label={raised ? 'Lower hand' : 'Raise hand'} pressed={raised} disabled={!enabled || state.handUpdating} onClick={state.onHand}><Hand aria-hidden="true" /></CallButton>
            </div>
          </div>
          <div className="flex h-28 shrink-0 gap-3 overflow-x-auto sm:h-auto sm:min-h-0 sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto">
            {others.map(person => <StageTile key={person.identity} person={person} preview={state.preview} updateKey={state.revision} className="w-40 shrink-0 sm:h-[calc(50%-0.375rem)] sm:min-h-28 sm:w-auto" />)}
            {others.length === 0 && <div className={cn('flex w-40 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-3 text-center text-xs text-muted-foreground sm:h-full sm:w-auto', stageSurface)}><Users aria-hidden="true" className="size-5" />Others appear here when they join</div>}
          </div>
        </section>

        <section aria-label="Meeting participants" className={cn(card, 'min-h-72 xl:col-start-2 xl:row-start-1 xl:min-h-0', expanded === 'people' && 'min-h-[28rem] md:col-span-2 xl:col-span-1 xl:row-span-2', expanded === 'chat' && 'hidden')}>
          <PanelHeader icon={<Users />} title="Participants" subtitle={`${people.length} ${state.preview ? 'sample people' : people.length === 1 ? 'person connected' : 'people connected'}`} action={viewAll('people')} />
          {people.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground"><Users aria-hidden="true" className="size-6 opacity-40" /><p>No one connected</p></div>
            : <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 pb-2">{people.map(person => <li key={person.identity} className="flex items-center gap-3 py-1.5">
              <Avatar person={person} className="size-9 text-xs" />
              <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium">{person.name}{person.local ? ' · You' : ''}</p><p className="truncate text-[11px] text-muted-foreground">{person.detail}</p></div>
              <div className="flex shrink-0 items-center gap-1.5">
                {person.raised && <Hand role="img" aria-label="Hand raised" className="size-4 text-amber-600" />}
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground aria-pressed:text-brand" aria-label={`${state.pinnedIdentity === person.identity ? 'Unpin' : 'Pin'} ${person.name} ${state.pinnedIdentity === person.identity ? 'from' : 'for'} your view`} aria-pressed={state.pinnedIdentity === person.identity} onClick={() => togglePin(person.identity)}><Pin aria-hidden="true" className={cn('size-4', state.pinnedIdentity === person.identity && 'fill-current')} /></Button>
                {person.micOn ? <Mic role="img" aria-label="Microphone on" className="size-4 text-brand" /> : <MicOff role="img" aria-label="Microphone off" className="size-4 text-muted-foreground/70" />}
                {person.cameraOn ? <Video role="img" aria-label="Camera on" className="size-4 text-brand" /> : <VideoOff role="img" aria-label="Camera off" className="size-4 text-muted-foreground/70" />}
              </div>
            </li>)}</ul>}
          <p className="shrink-0 px-4 pb-3 text-[10px] leading-4 text-muted-foreground">Connected presence · Not official attendance</p>
        </section>

        <section aria-label="Meeting chat" className={cn(card, 'min-h-80 xl:col-start-2 xl:row-start-2 xl:min-h-0', expanded === 'chat' && 'min-h-[28rem] md:col-span-2 xl:col-span-1 xl:row-start-1 xl:row-span-2', expanded === 'people' && 'hidden')}>
          <PanelHeader icon={<MessageCircle />} title="Chat" subtitle={`${messages.length} ${messages.length === 1 ? 'message' : 'messages'}`} action={viewAll('chat')} />
          <div role="log" aria-label="Meeting messages" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-3">
            {messages.length === 0 ? <div className="flex h-full min-h-40 flex-col items-center justify-center gap-1 text-center">
              <span className="mb-2 grid size-24 place-items-center rounded-full bg-brand-soft"><img src="/mascot/owlio-owl.png" alt="" className="h-20 w-auto" /></span>
              <p className="text-xs font-semibold">No chat yet</p>
              <p className="max-w-52 text-[11px] leading-5 text-muted-foreground">Messages stay in this call and are cleared when you leave.</p>
            </div> : messages.map(message => {
              const own = message.identity === state.localIdentity
              const sender = people.find(person => person.identity === message.identity)
              return <article key={message.id} className={cn('flex max-w-[95%] gap-2', own && 'ml-auto flex-row-reverse')}>
                <Avatar person={{ identity: message.identity, name: own ? 'You' : sender?.name ?? 'Participant' }} className="size-7 text-[10px]" />
                <div className="min-w-0"><div className={cn('mb-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground', own && 'justify-end')}><span className="font-medium">{own ? 'You' : sender?.name || 'Participant'}</span><time dateTime={new Date(message.sentAt).toISOString()}>{new Date(message.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div><p className={cn('rounded-xl px-3 py-2 text-xs leading-5 break-words whitespace-pre-wrap', own ? 'bg-brand-soft text-brand-soft-foreground' : 'bg-muted text-foreground')}>{message.text}</p></div>
              </article>
            })}
          </div>
          <form onSubmit={state.onSendChat} className="relative mx-4 mb-4 shrink-0">
            <label htmlFor="meeting-chat-message" className="sr-only">Write a meeting message</label>
            <Input id="meeting-chat-message" disabled={!enabled} value={state.chatDraft} maxLength={500} onChange={event => state.onChatDraft(event.target.value)} placeholder={enabled ? 'Reply or @mention someone' : 'Join to send a message'} className="h-10 rounded-xl border-transparent bg-muted pr-11 text-xs md:text-xs dark:bg-muted" />
            <Button type="submit" size="icon-sm" variant="ghost" aria-label="Send message" disabled={!enabled || !state.chatDraft.trim() || state.chatSending} className="absolute top-1 right-1 text-brand hover:text-brand"><Send aria-hidden="true" className="size-4" /></Button>
          </form>
        </section>

        <div className="grid min-h-0 min-w-0 grid-cols-1 gap-3 md:col-span-2 md:grid-cols-[minmax(0,1.17fr)_minmax(0,1fr)] xl:col-span-1 xl:col-start-1 xl:row-start-2">
          <section aria-labelledby="coaching-notes-heading" className={cn(card, '@container min-h-80 xl:min-h-0')}>
            <div className="flex shrink-0 items-center gap-3 px-4 pt-4 pb-3">
              <Sparkles aria-hidden="true" className="size-6 text-brand" />
              <div className="min-w-0 flex-1"><h3 id="coaching-notes-heading" className="truncate text-sm font-semibold">AI Tracker Notes</h3><p className="truncate text-xs text-muted-foreground">{state.preview ? 'Sample transcript' : 'Recording unavailable'}</p></div>
              {state.preview ? <div aria-hidden="true" className="flex shrink-0 items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-brand text-brand-foreground"><Square className="size-3 fill-current" /></span>
                <span className="hidden h-7 items-center gap-[3px] @sm:flex">{waveform.map((height, index) => <span key={index} className={cn('w-[2px] rounded-full', height, index < 8 ? 'bg-foreground/70' : 'bg-brand/50')} />)}</span>
                <span className="text-sm font-semibold tabular-nums">00:41</span>
              </div> : <UnavailableBadge />}
            </div>
            <div className="mx-4 flex shrink-0 items-center justify-between gap-2 border-t border-border/70 pt-3 pb-1">
              <h4 className="text-xs font-medium">{state.preview ? sample.notesTitle : 'Session transcript'}</h4>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-xs" disabled aria-label="Download transcript (unavailable)"><Download aria-hidden="true" className="size-4" /></Button>
                <Button variant="ghost" size="icon-xs" disabled aria-label="Copy transcript (unavailable)"><Copy aria-hidden="true" className="size-4" /></Button>
              </div>
            </div>
            {state.preview ? <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pt-2 pb-4">{sample.notes.map(note => {
              const speaker = sample.people.find(person => person.name === note.speaker)
              return <li key={note.time} className="grid grid-cols-[2.5rem_2rem_minmax(0,1fr)] gap-3">
                <span className="pt-2 text-xs text-muted-foreground tabular-nums">{note.time}</span>
                <Avatar person={{ identity: speaker?.identity ?? note.speaker, name: note.speaker }} className="size-8 text-[10px]" />
                <div className="min-w-0"><p className="text-[13px] font-medium">{note.speaker}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{note.text}</p></div>
              </li>
            })}</ol> : <UnavailableBody>Recording and transcription aren’t connected in Owlio.</UnavailableBody>}
          </section>

          <section aria-labelledby="coaching-summary-heading" className={cn(card, 'min-h-80 xl:min-h-0')}>
            <div className="flex shrink-0 items-center gap-3 px-4 pt-4 pb-3">
              <FileText aria-hidden="true" className="size-6 text-brand" />
              <div className="min-w-0 flex-1"><h3 id="coaching-summary-heading" className="truncate text-sm font-semibold">AI Summary</h3><p className="truncate text-xs text-muted-foreground">{state.preview ? `${sample.summary.length} sample points` : 'Not connected'}</p></div>
              {state.preview ? <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand-soft-foreground">Sample</span> : <UnavailableBadge />}
            </div>
            {state.preview ? <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">{sample.summary.map((item, index) => <li key={item.title}>
              <div className="flex items-center gap-2"><Sparkles aria-hidden="true" className="size-3.5 shrink-0 text-brand" /><h4 className="min-w-0 flex-1 truncate text-[13px] font-medium">{index + 1}. {item.title}</h4><span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{item.range}</span></div>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.text}</p>
            </li>)}</ol> : <UnavailableBody>AI summaries aren’t connected. This interface doesn’t generate a session summary.</UnavailableBody>}
          </section>
        </div>
      </div>
    </>}
  </section>
}

function MeetingClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return <time dateTime={now.toISOString()} className="hidden px-1 text-xs font-medium text-muted-foreground tabular-nums md:inline">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
}

function UnavailableBadge() {
  return <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"><LockKeyhole aria-hidden="true" className="size-3" />Unavailable</span>
}

function UnavailableBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-6 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground"><LockKeyhole aria-hidden="true" className="size-5" /></span><p className="max-w-60 text-xs leading-5 text-muted-foreground">{children}</p></div>
}
