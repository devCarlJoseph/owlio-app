import { useEffect, useState } from "react"

export function useNow(active: boolean, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    const tick = () => setNow(Date.now())
    const timer = window.setInterval(tick, intervalMs)
    document.addEventListener("visibilitychange", tick)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [active, intervalMs])

  return now
}
