# Meeting room component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(meeting-room): add organized meeting source copies`

Target: `src/components/features/meeting-room/`. All destinations below are proposed, not active imports. Apply [folder rules](../../../sops/component-decomposition.md) without remounting an active call.

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `classroom-meeting-preview.ts`, `coaching-meeting-preview.ts` (labeled sample people only) |
| `ui/` | `audio-track.tsx`, `coaching-meeting-parts.tsx`, `meeting-whiteboard.tsx`, `meeting-room-panels.tsx`, `participant-tile.tsx` |
| `utils/` | `meeting-grid.ts`, `meeting-whiteboard-model.ts` |
| `hooks/` | `use-participant-video.ts` |
| `view/` | `classroom-meeting-screen.tsx`, `coaching-meeting-screen.tsx`, `meeting-room-hub.tsx`, `meeting-room-hub.test.tsx`, `meeting-room-screen.tsx`, `meeting-room-screen.test.tsx`, `meeting-room-view.tsx` |
| Root contract | `meeting-room-types.ts` |

`meeting-room-view.tsx` owns room lifecycle; `meeting-room-screen.tsx` dispatches by category; `coaching-meeting-screen.tsx` and `classroom-meeting-screen.tsx` own different role-specific layouts. Extract cohesive tiles/controls from the screens into `ui/` only after verifying media attachment, track cleanup, pinning and panel focus. Check whether `participant-tile.tsx` and `meeting-room-panels.tsx` still have consumers before moving or removing them. Keep the preview whiteboard disabled in a real connected call until sharing is actually implemented.

When changing imports, update the lazy route adapter in `src/pages/dashboard/classroom/meeting-room.tsx` and the docs/skill references to the meeting view. Verify student ESL/tutor/educator category routing, dashboard chrome restoration, and audio/video lifecycle. A preview is not proof of live presence or saved attendance.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/meeting-room/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `audio-track.tsx`

Current file: `src/components/features/meeting-room/audio-track.tsx`

```tsx
import { useEffect, useRef } from 'react'
import type { Track } from 'livekit-client'

export function AudioTrack({ track }: { track: Track }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    track.attach(audio)
    return () => { track.detach(audio) }
  }, [track])
  return <audio ref={audioRef} autoPlay />
}
```

### `classroom-meeting-preview.ts`

Current file: `src/components/features/meeting-room/classroom-meeting-preview.ts`

```ts
import type { CoachingSamplePerson } from './coaching-meeting-preview'

export const classroomSessionPreview: { title: string; people: CoachingSamplePerson[] } = {
  title: 'Grade 10 Science · Photosynthesis',
  people: [
    { identity: 'sample-class-host', name: 'Ms. Elena Cruz', detail: 'Educator · Host', micOn: true, cameraOn: true },
    { identity: 'sample-class-1', name: 'Noah Reyes', detail: 'Student', micOn: false, cameraOn: true },
    { identity: 'sample-class-2', name: 'Bea Santos', detail: 'Student', micOn: false, cameraOn: true, raised: true },
    { identity: 'sample-class-3', name: 'Liam Garcia', detail: 'Student', micOn: false, cameraOn: false },
    { identity: 'sample-class-4', name: 'Mia Tan', detail: 'Student', micOn: true, cameraOn: true },
    { identity: 'sample-class-5', name: 'Ethan Lim', detail: 'Student', micOn: false, cameraOn: true },
    { identity: 'sample-class-6', name: 'Chloe Ramos', detail: 'Student', micOn: false, cameraOn: false },
    { identity: 'sample-class-7', name: 'Lucas Mendoza', detail: 'Student', micOn: false, cameraOn: true },
    { identity: 'sample-class-8', name: 'Ava Villanueva', detail: 'Student', micOn: false, cameraOn: true },
    { identity: 'sample-class-9', name: 'Jacob Navarro', detail: 'Student', micOn: false, cameraOn: false },
    { identity: 'sample-class-10', name: 'Sofia Aquino', detail: 'Student', micOn: false, cameraOn: true },
  ],
}
```

### `classroom-meeting-screen.tsx`

Current file: `src/components/features/meeting-room/classroom-meeting-screen.tsx`

```tsx
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
```

### `coaching-meeting-parts.tsx`

Current file: `src/components/features/meeting-room/coaching-meeting-parts.tsx`

```tsx
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
          <div className="mb-0.5 flex flex-wrap items-baseline gap-2 text-[11px]"><span className="font-semibold">{own ? 'You' : sender?.name || 'Participant'}</span><time className="text-muted-foreground" dateTime={new Date(message.sentAt).toISOString()}>{new Date(message.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div>
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
```

### `coaching-meeting-preview.ts`

Current file: `src/components/features/meeting-room/coaching-meeting-preview.ts`

```ts
import type { MeetingRoomScreenProps } from './meeting-room-types'

export type CoachingSamplePerson = { identity: string; name: string; detail: string; micOn: boolean; cameraOn: boolean; raised?: boolean }
export type CoachingRole = Extract<MeetingRoomScreenProps['role'], 'esl' | 'tutors'>

export const coachingSessionPreview: Record<CoachingRole, { title: string; hostLabel: string; people: CoachingSamplePerson[] }> = {
  esl: {
    title: 'Conversation Practice · Travel English',
    hostLabel: 'ESL teacher',
    people: [
      { identity: 'sample-esl-host', name: 'Maya Santos', detail: 'ESL teacher · Host', micOn: true, cameraOn: true },
      { identity: 'sample-esl-1', name: 'Kenji Watanabe', detail: 'Learner · B1', micOn: true, cameraOn: true },
      { identity: 'sample-esl-2', name: 'Lucía Fernández', detail: 'Learner · A2', micOn: false, cameraOn: true, raised: true },
      { identity: 'sample-esl-3', name: 'Amira Haddad', detail: 'Learner · B2', micOn: false, cameraOn: false },
      { identity: 'sample-esl-4', name: 'Daniel Kim', detail: 'Learner · B1', micOn: true, cameraOn: false },
      { identity: 'sample-esl-5', name: 'Sofia Rossi', detail: 'Learner · A2', micOn: false, cameraOn: true },
      { identity: 'sample-esl-6', name: 'Omar Khalid', detail: 'Learner · B1', micOn: false, cameraOn: false },
      { identity: 'sample-esl-7', name: 'Hana Lee', detail: 'Learner · A1', micOn: false, cameraOn: true },
    ],
  },
  tutors: {
    title: 'Algebra Tutoring · Linear Equations',
    hostLabel: 'Tutor',
    people: [
      { identity: 'sample-tutor-host', name: 'Jordan Lee', detail: 'Tutor · Host', micOn: true, cameraOn: true },
      { identity: 'sample-tutor-1', name: 'Priya Nair', detail: 'Learner · Grade 9', micOn: true, cameraOn: true },
      { identity: 'sample-tutor-2', name: 'Marcus Allen', detail: 'Learner · Grade 9', micOn: false, cameraOn: true, raised: true },
      { identity: 'sample-tutor-3', name: 'Sofia Rossi', detail: 'Learner · Grade 10', micOn: false, cameraOn: false },
      { identity: 'sample-tutor-4', name: 'Ethan Brooks', detail: 'Learner · Grade 9', micOn: true, cameraOn: false },
      { identity: 'sample-tutor-5', name: 'Ava Martinez', detail: 'Learner · Grade 9', micOn: false, cameraOn: true },
    ],
  },
}
```

### `coaching-meeting-screen.tsx`

Current file: `src/components/features/meeting-room/coaching-meeting-screen.tsx`

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Copy, Hand, MessageSquareText, Mic, MicOff, MonitorUp, PhoneOff, Presentation, Users, Video, VideoOff } from 'lucide-react'
import { cn } from 'cn'
import { useImmersiveDashboard } from '@/components/common/dashboard-chrome'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { coachingSessionPreview } from './coaching-meeting-preview'
import { CallButton, CallTile, ChatPanel, PeoplePanel, type CallPerson } from './coaching-meeting-parts'
import { MeetingWhiteboard } from './meeting-whiteboard'
import { createBoardSeed, type BoardState } from './meeting-whiteboard-model'
import { meetGrid } from './meeting-grid'
import type { MeetingRoomScreenProps, RoomStatus } from './meeting-room-types'

const statusLabels: Record<RoomStatus, string> = { idle: 'Not connected', joining: 'Connecting…', connected: 'Connected', reconnecting: 'Reconnecting', ended: 'Meeting ended' }
const card = 'rounded-2xl border border-border/70 bg-card text-card-foreground shadow-xs'
const stageSurface = 'bg-linear-to-br from-brand-soft via-muted/80 to-brand-soft/70'

