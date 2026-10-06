import { useState, type FormEvent } from "react"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function PasswordField({ id, label, placeholder }: { id: string; label: string; placeholder: string }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="space-y-2 [@media(max-height:760px)]:space-y-1.5">
      <Label className="text-sm font-medium" htmlFor={id}>{label}</Label>
      <div className="relative">
        <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoComplete="new-password"
          className="h-11 rounded-xl border-transparent bg-muted/70 pl-10 pr-12 shadow-none placeholder:text-muted-foreground/75 focus-visible:border-ring"
          id={id}
          minLength={8}
          name={id}
          placeholder={placeholder}
          required
          type={isVisible ? "text" : "password"}
        />
        <Button
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsVisible((visible) => !visible)}
          size="icon"
          type="button"
          variant="ghost"
        >
          {isVisible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
        </Button>
      </div>
    </div>
  )
}

export function PasswordResetForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <Card className="w-full border-0 bg-transparent py-0 shadow-none ring-0">
      <CardContent className="gap-0 px-0">
        <div className="mb-7 text-center [@media(max-height:760px)]:mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Password recovery</p>
          <h2 className="mt-3 font-serif text-4xl tracking-[-0.045em] text-foreground sm:text-[2.65rem] [@media(max-height:760px)]:mt-2 [@media(max-height:760px)]:text-3xl">
            Create a new password
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground [@media(max-height:760px)]:mt-2">
            Choose a new password for your Owlio account. Use at least 8 characters.
          </p>
        </div>

        <form className="space-y-5 [@media(max-height:760px)]:space-y-4" onSubmit={handleSubmit}>
          <PasswordField id="new-password" label="New password" placeholder="Enter a new password" />
          <PasswordField id="confirm-new-password" label="Confirm new password" placeholder="Enter it again" />
          <Button className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm" type="submit">
            Save new password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
