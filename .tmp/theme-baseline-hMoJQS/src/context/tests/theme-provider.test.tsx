import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../theme-provider'
import { useTheme } from '@/hooks/use-theme'
import { initializeTheme, setTheme } from '@/lib/theme'

let prefersDark = false
let mediaChanged: (() => void) | undefined
const removeMediaListener = vi.fn()

function Consumer() {
  const { theme, setTheme } = useTheme()
  return <>
    <output aria-label="Current theme">{theme}</output>
    <button onClick={() => setTheme('dark')}>Dark</button>
    <button onClick={() => setTheme('system')}>System</button>
  </>
}

beforeEach(() => {
  prefersDark = false
  mediaChanged = undefined
  vi.stubGlobal('matchMedia', () => ({
    matches: prefersDark,
    addEventListener: (_event: string, listener: () => void) => { mediaChanged = listener },
    removeEventListener: removeMediaListener,
  }))
  window.localStorage.clear()
  setTheme('system')
  removeMediaListener.mockClear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('global theme context', () => {
  it('restores the existing preference and synchronizes independent consumers', () => {
    window.localStorage.setItem('owlio.theme.v1', 'light')
    initializeTheme()
    render(<ThemeProvider><Consumer /><Consumer /></ThemeProvider>)
    expect(screen.getAllByLabelText('Current theme').map(node => node.textContent)).toEqual(['light', 'light'])
    fireEvent.click(screen.getAllByText('Dark')[0])
    expect(screen.getAllByLabelText('Current theme').map(node => node.textContent)).toEqual(['dark', 'dark'])
    expect(window.localStorage.getItem('owlio.theme.v1')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('follows system and cross-tab changes, then releases its listeners', () => {
    const { unmount } = render(<ThemeProvider><Consumer /></ThemeProvider>)
    act(() => { prefersDark = true; mediaChanged?.() })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'owlio.theme.v1', newValue: 'light' })))
    expect(screen.getByLabelText('Current theme').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    unmount()
    expect(removeMediaListener).toHaveBeenCalledWith('change', expect.any(Function))
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'owlio.theme.v1', newValue: 'dark' })))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('still updates consumers when preference storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage disabled') })
    render(<ThemeProvider><Consumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('Dark'))
    expect(screen.getByLabelText('Current theme').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