export function CoachingMeetingScreen({ roomInputRef, ...state }: MeetingRoomScreenProps) {
  const learnerView = state.role === 'students'
  const kind = (learnerView ? state.meetingCategory : state.role) === 'esl' ? 'esl' : 'tutors'
  const sample = coachingSessionPreview[kind]
  const inCall = state.hasRoom || state.preview
  const enabled = state.hasRoom && state.status === 'connected' && !state.preview
  const [boardOpen, setBoardOpen] = useState(false)
  const [board, setBoard] = useState<BoardState>(() => createBoardSeed(kind, sample.people[0].identity, sample.people[2].identity))
  useImmersiveDashboard(inCall)

  const people: CallPerson[] = state.preview
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
  const showBoard = boardOpen && state.preview
  const pinned = people.find(person => person.identity === state.pinnedIdentity)
  const strip = showBoard ? people : pinned ? people.filter(person => person !== pinned) : []
  const raised = Boolean(state.raisedHands[state.localIdentity ?? ''])
  const title = state.preview ? sample.title : kind === 'esl' ? 'Language learning session' : 'Tutoring session'
  const panel = state.activePanel
  const grid = meetGrid(people)
  const gridPeople = grid.visible
  const hiddenCount = grid.hidden
  const gridTile = cn(grid.tile)
  const names = Object.fromEntries(sample.people.map(person => [person.identity, person.name]))

  if (!inCall) return <section aria-label="Meeting room" data-meeting-design="coaching" className="flex min-w-0 flex-col gap-4 text-foreground">
    <header className="flex flex-wrap items-center gap-3">
      <Link to={state.backHref} aria-label="Back to Meeting Room" className="grid size-9 shrink-0 place-items-center rounded-full border border-border/70 bg-card text-foreground shadow-xs hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"><ArrowLeft aria-hidden="true" className="size-4" /></Link>
      <div className="min-w-0"><h2 className="truncate text-base font-semibold sm:text-lg">{title}</h2><p className="truncate text-xs text-muted-foreground">{state.meetingCode || 'A little space for focused learning'}</p></div>
    </header>
    {(state.message || state.error) && <div className="space-y-1 text-xs leading-5">{state.message && <p role="status">{state.message}</p>}{state.error && <p role="alert" className="font-medium text-destructive">{state.error}</p>}</div>}
    <div className={cn(card, 'grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:gap-10 lg:p-8')}>
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
    </div>
  </section>

  return <section aria-label="Meeting room" data-meeting-design="coaching" className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 text-foreground md:min-h-[30rem]" onKeyDown={event => {
    if (event.key === 'Escape' && panel) { event.preventDefault(); state.onPanel(panel) }
  }}>
    <header className="flex shrink-0 items-center gap-3">
      <Link to={state.backHref} aria-label="Back to Meeting Room" className="grid size-9 shrink-0 place-items-center rounded-full text-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"><ArrowLeft aria-hidden="true" className="size-4" /></Link>
      <div className="w-0 min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold sm:text-base">{title}</h2>
        <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">{state.meetingCode || (state.preview ? 'Sample people and board · nothing here is live or saved' : 'Live session')}</span>
          {state.roomId && <Button variant="ghost" size="icon-xs" onClick={state.onCopy} aria-label="Copy meeting invite" title="Copy meeting invite"><Copy aria-hidden="true" /></Button>}
        </div>
      </div>
      <span role="status" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium whitespace-nowrap text-brand-soft-foreground"><span aria-hidden="true" className={cn('size-1.5 rounded-full', enabled ? 'bg-emerald-500' : 'bg-brand')} />{state.preview ? 'Layout preview' : statusLabels[state.status]}</span>
      {state.isHost && !state.preview && <Button variant="outline" size="sm" className="shrink-0 rounded-full border-rose-300 text-rose-700 hover:text-rose-700" disabled={state.busy} onClick={state.onEnd}>End meeting for everyone</Button>}
    </header>

    {(state.message || state.error) && <div className="shrink-0 space-y-1 text-xs leading-5">{state.message && <p role="status">{state.message}</p>}{state.error && <p role="alert" className="font-medium text-destructive">{state.error}</p>}</div>}

    <div className="relative flex min-h-0 flex-1 gap-3">
      <section aria-label="Meeting stage" className={cn('flex min-h-0 min-w-0 flex-1 gap-3', strip.length > 0 && 'flex-col lg:flex-row', panel && 'max-lg:invisible')}>
        {showBoard ? <MeetingWhiteboard board={board} onChange={setBoard} host={{ id: sample.people[0].identity, name: sample.people[0].name }} hostLabel={sample.hostLabel} learner={{ id: sample.people[1].identity, name: sample.people[1].name }} names={names} learnerOnly={learnerView} onClose={() => setBoardOpen(false)} />
          : pinned ? <CallTile person={pinned} featured updateKey={state.revision} className="min-h-64 flex-1" />
            : people.length === 0 ? <div className={cn('flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl text-center', stageSurface)}><span className="grid size-16 place-items-center rounded-full bg-card text-brand shadow-sm"><VideoOff aria-hidden="true" className="size-7" /></span><p className="text-sm font-medium">Waiting for participants</p></div>
              : <div className={grid.container}>
                {gridPeople.map(person => <CallTile key={person.identity} person={person} updateKey={state.revision} className={gridTile} />)}
                {hiddenCount > 0 && <button type="button" onClick={() => state.onPanel('people')} className={cn(gridTile, 'grid place-items-center rounded-2xl bg-muted text-sm font-medium text-muted-foreground hover:bg-accent')}>+{hiddenCount} others</button>}
              </div>}
        {strip.length > 0 && <div aria-label={showBoard ? 'Participants beside the whiteboard' : 'Other participants'} role="group" className="flex h-28 shrink-0 gap-3 overflow-x-auto lg:h-auto lg:w-52 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
          {strip.map(person => <CallTile key={person.identity} person={person} updateKey={state.revision} className="w-40 shrink-0 lg:h-32 lg:w-auto" />)}
        </div>}
      </section>

      {panel && <aside aria-label={panel === 'chat' ? 'In-call messages panel' : 'Participants panel'} className={cn(card, 'absolute inset-0 z-20 flex flex-col overflow-hidden lg:static lg:w-[22rem] lg:shrink-0')}>
        {panel === 'people'
          ? <PeoplePanel people={people} preview={state.preview} pinnedIdentity={state.pinnedIdentity} onPin={state.onPin} onClose={() => state.onPanel('people')} />
          : <ChatPanel people={people} messages={messages} localIdentity={state.localIdentity} enabled={enabled} draft={state.chatDraft} sending={state.chatSending} onDraft={state.onChatDraft} onSend={state.onSendChat} onClose={() => state.onPanel('chat')} />}
      </aside>}
    </div>

    <footer className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 pb-1 sm:gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="hidden min-w-0 items-center gap-3 text-sm md:flex"><MeetingClock /><span aria-hidden="true" className="h-4 w-px bg-border" /><span className="truncate font-medium">{state.meetingCode || title}</span></div>
      <div role="group" aria-label="Meeting controls" className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
        <CallButton label={state.micOn ? 'Turn microphone off' : 'Turn microphone on'} pressed={state.micOn} tone={state.micOn ? undefined : 'off'} disabled={!enabled} onClick={state.onMicrophone}>{state.micOn ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}</CallButton>
        <CallButton label={state.cameraOn ? 'Turn camera off' : 'Turn camera on'} pressed={state.cameraOn} tone={state.cameraOn ? undefined : 'off'} disabled={!enabled} onClick={state.onCamera}>{state.cameraOn ? <Video aria-hidden="true" /> : <VideoOff aria-hidden="true" />}</CallButton>
        <CallButton label={raised ? 'Lower hand' : 'Raise hand'} pressed={raised} disabled={!enabled || state.handUpdating} onClick={state.onHand}><Hand aria-hidden="true" /></CallButton>
        <CallButton label={state.screenOn ? 'Stop presenting' : 'Share screen'} pressed={state.screenOn} disabled={!enabled} onClick={state.onScreen} className="max-sm:hidden"><MonitorUp aria-hidden="true" /></CallButton>
        <CallButton label={state.preview ? 'Whiteboard' : 'Whiteboard (available in layout preview for now)'} pressed={showBoard} disabled={!state.preview} onClick={() => setBoardOpen(open => !open)}><Presentation aria-hidden="true" /></CallButton>
        <CallButton label={state.preview ? 'Exit preview' : 'Leave meeting'} tone="leave" wide onClick={state.onLeave}><PhoneOff aria-hidden="true" /></CallButton>
      </div>
      <div role="group" aria-label="Meeting panels" className="flex items-center justify-end gap-1.5 sm:gap-2">
        <CallButton label={`Open participants, ${people.length} ${state.preview ? 'sample' : 'connected'}`} pressed={panel === 'people'} badge={people.length} onClick={() => state.onPanel('people')}><Users aria-hidden="true" /></CallButton>
        <CallButton label={`Open chat${state.unreadMessages && !state.preview ? `, ${state.unreadMessages} unread` : ''}`} pressed={panel === 'chat'} badge={state.preview ? 0 : state.unreadMessages} onClick={() => state.onPanel('chat')}><MessageSquareText aria-hidden="true" /></CallButton>
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
```

### `meeting-grid.ts`

Current file: `src/components/features/meeting-room/meeting-grid.ts`

```ts
export const MAX_GRID_TILES = 16

const basis = ['', 'sm:basis-full', 'sm:basis-[calc((100%-0.75rem)/2)]', 'sm:basis-[calc((100%-1.5rem)/3)]', 'sm:basis-[calc((100%-2.25rem)/4)]']
const height = ['', 'sm:h-full', 'sm:h-[calc((100%-0.75rem)/2)]', 'sm:h-[calc((100%-1.5rem)/3)]', 'sm:h-[calc((100%-2.25rem)/4)]']

export function meetGrid<T>(people: T[]) {
  const visible = people.length > MAX_GRID_TILES ? people.slice(0, MAX_GRID_TILES - 1) : people
  const hidden = people.length - visible.length
  const count = visible.length + (hidden ? 1 : 0)
  const columns = count <= 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : 4
  const rows = Math.min(Math.ceil(count / columns), 4)
  return {
    visible,
    hidden,
    container: 'grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto sm:flex sm:flex-wrap sm:content-center sm:justify-center sm:overflow-hidden',
    tile: ['h-40 sm:h-auto sm:shrink-0 sm:grow-0', basis[columns], height[rows], visible.length === 1 ? 'col-span-2 h-72' : ''].join(' '),
  }
}
```

### `meeting-room-hub.test.tsx`

Current file: `src/components/features/meeting-room/meeting-room-hub.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthSessionContext } from '@/components/features/auth/auth-session-context'
import { ClassroomPreviewProvider } from '@/components/features/classrooms/classroom-preview-provider'
import { classroomPreviewStore } from '@/components/features/classrooms/classroom-preview-store'
import MeetingRoomPage from '@/pages/dashboard/classroom/meeting-room'

beforeEach(() => classroomPreviewStore.reset())
afterEach(cleanup)

function open(path = '/students/classrooms/meeting-room') {
  render(<MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={{ user: null, status: 'anonymous', error: null,
    signIn: async () => { throw new Error('Preview only') }, signOut: async () => {}, refreshCurrentUser: async () => {} }}>
    <ClassroomPreviewProvider><Routes>
      <Route element={<><nav aria-label="Workspace navigation">Sidebar</nav><Outlet /></>}>
        <Route path="/:role/classrooms/meeting-room" element={<MeetingRoomPage />} />
      </Route>
    </Routes></ClassroomPreviewProvider>
  </AuthSessionContext.Provider></MemoryRouter>)
}

