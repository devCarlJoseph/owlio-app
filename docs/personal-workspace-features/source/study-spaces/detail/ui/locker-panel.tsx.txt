import { useState } from "react"
import { ArrowLeft, FileText, KeyRound, Lock, LockOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  isValidLockerCode,
  lockerPreviewNotice,
  ownLockerCodeNotice,
  type SampleLocker,
} from "./room-lockers"

type LockerPanelProps = {
  lockers: SampleLocker[]
  selectedId: string | null
  unlockedIds: string[]
  ownCode: string | null
  onSelect: (ownerId: string | null) => void
  onUnlock: (ownerId: string) => void
  onOwnCodeChange: (code: string | null) => void
  onOpenMine: () => void
  onClose: () => void
}

export function LockerPanel({
  lockers,
  selectedId,
  unlockedIds,
  ownCode,
  onSelect,
  onUnlock,
  onOwnCodeChange,
  onOpenMine,
  onClose,
}: LockerPanelProps) {
  const selected = lockers.find((locker) => locker.owner.id === selectedId) ?? null

  return (
    <div
      role="dialog"
      aria-label="Study room lockers"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-y-3 left-3 z-20 flex w-80 max-w-[92%] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg motion-safe:animate-in motion-safe:slide-in-from-left-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          {selected ? (
            <Button type="button" variant="ghost" size="icon-xs" aria-label="Back to all lockers" onClick={() => onSelect(null)}>
              <ArrowLeft aria-hidden="true" />
            </Button>
          ) : (
            <KeyRound className="size-4 text-blue-700" aria-hidden="true" />
          )}
          {selected ? `${selected.owner.name}'s locker` : "Lockers"}
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close lockers">
          <X aria-hidden="true" />
        </Button>
      </div>

      <p className="border-b border-slate-100 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">{lockerPreviewNotice}</p>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {selected ? (
          <LockerDetail
            key={selected.owner.id}
            locker={selected}
            unlocked={unlockedIds.includes(selected.owner.id)}
            onUnlock={() => onUnlock(selected.owner.id)}
          />
        ) : (
          <ul className="space-y-2" aria-label="Lockers in this room">
            <li className="rounded-lg border border-blue-200 bg-blue-50/60 p-2">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-white">
                  <LockOpen className="size-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">Your locker</p>
                  <p className="text-xs text-slate-600">{ownCode ? "Code set" : "No code set"}</p>
                </div>
                <Button type="button" size="xs" onClick={onOpenMine}>
                  Open
                </Button>
              </div>
              <OwnCodeForm key={ownCode ?? "none"} ownCode={ownCode} onChange={onOwnCodeChange} />
            </li>
            {lockers.map((locker) => {
              const open = unlockedIds.includes(locker.owner.id)
              return (
                <li key={locker.owner.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
                  <span
                    aria-hidden="true"
                    className="flex size-7 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: locker.owner.shirt }}
                  >
                    {open ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{locker.owner.name}&apos;s locker</p>
                    <p className="text-xs text-slate-500">Sample study-mate · {open ? "unlocked" : "locked"}</p>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    aria-label={open ? `View ${locker.owner.name}'s files` : `Enter code for ${locker.owner.name}'s locker`}
                    onClick={() => onSelect(locker.owner.id)}
                  >
                    {open ? "View files" : "Enter code"}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function OwnCodeForm({ ownCode, onChange }: { ownCode: string | null; onChange: (code: string | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (!editing) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <Button type="button" size="xs" variant="ghost" onClick={() => setEditing(true)}>
          {ownCode ? "Change code" : "Set a code"}
        </Button>
        {ownCode ? (
          <Button type="button" size="xs" variant="ghost" onClick={() => onChange(null)}>
            Remove code
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!isValidLockerCode(draft)) {
          setError("Use 4 to 6 digits.")
          return
        }
        onChange(draft)
        setEditing(false)
      }}
    >
      <Field data-invalid={error !== null}>
        <FieldLabel htmlFor="own-locker-code" className="text-xs text-slate-700">
          New locker code
        </FieldLabel>
        <Input
          id="own-locker-code"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={draft}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
          aria-invalid={error !== null}
          aria-describedby="own-locker-code-help"
          className="h-8 bg-white"
        />
        <FieldError>{error}</FieldError>
      </Field>
      <p id="own-locker-code-help" className="text-[11px] leading-4 text-slate-500">
        {ownLockerCodeNotice}
      </p>
      <div className="flex gap-2">
        <Button type="submit" size="xs">
          Save code
        </Button>
        <Button type="button" size="xs" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function LockerDetail({ locker, unlocked, onUnlock }: { locker: SampleLocker; unlocked: boolean; onUnlock: () => void }) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const name = locker.owner.name

  if (unlocked) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-600">
          Files {name} keeps for this room. These are sample entries with nothing to download.
        </p>
        <ul aria-label={`${name}'s files`} className="space-y-2">
          {locker.files.map((file) => (
            <li key={file.name} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2">
              <FileText className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {file.size} · {file.note} · sample
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (code === locker.code) {
          setError(null)
          onUnlock()
        } else {
          setError(`That code does not open ${name}'s locker.`)
        }
      }}
    >
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        <Lock className="size-4 shrink-0" aria-hidden="true" />
        Ask {name} for their locker code to see the files they keep here.
      </div>
      <Field data-invalid={error !== null}>
        <FieldLabel htmlFor="locker-code" className="text-slate-700">
          Locker code
        </FieldLabel>
        <Input
          id="locker-code"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          aria-invalid={error !== null}
          aria-describedby={error ? "locker-code-error" : "locker-code-hint"}
        />
        <FieldError id="locker-code-error">{error}</FieldError>
      </Field>
      <p id="locker-code-hint" className="text-xs leading-5 text-slate-500">
        Preview hint: {name} is a sample study-mate, so the demo code is <span className="font-mono font-semibold">{locker.code}</span>.
      </p>
      <Button type="submit" size="sm" className="w-full" disabled={code.length < 4}>
        <LockOpen aria-hidden="true" />
        Unlock locker
      </Button>
    </form>
  )
}
