import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileView } from './profile-view'
import { SettingsView } from './settings-view'
import { SupportView } from './support-view'

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  upload: vi.fn(),
  refresh: vi.fn(),
  update: vi.fn(),
}))
vi.mock('@/services/api/contract-client', () => ({ requestOperation: mocks.request }))
vi.mock('@/components/features/auth/context/auth-session-context', () => ({
  useAuthSession: () => ({
    user: { id: 'test-user', name: 'Alex Rivera', email: 'alex@example.test' },
    refreshCurrentUser: mocks.refresh,
  }),
}))
vi.mock('@/services/api/profile-photo.service', async (load) => ({
  ...await load<typeof import('@/services/api/profile-photo.service')>(),
  updateProfilePhoto: mocks.upload,
}))

function openAccount(path: string, page: ReactNode) {
  render(
    <MemoryRouter initialEntries={['/students/' + path]}>
      <Routes>
        <Route path="/students" element={<Outlet context={{
          current: { photo: { source: null, url: null, uploadsAvailable: true }, revision: 0 },
          update: mocks.update,
        }} />}>
          <Route path={path} element={page} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('workspace account pages', () => {
  beforeEach(() => vi.resetAllMocks())

  it('shows the updated photo only after the API confirms the upload', async () => {
    const avatar = { source: 'upload', url: 'https://storage.example.test/record', uploadsAvailable: true }
    let confirmUpload!: (value: typeof avatar) => void
    mocks.upload.mockReturnValue(new Promise<typeof avatar>(resolve => { confirmUpload = resolve }))
    openAccount('profile', <ProfileView />)
    const file = new File(['test image bytes'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Profile photo file'), { target: { files: [file] } })

    expect(screen.queryByText('Profile photo updated.')).toBeNull()
    expect(mocks.update).not.toHaveBeenCalled()
    confirmUpload(avatar)

    expect(await screen.findByText('Profile photo updated.')).toBeTruthy()
    expect(mocks.upload).toHaveBeenCalledExactlyOnceWith(file)
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith(avatar)
  })

  it('sends only the changed account preferences', async () => {
    const preferences = { timeZone: 'UTC', locale: 'en-US', sessionReminders: false }
    mocks.request.mockResolvedValueOnce(preferences).mockResolvedValueOnce({ ...preferences, sessionReminders: true })
    openAccount('settings', <SettingsView />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('switch', { name: 'Session reminders' }))
    await user.click(screen.getByRole('button', { name: 'Save preferences' }))

    expect(await screen.findByText('Preferences saved.')).toBeTruthy()
    expect(mocks.request).toHaveBeenLastCalledWith('PATCH /api/v1/users/me/settings', {
      body: { sessionReminders: true },
    })
  })

  it('shows the returned ticket and its status after submission', async () => {
    mocks.request.mockResolvedValueOnce({ items: [], nextCursor: null }).mockResolvedValueOnce({
      id: 'ticket-1', category: 'ACCOUNT', subject: 'Workspace access', status: 'OPEN',
      createdAt: '2026-11-19T00:00:00Z',
    })
    openAccount('help', <SupportView />)
    const user = userEvent.setup()
    await user.type(screen.getByRole('textbox', { name: 'Subject' }), 'Workspace access')
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'I need help finding my workspace.')
    await user.click(screen.getByRole('button', { name: 'Submit request' }))

    expect(await screen.findByText('Support request submitted.')).toBeTruthy()
    expect(screen.getByText('Workspace access')).toBeTruthy()
    expect(screen.getByText('Open')).toBeTruthy()
    expect(mocks.request).toHaveBeenLastCalledWith('POST /api/v1/users/me/support-tickets', {
      body: { category: 'ACCOUNT', subject: 'Workspace access', message: 'I need help finding my workspace.' },
    })
  })
})
