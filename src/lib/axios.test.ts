import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

describe('API cookie origin', () => {
  it('keeps production session and CSRF requests on the website despite the old Render build setting', async () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_API_URL', 'https://owlio-api.onrender.com')
    vi.resetModules()
    const { default: api } = await import('./axios')
    expect(api.defaults.baseURL).toBe(window.location.origin)
    expect(api.defaults.withCredentials).toBe(true)
    expect(api.getUri({ url: '/api/v1/auth/me' })).toBe(window.location.origin + '/api/v1/auth/me')
    expect(api.getUri({ url: '/api/v1/auth/csrf' })).toBe(window.location.origin + '/api/v1/auth/csrf')
  })
  it('preserves the explicit development API origin', async () => {
    vi.stubEnv('PROD', false)
    vi.stubEnv('VITE_API_URL', 'http://127.0.0.1:7000/')
    vi.resetModules()
    const { default: api } = await import('./axios')
    expect(api.defaults.baseURL).toBe('http://127.0.0.1:7000')
    expect(api.defaults.withCredentials).toBe(true)
  })
  it('uses the local API by default in development', async () => {
    vi.stubEnv('PROD', false)
    vi.stubEnv('VITE_API_URL', '')
    vi.resetModules()
    const { default: api } = await import('./axios')
    expect(api.defaults.baseURL).toBe('http://localhost:7000')
  })
  it.each([
    'https://api.fixture.invalid/api/v1', 'https://user:password@api.fixture.invalid',
    'https://api.fixture.invalid?token=fixture', 'https://api.fixture.invalid#fragment', 'ftp://api.fixture.invalid',
  ])('rejects invalid development origin %s', async (origin) => {
    vi.stubEnv('PROD', false)
    vi.stubEnv('VITE_API_URL', origin)
    vi.resetModules()
    await expect(import('./axios')).rejects.toThrow('VITE_API_URL must be')
  })
})
