# detail

This directory mirrors `src/components/features/personal-workspace/study-spaces/detail/`. For the current files, proposed component folders, and manual migration checks, use the [personal-workspace guide](../../README.md) and its [source index](../../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/personal-workspace/study-spaces/detail/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `character-dialog.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/character-dialog.tsx`

```tsx
import { useState } from "react"
import { Link } from "react-router"
import { UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { StudySpaceCharacter } from "../study-spaces-records"

const BODY_COLORS = [
  { value: "#2563eb", label: "Blue" },
  { value: "#16a34a", label: "Green" },
  { value: "#d97706", label: "Amber" },
  { value: "#dc2626", label: "Red" },
  { value: "#7c3aed", label: "Purple" },
  { value: "#0891b2", label: "Cyan" },
] as const

const ACCENT_COLORS = [
  { value: "#f59e0b", label: "Gold" },
  { value: "#f8fafc", label: "White" },
  { value: "#0f172a", label: "Slate" },
  { value: "#ec4899", label: "Pink" },
  { value: "#22d3ee", label: "Sky" },
  { value: "#a3e635", label: "Lime" },
] as const

type CharacterDraft = Pick<StudySpaceCharacter, "name" | "bodyColor" | "accentColor">

type CharacterDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  required: boolean
  initial: StudySpaceCharacter | null
  onSubmit: (draft: CharacterDraft) => void
  // "hall" is the study hall map character; "room" is the per-room character.
  context?: "room" | "hall"
}

export function CharacterDialog({
  open,
  onOpenChange,
  required,
  initial,
  onSubmit,
  context = "room",
}: CharacterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={required ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!required}>
        <CharacterForm
          key={`${open ? "open" : "closed"}-${initial?.createdAt ?? "new"}`}
          required={required}
          initial={initial}
          context={context}
          onCancel={required ? undefined : () => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function ColorSwatch({
  color,
  label,
  selected,
  onSelect,
}: {
  color: string
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={`size-8 rounded-full border-2 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        selected ? "scale-110 border-slate-900" : "border-transparent hover:scale-105"
      }`}
      style={{ backgroundColor: color }}
    />
  )
}

function CharacterForm({
  required,
  initial,
  context,
  onCancel,
  onSubmit,
}: {
  required: boolean
  initial: StudySpaceCharacter | null
  context: "room" | "hall"
  onCancel?: () => void
  onSubmit: (draft: CharacterDraft) => void
}) {
  const hall = context === "hall"
  const isNew = initial === null
  const title = hall
    ? isNew
      ? "Create your study hall character"
      : "Edit your study hall character"
    : required
      ? "Create your character"
      : "Edit your character"
  const submitLabel = hall ? (isNew ? "Start walking" : "Save character") : required ? "Enter room" : "Save character"
  const [name, setName] = useState(initial?.name ?? "")
  const [bodyColor, setBodyColor] = useState<string>(initial?.bodyColor ?? BODY_COLORS[0].value)
  const [accentColor, setAccentColor] = useState<string>(initial?.accentColor ?? ACCENT_COLORS[0].value)
  const [nameError, setNameError] = useState<string | null>(null)

  function handleSubmit() {
    const nextError = name.trim().length < 2 ? "Add a display name of at least 2 characters." : null

    setNameError(nextError)
    if (nextError) return

    onSubmit({ name: name.trim(), bodyColor, accentColor })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">{title}</DialogTitle>
        <DialogDescription className="text-slate-600">
          Your Owlio owl only appears in this browser preview. It is not shown to other students.
          {hall ? " Rooms use it by default, and you can still customize it per room." : ""}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="character-name" className="text-slate-700">
            Display name
          </FieldLabel>
          <Input
            id="character-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "character-name-error" : undefined}
            placeholder="Alex"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="character-name-error">{nameError}</FieldError>
        </Field>

        <div role="radiogroup" aria-label="Owl feather color" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Feather color</span>
          <div className="flex flex-wrap gap-2">
            {BODY_COLORS.map((color) => (
              <ColorSwatch
                key={color.value}
                color={color.value}
                label={color.label}
                selected={bodyColor === color.value}
                onSelect={() => setBodyColor(color.value)}
              />
            ))}
          </div>
        </div>

        <div role="radiogroup" aria-label="Owl ear tuft color" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Ear tuft color</span>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <ColorSwatch
                key={color.value}
                color={color.value}
                label={color.label}
                selected={accentColor === color.value}
                onSelect={() => setAccentColor(color.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        {required ? (
          <Button nativeButton={false} variant="outline" render={<Link to="/students/study-spaces" />}>
            Back to spaces
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSubmit}>
          <UserRound aria-hidden="true" />
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  )
}
```

### `character-figure.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/character-figure.tsx`

```tsx
import { useMemo, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { Color, type Group } from "three"

export type FigureMode = "walk" | "idle" | "seated" | "nap"

type CharacterFigureProps = {
  bodyColor: string
  accentColor: string
  // Optional third tone; the owl uses it to tint its belly feathers.
  skinColor?: string
  getMode: () => FigureMode
  // Desk work: the wings rest forward and the head tips toward the table.
  typing?: boolean
  phaseOffset?: number
  reducedMotion: boolean
}

const SEATED_RISE = 0.36
const BEAK = "#f59e0b"
const FEET = "#f5a524"
const IRIS = "#f6b73c"

function ease(current: number, target: number, delta: number, speed = 14) {
  return current + (target - current) * Math.min(1, delta * speed)
}

// Rounded cartoon Owlio owl: egg body, big amber eyes in a heart-shaped face, ear tufts,
// soft wings that flap while walking, three-toed feet, and a curled-up nap pose.
export function CharacterFigure({
  bodyColor,
  accentColor,
  skinColor,
  getMode,
  typing = false,
  phaseOffset = 0,
  reducedMotion,
}: CharacterFigureProps) {
  const root = useRef<Group>(null)
  const footL = useRef<Group>(null)
  const footR = useRef<Group>(null)
  const wingL = useRef<Group>(null)
  const wingR = useRef<Group>(null)
  const head = useRef<Group>(null)
  const eyes = useRef<Group>(null)
  const phase = useRef(phaseOffset)

  const tones = useMemo(() => {
    const base = new Color(bodyColor)
    return {
      wing: `#${base.clone().multiplyScalar(0.8).getHexString()}`,
      spot: `#${base.clone().multiplyScalar(0.65).getHexString()}`,
      belly: skinColor ? `#${new Color(skinColor).lerp(new Color("#fff6e3"), 0.6).getHexString()}` : "#fdf0d5",
      face: `#${base.clone().lerp(new Color("#ffffff"), 0.75).getHexString()}`,
    }
  }, [bodyColor, skinColor])

  useFrame(({ clock }, delta) => {
    const nodes = [root, footL, footR, wingL, wingR, head, eyes].map((ref) => ref.current)
    if (nodes.some((node) => node === null)) return
    const [rootNode, left, right, wingLeft, wingRight, headNode, eyeNode] = nodes as Group[]
    const mode = getMode()
    const time = clock.elapsedTime + phaseOffset

    let footTarget = 0
    let footTargetR = 0
    let wingOut = 0.06
    let wingForward = 0
    let bob = 0
    let lean = 0
    let rise = 0
    let tiltX = 0
    let shiftZ = 0
    let headX = 0
    let headY = 0
    let eyeOpen = 1

    if (mode === "walk") {
      // Walking answers a click or key press, so reduced motion keeps a gentler waddle instead of none.
      const amplitude = reducedMotion ? 0.45 : 1
      phase.current += delta * 10
      const swing = Math.sin(phase.current) * amplitude
      footTarget = swing * 0.7
      footTargetR = -swing * 0.7
      wingOut = 0.2 + Math.abs(swing) * 0.4
      lean = reducedMotion ? 0 : swing * 0.08
      bob = reducedMotion ? 0 : Math.abs(Math.cos(phase.current)) * 0.06
    } else if (mode === "seated") {
      rise = SEATED_RISE
      footTarget = -1.2
      footTargetR = -1.2
      wingForward = typing ? -0.8 + (reducedMotion ? 0 : Math.sin(time * 9) * 0.06) : -0.15
      headX = typing ? 0.25 : 0
      if (!reducedMotion) headY = Math.sin(time * 0.45) * 0.4
    } else if (mode === "nap") {
      // Lies on its back on the mat with eyes shut and slow breathing.
      tiltX = -Math.PI / 2
      rise = 0.5
      shiftZ = 0.58
      footTarget = 0.6
      footTargetR = 0.6
      wingOut = 0.35
      eyeOpen = 0.12
      bob = reducedMotion ? 0 : Math.sin(time * 1.2) * 0.015
    } else if (!reducedMotion) {
      bob = Math.sin(time * 1.6) * 0.012
      headY = Math.sin(time * 0.6) * 0.3
    }

    if (mode !== "nap" && !reducedMotion && time % 4.3 < 0.13) eyeOpen = 0.12

    left.rotation.x = ease(left.rotation.x, footTarget, delta)
    right.rotation.x = ease(right.rotation.x, footTargetR, delta)
    wingLeft.rotation.z = ease(wingLeft.rotation.z, -wingOut, delta)
    wingRight.rotation.z = ease(wingRight.rotation.z, wingOut, delta)
    wingLeft.rotation.x = ease(wingLeft.rotation.x, wingForward, delta)
    wingRight.rotation.x = ease(wingRight.rotation.x, wingForward, delta)
    headNode.rotation.x = ease(headNode.rotation.x, headX, delta)
    headNode.rotation.y = ease(headNode.rotation.y, headY, delta)
    rootNode.rotation.z = ease(rootNode.rotation.z, lean, delta)
    rootNode.rotation.x = ease(rootNode.rotation.x, tiltX, delta, 6)
    rootNode.position.y = ease(rootNode.position.y, bob + rise, delta, 8)
    rootNode.position.z = ease(rootNode.position.z, shiftZ, delta, 6)
    eyeNode.scale.y = ease(eyeNode.scale.y, eyeOpen, delta, 30)
  })

  return (
    <group ref={root}>
      {[
        [footL, -0.14],
        [footR, 0.14],
      ].map(([ref, x]) => (
        <group key={x as number} ref={ref as RefObject<Group | null>} position={[x as number, 0.1, 0.08]}>
          {[-0.45, 0, 0.45].map((angle) => (
            <mesh key={angle} position={[Math.sin(angle) * 0.06, -0.07, 0.06]} rotation={[Math.PI / 2, 0, -angle]} castShadow>
              <capsuleGeometry args={[0.028, 0.1, 4, 8]} />
              <meshStandardMaterial color={FEET} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      <mesh position={[0, 0.56, 0]} scale={[1, 1.12, 0.92]} castShadow>
        <sphereGeometry args={[0.4, 32, 24]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.5, 0.17]} scale={[1, 1.18, 0.55]}>
        <sphereGeometry args={[0.3, 28, 20]} />
        <meshStandardMaterial color={tones.belly} roughness={0.9} />
      </mesh>
      {[
        [-0.08, 0.6],
        [0.08, 0.6],
        [0, 0.48],
        [-0.12, 0.42],
        [0.12, 0.42],
        [0, 0.34],
      ].map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.33 - Math.abs(x) * 0.25]} scale={[1.4, 0.7, 0.4]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshStandardMaterial color={tones.spot} />
        </mesh>
      ))}
      <mesh position={[0, 0.24, -0.34]} rotation={[-1.1, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.26, 12]} />
        <meshStandardMaterial color={tones.wing} />
      </mesh>

      {[
        [wingL, -1],
        [wingR, 1],
      ].map(([ref, side]) => (
        <group key={side as number} ref={ref as RefObject<Group | null>} position={[(side as number) * 0.36, 0.84, -0.02]}>
          <mesh position={[(side as number) * 0.03, -0.27, 0]} scale={[0.32, 0.95, 0.72]} castShadow>
            <sphereGeometry args={[0.3, 20, 16]} />
            <meshStandardMaterial color={tones.wing} roughness={0.8} />
          </mesh>
          <mesh position={[(side as number) * 0.07, -0.42, 0.05]} scale={[0.3, 0.5, 0.5]}>
            <sphereGeometry args={[0.22, 14, 10]} />
            <meshStandardMaterial color={tones.spot} roughness={0.8} />
          </mesh>
        </group>
      ))}

      <group ref={head} position={[0, 1.12, 0]}>
        <mesh scale={[1.08, 0.95, 0.95]} castShadow>
          <sphereGeometry args={[0.37, 32, 24]} />
          <meshStandardMaterial color={bodyColor} roughness={0.75} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.13, 0.02, 0.27]} scale={[1, 1.05, 0.38]}>
            <sphereGeometry args={[0.175, 24, 16]} />
            <meshStandardMaterial color={tones.face} roughness={0.9} />
          </mesh>
        ))}
        <group ref={eyes} position={[0, 0.03, 0]}>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.13, 0, 0.31]}>
              <mesh>
                <sphereGeometry args={[0.105, 24, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.06]} scale={[1, 1, 0.6]}>
                <sphereGeometry args={[0.072, 20, 14]} />
                <meshStandardMaterial color={IRIS} roughness={0.35} />
              </mesh>
              <mesh position={[0, 0, 0.09]} scale={[1, 1, 0.6]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                <meshStandardMaterial color="#111827" roughness={0.2} />
              </mesh>
              <mesh position={[side * -0.02 + 0.018, 0.025, 0.12]}>
                <sphereGeometry args={[0.016, 8, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
              </mesh>
            </group>
          ))}
        </group>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.13, 0.15, 0.36]} rotation={[0, 0, side * -0.25]} scale={[1, 0.35, 0.4]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshStandardMaterial color={tones.wing} />
          </mesh>
        ))}
        <mesh position={[0, -0.08, 0.38]} rotation={[Math.PI * 0.82, 0, 0]} castShadow>
          <coneGeometry args={[0.055, 0.15, 12]} />
          <meshStandardMaterial color={BEAK} roughness={0.4} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.25, 0.32, 0]} rotation={[0, 0, side * -0.5]} castShadow>
            <coneGeometry args={[0.085, 0.24, 12]} />
            <meshStandardMaterial color={accentColor} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
```

### `drawer-panel.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/drawer-panel.tsx`

```tsx
import { useEffect, useRef, useState } from "react"
import { Download, FileText, Pencil, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  addDrawerFile,
  drawerAcceptAttr,
  drawerMaxFiles,
  drawerNotice,
  formatFileSize,
  getDrawerFileBlob,
  isDrawerStorageAvailable,
  listDrawerFiles,
  removeDrawerFile,
  renameDrawerFile,
  validateDrawerFile,
  type DrawerFileMeta,
} from "./drawer-storage"

type DrawerPanelProps = {
  spaceId: string
  onClose: () => void
}

export function DrawerPanel({ spaceId, onClose }: DrawerPanelProps) {
  const available = isDrawerStorageAvailable()
  const [files, setFiles] = useState<DrawerFileMeta[]>([])
  const [loading, setLoading] = useState(available)
  const [error, setError] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!available) return
    let active = true
    listDrawerFiles(spaceId)
      .then((list) => active && setFiles(list))
      .catch(() => active && setError("Your drawer could not be read in this browser."))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [available, spaceId])

  async function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list)
    let count = files.length
    const added: DrawerFileMeta[] = []
    let message: string | null = null

    for (const file of incoming) {
      const problem = validateDrawerFile(file, count)
      if (problem) {
        message = problem
        continue
      }
      try {
        added.push(await addDrawerFile(spaceId, file))
        count += 1
      } catch {
        message = `"${file.name}" could not be saved. Browser storage may be full.`
      }
    }

    if (added.length > 0) setFiles((current) => [...added, ...current])
    setError(message)
  }

  async function handleRemove(file: DrawerFileMeta) {
    try {
      await removeDrawerFile(file.id)
      setFiles((current) => current.filter((entry) => entry.id !== file.id))
    } catch {
      setError(`"${file.name}" could not be removed.`)
    }
  }

  async function handleRename(file: DrawerFileMeta) {
    const name = renameDraft.trim()
    setRenamingId(null)
    if (name.length === 0 || name === file.name) return
    try {
      await renameDrawerFile(file.id, name)
      setFiles((current) => current.map((entry) => (entry.id === file.id ? { ...entry, name } : entry)))
    } catch {
      setError(`"${file.name}" could not be renamed.`)
    }
  }

  async function handleOpen(file: DrawerFileMeta) {
    const blob = await getDrawerFileBlob(file.id).catch(() => null)
    if (!blob) {
      setError(`"${file.name}" could not be opened.`)
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = file.name
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  return (
    <div
      role="dialog"
      aria-label="My drawer"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-y-3 left-3 z-20 flex w-80 max-w-[92%] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg motion-safe:animate-in motion-safe:slide-in-from-left-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <FileText className="size-4 text-emerald-800" aria-hidden="true" />
          My drawer
          <span className="text-xs font-normal text-slate-500">
            {files.length}/{drawerMaxFiles}
          </span>
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close my drawer">
          <X aria-hidden="true" />
        </Button>
      </div>

      <p className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
        {drawerNotice} This is your locker; study-mates&apos; lockers open only with their code.
      </p>

      {available ? (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void addFiles(event.dataTransfer.files)
          }}
          className={`m-3 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs ${
            dragging ? "border-emerald-600 bg-emerald-50" : "border-slate-300"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={drawerAcceptAttr}
            className="sr-only"
            aria-label="Choose files for my drawer"
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files)
              event.target.value = ""
            }}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload aria-hidden="true" />
            Add files
          </Button>
          <span className="text-slate-500">or drop here · pdf, images, txt, docx · 10 MB max</span>
        </div>
      ) : (
        <p className="m-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This browser cannot store files locally, so the drawer is unavailable.
        </p>
      )}

      {error ? (
        <p role="alert" className="mx-3 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <ul aria-label="Files in my drawer" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {loading ? <li className="text-xs text-slate-500">Opening your drawer…</li> : null}
        {!loading && available && files.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
            Your drawer is empty. Add the files you work on in this space.
          </li>
        ) : null}
        {files.map((file) => (
          <li key={file.id} className="rounded-lg border border-slate-200 p-2">
            {renamingId === file.id ? (
              <form
                className="flex items-center gap-1"
                onSubmit={(event) => {
                  event.preventDefault()
                  void handleRename(file)
                }}
              >
                <Input
                  value={renameDraft}
                  onChange={(event) => setRenameDraft(event.target.value)}
                  aria-label={`New name for ${file.name}`}
                  maxLength={120}
                  autoFocus
                />
                <Button type="submit" size="xs">
                  Save
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {formatFileSize(file.size)} · added {new Date(file.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon-xs" aria-label={`Download ${file.name}`} onClick={() => void handleOpen(file)}>
                  <Download aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Rename ${file.name}`}
                  onClick={() => {
                    setRenamingId(file.id)
                    setRenameDraft(file.name)
                  }}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${file.name}`} onClick={() => void handleRemove(file)}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### `drawer-storage.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/drawer-storage.ts`

```ts
export type DrawerFileMeta = {
  id: string
  spaceId: string
  name: string
  type: string
  size: number
  addedAt: string
}

type DrawerFileRecord = DrawerFileMeta & { blob: Blob }

export const drawerNotice =
  "Files stay on this device. They are not uploaded, shared with other students, or sent to a service."

export const drawerMaxFileBytes = 10 * 1024 * 1024
export const drawerMaxFiles = 25
export const drawerAllowedExtensions = ["pdf", "png", "jpg", "jpeg", "gif", "webp", "txt", "docx"]
export const drawerAcceptAttr = drawerAllowedExtensions.map((extension) => `.${extension}`).join(",")

const DB_NAME = "owlio-study-space-drawer"
const STORE = "files"

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateDrawerFile(file: { name: string; size: number }, existingCount: number): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!drawerAllowedExtensions.includes(extension)) {
    return `"${file.name}" is not supported. Use pdf, images, txt, or docx files.`
  }
  if (file.size > drawerMaxFileBytes) return `"${file.name}" is larger than 10 MB.`
  if (existingCount >= drawerMaxFiles) return `Your drawer is full (${drawerMaxFiles} files).`
  return null
}

export function isDrawerStorageAvailable(): boolean {
  return typeof indexedDB !== "undefined"
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "id" })
      store.createIndex("spaceId", "spaceId")
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode)
        const request = action(transaction.objectStore(STORE))
        transaction.oncomplete = () => {
          db.close()
          resolve(request.result)
        }
        transaction.onerror = () => {
          db.close()
          reject(transaction.error)
        }
      })
  )
}