describe('meeting room entry', () => {
  it('shows three categories and filters enrolled classes while keeping the student workspace', () => {
    open()
    expect(screen.getByRole('navigation', { name: 'Workspace navigation' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Classroom/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Classroom/ }))
    expect(screen.getByRole('heading', { name: 'Human Computer Interaction · BSIT 3A' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Algebra coaching circle' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Tutor/ }))
    expect(screen.getByRole('heading', { name: 'Tutor meetings' })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Open class' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Open class' }).every(link => link.getAttribute('href')?.startsWith('/students/classrooms/'))).toBe(true)
    expect(screen.queryByRole('heading', { name: 'Human Computer Interaction · BSIT 3A' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /ESL/ }))
    expect(screen.getByRole('heading', { name: 'ESL meetings' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Everyday English' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'English conversation club' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Use a meeting invite' }).getAttribute('href')).toBe('/students/classrooms/meeting-room?category=esl&join=1')
    expect(screen.queryByRole('link', { name: 'Join meeting' })).toBeNull()
  })

  it('opens invite entry inside the dashboard and returns to the category page', () => {
    open('/students/classrooms/meeting-room?category=tutors')
    fireEvent.click(screen.getByRole('link', { name: 'Use a meeting invite' }))
    expect(screen.getByLabelText('Invite link or room code')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Meeting room' }).className).not.toContain('fixed')
    expect(screen.getByRole('navigation', { name: 'Workspace navigation' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Back to Meeting Room' }))
    expect(screen.getByRole('group', { name: 'Meeting categories' })).toBeTruthy()
  })

  it('preserves a teacher workspace and keeps direct invites supported', () => {
    open('/tutors/classrooms/meeting-room?category=tutors')
    expect(screen.getAllByRole('link', { name: 'Open class' }).every(link => link.getAttribute('href')?.startsWith('/tutors/classrooms/'))).toBe(true)
    cleanup()
    open('/students/classrooms/meeting-room?room=12345678-1234-1234-1234-123456789abc')
    expect(screen.getByLabelText('Invite link or room code')).toBeTruthy()
    expect(screen.queryByRole('group', { name: 'Meeting categories' })).toBeNull()
  })

  it.each([['esl', 'coaching'], ['tutors', 'coaching'], ['educators', 'classroom']] as const)('previews a student %s meeting in the %s design', (category, design) => {
    open(`/students/classrooms/meeting-room?category=${category}`)
    expect(screen.getByRole('link', { name: 'Preview room layout' }).getAttribute('href')).toBe(`/students/classrooms/meeting-room?category=${category}&join=1&layout-preview=1`)
    fireEvent.click(screen.getByRole('link', { name: 'Preview room layout' }))
    expect(screen.getByRole('region', { name: 'Meeting room' }).getAttribute('data-meeting-design')).toBe(design)
  })

  it.each(['students', 'educators', 'esl', 'tutors'])('previews the %s layout without enabling live media and returns to the lobby', role => {
    open(`/${role}/classrooms/meeting-room`)
    fireEvent.click(screen.getByRole('link', { name: 'Preview room layout' }))
    expect(screen.getByRole('region', { name: 'Meeting room' }).getAttribute('data-meeting-design')).toBe(role === 'esl' || role === 'tutors' ? 'coaching' : 'classroom')
    expect(screen.getByRole('button', { name: 'Turn camera on' }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Exit preview' }))
    expect(screen.getByLabelText('Invite link or room code')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Workspace navigation' })).toBeTruthy()
  })
})
```

### `meeting-room-hub.tsx`

Current file: `src/components/features/meeting-room/meeting-room-hub.tsx`

```tsx
import { GraduationCap, Languages, School, Video } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useClassroomPrototype } from '@/components/features/classrooms/classroom-prototype-context'

const categories = [
  { value: 'educators', label: 'Classroom', description: 'Meet with your school educator and classmates.', icon: School },
  { value: 'tutors', label: 'Tutor', description: 'Join your tutor for individual or group learning.', icon: GraduationCap },
  { value: 'esl', label: 'ESL', description: 'Meet your ESL teacher for language practice.', icon: Languages },
] as const

export function MeetingRoomHub() {
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const role = getDashboardRole(pathname) ?? 'students'
  const { getClassroomsForWorkspace, classroomsLoading, classroomsError, reloadClassrooms, connectedModeEnabled } = useClassroomPrototype()
  const selected = categories.find(item => item.value === params.get('category'))
  const classrooms = getClassroomsForWorkspace(role)
  const matches = selected ? classrooms.filter(item => item.ownerWorkspace === selected.value) : []
  const base = `/${role}/classrooms/meeting-room`
  const coaching = role === 'esl' || role === 'tutors'

  return <div className="mx-auto w-full max-w-6xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
      <h2 className="text-2xl font-semibold tracking-tight">Meeting Room</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{coaching ? 'A focused space for individual and group learning, with your people and conversation close by.' : 'Bring your learning group together. Join with an invite, then choose a grid or spotlight view.'}</p>
      </div>
      <Link to={`${base}?${selected && role === 'students' ? `category=${selected.value}&` : ''}join=1&layout-preview=1`} className={buttonVariants({ variant: 'outline' })}><Video aria-hidden="true" />Preview room layout</Link>
    </div>
    <div role="group" aria-label="Meeting categories" className="grid gap-4 lg:grid-cols-3">
      {categories.map(({ value, label, description, icon: Icon }) => <Button
        key={value} variant="outline" aria-pressed={selected?.value === value}
        onClick={() => setParams({ category: value })}
        className="h-auto min-w-0 items-start justify-start gap-4 whitespace-normal rounded-2xl bg-card p-5 text-left aria-pressed:border-brand aria-pressed:bg-brand/5 aria-pressed:ring-1 aria-pressed:ring-brand"
      >
        <Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-brand" />
        <span><span className="block text-base font-semibold">{label}</span><span className="mt-2 block text-sm font-normal leading-6 text-muted-foreground">{description}</span></span>
      </Button>)}
    </div>
    {!selected ? <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Select Classroom, Tutor, or ESL to find your learning group.</div> : <section aria-labelledby="meeting-category-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="meeting-category-heading" className="text-lg font-semibold">{selected.label} meetings</h3>
        <Link className={buttonVariants()} to={`${base}?category=${selected.value}&join=1`}><Video aria-hidden="true" />Use a meeting invite</Link>
      </div>
      {!connectedModeEnabled && <p className="text-sm text-muted-foreground">Class previews are shown below. Live meetings are unavailable in this preview.</p>}
      {connectedModeEnabled && classrooms.some(item => item.ownerWorkspace === null) && <p className="text-sm text-muted-foreground">Your classes can’t be grouped by teacher type yet. Use your teacher’s meeting invite to join.</p>}
      {classroomsLoading ? <p role="status">Loading your classes…</p> : classroomsError ? <div role="alert" className="space-y-3 rounded-xl border p-4"><p>{classroomsError}</p><Button variant="outline" onClick={reloadClassrooms}>Try again</Button></div> : matches.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center"><p className="font-medium">No {selected.label.toLowerCase()} classes to show</p><p className="mt-2 text-sm text-muted-foreground">Use a meeting invite from your teacher when it’s time to join.</p></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map(classroom => <Card key={classroom.id}>
          <CardHeader><h4 className="font-semibold">{classroom.name}</h4><p className="text-sm text-muted-foreground">{classroom.instructorName || 'Your teacher'}{classroom.isMock ? ' · Preview' : ''}</p></CardHeader>
          <CardContent>
            {classroom.meetingId && !classroom.isMock ? <Link className={buttonVariants()} to={`${base}?category=${selected.value}&room=${encodeURIComponent(classroom.meetingId)}`}>Join meeting</Link> : <p className="text-sm text-muted-foreground">No meeting linked. Ask your teacher for an invite.</p>}
            <Link className="rounded text-sm text-brand underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/${role}/classrooms/${classroom.id}`}>Open class</Link>
          </CardContent>
        </Card>)}
      </div>}
    </section>}
  </div>
}
```

### `meeting-room-panels.tsx`

Current file: `src/components/features/meeting-room/meeting-room-panels.tsx`

```tsx
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
```

### `meeting-room-screen.test.tsx`

Current file: `src/components/features/meeting-room/meeting-room-screen.test.tsx`

```tsx
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Participant, ParticipantEvent, Track } from 'livekit-client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DashboardChromeContext } from '@/components/common/dashboard-chrome'
import { MeetingRoomScreen } from './meeting-room-screen'
import type { MeetingRoomScreenProps } from './meeting-room-types'

afterEach(cleanup)

function state(overrides: Partial<MeetingRoomScreenProps> = {}): MeetingRoomScreenProps {
  return {
    role: 'students', backHref: '/students/classrooms/meeting-room', roomId: '', meetingCode: '', roomInputRef: { current: null },
    status: 'idle', preview: true, hasRoom: false, apiEnabled: false, canCreate: false, isHost: false, busy: false, message: '', error: '',
    participants: [], pinnedIdentity: null, onPin: vi.fn(), raisedHands: {}, revision: 0, micOn: false, cameraOn: false, screenOn: false,
    handUpdating: false, activePanel: null, onPanel: vi.fn(), unreadMessages: 0, messages: [], chatDraft: '', onChatDraft: vi.fn(), chatSending: false,
    onSendChat: vi.fn(event => event.preventDefault()), onJoin: vi.fn(event => event.preventDefault()), onCreate: vi.fn(), onPreview: vi.fn(), onCopy: vi.fn(), onLeave: vi.fn(), onEnd: vi.fn(), onMicrophone: vi.fn(), onCamera: vi.fn(), onScreen: vi.fn(), onHand: vi.fn(), ...overrides,
  }
}
function show(props: MeetingRoomScreenProps) { return render(<MemoryRouter><MeetingRoomScreen {...props} /></MemoryRouter>) }
function participant(identity: string, name: string): Participant {
  return { identity, name, isCameraEnabled: false, isMicrophoneEnabled: false, isSpeaking: false, on: vi.fn(), off: vi.fn(), audioTrackPublications: new Map(), getTrackPublication: () => undefined } as unknown as Participant
}

describe('role-specific meeting layouts', () => {
  it('uses live speaking events and removes the listener on unmount', () => {
    const person = participant('a', 'Alex')
    const view = show(state({ preview: false, hasRoom: true, status: 'connected', participants: [person] }))
    const update = vi.mocked(person.on).mock.calls.find(([event]) => event === ParticipantEvent.IsSpeakingChanged)?.[1] as (speaking: boolean) => void
    act(() => update(true))
    expect(screen.getByRole('article', { name: 'Alex, speaking' })).toBeTruthy()
    act(() => update(false))
    expect(screen.getByRole('article', { name: 'Alex' })).toBeTruthy()
    view.unmount()
    expect(person.off).toHaveBeenCalledWith(ParticipantEvent.IsSpeakingChanged, update)
  })
  it('prioritizes a real screen share in spotlight and preserves contain-fit media', () => {
    const presenter = participant('b', 'Presenter')
    const track = { attach: vi.fn(), detach: vi.fn() }
    vi.spyOn(presenter, 'getTrackPublication').mockImplementation(source => source === Track.Source.ScreenShare ? { track, isMuted: false } as unknown as ReturnType<Participant['getTrackPublication']> : undefined)
    const view = show(state({ preview: false, hasRoom: true, status: 'connected', participants: [participant('a', 'Alex'), presenter] }))
    fireEvent.click(screen.getByRole('button', { name: 'Spotlight view' }))
    expect(screen.getByRole('article', { name: 'Presenter' }).closest('[data-featured]')).toBeTruthy()
    expect(screen.getByLabelText('Presenter video').classList.contains('object-contain')).toBe(true)
    expect(track.attach).toHaveBeenCalled()
    view.unmount()
    expect(track.detach).toHaveBeenCalled()
  })
  it.each(['idle', 'joining', 'ended'] as const)('does not mislabel a %s room as connected', status => {
    show(state({ preview: false, hasRoom: true, status }))
    expect(screen.queryByText('Connected')).toBeNull()
    expect(screen.getByRole('button', { name: 'Turn microphone on' }).hasAttribute('disabled')).toBe(true)
  })
  it.each(['students', 'educators'] as const)('renders each %s participant once through grid and spotlight layouts', role => {
    const props = state({ role, preview: false, hasRoom: true, status: 'connected', participants: [participant('a', 'Alex'), participant('b', 'Sam')], localIdentity: 'a' })
    show(props)
    const stage = within(screen.getByRole('region', { name: 'Meeting stage' }))
    expect(stage.getAllByRole('article')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Spotlight view' }))
    expect(stage.getAllByRole('article')).toHaveLength(2)
    fireEvent.click(stage.getByRole('button', { name: 'Pin Sam for your view' }))
    expect(props.onPin).toHaveBeenCalledWith('b')
    fireEvent.click(screen.getByRole('button', { name: 'Grid view' }))
    expect(props.onPin).toHaveBeenCalledWith(null)
  })
  it('restores focus to the panel trigger on close and supports Escape', () => {
    const props = state({ activePanel: 'chat' })
    show(props)
    const panel = screen.getByRole('complementary', { name: 'In-call messages panel' })
    expect(document.activeElement).toBe(panel)
    fireEvent.click(within(panel).getByRole('button', { name: 'Close in-call messages' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open chat' }))
    fireEvent.keyDown(panel, { key: 'Escape' })
    expect(props.onPanel).toHaveBeenCalledWith('chat')
  })
  it('keeps stale roster and chat data out of the classroom preview', () => {
    show(state({ activePanel: 'chat', isHost: true, participants: [participant('a', 'Stale attendee')], messages: [{ id: 'old', identity: 'a', text: 'Stale message', sentAt: 1000 }] }))
    expect(screen.queryByText('Stale attendee')).toBeNull()
    expect(screen.queryByText('Stale message')).toBeNull()
    expect(screen.queryByRole('button', { name: 'End meeting for everyone' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Open participants, 11 sample' })).toBeTruthy()
  })
  it.each(['students', 'educators'] as const)('shows %s a Meet-style classroom grid of labeled sample classmates with meeting details', role => {
    const props = state({ role })
    const view = show(props)
    expect(screen.getByRole('region', { name: 'Meeting room' }).getAttribute('data-meeting-design')).toBe('classroom')
    expect(within(screen.getByRole('region', { name: 'Meeting stage' })).getAllByRole('article')).toHaveLength(11)
    expect(screen.getByText('Sample classmates · no live people, media, or recording')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Meeting details' }))
    expect(props.onPanel).toHaveBeenCalledWith('info')
    view.rerender(<MemoryRouter><MeetingRoomScreen {...props} activePanel="info" meetingCode="abc-defg-hij" roomId="room" /></MemoryRouter>)
    const details = within(screen.getByRole('region', { name: 'Meeting details' }))
    expect(details.getByText('abc-defg-hij')).toBeTruthy()
    expect(details.getByText('Being in the call is presence only. It isn’t official attendance.')).toBeTruthy()
    fireEvent.click(details.getByRole('button', { name: 'Copy joining info' }))
    expect(props.onCopy).toHaveBeenCalledOnce()
  })
  it.each([['esl', 'coaching'], ['tutors', 'coaching'], ['educators', 'classroom'], [null, 'classroom']] as const)('routes a student in a %s meeting to the %s design', (meetingCategory, design) => {
    show(state({ role: 'students', meetingCategory }))
    expect(screen.getByRole('region', { name: 'Meeting room' }).getAttribute('data-meeting-design')).toBe(design)
  })
  it('gives students in an ESL meeting the student-only whiteboard view', () => {
    show(state({ role: 'students', meetingCategory: 'esl' }))
    expect(within(screen.getByRole('region', { name: 'Meeting stage' })).getAllByRole('article')).toHaveLength(8)
    fireEvent.click(screen.getByRole('button', { name: 'Whiteboard' }))
    const board = within(screen.getByRole('region', { name: 'Whiteboard' }))
    expect(board.getByText('Student view')).toBeTruthy()
    expect(board.queryByRole('group', { name: 'View board as' })).toBeNull()
    expect(board.queryByRole('button', { name: 'Add a shape' })).toBeNull()
    expect(board.queryByLabelText('Instruction for students')).toBeNull()
    expect(board.getByRole('status', { name: 'Current instruction' }).textContent).toContain('Encircle the blue square')
    fireEvent.focus(board.getByRole('button', { name: 'blue square shape' }))
    fireEvent.click(board.getByRole('button', { name: 'Circle selected item' }))
    expect(board.getByRole('button', { name: 'Circle mark by you' })).toBeTruthy()
  })
  it.each([['esl', 8], ['tutors', 6]] as const)('shows a clean Meet-style grid of labeled sample people for %s', (role, count) => {
    const props = state({ role, participants: [participant('a', 'Stale attendee')], messages: [{ id: 'old', identity: 'a', text: 'Stale message', sentAt: 1000 }] })
    show(props)
    expect(screen.getByRole('region', { name: 'Meeting room' }).getAttribute('data-meeting-design')).toBe('coaching')
    expect(within(screen.getByRole('region', { name: 'Meeting stage' })).getAllByRole('article')).toHaveLength(count)
    expect(screen.queryByText('Stale attendee')).toBeNull()
    expect(screen.queryByRole('region', { name: 'Meeting participants' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Meeting chat' })).toBeNull()
    expect(screen.queryByRole('heading', { name: /AI Tracker Notes|AI Summary/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: `Open participants, ${count} sample` }))
    expect(props.onPanel).toHaveBeenCalledWith('people')
  })
  it.each(['esl', 'tutors'] as const)('opens %s side panels with honest presence and preview chat', role => {
    const props = state({ role, activePanel: 'people', messages: [{ id: 'old', identity: 'a', text: 'Stale message', sentAt: 1000 }] })
    const view = show(props)
    const people = within(screen.getByRole('region', { name: 'Meeting participants' }))
    expect(people.getByText('Connected presence · Not official attendance')).toBeTruthy()
    fireEvent.click(people.getAllByRole('button', { name: /^Pin .* for your view$/ })[1])
    expect(props.onPin).toHaveBeenCalledOnce()
    view.rerender(<MemoryRouter><MeetingRoomScreen {...props} activePanel="chat" /></MemoryRouter>)
    expect(screen.getByText('No chat yet')).toBeTruthy()
    expect(screen.queryByText('Stale message')).toBeNull()
    expect(screen.getByRole('button', { name: 'Send message' }).hasAttribute('disabled')).toBe(true)
  })
  it('runs the find-the-shape whiteboard activity in preview for teacher and student views', () => {
    show(state({ role: 'tutors' }))
    fireEvent.click(screen.getByRole('button', { name: 'Whiteboard' }))
    const board = within(screen.getByRole('region', { name: 'Whiteboard' }))
    expect(board.getByRole('button', { name: 'Circle mark by Marcus Allen' })).toBeTruthy()

    fireEvent.click(board.getByRole('button', { name: 'Add a shape' }))
    fireEvent.click(board.getByRole('button', { name: 'red color' }))
    fireEvent.click(board.getByRole('button', { name: 'Add red star' }))
    expect(board.getByRole('button', { name: 'red star shape' })).toBeTruthy()
    fireEvent.change(board.getByLabelText('Instruction for students'), { target: { value: 'Encircle the red star' } })
    fireEvent.click(board.getByRole('button', { name: 'Give instruction' }))
    expect(board.getByRole('status', { name: 'Current instruction' }).textContent).toContain('Encircle the red star')

    fireEvent.click(board.getByRole('button', { name: 'Student' }))
    expect(board.queryByRole('button', { name: 'Add a shape' })).toBeNull()
    expect(board.queryByLabelText('Instruction for students')).toBeNull()
    expect(board.queryByRole('button', { name: 'Circle mark by Marcus Allen' })).toBeNull()
    const star = board.getByRole('button', { name: 'red star shape' })
    fireEvent.focus(star)
    fireEvent.keyDown(star, { key: 'Delete' })
    expect(board.getByRole('button', { name: 'red star shape' })).toBeTruthy()
    fireEvent.click(board.getByRole('button', { name: 'Circle selected item' }))
    expect(board.getByRole('button', { name: 'Circle mark by you' })).toBeTruthy()

    fireEvent.click(board.getByRole('button', { name: 'Tutor' }))
    expect(board.getByRole('button', { name: 'Circle mark by Priya Nair' })).toBeTruthy()
    expect(board.getByRole('button', { name: 'Circle mark by Marcus Allen' })).toBeTruthy()
  })
  it('draws a freehand circle mark as the student', () => {
    const { container } = show(state({ role: 'esl' }))
    fireEvent.click(screen.getByRole('button', { name: 'Whiteboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Student' }))
    const surface = screen.getByTestId('board-surface')
    const marks = () => container.querySelectorAll('g[data-item-kind="mark"][data-author="sample-esl-1"]').length
    fireEvent.pointerDown(surface, { button: 0, buttons: 1, pointerId: 1, clientX: 100, clientY: 100 })
    for (const [x, y] of [[140, 80], [180, 110], [160, 150], [110, 140]]) fireEvent.pointerMove(surface, { buttons: 1, pointerId: 1, clientX: x, clientY: y })
    fireEvent.pointerUp(surface, { pointerId: 1 })
    expect(marks()).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Undo my last mark' }))
    expect(marks()).toBe(0)
  })
  it.each(['students', 'educators', 'esl', 'tutors'] as const)('hides the dashboard chrome only while a %s call is open', role => {
    const setImmersive = vi.fn()
    const view = (props: MeetingRoomScreenProps) => <MemoryRouter><DashboardChromeContext.Provider value={setImmersive}><MeetingRoomScreen {...props} /></DashboardChromeContext.Provider></MemoryRouter>
    const { rerender, unmount } = render(view(state({ role, preview: false })))
    expect(setImmersive).not.toHaveBeenCalled()
    rerender(view(state({ role })))
    expect(setImmersive).toHaveBeenLastCalledWith(true)
    unmount()
    expect(setImmersive).toHaveBeenLastCalledWith(false)
  })
  it.each(['esl', 'tutors'] as const)('keeps the %s whiteboard unavailable in a live room', role => {
    show(state({ role, preview: false, hasRoom: true, status: 'connected', localIdentity: 'local', participants: [participant('local', 'Teacher')] }))
    expect(screen.getByRole('button', { name: 'Whiteboard (available in layout preview for now)' }).hasAttribute('disabled')).toBe(true)
    expect(screen.queryByRole('region', { name: 'Whiteboard' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Open participants, 1 connected' })).toBeTruthy()
  })
  it.each(['students', 'educators'] as const)('uses a classroom layout for %s without exposing coaching AI cards', role => {
    const props = state({ role })
    show(props)
    expect(screen.getByRole('region', { name: 'Meeting room' }).getAttribute('data-meeting-design')).toBe('classroom')
    expect(screen.queryByRole('button', { name: 'Whiteboard' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Meeting participants' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    expect(props.onPanel).toHaveBeenCalledWith('chat')
  })
  it.each(['students', 'esl', 'tutors'] as const)('keeps %s device, screen, and hand controls disabled in preview and allows safe exit', role => {
    const props = state({ role })
    show(props)
    for (const name of ['Turn microphone on', 'Turn camera on', 'Share screen', 'Raise hand']) expect(screen.getByRole('button', { name }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Turn microphone on' }))
    expect(props.onMicrophone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Exit preview' }))
    expect(props.onLeave).toHaveBeenCalledOnce()
  })
  it('renders each connected participant once on the stage and enables opt-in controls', () => {
    const props = state({ preview: false, hasRoom: true, status: 'connected', role: 'tutors', activePanel: 'people', localIdentity: 'local', participants: [participant('local', 'Teacher'), participant('remote', 'Learner')] })
    show(props)
    const stage = within(screen.getByRole('region', { name: 'Meeting stage' }))
    expect(stage.getAllByRole('article')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Turn camera on' }))
    expect(props.onCamera).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'End meeting for everyone' })).toBeNull()
    fireEvent.click(within(screen.getByRole('region', { name: 'Meeting participants' })).getByRole('button', { name: 'Pin Learner for your view' }))
    expect(props.onPin).toHaveBeenCalledWith('remote')
  })
  it('renders connected chat only from room state and uses connected identity for names', () => {
    const props = state({ preview: false, hasRoom: true, status: 'connected', activePanel: 'chat', localIdentity: 'local', participants: [participant('remote', 'Learner')], messages: [{ id: 'm1', identity: 'remote', text: 'A question for the group', sentAt: 1000 }], chatDraft: 'My reply' })
    show(props)
    const chat = within(screen.getByRole('region', { name: 'Meeting chat' }))
    expect(chat.getByText('Learner')).toBeTruthy()
    expect(chat.getByText('A question for the group')).toBeTruthy()
    fireEvent.click(chat.getByRole('button', { name: 'Send message' }))
    expect(props.onSendChat).toHaveBeenCalledOnce()
  })
  it('keeps joining unavailable in paused mode without inferring host authority from an educator URL', () => {
    show(state({ role: 'educators', preview: false }))
    expect(screen.getByRole('button', { name: 'Join meeting' }).hasAttribute('disabled')).toBe(true)
    expect(screen.queryByRole('button', { name: 'Create a meeting' })).toBeNull()
    expect(screen.getByLabelText('Invite link or room code')).toBeTruthy()
  })
  it('surfaces reconnecting and operation errors without hiding the stage', () => {
    show(state({ preview: false, hasRoom: true, status: 'reconnecting', error: 'Could not send your message.', isHost: true }))
    expect(screen.getByText('Reconnecting')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain('Could not send')
    expect(screen.getByRole('button', { name: 'Turn microphone on' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'End meeting for everyone' })).toBeTruthy()
  })
})
```

### `meeting-room-screen.tsx`

Current file: `src/components/features/meeting-room/meeting-room-screen.tsx`

```tsx
import type { MeetingRoomScreenProps } from './meeting-room-types'
import { ClassroomMeetingScreen } from './classroom-meeting-screen'
import { CoachingMeetingScreen } from './coaching-meeting-screen'

export function MeetingRoomScreen(props: MeetingRoomScreenProps) {
  const coaching = props.role === 'esl' || props.role === 'tutors'
    || (props.role === 'students' && (props.meetingCategory === 'esl' || props.meetingCategory === 'tutors'))
  return coaching ? <CoachingMeetingScreen {...props} /> : <ClassroomMeetingScreen {...props} />
}
```

### `meeting-room-types.ts`

Current file: `src/components/features/meeting-room/meeting-room-types.ts`

```ts
import type { Participant } from 'livekit-client'
import type { FormEvent, RefObject } from 'react'
import type { getDashboardRole } from '@/components/common/dashboard-navigation'

export type RoomStatus = 'idle' | 'joining' | 'connected' | 'reconnecting' | 'ended'
export type MeetingPanel = 'chat' | 'people' | 'info'
export type MeetingCategory = 'educators' | 'tutors' | 'esl'
export type MeetingMessage = { id: string; identity: string; text: string; sentAt: number }

export type MeetingRoomScreenProps = {
  role: NonNullable<ReturnType<typeof getDashboardRole>>
  backHref: string
  meetingCategory?: MeetingCategory | null
  roomId: string | null
  meetingCode: string
  roomInputRef: RefObject<HTMLInputElement | null>
  status: RoomStatus
  preview: boolean
  hasRoom: boolean
  apiEnabled: boolean
  canCreate: boolean
  isHost: boolean
  busy: boolean
  message: string
  error: string
  participants: Participant[]
  localIdentity?: string
  pinnedIdentity: string | null
  onPin: (identity: string | null) => void
  raisedHands: Record<string, boolean>
  revision: number
  micOn: boolean
  cameraOn: boolean
  screenOn: boolean
  handUpdating: boolean
  activePanel: MeetingPanel | null
  onPanel: (panel: MeetingPanel) => void
  unreadMessages: number
  messages: MeetingMessage[]
  chatDraft: string
  onChatDraft: (value: string) => void
  chatSending: boolean
  onSendChat: (event: FormEvent<HTMLFormElement>) => void
  onJoin: (event: FormEvent<HTMLFormElement>) => void
  onCreate: () => void
  onPreview: () => void
  onCopy: () => void
  onLeave: () => void
  onEnd: () => void
  onMicrophone: () => void
  onCamera: () => void
  onScreen: () => void
  onHand: () => void
}
```

### `meeting-room-view.tsx`

Current file: `src/components/features/meeting-room/meeting-room-view.tsx`

```tsx
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Participant as LiveKitParticipant,
  Room,
  RoomEvent,
} from 'livekit-client'
import { useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import { formatMeetingCode, getMeetingIdFromInvite } from '@/lib/meeting-code'
import { getApiErrorMessage } from '@/services/api/api-error'
import {
  createMeeting,
  endMeeting as endMeetingRequest,
  joinMeeting as joinMeetingRequest,
  type MeetingJoin,
} from '@/services/api/meeting.service'
import EslWhiteboardPreview from '@/components/features/esl-teaching/meeting-room/esl-whiteboard-preview'
import { shouldShowEslWhiteboardPreview } from '@/components/features/esl-teaching/meeting-room/esl-whiteboard-preview-route'
import { MeetingRoomHub } from '@/components/features/meeting-room/meeting-room-hub'

import type { RoomStatus, MeetingPanel, MeetingMessage, MeetingCategory } from './meeting-room-types'

const meetingCategories: MeetingCategory[] = ['educators', 'tutors', 'esl']
import { MeetingRoomScreen } from './meeting-room-screen'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'

type MeetingSignal =
  | { type: 'chat'; id: string; text: string }
  | { type: 'hand'; raised: boolean }

function decodeMeetingSignal(payload: Uint8Array): MeetingSignal | null {
  if (payload.byteLength > 2048) return null

  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(payload))
    if (!value || typeof value !== 'object') return null

    const signal = value as Record<string, unknown>
    if (signal.type === 'chat'
      && typeof signal.id === 'string'
      && signal.id.length <= 100
      && typeof signal.text === 'string'
      && signal.text.trim().length > 0
      && signal.text.length <= 500) {
      return { type: 'chat', id: signal.id, text: signal.text.trim() }
    }
    if (signal.type === 'hand' && typeof signal.raised === 'boolean') {
      return { type: 'hand', raised: signal.raised }
    }
  } catch {
    return null
  }

  return null
}

export default function MeetingRoomPage() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const role = getDashboardRole(pathname) ?? 'students'
  const hasInvite = Boolean(getMeetingIdFromInvite(params.get('room') ?? ''))
  return hasInvite || params.get('join') === '1' || params.get('layout-preview') === '1' || shouldShowEslWhiteboardPreview(role, params.get('whiteboard-preview'))
    ? <MeetingRoomSession />
    : <MeetingRoomHub />
}

function MeetingRoomSession() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const classroomPath = `/${role}/classrooms/meeting-room`
  const { user } = useAuthSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const roomId = getMeetingIdFromInvite(searchParams.get('room') ?? '')
  const meetingCode = roomId ? formatMeetingCode(roomId) : ''
  const meetingCategory = meetingCategories.find(category => category === searchParams.get('category')) ?? null
  const roomParams = (code: string) => ({ ...(meetingCategory ? { category: meetingCategory } : {}), room: code })
  const roomInputRef = useRef<HTMLInputElement>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [joinInfo, setJoinInfo] = useState<MeetingJoin | null>(null)
  const [status, setStatus] = useState<RoomStatus>('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [micOn, setMicOn] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [screenOn, setScreenOn] = useState(false)
  const [raisedHands, setRaisedHands] = useState<Record<string, boolean>>({})
  const [pinnedParticipantIdentity, setPinnedParticipantIdentity] = useState<string | null>(null)
  const [messages, setMessages] = useState<MeetingMessage[]>([])
  const [chatDraft, setChatDraft] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [handUpdating, setHandUpdating] = useState(false)
  const [activePanel, setActivePanel] = useState<MeetingPanel | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const roomRef = useRef<Room | null>(null)
  const activePanelRef = useRef<MeetingPanel | null>(null)
  const seenMessageIdsRef = useRef(new Set<string>())
  const isEducator = user?.roles.includes('EDUCATOR') ?? false

  useEffect(() => {
    activePanelRef.current = activePanel
  }, [activePanel])

  useEffect(() => {
    if (!room) return

    const refresh = () => setRevision((current) => current + 1)
    const participantLeft = (participant: LiveKitParticipant) => {
      refresh()
      setPinnedParticipantIdentity((current) => current === participant.identity ? null : current)
      setRaisedHands((current) => {
        if (!current[participant.identity]) return current
        const next = { ...current }
        delete next[participant.identity]
        return next
      })
    }
    const receiveData = (payload: Uint8Array, participant?: LiveKitParticipant) => {
      if (!participant) return
      const signal = decodeMeetingSignal(payload)
      if (!signal) return

      if (signal.type === 'hand') {
        setRaisedHands((current) => ({ ...current, [participant.identity]: signal.raised }))
        return
      }

      if (seenMessageIdsRef.current.has(signal.id)) return
      seenMessageIdsRef.current.add(signal.id)
      setMessages((current) => [...current, {
        id: signal.id,
        identity: participant.identity,
        text: signal.text,
        sentAt: Date.now(),
      }].slice(-100))
      if (activePanelRef.current !== 'chat') {
        setUnreadMessages((current) => current + 1)
      }
    }
    const reconnecting = () => setStatus('reconnecting')
    const reconnected = () => setStatus('connected')
    const disconnected = () => {
      setStatus('ended')
      setRoom(null)
      setJoinInfo(null)
      setMicOn(false)
      setCameraOn(false)
      setScreenOn(false)
      setRaisedHands({})
      setPinnedParticipantIdentity(null)
      setMessages([])
      setChatDraft('')
      setUnreadMessages(0)
      seenMessageIdsRef.current.clear()
    }

    room
      .on(RoomEvent.ParticipantConnected, refresh)
      .on(RoomEvent.ParticipantDisconnected, participantLeft)
      .on(RoomEvent.TrackSubscribed, refresh)
      .on(RoomEvent.TrackUnsubscribed, refresh)
      .on(RoomEvent.TrackMuted, refresh)
      .on(RoomEvent.TrackUnmuted, refresh)
      .on(RoomEvent.DataReceived, receiveData)
      .on(RoomEvent.Reconnecting, reconnecting)
      .on(RoomEvent.Reconnected, reconnected)
      .on(RoomEvent.Disconnected, disconnected)

    return () => {
      room
        .off(RoomEvent.ParticipantConnected, refresh)
        .off(RoomEvent.ParticipantDisconnected, participantLeft)
        .off(RoomEvent.TrackSubscribed, refresh)
        .off(RoomEvent.TrackUnsubscribed, refresh)
        .off(RoomEvent.TrackMuted, refresh)
        .off(RoomEvent.TrackUnmuted, refresh)
        .off(RoomEvent.DataReceived, receiveData)
        .off(RoomEvent.Reconnecting, reconnecting)
        .off(RoomEvent.Reconnected, reconnected)
        .off(RoomEvent.Disconnected, disconnected)
    }
  }, [room])

  useEffect(() => () => {
    void roomRef.current?.disconnect(true)
  }, [])

  const participants = room
    ? [room.localParticipant, ...room.remoteParticipants.values()]
    : []
  const createRoom = async () => {
    if (!API_INTEGRATION_ENABLED) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await createMeeting()
      setSearchParams(roomParams(formatMeetingCode(result.meetingId)))
      setMessage('Meeting created. Copy the invite and share it with your class.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not create the meeting.'))
    } finally {
      setBusy(false)
    }
  }

  const joinRoom = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!API_INTEGRATION_ENABLED) return
    const normalizedRoomId = getMeetingIdFromInvite(roomInputRef.current?.value ?? '')
    if (!normalizedRoomId) {
      setError('Enter a meeting invite link or room code first.')
      return
    }

    setBusy(true)
    setError('')
    setMessage('')
    setStatus('joining')
    setMessages([])
    setChatDraft('')
    setRaisedHands({})
    setPinnedParticipantIdentity(null)
    setUnreadMessages(0)
    setActivePanel(null)
    seenMessageIdsRef.current.clear()
    setSearchParams(roomParams(formatMeetingCode(normalizedRoomId)))

    const nextRoom = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = nextRoom
    try {
      const credentials = await joinMeetingRequest(normalizedRoomId)
      await nextRoom.connect(credentials.serverUrl, credentials.token, { autoSubscribe: true })
      setJoinInfo(credentials)
      setRoom(nextRoom)
      setStatus('connected')
    } catch (requestError) {
      await nextRoom.disconnect(true).catch(() => undefined)
      roomRef.current = null
      setStatus('idle')
      const detail = requestError instanceof Error ? requestError.message.toLowerCase() : ''
      setError(
        detail.includes('signal connection') || detail.includes('failed to fetch')
          ? 'Could not reach the meeting service. Check your connection and try again.'
          : getApiErrorMessage(requestError, 'Could not join this meeting. Check the invite and try again.'),
      )
    } finally {
      setBusy(false)
    }
  }

  const leaveRoom = async () => {
    const currentRoom = roomRef.current
    roomRef.current = null
    setRoom(null)
    setJoinInfo(null)
    setStatus('idle')
    setMicOn(false)
    setCameraOn(false)
    setScreenOn(false)
    setRaisedHands({})
    setPinnedParticipantIdentity(null)
    setMessages([])
    setChatDraft('')
    setUnreadMessages(0)
    seenMessageIdsRef.current.clear()
    if (currentRoom) await currentRoom.disconnect(true)
  }

  const endRoom = async () => {
    if (!roomId) return
    setBusy(true)
    setError('')
    try {
      await endMeetingRequest(roomId)
      await leaveRoom()
      setStatus('ended')
      setMessage('The meeting has ended.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not end the meeting.'))
    } finally {
      setBusy(false)
    }
  }

  const toggleMicrophone = async () => {
    if (!room) return
    setError('')
    try {
      await room.localParticipant.setMicrophoneEnabled(!micOn)
      setMicOn(!micOn)
    } catch {
      setError('Microphone access was unavailable. Check your browser permission and try again.')
    }
  }

  const toggleCamera = async () => {
    if (!room) return
    setError('')
    try {
      await room.localParticipant.setCameraEnabled(!cameraOn)
      setCameraOn(!cameraOn)
    } catch {
      setError('Camera access was unavailable. Check your browser permission and try again.')
    }
  }

  const toggleScreenShare = async () => {
    if (!room) return
    setError('')
    try {
      await room.localParticipant.setScreenShareEnabled(!screenOn)
      setScreenOn(!screenOn)
    } catch {
      setError('Screen sharing was unavailable or cancelled.')
    }
  }

  const publishSignal = async (signal: MeetingSignal) => {
    if (!room) return
    await room.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(signal)),
      { reliable: true, topic: 'owlio-meeting' },
    )
  }

  const toggleRaisedHand = async () => {
    if (!room || handUpdating) return
    const raised = !raisedHands[room.localParticipant.identity]
    setError('')
    setHandUpdating(true)
    try {
      await publishSignal({ type: 'hand', raised })
      setRaisedHands((current) => ({ ...current, [room.localParticipant.identity]: raised }))
    } catch {
      setError('Could not update your raised hand. The meeting service may not allow room messages.')
    } finally {
      setHandUpdating(false)
    }
  }

  const sendChatMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!room || chatSending) return
    const text = chatDraft.trim()
    if (!text) return
    if (text.length > 500) {
      setError('Messages must be 500 characters or fewer.')
      return
    }

    const messageId = crypto.randomUUID()
    setError('')
    setChatSending(true)
    try {
      await publishSignal({ type: 'chat', id: messageId, text })
      seenMessageIdsRef.current.add(messageId)
      setMessages((current) => [...current, {
        id: messageId,
        identity: room.localParticipant.identity,
        text,
        sentAt: Date.now(),
      }].slice(-100))
      setChatDraft('')
    } catch {
      setError('Could not send your message. The meeting service may not allow room messages.')
    } finally {
      setChatSending(false)
    }
  }

  const openPanel = (panel: MeetingPanel) => {
    setActivePanel((current) => {
      const next = current === panel ? null : panel
      activePanelRef.current = next
      if (next === 'chat') setUnreadMessages(0)
      return next
    })
  }

  const copyInvite = async () => {
    if (!roomId) return
    const invite = new URL(window.location.href)
    invite.searchParams.set('room', formatMeetingCode(roomId))
    invite.searchParams.delete('layout-preview')
    invite.searchParams.delete('whiteboard-preview')
    try {
      await navigator.clipboard.writeText(invite.toString())
      setMessage('Meeting invite copied.')
    } catch {
      setMessage(`Share this Owlio meeting code: ${formatMeetingCode(roomId)}`)
    }
  }

  const preview = !room && searchParams.get('layout-preview') === '1'
  const isHost = Boolean(user && joinInfo?.hostId === user.id)

  if (shouldShowEslWhiteboardPreview(role, searchParams.get('whiteboard-preview'))) {
    return <EslWhiteboardPreview />
  }

  return <MeetingRoomScreen
    key={`${role}-${meetingCategory ?? 'none'}`}
    role={role} meetingCategory={meetingCategory} backHref={classroomPath} roomId={roomId} meetingCode={meetingCode}
    roomInputRef={roomInputRef} status={status} preview={preview} hasRoom={Boolean(room)}
    apiEnabled={API_INTEGRATION_ENABLED} canCreate={isEducator} isHost={isHost} busy={busy}
    message={message} error={error} participants={participants} localIdentity={room?.localParticipant.identity}
    pinnedIdentity={pinnedParticipantIdentity} onPin={setPinnedParticipantIdentity} raisedHands={raisedHands}
    revision={revision} micOn={micOn} cameraOn={cameraOn} screenOn={screenOn} handUpdating={handUpdating}
    activePanel={activePanel} onPanel={openPanel} unreadMessages={unreadMessages} messages={messages}
    chatDraft={chatDraft} onChatDraft={setChatDraft} chatSending={chatSending}
    onSendChat={event => void sendChatMessage(event)} onJoin={event => void joinRoom(event)}
    onCreate={() => void createRoom()} onCopy={() => void copyInvite()}
    onPreview={() => { const next = new URLSearchParams(searchParams); next.set('layout-preview', '1'); setSearchParams(next) }}
    onLeave={() => {
      if (preview) { const next = new URLSearchParams(searchParams); next.delete('layout-preview'); setSearchParams(next) }
      else void leaveRoom()
    }}
    onEnd={() => void endRoom()} onMicrophone={() => void toggleMicrophone()}
    onCamera={() => void toggleCamera()} onScreen={() => void toggleScreenShare()} onHand={() => void toggleRaisedHand()}
  />
}
```

### `meeting-whiteboard-model.ts`

Current file: `src/components/features/meeting-room/meeting-whiteboard-model.ts`

```ts
export const BOARD_WIDTH = 960
export const BOARD_HEIGHT = 540
export const ITEM_SIZE = 100

export type BoardShape = 'circle' | 'square' | 'rectangle' | 'triangle' | 'diamond' | 'star'
export type BoardPoint = [number, number]
type Base = { id: string; authorId: string }
export type BoardShapeItem = Base & { kind: 'shape'; shape: BoardShape; color: string; colorName: string; x: number; y: number }
export type BoardObjectItem = Base & { kind: 'object'; glyph: string; src?: string; label: string; x: number; y: number }
export type BoardMarkItem = Base & { kind: 'mark'; points: BoardPoint[]; color: string }
export type BoardItem = BoardShapeItem | BoardObjectItem | BoardMarkItem
export type BoardState = { items: BoardItem[]; instruction: string | null }
export type BoardBounds = { x: number; y: number; w: number; h: number }

export const boardShapes: { shape: BoardShape; label: string }[] = [
  { shape: 'circle', label: 'Circle' },
  { shape: 'square', label: 'Square' },
  { shape: 'rectangle', label: 'Rectangle' },
  { shape: 'triangle', label: 'Triangle' },
  { shape: 'diamond', label: 'Diamond' },
  { shape: 'star', label: 'Star' },
]

export const boardColors = [
  { value: '#ef4444', name: 'red' },
  { value: '#3b82f6', name: 'blue' },
  { value: '#22c55e', name: 'green' },
  { value: '#f59e0b', name: 'yellow' },
  { value: '#8b5cf6', name: 'purple' },
  { value: '#ec4899', name: 'pink' },
]

export const boardObjects: { glyph: string; label: string; src?: string }[] = [
  { glyph: '🍎', label: 'apple' },
  { glyph: '🐶', label: 'dog' },
  { glyph: '🐱', label: 'cat' },
  { glyph: '⚽', label: 'ball' },
  { glyph: '🏠', label: 'house' },
  { glyph: '🚌', label: 'bus' },
  { glyph: '📚', label: 'books' },
  { glyph: '☀️', label: 'sun' },
  { glyph: '🕐', label: 'clock' },
  { glyph: '🎂', label: 'cake' },
  { glyph: '✏️', label: 'pencil' },
  { glyph: '🦉', label: 'owl', src: '/mascot/owlio-owl.png' },
]

let counter = 0
export function boardId() {
  counter += 1
  return `board-${Date.now().toString(36)}-${counter}`
}

export function itemName(item: BoardItem) {
  if (item.kind === 'shape') return `${item.colorName} ${item.shape}`
  if (item.kind === 'object') return item.label
  return 'circle mark'
}

export function itemBounds(item: BoardItem): BoardBounds {
  if (item.kind !== 'mark') return { x: item.x, y: item.y, w: ITEM_SIZE, h: ITEM_SIZE }
  const xs = item.points.map(([x]) => x)
  const ys = item.points.map(([, y]) => y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

export function clampToBoard(x: number, y: number): BoardPoint {
  return [Math.min(Math.max(x, 0), BOARD_WIDTH - ITEM_SIZE), Math.min(Math.max(y, 0), BOARD_HEIGHT - ITEM_SIZE)]
}

export function moveBoardItem(item: BoardItem, dx: number, dy: number): BoardItem {
  if (item.kind === 'mark') return { ...item, points: item.points.map(([x, y]) => [x + dx, y + dy] as BoardPoint) }
  const [x, y] = clampToBoard(item.x + dx, item.y + dy)
  return { ...item, x, y }
}

export function pathFor(points: BoardPoint[]) {
  const [first, ...rest] = points
  if (!first) return ''
  if (!rest.length) return `M ${first[0]} ${first[1]} l 0.01 0`
  return `M ${first[0]} ${first[1]} ${rest.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')}`
}

export function shapePoints(shape: 'triangle' | 'diamond' | 'star', x: number, y: number) {
  if (shape === 'triangle') return `${x + 50},${y + 6} ${x + 96},${y + 92} ${x + 4},${y + 92}`
  if (shape === 'diamond') return `${x + 50},${y + 2} ${x + 96},${y + 50} ${x + 50},${y + 98} ${x + 4},${y + 50}`
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? 48 : 20
    const angle = (Math.PI / 5) * index - Math.PI / 2
    return `${(x + 50 + radius * Math.cos(angle)).toFixed(1)},${(y + 53 + radius * Math.sin(angle)).toFixed(1)}`
  }).join(' ')
}

export function circleAround(bounds: BoardBounds, pad = 18): BoardPoint[] {
  const cx = bounds.x + bounds.w / 2
  const cy = bounds.y + bounds.h / 2
  const rx = bounds.w / 2 + pad
  const ry = bounds.h / 2 + pad
  return Array.from({ length: 41 }, (_, index) => {
    const angle = (Math.PI * 2.1 * index) / 40 - Math.PI / 2
    const wobble = 1 + Math.sin(index * 1.7) * 0.03
    return [cx + rx * wobble * Math.cos(angle), cy + ry * wobble * Math.sin(angle)] as BoardPoint
  })
}

function shape(id: string, authorId: string, kind: BoardShape, colorIndex: number, x: number, y: number): BoardShapeItem {
  const color = boardColors[colorIndex]
  return { id, authorId, kind: 'shape', shape: kind, color: color.value, colorName: color.name, x, y }
}

function object(id: string, authorId: string, label: string, x: number, y: number): BoardObjectItem {
  const found = boardObjects.find(item => item.label === label) ?? boardObjects[0]
  return { id, authorId, kind: 'object', glyph: found.glyph, src: found.src, label: found.label, x, y }
}

export function createBoardSeed(kind: 'esl' | 'tutors', hostId: string, sampleLearnerId: string): BoardState {
  const items: BoardItem[] = kind === 'esl'
    ? [object('seed-apple', hostId, 'apple', 150, 220), object('seed-dog', hostId, 'dog', 340, 220), shape('seed-square', hostId, 'square', 1, 530, 220), object('seed-ball', hostId, 'ball', 720, 220)]
    : [shape('seed-circle', hostId, 'circle', 0, 150, 220), shape('seed-triangle', hostId, 'triangle', 3, 340, 220), shape('seed-square', hostId, 'square', 1, 530, 220), shape('seed-diamond', hostId, 'diamond', 4, 720, 220)]
  return {
    items: [...items, { id: 'seed-learner-mark', authorId: sampleLearnerId, kind: 'mark', color: '#16a34a', points: circleAround(itemBounds(items[2]), 16) }],
    instruction: kind === 'esl' ? 'Encircle the blue square' : 'Encircle the square',
  }
}
```

### `meeting-whiteboard.tsx`

Current file: `src/components/features/meeting-room/meeting-whiteboard.tsx`

```tsx
import { useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { CircleDashed, Eraser, Megaphone, MousePointer2, Pencil, Shapes, Smile, Trash2, Undo2, X } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  ITEM_SIZE,
  boardColors,
  boardId,
  boardObjects,
  boardShapes,
  circleAround,
  clampToBoard,
  itemBounds,
  itemName,
  moveBoardItem,
  pathFor,
  shapePoints,
  type BoardItem,
  type BoardMarkItem,
  type BoardPoint,
  type BoardShape,
  type BoardState,
} from './meeting-whiteboard-model'

type ViewAs = 'teacher' | 'student'
type Tool = 'select' | 'pen' | 'eraser'
type Library = 'shapes' | 'objects'
type BoardPerson = { id: string; name: string }

const TEACHER_INK = '#e11d48'
const STUDENT_INK = '#2563eb'

export function MeetingWhiteboard({ board, onChange, host, hostLabel, learner, names, learnerOnly = false, onClose }: {
  board: BoardState
  onChange: (next: BoardState) => void
  host: BoardPerson
  hostLabel: string
  learner: BoardPerson
  names: Record<string, string>
  learnerOnly?: boolean
  onClose: () => void
}) {
  const [viewAs, setViewAs] = useState<ViewAs>(learnerOnly ? 'student' : 'teacher')
  const [tool, setTool] = useState<Tool>(learnerOnly ? 'pen' : 'select')
  const [library, setLibrary] = useState<Library | null>(null)
  const [color, setColor] = useState(boardColors[1])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<BoardMarkItem | null>(null)
  const [past, setPast] = useState<BoardState[]>([])
  const [instructionDraft, setInstructionDraft] = useState(board.instruction ?? '')
  const [status, setStatus] = useState('Practice board · not a grade or attendance · stays in this browser tab.')
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; point: BoardPoint; recorded: boolean } | null>(null)

  const teacher = viewAs === 'teacher'
  const me = teacher ? host : learner
  const ink = teacher ? TEACHER_INK : STUDENT_INK
  const visible = board.items.filter(item => teacher || item.kind !== 'mark' || item.authorId === learner.id || item.authorId === host.id)
  const selected = visible.find(item => item.id === selectedId)
  const targets = board.items.filter(item => item.kind !== 'mark')
  const learnerMarks = board.items.filter(item => item.kind === 'mark' && item.authorId !== host.id)
  const suggestions = [...new Set(targets.map(item => `Encircle the ${itemName(item)}`))]
  const canChange = (item: BoardItem) => teacher || (item.kind === 'mark' && item.authorId === learner.id)
  const nameOf = (id: string) => names[id] ?? 'Participant'

  const commit = (next: BoardState, message?: string) => {
    if (teacher) setPast(history => [...history.slice(-29), board])
    onChange(next)
    if (message) setStatus(message)
  }
  const setItems = (items: BoardItem[], message?: string) => commit({ ...board, items }, message)

  const switchView = (next: ViewAs) => {
    setViewAs(next)
    setSelectedId(null)
    setLibrary(null)
    setTool(next === 'teacher' ? 'select' : 'pen')
    setStatus(next === 'teacher' ? `${hostLabel} view: add shapes or objects, then give an instruction.` : `Student view as ${learner.name}: draw a circle around your answer.`)
  }

  const toBoard = (event: { clientX: number; clientY: number }): BoardPoint => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return [0, 0]
    const scale = Math.min(rect.width / BOARD_WIDTH, rect.height / BOARD_HEIGHT) || 1
    const offsetX = (rect.width - BOARD_WIDTH * scale) / 2
    const offsetY = (rect.height - BOARD_HEIGHT * scale) / 2
    return [(event.clientX - rect.left - offsetX) / scale, (event.clientY - rect.top - offsetY) / scale]
  }

  const erase = (item: BoardItem) => {
    if (!canChange(item)) { setStatus('You can only erase your own marks.'); return }
    setItems(board.items.filter(entry => entry.id !== item.id), `${item.kind === 'mark' ? 'Mark' : itemName(item)} removed.`)
    if (selectedId === item.id) setSelectedId(null)
  }

  const addItem = (build: (x: number, y: number) => BoardItem, message: string) => {
    const count = targets.length
    const [x, y] = clampToBoard(120 + (count % 6) * 120, 90 + (Math.floor(count / 6) % 3) * 130)
    const item = build(x, y)
    setItems([...board.items, item], message)
    setSelectedId(item.id)
    setTool('select')
    setLibrary(null)
  }

  const circleSelected = () => {
    if (!selected || selected.kind === 'mark') return
    const mark: BoardMarkItem = { id: boardId(), authorId: me.id, kind: 'mark', color: ink, points: circleAround(itemBounds(selected)) }
    setItems([...board.items, mark], `You circled the ${itemName(selected)}.`)
  }

  const undo = () => {
    if (teacher) {
      const previous = past[past.length - 1]
      if (!previous) return
      setPast(past.slice(0, -1))
      onChange(previous)
      setStatus('Undid the last change.')
      return
    }
    const last = [...board.items].reverse().find(item => item.kind === 'mark' && item.authorId === learner.id)
    if (last) setItems(board.items.filter(item => item.id !== last.id), 'Removed your last mark.')
  }

  const sendInstruction = (event?: FormEvent, text = instructionDraft) => {
    event?.preventDefault()
    const instruction = text.trim()
    if (!instruction) return
    setInstructionDraft(instruction)
    commit({ ...board, instruction }, `Instruction shown to students: “${instruction}”.`)
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return
    if (tool === 'pen') {
      event.currentTarget.setPointerCapture?.(event.pointerId)
      setSelectedId(null)
      setDraft({ id: boardId(), authorId: me.id, kind: 'mark', color: ink, points: [toBoard(event)] })
    } else if (tool === 'select') setSelectedId(null)
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (draft) {
      const point = toBoard(event)
      const last = draft.points[draft.points.length - 1]
      if (Math.hypot(point[0] - last[0], point[1] - last[1]) >= 2) setDraft({ ...draft, points: [...draft.points, point] })
      return
    }
    const drag = dragRef.current
    if (!drag) return
    const point = toBoard(event)
    const dx = point[0] - drag.point[0]
    const dy = point[1] - drag.point[1]
    if (!dx && !dy) return
    if (!drag.recorded) setPast(history => [...history.slice(-29), board])
    dragRef.current = { ...drag, point, recorded: true }
    onChange({ ...board, items: board.items.map(item => item.id === drag.id ? moveBoardItem(item, dx, dy) : item) })
  }

  const handlePointerEnd = () => {
    if (draft) {
      if (draft.points.length > 2) setItems([...board.items, draft], teacher ? 'Annotation added.' : 'Your mark was added. Your teacher can see it.')
      setDraft(null)
    }
    dragRef.current = null
  }

  const handleItemPointerDown = (event: ReactPointerEvent, item: BoardItem) => {
    if (tool === 'eraser') { event.stopPropagation(); erase(item); return }
    if (tool !== 'select') return
    event.stopPropagation()
    setSelectedId(item.id)
    if (!teacher || item.kind === 'mark') return
    svgRef.current?.setPointerCapture?.(event.pointerId)
    dragRef.current = { id: item.id, point: toBoard(event), recorded: false }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selected) return
    if (event.key === 'Escape') { setSelectedId(null); return }
    if (!teacher && event.key === 'Enter' && selected.kind !== 'mark') { event.preventDefault(); circleSelected(); return }
    if (!canChange(selected)) return
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); erase(selected) }
    else if (teacher && event.key.startsWith('Arrow')) {
      event.preventDefault()
      const step = event.shiftKey ? 40 : 10
      const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0
      const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0
      setItems(board.items.map(item => item.id === selected.id ? moveBoardItem(item, dx, dy) : item))
    }
  }

  const tools: { id: Tool; label: string; icon: ReactNode }[] = [
    { id: 'select', label: teacher ? 'Select and move' : 'Select an item', icon: <MousePointer2 aria-hidden="true" /> },
    { id: 'pen', label: teacher ? 'Pen' : 'Draw a circle', icon: <Pencil aria-hidden="true" /> },
    { id: 'eraser', label: teacher ? 'Eraser' : 'Erase my marks', icon: <Eraser aria-hidden="true" /> },
  ]

  return <section aria-label="Whiteboard" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-xs">
    <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 px-3 py-2.5 sm:px-4">
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-soft-foreground"><Shapes className="size-4" /></span>
      <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">Whiteboard · Find the shape</h3><p className="truncate text-[11px] text-muted-foreground">Preview only · practice, not a grade · not shared or saved</p></div>
      {learnerOnly ? <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand-soft-foreground">Student view</span>
        : <div role="group" aria-label="View board as" className="inline-flex rounded-full bg-muted p-0.5">
          {(['teacher', 'student'] as const).map(option => <button key={option} type="button" aria-pressed={viewAs === option} onClick={() => switchView(option)} className={cn('min-h-8 rounded-full px-3 text-xs font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none', viewAs === option ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}>{option === 'teacher' ? hostLabel : 'Student'}</button>)}
        </div>}
      <Button variant="ghost" size="icon-sm" aria-label="Close whiteboard" title="Close whiteboard" onClick={onClose}><X aria-hidden="true" /></Button>
    </header>

    {teacher && <form onSubmit={sendInstruction} className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/70 px-3 py-2 sm:px-4">
      <label htmlFor="board-instruction" className="sr-only">Instruction for students</label>
      <Input id="board-instruction" value={instructionDraft} maxLength={80} onChange={event => setInstructionDraft(event.target.value)} placeholder="e.g. Encircle the square" className="h-9 min-w-40 flex-1 text-sm" />
      <Button type="submit" size="sm" className="h-9 bg-brand text-brand-foreground hover:bg-brand/90" disabled={!instructionDraft.trim()}><Megaphone aria-hidden="true" />Give instruction</Button>
      <div className="flex w-full gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Suggested instructions">
        {suggestions.map(text => <button key={text} type="button" onClick={() => sendInstruction(undefined, text)} className="shrink-0 rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-brand/50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">{text}</button>)}
      </div>
    </form>}

    <div data-theme-content className="relative min-h-64 flex-1 bg-white text-slate-900 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:22px_22px]" onKeyDown={handleKeyDown}>
      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
        <div role="status" aria-label="Current instruction" className="flex max-w-full items-center gap-2 rounded-full bg-slate-900/90 py-1.5 pr-4 pl-1.5 text-white shadow-lg">
          <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15"><Megaphone className="size-3.5" /></span>
          <span className="min-w-0 truncate text-sm font-semibold">{board.instruction ?? (teacher ? 'No instruction yet' : `Waiting for ${host.name}`)}</span>
          {board.instruction && !teacher && <span className="hidden shrink-0 text-[11px] text-white/70 sm:inline">· Draw a circle around your answer</span>}
        </div>
      </div>

      <svg ref={svgRef} data-testid="board-surface" viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} preserveAspectRatio="xMidYMid meet" aria-label="Board items"
        className={cn('absolute inset-0 size-full touch-none select-none', tool === 'pen' ? 'cursor-crosshair' : tool === 'eraser' ? 'cursor-cell' : 'cursor-default')}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}>
        {visible.map(item => {
          const author = nameOf(item.authorId)
          const common = {
            'data-item-id': item.id,
            'data-item-kind': item.kind,
            'data-author': item.authorId,
            role: 'button' as const,
            tabIndex: 0,
            'aria-pressed': selectedId === item.id,
            'aria-label': item.kind === 'mark' ? `Circle mark by ${item.authorId === me.id ? 'you' : author}` : `${itemName(item)}${item.kind === 'shape' ? ' shape' : ''}`,
            onPointerDown: (event: ReactPointerEvent) => handleItemPointerDown(event, item),
            onPointerEnter: (event: ReactPointerEvent) => { if (tool === 'eraser' && event.buttons === 1) erase(item) },
            onFocus: () => setSelectedId(item.id),
            className: cn('outline-none', tool === 'select' && teacher && item.kind !== 'mark' && 'cursor-move'),
          }
          if (item.kind === 'mark') {
            const bounds = itemBounds(item)
            return <g key={item.id} {...common}>
              <path d={pathFor(item.points)} fill="none" stroke="transparent" strokeWidth={18} strokeLinecap="round" />
              <path d={pathFor(item.points)} fill="none" stroke={item.color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              {teacher && item.authorId !== host.id && <text x={bounds.x} y={bounds.y - 8} fontSize={14} fontWeight={600} fill="#0f172a" stroke="#ffffff" strokeWidth={4} paintOrder="stroke" pointerEvents="none">{author}</text>}
            </g>
          }
          if (item.kind === 'object') {
            return <g key={item.id} {...common}>
              <rect x={item.x} y={item.y} width={ITEM_SIZE} height={ITEM_SIZE} fill="transparent" />
              {item.src ? <image href={item.src} x={item.x + 6} y={item.y + 6} width={ITEM_SIZE - 12} height={ITEM_SIZE - 12} preserveAspectRatio="xMidYMid meet" />
                : <text x={item.x + ITEM_SIZE / 2} y={item.y + ITEM_SIZE / 2} fontSize={72} textAnchor="middle" dominantBaseline="central">{item.glyph}</text>}
            </g>
          }
          return <g key={item.id} {...common}><ShapeGlyph shape={item.shape} x={item.x} y={item.y} fill={item.color} /></g>
        })}
        {draft && <path d={pathFor(draft.points)} fill="none" stroke={draft.color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />}
        {selected && (() => {
          const bounds = itemBounds(selected)
          return <rect x={bounds.x - 8} y={bounds.y - 8} width={bounds.w + 16} height={bounds.h + 16} rx={10} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 5" pointerEvents="none" />
        })()}
      </svg>

      {library && teacher && <div role="dialog" aria-label={library === 'shapes' ? 'Add a shape' : 'Add an object'} className="absolute bottom-20 left-1/2 z-20 w-[min(22rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
        {library === 'shapes' ? <>
          <p className="mb-2 text-[11px] font-semibold text-slate-500">Color</p>
          <div className="mb-3 flex gap-1.5">{boardColors.map(option => <button key={option.value} type="button" aria-label={`${option.name} color`} aria-pressed={color.value === option.value} onClick={() => setColor(option)} className={cn('size-7 rounded-full focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:outline-none', color.value === option.value && 'ring-2 ring-slate-900 ring-offset-2')}><svg aria-hidden="true" viewBox="0 0 28 28" className="size-7"><circle cx={14} cy={14} r={14} fill={option.value} /></svg></button>)}</div>
          <div className="grid grid-cols-3 gap-2">{boardShapes.map(({ shape, label }) => <button key={shape} type="button" aria-label={`Add ${color.name} ${label.toLowerCase()}`} onClick={() => addItem((x, y) => ({ id: boardId(), authorId: host.id, kind: 'shape', shape, color: color.value, colorName: color.name, x, y }), `Added a ${color.name} ${label.toLowerCase()}.`)} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 p-2 text-[11px] text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
            <svg aria-hidden="true" viewBox="0 0 100 100" className="size-10"><ShapeGlyph shape={shape} x={0} y={0} fill={color.value} /></svg>{label}
          </button>)}</div>
        </> : <div className="grid grid-cols-4 gap-2">{boardObjects.map(entry => <button key={entry.label} type="button" aria-label={`Add ${entry.label}`} onClick={() => addItem((x, y) => ({ id: boardId(), authorId: host.id, kind: 'object', glyph: entry.glyph, src: entry.src, label: entry.label, x, y }), `Added ${entry.label}.`)} className="flex flex-col items-center gap-0.5 rounded-xl border border-slate-200 p-1.5 text-[10px] text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
          {entry.src ? <img src={entry.src} alt="" className="size-8 object-contain" /> : <span aria-hidden="true" className="text-2xl leading-8">{entry.glyph}</span>}{entry.label}
        </button>)}</div>}
      </div>}

      <div role="toolbar" aria-label="Whiteboard tools" className="absolute bottom-3 left-1/2 z-10 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
        {tools.map(entry => <BoardTool key={entry.id} label={entry.label} active={tool === entry.id} onClick={() => { setTool(entry.id); setLibrary(null) }}>{entry.icon}</BoardTool>)}
        <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-slate-200" />
        {teacher ? <>
          <BoardTool label="Add a shape" active={library === 'shapes'} onClick={() => setLibrary(library === 'shapes' ? null : 'shapes')}><Shapes aria-hidden="true" /></BoardTool>
          <BoardTool label="Add an object" active={library === 'objects'} onClick={() => setLibrary(library === 'objects' ? null : 'objects')}><Smile aria-hidden="true" /></BoardTool>
          <BoardTool label="Delete selected" disabled={!selected} onClick={() => selected && erase(selected)}><Trash2 aria-hidden="true" /></BoardTool>
          <BoardTool label="Clear student marks" disabled={!learnerMarks.length} onClick={() => setItems(board.items.filter(item => item.kind !== 'mark' || item.authorId === host.id), 'Student marks cleared. Use Undo to bring them back.')}><CircleDashed aria-hidden="true" /></BoardTool>
        </> : <BoardTool label="Circle selected item" disabled={!selected || selected.kind === 'mark'} onClick={circleSelected}><CircleDashed aria-hidden="true" /></BoardTool>}
        <BoardTool label={teacher ? 'Undo' : 'Undo my last mark'} disabled={teacher ? !past.length : !board.items.some(item => item.kind === 'mark' && item.authorId === learner.id)} onClick={undo}><Undo2 aria-hidden="true" /></BoardTool>
      </div>

      <p aria-live="polite" className="pointer-events-none absolute bottom-16 left-3 z-10 hidden max-w-64 rounded-lg bg-slate-900/80 px-2.5 py-1.5 text-[11px] leading-4 text-white sm:block">{status}</p>
    </div>
  </section>
}

function ShapeGlyph({ shape, x, y, fill }: { shape: BoardShape; x: number; y: number; fill: string }) {
  if (shape === 'circle') return <circle cx={x + 50} cy={y + 50} r={46} fill={fill} />
  if (shape === 'square') return <rect x={x + 5} y={y + 5} width={90} height={90} rx={8} fill={fill} />
  if (shape === 'rectangle') return <rect x={x + 2} y={y + 22} width={96} height={56} rx={8} fill={fill} />
  return <polygon points={shapePoints(shape, x, y)} fill={fill} strokeLinejoin="round" />
}

function BoardTool({ label, active = false, disabled = false, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} title={label} aria-pressed={active} disabled={disabled} onClick={onClick}
    className={cn('grid size-10 shrink-0 place-items-center rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-[18px]', active ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100')}>{children}</button>
}
```

### `participant-tile.tsx`

Current file: `src/components/features/meeting-room/participant-tile.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import { Hand, Mic, MicOff, Pin } from 'lucide-react'
import { Participant, ParticipantEvent, type Track as LiveKitTrack } from 'livekit-client'
import { useParticipantVideo } from './use-participant-video'

export function ParticipantTile({ participant, local, raised, pinned, onPinToggle, updateKey, classroom = false }: {
  participant: Participant
  local: boolean
  raised: boolean
  pinned: boolean
  onPinToggle: () => void
  updateKey: number
  classroom?: boolean
}) {
  const [speaking, setSpeaking] = useState(participant.isSpeaking)
  useEffect(() => {
    if (!classroom) return
    const update = (value: boolean) => setSpeaking(value)
    participant.on(ParticipantEvent.IsSpeakingChanged, update)
    return () => { participant.off(ParticipantEvent.IsSpeakingChanged, update) }
  }, [participant, classroom])
  const { videoRef, videoTrack, screenTrack } = useParticipantVideo(participant, updateKey)
  return <article className={`meeting-tile ${pinned ? 'meeting-tile-pinned' : ''}`} data-speaking={classroom && speaking || undefined} aria-label={`${participant.name || 'Participant'}${local ? ', you' : ''}${classroom && speaking ? ', speaking' : ''}`}>
    {videoTrack ? <video ref={videoRef} autoPlay playsInline muted={local} aria-label={`${participant.name || 'Participant'} video`} className={`absolute inset-0 size-full ${screenTrack ? 'object-contain' : 'object-cover'}`} />
      : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><span className="meeting-avatar text-2xl">{(participant.name || 'O').slice(0, 1).toUpperCase()}</span><span className="text-xs opacity-65">{participant.isCameraEnabled ? 'Camera starting…' : 'Camera off'}</span></div>}
    {[...participant.audioTrackPublications.values()].map(publication => publication.track && !local ? <AudioTrack key={publication.trackSid} track={publication.track} /> : null)}
    {raised && <span className="meeting-hand"><Hand aria-hidden="true" className="size-3" />Hand raised</span>}
    <button type="button" onClick={onPinToggle} aria-label={`${pinned ? 'Unpin' : 'Pin'} ${participant.name || 'participant'} ${pinned ? 'from' : 'for'} your view`} aria-pressed={pinned} className="meeting-tile-pin"><Pin aria-hidden="true" className="size-3.5" /></button>
    <div className="meeting-tile-caption"><span className="truncate">{participant.name || 'Participant'}{local ? ' · You' : ''}{screenTrack ? ' · Presenting' : ''}</span><span aria-label={participant.isMicrophoneEnabled ? 'Microphone on' : 'Microphone off'}>{participant.isMicrophoneEnabled ? <Mic aria-hidden="true" className="size-3.5" /> : <MicOff aria-hidden="true" className="size-3.5" />}</span></div>
  </article>
}

export function AudioTrack({ track }: { track: LiveKitTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    track.attach(audio)
    return () => { track.detach(audio) }
  }, [track])
  return <audio ref={audioRef} autoPlay />
}
```

### `use-participant-video.ts`

Current file: `src/components/features/meeting-room/use-participant-video.ts`

```ts
import { useEffect, useRef } from 'react'
import { Track, type Participant } from 'livekit-client'

export function useParticipantVideo(participant: Participant | undefined, updateKey: number) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const camera = participant?.getTrackPublication(Track.Source.Camera)
  const screen = participant?.getTrackPublication(Track.Source.ScreenShare)
  const screenTrack = screen?.isMuted ? undefined : screen?.track
  const videoTrack = screenTrack ?? (camera?.isMuted ? undefined : camera?.track)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoTrack) return
    videoTrack.attach(video)
    return () => { videoTrack.detach(video) }
  }, [videoTrack, updateKey])
  return { videoRef, videoTrack, screenTrack }
}
```

<!-- END GENERATED CURRENT SOURCE -->
