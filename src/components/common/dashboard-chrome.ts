import { createContext, useContext, useEffect } from 'react'

export const DashboardChromeContext = createContext<((immersive: boolean) => void) | null>(null)

export function useImmersiveDashboard(active: boolean) {
  const setImmersive = useContext(DashboardChromeContext)
  useEffect(() => {
    if (!setImmersive || !active) return
    setImmersive(true)
    return () => setImmersive(false)
  }, [setImmersive, active])
}
