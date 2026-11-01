import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Participant, ParticipantEvent, Track } from 'livekit-client'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
    expect(screen.getByRole('article', { name: 'Presenter' }).closest('.classroom-featured')).toBeTruthy()
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
    fireEvent.click(within(panel).getByRole('button', { name: 'Close' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open chat' }))
    fireEvent.keyDown(panel, { key: 'Escape' })
    expect(props.onPanel).toHaveBeenCalledWith('chat')
  })
  it('keeps stale roster and chat data out of the classroom preview', () => {
    show(state({ activePanel: 'chat', isHost: true, participants: [participant('a', 'Stale attendee')], messages: [{ id: 'old', identity: 'a', text: 'Stale message', sentAt: 1000 }] }))
    expect(screen.queryByText('Stale attendee')).toBeNull()
    expect(screen.queryByText('Stale message')).toBeNull()
    expect(screen.queryByRole('button', { name: 'End meeting for everyone' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Open participants, 0 connected' })).toBeTruthy()
  })
  it.each(['esl', 'tutors'] as const)('uses the reference workspace for %s with truthful unavailable AI cards', role => {
    const props = state({ role })
    show(props)
    expect(screen.getByRole('region', { name: 'Meeting room' }).getAttribute('data-meeting-design')).toBe('coaching')
    expect(screen.getByRole('region', { name: 'Meeting participants' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Meeting chat' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'AI session notes' })).toBeTruthy()
    expect(screen.getByText('No one connected')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send message' }).hasAttribute('disabled')).toBe(true)
    expect(screen.queryByRole('button', { name: /start record|generate summary/i })).toBeNull()
  })
  it.each(['students', 'educators'] as const)('uses a classroom layout for %s without exposing coaching AI cards', role => {
    const props = state({ role })
    show(props)
    expect(screen.getByRole('region', { name: 'Meeting room' }).getAttribute('data-meeting-design')).toBe('classroom')
    expect(screen.queryByRole('heading', { name: 'AI session notes' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Meeting participants' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    expect(props.onPanel).toHaveBeenCalledWith('chat')
  })
  it('keeps device, screen, and hand controls disabled in preview and allows safe exit', () => {
    const props = state()
    show(props)
    for (const name of ['Turn microphone on', 'Turn camera on', 'Share screen', 'Raise hand']) expect(screen.getByRole('button', { name }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Turn microphone on' }))
    expect(props.onMicrophone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Exit preview' }))
    expect(props.onLeave).toHaveBeenCalledOnce()
  })
  it('renders each connected participant once on the stage and enables opt-in controls', () => {
    const props = state({ preview: false, hasRoom: true, status: 'connected', role: 'tutors', localIdentity: 'local', participants: [participant('local', 'Teacher'), participant('remote', 'Learner')] })
    show(props)
    const stage = within(screen.getByRole('region', { name: 'Meeting stage' }))
    expect(stage.getAllByRole('article')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Turn camera on' }))
    expect(props.onCamera).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'End meeting for everyone' })).toBeNull()
    fireEvent.click(stage.getByRole('button', { name: 'Pin Learner for your view' }))
    expect(props.onPin).toHaveBeenCalledWith('remote')
    fireEvent.click(screen.getByRole('button', { name: 'Grid view' }))
    expect(props.onPin).toHaveBeenCalledWith(null)
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
