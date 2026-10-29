import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { getCsrfToken, registerAccount, loginAccount, logoutAccount } from './auth.service'
vi.mock('@/lib/axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

function rejected(status: number, code: string) {
  return { isAxiosError: true, response: { status, data: { code } } }
}
beforeEach(() => { vi.resetAllMocks() })

describe('current auth API contract', () => {
  it('gets CSRF and sends cookies through the shared client without assuming registration returns a user', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { csrfToken: 'csrf' } } })
    vi.mocked(api.post).mockResolvedValue({ data: { data: { message: 'Verification requested.' } } })
    await getCsrfToken(true)
    expect(await registerAccount({ name: 'Test', email: 'test@example.test', accountType: 'student',
      password: 'test-only-password', confirmPassword: 'test-only-password', termsAccepted: true }))
      .toEqual({ message: 'Verification requested.' })
    expect(api.post).toHaveBeenCalledWith('/api/v1/auth/register', expect.any(Object), { headers: { 'x-csrf-token': 'csrf' } })
  })

  it('retries once only when the API explicitly rejects stale CSRF before the action', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: { csrfToken: 'old' } } })
      .mockResolvedValueOnce({ data: { data: { csrfToken: 'fresh' } } })
    vi.mocked(api.post).mockRejectedValueOnce(rejected(403, 'INVALID_CSRF'))
      .mockResolvedValueOnce({ data: { data: { user: {}, csrfToken: 'rotated' } } })
    await getCsrfToken(true)
    await loginAccount({ email: 'test@example.test', password: 'test-only-password', rememberMe: false })
    expect(api.post).toHaveBeenCalledTimes(2)
    expect(api.post).toHaveBeenLastCalledWith('/api/v1/auth/login', expect.any(Object), { headers: { 'x-csrf-token': 'fresh' } })
  })

  it.each([[401, 'UNAUTHENTICATED'], [403, 'FORBIDDEN'], [500, 'INTERNAL_ERROR']])(
    'does not retry a %s %s error', async (status, code) => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: { csrfToken: 'csrf' } } })
      vi.mocked(api.post).mockRejectedValue(rejected(status as number, code as string))
      await getCsrfToken(true)
      await expect(logoutAccount()).rejects.toMatchObject({ response: { status } })
      expect(api.post).toHaveBeenCalledOnce()
    },
  )

  it('uses the rotated login CSRF token for subsequent logout', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { csrfToken: 'original' } } })
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { user: {}, csrfToken: 'rotated' } } })
      .mockResolvedValueOnce({ data: { data: { message: 'Signed out.' } } })
    await getCsrfToken(true)
    await loginAccount({ email: 'test@example.test', password: 'test-only-password', rememberMe: false })
    await logoutAccount()
    expect(api.get).toHaveBeenCalledOnce()
    expect(api.post).toHaveBeenLastCalledWith('/api/v1/auth/logout', undefined, { headers: { 'x-csrf-token': 'rotated' } })
  })
})