export async function listDrawerFiles(spaceId: string): Promise<DrawerFileMeta[]> {
  const records = await run<DrawerFileRecord[]>("readonly", (store) => store.index("spaceId").getAll(spaceId))
  return records
    .map((record) => ({
      id: record.id,
      spaceId: record.spaceId,
      name: record.name,
      type: record.type,
      size: record.size,
      addedAt: record.addedAt,
    }))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
}

export async function addDrawerFile(spaceId: string, file: File): Promise<DrawerFileMeta> {
  const meta: DrawerFileMeta = {
    id: crypto.randomUUID(),
    spaceId,
    name: file.name,
    type: file.type,
    size: file.size,
    addedAt: new Date().toISOString(),
  }
  await run("readwrite", (store) => store.put({ ...meta, blob: file } satisfies DrawerFileRecord))
  return meta
}

export async function renameDrawerFile(id: string, name: string): Promise<void> {
  const record = await run<DrawerFileRecord | undefined>("readonly", (store) => store.get(id))
  if (!record) return
  await run("readwrite", (store) => store.put({ ...record, name }))
}

export async function removeDrawerFile(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id))
}

export async function getDrawerFileBlob(id: string): Promise<Blob | null> {
  const record = await run<DrawerFileRecord | undefined>("readonly", (store) => store.get(id))
  return record?.blob ?? null
}
```

### `focus-music-panel.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/focus-music-panel.tsx`

```tsx
import { Music, Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { focusMusicTracks, isTrackPlayable, type MusicTrack } from "./focus-music"

export type MusicPlayback = {
  trackId: string | null
  playing: boolean
  volume: number
  elapsedSeconds: number
  error: string | null
}

type FocusMusicPanelProps = {
  playback: MusicPlayback
  onPlay: (track: MusicTrack) => void
  onPause: () => void
  onPrevious: () => void
  onNext: () => void
  onVolumeChange: (volume: number) => void
  onClose: () => void
}

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function FocusMusicPanel({
  playback,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onVolumeChange,
  onClose,
}: FocusMusicPanelProps) {
  const activeTrack = focusMusicTracks.find((track) => track.id === playback.trackId) ?? null
  const playableTracks = focusMusicTracks.filter(isTrackPlayable)

  return (
    <div
      role="dialog"
      aria-label="Focus music"
      className="absolute right-3 top-3 z-20 flex w-72 max-w-[90%] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Music className="size-4 text-emerald-800" aria-hidden="true" />
          Focus music
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close focus music">
          <X aria-hidden="true" />
        </Button>
      </div>

      <ul className="max-h-56 overflow-y-auto p-2" aria-label="Music tracks">
        {focusMusicTracks.map((track) => {
          const playable = isTrackPlayable(track)
          const active = playback.trackId === track.id
          return (
            <li key={track.id}>
              <button
                type="button"
                disabled={!playable}
                onClick={() => onPlay(track)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                  active ? "bg-emerald-50" : "hover:bg-slate-50"
                } ${playable ? "" : "opacity-60"}`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
                    active ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {active && playback.playing ? (
                    <Pause className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="size-3.5" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800">{track.title}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {track.category}
                    {playable ? "" : " · needs an audio file"}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-1 border-t border-slate-100 px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onPrevious}
          disabled={playableTracks.length < 2}
          aria-label="Previous track"
        >
          <SkipBack aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!activeTrack}
          aria-label={playback.playing ? "Pause" : "Play"}
          onClick={() => (playback.playing ? onPause() : activeTrack && onPlay(activeTrack))}
        >
          {playback.playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onNext}
          disabled={playableTracks.length < 2}
          aria-label="Next track"
        >
          <SkipForward aria-hidden="true" />
        </Button>
        <span className="ml-1 flex-1 truncate text-xs text-slate-500" aria-live="polite">
          {activeTrack
            ? `${activeTrack.title} · ${formatElapsed(playback.elapsedSeconds)}`
            : "Nothing playing"}
        </span>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
        <Volume2 className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
        <label htmlFor="music-volume" className="sr-only">
          Volume
        </label>
        <input
          id="music-volume"
          type="range"
          min={0}
          max={100}
          value={Math.round(playback.volume * 100)}
          onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
          className="h-1.5 w-full accent-emerald-700"
        />
      </div>

      {playback.error ? (
        <p role="alert" className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {playback.error}
        </p>
      ) : null}
    </div>
  )
}
```

### `focus-music.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/focus-music.ts`

```ts
export type GeneratedPreset = "rain" | "meadow" | "drone" | "lofi" | "piano"

export type MusicTrackSource =
  | { type: "generated"; preset: GeneratedPreset }
  | { type: "file"; src: string | null }

export type MusicTrack = {
  id: string
  title: string
  category: string
  source: MusicTrackSource
}

// File tracks need a licensed audio asset or URL before they can play.
export const focusMusicTracks: MusicTrack[] = [
  {
    id: "lofi-loop",
    title: "Lo-fi Study Loop",
    category: "Lo-fi beats (generated)",
    source: { type: "generated", preset: "lofi" },
  },
  {
    id: "piano-arpeggio",
    title: "Quiet Piano Arpeggio",
    category: "Soft piano (generated)",
    source: { type: "generated", preset: "piano" },
  },
  {
    id: "gentle-rain",
    title: "Gentle Rain",
    category: "Rain & ambience",
    source: { type: "generated", preset: "rain" },
  },
  {
    id: "forest-breeze",
    title: "Forest Breeze",
    category: "Nature sounds",
    source: { type: "generated", preset: "meadow" },
  },
  {
    id: "deep-focus-pad",
    title: "Deep Focus Pad",
    category: "Deep-focus ambient",
    source: { type: "generated", preset: "drone" },
  },
  {
    id: "lofi-beats",
    title: "Lo-fi Study Beats",
    category: "Lo-fi beats",
    source: { type: "file", src: null },
  },
  {
    id: "soft-piano",
    title: "Soft Piano",
    category: "Soft piano",
    source: { type: "file", src: null },
  },
]

export function isTrackPlayable(track: MusicTrack): boolean {
  return track.source.type === "generated" || (track.source.type === "file" && Boolean(track.source.src))
}

type StopHandle = () => void

// Real audio playback: generated presets synthesize ambience through the Web Audio API,
// file tracks play through an <audio> element routed into the same volume control.
export class FocusMusicEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private stops: StopHandle[] = []
  private element: HTMLAudioElement | null = null

  get supported(): boolean {
    return typeof window !== "undefined" && typeof window.AudioContext !== "undefined"
  }

  private ensureContext(): { ctx: AudioContext; master: GainNode } {
    if (!this.ctx || !this.master) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.connect(this.ctx.destination)
    }
    return { ctx: this.ctx, master: this.master }
  }

  play(track: MusicTrack): void {
    this.stop()
    const { ctx, master } = this.ensureContext()
    if (ctx.state === "suspended") void ctx.resume()

    if (track.source.type === "file") {
      if (!track.source.src) return
      const element = new Audio(track.source.src)
      element.loop = true
      const node = ctx.createMediaElementSource(element)
      node.connect(master)
      void element.play()
      this.element = element
      this.stops.push(() => {
        element.pause()
        node.disconnect()
      })
      return
    }

    this.stops.push(this.buildPreset(ctx, master, track.source.preset))
  }

  private buildPreset(ctx: AudioContext, master: GainNode, preset: GeneratedPreset): StopHandle {
    if (preset === "lofi" || preset === "piano") return this.buildMelodic(ctx, master, preset)
    const noise = this.createNoiseSource(ctx)

    if (preset === "drone") {
      const lowpass = ctx.createBiquadFilter()
      lowpass.type = "lowpass"
      lowpass.frequency.value = 320
      const padGain = ctx.createGain()
      padGain.gain.value = 0.16

      const oscA = ctx.createOscillator()
      oscA.type = "sine"
      oscA.frequency.value = 110
      const oscB = ctx.createOscillator()
      oscB.type = "sine"
      oscB.frequency.value = 165
      oscB.detune.value = 4

      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.08
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.05
      lfo.connect(lfoGain)
      lfoGain.connect(padGain.gain)

      oscA.connect(lowpass)
      oscB.connect(lowpass)
      lowpass.connect(padGain)
      padGain.connect(master)
      oscA.start()
      oscB.start()
      lfo.start()

      return () => {
        ;[oscA, oscB, lfo].forEach((osc) => osc.stop())
        lowpass.disconnect()
        padGain.disconnect()
        lfoGain.disconnect()
      }
    }

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = preset === "rain" ? 1400 : 520
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = preset === "rain" ? 0.22 : 0.14

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(master)
    noise.start()

    if (preset === "meadow") {
      const shimmer = this.createNoiseSource(ctx)
      const band = ctx.createBiquadFilter()
      band.type = "bandpass"
      band.frequency.value = 2400
      band.Q.value = 0.6
      const shimmerGain = ctx.createGain()
      shimmerGain.gain.value = 0.05
      shimmer.connect(band)
      band.connect(shimmerGain)
      shimmerGain.connect(master)
      shimmer.start()

      return () => {
        noise.stop()
        shimmer.stop()
        filter.disconnect()
        noiseGain.disconnect()
        band.disconnect()
        shimmerGain.disconnect()
      }
    }

    return () => {
      noise.stop()
      filter.disconnect()
      noiseGain.disconnect()
    }
  }

  // Chord loops are scheduled a short time ahead, so nothing needs an audio file.
  private buildMelodic(ctx: AudioContext, master: GainNode, preset: "lofi" | "piano"): StopHandle {
    const lofi = preset === "lofi"
    const bus = ctx.createGain()
    bus.gain.value = lofi ? 0.55 : 0.6
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = "lowpass"
    lowpass.frequency.value = lofi ? 1700 : 3600
    bus.connect(lowpass)
    lowpass.connect(master)

    const beat = 60 / (lofi ? 72 : 58)
    const chords = [
      [57, 60, 64, 67],
      [53, 57, 60, 64],
      [48, 55, 60, 64],
      [55, 59, 62, 65],
    ]
    const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

    const note = (midi: number, when: number, length: number, type: OscillatorType, gain: number) => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      osc.type = type
      osc.frequency.value = frequency(midi)
      env.gain.setValueAtTime(0.0001, when)
      env.gain.linearRampToValueAtTime(gain, when + 0.02)
      env.gain.exponentialRampToValueAtTime(0.0001, when + length)
      osc.connect(env)
      env.connect(bus)
      osc.start(when)
      osc.stop(when + length + 0.05)
    }

    const kick = (when: number) => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      osc.frequency.setValueAtTime(130, when)
      osc.frequency.exponentialRampToValueAtTime(42, when + 0.16)
      env.gain.setValueAtTime(0.5, when)
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.22)
      osc.connect(env)
      env.connect(bus)
      osc.start(when)
      osc.stop(when + 0.25)
    }

    const hat = (when: number) => {
      const source = this.createNoiseSource(ctx)
      const highpass = ctx.createBiquadFilter()
      highpass.type = "highpass"
      highpass.frequency.value = 6000
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.06, when)
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.05)
      source.connect(highpass)
      highpass.connect(env)
      env.connect(bus)
      source.start(when)
      source.stop(when + 0.08)
    }

    let step = 0
    let nextTime = ctx.currentTime + 0.1

    const schedule = () => {
      while (nextTime < ctx.currentTime + 0.5) {
        const chord = chords[Math.floor(step / 8) % chords.length]
        const eighth = step % 8

        if (lofi) {
          if (eighth === 0) {
            chord.forEach((midi) => note(midi, nextTime, beat * 3.6, "triangle", 0.07))
            note(chord[0] - 24, nextTime, beat * 1.8, "sine", 0.2)
          }
          if (eighth === 0 || eighth === 5) kick(nextTime)
          if (eighth % 2 === 1) hat(nextTime)
          if (Math.random() < 0.35) note(chord[Math.floor(Math.random() * 4)] + 12, nextTime, beat * 1.2, "sine", 0.07)
        } else {
          const midi = chord[eighth % 4] + (eighth >= 4 ? 12 : 0)
          note(midi, nextTime, beat * 2.2, "triangle", 0.11)
          note(midi + 12, nextTime, beat * 1.4, "sine", 0.035)
          if (eighth === 0) note(chord[0] - 12, nextTime, beat * 3, "sine", 0.12)
        }

        nextTime += beat / 2
        step += 1
      }
    }

    schedule()
    const timer = window.setInterval(schedule, 150)

    return () => {
      window.clearInterval(timer)
      bus.disconnect()
      lowpass.disconnect()
    }
  }

  private createNoiseSource(ctx: AudioContext): AudioBufferSourceNode {
    const length = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < length; i += 1) {
      // Brown-ish noise keeps rain and nature presets soft instead of harsh.
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.2
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    return source
  }

  pauseFilePlayback(): void {
    this.element?.pause()
  }

  resumeFilePlayback(): void {
    if (this.element) void this.element.play()
  }

  setVolume(volume: number): void {
    if (this.master) this.master.gain.value = volume
  }

  stop(): void {
    this.stops.forEach((stop) => stop())
    this.stops = []
    this.element = null
  }
}
```

### `locker-panel.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/locker-panel.tsx`

```tsx
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
```

### `nap-banner.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/nap-banner.tsx`

```tsx
import { useEffect, useState } from "react"
import { BedDouble, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const REMINDERS = [0, 10, 20, 30]

function format(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
}

// Shown while the student rests on a nap mat. Mounting starts the rest timer.
export function NapBanner({ onWake }: { onWake: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [reminder, setReminder] = useState(20)

  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((current) => current + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const due = reminder > 0 && elapsed >= reminder * 60

  return (
    <div
      role="region"
      aria-label="Nap status"
      className={`absolute left-1/2 top-3 z-20 flex max-w-[94%] -translate-x-1/2 flex-wrap items-center gap-3 rounded-2xl border px-4 py-2 text-sm shadow-lg ${
        due ? "border-amber-300 bg-amber-50 text-amber-900" : "border-violet-200 bg-violet-50/95 text-violet-900"
      }`}
    >
      <BedDouble className="size-4 shrink-0" aria-hidden="true" />
      <p className="font-medium">
        You&apos;re napping · <span className="tabular-nums">{format(elapsed)}</span>
      </p>
      <p role="status" className="text-xs">
        {due ? "Rest time is up." : "Your owl shows a napping status in this room preview only."}
      </p>
      <label className="flex items-center gap-1 text-xs">
        Wake reminder
        <select
          value={reminder}
          onChange={(event) => setReminder(Number(event.target.value))}
          className="rounded-md border border-violet-200 bg-white px-1.5 py-0.5 text-xs text-slate-800"
        >
          {REMINDERS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes === 0 ? "Off" : `${minutes} min`}
            </option>
          ))}
        </select>
      </label>
      <Button type="button" size="sm" onClick={onWake} className="bg-violet-700 text-white hover:bg-violet-600">
        <Sun aria-hidden="true" />
        Wake up
      </Button>
    </div>
  )
}
```

### `pomodoro-chip.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/pomodoro-chip.tsx`

```tsx
import { Pause, Play, RotateCcw, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatRemaining, type PomodoroMode, type PomodoroStatus, POMODORO_DURATIONS } from "./use-pomodoro"

type PomodoroControls = {
  mode: PomodoroMode
  status: PomodoroStatus
  remainingMs: number
  start: (mode?: PomodoroMode) => void
  pause: () => void
  resume: () => void
  reset: () => void
  selectMode: (mode: PomodoroMode) => void
}

export function PomodoroChip({ timer, onOpen }: { timer: PomodoroControls; onOpen: () => void }) {
  const label =
    timer.status === "idle"
      ? "Focus timer"
      : `${timer.mode === "focus" ? "Focus" : "Break"} ${formatRemaining(timer.remainingMs)}`

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onOpen}
      aria-label={`${label}. Open focus timer`}
      className="rounded-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      <Timer aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
    </Button>
  )
}

export function PomodoroPanel({ timer, onClose }: { timer: PomodoroControls; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="Focus timer"
      className="absolute bottom-16 left-3 z-20 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Timer className="size-4 text-emerald-800" aria-hidden="true" />
          Focus timer
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close focus timer">
          ×
        </Button>
      </div>

      <div role="group" aria-label="Timer mode" className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(["focus", "break"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={timer.mode === mode}
            disabled={timer.status === "running"}
            onClick={() => timer.selectMode(mode)}
            className={`rounded-md px-2 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-700 ${
              timer.mode === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {`${mode === "focus" ? "Focus" : "Break"} · ${POMODORO_DURATIONS[mode] / 60_000}m`}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        {formatRemaining(timer.remainingMs)}
      </p>
      <p className="mt-1 text-center text-xs text-slate-500" role="status">
        {timer.status === "finished"
          ? timer.mode === "focus"
            ? "Focus session complete — take a break."
            : "Break over — ready for another session?"
          : timer.status === "paused"
            ? "Paused"
            : timer.status === "running"
              ? timer.mode === "focus"
                ? "Focusing…"
                : "On a break…"
              : "Ready when you are."}
      </p>

      <div className="mt-3 flex items-center justify-center gap-2">
        {timer.status === "running" ? (
          <Button type="button" size="sm" variant="outline" onClick={timer.pause}>
            <Pause aria-hidden="true" />
            Pause
          </Button>
        ) : timer.status === "paused" ? (
          <Button type="button" size="sm" className="bg-emerald-800 text-white hover:bg-emerald-700" onClick={timer.resume}>
            <Play aria-hidden="true" />
            Resume
          </Button>
        ) : timer.status === "finished" ? (
          <Button
            type="button"
            size="sm"
            className="bg-emerald-800 text-white hover:bg-emerald-700"
            onClick={() => timer.start(timer.mode === "focus" ? "break" : "focus")}
          >
            <Play aria-hidden="true" />
            {timer.mode === "focus" ? "Start break" : "Start focus"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="bg-emerald-800 text-white hover:bg-emerald-700"
            onClick={() => timer.start()}
          >
            <Play aria-hidden="true" />
            Start
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={timer.reset}
          disabled={timer.status === "idle"}
          aria-label="Reset timer"
        >
          <RotateCcw aria-hidden="true" />
          Reset
        </Button>
      </div>
    </div>
  )
}
```

### `room-ambience.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/room-ambience.ts`

```ts
import { useEffect, useState } from "react"

export type LightPhase = "morning" | "day" | "evening" | "night"
export type LightSetting = "auto" | LightPhase

export type LightingPreset = {
  background: string
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  ambient: number
  sunColor: string
  sunIntensity: number
  sunPosition: [number, number, number]
  // 0 = lamps off, 1 = lamps fully lit.
  lamps: number
}

export const LIGHTING: Record<LightPhase, LightingPreset> = {
  morning: {
    background: "#e6f0fb",
    hemiSky: "#f4f9ff",
    hemiGround: "#cfdbe9",
    hemiIntensity: 0.85,
    ambient: 0.5,
    sunColor: "#ffe9c7",
    sunIntensity: 1.2,
    sunPosition: [-14, 14, 10],
    lamps: 0,
  },
  day: {
    background: "#e8eef6",
    hemiSky: "#ffffff",
    hemiGround: "#cdd8e6",
    hemiIntensity: 0.9,
    ambient: 0.55,
    sunColor: "#ffffff",
    sunIntensity: 1.3,
    sunPosition: [12, 20, 9],
    lamps: 0,
  },
  evening: {
    background: "#f3dcc6",
    hemiSky: "#ffd7a8",
    hemiGround: "#b9a7a0",
    hemiIntensity: 0.65,
    ambient: 0.35,
    sunColor: "#ffb36b",
    sunIntensity: 1,
    sunPosition: [16, 8, 4],
    lamps: 0.6,
  },
  night: {
    background: "#1c2640",
    hemiSky: "#8ea4d6",
    hemiGround: "#2b3350",
    hemiIntensity: 0.45,
    ambient: 0.22,
    sunColor: "#a9bdf0",
    sunIntensity: 0.35,
    sunPosition: [-10, 18, -6],
    lamps: 1,
  },
}

export const LIGHT_LABELS: Record<LightSetting, string> = {
  auto: "Auto light",
  morning: "Morning light",
  day: "Daylight",
  evening: "Evening light",
  night: "Night light",
}

export const LIGHT_SETTINGS: LightSetting[] = ["auto", "morning", "day", "evening", "night"]

export function phaseForHour(hour: number): LightPhase {
  if (hour >= 5 && hour < 10) return "morning"
  if (hour >= 10 && hour < 17) return "day"
  if (hour >= 17 && hour < 20) return "evening"
  return "night"
}

// Outdoor look for the study hall city at each phase.
export const HALL_LIGHTING: Record<LightPhase, { sky: string; ground: string; hemi: number; sun: string; sunIntensity: number; sunPosition: [number, number, number]; ambient: number; lamps: number }> = {
  morning: { sky: "#dcebfb", ground: "#b6dc8c", hemi: 1, sun: "#ffe6bf", sunIntensity: 1.3, sunPosition: [-0.6, 0.7, 0.5], ambient: 0.3, lamps: 0 },
  day: { sky: "#e3f1fb", ground: "#a8cf8e", hemi: 1.1, sun: "#ffffff", sunIntensity: 1.5, sunPosition: [0.4, 0.9, 0.55], ambient: 0.35, lamps: 0 },
  evening: { sky: "#f6cfa6", ground: "#a59a7a", hemi: 0.75, sun: "#ffa45c", sunIntensity: 1.1, sunPosition: [0.9, 0.35, 0.2], ambient: 0.28, lamps: 0.6 },
  // Dark night sky like the study room; street lamps and windows provide the light.
  night: { sky: "#141d36", ground: "#2a3350", hemi: 0.4, sun: "#9fb4ec", sunIntensity: 0.3, sunPosition: [-0.4, 0.8, -0.3], ambient: 0.2, lamps: 1 },
}

const LIGHT_STORAGE_KEY = "owlio.study-light.v1"

function loadLightSetting(): LightSetting {
  if (typeof window === "undefined") return "auto"
  try {
    const stored = window.localStorage.getItem(LIGHT_STORAGE_KEY)
    return LIGHT_SETTINGS.includes(stored as LightSetting) ? (stored as LightSetting) : "auto"
  } catch {
    return "auto"
  }
}

// One browser-local light setting shared by the study hall and every room.
export function useSharedLightSetting() {
  const [setting, setSetting] = useState<LightSetting>(loadLightSetting)

  useEffect(() => {
    try {
      window.localStorage.setItem(LIGHT_STORAGE_KEY, setting)
    } catch {
      return
    }
  }, [setting])

  const cycle = () => setSetting((current) => LIGHT_SETTINGS[(LIGHT_SETTINGS.indexOf(current) + 1) % LIGHT_SETTINGS.length])
  return { setting, cycle }
}

// Follows the local clock in "auto", checking once a minute.
export function useLightPhase(setting: LightSetting): LightPhase {
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    if (setting !== "auto") return
    const interval = window.setInterval(() => setHour(new Date().getHours()), 60_000)
    return () => window.clearInterval(interval)
  }, [setting])

  return setting === "auto" ? phaseForHour(hour) : setting
}
```

### `room-chat-panel.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/room-chat-panel.tsx`

```tsx
import { useEffect, useRef } from "react"
import { cn } from "cn"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { studySpaceChatLocalNotice } from "../study-spaces-records"

export type RoomMessage = {
  id: string
  author: string
  text: string
  sentAt: number
}

type RoomChatPanelProps = {
  messages: RoomMessage[]
  onClose: () => void
  className?: string
}

export function RoomChatPanel({ messages, onClose, className }: RoomChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: "end" })
  }, [messages.length])

  return (
    <aside
      aria-label="Space chat"
      className={cn(
        "flex w-72 max-w-[85%] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900/95 shadow-lg backdrop-blur",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-700 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
          <MessageCircle className="size-4" aria-hidden="true" />
          Space chat
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label="Close chat panel"
          className="text-slate-400 hover:text-slate-100"
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-3">
          {messages.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-center text-xs leading-5 text-slate-400">
              No messages yet. Send a message and it appears above your character.
            </p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="rounded-lg bg-slate-800 px-3 py-2">
                <p className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-medium text-slate-200">{message.author}</span>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
                <p className="mt-1 break-words text-sm leading-5 text-slate-100">{message.text}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <p className="border-t border-slate-700 px-3 py-2 text-[11px] leading-4 text-slate-400">
        {studySpaceChatLocalNotice}
      </p>
    </aside>
  )
}
```

### `room-extras.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/room-extras.tsx`

```tsx
import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, useCursor } from "@react-three/drei"
import { CanvasTexture, SRGBColorSpace, type Group } from "three"
import type { RoomTask } from "./room-tasks"

type Vec3 = [number, number, number]

function useHoverClick(onActivate: () => void) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return {
    hovered,
    handlers: {
      onClick: (event: { stopPropagation: () => void; delta: number }) => {
        if (event.delta > 4) return
        event.stopPropagation()
        onActivate()
      },
      onPointerOver: (event: { stopPropagation: () => void }) => {
        event.stopPropagation()
        setHovered(true)
      },
      onPointerOut: () => setHovered(false),
    },
  }
}

function HoverTag({ label }: { label: string }) {
  return (
    <Html position={[0, 0.2, 0.2]} center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
      <span className="block rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow">
        {label}
      </span>
    </Html>
  )
}

function drawBoard(tasks: RoomTask[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = 640
  canvas.height = 360
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  ctx.fillStyle = "#f8fafc"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#1d4ed8"
  ctx.font = "bold 34px sans-serif"
  ctx.fillText("Group tasks", 28, 52)
  ctx.fillStyle = "#cbd5e1"
  ctx.fillRect(28, 66, 584, 3)

  const visible = tasks.slice(0, 5)
  if (visible.length === 0) {
    ctx.fillStyle = "#64748b"
    ctx.font = "26px sans-serif"
    ctx.fillText("No tasks yet — click to open", 28, 130)
  }
  visible.forEach((task, index) => {
    const y = 112 + index * 52
    ctx.strokeStyle = "#334155"
    ctx.lineWidth = 3
    ctx.strokeRect(30, y - 24, 28, 28)
    if (task.done) {
      ctx.strokeStyle = "#15803d"
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(35, y - 10)
      ctx.lineTo(43, y - 1)
      ctx.lineTo(56, y - 22)
      ctx.stroke()
    }
    ctx.fillStyle = task.done ? "#94a3b8" : "#0f172a"
    ctx.font = "28px sans-serif"
    const title = task.title.length > 30 ? `${task.title.slice(0, 29)}…` : task.title
    ctx.fillText(title, 74, y)
  })
  if (tasks.length > visible.length) {
    ctx.fillStyle = "#64748b"
    ctx.font = "22px sans-serif"
    ctx.fillText(`+${tasks.length - visible.length} more`, 28, 345)
  }
  return canvas
}

export function TaskWhiteboard({
  position,
  tasks,
  onOpen,
}: {
  position: Vec3
  tasks: RoomTask[]
  onOpen: () => void
}) {
  const { hovered, handlers } = useHoverClick(onOpen)
  const texture = useMemo(() => {
    const created = new CanvasTexture(drawBoard(tasks))
    created.colorSpace = SRGBColorSpace
    return created
  }, [tasks])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={position} {...handlers}>
      <mesh castShadow>
        <boxGeometry args={[2.9, 1.7, 0.08]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[2.72, 1.53]} />
        <meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={hovered ? 0.35 : 0.12} />
      </mesh>
      <mesh position={[0, -0.9, 0.1]}>
        <boxGeometry args={[2.4, 0.06, 0.14]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      {hovered ? <HoverTag label="Group task board" /> : null}
    </group>
  )
}

export function RoomTv({
  position,
  hasVideo,
  onOpen,
}: {
  position: Vec3
  hasVideo: boolean
  onOpen: () => void
}) {
  const { hovered, handlers } = useHoverClick(onOpen)
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 288
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = hasVideo ? "#0f172a" : "#020617"
      ctx.fillRect(0, 0, 512, 288)
      if (hasVideo) {
        ctx.fillStyle = "#dc2626"
        ctx.beginPath()
        ctx.roundRect(196, 94, 120, 84, 22)
        ctx.fill()
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.moveTo(238, 114)
        ctx.lineTo(238, 158)
        ctx.lineTo(278, 136)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = "#e2e8f0"
        ctx.font = "24px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Video ready — click to watch", 256, 232)
      } else {
        ctx.fillStyle = "#475569"
        ctx.font = "26px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("TV off — click to set a video", 256, 150)
      }
    }
    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    return created
  }, [hasVideo])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={position} {...handlers}>
      <mesh castShadow>
        <boxGeometry args={[2.9, 1.7, 0.1]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.72, 1.53]} />
        <meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={hovered ? 0.7 : 0.45} />
      </mesh>
      <mesh position={[0, -1.35, 0.1]}>
        <boxGeometry args={[3.2, 0.5, 0.5]} />
        <meshStandardMaterial color="#6d5634" />
      </mesh>
      {hovered ? <HoverTag label="Room TV" /> : null}
    </group>
  )
}

