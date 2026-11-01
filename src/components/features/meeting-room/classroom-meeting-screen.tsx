import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router'
import { Track } from 'livekit-client'
import { Tooltip } from '@base-ui/react/tooltip'
import { ArrowLeft, Copy, Grid2X2, Hand, LockKeyhole, MessageCircle, Mic, MicOff, MonitorUp, PanelLeft, PhoneOff, Users, Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ParticipantTile } from './participant-tile'
import { ChatPanel, PeoplePanel } from './meeting-room-panels'
import type { MeetingPanel, MeetingRoomScreenProps, RoomStatus } from './meeting-room-types'
import './classroom-meeting.css'

const statusLabels: Record<RoomStatus, string> = { idle: 'Not connected', joining: 'Connecting…', connected: 'Connected', reconnecting: 'Reconnecting', ended: 'Meeting ended' }

function CallControl({ label, children, pressed, disabled, onClick, tone, controlRef }: {
  label: string; children: ReactNode; pressed?: boolean; disabled?: boolean; onClick: () => void
  tone?: 'off' | 'leave'; controlRef?: Ref<HTMLButtonElement>
}) {
  return <Tooltip.Root>
    <Tooltip.Trigger render={<Button variant="ghost" disabled={disabled} />} ref={controlRef} className="classroom-control" data-tone={tone} aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}>{children}</Tooltip.Trigger>
    <Tooltip.Portal><Tooltip.Positioner side="top" sideOffset={10}><Tooltip.Popup className="classroom-call-tooltip">{label}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
  </Tooltip.Root>
}

