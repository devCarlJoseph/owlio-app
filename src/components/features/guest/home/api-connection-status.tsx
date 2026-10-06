import { useEffect, useState } from "react"
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react"
import { getApiHealth } from "@/services/api/api-health.service"

type ConnectionState = "checking" | "connected" | "unavailable"

export default function ApiConnectionStatus() {
  const [state, setState] = useState<ConnectionState>("checking")

  useEffect(() => {
    let isCurrent = true

    getApiHealth()
      .then(() => {
        if (isCurrent) setState("connected")
      })
      .catch(() => {
        if (isCurrent) setState("unavailable")
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const status = {
    checking: {
      icon: <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />,
      label: "Checking API connection…",
      color: "text-slate-500",
    },
    connected: {
      icon: <CheckCircle2 aria-hidden="true" className="size-4" />,
      label: "API connected",
      color: "text-emerald-700",
    },
    unavailable: {
      icon: <CircleAlert aria-hidden="true" className="size-4" />,
      label: "API unavailable — start the backend on port 7000",
      color: "text-amber-700",
    },
  }[state]

  return (
    <p className={`mt-5 inline-flex items-center gap-2 text-xs ${status.color}`} role="status" aria-live="polite">
      {status.icon}
      {status.label}
    </p>
  )
}