export type LockerSlot = { id: string; label: string; color: string; mine: boolean; open: boolean }

const LOCKER_W = 0.7
const LOCKER_H = 0.88

function LockerDoor({ slot, x, y, onSelect }: { slot: LockerSlot; x: number; y: number; onSelect: (id: string) => void }) {
  const { hovered, handlers } = useHoverClick(() => onSelect(slot.id))
  const door = useRef<Group>(null)
  const swing = slot.open ? -0.9 : 0

  useFrame((_, delta) => {
    const node = door.current
    if (node) node.rotation.y += (swing - node.rotation.y) * Math.min(1, delta * 8)
  })

  const status = slot.mine ? "your locker" : slot.open ? "unlocked" : "locked — needs their code"

  return (
    <group position={[x, y, 0.31]} {...handlers}>
      <mesh position={[0, LOCKER_H / 2, -0.04]}>
        <boxGeometry args={[LOCKER_W - 0.08, LOCKER_H - 0.08, 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {slot.open ? (
        <mesh position={[0, LOCKER_H * 0.35, -0.02]}>
          <boxGeometry args={[0.4, 0.2, 0.02]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      ) : null}
      <group ref={door} position={[-LOCKER_W / 2 + 0.04, 0, 0]}>
        <mesh position={[LOCKER_W / 2 - 0.04, LOCKER_H / 2, 0]} castShadow>
          <boxGeometry args={[LOCKER_W - 0.06, LOCKER_H - 0.06, 0.04]} />
          <meshStandardMaterial color={slot.color} emissive={slot.color} emissiveIntensity={hovered ? 0.25 : 0} />
        </mesh>
        {[0.62, 0.68, 0.74].map((vy) => (
          <mesh key={vy} position={[LOCKER_W / 2 - 0.04, vy, 0.025]}>
            <boxGeometry args={[0.3, 0.025, 0.01]} />
            <meshStandardMaterial color="#0f172a" transparent opacity={0.35} />
          </mesh>
        ))}
        <mesh position={[LOCKER_W - 0.16, LOCKER_H / 2 - 0.06, 0.035]}>
          <boxGeometry args={[0.08, 0.1, 0.03]} />
          <meshStandardMaterial
            color={slot.mine || slot.open ? "#22c55e" : "#ef4444"}
            emissive={slot.mine || slot.open ? "#22c55e" : "#ef4444"}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      {hovered ? <HoverTag label={`${slot.label} · ${status}`} /> : null}
    </group>
  )
}

// Two-row locker wall; one locker per person in the room. Opening others needs their code.
export function LockerWall({ position, slots, onSelect }: { position: Vec3; slots: LockerSlot[]; onSelect: (id: string) => void }) {
  const columns = Math.max(1, Math.ceil(slots.length / 2))
  const width = columns * LOCKER_W + 0.1

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, LOCKER_H + 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, LOCKER_H * 2 + 0.24, 0.6]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, LOCKER_H * 2 + 0.27, 0]}>
        <boxGeometry args={[width + 0.08, 0.06, 0.66]} />
        <meshStandardMaterial color="#2f6fe4" />
      </mesh>
      {slots.map((slot, index) => {
        const column = Math.floor(index / 2)
        const row = index % 2
        return (
          <LockerDoor
            key={slot.id}
            slot={slot}
            x={-width / 2 + 0.05 + column * LOCKER_W + LOCKER_W / 2}
            y={row === 0 ? LOCKER_H + 0.16 : 0.08}
            onSelect={onSelect}
          />
        )
      })}
      <Html position={[0, LOCKER_H * 2 + 0.6, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[12, 0]}>
        <span className="block whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
          Lockers
        </span>
      </Html>
    </group>
  )
}

export function RadioSet({
  position,
  playing,
  onToggle,
  reducedMotion,
}: {
  position: Vec3
  playing: boolean
  onToggle: () => void
  reducedMotion: boolean
}) {
  const { hovered, handlers } = useHoverClick(onToggle)
  const cone = useRef<Group>(null)

  useFrame(({ clock }) => {
    const node = cone.current
    if (!node || reducedMotion) return
    const pulse = playing ? 1 + Math.sin(clock.elapsedTime * 8) * 0.06 : 1
    node.scale.set(pulse, pulse, 1)
  })

  return (
    <group position={position} {...handlers}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.7, 0.32, 0.26]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <group ref={cone} position={[-0.18, 0.16, 0.14]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 20]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      <mesh position={[0.18, 0.2, 0.14]}>
        <boxGeometry args={[0.22, 0.08, 0.02]} />
        <meshStandardMaterial color={playing ? "#22c55e" : "#64748b"} emissive={playing ? "#22c55e" : "#000000"} emissiveIntensity={playing ? 0.8 : 0} />
      </mesh>
      {hovered ? <HoverTag label={playing ? "Pause room music" : "Play room music"} /> : null}
    </group>
  )
}
```

### `room-garden.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/room-garden.tsx`

```tsx
import { useState } from "react"
import { Html, useCursor } from "@react-three/drei"

type Vec3 = [number, number, number]

const FLOWERS: { x: number; z: number; color: string }[] = [
  { x: -1.7, z: -0.6, color: "#f472b6" },
  { x: -1.3, z: -0.75, color: "#facc15" },
  { x: -0.9, z: -0.55, color: "#a78bfa" },
  { x: 1.2, z: 0.6, color: "#fb7185" },
  { x: 1.55, z: 0.45, color: "#facc15" },
  { x: 1.85, z: 0.7, color: "#60a5fa" },
  { x: -1.85, z: 0.65, color: "#fb923c" },
]

