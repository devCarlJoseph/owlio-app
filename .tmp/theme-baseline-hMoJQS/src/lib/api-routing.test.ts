// @vitest-environment node
import routingJson from '../../vercel.json?raw'
import { describe, expect, it } from 'vitest'

const config = JSON.parse(routingJson) as {
  rewrites: { source: string; destination: string }[]
  headers: { source: string; headers: { key: string; value: string }[] }[]
}

describe('production API routing', () => {
  it('places the Render proxy before the SPA fallback and preserves API paths', () => {
    const apiIndex = config.rewrites.findIndex(rule => rule.source === '/api/:path*')
    const fallbackIndex = config.rewrites.findIndex(rule => rule.destination === '/index.html')
    expect(apiIndex).toBeGreaterThanOrEqual(0)
    expect(fallbackIndex).toBeGreaterThan(apiIndex)
    for (const path of ['v1/auth/csrf', 'v1/auth/login', 'v1/auth/me', 'v1/auth/google/callback', 'v1/users/me', 'socket.io']) {
      expect(config.rewrites[apiIndex].destination.replace(':path*', path)).toBe('https://owlio-api.onrender.com/api/' + path)
    }
  })
  it('routes a slashless Study Spaces handshake to the Render Socket.IO listener', () => {
    const socketIndex = config.rewrites.findIndex(rule => rule.source === '/api/study-realtime')
    expect(socketIndex).toBeGreaterThanOrEqual(0)
    expect(socketIndex).toBeLessThan(config.rewrites.findIndex(rule => rule.source === '/api/:path*'))
    expect(config.rewrites[socketIndex].destination).toBe('https://owlio-api.onrender.com/api/socket.io')
  })
  it('prevents browser and CDN caching of private API responses', () => {
    expect(config.headers.find(rule => rule.source === '/api/:path*')?.headers).toEqual(expect.arrayContaining([
      { key: 'Cache-Control', value: 'private, no-store' },
      { key: 'CDN-Cache-Control', value: 'no-store' },
      { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
      { key: 'x-vercel-enable-rewrite-caching', value: '0' },
    ]))
  })
})
