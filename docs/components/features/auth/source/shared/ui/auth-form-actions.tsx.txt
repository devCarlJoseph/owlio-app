import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type AuthFormActionsProps = {
  label: string
  disabled?: boolean
}

export function AuthFormActions({ label, disabled }: AuthFormActionsProps) {
  return (
    <Button type="submit" disabled={disabled} className="h-11 w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
      {label}<ArrowRight aria-hidden="true" />
    </Button>
  )
}
