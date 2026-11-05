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
import type { MeetingRoomScreenProps, RoomStatus } from './meeting-room-types'

const statusLabels: Record<RoomStatus, string> = { idle: 'Not connected', joining: 'Connecting…', connected: 'Connected', reconnecting: 'Reconnecting', ended: 'Meeting ended' }
const card = 'rounded-2xl border border-border/70 bg-card text-card-foreground shadow-xs'
const stageSurface = 'bg-linear-to-br from-brand-soft via-muted/80 to-brand-soft/70'
const MAX_GRID_TILES = 16
const gridBasis = ['', 'sm:basis-full', 'sm:basis-[calc((100%-0.75rem)/2)]', 'sm:basis-[calc((100%-1.5rem)/3)]', 'sm:basis-[calc((100%-2.25rem)/4)]']
const gridHeight = ['', 'sm:h-full', 'sm:h-[calc((100%-0.75rem)/2)]', 'sm:h-[calc((100%-1.5rem)/3)]', 'sm:h-[calc((100%-2.25rem)/4)]']

function gridColumns(count: number) {
  if (count <= 1) return 1
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}

export function CoachingMeetingScreen({ roomInputRef, ...state }: MeetingRoomScreenProps) {
  const kind = state.role === 'esl' ? 'esl' : 'tutors'
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
  const title = state.preview ? sample.title : state.role === 'esl' ? 'Language learning session' : 'Tutoring session'
  const panel = state.activePanel
  const gridPeople = people.length > MAX_GRID_TILES ? people.slice(0, MAX_GRID_TILES - 1) : people
  const hiddenCount = people.length - gridPeople.length
  const columns = gridColumns(gridPeople.length + (hiddenCount ? 1 : 0))
  const rows = Math.ceil((gridPeople.length + (hiddenCount ? 1 : 0)) / columns)
  const gridTile = cn('h-40 sm:h-auto sm:shrink-0 sm:grow-0', gridBasis[columns], gridHeight[Math.min(rows, 4)], gridPeople.length === 1 && 'col-span-2 h-72')
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

  return <section aria-label="Meeting room" data-meeting-design="coaching" className="flex min-w-0 flex-1 flex-col gap-3 text-foreground md:min-h-[30rem]" onKeyDown={event => {
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

    <div className="relative flex min-h-[60dvh] flex-1 gap-3 md:min-h-0">
      <section aria-label="Meeting stage" className={cn('flex min-h-0 min-w-0 flex-1 gap-3', strip.length > 0 && 'flex-col lg:flex-row', panel && 'max-lg:invisible')}>
        {showBoard ? <MeetingWhiteboard board={board} onChange={setBoard} host={{ id: sample.people[0].identity, name: sample.people[0].name }} hostLabel={sample.hostLabel} learner={{ id: sample.people[1].identity, name: sample.people[1].name }} names={names} onClose={() => setBoardOpen(false)} />
          : pinned ? <CallTile person={pinned} featured updateKey={state.revision} className="min-h-64 flex-1" />
            : people.length === 0 ? <div className={cn('flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl text-center', stageSurface)}><span className="grid size-16 place-items-center rounded-full bg-card text-brand shadow-sm"><VideoOff aria-hidden="true" className="size-7" /></span><p className="text-sm font-medium">Waiting for participants</p></div>
              : <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto sm:flex sm:flex-wrap sm:content-center sm:justify-center sm:overflow-hidden">
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
