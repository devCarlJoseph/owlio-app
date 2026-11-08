import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router'
import { ParticipantEvent, Track, type Participant } from 'livekit-client'
import { ArrowLeft, AudioLines, Copy, Grid2X2, Hand, Info, LockKeyhole, MessageSquareText, Mic, MicOff, MonitorUp, PanelLeft, PhoneOff, Pin, Users, Video, VideoOff, X } from 'lucide-react'
import { cn } from 'cn'
import { useImmersiveDashboard } from '@/components/common/dashboard-chrome'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AudioTrack } from './audio-track'
import { classroomSessionPreview } from './classroom-meeting-preview'
import { ChatPanel, PeoplePanel, type CallPerson } from './coaching-meeting-parts'
import { meetGrid } from './meeting-grid'
import { useParticipantVideo } from './use-participant-video'
import type { MeetingPanel, MeetingRoomScreenProps, RoomStatus } from './meeting-room-types'

const statusLabels: Record<RoomStatus, string> = { idle: 'Not connected', joining: 'Connecting…', connected: 'Connected', reconnecting: 'Reconnecting', ended: 'Meeting ended' }
const avatarColors = ['bg-sky-600', 'bg-violet-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 'bg-indigo-600', 'bg-teal-600']
const tileSurface = 'bg-slate-200'

function colorFor(identity: string) {
  let hash = 0
  for (const character of identity) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return avatarColors[hash % avatarColors.length]
}

function MeetAvatar({ person, className }: { person: Pick<CallPerson, 'identity' | 'name'>; className?: string }) {
  return <span aria-hidden="true" className={cn('flex shrink-0 items-center justify-center rounded-full font-medium text-white', colorFor(person.identity), className)}>{(person.name.trim()[0] ?? 'O').toUpperCase()}</span>
}

function useSpeaking(participant?: Participant) {
  const [speaking, setSpeaking] = useState(participant?.isSpeaking ?? false)
  useEffect(() => {
    if (!participant) return
    const update = (value: boolean) => setSpeaking(value)
    participant.on(ParticipantEvent.IsSpeakingChanged, update)
    return () => { participant.off(ParticipantEvent.IsSpeakingChanged, update) }
  }, [participant])
  return speaking
}

function MeetTile({ person, pinned, onPin, updateKey, featured = false, className }: { person: CallPerson; pinned: boolean; onPin: () => void; updateKey: number; featured?: boolean; className?: string }) {
  const { videoRef, videoTrack, screenTrack } = useParticipantVideo(person.participant, updateKey)
  const speaking = useSpeaking(person.participant)
  return <article data-featured={featured || undefined} aria-label={`${person.name}${person.local ? ', you' : ''}${speaking ? ', speaking' : ''}`}
    className={cn('@container group relative isolate min-h-0 min-w-0 overflow-hidden rounded-xl text-foreground', tileSurface, speaking && 'ring-3 ring-brand ring-inset', className)}>
    {videoTrack ? <video ref={videoRef} autoPlay playsInline muted={person.local} aria-label={`${person.name} video`} className={cn('absolute inset-0 -z-10 size-full', screenTrack ? 'object-contain' : 'object-cover')} />
      : <div className="absolute inset-0 -z-10 grid place-items-center"><MeetAvatar person={person} className={featured ? 'size-24 text-4xl @xl:size-32 @xl:text-5xl' : 'size-12 text-xl @[14rem]:size-16 @[14rem]:text-2xl @[24rem]:size-24 @[24rem]:text-4xl'} /></div>}
    {person.participant && !person.local && [...person.participant.audioTrackPublications.values()].map(publication => publication.track ? <AudioTrack key={publication.trackSid} track={publication.track} /> : null)}
    {person.raised && <span title="Hand raised" className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-700"><Hand aria-hidden="true" className="size-3.5" /><span className="sr-only @[12rem]:not-sr-only">Hand raised</span></span>}
    <span role="img" aria-label={speaking ? 'Speaking' : person.micOn ? 'Microphone on' : 'Microphone off'} className={cn('absolute top-2 right-2 grid size-7 place-items-center rounded-full', speaking ? 'bg-brand text-brand-foreground' : 'bg-foreground/55 text-background', person.micOn && !speaking && 'opacity-0 group-hover:opacity-100')}>
      {speaking ? <AudioLines aria-hidden="true" className="size-4" /> : person.micOn ? <Mic aria-hidden="true" className="size-3.5" /> : <MicOff aria-hidden="true" className="size-3.5" />}
    </span>
    <button type="button" onClick={onPin} aria-pressed={pinned} aria-label={`${pinned ? 'Unpin' : 'Pin'} ${person.name} ${pinned ? 'from' : 'for'} your view`}
      className={cn('absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-opacity focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none group-hover:opacity-100', pinned ? 'bg-brand text-brand-foreground opacity-100' : 'bg-foreground/55 text-background opacity-0')}>
      <Pin aria-hidden="true" className={cn('size-4', pinned && 'fill-current')} />
    </button>
    <span className={cn('absolute bottom-2 left-2.5 max-w-[calc(100%-1.25rem)] truncate text-[13px] font-medium', videoTrack ? 'rounded bg-black/45 px-1.5 text-white' : 'text-foreground')}>{person.name}{person.local ? ' (You)' : ''}{screenTrack ? ' · Presenting' : ''}</span>
  </article>
}

function MeetButton({ label, onClick, disabled, pressed, tone, badge, controlRef, className, children }: {
  label: string; onClick: () => void; disabled?: boolean; pressed?: boolean; tone?: 'off' | 'leave' | 'panel'; badge?: number; controlRef?: Ref<HTMLButtonElement>; className?: string; children: ReactNode
}) {
  return <Button ref={controlRef} variant="ghost" title={label} aria-label={label} aria-pressed={tone === 'leave' ? undefined : pressed} disabled={disabled} onClick={onClick}
    className={cn('relative h-10 rounded-full px-0 disabled:opacity-60 [&_svg:not([class*=size-])]:size-5', tone === 'leave' ? 'w-14' : 'w-10', className,
      tone === 'leave' ? 'bg-rose-600 text-white hover:bg-rose-700 hover:text-white dark:hover:bg-rose-700'
        : tone === 'off' ? 'bg-rose-600 text-white hover:bg-rose-700 hover:text-white dark:hover:bg-rose-700'
          : tone === 'panel' ? 'text-foreground hover:bg-slate-200 aria-pressed:bg-brand-soft aria-pressed:text-brand-soft-foreground'
            : 'bg-slate-200 text-foreground hover:bg-slate-100 aria-pressed:bg-brand-soft aria-pressed:text-brand-soft-foreground')}>
    {children}
    {Boolean(badge) && <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 min-w-4.5 rounded-full bg-slate-500 px-1 text-[10px] leading-4.5 font-semibold text-white">{Math.min(badge ?? 0, 99)}</span>}
  </Button>
}

function InfoPanel({ meetingCode, preview, onCopy, onClose }: { meetingCode: string; preview: boolean; onCopy: () => void; onClose: () => void }) {
  return <section aria-label="Meeting details" className="flex min-h-0 flex-1 flex-col">
    <div className="flex shrink-0 items-center justify-between gap-2 py-3 pr-2 pl-5"><h3 className="text-base font-semibold">Meeting details</h3><Button variant="ghost" size="icon" className="rounded-full" aria-label="Close meeting details" onClick={onClose}><X aria-hidden="true" /></Button></div>
    <div className="space-y-5 overflow-y-auto px-5 pb-5 text-sm">
      <div>
        <h4 className="font-medium">Joining info</h4>
        <p className="mt-1 break-words text-muted-foreground">{meetingCode || (preview ? 'Layout preview · an invite appears once a live room is created.' : 'No invite available.')}</p>
        {meetingCode && <Button variant="ghost" className="mt-2 -ml-2 text-brand hover:text-brand" onClick={onCopy}><Copy aria-hidden="true" />Copy joining info</Button>}
      </div>
      <ul className="space-y-3 text-xs leading-5 text-muted-foreground">
        <li className="flex gap-2"><LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />Camera and microphone stay off until you turn them on.</li>
        <li className="flex gap-2"><Users aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />Being in the call is presence only. It isn’t official attendance.</li>
        <li className="flex gap-2"><MessageSquareText aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />In-call messages and raised hands are cleared when you leave.</li>
      </ul>
    </div>
  </section>
}

export function ClassroomMeetingScreen({ roomInputRef, ...state }: MeetingRoomScreenProps) {
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid')
  const panelRef = useRef<HTMLElement>(null)
  const chatTrigger = useRef<HTMLButtonElement>(null)
  const peopleTrigger = useRef<HTMLButtonElement>(null)
  const infoTrigger = useRef<HTMLButtonElement>(null)
  const inCall = state.hasRoom || state.preview
  const enabled = state.hasRoom && state.status === 'connected' && !state.preview
  const panel = state.activePanel
  useImmersiveDashboard(inCall)

  useEffect(() => {
    if (panel) panelRef.current?.focus()
  }, [panel])

  const people: CallPerson[] = state.preview
    ? classroomSessionPreview.people.map(person => ({ ...person, raised: Boolean(person.raised), local: false }))
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
  const presenter = people.find(person => {
    const publication = person.participant?.getTrackPublication(Track.Source.ScreenShare)
    return publication?.track && !publication.isMuted
  })
  const featured = people.find(person => person.identity === state.pinnedIdentity)
    ?? (layout === 'spotlight' ? presenter ?? people.find(person => !person.local) ?? people[0] : undefined)
  const others = people.filter(person => person !== featured)
  const grid = meetGrid(people)
  const raised = Boolean(state.raisedHands[state.localIdentity ?? ''])
  const title = state.preview ? classroomSessionPreview.title : 'Class meeting'

  function togglePanel(next: MeetingPanel) {
    if (panel === next) (next === 'chat' ? chatTrigger : next === 'people' ? peopleTrigger : infoTrigger).current?.focus()
    state.onPanel(next)
  }

  const tile = (person: CallPerson, className: string, isFeatured = false) => <MeetTile key={person.identity} person={person} featured={isFeatured} updateKey={state.revision} className={className}
    pinned={state.pinnedIdentity === person.identity} onPin={() => state.onPin(state.pinnedIdentity === person.identity ? null : person.identity)} />

  if (!inCall) return <section aria-label="Meeting room" data-meeting-design="classroom" className="flex min-w-0 flex-col gap-4 text-foreground">
    <header className="flex items-center gap-3">
      <Link to={state.backHref} aria-label="Back to Meeting Room" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-slate-200 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"><ArrowLeft aria-hidden="true" className="size-4" /></Link>
      <div className="w-0 min-w-0 flex-1"><h2 className="truncate text-base font-semibold">Meeting room</h2><p className="truncate text-xs text-muted-foreground">{state.meetingCode || 'A space to learn together'}</p></div>
    </header>
    {(state.message || state.error) && <div className="space-y-1 text-xs leading-5">{state.message && <p role="status">{state.message}</p>}{state.error && <p role="alert" className="font-medium text-destructive">{state.error}</p>}</div>}
    <div className="grid items-center gap-8 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,1fr)] lg:gap-12 lg:py-10">
      <div>
        <div className={cn('relative grid aspect-video place-items-center overflow-hidden rounded-2xl', tileSurface)}>
          <div className="flex flex-col items-center gap-3 text-center"><span className="grid size-20 place-items-center rounded-full bg-slate-500 text-white"><VideoOff aria-hidden="true" className="size-8" /></span><p className="text-sm font-medium">{state.status === 'ended' ? 'This meeting has ended' : 'Camera is off'}</p></div>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3" aria-hidden="true">
            <span className="grid size-12 place-items-center rounded-full bg-rose-600 text-white"><MicOff className="size-5" /></span>
            <span className="grid size-12 place-items-center rounded-full bg-rose-600 text-white"><VideoOff className="size-5" /></span>
          </div>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole aria-hidden="true" className="size-3.5" />Your devices stay off until you choose otherwise</p>
      </div>
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 text-center lg:text-left">
        <span className="text-[11px] font-semibold tracking-widest text-brand">OWLIO CLASSROOM</span>
        <h3 className="text-3xl font-normal tracking-tight">{state.status === 'ended' ? 'This meeting has ended' : state.roomId ? 'Ready to join?' : 'Join your learning group'}</h3>
        <p className="text-sm leading-6 text-muted-foreground">Bring your questions. Share your ideas. Start with an invite from your teacher or meeting host.</p>
        <form key={state.roomId} onSubmit={state.onJoin} className="grid gap-3 text-left">
          <label htmlFor="meeting-invite" className="text-xs font-medium">Invite link or room code</label>
          <Input ref={roomInputRef} id="meeting-invite" defaultValue={state.meetingCode} placeholder="Paste an invite or room code" autoComplete="off" className="h-11" />
          <Button type="submit" disabled={state.busy || !state.apiEnabled} className="h-11 rounded-full bg-brand text-brand-foreground hover:bg-brand/90">{state.status === 'joining' ? 'Connecting…' : 'Join meeting'}</Button>
        </form>
        {state.canCreate && <Button variant="outline" className="h-11 rounded-full" disabled={state.busy || !state.apiEnabled} onClick={state.onCreate}>{state.busy && state.status !== 'joining' ? 'Creating…' : 'Create a meeting'}</Button>}
        {!state.apiEnabled && <p role="status" className="rounded-xl bg-slate-200 p-3 text-left text-xs leading-5 text-muted-foreground">Live meetings are currently unavailable. You can preview the layout without connecting or enabling devices.</p>}
        <Button variant="outline" className="h-11 rounded-full" onClick={state.onPreview}>Preview room layout</Button>
      </div>
    </div>
  </section>

  return <section aria-label="Meeting room" data-meeting-design="classroom" className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 text-foreground md:min-h-[30rem]" onKeyDown={event => {
    if (event.key === 'Escape' && panel) { event.preventDefault(); togglePanel(panel) }
  }}>
    <header className="flex shrink-0 items-center gap-2">
      <div className="flex w-0 min-w-0 flex-1 items-center gap-2">
        <h2 className="truncate text-sm font-medium">{title}</h2>
        <span role="status" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap"><span aria-hidden="true" className={cn('size-1.5 rounded-full', enabled ? 'bg-emerald-500' : 'bg-slate-500')} />{state.preview ? 'Layout preview' : statusLabels[state.status]}</span>
      </div>
      <div role="group" aria-label="Video layout" className="flex shrink-0 items-center rounded-full bg-slate-200 p-0.5">
        <Button variant="ghost" size="icon-sm" className="rounded-full aria-pressed:bg-card aria-pressed:shadow-xs" title="Grid view" aria-label="Grid view" aria-pressed={!featured && layout === 'grid'} onClick={() => { state.onPin(null); setLayout('grid') }}><Grid2X2 aria-hidden="true" /></Button>
        <Button variant="ghost" size="icon-sm" className="rounded-full aria-pressed:bg-card aria-pressed:shadow-xs" title="Spotlight view" aria-label="Spotlight view" aria-pressed={Boolean(featured) || layout === 'spotlight'} onClick={() => setLayout('spotlight')}><PanelLeft aria-hidden="true" /></Button>
      </div>
      {state.isHost && !state.preview && <Button variant="outline" size="sm" className="shrink-0 rounded-full border-rose-300 text-rose-700 hover:text-rose-700" disabled={state.busy} onClick={state.onEnd}>End meeting for everyone</Button>}
    </header>
    {state.preview && <p className="shrink-0 text-[11px] text-muted-foreground">Sample classmates · no live people, media, or recording</p>}
    {(state.message || state.error) && <div className="shrink-0 space-y-1 text-xs leading-5">{state.message && <p role="status">{state.message}</p>}{state.error && <p role="alert" className="font-medium text-destructive">{state.error}</p>}</div>}

    <div className="relative flex min-h-0 flex-1 gap-3">
      <section aria-label="Meeting stage" className={cn('flex min-h-0 min-w-0 flex-1 gap-3', featured && others.length > 0 && 'flex-col lg:flex-row', panel && 'max-lg:invisible')}>
        {people.length === 0 ? <div className={cn('flex flex-1 flex-col items-center justify-center gap-3 rounded-xl px-4 text-center', tileSurface)}>
          <span className="grid size-16 place-items-center rounded-full bg-slate-500 text-white"><VideoOff aria-hidden="true" className="size-7" /></span>
          <h3 className="text-lg font-medium">{state.hasRoom ? 'Your room is ready' : 'Waiting for the meeting'}</h3>
          <p className="max-w-sm text-xs leading-5 text-muted-foreground">Connected participants will appear here.</p>
        </div>
          : featured ? <>
            {tile(featured, 'min-h-64 flex-1', true)}
            {others.length > 0 && <div role="group" aria-label="Other participants" className="flex h-28 shrink-0 gap-3 overflow-x-auto lg:h-auto lg:w-56 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">{others.map(person => tile(person, 'w-40 shrink-0 lg:h-32 lg:w-auto'))}</div>}
          </>
            : <div className={grid.container}>
              {grid.visible.map(person => tile(person, cn(grid.tile)))}
              {grid.hidden > 0 && <button type="button" onClick={() => togglePanel('people')} className={cn(grid.tile, 'grid place-items-center rounded-xl text-sm font-medium hover:bg-slate-100', tileSurface)}>+{grid.hidden} others</button>}
            </div>}
      </section>
      {panel && <aside ref={panelRef} tabIndex={-1} aria-label={panel === 'chat' ? 'In-call messages panel' : panel === 'people' ? 'Participants panel' : 'Meeting details panel'}
        className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:static lg:w-[22rem] lg:shrink-0">
        {panel === 'people' ? <PeoplePanel people={people} preview={state.preview} pinnedIdentity={state.pinnedIdentity} onPin={state.onPin} onClose={() => togglePanel('people')} />
          : panel === 'chat' ? <ChatPanel people={people} messages={state.preview ? [] : state.messages} localIdentity={state.localIdentity} enabled={enabled} draft={state.chatDraft} sending={state.chatSending} onDraft={state.onChatDraft} onSend={state.onSendChat} onClose={() => togglePanel('chat')} />
            : <InfoPanel meetingCode={state.meetingCode} preview={state.preview} onCopy={state.onCopy} onClose={() => togglePanel('info')} />}
      </aside>}
    </div>

    <footer className="flex h-auto shrink-0 flex-wrap items-center justify-center gap-2 py-1 md:grid md:h-16 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="hidden min-w-0 items-center gap-3 text-sm font-medium md:flex"><MeetingClock /><span aria-hidden="true" className="h-4 w-px bg-border" /><span className="truncate">{state.meetingCode || (state.preview ? 'Room preview' : 'Learning together')}</span></div>
      <div role="group" aria-label="Meeting controls" className="flex items-center justify-center gap-2 sm:gap-3">
        <MeetButton label={state.micOn ? 'Turn microphone off' : 'Turn microphone on'} pressed={state.micOn} tone={state.micOn ? undefined : 'off'} disabled={!enabled} onClick={state.onMicrophone}>{state.micOn ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}</MeetButton>
        <MeetButton label={state.cameraOn ? 'Turn camera off' : 'Turn camera on'} pressed={state.cameraOn} tone={state.cameraOn ? undefined : 'off'} disabled={!enabled} onClick={state.onCamera}>{state.cameraOn ? <Video aria-hidden="true" /> : <VideoOff aria-hidden="true" />}</MeetButton>
        <MeetButton label={raised ? 'Lower hand' : 'Raise hand'} pressed={raised} disabled={!enabled || state.handUpdating} onClick={state.onHand}><Hand aria-hidden="true" /></MeetButton>
        <MeetButton label={state.screenOn ? 'Stop presenting' : 'Share screen'} pressed={state.screenOn} disabled={!enabled} onClick={state.onScreen} className="max-sm:hidden"><MonitorUp aria-hidden="true" /></MeetButton>
        <MeetButton label={state.preview ? 'Exit preview' : 'Leave meeting'} tone="leave" onClick={state.onLeave}><PhoneOff aria-hidden="true" /></MeetButton>
      </div>
      <div role="group" aria-label="Meeting panels" className="flex items-center justify-end gap-1">
        <MeetButton controlRef={infoTrigger} tone="panel" label="Meeting details" pressed={panel === 'info'} onClick={() => togglePanel('info')} className="max-sm:hidden"><Info aria-hidden="true" /></MeetButton>
        <MeetButton controlRef={peopleTrigger} tone="panel" label={`Open participants, ${people.length} ${state.preview ? 'sample' : 'connected'}`} pressed={panel === 'people'} badge={people.length} onClick={() => togglePanel('people')}><Users aria-hidden="true" /></MeetButton>
        <MeetButton controlRef={chatTrigger} tone="panel" label={`Open chat${!state.preview && state.unreadMessages ? `, ${state.unreadMessages} unread` : ''}`} pressed={panel === 'chat'} badge={state.preview ? 0 : state.unreadMessages} onClick={() => togglePanel('chat')}><MessageSquareText aria-hidden="true" /></MeetButton>
      </div>
    </footer>
  </section>
}

function MeetingClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return <time dateTime={now.toISOString()} className="shrink-0 tabular-nums">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
}
