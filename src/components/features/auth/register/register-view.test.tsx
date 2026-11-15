import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { startGoogleOAuth, registerAccount } from '@/services/api/auth.service'
import { RegisterView } from './register-view'

vi.mock('@/services/api/auth.service', () => ({ startGoogleOAuth: vi.fn(), registerAccount: vi.fn() }))
vi.mock('../shared/auth-showcase-layout', () => ({
  AuthShowcaseLayout: ({ children }: { children: import('react').ReactNode }) => <main>{children}</main>,
}))
beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)
function LoginDestination() {
  const { state } = useLocation()
  return <p>{state?.connectGoogle ? 'Log in, then connect Google' : 'Log in'}</p>
}
function setup(googleSetup = true) {
  render(<MemoryRouter initialEntries={[{ pathname: '/register', state: { googleSetup, oauthNotice: 'Finish Google signup without an Owlio password.' } }]}><Routes>
    <Route path="/register" element={<RegisterView />} />
    <Route path="/login" element={<LoginDestination />} />
  </Routes></MemoryRouter>)
}
describe('Google account setup', () => {
  it('requires only role and terms before starting Google registration', async () => {
    vi.mocked(startGoogleOAuth).mockRejectedValue(new Error('Provider unavailable'))
    setup()
    expect(screen.queryByLabelText('Full name')).toBeNull()
    expect(screen.queryByLabelText('Password')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up with Google' }))
    expect(await screen.findByText('Choose an account type to continue with Google.')).toBeTruthy()
    expect(startGoogleOAuth).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('radio', { name: /Tutor/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Sign up with Google' }))
    expect(await screen.findByText('Accept the terms to continue.')).toBeTruthy()
    expect(startGoogleOAuth).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Sign up with Google' }))
    await waitFor(() => expect(startGoogleOAuth).toHaveBeenCalledWith({ intent: 'register', accountType: 'tutor', termsAccepted: true }))
    expect(registerAccount).not.toHaveBeenCalled()
    expect(await screen.findByText('Provider unavailable')).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Tutor/ })).toHaveProperty('checked', true)
  })
  it('offers password sign-in and subsequent explicit Google linking for existing users', async () => {
    setup()
    fireEvent.click(screen.getByRole('link', { name: 'Log in to connect Google' }))
    expect(await screen.findByText('Log in, then connect Google')).toBeTruthy()
  })
  it('still offers the complete email signup form', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up with email instead' }))
    expect(screen.queryByText('Finish Google signup without an Owlio password.')).toBeNull()
    expect(screen.getByLabelText('Full name')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeTruthy()
  })
})
