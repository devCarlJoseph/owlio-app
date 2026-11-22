import type { ReactNode } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthFeedback } from "./auth-feedback"

type AuthStatusPanelProps = {
  statusTitle: string
  status: ReactNode
  actionLabel: string
  actionTo: string
  preview?: boolean
}

export function AuthStatusPanel({ statusTitle, status, actionLabel, actionTo, preview = true }: AuthStatusPanelProps) {
  return (
    <div className="space-y-5">
      <AuthFeedback title={statusTitle} tone="success" preview={preview}>{status}</AuthFeedback>
      <Button render={<Link to={actionTo} />} className="h-11 w-full rounded-lg">
        {actionLabel}
      </Button>
    </div>
  )
}
