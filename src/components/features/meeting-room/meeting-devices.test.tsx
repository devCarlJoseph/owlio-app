import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLocalAudioTrack, createLocalVideoTrack, Room, Track, TrackEvent, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client'
import { joinMeeting, sendMeetingMessage } from '@/services/api/meeting.service'
import { usePrejoinDevices } from './use-prejoin-devices'
import MeetingRoomPage from './meeting-room-view'

const addMessage = vi.hoisted(() => vi.fn())
vi.mock('livekit-client', async original => ({ ...await original<typeof import('livekit-client')>(), createLocalAudioTrack: vi.fn(), createLocalVideoTrack: vi.fn(), Room: vi.fn() }))
vi.mock('@/components/features/auth/auth-session-context', () => ({ useAuthSession: () => ({ user: { id: 'fixture-user', roles: ['EDUCATOR'] } }) }))
vi.mock('./use-native-meeting-data', () => ({ useNativeMeetingData: () => ({ state: null, directory: [], messages: [], error: '', addMessage, refresh: vi.fn() }) }))
vi.mock('@/services/api/meeting.service', () => ({ joinMeeting: vi.fn(), createMeeting: vi.fn(), openClassroomMeeting: vi.fn(), endMeeting: vi.fn(), sendMeetingMessage: vi.fn(), setMeetingHand: vi.fn(), resolveMeetingInvite: vi.fn() }))
const session = '11111111-1111-4111-8111-111111111111'
function fakeTrack(source = Track.Source.Camera) {
  return { source, stop: vi.fn(), attach: vi.fn(), detach: vi.fn(), on: vi.fn().mockReturnThis(), off: vi.fn().mockReturnThis() } as unknown as LocalVideoTrack
}
function show(role = 'educators') { return render(<MemoryRouter initialEntries={['/' + role + '/classrooms/meeting-room?session=' + session]}><MeetingRoomPage /></MemoryRouter>) }
function fakeRoom() {
  const localParticipant = { identity: 'fixture-peer', name: 'You', isCameraEnabled: false, isMicrophoneEnabled: false, isScreenShareEnabled: false, on: vi.fn(), off: vi.fn(), audioTrackPublications: new Map(), getTrackPublication: vi.fn(), publishTrack: vi.fn(), setMicrophoneEnabled: vi.fn(), setCameraEnabled: vi.fn() }
  const room = { state: 'connected', localParticipant, remoteParticipants: new Map(), connect: vi.fn().mockResolvedValue(undefined), disconnect: vi.fn().mockResolvedValue(undefined), on: vi.fn().mockReturnThis(), off: vi.fn().mockReturnThis() }
  localParticipant.publishTrack.mockImplementation(async track => {
    if (track.source === Track.Source.Camera) localParticipant.isCameraEnabled = true
    if (track.source === Track.Source.Microphone) localParticipant.isMicrophoneEnabled = true
  })
  vi.mocked(Room).mockImplementation(function () { return room as unknown as Room })
  return room
}
beforeEach(() => { vi.resetAllMocks(); vi.mocked(joinMeeting).mockResolvedValue({ meetingId: session, participantId: session, url: 'wss://fixture.invalid', token: 'fixture-only', expiresIn: 60 }) })
afterEach(cleanup)

