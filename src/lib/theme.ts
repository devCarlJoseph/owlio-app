export type Theme = 'light' | 'dark' | 'system'
const key = 'owlio.theme.v1'
const eventName = 'owlio-theme-change'
let preference: Theme = 'system'

export function getTheme(): Theme {
  return preference
}

export function applyTheme() {
  const dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

export function initializeTheme() {
  try {
    const stored = window.localStorage.getItem(key)
    if (stored === 'light' || stored === 'dark' || stored === 'system') preference = stored
  } catch { /* Keep the in-memory preference when storage is unavailable. */ }
  applyTheme()
}

export function setTheme(theme: Theme) {
  preference = theme
  try { window.localStorage.setItem(key, theme) } catch { /* Theme changes still work without storage. */ }
  applyTheme()
  window.dispatchEvent(new Event(eventName))
}

export function subscribeTheme(notify: () => void) {
  window.addEventListener(eventName, notify)
  return () => window.removeEventListener(eventName, notify)
}

export function watchTheme() {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return
    preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system'
    applyTheme()
    window.dispatchEvent(new Event(eventName))
  }
  media.addEventListener('change', applyTheme)
  window.addEventListener('storage', onStorage)
  return () => {
    media.removeEventListener('change', applyTheme)
    window.removeEventListener('storage', onStorage)
  }
}