// Indoor garden corner: grass bed, small tree, flowers, a bench and a lamp that glows at night.
// The bench toggles the "Forest Breeze" ambience in the room music player.
export function RoomGarden({
  position,
  lamps,
  soundOn,
  onToggleSound,
}: {
  position: Vec3
  lamps: number
  soundOn: boolean
  onToggleSound: () => void
}) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.6, 0.12, 2.3]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      <mesh position={[0, 0.125, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.02, 2.1]} />
        <meshStandardMaterial color="#86c46d" />
      </mesh>
      {[-0.6, 0, 0.6].map((x, index) => (
        <mesh key={x} position={[x, 0.14, -0.1 + index * 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 16]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      ))}

      <group position={[1.65, 0.13, -0.55]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.11, 1.1, 8]} />
          <meshStandardMaterial color="#8a5a33" />
        </mesh>
        <mesh position={[0, 1.4, 0]} castShadow>
          <icosahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial color="#4caf50" flatShading />
        </mesh>
        <mesh position={[0.2, 1.85, 0.1]} castShadow>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#66bb6a" flatShading />
        </mesh>
      </group>

      {FLOWERS.map((flower) => (
        <group key={`${flower.x}-${flower.z}`} position={[flower.x, 0.13, flower.z]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.24, 5]} />
            <meshStandardMaterial color="#3f7d4e" />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={flower.color} />
          </mesh>
        </group>
      ))}

      <group
        position={[-0.4, 0.13, 0.55]}
        onClick={(event) => {
          if (event.delta > 4) return
          event.stopPropagation()
          onToggleSound()
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[1.5, 0.08, 0.45]} />
          <meshStandardMaterial color={hovered ? "#c08a4e" : "#a5743f"} />
        </mesh>
        <mesh position={[0, 0.66, 0.2]} castShadow>
          <boxGeometry args={[1.5, 0.4, 0.06]} />
          <meshStandardMaterial color={hovered ? "#c08a4e" : "#a5743f"} />
        </mesh>
        {[-0.65, 0.65].map((x) => (
          <mesh key={x} position={[x, 0.18, 0]}>
            <boxGeometry args={[0.08, 0.36, 0.42]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        ))}
        {hovered ? (
          <Html position={[0, 1.15, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
            <span className="block whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium text-white shadow">
              {soundOn ? "Stop garden sounds" : "Play garden sounds (Forest Breeze)"}
            </span>
          </Html>
        ) : null}
      </group>

      <group position={[-1.95, 0.13, -0.7]}>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 1.5, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color="#fff7d6" emissive="#fde68a" emissiveIntensity={0.15 + lamps * 1.2} />
        </mesh>
        {lamps > 0 ? <pointLight position={[0, 1.5, 0]} intensity={4 * lamps} distance={5} color="#fde68a" /> : null}
      </group>

      <Html position={[0, 0.5, 1.35]} center style={{ pointerEvents: "none" }} zIndexRange={[12, 0]}>
        <span className="block whitespace-nowrap rounded-full bg-emerald-100/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-emerald-900 shadow">
          Garden corner
        </span>
      </Html>
    </group>
  )
}
```

### `room-lockers.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/room-lockers.ts`

```ts
import { hashString, type SamplePerson } from "../space-roster"

export type SampleLockerFile = { name: string; size: string; note: string }

export type SampleLocker = {
  owner: SamplePerson
  code: string
  files: SampleLockerFile[]
}

export const lockerPreviewNotice =
  "Preview lockers: study-mates and their files are samples. Codes are checked only in this browser and are not a security control."

export const ownLockerCodeNotice =
  "Your locker code is saved in this browser only. No one else can open your locker because nothing is shared yet."

const SAMPLE_FILES: SampleLockerFile[] = [
  { name: "Kinematics summary.pdf", size: "412 KB", note: "Formula sheet with worked examples" },
  { name: "Essay outline v2.docx", size: "38 KB", note: "Thesis and three supporting points" },
  { name: "Past paper 2024 answers.pdf", size: "1.2 MB", note: "Marked answers for Q1–Q6" },
  { name: "Vocabulary list.txt", size: "6 KB", note: "40 terms with short definitions" },
  { name: "Cell diagram.png", size: "820 KB", note: "Labelled organelles" },
  { name: "Group plan.docx", size: "24 KB", note: "Who covers which chapter" },
  { name: "Flashcards week 3.pdf", size: "290 KB", note: "Printable flashcards" },
  { name: "Lab results.txt", size: "4 KB", note: "Readings from the pendulum lab" },
]

// Deterministic sample lockers for the sample study-mates. Nothing here is a real file or person.
export function getSampleLockers(spaceId: string, people: SamplePerson[]): SampleLocker[] {
  return people.map((owner) => {
    const seed = hashString(`${spaceId}:locker:${owner.id}`)
    const count = 2 + (seed % 3)
    const files = Array.from({ length: count }, (_, index) => SAMPLE_FILES[(seed + index * 3) % SAMPLE_FILES.length])
    return { owner, code: String(1000 + (seed % 9000)), files }
  })
}

const OWN_CODE_PREFIX = "owlio.study-space-locker-code."

export function isValidLockerCode(code: string): boolean {
  return /^\d{4,6}$/.test(code)
}

export function loadOwnLockerCode(spaceId: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const stored = window.localStorage.getItem(`${OWN_CODE_PREFIX}${spaceId}`)
    return stored && isValidLockerCode(stored) ? stored : null
  } catch {
    return null
  }
}

export function saveOwnLockerCode(spaceId: string, code: string | null): void {
  if (typeof window === "undefined") return
  try {
    if (code) window.localStorage.setItem(`${OWN_CODE_PREFIX}${spaceId}`, code)
    else window.localStorage.removeItem(`${OWN_CODE_PREFIX}${spaceId}`)
  } catch {
    return
  }
}
```

### `room-tasks.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/room-tasks.ts`

```ts
import { createStudySpaceId, type StudySpaceRecord } from "../study-spaces-records"

export type RoomTaskAssignee = "everyone" | "me" | string

export type RoomTask = {
  id: string
  title: string
  notes: string
  due: string | null
  assignee: RoomTaskAssignee
  done: boolean
  sample?: boolean
}

export const roomTasksNotice =
  "Group tasks are saved in this browser only. They are not sent to other students and are not classwork."

export const roomTasksStoragePrefix = "owlio.study-space-tasks.v1."

const sampleTasks: RoomTask[] = [
  {
    id: "sample-task-everyone",
    title: "Skim this week's reading",
    notes: "Sample task from the space leader.",
    due: null,
    assignee: "everyone",
    done: false,
    sample: true,
  },
  {
    id: "sample-task-me",
    title: "Bring one question to the group",
    notes: "Sample task from the space leader.",
    due: null,
    assignee: "me",
    done: false,
    sample: true,
  },
]

function isRoomTask(value: unknown): value is RoomTask {
  if (typeof value !== "object" || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.notes === "string" &&
    (task.due === null || typeof task.due === "string") &&
    typeof task.assignee === "string" &&
    typeof task.done === "boolean"
  )
}

export function loadRoomTasks(space: StudySpaceRecord): RoomTask[] {
  const fallback = space.role === "member" ? sampleTasks : []
  if (typeof window === "undefined") return fallback

  try {
    const stored = window.localStorage.getItem(`${roomTasksStoragePrefix}${space.id}`)
    if (!stored) return fallback
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter(isRoomTask) : fallback
  } catch {
    return fallback
  }
}

export function saveRoomTasks(spaceId: string, tasks: RoomTask[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(`${roomTasksStoragePrefix}${spaceId}`, JSON.stringify(tasks))
  } catch {
    return
  }
}

// The leader (space owner) manages tasks; every group mate can tick the tasks that are theirs.
export function canManageTasks(space: StudySpaceRecord): boolean {
  return space.role === "owner"
}

export function canTickTask(task: RoomTask): boolean {
  return task.assignee === "everyone" || task.assignee === "me"
}

export type RoomTaskDraft = Pick<RoomTask, "title" | "notes" | "due" | "assignee">

export function createRoomTask(draft: RoomTaskDraft): RoomTask {
  return {
    id: createStudySpaceId(),
    title: draft.title.trim(),
    notes: draft.notes.trim(),
    due: draft.due && draft.due.length > 0 ? draft.due : null,
    assignee: draft.assignee,
    done: false,
  }
}

export function toggleRoomTask(tasks: RoomTask[], taskId: string): RoomTask[] {
  return tasks.map((task) => (task.id === taskId && canTickTask(task) ? { ...task, done: !task.done } : task))
}

export function moveRoomTask(tasks: RoomTask[], taskId: string, direction: -1 | 1): RoomTask[] {
  const index = tasks.findIndex((task) => task.id === taskId)
  const target = index + direction
  if (index === -1 || target < 0 || target >= tasks.length) return tasks
  const next = [...tasks]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
```

### `room-tv.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/room-tv.ts`

```ts
export const roomTvNotice =
  "Playback is local to this browser. Other students do not see what you watch."

export const roomTvStoragePrefix = "owlio.study-space-tv.v1."

export type RoomTvVideo = { url: string; videoId: string }

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

// Accepts only https YouTube links and returns the 11-character video id.
export function parseYouTubeId(input: string): string | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== "https:") return null

  const host = url.hostname.replace(/^www\.|^m\./, "")
  let id: string | null = null

  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, value] = url.pathname.split("/")
    if (kind === "watch") id = url.searchParams.get("v")
    else if (kind === "embed" || kind === "shorts" || kind === "live") id = value ?? null
  }

  return id && VIDEO_ID.test(id) ? id : null
}

export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
}

export function loadRoomTvVideo(spaceId: string): RoomTvVideo | null {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(`${roomTvStoragePrefix}${spaceId}`)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<RoomTvVideo>
    return typeof parsed.url === "string" && typeof parsed.videoId === "string" && VIDEO_ID.test(parsed.videoId)
      ? { url: parsed.url, videoId: parsed.videoId }
      : null
  } catch {
    return null
  }
}

export function saveRoomTvVideo(spaceId: string, video: RoomTvVideo | null): void {
  if (typeof window === "undefined") return

  try {
    const key = `${roomTvStoragePrefix}${spaceId}`
    if (video) window.localStorage.setItem(key, JSON.stringify(video))
    else window.localStorage.removeItem(key)
  } catch {
    return
  }
}
```

### `room-zones.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/room-zones.tsx`

```tsx
import { Html } from "@react-three/drei"
import type { StudySpaceKind } from "../study-spaces-records"
import { RoomTv } from "./room-extras"
import { discussionTable, napArea, watchRoom } from "./study-space-seats"

type Vec3 = [number, number, number]

const WOOD = "#b98a55"
const WOOD_DARK = "#7a5634"
const BOOK_COLORS = ["#b91c1c", "#1d4ed8", "#15803d", "#a16207", "#7e22ce", "#0e7490", "#be185d"]
const noRaycast = () => null

export function AreaSign({ position, label, tone }: { position: Vec3; label: string; tone: "table" | "nap" | "watch" }) {
  const toneClass =
    tone === "nap" ? "bg-violet-100/95 text-violet-900" : tone === "watch" ? "bg-sky-100/95 text-sky-900" : "bg-amber-100/95 text-amber-900"
  return (
    <Html position={position} center style={{ pointerEvents: "none" }} zIndexRange={[12, 0]}>
      <span className={`block whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide shadow ${toneClass}`}>
        {label}
      </span>
    </Html>
  )
}

function Laptop({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.01, 0]} castShadow>
        <boxGeometry args={[0.42, 0.02, 0.3]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.15, -0.15]} rotation={[-0.25, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 0.28, 0.015]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.15, -0.14]} rotation={[-0.25, 0, 0]}>
        <planeGeometry args={[0.38, 0.24]} />
        <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function BookStack({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[index * 0.02, 0.03 + index * 0.06, 0]} rotation={[0, index * 0.25, 0]} castShadow>
          <boxGeometry args={[0.32, 0.055, 0.22]} />
          <meshStandardMaterial color={BOOK_COLORS[(index * 2 + 1) % BOOK_COLORS.length]} />
        </mesh>
      ))}
    </group>
  )
}

function Mug({ position, color }: { position: Vec3; color: string }) {
  return (
    <mesh position={[position[0], position[1] + 0.06, position[2]]} castShadow>
      <cylinderGeometry args={[0.05, 0.045, 0.12, 14]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Notebook({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.008, 0]}>
        <boxGeometry args={[0.36, 0.015, 0.26]} />
        <meshStandardMaterial color="#fef9c3" />
      </mesh>
      <mesh position={[0.12, 0.02, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
    </group>
  )
}

function SmallPlant({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.16, 14]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.26, 0]} castShadow>
        <sphereGeometry args={[0.16, 14, 10]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
    </group>
  )
}

// The single discussion table; room type picks rectangular, oval or a low round lounge table.
export function DiscussionTable({ kind }: { kind: StudySpaceKind }) {
  const { x, z } = discussionTable
  const shape = discussionTable.shape[kind]
  const top = shape === "round" ? 0.52 : 0.76
  const spread = shape === "rect" ? 1 : shape === "oval" ? 0.85 : 0.5

  return (
    <group position={[x, 0, z]}>
      {shape === "rect" ? (
        <mesh position={[0, 0.012, 0]} receiveShadow raycast={noRaycast}>
          <boxGeometry args={[discussionTable.rect.w + 3.6, 0.02, discussionTable.rect.d + 3.6]} />
          <meshStandardMaterial color="#ecd9b8" />
        </mesh>
      ) : (
        <mesh position={[0, 0.012, 0]} scale={shape === "oval" ? [discussionTable.oval.rx + 1.9, 1, discussionTable.oval.rz + 1.9] : [3.6, 1, 3.6]} receiveShadow raycast={noRaycast}>
          <cylinderGeometry args={[1, 1, 0.02, 48]} />
          <meshStandardMaterial color="#ecd9b8" />
        </mesh>
      )}

      {shape === "rect" ? (
        <>
          <mesh position={[0, top - 0.04, 0]} castShadow receiveShadow>
            <boxGeometry args={[discussionTable.rect.w, 0.08, discussionTable.rect.d]} />
            <meshStandardMaterial color={WOOD} roughness={0.55} />
          </mesh>
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([sx, sz]) => (
            <mesh key={`${sx}-${sz}`} position={[sx * (discussionTable.rect.w / 2 - 0.2), (top - 0.08) / 2, sz * (discussionTable.rect.d / 2 - 0.2)]} castShadow>
              <boxGeometry args={[0.09, top - 0.08, 0.09]} />
              <meshStandardMaterial color={WOOD_DARK} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh
            position={[0, top - 0.04, 0]}
            scale={shape === "oval" ? [discussionTable.oval.rx, 1, discussionTable.oval.rz] : [discussionTable.round.r, 1, discussionTable.round.r]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[1, 1, 0.08, 48]} />
            <meshStandardMaterial color={WOOD} roughness={0.55} />
          </mesh>
          {(shape === "oval" ? [-1.2, 1.2] : [0]).map((px) => (
            <group key={px} position={[px, 0, 0]}>
              <mesh position={[0, (top - 0.08) / 2, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.12, top - 0.08, 12]} />
                <meshStandardMaterial color={WOOD_DARK} />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.45, 0.5, 0.06, 20]} />
                <meshStandardMaterial color={WOOD_DARK} />
              </mesh>
            </group>
          ))}
        </>
      )}

      <group position={[0, top, 0]}>
        <SmallPlant position={[0, 0, 0]} />
        <Laptop position={[-1.5 * spread, 0, -0.35 * spread]} rotation={Math.PI} />
        <Laptop position={[0.6 * spread, 0, 0.4 * spread]} />
        <BookStack position={[-0.55 * spread, 0, -0.4 * spread]} rotation={0.3} />
        <Notebook position={[1.5 * spread, 0, 0.35 * spread]} rotation={-0.3} />
        <Notebook position={[-1.4 * spread, 0, 0.45 * spread]} rotation={0.5} />
        <Mug position={[1.2 * spread, 0, -0.35 * spread]} color="#f97316" />
        <Mug position={[-0.9 * spread, 0, 0.5 * spread]} color="#22c55e" />
      </group>
    </group>
  )
}

// Standing arc lamp leaning over the discussion table.
export function ArcLamp({ position, lamps }: { position: Vec3; lamps: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.08, 20]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.7, 2.4, 0.35]} rotation={[0.45, 0, 1.1]}>
        <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-1.35, 2.2, 0.7]}>
        <coneGeometry args={[0.32, 0.3, 24, 1, true]} />
        <meshStandardMaterial color="#f8fafc" emissive="#fde68a" emissiveIntensity={0.2 + lamps * 1.1} side={2} />
      </mesh>
    </group>
  )
}

