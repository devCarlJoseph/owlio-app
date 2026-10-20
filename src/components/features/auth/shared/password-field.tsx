import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError } from "@/components/ui/field"
import { authInputClassName } from "./auth-input-styles"

type PasswordFieldProps = {
  id: string
  label: string
  placeholder: string
  autoComplete: "current-password" | "new-password"
  registration: UseFormRegisterReturn
  error?: string
  description?: string
}

export function PasswordField({ id, label, placeholder, autoComplete, registration, error, description }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`
  const descriptionId = description ? `${id}-description` : undefined
  const describedBy = [error ? errorId : null, descriptionId].filter(Boolean).join(" ") || undefined

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${authInputClassName} pr-12`}
          {...registration}
        />
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
      {description && <p id={descriptionId} className="text-xs leading-5 text-muted-foreground">{description}</p>}
      <FieldError errors={[error ? { message: error } : undefined]} id={errorId} />
    </div>
  )
}