describe('local device preview ownership', () => {
  it('captures only on request, toggles independently, and releases remaining devices on unmount', async () => {
    const camera = fakeTrack(), mic = fakeTrack(Track.Source.Microphone)
    vi.mocked(createLocalVideoTrack).mockResolvedValue(camera)
    vi.mocked(createLocalAudioTrack).mockResolvedValue(mic as unknown as LocalAudioTrack)
    const view = renderHook(usePrejoinDevices)
    expect(createLocalAudioTrack).not.toHaveBeenCalled(); expect(createLocalVideoTrack).not.toHaveBeenCalled()
    await act(() => view.result.current.toggle('camera'))
    await act(() => view.result.current.toggle('microphone'))
    expect(view.result.current.cameraOn).toBe(true); expect(view.result.current.micOn).toBe(true)
    await act(() => view.result.current.toggle('camera'))
    expect(camera.stop).toHaveBeenCalledOnce(); expect(mic.stop).not.toHaveBeenCalled()
    view.unmount(); expect(mic.stop).toHaveBeenCalledOnce()
  })
  it('ignores duplicate capture requests and stops late permission results after cleanup', async () => {
    let finish!: (track: LocalVideoTrack) => void
    vi.mocked(createLocalVideoTrack).mockReturnValue(new Promise(resolve => { finish = resolve }))
    const camera = fakeTrack(), view = renderHook(usePrejoinDevices)
    let pending!: Promise<void>
    act(() => { pending = view.result.current.toggle('camera'); void view.result.current.toggle('camera') })
    expect(createLocalVideoTrack).toHaveBeenCalledOnce()
    view.unmount()
    await act(async () => { finish(camera); await pending })
    expect(camera.stop).toHaveBeenCalledOnce()
  })
  it.each(['NotAllowedError', 'NotFoundError', 'NotReadableError'])('reports %s without claiming that the device started', async name => {
    vi.mocked(createLocalVideoTrack).mockRejectedValue(new DOMException('fixture', name))
    const view = renderHook(usePrejoinDevices)
    await act(() => view.result.current.toggle('camera'))
    expect(view.result.current.cameraOn).toBe(false)
    expect(view.result.current.error).toMatch(/camera/)
    expect(view.result.current.busy).toBe(false)
  })
  it('reflects a device ending outside the app', async () => {
    const camera = fakeTrack(); vi.mocked(createLocalVideoTrack).mockResolvedValue(camera)
    const view = renderHook(usePrejoinDevices)
    await act(() => view.result.current.toggle('camera'))
    const ended = vi.mocked(camera.on).mock.calls.find(([event]) => event === TrackEvent.Ended)?.[1] as () => void
    act(ended)
    expect(view.result.current.cameraOn).toBe(false)
    expect(camera.stop).toHaveBeenCalledOnce()
  })
  it('hands tracks to the room without stopping them during preview unmount', async () => {
    const camera = fakeTrack(); vi.mocked(createLocalVideoTrack).mockResolvedValue(camera)
    const view = renderHook(usePrejoinDevices)
    await act(() => view.result.current.toggle('camera'))
    let selected: unknown
    act(() => { selected = view.result.current.takeTracks() })
    expect(selected).toEqual([camera]); view.unmount(); expect(camera.stop).not.toHaveBeenCalled()
  })
})