function Partition({ position, size, color }: { position: Vec3; size: Vec3; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow raycast={noRaycast}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size[1] + 0.03, 0]} raycast={noRaycast}>
        <boxGeometry args={[size[0] + 0.04, 0.06, size[2] + 0.04]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

// Quiet nap corner: soft carpet, partitions, beanbag, blanket shelf and a dim lamp.
export function NapAreaDecor({ lamps }: { lamps: number }) {
  const { minX, maxX, minZ, maxZ } = napArea
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2

  return (
    <group>
      <mesh position={[cx, 0.01, cz]} receiveShadow raycast={noRaycast}>
        <boxGeometry args={[maxX - minX, 0.02, maxZ - minZ]} />
        <meshStandardMaterial color="#ece4f8" />
      </mesh>
      <Partition position={[minX, 0, minZ + (maxZ - minZ - 1.8) / 2]} size={[0.14, 1.1, maxZ - minZ - 1.8]} color="#c4b5fd" />
      <Partition position={[(minX + 2 + maxX) / 2, 0, maxZ]} size={[maxX - minX - 2, 0.6, 0.14]} color="#c4b5fd" />

      <mesh position={[5.2, 0.3, -2.75]} scale={[1, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.55, 24, 16]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.95} />
      </mesh>

      <group position={[10.1, 0, -6.8]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.6, 1.2, 1.2]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        {[0.3, 0.7, 1.05].map((y, index) => (
          <mesh key={y} position={[-0.05, y, 0]}>
            <boxGeometry args={[0.55, 0.16, 1]} />
            <meshStandardMaterial color={["#a78bfa", "#93c5fd", "#fcd34d"][index]} />
          </mesh>
        ))}
      </group>

      <group position={[10, 0, -2.6]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.6, 18]} />
          <meshStandardMaterial color="#ddd6fe" />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshStandardMaterial color="#fff7ed" emissive="#fdba74" emissiveIntensity={0.3 + lamps * 0.9} />
        </mesh>
      </group>
      {[6, 7.8, 9.6].map((x) => (
        <mesh key={x} position={[x, 0.005, -5]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
          <planeGeometry args={[1.3, 2.4]} />
          <meshStandardMaterial color="#ddd3f3" />
        </mesh>
      ))}
    </group>
  )
}

// Group watch room: carpet, partitions, media wall with the big screen, coffee table and speakers.
export function WatchRoomDecor({ hasVideo, onOpenTv }: { hasVideo: boolean; onOpenTv: () => void }) {
  const { minX, maxX, minZ, maxZ, screenZ } = watchRoom
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2

  return (
    <group>
      <mesh position={[cx, 0.01, cz]} receiveShadow raycast={noRaycast}>
        <boxGeometry args={[maxX - minX, 0.02, maxZ - minZ]} />
        <meshStandardMaterial color="#d3def3" />
      </mesh>
      <Partition position={[(minX + 2 + maxX) / 2, 0, minZ]} size={[maxX - minX - 2, 1.1, 0.14]} color="#93c5fd" />
      <Partition position={[minX, 0, (minZ + 1.8 + maxZ) / 2]} size={[0.14, 1.1, maxZ - minZ - 1.8]} color="#93c5fd" />

      <mesh position={[maxX - 0.2, 1.5, screenZ]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 3, 5.4]} />
        <meshStandardMaterial color="#5b4636" />
      </mesh>
      <group position={[maxX - 0.4, 2.15, screenZ]} rotation={[0, -Math.PI / 2, 0]} scale={1.25}>
        <RoomTv position={[0, 0, 0]} hasVideo={hasVideo} onOpen={onOpenTv} />
      </group>
      {[screenZ - 2.2, screenZ + 2.2].map((z) => (
        <mesh key={z} position={[maxX - 0.6, 0.6, z]} castShadow>
          <boxGeometry args={[0.4, 1.2, 0.4]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}

      <group position={[8.3, 0, screenZ]}>
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[0.9, 0.06, 1.8]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.7, 0.34, 1.5]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
        <mesh position={[0, 0.45, 0.3]}>
          <cylinderGeometry args={[0.16, 0.1, 0.12, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 0.52, 0.3]}>
          <sphereGeometry args={[0.13, 12, 8]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
      </group>
    </group>
  )
}

export function PinBoard({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.3, 0.9, 0.05]} />
        <meshStandardMaterial color="#a16207" />
      </mesh>
      {[
        [-0.35, 0.15, "#fef08a"],
        [0.05, 0.2, "#bfdbfe"],
        [0.4, -0.05, "#fecaca"],
        [-0.1, -0.2, "#bbf7d0"],
      ].map(([x, y, color]) => (
        <mesh key={`${x}-${y}`} position={[x as number, y as number, 0.04]} rotation={[0, 0, (x as number) * 0.4]}>
          <boxGeometry args={[0.22, 0.24, 0.01]} />
          <meshStandardMaterial color={color as string} />
        </mesh>
      ))}
    </group>
  )
}

export function Bookshelf({ position }: { position: Vec3 }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[2, 2.1, 0.4]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      {[0.35, 0.95, 1.55].map((y) => (
        <mesh key={y} position={[0, y, 0.06]}>
          <boxGeometry args={[1.84, 0.05, 0.32]} />
          <meshStandardMaterial color="#6d5634" />
        </mesh>
      ))}
      {[0.56, 1.16, 1.76].map((y, row) => (
        <group key={y} position={[0, y, 0.08]}>
          {[-0.7, -0.5, -0.28, -0.05, 0.18, 0.42, 0.62].map((x, i) => (
            <mesh key={x} position={[x, 0.02, 0]}>
              <boxGeometry args={[0.14, 0.36, 0.22]} />
              <meshStandardMaterial color={BOOK_COLORS[(row * 4 + i) % BOOK_COLORS.length]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export function Plant({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.52, 16]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.45, 18, 14]} />
        <meshStandardMaterial color="#3f9d58" />
      </mesh>
      <mesh position={[0.2, 1.25, 0.1]} castShadow>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshStandardMaterial color="#5bb872" />
      </mesh>
    </group>
  )
}
```

### `seat-panel.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/seat-panel.tsx`

```tsx
import { Armchair, BedDouble, Tv, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SeatDef } from "./study-space-seats"

type SeatPanelProps = {
  seat: SeatDef
  occupied: boolean
  takenBy?: string | null
  onSit: () => void
  onClose: () => void
}

const ACTION: Record<SeatDef["furniture"], string> = {
  chair: "Sit here",
  armchair: "Sit here",
  mat: "Rest here",
  sofa: "Sit and watch",
}

export function SeatPanel({ seat, occupied, takenBy = null, onSit, onClose }: SeatPanelProps) {
  const Icon = seat.furniture === "mat" ? BedDouble : seat.furniture === "sofa" ? Tv : Armchair
  const status = occupied
    ? seat.furniture === "mat"
      ? "You are resting here"
      : "You are seated here"
    : takenBy
      ? seat.furniture === "mat"
        ? `${takenBy} (sample) is napping here`
        : `${takenBy} (sample) sits here`
      : "Available"

  return (
    <div
      role="dialog"
      aria-label={`Seat: ${seat.name}`}
      className="absolute bottom-16 left-1/2 z-20 w-72 max-w-[92%] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon className="size-4 text-emerald-800" aria-hidden="true" />
            {seat.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{seat.characteristic}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close seat details">
          <X aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
          {seat.zoneLabel}
        </Badge>
        <Badge variant="secondary" className={occupied ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}>
          {status}
        </Badge>
      </div>

      {seat.furniture === "mat" && !occupied && !takenBy ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Resting shows a napping status in this room preview. It is not shared with other students yet.
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        {occupied || takenBy ? null : (
          <Button type="button" size="sm" className="flex-1 bg-emerald-800 text-white hover:bg-emerald-700" onClick={onSit}>
            {ACTION[seat.furniture]}
          </Button>
        )}
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          {occupied ? "Close" : "Not now"}
        </Button>
      </div>
    </div>
  )
}
```

### `space-room-scene.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/space-room-scene.tsx`

```tsx
import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, useCursor } from "@react-three/drei"
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, Spherical, type Group, type OrthographicCamera } from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import type { SamplePerson } from "../space-roster"
import type { StudySpaceCharacter, StudySpaceKind } from "../study-spaces-records"
import { useWalkKeys, walkDirection, type WalkKey } from "../use-walk-keys"
import { CharacterFigure, type FigureMode } from "./character-figure"
import { LockerWall, RadioSet, TaskWhiteboard, type LockerSlot } from "./room-extras"
import { LIGHTING, type LightPhase } from "./room-ambience"
import { RoomGarden } from "./room-garden"
import type { RoomTask } from "./room-tasks"
import { AreaSign, ArcLamp, Bookshelf, DiscussionTable, NapAreaDecor, PinBoard, Plant, WatchRoomDecor } from "./room-zones"
import { discussionTable, napArea, roomPlan, watchRoom, type SeatDef } from "./study-space-seats"

export type CameraResetHandle = {
  reset: () => void
}

export type SpaceRoomSceneProps = {
  character: StudySpaceCharacter
  kind?: StudySpaceKind
  seats: SeatDef[]
  samplePeople?: SamplePerson[]
  tasks?: RoomTask[]
  tvHasVideo?: boolean
  lockers?: LockerSlot[]
  lightPhase?: LightPhase
  gardenSoundOn?: boolean
  musicPlaying?: boolean
  selectedSeatId: string | null
  seatedSeatId: string | null
  walkTarget: { x: number; z: number }
  cameraLevel: number
  showNameTag: boolean
  bubbleText: string | null
  cameraResetRef: RefObject<CameraResetHandle | null>
  onFloorPoint: (point: { x: number; z: number }) => void
  onSeatSelect: (seatId: string) => void
  onOpenTasks?: () => void
  onOpenTv?: () => void
  onSelectLocker?: (lockerId: string) => void
  onToggleGardenSound?: () => void
  onToggleMusic?: () => void
  onExit?: () => void
}

const ROOM = { ...roomPlan, wallHeight: 3.2 }
const LOW_WALL = 0.55
const WALL_BLUE = "#2f6fe4"
const EXIT_PORTAL = { x: -roomPlan.halfWidth + 1.5, z: roomPlan.halfDepth - 1.1 }
const MOVE_MARGIN = 0.5
const WALK_SPEED = 2.8
const BASE_POLAR = Math.PI / 3
const POLAR_STEP = 0.12

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

export function SpaceRoomScene({
  character,
  kind = "collaborative",
  seats,
  samplePeople = [],
  tasks = [],
  tvHasVideo = false,
  lockers = [],
  lightPhase = "day",
  gardenSoundOn = false,
  musicPlaying = false,
  selectedSeatId,
  seatedSeatId,
  walkTarget,
  cameraLevel,
  showNameTag,
  bubbleText,
  cameraResetRef,
  onFloorPoint,
  onSeatSelect,
  onOpenTasks = () => undefined,
  onOpenTv = () => undefined,
  onSelectLocker = () => undefined,
  onToggleGardenSound = () => undefined,
  onToggleMusic = () => undefined,
  onExit,
}: SpaceRoomSceneProps) {
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null)
  const seatedSeat = seats.find((seat) => seat.id === seatedSeatId) ?? null
  const takenBy = new Map(samplePeople.map((person) => [seats[person.seatIndex]?.id, person]))
  // A seated character only stands through the Stand up button, so a movement key just shows the hint.
  const { heldRef } = useWalkKeys(true, () => {
    if (seatedSeatId) onFloorPoint(walkTarget)
  })

  function handleFloorClick(point: { x: number; z: number }) {
    onFloorPoint({
      x: Math.min(Math.max(point.x, -ROOM.halfWidth + MOVE_MARGIN), ROOM.halfWidth - MOVE_MARGIN),
      z: Math.min(Math.max(point.z, -ROOM.halfDepth + MOVE_MARGIN), ROOM.halfDepth - MOVE_MARGIN),
    })
  }

  const destination = seatedSeat ? seatedSeat.sitPoint : walkTarget
  const light = LIGHTING[lightPhase]

  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: [18, 18, 18], zoom: 40, near: -100, far: 400 }}
      aria-label="3D study room preview with a discussion table, nap area and watch room. Walk with WASD or the arrow keys, select a seat to sit, or use the overlay controls."
      fallback={
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-600">
          The 3D room preview could not start because WebGL is unavailable in this browser. You can
          still use the space chat below.
        </div>
      }
    >
      <color attach="background" args={[light.background]} />
      <hemisphereLight args={[light.hemiSky, light.hemiGround, light.hemiIntensity]} />
      <ambientLight intensity={light.ambient} />
      {light.lamps > 0 ? (
        <>
          <pointLight position={[-9.5, 1.7, 4.7]} intensity={5 * light.lamps} distance={7} color="#fbbf24" />
          <pointLight position={[discussionTable.x, 2.3, discussionTable.z + 0.4]} intensity={7 * light.lamps} distance={9} color="#fde7c0" />
          <pointLight position={[10, 1, -2.6]} intensity={2.5 * light.lamps} distance={6} color="#fdba74" />
          <pointLight position={[watchRoom.maxX - 1, 2, watchRoom.screenZ]} intensity={4 * light.lamps} distance={8} color={tvHasVideo ? "#93c5fd" : "#cbd5e1"} />
        </>
      ) : null}
      <directionalLight
        position={light.sunPosition}
        color={light.sunColor}
        intensity={light.sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
      />

      <OrbitControls
        ref={(controls) => {
          cameraResetRef.current = controls
        }}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        target={[0, 0.6, 0]}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        minZoom={16}
        maxZoom={120}
      />
      <CameraFit />
      <CameraHeightRig level={cameraLevel} controlsRef={cameraResetRef} />

      <RoomShell onFloorClick={handleFloorClick} lamps={light.lamps} />
      {onExit ? <ExitPortal position={[EXIT_PORTAL.x, 0, EXIT_PORTAL.z]} onExit={onExit} /> : null}

      <DiscussionTable kind={kind} />
      <ArcLamp position={[discussionTable.x + 3.3, 0, discussionTable.z - 2.5]} lamps={light.lamps} />
      <BoardStand x={discussionTable.x} z={-ROOM.halfDepth + 0.3} postX={1.3} height={1.05} />
      <TaskWhiteboard position={[discussionTable.x, 1.9, -ROOM.halfDepth + 0.3]} tasks={tasks} onOpen={onOpenTasks} />
      <AreaSign position={[discussionTable.x, 0.15, discussionTable.z + 3.1]} label="Discussion table" tone="table" />

      <NapAreaDecor lamps={light.lamps} />
      <AreaSign position={[(napArea.minX + napArea.maxX) / 2 + 1, 1.5, napArea.maxZ]} label="Nap area · quiet please" tone="nap" />

      <WatchRoomDecor hasVideo={tvHasVideo} onOpenTv={onOpenTv} />
      <AreaSign position={[(watchRoom.minX + watchRoom.maxX) / 2 + 1, 1.9, watchRoom.minZ]} label="Watch room" tone="watch" />

      <LockerWall position={[-ROOM.halfWidth + 0.34, 0, 2.6]} slots={lockers} onSelect={onSelectLocker} />
      <RoomGarden position={[-0.3, 0, 6]} lamps={light.lamps} soundOn={gardenSoundOn} onToggleSound={onToggleGardenSound} />
      <RadioSet position={[-6.75, 0.5, 4.95]} playing={musicPlaying} onToggle={onToggleMusic} reducedMotion={reducedMotion} />

      {seats.map((seat) => (
        <SeatFurniture
          key={seat.id}
          seat={seat}
          hovered={hoveredSeatId === seat.id}
          selected={selectedSeatId === seat.id}
          occupied={seatedSeatId === seat.id}
          takenBy={takenBy.get(seat.id)?.name ?? null}
          onHover={setHoveredSeatId}
          onSelect={onSeatSelect}
        />
      ))}

      {samplePeople.map((person, index) => {
        const seat = seats[person.seatIndex]
        if (!seat) return null
        const napping = seat.furniture === "mat"
        return (
          <group key={person.id} position={[seat.sitPoint.x, 0, seat.sitPoint.z]} rotation={[0, seat.faceRotation, 0]}>
            <CharacterFigure
              bodyColor={person.shirt}
              accentColor={person.hair}
              skinColor={person.skin}
              getMode={() => (napping ? "nap" : "seated")}
              typing={seat.zone === "discussion"}
              phaseOffset={index * 1.9}
              reducedMotion={reducedMotion}
            />
            {napping ? <SleepBubble y={1.15} /> : null}
            {showNameTag ? (
              <Html position={[0, napping ? 1.5 : 2.1, napping ? 0.4 : 0]} center style={{ pointerEvents: "none" }} zIndexRange={[18, 0]}>
                <span className="block rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-slate-700 shadow">
                  {person.name} · {napping ? "napping · sample" : "sample"}
                </span>
              </Html>
            ) : null}
          </group>
        )
      })}

      <SpaceCharacter
        character={character}
        target={destination}
        seatedSeat={seatedSeat}
        heldRef={heldRef}
        showNameTag={showNameTag}
        bubbleText={bubbleText}
      />
    </Canvas>
  )
}

function SleepBubble({ y }: { y: number }) {
  return (
    <Html position={[0.3, y, 0.2]} center style={{ pointerEvents: "none" }} zIndexRange={[16, 0]}>
      <span aria-hidden="true" className="block font-bold text-violet-500 motion-safe:animate-pulse">
        <span className="text-[10px]">z</span>
        <span className="text-[13px]">Z</span>
        <span className="text-[16px]">Z</span>
      </span>
    </Html>
  )
}

// Fit the whole room into the canvas on load and resize, then remember it as the reset view.
// Reads the default controls from the store so it re-runs once they exist.
function CameraFit() {
  const get = useThree((state) => state.get)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null

  useEffect(() => {
    if (!controls || width === 0 || height === 0) return
    const camera = get().camera as OrthographicCamera

    const spanX = (ROOM.halfWidth * 2 + ROOM.halfDepth * 2) * Math.SQRT1_2
    const spanY = spanX * 0.58 + ROOM.wallHeight * 0.6
    camera.zoom = Math.min(width / (spanX * 1.04), height / (spanY * 1.08))
    camera.updateProjectionMatrix()
    controls.saveState()
    controls.update()
  }, [get, controls, width, height])

  return null
}

function useFloorTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#e9cfa3"
      ctx.fillRect(0, 0, 256, 64)
      const planks = ["#e6c999", "#edd5ab", "#e2c393", "#ebd1a5"]
      for (let row = 0; row < 4; row += 1) {
        const offset = row % 2 === 0 ? 0 : 96
        for (let column = -1; column < 3; column += 1) {
          ctx.fillStyle = planks[(row + column + 4) % planks.length]
          ctx.fillRect(column * 128 + offset, row * 16, 126, 15)
        }
      }
      ctx.fillStyle = "rgba(122, 86, 52, 0.25)"
      for (let row = 1; row < 4; row += 1) ctx.fillRect(0, row * 16 - 1, 256, 1)
    }
    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    created.wrapS = RepeatWrapping
    created.wrapT = RepeatWrapping
    created.repeat.set(ROOM.halfWidth / 2, ROOM.halfDepth * 1.2)
    created.anisotropy = 8
    return created
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function LowWall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, LOW_WALL / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={WALL_BLUE} />
      </mesh>
      <mesh position={[0, LOW_WALL + 0.03, 0]}>
        <boxGeometry args={[size[0] + 0.04, 0.06, size[2] + 0.04]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

function BoardStand({ x, z, postX, height }: { x: number; z: number; postX: number; height: number }) {
  return (
    <group position={[x, 0, z - 0.08]}>
      {[-postX, postX].map((offset) => (
        <group key={offset} position={[offset, 0, 0]}>
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[0.08, height, 0.08]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.6]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function ExitPortal({ position, onExit }: { position: [number, number, number]; onExit: () => void }) {
  const ring = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    if (ring.current && !reducedMotion) ring.current.rotation.y += delta * 0.8
  })

  return (
    <group
      position={position}
      onClick={(event) => {
        if (event.delta > 4) return
        event.stopPropagation()
        onExit()
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.08, 32]} />
        <meshStandardMaterial color="#dbeafe" />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.03, 32]} />
        <meshStandardMaterial color="#3b82f6" emissive="#60a5fa" emissiveIntensity={hovered ? 0.9 : 0.5} />
      </mesh>
      <group ref={ring} position={[0, 1.05, 0]}>
        <mesh>
          <torusGeometry args={[0.7, 0.06, 12, 40]} />
          <meshStandardMaterial color={WALL_BLUE} emissive="#60a5fa" emissiveIntensity={0.4} />
        </mesh>
      </group>
      <Html position={[0, 2.05, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[14, 0]}>
        <span className="block whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
          {hovered ? "Back to the study hall" : "Exit to hall"}
        </span>
      </Html>
    </group>
  )
}

function CameraHeightRig({
  level,
  controlsRef,
}: {
  level: number
  controlsRef: RefObject<CameraResetHandle | null>
}) {
  const { camera } = useThree()

  useEffect(() => {
    const controls = controlsRef.current as OrbitControlsImpl | null
    if (!controls) return

    const polar = Math.min(Math.max(BASE_POLAR - level * POLAR_STEP, Math.PI / 6), Math.PI / 2.4)
    const spherical = new Spherical(controls.getDistance(), polar, controls.getAzimuthalAngle())
    camera.position.setFromSpherical(spherical).add(controls.target)
    controls.update()
  }, [level, camera, controlsRef])

  return null
}

function RoomShell({ onFloorClick, lamps }: { onFloorClick: (point: { x: number; z: number }) => void; lamps: number }) {
  const backZ = -ROOM.halfDepth
  const leftX = -ROOM.halfWidth
  const floor = useFloorTexture()
  const wallW = ROOM.halfWidth * 2 + 0.3
  const wallD = ROOM.halfDepth * 2 + 0.3

  return (
    <group>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 70]} />
        <meshStandardMaterial color="#dfe7f1" />
      </mesh>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[wallW + 0.4, 0.1, wallD + 0.4]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(event) => {
          if (event.delta > 4) return
          event.stopPropagation()
          onFloorClick({ x: event.point.x, z: event.point.z })
        }}
      >
        <planeGeometry args={[ROOM.halfWidth * 2, ROOM.halfDepth * 2]} />
        <meshStandardMaterial map={floor} roughness={0.7} />
      </mesh>

      <LowWall position={[0, 0, backZ - 0.08]} size={[wallW, LOW_WALL, 0.15]} />
      <LowWall position={[0, 0, ROOM.halfDepth + 0.08]} size={[wallW, LOW_WALL, 0.15]} />
      <LowWall position={[leftX - 0.08, 0, 0]} size={[0.15, LOW_WALL, wallD]} />
      <LowWall position={[ROOM.halfWidth + 0.08, 0, 0]} size={[0.15, LOW_WALL, wallD]} />

      <BoardStand x={-7.6} z={backZ + 0.3} postX={0.55} height={1.9} />
      <PinBoard position={[-7.6, 2.35, backZ + 0.3]} />
      <BoardStand x={0.9} z={backZ + 0.3} postX={0.55} height={1.9} />
      <PinBoard position={[0.9, 2.35, backZ + 0.3]} />

      <Bookshelf position={[leftX + 0.32, 0, -3.6]} />
      <Bookshelf position={[leftX + 0.32, 0, -1.2]} />

      <group position={[-6.75, 0, 4.95]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.05, 20]} />
          <meshStandardMaterial color="#8a6d42" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.05, 0.09, 0.45, 10]} />
          <meshStandardMaterial color="#6d5634" />
        </mesh>
      </group>
      <group position={[-9.5, 0, 4.7]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.05, 16]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.55, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <coneGeometry args={[0.26, 0.3, 20, 1, true]} />
          <meshStandardMaterial color="#f5e6c8" emissive="#fbbf24" emissiveIntensity={0.3 + lamps * 1.2} />
        </mesh>
      </group>

      <Plant position={[-9.3, 0, -6.2]} />
      <Plant position={[3.4, 0, -0.9]} />
      <Plant position={[2.9, 0, 6.6]} />
      <Plant position={[9.6, 0, 7]} />
    </group>
  )
}

type SeatVisualState = "available" | "hovered" | "selected" | "occupied"

const SEAT_COLORS: Record<SeatVisualState, string> = {
  available: "#4a5a6e",
  hovered: "#2f6b4f",
  selected: "#b45309",
  occupied: "#166534",
}

const MAT_COLORS: Record<SeatVisualState, string> = {
  available: "#c4b5fd",
  hovered: "#a78bfa",
  selected: "#f59e0b",
  occupied: "#86efac",
}

function SeatFurniture({
  seat,
  hovered,
  selected,
  occupied,
  takenBy,
  onHover,
  onSelect,
}: {
  seat: SeatDef
  hovered: boolean
  selected: boolean
  occupied: boolean
  takenBy: string | null
  onHover: (seatId: string | null) => void
  onSelect: (seatId: string) => void
}) {
  const state: SeatVisualState = occupied ? "occupied" : selected ? "selected" : hovered ? "hovered" : "available"
  useCursor(hovered)
  const hitSize: [number, number, number] =
    seat.furniture === "mat" ? [1, 0.6, 2] : seat.furniture === "sofa" ? [1.2, 1.2, 1] : seat.furniture === "chair" ? [0.9, 1.5, 0.9] : [1.2, 1.5, 1.2]
  const status = occupied
    ? "You"
    : takenBy
      ? seat.furniture === "mat"
        ? `${takenBy} is napping (sample)`
        : `${takenBy} (sample)`
      : "Available"

  return (
    <group position={[seat.anchor.x, 0, seat.anchor.z]} rotation={[0, seat.furnitureRotationY, 0]}>
      {seat.furniture === "chair" ? <TableChair seatColor={SEAT_COLORS[state]} /> : null}
      {seat.furniture === "armchair" ? <Armchair seatColor={SEAT_COLORS[state]} /> : null}
      {seat.furniture === "mat" ? <NapMat color={MAT_COLORS[state]} /> : null}
      {seat.furniture === "sofa" ? <SofaSeat color={state === "available" ? "#475569" : SEAT_COLORS[state]} /> : null}

      <mesh
        position={[0, hitSize[1] / 2, 0]}
        onPointerOver={(event) => {
          event.stopPropagation()
          onHover(seat.id)
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          onHover(null)
        }}
        onClick={(event) => {
          if (event.delta > 4) return
          event.stopPropagation()
          onSelect(seat.id)
        }}
      >
        <boxGeometry args={hitSize} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered ? (
        <Html position={[0, 1.9, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
          <span className="block rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {seat.name} · {status}
          </span>
        </Html>
      ) : null}
    </group>
  )
}

function TableChair({ seatColor }: { seatColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[0.5, 0.07, 0.5]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.78, -0.23]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.06]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      {[
        [-0.21, -0.21],
        [0.21, -0.21],
        [-0.21, 0.21],
        [0.21, 0.21],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
    </group>
  )
}

function Armchair({ seatColor }: { seatColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.26, 0.72]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.66, -0.3]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.14]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.48, 0]} castShadow>
          <boxGeometry args={[0.13, 0.32, 0.72]} />
          <meshStandardMaterial color={seatColor} />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0.04]}>
        <boxGeometry args={[0.56, 0.08, 0.56]} />
        <meshStandardMaterial color="#f1e6d2" />
      </mesh>
    </group>
  )
}

