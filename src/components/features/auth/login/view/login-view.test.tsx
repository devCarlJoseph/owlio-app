import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthSessionContext } from '../../context/auth-session-context'
import { LoginView } from './login-view'

vi.mock('../../shared/ui/auth-showcase-layout', () => ({
  AuthShowcaseLayout: ({ children }: { children: import('react').ReactNode }) => <main>{children}</main>,
}))

afterEach(cleanup)

function renderLogin(signIn = vi.fn(), state?: { accountBanned: boolean }) {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <AuthSessionContext.Provider value={{ user: null, status: 'anonymous', error: null,
        signIn, signOut: vi.fn(), refreshCurrentUser: vi.fn() }}>
        <LoginView />
      </AuthSessionContext.Provider>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

describe('login ban notice', () => {
  it('shows a confirmed temporary ban, clears the password and closes with Escape', async () => {
    const expiresAt = '2026-11-25T12:00:00.000Z'
    const signIn = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { code: 'ACCOUNT_BANNED', restriction: { kind: 'temporary', expiresAt } } },
    })
    const user = renderLogin(signIn)
    await user.type(screen.getByLabelText('Email'), 'learner@example.test')
    const password = screen.getByLabelText('Password') as HTMLInputElement
    await user.type(password, 'fixture-password')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    const dialog = await screen.findByRole('dialog', { name: 'Your account is temporarily banned' })
    expect(dialog.querySelector('time')?.dateTime).toBe(expiresAt)
    expect(password.value).toBe('')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('shows the Google callback ban outcome without attempting another login', async () => {
    const signIn = vi.fn()
    const user = renderLogin(signIn, { accountBanned: true })
    await screen.findByRole('dialog', { name: 'Your account is banned' })
    expect(signIn).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Return to sign-in' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('keeps invalid credentials in the usual sign-in feedback', async () => {
    const signIn = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } },
    })
    const user = renderLogin(signIn)
    await user.type(screen.getByLabelText('Email'), 'learner@example.test')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    await screen.findByText('Invalid email or password.')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