export function ClassroomMeetingScreen({ roomInputRef, ...state }: MeetingRoomScreenProps) {
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid')
  const panelRef = useRef<HTMLElement>(null)
  const chatRef = useRef<HTMLButtonElement>(null)
  const peopleRef = useRef<HTMLButtonElement>(null)
  const inCall = state.hasRoom || state.preview
  const enabled = state.hasRoom && state.status === 'connected' && !state.preview
  const participants = state.preview ? [] : state.participants
  const presenter = participants.find(person => {
    const publication = person.getTrackPublication(Track.Source.ScreenShare)
    return publication?.track && !publication.isMuted
  })
  const featured = participants.find(person => person.identity === state.pinnedIdentity) ??
    (layout === 'spotlight' ? presenter ?? participants.find(person => person.identity !== state.localIdentity) ?? participants[0] : undefined)
  const others = participants.filter(person => person !== featured)
  const raised = Boolean(state.raisedHands[state.localIdentity ?? ''])

  useEffect(() => {
    if (state.activePanel) panelRef.current?.focus()
  }, [state.activePanel])

  function togglePanel(panel: MeetingPanel) {
    if (state.activePanel === panel) (panel === 'chat' ? chatRef : peopleRef).current?.focus()
    state.onPanel(panel)
  }

  const panelState = { ...state, participants, messages: state.preview ? [] : state.messages, onPanel: togglePanel }
  function tile(person: typeof participants[number]) {
    return <ParticipantTile key={person.identity} participant={person} local={person.identity === state.localIdentity} raised={Boolean(state.raisedHands[person.identity])} pinned={person.identity === state.pinnedIdentity} onPinToggle={() => state.onPin(state.pinnedIdentity === person.identity ? null : person.identity)} updateKey={state.revision} classroom />
  }
  const emptyStage = <div className="classroom-empty-stage">
    <span className="classroom-empty-icon"><VideoOff aria-hidden="true" /></span>
    <h3>{state.preview ? 'Make room for learning' : state.hasRoom ? 'Your room is ready' : 'Your camera is off'}</h3>
    <p>{state.preview ? 'Explore your meeting layout. Participants appear here when you join a live room.' : state.hasRoom ? 'Connected participants will appear here.' : 'Join with your camera and microphone off. Turn them on whenever you’re ready.'}</p>
    <span className="classroom-device-note"><MicOff aria-hidden="true" /> Microphone off <span aria-hidden="true">·</span> <VideoOff aria-hidden="true" /> Camera off</span>
  </div>

  return <Tooltip.Provider delay={250}>
    <section aria-label="Meeting room" data-meeting-design="classroom" className={`classroom-meeting ${inCall ? 'classroom-in-call' : 'classroom-lobby'}`} onKeyDown={event => {
      if (event.key === 'Escape' && state.activePanel) { event.preventDefault(); togglePanel(state.activePanel) }
    }}>
      <header className="classroom-header">
        <div className="classroom-heading"><Link to={state.backHref} aria-label="Back to Meeting Room" className="classroom-back"><ArrowLeft aria-hidden="true" /></Link><div><h2>Meeting room</h2><p>{state.meetingCode || 'A space to learn together'}</p></div></div>
        <div className="classroom-header-actions">
          {state.roomId && <Button variant="ghost" className="classroom-copy" onClick={state.onCopy} aria-label="Copy meeting invite"><Copy aria-hidden="true" /><span>Copy invite</span></Button>}
          <span role="status" className="classroom-connection" data-connected={enabled}><span aria-hidden="true" />{state.preview ? 'Layout preview' : statusLabels[state.status]}</span>
        </div>
      </header>
      {(state.message || state.error) && <div className="classroom-feedback">{state.message && <p role="status">{state.message}</p>}{state.error && <p role="alert">{state.error}</p>}</div>}
      {!inCall ? <div className="classroom-join">
        <div className="classroom-camera-preview">{emptyStage}<span className="classroom-preview-caption"><LockKeyhole aria-hidden="true" /> Your devices stay off until you choose otherwise</span></div>
        <div className="classroom-join-form"><span className="classroom-eyebrow">OWLIO CLASSROOM</span><h3>{state.status === 'ended' ? 'This meeting has ended' : state.roomId ? 'Ready to join?' : 'Join your learning group'}</h3><p>Bring your questions. Share your ideas. Start with an invite from your teacher or meeting host.</p>
          <form key={state.roomId} onSubmit={state.onJoin}><label htmlFor="meeting-invite">Invite link or room code</label><Input ref={roomInputRef} id="meeting-invite" defaultValue={state.meetingCode} placeholder="Paste an invite or room code" autoComplete="off" /><Button type="submit" disabled={state.busy || !state.apiEnabled} className="classroom-join-button">{state.status === 'joining' ? 'Connecting…' : 'Join meeting'}</Button></form>
          {state.canCreate && <Button variant="outline" disabled={state.busy || !state.apiEnabled} onClick={state.onCreate}>{state.busy && state.status !== 'joining' ? 'Creating…' : 'Create a meeting'}</Button>}
          {!state.apiEnabled && <p role="status" className="classroom-unavailable">Live meetings are currently unavailable. You can preview the layout without connecting or enabling devices.</p>}
          <Button variant="outline" onClick={state.onPreview}>Preview room layout</Button>
        </div>
      </div> : <>
        {state.preview && <p className="classroom-preview-notice">Layout preview only · No live participants or media access</p>}
        <div className={`classroom-call-body ${state.activePanel ? 'classroom-panel-open' : ''}`}>
          <section className="classroom-stage" aria-label="Meeting stage">
            <div className="classroom-stage-toolbar"><span>{state.preview ? 'Preview stage' : `${participants.length} connected`}</span><div role="group" aria-label="Video layout"><Button variant="ghost" aria-label="Grid view" aria-pressed={!featured && layout === 'grid'} onClick={() => { state.onPin(null); setLayout('grid') }}><Grid2X2 aria-hidden="true" /><span>Grid</span></Button><Button variant="ghost" aria-label="Spotlight view" aria-pressed={Boolean(featured) || layout === 'spotlight'} onClick={() => setLayout('spotlight')}><PanelLeft aria-hidden="true" /><span>Spotlight</span></Button></div></div>
            {participants.length === 0 ? emptyStage : featured ? <div className={`classroom-spotlight ${others.length ? '' : 'classroom-only-tile'}`}><div className="classroom-featured">{tile(featured)}</div>{others.length > 0 && <div className="classroom-filmstrip">{others.map(tile)}</div>}</div> : <div className="classroom-gallery" data-single={participants.length === 1}>{participants.map(tile)}</div>}
          </section>
          {state.activePanel && <aside ref={panelRef} tabIndex={-1} className="classroom-side-panel" aria-label={state.activePanel === 'chat' ? 'In-call messages panel' : 'Participants panel'}>{state.activePanel === 'chat' ? <ChatPanel state={panelState} /> : <PeoplePanel state={panelState} />}</aside>}
        </div>
        <footer className="classroom-footer">
          <div className="classroom-meeting-context"><span className="classroom-wordmark">Owlio</span><span>{state.meetingCode || (state.preview ? 'Room preview' : 'Learning together')}</span></div>
          <div className="classroom-primary-controls" role="group" aria-label="Meeting controls">
            <CallControl label={state.micOn ? 'Turn microphone off' : 'Turn microphone on'} pressed={state.micOn} tone={state.micOn ? undefined : 'off'} disabled={!enabled} onClick={state.onMicrophone}>{state.micOn ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}</CallControl>
            <CallControl label={state.cameraOn ? 'Turn camera off' : 'Turn camera on'} pressed={state.cameraOn} tone={state.cameraOn ? undefined : 'off'} disabled={!enabled} onClick={state.onCamera}>{state.cameraOn ? <Video aria-hidden="true" /> : <VideoOff aria-hidden="true" />}</CallControl>
            <CallControl label={state.screenOn ? 'Stop presenting' : 'Share screen'} pressed={state.screenOn} disabled={!enabled} onClick={state.onScreen}><MonitorUp aria-hidden="true" /></CallControl>
            <CallControl label={raised ? 'Lower hand' : 'Raise hand'} pressed={raised} disabled={!enabled || state.handUpdating} onClick={state.onHand}><Hand aria-hidden="true" /></CallControl>
            <CallControl label={state.preview ? 'Exit preview' : 'Leave meeting'} tone="leave" onClick={state.onLeave}><PhoneOff aria-hidden="true" /></CallControl>
          </div>
          <div className="classroom-secondary-controls" role="group" aria-label="Meeting panels">
            <CallControl controlRef={peopleRef} label={`Open participants, ${participants.length} connected`} pressed={state.activePanel === 'people'} onClick={() => togglePanel('people')}><Users aria-hidden="true" /><span className="classroom-control-count">{participants.length}</span></CallControl>
            <CallControl controlRef={chatRef} label={`Open chat${!state.preview && state.unreadMessages ? `, ${state.unreadMessages} unread` : ''}`} pressed={state.activePanel === 'chat'} onClick={() => togglePanel('chat')}><MessageCircle aria-hidden="true" />{!state.preview && state.unreadMessages > 0 && <span className="classroom-control-count">{Math.min(state.unreadMessages, 99)}</span>}</CallControl>
          </div>
          {state.isHost && !state.preview && <Button variant="outline" className="classroom-end" disabled={state.busy} onClick={state.onEnd}>End meeting for everyone</Button>}
        </footer>
      </>}
    </section>
  </Tooltip.Provider>
}