function NapMat({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.1, 1.9]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.16, -0.72]} scale={[1, 0.4, 0.6]} castShadow>
        <sphereGeometry args={[0.36, 18, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.12, 0.62]} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.55]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.95} />
      </mesh>
    </group>
  )
}

function SofaSeat({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.28, 0.95]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.36, 0.04]} castShadow>
        <boxGeometry args={[1.12, 0.18, 0.82]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, -0.4]} castShadow>
        <boxGeometry args={[1.2, 0.62, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

function SpaceCharacter({
  character,
  target,
  seatedSeat,
  heldRef,
  showNameTag,
  bubbleText,
}: {
  character: StudySpaceCharacter
  target: { x: number; z: number }
  seatedSeat: SeatDef | null
  heldRef: RefObject<Set<WalkKey>>
  showNameTag: boolean
  bubbleText: string | null
}) {
  const groupRef = useRef<Group>(null)
  const modeRef = useRef<FigureMode>("idle")
  const [seated, setSeated] = useState(false)
  // Fixed start position: a position prop that follows the target would teleport the character on every click.
  const [start] = useState(target)
  // Keyboard walking takes over until the next click or seat choice sets a new target.
  const lastTarget = useRef(target)
  const manual = useRef(false)
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null
  const napping = seated && seatedSeat?.furniture === "mat"

  useFrame(({ camera }, delta) => {
    const node = groupRef.current
    if (!node) return

    if (lastTarget.current !== target) {
      lastTarget.current = target
      manual.current = false
    }

    const direction = seatedSeat ? null : walkDirection(heldRef.current, camera, controls?.target ?? node.position)
    if (direction) {
      manual.current = true
      const step = WALK_SPEED * Math.min(delta, 0.05)
      node.position.x = Math.min(Math.max(node.position.x + direction.x * step, -ROOM.halfWidth + MOVE_MARGIN), ROOM.halfWidth - MOVE_MARGIN)
      node.position.z = Math.min(Math.max(node.position.z + direction.z * step, -ROOM.halfDepth + MOVE_MARGIN), ROOM.halfDepth - MOVE_MARGIN)
      node.rotation.y = Math.atan2(direction.x, direction.z)
      modeRef.current = "walk"
      return
    }

    const goal = manual.current && !seatedSeat ? node.position : target
    const dx = goal.x - node.position.x
    const dz = goal.z - node.position.z
    const distance = Math.hypot(dx, dz)
    const reachedSeat = seatedSeat !== null && distance <= 0.03
    if (reachedSeat !== seated) setSeated(reachedSeat)

    if (reachedSeat && seatedSeat) {
      node.position.x = seatedSeat.sitPoint.x
      node.position.z = seatedSeat.sitPoint.z
      node.rotation.y = seatedSeat.faceRotation
      modeRef.current = seatedSeat.furniture === "mat" ? "nap" : "seated"
      return
    }

    if (distance > 0.02) {
      const step = Math.min(distance, WALK_SPEED * delta)
      node.position.x += (dx / distance) * step
      node.position.z += (dz / distance) * step
      node.rotation.y = Math.atan2(dx, dz)
      modeRef.current = "walk"
    } else {
      modeRef.current = "idle"
    }
  })

  const tagY = napping ? 1.5 : seated ? 2.1 : 1.85
  const bubbleY = napping ? 1.9 : seated ? 2.5 : 2.25

  return (
    <group ref={groupRef} position={[start.x, 0, start.z]}>
      <CharacterFigure
        bodyColor={character.bodyColor}
        accentColor={character.accentColor}
        getMode={() => modeRef.current}
        typing={seatedSeat?.zone === "discussion"}
        reducedMotion={reducedMotion}
      />
      {napping ? <SleepBubble y={1.15} /> : null}

      {showNameTag ? (
        <Html position={[0, tagY, napping ? 0.4 : 0]} center style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
          <span className="block rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {character.name}
            {napping ? " · napping" : ""}
          </span>
        </Html>
      ) : null}

      {bubbleText ? (
        <Html position={[0, bubbleY, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[30, 0]}>
          <span className="relative block max-w-48 rounded-xl bg-white px-3 py-2 text-xs leading-4 break-words text-slate-800 shadow-lg">
            {bubbleText}
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-white"
            />
          </span>
        </Html>
      ) : null}
    </group>
  )
}
```

### `study-space-detail-view.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/study-space-detail-view.tsx`

```tsx
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import {
  ArrowDown,
  ArrowUp,
  Armchair,
  ClipboardList,
  DoorOpen,
  FolderOpen,
  KeyRound,
  Maximize2,
  MessageCircle,
  Minimize2,
  Moon,
  Music,
  PencilLine,
  RotateCcw,
  Send,
  Sun,
  Sunset,
  Tags,
  Tv,
} from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CharacterDialog } from "./character-dialog"
import { DrawerPanel } from "./drawer-panel"
import { LockerPanel } from "./locker-panel"
import type { LockerSlot } from "./room-extras"
import { LIGHT_LABELS, useLightPhase, useSharedLightSetting } from "./room-ambience"
import { NapBanner } from "./nap-banner"
import { getSampleLockers, loadOwnLockerCode, saveOwnLockerCode } from "./room-lockers"
import { FocusMusicPanel } from "./focus-music-panel"
import { PomodoroChip, PomodoroPanel } from "./pomodoro-chip"
import { RoomChatPanel, type RoomMessage } from "./room-chat-panel"
import { SeatPanel } from "./seat-panel"
import { TaskBoardPanel } from "./task-board-panel"
import { TvPanel } from "./tv-panel"
import {
  canManageTasks,
  createRoomTask,
  loadRoomTasks,
  moveRoomTask,
  saveRoomTasks,
  toggleRoomTask,
  type RoomTask,
} from "./room-tasks"
import { loadRoomTvVideo, saveRoomTvVideo, type RoomTvVideo } from "./room-tv"
import { getSampleNappers, getSampleRoster, sampleRosterNotice } from "../space-roster"
import { SpaceRoomScene, type CameraResetHandle } from "./space-room-scene"
import { focusMusicTracks } from "./focus-music"
import { buildRoomSpots, buildSeats, roomSpawnPoint } from "./study-space-seats"
import { useFocusMusic } from "./use-focus-music"
import { usePomodoro } from "./use-pomodoro"
import {
  createStudySpaceId,
  loadHallCharacter,
  loadSpaceCharacter,
  loadStudySpaces,
  markStudySpaceVisited,
  saveSpaceCharacter,
  studySpaceRoomPreviewNotice,
  type StudySpaceCharacter,
} from "../study-spaces-records"

const BUBBLE_DURATION_MS = 6000
const GARDEN_TRACK_ID = "forest-breeze"
const OWN_LOCKER_ID = "mine"
const ROOM_SPOTS = buildRoomSpots()
const NAP_MAT_COUNT = ROOM_SPOTS.filter((spot) => spot.furniture === "mat").length

export function StudySpaceDetailView() {
  const { spaceId } = useParams()
  const navigate = useNavigate()
  const space = useMemo(
    () => loadStudySpaces().find((record) => record.id === spaceId) ?? null,
    [spaceId]
  )
  const tableSeats = useMemo(() => (space ? buildSeats(space.kind, space.capacity) : []), [space])
  const seats = useMemo(() => [...tableSeats, ...ROOM_SPOTS], [tableSeats])
  const roster = useMemo(() => (space ? getSampleRoster(space, tableSeats.length) : []), [space, tableSeats.length])
  const samplePeople = useMemo(
    () => (space ? [...roster, ...getSampleNappers(space, roster, tableSeats.length, NAP_MAT_COUNT)] : []),
    [space, roster, tableSeats.length]
  )

  // A room-specific character wins; otherwise the study hall character walks in by default.
  const [character, setCharacter] = useState<StudySpaceCharacter | null>(() =>
    spaceId ? loadSpaceCharacter(spaceId) ?? loadHallCharacter() : null
  )
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [bubble, setBubble] = useState<{ id: string; text: string } | null>(null)
  const [showNameTags, setShowNameTags] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [panel, setPanel] = useState<"music" | "timer" | "drawer" | "lockers" | "tasks" | "tv" | null>(null)
  const [expanded, setExpanded] = useState(false)
  const { setting: lightSetting, cycle: cycleLight } = useSharedLightSetting()
  const lightPhase = useLightPhase(lightSetting)
  const lockers = useMemo(() => (space ? getSampleLockers(space.id, samplePeople) : []), [space, samplePeople])
  const [unlockedLockerIds, setUnlockedLockerIds] = useState<string[]>([])
  const [selectedLockerId, setSelectedLockerId] = useState<string | null>(null)
  const [ownLockerCode, setOwnLockerCode] = useState<string | null>(() => (spaceId ? loadOwnLockerCode(spaceId) : null))
  const [tasks, setTasks] = useState<RoomTask[]>(() => (space ? loadRoomTasks(space) : []))
  const [tvVideo, setTvVideo] = useState<RoomTvVideo | null>(() => (spaceId ? loadRoomTvVideo(spaceId) : null))
  const [standHint, setStandHint] = useState(false)
  const musicOpen = panel === "music"
  const timerOpen = panel === "timer"
  const togglePanel = (name: NonNullable<typeof panel>) => {
    setPanel((current) => (current === name ? null : name))
    setChatOpen(false)
  }
  const [noticeDismissed, setNoticeDismissed] = useState(false)
  const [draft, setDraft] = useState("")
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null)
  const [seatedSeatId, setSeatedSeatId] = useState<string | null>(null)
  const [walkTarget, setWalkTarget] = useState(roomSpawnPoint)
  const [cameraLevel, setCameraLevel] = useState(0)
  const cameraResetRef = useRef<CameraResetHandle | null>(null)
  const bubbleTimeoutRef = useRef<number | null>(null)
  const music = useFocusMusic()
  const timer = usePomodoro()

  useEffect(() => {
    if (spaceId) markStudySpaceVisited(spaceId)
  }, [spaceId])

  useEffect(() => {
    if (!expanded) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !document.querySelector("[data-slot='dialog-content']")) setExpanded(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [expanded])

  if (!space) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card className="border border-slate-200 bg-white shadow-sm ring-0">
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold text-slate-900">Study space not found</h2>
            </CardTitle>
            <CardDescription className="text-slate-600">
              This space is not saved in this browser. It may have been removed or created on another
              device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link to="/students/study-spaces" />}
              className="w-fit"
            >
              Back to study spaces
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // The character dialog must stay open until a character exists; the footer offers a way back.
  const characterDialogOpen = character === null || editDialogOpen
  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId) ?? null
  const seatedSeat = seats.find((seat) => seat.id === seatedSeatId) ?? null
  const freeSeats = tableSeats.length - roster.length - (seatedSeat?.zone === "discussion" ? 1 : 0)
  const napping = seatedSeat?.furniture === "mat"
  const selectedTaker = selectedSeat ? samplePeople.find((person) => seats[person.seatIndex]?.id === selectedSeat.id) ?? null : null
  const isLeader = canManageTasks(space)
  const activeTrack =
    focusMusicTracks.find((track) => track.id === music.playback.trackId) ?? null

  function handleCharacterSubmit(draft: Pick<StudySpaceCharacter, "name" | "bodyColor" | "accentColor">) {
    const next: StudySpaceCharacter = { ...draft, createdAt: new Date().toISOString() }
    if (spaceId) saveSpaceCharacter(spaceId, next)
    setCharacter(next)
    setEditDialogOpen(false)
  }

  function handleSeatSelect(seatId: string) {
    setStandHint(false)
    if (seatId === seatedSeatId) {
      setSelectedSeatId(null)
      return
    }
    setSelectedSeatId(seatId)
  }

  function sitAtSelectedSeat() {
    if (!selectedSeat || selectedTaker) return
    setSeatedSeatId(selectedSeat.id)
    setWalkTarget(selectedSeat.sitPoint)
    setSelectedSeatId(null)
    if (selectedSeat.furniture === "sofa") {
      setChatOpen(false)
      setPanel("tv")
    }
  }

  function standUp() {
    setSeatedSeatId(null)
    setStandHint(false)
  }

  // A seated character only stands through the Stand up button, never from a stray room click.
  function handleFloorPoint(point: { x: number; z: number }) {
    if (seatedSeatId) {
      setStandHint(true)
      return
    }
    setSelectedSeatId(null)
    setWalkTarget(point)
  }

  function updateTasks(update: (current: RoomTask[]) => RoomTask[]) {
    setTasks((current) => {
      const next = update(current)
      if (spaceId) saveRoomTasks(spaceId, next)
      return next
    })
  }

  function handleTvSave(video: RoomTvVideo | null) {
    setTvVideo(video)
    if (spaceId) saveRoomTvVideo(spaceId, video)
  }

  const gardenTrack = focusMusicTracks.find((track) => track.id === GARDEN_TRACK_ID) ?? null
  const gardenSoundOn = music.playback.playing && music.playback.trackId === GARDEN_TRACK_ID
  const lockerSlots: LockerSlot[] = [
    { id: OWN_LOCKER_ID, label: "Your locker", color: "#2f6fe4", mine: true, open: true },
    ...lockers.map((locker) => ({
      id: locker.owner.id,
      label: `${locker.owner.name}'s locker (sample)`,
      color: locker.owner.shirt,
      mine: false,
      open: unlockedLockerIds.includes(locker.owner.id),
    })),
  ]

  function toggleGardenSound() {
    if (gardenSoundOn) music.pause()
    else if (gardenTrack) music.play(gardenTrack)
  }

  function openLocker(lockerId: string) {
    setChatOpen(false)
    if (lockerId === OWN_LOCKER_ID) {
      setPanel("drawer")
      return
    }
    setSelectedLockerId(lockerId)
    setPanel("lockers")
  }

  function handleOwnCodeChange(code: string | null) {
    setOwnLockerCode(code)
    if (spaceId) saveOwnLockerCode(spaceId, code)
  }

  function sendMessage() {
    const text = draft.trim()
    if (text.length === 0 || !character) return

    const message: RoomMessage = {
      id: createStudySpaceId(),
      author: character.name,
      text,
      sentAt: Date.now(),
    }
    setMessages((current) => [...current, message])
    setDraft("")

    setBubble({ id: message.id, text })
    if (bubbleTimeoutRef.current !== null) window.clearTimeout(bubbleTimeoutRef.current)
    bubbleTimeoutRef.current = window.setTimeout(() => setBubble(null), BUBBLE_DURATION_MS)
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        expanded
          ? "fixed inset-0 z-40 bg-slate-100 p-2"
          : "mx-auto h-[calc(100svh-6rem)] min-h-[560px] sm:h-[calc(100svh-7rem)] lg:h-[calc(100svh-8rem)]"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-base font-semibold tracking-tight text-slate-900">
            {space.name}
          </h2>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {space.role === "owner" ? "Created by you" : "Joined"}
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-800"
            title={studySpaceRoomPreviewNotice}
          >
            Local preview
          </Badge>
          <span className="hidden text-xs text-slate-500 sm:inline">
            {freeSeats} of {tableSeats.length} table seats open
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={showNameTags}
            onClick={() => setShowNameTags((current) => !current)}
            aria-label="Toggle name tags"
            title="Name tags"
          >
            <Tags aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCameraLevel((level) => Math.max(level - 1, -2))}
            aria-label="Lower camera"
            title="Lower camera"
          >
            <ArrowDown aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCameraLevel((level) => Math.min(level + 1, 3))}
            aria-label="Raise camera"
            title="Raise camera"
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => cameraResetRef.current?.reset()}
            aria-label="Reset camera"
            title="Reset camera"
          >
            <RotateCcw aria-hidden="true" />
          </Button>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-200" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={musicOpen}
            onClick={() => togglePanel("music")}
            aria-label="Focus music"
            title="Focus music"
          >
            <Music aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={panel === "drawer"}
            onClick={() => togglePanel("drawer")}
            aria-label="My drawer"
            title="My drawer"
          >
            <FolderOpen aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={panel === "lockers"}
            onClick={() => {
              setSelectedLockerId(null)
              togglePanel("lockers")
            }}
            aria-label="Lockers"
            title="Study-mate lockers"
          >
            <KeyRound aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={panel === "tasks"}
            onClick={() => togglePanel("tasks")}
            aria-label="Group tasks"
            title="Group task board"
          >
            <ClipboardList aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={panel === "tv"}
            onClick={() => togglePanel("tv")}
            aria-label="Room TV"
            title="Room TV"
          >
            <Tv aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={chatOpen}
            onClick={() => {
              setChatOpen((current) => !current)
              setPanel(null)
            }}
            aria-label="Toggle chat"
            title="Space chat"
          >
            <MessageCircle aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditDialogOpen(true)}
            disabled={!character}
            aria-label="Edit character"
            title="Edit character"
          >
            <PencilLine aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={cycleLight}
            aria-label={`Room lighting: ${LIGHT_LABELS[lightSetting]}`}
            title={`${LIGHT_LABELS[lightSetting]} — click to change`}
          >
            {lightPhase === "night" ? <Moon aria-hidden="true" /> : lightPhase === "evening" ? <Sunset aria-hidden="true" /> : <Sun aria-hidden="true" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={expanded}
            onClick={() => setExpanded((current) => !current)}
            aria-label={expanded ? "Exit full screen" : "Expand room to full screen"}
            title={expanded ? "Exit full screen (Esc)" : "Full screen"}
          >
            {expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
          </Button>
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon-sm"
            render={<Link to="/students/study-spaces" />}
            aria-label="Leave space"
            title="Leave space"
          >
            <DoorOpen aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-[#e8eef6] shadow-sm">
        {character ? (
          <div className="absolute inset-0">
          <SpaceRoomScene
            character={character}
            kind={space.kind}
            seats={seats}
            samplePeople={samplePeople}
            tasks={tasks}
            tvHasVideo={tvVideo !== null}
            lockers={lockerSlots}
            lightPhase={lightPhase}
            gardenSoundOn={gardenSoundOn}
            musicPlaying={music.playback.playing}
            onOpenTasks={() => setPanel("tasks")}
            onOpenTv={() => setPanel("tv")}
            onSelectLocker={openLocker}
            onToggleGardenSound={toggleGardenSound}
            onToggleMusic={music.toggle}
            selectedSeatId={selectedSeatId}
            seatedSeatId={seatedSeatId}
            walkTarget={walkTarget}
            cameraLevel={cameraLevel}
            showNameTag={showNameTags}
            bubbleText={bubble?.text ?? null}
            cameraResetRef={cameraResetRef}
            onFloorPoint={handleFloorPoint}
            onSeatSelect={handleSeatSelect}
            onExit={() => navigate("/students/study-spaces")}
          />
          </div>
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-[#e8eef6]" />
        )}

        {!noticeDismissed ? (
          <div className="absolute left-3 top-3 z-10 flex max-w-sm items-start gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs leading-5 text-slate-700 shadow-sm">
            <p className="flex-1">
              {studySpaceRoomPreviewNotice}
              {samplePeople.length > 0 ? ` ${sampleRosterNotice}` : ""}
            </p>
            <button
              type="button"
              onClick={() => setNoticeDismissed(true)}
              aria-label="Dismiss preview notice"
              className="shrink-0 rounded text-slate-400 outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              ×
            </button>
          </div>
        ) : null}

        {musicOpen ? (
          <FocusMusicPanel
            playback={music.playback}
            onPlay={music.play}
            onPause={music.pause}
            onPrevious={music.previous}
            onNext={music.next}
            onVolumeChange={music.setVolume}
            onClose={() => setPanel(null)}
          />
        ) : null}

        {panel === "drawer" ? <DrawerPanel spaceId={space.id} onClose={() => setPanel(null)} /> : null}

        {panel === "lockers" ? (
          <LockerPanel
            lockers={lockers}
            selectedId={selectedLockerId}
            unlockedIds={unlockedLockerIds}
            ownCode={ownLockerCode}
            onSelect={setSelectedLockerId}
            onUnlock={(ownerId) =>
              setUnlockedLockerIds((current) => (current.includes(ownerId) ? current : [...current, ownerId]))
            }
            onOwnCodeChange={handleOwnCodeChange}
            onOpenMine={() => setPanel("drawer")}
            onClose={() => setPanel(null)}
          />
        ) : null}

        {panel === "tasks" ? (
          <TaskBoardPanel
            tasks={tasks}
            people={samplePeople}
            isLeader={isLeader}
            onAdd={(draft) => updateTasks((current) => [...current, createRoomTask(draft)])}
            onToggle={(taskId) => updateTasks((current) => toggleRoomTask(current, taskId))}
            onRemove={(taskId) => updateTasks((current) => current.filter((task) => task.id !== taskId))}
            onMove={(taskId, direction) => updateTasks((current) => moveRoomTask(current, taskId, direction))}
            onClose={() => setPanel(null)}
          />
        ) : null}

        {panel === "tv" ? (
          <TvPanel video={tvVideo} isLeader={isLeader} onSave={handleTvSave} onClose={() => setPanel(null)} />
        ) : null}

        {chatOpen ? (
          <RoomChatPanel
            messages={messages}
            onClose={() => setChatOpen(false)}
            className="absolute inset-y-3 right-3 z-10"
          />
        ) : null}

        {timerOpen ? <PomodoroPanel timer={timer} onClose={() => setPanel(null)} /> : null}

        {selectedSeat ? (
          <SeatPanel
            seat={selectedSeat}
            occupied={selectedSeat.id === seatedSeatId}
            takenBy={selectedTaker?.name ?? null}
            onSit={sitAtSelectedSeat}
            onClose={() => setSelectedSeatId(null)}
          />
        ) : null}

        {napping && seatedSeat ? <NapBanner key={seatedSeat.id} onWake={standUp} /> : null}

        <p className="sr-only" role="status" aria-live="polite">
          {bubble ? `You said: ${bubble.text}` : ""}
          {timer.status === "finished" ? " Focus timer finished." : ""}
        </p>

        <div className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          {seatedSeat ? (
            <span className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
              <Armchair className="size-3.5" aria-hidden="true" />
              {napping ? `Resting on ${seatedSeat.name}` : `Seated at ${seatedSeat.name}`}
              <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={standUp}
                className="text-emerald-700 hover:text-emerald-900"
              >
                {napping ? "Get up" : "Stand up"}
              </Button>
            </span>
          ) : (
            <span className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
              <span>Choose a seat in the room</span>
              <span aria-hidden="true" className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                WASD to walk
              </span>
            </span>
          )}

          <form
            className="flex min-w-40 flex-1 items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
          >
            <label htmlFor="space-chat-input" className="sr-only">
              Message in {space.name}
            </label>
            <Input
              id="space-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={character ? "Say something in this room…" : "Create your character to chat"}
              disabled={!character}
              maxLength={200}
              className="rounded-full border-slate-200 bg-slate-50"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!character || draft.trim().length === 0}
              className="rounded-full bg-blue-600 text-white hover:bg-blue-500"
            >
              <Send aria-hidden="true" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>

          {standHint ? (
            <span role="status" className="rounded-lg bg-amber-100 px-2 py-1 text-xs text-amber-900">
              Stand up to walk around.
            </span>
          ) : null}

          {activeTrack ? (
            <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 sm:flex">
              <Music className="size-3.5 text-emerald-600" aria-hidden="true" />
              <span className="max-w-28 truncate">{activeTrack.title}</span>
              <button
                type="button"
                onClick={() => (music.playback.playing ? music.pause() : music.play(activeTrack))}
                aria-label={music.playback.playing ? "Pause music" : "Resume music"}
                className="rounded px-1 text-slate-600 outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {music.playback.playing ? "Pause" : "Play"}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={music.toggle}
              aria-label="Play room music"
              className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex"
            >
              <Music className="size-3.5 text-emerald-600" aria-hidden="true" />
              Play music
            </button>
          )}

          <PomodoroChip
            timer={timer}
            onOpen={() => togglePanel("timer")}
          />
        </div>
      </div>

      <CharacterDialog
        open={characterDialogOpen}
        onOpenChange={setEditDialogOpen}
        required={character === null}
        initial={character}
        onSubmit={handleCharacterSubmit}
      />
    </div>
  )
}
```

### `study-space-detail.test.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/study-space-detail.test.tsx`

```tsx
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudySpaceDetailView } from "./study-space-detail-view"
import { getSampleNappers, getSampleRoster } from "../space-roster"
import {
  sampleCreatedSpaces,
  studyHallCharacterStorageKey,
  studySpaceCharacterStoragePrefix,
} from "../study-spaces-records"
import { buildRoomSpots, buildSeats } from "./study-space-seats"
import { getSampleLockers } from "./room-lockers"
import type { SpaceRoomSceneProps } from "./space-room-scene"

