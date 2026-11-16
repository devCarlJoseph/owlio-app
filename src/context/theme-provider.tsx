import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { getTheme, setTheme, subscribeTheme, watchTheme } from '@/lib/theme'
import { ThemeContext } from './theme-context'

const getServerTheme = () => 'system' as const

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme)
  useEffect(watchTheme, [])
  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