describe('pre-join meeting controls', () => {
  it.each(['educators', 'students', 'esl', 'tutors'])('offers real preview buttons in the %s room', async role => {
    const camera = fakeTrack(); vi.mocked(createLocalVideoTrack).mockResolvedValue(camera)
    const view = show(role)
    fireEvent.click(screen.getByRole('button', { name: 'Turn camera on' }))
    expect(await screen.findByLabelText('Your camera preview')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Turn camera off' }).getAttribute('aria-pressed')).toBe('true')
    expect(camera.attach).toHaveBeenCalledOnce()
    expect(joinMeeting).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Turn camera off' }))
    await waitFor(() => expect(camera.stop).toHaveBeenCalledOnce())
    expect(camera.detach).toHaveBeenCalledOnce()
    view.unmount()
  })
  it('publishes exactly the selected preview tracks when joining and disconnects on leave', async () => {
    const camera = fakeTrack(), mic = fakeTrack(Track.Source.Microphone), room = fakeRoom()
    vi.mocked(createLocalVideoTrack).mockResolvedValue(camera); vi.mocked(createLocalAudioTrack).mockResolvedValue(mic as unknown as LocalAudioTrack)
    show()
    fireEvent.click(screen.getByRole('button', { name: 'Turn camera on' })); await screen.findByRole('button', { name: 'Turn camera off' })
    fireEvent.click(screen.getByRole('button', { name: 'Turn microphone on' })); await screen.findByRole('button', { name: 'Turn microphone off' })
    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' }))
    await screen.findByText('Connected')
    expect(room.localParticipant.publishTrack.mock.calls.map(([track]) => track)).toEqual([camera, mic])
    expect(createLocalVideoTrack).toHaveBeenCalledOnce(); expect(createLocalAudioTrack).toHaveBeenCalledOnce()
    expect(camera.stop).not.toHaveBeenCalled(); expect(mic.stop).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Leave meeting' }))
    await waitFor(() => expect(room.disconnect).toHaveBeenCalledWith(true))
  })
  it('joins with no capture or publication when both devices are off', async () => {
    const room = fakeRoom(); show()
    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' })); await screen.findByText('Connected')
    expect(room.localParticipant.publishTrack).not.toHaveBeenCalled()
    expect(createLocalAudioTrack).not.toHaveBeenCalled(); expect(createLocalVideoTrack).not.toHaveBeenCalled()
  })
  it('preserves the local preview if the API refuses to join, then stops it when changing invite', async () => {
    fakeRoom(); const camera = fakeTrack(); vi.mocked(createLocalVideoTrack).mockResolvedValue(camera)
    vi.mocked(joinMeeting).mockRejectedValue(new Error('Native meetings unavailable.'))
    show(); fireEvent.click(screen.getByRole('button', { name: 'Turn camera on' })); await screen.findByLabelText('Your camera preview')
    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' })); await screen.findByRole('alert')
    expect(camera.stop).not.toHaveBeenCalled(); expect(screen.getByLabelText('Your camera preview')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Use another invite' }))
    expect(camera.stop).toHaveBeenCalledOnce()
  })
  it('stops a failed publication while keeping the connected room usable', async () => {
    const room = fakeRoom(), camera = fakeTrack(); room.localParticipant.publishTrack.mockRejectedValue(new Error('fixture publication failure'))
    vi.mocked(createLocalVideoTrack).mockResolvedValue(camera)
    show(); fireEvent.click(screen.getByRole('button', { name: 'Turn camera on' })); await screen.findByLabelText('Your camera preview')
    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' })); await screen.findByText('Connected')
    expect(camera.stop).toHaveBeenCalledOnce()
    expect(screen.getByRole('alert').textContent).toContain('selected device could not be shared')
    expect(screen.getByRole('button', { name: 'Turn camera on' })).toBeTruthy()
  })
})

describe('immediate outgoing meeting chat', () => {
  const saved = { id: '22222222-2222-4222-8222-222222222222', authorId: 'fixture-user', authorName: 'You', body: 'Hello', createdAt: '2026-11-15T10:00:00.000000Z' }
  async function join() {
    const room = fakeRoom(); show()
    fireEvent.click(screen.getByRole('button', { name: 'Join meeting' })); await screen.findByText('Connected')
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    return room
  }
  function send() {
    fireEvent.change(screen.getByLabelText('Write a meeting message'), { target: { value: 'Hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
  }
  it('shows the outgoing message immediately, then confirms it without waiting for a refresh', async () => {
    let finish!: (value: typeof saved) => void
    vi.mocked(sendMeetingMessage).mockReturnValueOnce(new Promise(resolve => { finish = resolve }))
    await join(); send()
    expect(screen.getByText('Hello')).toBeTruthy(); expect(screen.getByText('Sending…')).toBeTruthy()
    expect((screen.getByLabelText('Write a meeting message') as HTMLInputElement).value).toBe('')
    fireEvent.change(screen.getByLabelText('Write a meeting message'), { target: { value: 'Next draft' } })
    await act(async () => { finish(saved) })
    expect(addMessage).toHaveBeenCalledWith(saved)
    expect(screen.queryByText('Sending…')).toBeNull()
    expect((screen.getByLabelText('Write a meeting message') as HTMLInputElement).value).toBe('Next draft')
  })
  it('keeps a failed message available for an idempotent retry', async () => {
    vi.mocked(sendMeetingMessage).mockRejectedValueOnce(new Error('fixture network error')).mockResolvedValueOnce(saved)
    await join(); send()
    const retry = await screen.findByRole('button', { name: 'Retry message: Hello' })
    expect(screen.getByText('Not sent')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Write a meeting message'), { target: { value: 'Keep this draft' } })
    fireEvent.click(retry)
    await waitFor(() => expect(addMessage).toHaveBeenCalledWith(saved))
    expect(vi.mocked(sendMeetingMessage).mock.calls[0]).toEqual(vi.mocked(sendMeetingMessage).mock.calls[1])
    expect((screen.getByLabelText('Write a meeting message') as HTMLInputElement).value).toBe('Keep this draft')
  })
  it('ignores a delayed send confirmation after leaving', async () => {
    let finish!: (value: typeof saved) => void
    vi.mocked(sendMeetingMessage).mockReturnValueOnce(new Promise(resolve => { finish = resolve }))
    await join(); send()
    fireEvent.click(screen.getByRole('button', { name: 'Leave meeting' }))
    await act(async () => { finish(saved) })
    expect(addMessage).not.toHaveBeenCalled()
    expect(screen.queryByText('Hello')).toBeNull()
  })
})