vi.mock("./space-room-scene", () => ({
  SpaceRoomScene: (props: SpaceRoomSceneProps) => (
    <div data-testid="room-scene">
      {props.showNameTag ? <span data-testid="name-tag">{props.character.name}</span> : null}
      {props.bubbleText ? <span data-testid="chat-bubble">{props.bubbleText}</span> : null}
      <button type="button" onClick={() => props.onFloorPoint({ x: 0, z: 0 })}>
        Room floor
      </button>
      {props.seats.map((seat) => (
        <button key={seat.id} type="button" onClick={() => props.onSeatSelect(seat.id)}>
          {seat.name}
        </button>
      ))}
    </div>
  ),
}))

afterEach(cleanup)

beforeEach(() => {
  window.localStorage.clear()
})

function renderAt(spaceId: string) {
  return render(
    <MemoryRouter initialEntries={[`/students/study-spaces/${spaceId}`]}>
      <Routes>
        <Route path="/students/study-spaces/:spaceId" element={<StudySpaceDetailView />} />
      </Routes>
    </MemoryRouter>
  )
}

const sampleSpaceId = "sample-space-physics"

function freeAndTakenSeats() {
  const space = sampleCreatedSpaces.find((record) => record.id === sampleSpaceId)!
  const seats = buildSeats(space.kind, space.capacity)
  const roster = getSampleRoster(space, seats.length)
  const taken = roster.map((person) => ({ person, seat: seats[person.seatIndex] }))
  const free = seats.find((_, index) => !roster.some((person) => person.seatIndex === index))!
  return { free, taken: taken[0] }
}

function seedCharacter(name = "Sam") {
  window.localStorage.setItem(
    `${studySpaceCharacterStoragePrefix}${sampleSpaceId}`,
    JSON.stringify({ name, bodyColor: "#2563eb", accentColor: "#f59e0b", createdAt: "2026-10-01T00:00:00.000Z" })
  )
}

describe("study space detail room", () => {
  it("shows a not-found state for an unknown space id", () => {
    renderAt("missing-space-id")

    expect(screen.getByRole("heading", { name: "Study space not found" })).toBeTruthy()
    const backLink = screen.getByRole("button", { name: "Back to study spaces" })
    expect(backLink.tagName).toBe("A")
  })

  it("asks for a character before entering the room", async () => {
    const user = userEvent.setup()
    renderAt(sampleSpaceId)

    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(screen.getByText("Create your character")).toBeTruthy()
    expect(screen.queryByTestId("room-scene")).toBeNull()

    await user.type(screen.getByLabelText("Display name"), "Alex")
    await user.click(screen.getByRole("button", { name: /Enter room/ }))

    expect(screen.getByTestId("room-scene")).toBeTruthy()
    expect(screen.getByTestId("name-tag").textContent).toBe("Alex")
  })

  it("remembers a saved character and skips the dialog", () => {
    seedCharacter()

    renderAt(sampleSpaceId)

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByTestId("name-tag").textContent).toBe("Sam")
    expect(screen.getByRole("button", { name: "Edit character" })).toBeTruthy()
  })

  it("uses the study hall character by default when the room has none", () => {
    window.localStorage.setItem(
      studyHallCharacterStorageKey,
      JSON.stringify({ name: "Hall Walker", bodyColor: "#16a34a", accentColor: "#f59e0b", createdAt: "2026-10-01T00:00:00.000Z" })
    )
    renderAt(sampleSpaceId)

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByTestId("name-tag").textContent).toBe("Hall Walker")
  })

  it("prefers a room-specific character over the hall character", () => {
    window.localStorage.setItem(
      studyHallCharacterStorageKey,
      JSON.stringify({ name: "Hall Walker", bodyColor: "#16a34a", accentColor: "#f59e0b", createdAt: "2026-10-01T00:00:00.000Z" })
    )
    seedCharacter("Room Sam")
    renderAt(sampleSpaceId)

    expect(screen.getByTestId("name-tag").textContent).toBe("Room Sam")
  })

  it("shows sent messages in the chat panel and as a bubble", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Toggle chat" }))
    await user.type(screen.getByLabelText(/Message in/), "Anyone up for calculus review?")
    await user.click(screen.getByRole("button", { name: /Send/ }))

    expect(screen.getByTestId("chat-bubble").textContent).toBe("Anyone up for calculus review?")
    expect(screen.getByRole("complementary", { name: "Space chat" }).textContent).toContain(
      "Anyone up for calculus review?"
    )
  })

  it("lets the user choose a seat, sit down, and stand up", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const { free } = freeAndTakenSeats()
    await user.click(screen.getByRole("button", { name: free.name }))

    const seatDialog = screen.getByRole("dialog", { name: `Seat: ${free.name}` })
    expect(seatDialog.textContent).toContain("Available")
    expect(seatDialog.textContent).toContain(free.zoneLabel)

    await user.click(screen.getByRole("button", { name: "Sit here" }))

    expect(screen.getByText(`Seated at ${free.name}`)).toBeTruthy()
    expect(screen.queryByRole("dialog", { name: /Seat:/ })).toBeNull()

    await user.click(screen.getByRole("button", { name: "Stand up" }))
    expect(screen.queryByText(/Seated at/)).toBeNull()
    expect(screen.getByText("Choose a seat in the room")).toBeTruthy()
  })

  it("toggles name tags and labels the room as a local preview", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    expect(screen.getByText(/only you are in this room/)).toBeTruthy()
    expect(screen.getByTestId("name-tag")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Toggle name tags" }))
    expect(screen.queryByTestId("name-tag")).toBeNull()
  })

  it("opens the focus timer and starts a focus session", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: /Open focus timer/ }))
    const panel = screen.getByRole("dialog", { name: "Focus timer" })
    expect(panel.textContent).toContain("25:00")

    await user.click(screen.getByRole("button", { name: /^Start$/ }))
    expect(screen.getByText("Focusing…")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy()
  })

  it("lists focus-music categories and marks file tracks as needing audio", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Focus music" }))
    const panel = screen.getByRole("dialog", { name: "Focus music" })

    expect(panel.textContent).toContain("Gentle Rain")
    expect(panel.textContent).toContain("Deep Focus Pad")
    expect(panel.textContent).toContain("needs an audio file")
  })

  it("keeps the character seated when the room floor is clicked", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const { free } = freeAndTakenSeats()
    await user.click(screen.getByRole("button", { name: free.name }))
    await user.click(screen.getByRole("button", { name: "Sit here" }))

    await user.click(screen.getByRole("button", { name: "Room floor" }))
    expect(screen.getByText(`Seated at ${free.name}`)).toBeTruthy()
    expect(screen.getByText("Stand up to walk around.")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Stand up" }))
    expect(screen.queryByText(/Seated at/)).toBeNull()
  })

  it("shows seats held by sample people as taken and does not offer to sit", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const { taken } = freeAndTakenSeats()
    await user.click(screen.getByRole("button", { name: taken.seat.name }))

    const seatDialog = screen.getByRole("dialog", { name: `Seat: ${taken.seat.name}` })
    expect(seatDialog.textContent).toContain(`${taken.person.name} (sample) sits here`)
    expect(screen.queryByRole("button", { name: "Sit here" })).toBeNull()
    expect(screen.getByText(/Sample study-mates are illustrations only/)).toBeTruthy()
  })

  it("lets the leader of a created space add a group task", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Group tasks" }))
    const board = screen.getByRole("dialog", { name: "Group task board" })
    expect(board.textContent).toContain("You are the leader")
    expect(board.textContent).toContain("not sent to other students")

    await user.type(within(board).getByLabelText("Task title"), "Finish problem set 4")
    await user.click(within(board).getByRole("button", { name: "Add task" }))

    expect(within(board).getByRole("checkbox", { name: /Finish problem set 4/ })).toBeTruthy()
    const stored = window.localStorage.getItem(`owlio.study-space-tasks.v1.${sampleSpaceId}`)
    expect(stored).toContain("Finish problem set 4")
  })

  it("lets a group mate tick their own task but not add tasks", async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(
      `${studySpaceCharacterStoragePrefix}sample-space-history`,
      JSON.stringify({ name: "Sam", bodyColor: "#2563eb", accentColor: "#f59e0b", createdAt: "2026-10-01T00:00:00.000Z" })
    )
    renderAt("sample-space-history")

    await user.click(screen.getByRole("button", { name: "Group tasks" }))
    const board = screen.getByRole("dialog", { name: "Group task board" })
    expect(board.textContent).toContain("Group mate")
    expect(within(board).queryByRole("button", { name: "Add task" })).toBeNull()

    const box = within(board).getByRole('checkbox', { name: /Bring one question to the group/ }) as HTMLInputElement
    await user.click(box)
    expect(box.checked).toBe(true)
  })

  it("opens the drawer and the TV, and rejects a non-YouTube link", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "My drawer" }))
    expect(screen.getByRole("dialog", { name: "My drawer" }).textContent).toContain("stay on this device")

    await user.click(screen.getByRole("button", { name: "Room TV" }))
    const tv = screen.getByRole("dialog", { name: "Room TV" })
    await user.type(within(tv).getByLabelText(/Video for the group/), "https://example.com/video")
    await user.click(within(tv).getByRole("button", { name: "Play" }))
    expect(within(tv).getByRole("alert").textContent).toContain("YouTube")

    await user.clear(within(tv).getByLabelText(/Video for the group/))
    await user.type(within(tv).getByLabelText(/Video for the group/), "https://youtu.be/dQw4w9WgXcQ")
    await user.click(within(tv).getByRole("button", { name: "Play" }))
    expect(within(tv).getByTitle("Room TV video").getAttribute("src")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
  })

  it("keeps sample study-mate lockers locked until their code is entered", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const space = sampleCreatedSpaces.find((record) => record.id === sampleSpaceId)!
    const roster = getSampleRoster(space, buildSeats(space.kind, space.capacity).length)
    const [locker] = getSampleLockers(sampleSpaceId, roster)
    const name = locker.owner.name

    await user.click(screen.getByRole("button", { name: "Lockers" }))
    const panel = screen.getByRole("dialog", { name: "Study room lockers" })
    expect(panel.textContent).toContain("Preview lockers")

    await user.click(within(panel).getByRole("button", { name: `Enter code for ${name}'s locker` }))
    const input = within(panel).getByLabelText("Locker code")
    await user.type(input, locker.code === "0000" ? "1111" : "0000")
    await user.click(within(panel).getByRole("button", { name: "Unlock locker" }))
    expect(within(panel).getByText(`That code does not open ${name}'s locker.`)).toBeTruthy()
    expect(within(panel).queryByRole("list", { name: `${name}'s files` })).toBeNull()

    await user.clear(input)
    await user.type(input, locker.code)
    await user.click(within(panel).getByRole("button", { name: "Unlock locker" }))
    const files = within(panel).getByRole("list", { name: `${name}'s files` })
    expect(files.textContent).toContain(locker.files[0].name)
    expect(files.textContent).toContain("sample")
  })

  it("saves the user's own locker code in this browser", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Lockers" }))
    const panel = screen.getByRole("dialog", { name: "Study room lockers" })
    await user.click(within(panel).getByRole("button", { name: "Set a code" }))
    await user.type(within(panel).getByLabelText("New locker code"), "12")
    await user.click(within(panel).getByRole("button", { name: "Save code" }))
    expect(within(panel).getByText("Use 4 to 6 digits.")).toBeTruthy()

    await user.type(within(panel).getByLabelText("New locker code"), "34")
    await user.click(within(panel).getByRole("button", { name: "Save code" }))
    expect(within(panel).getByText("Code set")).toBeTruthy()
    expect(window.localStorage.getItem(`owlio.study-space-locker-code.${sampleSpaceId}`)).toBe("1234")
  })

  it("expands the room to full screen and cycles room lighting", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Expand room to full screen" }))
    expect(screen.getByRole("button", { name: "Exit full screen" }).getAttribute("aria-pressed")).toBe("true")

    await user.click(screen.getByRole("button", { name: "Room lighting: Auto light" }))
    expect(screen.getByRole("button", { name: "Room lighting: Morning light" })).toBeTruthy()
  })

  it("lets the owl nap on a mat with a napping status and wake up again", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const space = sampleCreatedSpaces.find((record) => record.id === sampleSpaceId)!
    const roster = getSampleRoster(space, buildSeats(space.kind, space.capacity).length)
    const tableCount = buildSeats(space.kind, space.capacity).length
    const nappers = getSampleNappers(space, roster, tableCount, 3)
    const mats = buildRoomSpots().filter((spot) => spot.furniture === "mat")
    const freeMat = mats.find((_, index) => !nappers.some((napper) => napper.seatIndex === tableCount + index))!

    await user.click(screen.getByRole("button", { name: freeMat.name }))
    await user.click(screen.getByRole("button", { name: "Rest here" }))

    const banner = screen.getByRole("region", { name: "Nap status" })
    expect(banner.textContent).toContain("You're napping")
    expect(screen.getByText(`Resting on ${freeMat.name}`)).toBeTruthy()

    await user.click(within(banner).getByRole("button", { name: "Wake up" }))
    expect(screen.queryByRole("region", { name: "Nap status" })).toBeNull()
  })

  it("opens the room TV when sitting on a watch-room sofa", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    const sofa = buildRoomSpots().find((spot) => spot.furniture === "sofa")!
    await user.click(screen.getByRole("button", { name: sofa.name }))
    await user.click(screen.getByRole("button", { name: "Sit and watch" }))

    expect(screen.getByRole("dialog", { name: "Room TV" })).toBeTruthy()
    expect(screen.getByText(`Seated at ${sofa.name}`)).toBeTruthy()
  })

  it("shares the lighting choice with the study hall in this browser", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Room lighting: Auto light" }))
    expect(window.localStorage.getItem("owlio.study-light.v1")).toBe("morning")
  })

  it("offers generated lo-fi and piano tracks that need no audio file", async () => {
    const user = userEvent.setup()
    seedCharacter()
    renderAt(sampleSpaceId)

    await user.click(screen.getByRole("button", { name: "Focus music" }))
    const panel = screen.getByRole("dialog", { name: "Focus music" })
    expect(panel.textContent).toContain("Lo-fi Study Loop")
    expect(panel.textContent).toContain("Quiet Piano Arpeggio")
  })
})
```

### `study-space-seats.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/study-space-seats.ts`

```ts
import type { StudySpaceKind } from "../study-spaces-records"

