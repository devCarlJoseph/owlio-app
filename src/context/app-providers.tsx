import type { ReactNode } from 'react'
import { AuthSessionProvider } from '@/components/features/auth/context/auth-session-provider'
import { ThemeProvider } from './theme-provider'

// Mount inside the router: the session provider observes route changes.
// Keep account/feature records in their existing, scoped providers.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </ThemeProvider>
  )
}
