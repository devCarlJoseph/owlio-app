import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authInputClassName } from "./auth-input-styles"

type AuthPasswordInputProps = {
  id: string
  label: string
  placeholder: string
  autoComplete: "current-password" | "new-password"
  registration: UseFormRegisterReturn
  error?: string
}

export function AuthPasswordInput({ id, label, placeholder, autoComplete, registration, error }: AuthPasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <div className="relative">
        <Input id={id} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} required aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={`${authInputClassName} pr-12`} {...registration} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1.5 top-0 bottom-0 my-auto text-slate-500 active:!translate-y-0"
          aria-label={visible ? `Hide ${label.toLocaleLowerCase()}` : `Show ${label.toLocaleLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      <FieldError id={errorId} errors={[error ? { message: error } : undefined]} />
    </div>
  )
}