// Shared with space-room-scene.tsx and the floor-plan previews.
export const roomPlan = { halfWidth: 10.5, halfDepth: 7.5 }

export type StudyZone = "discussion" | "nap" | "watch"

export type SeatFurniture = "chair" | "armchair" | "mat" | "sofa"

export type SeatDef = {
  id: string
  name: string
  zone: StudyZone
  zoneLabel: string
  characteristic: string
  furniture: SeatFurniture
  // Where the chair, mat or sofa seat renders in the room.
  anchor: { x: number; z: number }
  furnitureRotationY: number
  // Where the character sits or lies and the direction it faces.
  sitPoint: { x: number; z: number }
  faceRotation: number
}

export type TableShape = "rect" | "oval" | "round"

// One discussion table per room; the room type picks its shape.
export const discussionTable = {
  x: -3.4,
  z: -1.6,
  shape: { focused: "rect", collaborative: "oval", lounge: "round" } as Record<StudySpaceKind, TableShape>,
  rect: { w: 4.6, d: 1.7 },
  oval: { rx: 2.5, rz: 1.35 },
  round: { r: 1.35 },
}

export const napArea = { minX: 4.2, maxX: 10.5, minZ: -7.5, maxZ: -1.8 }
export const watchRoom = { minX: 4.2, maxX: 10.5, minZ: 0.4, maxZ: 7.5, screenZ: 3.95 }

const ZONE_LABELS: Record<StudyZone, string> = {
  discussion: "Discussion table",
  nap: "Nap area",
  watch: "Watch room",
}

const face = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z)

type Spot = { x: number; z: number; characteristic: string }

function rectSpots(capacity: number): Spot[] {
  const { x: tx, z: tz, rect } = discussionTable
  const north = Math.ceil(capacity / 2)
  const south = capacity - north
  const side = (count: number, z: number, characteristic: string) =>
    Array.from({ length: count }, (_, index) => ({
      x: tx + (index - (count - 1) / 2) * 1.1,
      z,
      characteristic,
    }))
  return [
    ...side(north, tz - rect.d / 2 - 0.55, "Facing the room, back to the whiteboard"),
    ...side(south, tz + rect.d / 2 + 0.55, "Facing the whiteboard"),
  ]
}

function ellipseSpots(capacity: number, rx: number, rz: number, characteristic: string): Spot[] {
  const { x: tx, z: tz } = discussionTable
  return Array.from({ length: capacity }, (_, index) => {
    const angle = -Math.PI / 2 + (index / capacity) * Math.PI * 2
    return { x: tx + Math.cos(angle) * rx, z: tz + Math.sin(angle) * rz, characteristic }
  })
}

export function buildSeats(kind: StudySpaceKind, capacity: number): SeatDef[] {
  const count = Math.max(0, Math.min(capacity, 8))
  const shape = discussionTable.shape[kind]
  const spots =
    shape === "rect"
      ? rectSpots(count)
      : shape === "oval"
        ? ellipseSpots(count, discussionTable.oval.rx + 0.75, discussionTable.oval.rz + 0.75, "Around the oval table")
        : ellipseSpots(count, discussionTable.round.r + 0.95, discussionTable.round.r + 0.95, "Cosy armchair by the round table")
  const furniture: SeatFurniture = shape === "round" ? "armchair" : "chair"

  return spots.map((spot, index) => {
    const rotation = face(spot.x, spot.z, discussionTable.x, discussionTable.z)
    return {
      id: `${furniture}-${index}`,
      name: `Table seat ${index + 1}`,
      zone: "discussion",
      zoneLabel: ZONE_LABELS.discussion,
      characteristic: spot.characteristic,
      furniture,
      anchor: { x: spot.x, z: spot.z },
      furnitureRotationY: rotation,
      sitPoint: { x: spot.x, z: spot.z },
      faceRotation: rotation,
    }
  })
}

// Nap mats and watch-room sofa seats, the same in every room.
export function buildRoomSpots(): SeatDef[] {
  const mats: SeatDef[] = [6, 7.8, 9.6].map((x, index) => ({
    id: `mat-${index}`,
    name: `Nap mat ${index + 1}`,
    zone: "nap",
    zoneLabel: ZONE_LABELS.nap,
    characteristic: "Soft mat with a pillow and blanket",
    furniture: "mat",
    anchor: { x, z: -5 },
    furnitureRotationY: 0,
    sitPoint: { x, z: -5.45 },
    faceRotation: 0,
  }))
  const sofas: SeatDef[] = [2.4, 5.4].flatMap((z, sofa) =>
    [-0.6, 0.6].map((offset, index) => ({
      id: `sofa-${sofa * 2 + index}`,
      name: `Sofa seat ${sofa * 2 + index + 1}`,
      zone: "watch" as const,
      zoneLabel: ZONE_LABELS.watch,
      characteristic: "Faces the big screen",
      furniture: "sofa" as const,
      anchor: { x: 6.6, z: z + offset },
      furnitureRotationY: Math.PI / 2,
      sitPoint: { x: 6.6, z: z + offset },
      faceRotation: Math.PI / 2,
    }))
  )
  return [...mats, ...sofas]
}

// Characters enter near the exit portal in the front-left corner.
export const roomSpawnPoint = { x: -roomPlan.halfWidth + 2.4, z: roomPlan.halfDepth - 2.4 }
```

### `task-board-panel.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/task-board-panel.tsx`

```tsx
import { useState } from "react"
import { ArrowDown, ArrowUp, ClipboardList, Plus, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SamplePerson } from "../space-roster"
import { roomTasksNotice, canTickTask, type RoomTask, type RoomTaskAssignee } from "./room-tasks"

type TaskBoardPanelProps = {
  tasks: RoomTask[]
  people: SamplePerson[]
  isLeader: boolean
  onAdd: (draft: { title: string; notes: string; due: string; assignee: RoomTaskAssignee }) => void
  onToggle: (taskId: string) => void
  onRemove: (taskId: string) => void
  onMove: (taskId: string, direction: -1 | 1) => void
  onClose: () => void
}

function assigneeLabel(assignee: RoomTaskAssignee, people: SamplePerson[]): string {
  if (assignee === "everyone") return "Everyone"
  if (assignee === "me") return "You"
  const person = people.find((entry) => entry.id === assignee)
  return person ? `${person.name} (sample)` : "Someone"
}

export function TaskBoardPanel({ tasks, people, isLeader, onAdd, onToggle, onRemove, onMove, onClose }: TaskBoardPanelProps) {
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [due, setDue] = useState("")
  const [assignee, setAssignee] = useState<RoomTaskAssignee>("everyone")
  const [error, setError] = useState<string | null>(null)

  function submit() {
    if (title.trim().length < 2) {
      setError("Add a task title of at least 2 characters.")
      return
    }
    onAdd({ title, notes, due, assignee })
    setTitle("")
    setNotes("")
    setDue("")
    setError(null)
  }

  return (
    <div
      role="dialog"
      aria-label="Group task board"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-y-3 right-3 z-20 flex w-96 max-w-[94%] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <ClipboardList className="size-4 text-emerald-800" aria-hidden="true" />
          Group task board
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            {isLeader ? "You are the leader" : "Group mate"}
          </Badge>
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close task board">
          <X aria-hidden="true" />
        </Button>
      </div>

      <p className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">{roomTasksNotice}</p>

      <ul aria-label="Group tasks" className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {tasks.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
            {isLeader ? "No tasks yet. Add the first task for your group below." : "The leader has not set any tasks."}
          </li>
        ) : null}
        {tasks.map((task, index) => {
          const tickable = canTickTask(task)
          return (
            <li key={task.id} className="rounded-lg border border-slate-200 p-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={task.done}
                  disabled={!tickable}
                  onChange={() => onToggle(task.id)}
                  className="mt-1 size-4 accent-emerald-700"
                />
                <label htmlFor={`task-${task.id}`} className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${task.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {task.title}
                  </span>
                  {task.notes ? <span className="block text-xs text-slate-500">{task.notes}</span> : null}
                  <span className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      {assigneeLabel(task.assignee, people)}
                    </Badge>
                    {task.due ? <span>Due {task.due}</span> : null}
                    {task.sample ? <span>Sample task</span> : null}
                    {!tickable ? <span>Only they can tick this</span> : null}
                  </span>
                </label>
                {isLeader ? (
                  <span className="flex shrink-0 flex-col">
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${task.title} up`} disabled={index === 0} onClick={() => onMove(task.id, -1)}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${task.title} down`} disabled={index === tasks.length - 1} onClick={() => onMove(task.id, 1)}>
                      <ArrowDown aria-hidden="true" />
                    </Button>
                  </span>
                ) : null}
                {isLeader ? (
                  <Button type="button" variant="ghost" size="icon-xs" aria-label={`Delete ${task.title}`} onClick={() => onRemove(task.id)}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {isLeader ? (
        <form
          className="space-y-2 border-t border-slate-100 p-3"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <label htmlFor="task-title" className="sr-only">
            Task title
          </label>
          <Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task for your group" maxLength={100} aria-invalid={error !== null} />
          <label htmlFor="task-notes" className="sr-only">
            Task notes
          </label>
          <Input id="task-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes (optional)" maxLength={200} />
          <div className="flex gap-2">
            <label htmlFor="task-assignee" className="sr-only">
              Assign to
            </label>
            <select
              id="task-assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="everyone">Everyone</option>
              <option value="me">Me</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} (sample)
                </option>
              ))}
            </select>
            <label htmlFor="task-due" className="sr-only">
              Due date
            </label>
            <input
              id="task-due"
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm"
            />
          </div>
          {error ? (
            <p role="alert" className="text-xs text-red-700">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="sm" className="w-full">
            <Plus aria-hidden="true" />
            Add task
          </Button>
        </form>
      ) : (
        <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
          Only the space leader can add or remove tasks. You can tick the tasks that are yours.
        </p>
      )}
    </div>
  )
}
```

### `tv-panel.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/detail/tv-panel.tsx`

```tsx
import { useState } from "react"
import { Tv, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseYouTubeId, roomTvNotice, youTubeEmbedUrl, type RoomTvVideo } from "./room-tv"

type TvPanelProps = {
  video: RoomTvVideo | null
  isLeader: boolean
  onSave: (video: RoomTvVideo | null) => void
  onClose: () => void
}

export function TvPanel({ video, isLeader, onSave, onClose }: TvPanelProps) {
  const [draft, setDraft] = useState(video?.url ?? "")
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const videoId = parseYouTubeId(draft)
    if (!videoId) {
      setError("Paste a full https YouTube link, for example https://www.youtube.com/watch?v=…")
      return
    }
    setError(null)
    onSave({ url: draft.trim(), videoId })
  }

  return (
    <div
      role="dialog"
      aria-label="Room TV"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-x-3 top-3 z-20 mx-auto flex w-[720px] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Tv className="size-4 text-emerald-800" aria-hidden="true" />
          Room TV
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close room TV">
          <X aria-hidden="true" />
        </Button>
      </div>

      {video ? (
        <div className="aspect-video w-full bg-black">
          <iframe
            title="Room TV video"
            src={youTubeEmbedUrl(video.videoId)}
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="size-full border-0"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-slate-900 px-6 text-center text-sm text-slate-300">
          {isLeader
            ? "The TV is off. Paste a YouTube link below to set the video for this room."
            : "No video is set. Paste a YouTube link below to watch something on your own TV."}
        </div>
      )}

      <form
        className="space-y-2 border-t border-slate-100 p-3"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <label htmlFor="tv-url" className="text-xs font-medium text-slate-600">
          {isLeader ? "Video for the group (leader)" : "Your video (only you see this)"}
        </label>
        <div className="flex gap-2">
          <Input
            id="tv-url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            aria-invalid={error !== null}
            inputMode="url"
          />
          <Button type="submit" size="sm">
            Play
          </Button>
          {video ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setDraft("")
                setError(null)
                onSave(null)
              }}
            >
              Turn off
            </Button>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-xs text-red-700">
            {error}
          </p>
        ) : null}
        <p className="text-xs leading-5 text-slate-500">{roomTvNotice} Only https YouTube links are accepted.</p>
      </form>
    </div>
  )
}
```

### `use-focus-music.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/use-focus-music.ts`

```ts
import { useEffect, useRef, useState } from "react"
import { FocusMusicEngine, focusMusicTracks, isTrackPlayable, type MusicTrack } from "./focus-music"
import type { MusicPlayback } from "./focus-music-panel"

const MUSIC_STORAGE_KEY = "owlio.study-space-music.v1"
const DEFAULT_TRACK_ID = "lofi-loop"

function loadMusicPreference(): { trackId: string | null; volume: number } {
  const fallback = { trackId: null, volume: 0.7 }
  if (typeof window === "undefined") return fallback

  try {
    const parsed = JSON.parse(window.localStorage.getItem(MUSIC_STORAGE_KEY) ?? "null") as {
      trackId?: unknown
      volume?: unknown
    } | null
    return {
      trackId: typeof parsed?.trackId === "string" ? parsed.trackId : null,
      volume: typeof parsed?.volume === "number" ? Math.min(Math.max(parsed.volume, 0), 1) : 0.7,
    }
  } catch {
    return fallback
  }
}

export function useFocusMusic() {
  const engineRef = useRef<FocusMusicEngine | null>(null)
  const [playback, setPlayback] = useState<MusicPlayback>(() => ({
    ...loadMusicPreference(),
    playing: false,
    elapsedSeconds: 0,
    error: null,
  }))

  useEffect(() => {
    try {
      window.localStorage.setItem(
        MUSIC_STORAGE_KEY,
        JSON.stringify({ trackId: playback.trackId, volume: playback.volume })
      )
    } catch {
      return
    }
  }, [playback.trackId, playback.volume])

  useEffect(() => {
    return () => {
      engineRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (!playback.playing) return
    const interval = window.setInterval(
      () => setPlayback((current) => ({ ...current, elapsedSeconds: current.elapsedSeconds + 1 })),
      1000
    )
    return () => window.clearInterval(interval)
  }, [playback.playing])

  function getEngine(): FocusMusicEngine | null {
    if (!engineRef.current) {
      const engine = new FocusMusicEngine()
      if (!engine.supported) return null
      engine.setVolume(playback.volume)
      engineRef.current = engine
    }
    return engineRef.current
  }

  function play(track: MusicTrack) {
    if (!isTrackPlayable(track)) return
    const engine = getEngine()
    if (!engine) {
      setPlayback((current) => ({ ...current, error: "Audio playback is not supported in this browser." }))
      return
    }

    try {
      engine.play(track)
      setPlayback((current) => ({
        ...current,
        trackId: track.id,
        playing: true,
        elapsedSeconds: current.trackId === track.id ? current.elapsedSeconds : 0,
        error: null,
      }))
    } catch {
      setPlayback((current) => ({ ...current, playing: false, error: "This track could not be played." }))
    }
  }

  function pause() {
    const engine = engineRef.current
    if (!engine) return
    // Generated ambience is continuous, so pausing stops its nodes; resuming restarts the sound.
    engine.stop()
    setPlayback((current) => ({ ...current, playing: false }))
  }

  // Starts the last chosen track (or Lo-fi) from a user gesture, or pauses the current one.
  function toggle() {
    if (playback.playing) {
      pause()
      return
    }
    const track =
      focusMusicTracks.find((entry) => entry.id === playback.trackId && isTrackPlayable(entry)) ??
      focusMusicTracks.find((entry) => entry.id === DEFAULT_TRACK_ID) ??
      focusMusicTracks.find(isTrackPlayable)
    if (track) play(track)
  }

  function playAdjacent(direction: 1 | -1) {
    const playable = focusMusicTracks.filter(isTrackPlayable)
    if (playable.length === 0) return
    const index = playable.findIndex((track) => track.id === playback.trackId)
    const next = playable[(index + direction + playable.length) % playable.length]
    play(next)
  }

  function setVolume(volume: number) {
    engineRef.current?.setVolume(volume)
    setPlayback((current) => ({ ...current, volume }))
  }

  return {
    playback,
    play,
    pause,
    toggle,
    next: () => playAdjacent(1),
    previous: () => playAdjacent(-1),
    setVolume,
  }
}
```

### `use-pomodoro.ts`

Current file: `src/components/features/personal-workspace/study-spaces/detail/use-pomodoro.ts`

```ts
import { useEffect, useRef, useState } from "react"

export type PomodoroMode = "focus" | "break"
export type PomodoroStatus = "idle" | "running" | "paused" | "finished"

export const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60 * 1000,
  break: 5 * 60 * 1000,
}

export type PomodoroState = {
  mode: PomodoroMode
  status: PomodoroStatus
  remainingMs: number
}

// Remaining time is derived from an absolute end timestamp, so countdown drift
// never accumulates from interval timing.
export function usePomodoro() {
  const [mode, setMode] = useState<PomodoroMode>("focus")
  const [status, setStatus] = useState<PomodoroStatus>("idle")
  const [remainingMs, setRemainingMs] = useState(POMODORO_DURATIONS.focus)
  const endsAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (status !== "running" || endsAtRef.current === null) return

    const tick = () => {
      const remaining = (endsAtRef.current ?? 0) - Date.now()
      if (remaining <= 0) {
        setRemainingMs(0)
        setStatus("finished")
      } else {
        setRemainingMs(remaining)
      }
    }

    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [status])

  function start(nextMode: PomodoroMode = mode) {
    setMode(nextMode)
    endsAtRef.current = Date.now() + POMODORO_DURATIONS[nextMode]
    setRemainingMs(POMODORO_DURATIONS[nextMode])
    setStatus("running")
  }

  function pause() {
    if (status !== "running") return
    setRemainingMs(Math.max(0, (endsAtRef.current ?? 0) - Date.now()))
    setStatus("paused")
  }

  function resume() {
    if (status !== "paused") return
    endsAtRef.current = Date.now() + remainingMs
    setStatus("running")
  }

  function reset() {
    endsAtRef.current = null
    setRemainingMs(POMODORO_DURATIONS[mode])
    setStatus("idle")
  }

  function selectMode(nextMode: PomodoroMode) {
    if (status === "running") return
    setMode(nextMode)
    endsAtRef.current = null
    setRemainingMs(POMODORO_DURATIONS[nextMode])
    setStatus("idle")
  }

  return { mode, status, remainingMs, start, pause, resume, reset, selectMode }
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
```

<!-- END GENERATED CURRENT SOURCE -->
