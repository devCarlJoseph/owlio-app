import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Copy, Grid2X2, Hand, LockKeyhole, MessageCircle, Mic, MicOff, MonitorUp, PanelLeft, PhoneOff, Sparkles, Users, Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatPanel, PeoplePanel } from './meeting-room-panels'
import { ParticipantTile } from './participant-tile'
import type { MeetingRoomScreenProps } from './meeting-room-types'
import './meeting-room.css'

function EmptyStage({ small = false }: { small?: boolean }) {
  return <div className={`meeting-empty-stage ${small ? 'meeting-empty-small' : ''}`}>
    <span className="meeting-avatar"><VideoOff aria-hidden="true" className={small ? 'size-5' : 'size-8'} /></span>
    <p className="mt-4 text-sm font-medium">{small ? 'Participant tile' : 'Your session starts here'}</p>
    <p className="mt-1 max-w-64 px-4 text-center text-xs leading-5 opacity-60">{small ? 'Appears when someone joins' : 'Camera and microphone are off. Join a live room to meet with others.'}</p>
  </div>
}

export function MeetingRoomScreen({ roomInputRef, ...state }: MeetingRoomScreenProps) {
  const coaching = state.role === 'esl' || state.role === 'tutors'
  const [layout, setLayout] = useState<'grid' | 'spotlight'>(coaching ? 'spotlight' : 'grid')
  const featured = state.participants.find(person => person.identity === state.pinnedIdentity) ??
    (layout === 'spotlight' ? state.participants.find(person => person.identity !== state.localIdentity) ?? state.participants[0] : undefined)
  const others = featured ? state.participants.filter(person => person.identity !== featured.identity) : []
  const inCall = state.hasRoom || state.preview
  const enabled = state.hasRoom && state.status === 'connected' && !state.preview
  const title = coaching ? state.role === 'esl' ? 'Language learning session' : 'Tutoring session' : 'Meeting room'
  function tile(person: typeof state.participants[number]) {
    return <ParticipantTile key={person.identity} participant={person} local={person.identity === state.localIdentity} raised={Boolean(state.raisedHands[person.identity])} pinned={person.identity === state.pinnedIdentity} onPinToggle={() => state.onPin(state.pinnedIdentity === person.identity ? null : person.identity)} updateKey={state.revision} />
  }
  const controls = <div className="meeting-controls" role="group" aria-label="Meeting controls">
    <Button className="meeting-control" variant="ghost" size="icon" disabled={!enabled} aria-label={state.micOn ? 'Turn microphone off' : 'Turn microphone on'} aria-pressed={state.micOn} onClick={state.onMicrophone}>{state.micOn ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}</Button>
    <Button className="meeting-control" variant="ghost" size="icon" disabled={!enabled} aria-label={state.cameraOn ? 'Turn camera off' : 'Turn camera on'} aria-pressed={state.cameraOn} onClick={state.onCamera}>{state.cameraOn ? <Video aria-hidden="true" /> : <VideoOff aria-hidden="true" />}</Button>
    <Button className="meeting-control" variant="ghost" size="icon" disabled={!enabled} aria-label={state.screenOn ? 'Stop presenting' : 'Share screen'} aria-pressed={state.screenOn} onClick={state.onScreen}><MonitorUp aria-hidden="true" /></Button>
    <Button className="meeting-control" variant="ghost" size="icon" disabled={!enabled || state.handUpdating} aria-label={state.raisedHands[state.localIdentity ?? ''] ? 'Lower hand' : 'Raise hand'} aria-pressed={Boolean(state.raisedHands[state.localIdentity ?? ''])} onClick={state.onHand}><Hand aria-hidden="true" /></Button>
    <Button className="meeting-control" variant="ghost" size="icon" aria-label={`Open chat${state.unreadMessages ? `, ${state.unreadMessages} unread` : ''}`} aria-pressed={state.activePanel === 'chat'} onClick={() => state.onPanel('chat')}><MessageCircle aria-hidden="true" />{state.unreadMessages > 0 && <span className="meeting-unread">{Math.min(state.unreadMessages, 99)}</span>}</Button>
    <Button className="meeting-control" variant="ghost" size="icon" aria-label={`Open participants, ${state.participants.length} connected`} aria-pressed={state.activePanel === 'people'} onClick={() => state.onPanel('people')}><Users aria-hidden="true" /></Button>
    <Button className="meeting-leave" aria-label={state.preview ? 'Exit preview' : 'Leave meeting'} onClick={state.onLeave}><PhoneOff aria-hidden="true" /><span>{state.preview ? 'Exit preview' : 'Leave'}</span></Button>
  </div>

  return <section aria-label="Meeting room" data-meeting-design={coaching ? 'coaching' : 'classroom'} className={`meeting-room ${coaching ? 'meeting-coaching' : 'meeting-classic'} ${inCall ? 'meeting-in-call' : 'meeting-lobby'}`}>
    <header className="meeting-header">
      <div className="flex min-w-0 items-center gap-3"><Link to={state.backHref} aria-label="Back to Meeting Room" className="meeting-back"><ArrowLeft aria-hidden="true" className="size-4" /></Link><div className="min-w-0"><h2 className="truncate text-sm font-semibold sm:text-base">{title}</h2><p className="mt-1 truncate text-[11px] opacity-60">{state.meetingCode || (coaching ? 'A little space for focused learning' : 'A space to learn together')}</p></div></div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {state.roomId && <Button variant="ghost" size="sm" className="meeting-header-action" onClick={state.onCopy} aria-label="Copy meeting invite"><Copy aria-hidden="true" className="size-3.5" /><span className="hidden sm:inline">Copy invite</span></Button>}
        {inCall && <span className="meeting-status">{state.preview ? 'Layout preview' : state.status === 'reconnecting' ? 'Reconnecting' : 'Connected'}</span>}
      </div>
    </header>
    {(state.message || state.error) && <div className="meeting-feedback">{state.message && <p role="status">{state.message}</p>}{state.error && <p role="alert" className="font-medium text-destructive">{state.error}</p>}</div>}
    {!inCall ? <div className="meeting-join-layout">
      <div><div className="meeting-lobby-camera"><EmptyStage /></div><p className="mt-3 text-center text-xs text-muted-foreground">You control when your camera and microphone turn on.</p></div>
      <div className="space-y-5 py-3"><div><p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{coaching ? 'Your learning session' : 'Meeting access'}</p><h3 className="mt-3 text-2xl font-semibold tracking-tight">{state.status === 'ended' ? 'This meeting has ended' : state.roomId ? 'Ready to join?' : 'Join your learning group'}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Use the Owlio invite from your teacher or session host.</p></div>
        <form key={state.roomId} onSubmit={state.onJoin} className="space-y-3"><label htmlFor="meeting-invite" className="text-xs font-medium">Invite link or room code</label><Input ref={roomInputRef} id="meeting-invite" defaultValue={state.meetingCode} placeholder="Paste an invite or room code" autoComplete="off" /><Button type="submit" disabled={state.busy || !state.apiEnabled} className="meeting-primary w-full">{state.status === 'joining' ? 'Connecting…' : 'Join meeting'}</Button></form>
        {state.canCreate && <Button variant="outline" className="w-full" disabled={state.busy || !state.apiEnabled} onClick={state.onCreate}>{state.busy && state.status !== 'joining' ? 'Creating…' : 'Create a meeting'}</Button>}
        {!state.apiEnabled && <p role="status" className="rounded-xl border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">Live meetings are unavailable while API integrations are paused. You can explore the layout without connecting or enabling devices.</p>}
        <Button variant="outline" className="w-full" onClick={state.onPreview}>Preview room layout</Button>
      </div>
    </div> : <>
      {state.preview && <p role="status" className="meeting-preview-notice">Layout preview only · No live participants, recording, or media access.</p>}
      <div className="meeting-call-body">
        <section className="meeting-stage-column" aria-label="Meeting stage">
          <div className="meeting-stage-toolbar"><span className="text-xs opacity-65">{state.preview ? 'Preview stage' : `${state.participants.length} connected`}</span><div className="flex gap-1" role="group" aria-label="Video layout"><Button className="meeting-layout-button" variant="ghost" size="icon-sm" aria-label="Grid view" aria-pressed={!featured && state.participants.length > 0 || layout === 'grid' && !state.pinnedIdentity} onClick={() => { state.onPin(null); setLayout('grid') }}><Grid2X2 aria-hidden="true" className="size-3.5" /></Button><Button className="meeting-layout-button" variant="ghost" size="icon-sm" aria-label="Spotlight view" aria-pressed={Boolean(featured) || layout === 'spotlight'} onClick={() => setLayout('spotlight')}><PanelLeft aria-hidden="true" className="size-3.5" /></Button></div></div>
          {state.participants.length === 0 ? <div className={coaching && layout === 'spotlight' ? 'meeting-spotlight' : 'meeting-empty-fill'}><EmptyStage />{coaching && layout === 'spotlight' && <div className="meeting-filmstrip"><EmptyStage small /><EmptyStage small /></div>}</div>
            : featured ? <div className={`meeting-spotlight ${others.length === 0 ? 'meeting-single' : ''}`}><div className="meeting-featured">{tile(featured)}</div>{others.length > 0 && <div className="meeting-filmstrip">{others.map(tile)}</div>}</div>
            : <div className={`meeting-gallery ${state.participants.length === 1 ? 'meeting-gallery-single' : ''}`}>{state.participants.map(tile)}</div>}
          {coaching && <div className="grid gap-3 sm:grid-cols-2"><UnavailableCard title="AI session notes" description="Recording and transcription aren’t connected in Owlio." /><UnavailableCard title="Session summary" description="AI summaries aren’t connected. This interface doesn’t generate a session summary." /></div>}
        </section>
        {(coaching || state.activePanel) && <aside className={`meeting-sidebar ${state.activePanel ? 'meeting-sidebar-expanded' : ''}`} aria-label="Session panels">{(!coaching ? state.activePanel === 'people' : state.activePanel !== 'chat') && <PeoplePanel state={state} />}{(!coaching ? state.activePanel === 'chat' : state.activePanel !== 'people') && <ChatPanel state={state} />}</aside>}
      </div>
      <footer className="meeting-footer">{!coaching && <p className="meeting-code-footer">{state.meetingCode || 'Owlio meeting'}</p>}{controls}<p className="meeting-footer-hint text-[10px] opacity-60">{coaching ? 'Room chat and presence are temporary.' : 'Camera and microphone are opt-in.'}</p>{state.isHost && !state.preview && <Button variant="outline" className="meeting-end" disabled={state.busy} onClick={state.onEnd}>End meeting for everyone</Button>}</footer>
    </>}
  </section>
}

function UnavailableCard({ title, description }: { title: string; description: string }) {
  return <section className="rounded-2xl border border-border bg-card p-4 text-card-foreground"><div className="flex items-center gap-2"><Sparkles aria-hidden="true" className="size-4 meeting-accent-text" /><h3 className="text-xs font-semibold">{title}</h3><span className="ml-auto flex items-center gap-1 text-[9px] text-muted-foreground"><LockKeyhole aria-hidden="true" className="size-3" />Unavailable</span></div><p className="mt-3 text-[11px] leading-5 text-muted-foreground">{description}</p></section>
}
