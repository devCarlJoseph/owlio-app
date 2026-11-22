import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, getTheme, initializeTheme, setTheme, watchTheme } from './theme'

let systemDark = false
let systemChange: (() => void) | undefined
beforeEach(() => {
  localStorage.clear()
  systemDark = false
  vi.stubGlobal('matchMedia', () => ({ matches: systemDark,
    addEventListener: (_: string, callback: () => void) => { systemChange = callback }, removeEventListener: vi.fn() }))
  setTheme('system')
})
afterEach(() => { vi.unstubAllGlobals(); document.documentElement.classList.remove('dark') })

describe('appearance preference', () => {
  it('persists explicit preferences and restores them on startup', () => {
    setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem('owlio.theme.v1')).toBe('dark')
    localStorage.setItem('owlio.theme.v1', 'light')
    initializeTheme()
    expect(getTheme()).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
  it('follows system changes only while System is selected', () => {
    const stop = watchTheme()
    systemDark = true
    systemChange?.()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    setTheme('light')
    systemChange?.()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    stop()
  })
  it('keeps the preference usable when storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Unavailable') })
    setTheme('dark')
    applyTheme()
    expect(getTheme()).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
  it('updates other tabs and stops observing after cleanup', () => {
    const stop = watchTheme()
    window.dispatchEvent(new StorageEvent('storage', { key: 'owlio.theme.v1', newValue: 'dark' }))
    expect(getTheme()).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    stop()
    window.dispatchEvent(new StorageEvent('storage', { key: 'owlio.theme.v1', newValue: 'light' }))
    expect(getTheme()).toBe('dark')
  })
})
