# Personal subjects

Target: `src/components/features/personal-workspace/subjects/`. All destinations below are proposals.

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `subject-appearance.ts` (display metadata) |
| `forms/` | `subject-composer-dialog.tsx`, `subject-delete-dialog.tsx`, `subject-milestone-delete-dialog.tsx`, `subject-milestone-dialog.tsx` |
| `ui/` | `continue-learning.tsx`, `sample-data-notice.tsx`, `subject-action-button.tsx`, `subject-card.tsx`, `subject-congrats-dialog.tsx`, `subject-list-row.tsx`, `subject-milestones-card.tsx`, `subject-study-content.tsx`, `subjects-hero.tsx` |
| `model/` | `subject-records.ts` (browser-local data) |
| `view/` | `subject-detail-view.tsx`, `subjects-view.tsx`, `subjects-view.test.tsx` |

Separate the large subject detail view's independent panels only after tracing updates and storage revision behavior. Verify editing and deletion against existing local records; changing folders must not discard a student's work.

[Personal workspace plans](../README.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/personal-workspace/subjects/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `continue-learning.tsx`

Current file: `src/components/features/personal-workspace/subjects/continue-learning.tsx`

```tsx
import { ArrowRight, BookOpen, Layers3 } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { getSubjectCoverColor, getSubjectMilestoneState, sortSubjects, type SubjectRecord } from "./subject-records"

export function ContinueLearning({ subjects }: { subjects: SubjectRecord[] }) {
  const ongoing = sortSubjects(subjects).filter((subject) => {
    const progress = getSubjectMilestoneState(subject)
    return progress.total > 0 && !progress.allDone && (subject.progressStarted || progress.completed > 0 || progress.active !== null)
  }).slice(0, 2)
  if (ongoing.length === 0) return null

  return (
    <section aria-labelledby="continue-learning-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="continue-learning-heading" className="text-lg font-semibold tracking-tight text-foreground">Continue learning</h2>
        <a href="#subject-library" className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring">Browse all subjects <ArrowRight aria-hidden="true" className="size-3.5" /></a>
      </div>
      <ul className="grid gap-4 xl:grid-cols-2">
        {ongoing.map((subject) => {
          const progress = getSubjectMilestoneState(subject)
          const next = progress.active ?? subject.milestones.find((item) => item.status !== "completed")
          if (!next) return null
          const href = `/students/subjects/${subject.id}?topic=${encodeURIComponent(next.id)}`
          return (
            <li key={subject.id} className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
              <div className="flex items-center gap-4 p-3 sm:p-4">
                <div aria-hidden="true" className={`relative hidden h-28 w-36 shrink-0 overflow-hidden rounded-lg sm:block ${getSubjectCoverColor(subject.coverColor).className}`}>
                  {subject.coverImage ? <img src={subject.coverImage} alt="" className="size-full object-cover" /> : null}
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-slate-950/65 px-1.5 py-1 text-[10px] text-white"><Layers3 className="size-3" />{progress.total} topics</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><BookOpen aria-hidden="true" className="size-3.5 text-brand" />Personal subject</span>
                  <h3 className="mt-1 truncate text-sm font-semibold text-foreground">{subject.name}</h3>
                  <div className="mt-4 flex items-end gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-[11px] text-muted-foreground">Topic progress <span className="font-medium text-foreground">{progress.progress}%</span></p>
                      <div role="progressbar" aria-label={`${subject.name} topic progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.progress} className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.progress}%` }} /></div>
                    </div>
                    <Button nativeButton={false} role="link" variant="outline" size="sm" render={<Link to={href} aria-label={`Continue studying ${subject.name}`} />} className="rounded-lg px-3">Continue</Button>
                  </div>
                </div>
              </div>
              <Link to={href} aria-label={`Next topic for ${subject.name}: ${next.title}`} className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2.5 text-xs outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                <BookOpen aria-hidden="true" className="size-3.5 shrink-0 text-brand" /><span className="shrink-0 text-muted-foreground">Up next</span><span className="truncate font-medium text-brand">{next.title}</span><ArrowRight aria-hidden="true" className="ml-auto size-3.5 shrink-0 text-brand" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
```

### `sample-data-notice.tsx`

Current file: `src/components/features/personal-workspace/subjects/sample-data-notice.tsx`

```tsx
import { Info } from "lucide-react"

export function SampleDataNotice({ hasExamples = true }: { hasExamples?: boolean }) {
  return (
    <section
      aria-label="Sample data notice"
      className="flex items-start gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 text-muted-foreground"
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-xs leading-5"><span className="font-medium text-foreground">Browser preview.</span> {hasExamples ? "Includes example subjects. " : ""}Your subjects and topic progress stay in this browser, separate from classroom records.</p>
      </div>
    </section>
  )
}
```

### `subject-action-button.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-action-button.tsx`

```tsx
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type SubjectActionButtonProps = {
  icon: LucideIcon
  label: string
  onClick: () => void
  tone?: "default" | "danger"
}

export function SubjectActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: SubjectActionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className={`group relative rounded-lg bg-background ${
        tone === "danger"
          ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </Button>
  )
}
```

### `subject-appearance.ts`

Current file: `src/components/features/personal-workspace/subjects/subject-appearance.ts`

```ts
import { getSubjectThemeColorName, type SubjectRecord } from "./subject-records"

const subjectThemeColors: Record<string, { background: string; border: string; accent: string; glow: string }> = {
  blue: { background: "#eff6ff", border: "#bfdbfe", accent: "#2563eb", glow: "#93c5fd" },
  emerald: { background: "#ecfdf5", border: "#a7f3d0", accent: "#059669", glow: "#6ee7b7" },
  violet: { background: "#f5f0ff", border: "#ddd0ff", accent: "#8a60f1", glow: "#c4b5fd" },
  amber: { background: "#fffbeb", border: "#fde68a", accent: "#d97706", glow: "#fcd34d" },
  rose: { background: "#fff1f2", border: "#fecdd3", accent: "#e11d48", glow: "#fda4af" },
  slate: { background: "#f1f5f9", border: "#cbd5e1", accent: "#475569", glow: "#94a3b8" },
}

export const defaultSubjectAppearance = subjectThemeColors.blue

export function getSubjectAppearance(subject: SubjectRecord) {
  return subjectThemeColors[getSubjectThemeColorName(subject)] ?? subjectThemeColors.blue
}
```

### `subject-card.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-card.tsx`

```tsx
import { ArrowUpRight, BookOpen, Layers3, MoreVertical, Palette, Trash } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSubjectCoverColor, getSubjectProgress, getSubjectStatus, type SubjectRecord } from "./subject-records"

type SubjectCardProps = {
  subject: SubjectRecord
  href: string
  onCustomize: (subject: SubjectRecord) => void
  onDelete: (subject: SubjectRecord) => void
}

export function SubjectCard({ subject, href, onCustomize, onDelete }: SubjectCardProps) {
  const coverColor = getSubjectCoverColor(subject.coverColor)
  const progress = getSubjectProgress(subject)
  const status = getSubjectStatus(subject)

  return (
    <Card size="sm" className="group/subject relative h-full gap-0 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xs ring-0 transition-shadow hover:shadow-md motion-reduce:transition-none">
      <div className="relative h-32 overflow-hidden rounded-lg bg-muted">
        {subject.coverImage ? (
          <img
            src={subject.coverImage}
            alt=""
            aria-hidden="true"
            className="size-full object-cover transition-transform duration-300 group-hover/subject:scale-[1.025] motion-reduce:transition-none"
          />
        ) : (
          <div aria-hidden="true" className={`absolute inset-0 ${coverColor.className}`} />
        )}

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-slate-950/65 px-1.5 py-1 text-[10px] font-medium text-white"><Layers3 aria-hidden="true" className="size-3" />{subject.milestones.length} topics</span>
      </div>

      <CardContent className="flex-1 gap-0 px-3 py-3">
        <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><BookOpen aria-hidden="true" className="size-3.5 text-brand" />Personal subject{subject.seeded ? <span className="ml-auto text-[10px]">Example</span> : null}</p>
        <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Link
            to={href}
            className="block rounded text-sm font-semibold leading-5 tracking-tight text-foreground outline-none after:absolute after:inset-0 after:content-[''] hover:text-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {subject.name}
          </Link>
          {subject.instructor ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {subject.instructor}
            </p>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Options for ${subject.name}`}
                className="relative z-10 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              />
            }
          >
            <MoreVertical aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCustomize(subject)}>
              <Palette aria-hidden="true" />
              Customize
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(subject)}>
              <Trash aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
          {subject.code ? <span className="rounded bg-muted px-2 py-0.5">{subject.code}</span> : null}
          <span className="rounded bg-muted px-2 py-0.5">{status === "completed" ? "Completed" : status === "in-progress" ? "In progress" : "Not started"}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-xs text-muted-foreground">{subject.milestones.length === 0 ? "Build your study plan" : <><span className="font-medium text-foreground">{progress}%</span> of topics complete</>}</span>
          <span aria-hidden="true" className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xs">{progress >= 100 ? "Review" : progress > 0 ? "Continue" : "Open"}<ArrowUpRight className="size-3" /></span>
        </div>
      </CardContent>
    </Card>
  )
}
```

### `subject-composer-dialog.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-composer-dialog.tsx`

```tsx
import { useRef, useState } from "react"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  defaultSubjectCoverColor,
  subjectCoverColors,
  subjectCoverImageLimitBytes,
  subjectCoverImageLimitLabel,
  subjectCoverPresets,
  subjectsGuidance,
  type SubjectCoverMeta,
  type SubjectDraft,
  type SubjectRecord,
} from "./subject-records"

type SubjectComposerDialogProps = {
  open: boolean
  subject: SubjectRecord | null
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: SubjectDraft) => void
  onCoverChange?: (cover: { coverColor: string; coverImage: string | null }) => void
}

export function SubjectComposerDialog({
  open,
  subject,
  onOpenChange,
  onSubmit,
  onCoverChange,
}: SubjectComposerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <SubjectComposerForm
          key={subject?.id ?? "new-subject"}
          subject={subject}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
          onCoverChange={onCoverChange}
        />
      </DialogContent>
    </Dialog>
  )
}

type SubjectComposerFormProps = {
  subject: SubjectRecord | null
  onCancel: () => void
  onSubmit: (draft: SubjectDraft) => void
  onCoverChange?: (cover: { coverColor: string; coverImage: string | null }) => void
}

function SubjectComposerForm({
  subject,
  onCancel,
  onSubmit,
  onCoverChange,
}: SubjectComposerFormProps) {
  const [name, setName] = useState(subject?.name ?? "")
  const [code, setCode] = useState(subject?.code ?? "")
  const [instructor, setInstructor] = useState(subject?.instructor ?? "")
  const [coverColor, setCoverColor] = useState(
    subject?.coverColor ?? defaultSubjectCoverColor
  )
  const [coverImage, setCoverImage] = useState<string | null>(subject?.coverImage ?? null)
  const [coverError, setCoverError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setCoverError("Choose an image file.")
      return
    }

    if (file.size > subjectCoverImageLimitBytes) {
      setCoverError(`Choose an image under ${subjectCoverImageLimitLabel}.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      if (!result) {
        setCoverError("That image could not be read.")
        return
      }

      setCoverError(null)
      setCoverImage(result)
      onCoverChange?.({ coverColor, coverImage: result })
    }
    reader.onerror = () => setCoverError("That image could not be read.")
    reader.readAsDataURL(file)
  }

  function handleCoverColorChange(color: SubjectCoverMeta) {
    setCoverColor(color.value)
    setCoverImage(null)
    onCoverChange?.({ coverColor: color.value, coverImage: null })
  }

  function handleRemoveImage() {
    setCoverImage(null)
    setCoverError(null)
    onCoverChange?.({ coverColor, coverImage: null })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleSubmit() {
    const trimmedName = name.trim()
    const nextNameError = trimmedName.length < 2 ? "Give your subject a name." : null

    setNameError(nextNameError)
    if (nextNameError) return

    onSubmit({
      name: trimmedName,
      code: code.trim(),
      instructor: instructor.trim(),
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {subject ? "Customize subject" : "New subject"}
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        {subject ? (
          <fieldset className="grid gap-3">
            <legend className="text-xs font-medium text-slate-500">Background</legend>

            <div className="grid gap-2">
              <p className="text-xs font-medium text-slate-600">Illustration</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Background illustration">
                {subjectCoverPresets.map((preset) => {
                  const isActive = coverImage === preset.file

                  return (
                    <label key={preset.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="subject-cover-preset"
                        value={preset.file}
                        checked={isActive}
                        onChange={() => {
                          setCoverError(null)
                          setCoverImage(preset.file)
                          onCoverChange?.({ coverColor, coverImage: preset.file })
                        }}
                        className="peer sr-only"
                      />
                      <span
                        className="block size-14 overflow-hidden rounded-lg ring-offset-2 transition peer-checked:ring-2 peer-checked:ring-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500"
                      >
                        <img src={preset.file} alt="" aria-hidden="true" className="size-full object-cover" />
                        <span className="sr-only">{preset.label}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <p className="text-xs font-medium text-slate-600">Colour</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Background colour">
                {subjectCoverColors.map((color) => {
                  const isActive = color.value === coverColor && coverImage === null

                  return (
                    <label key={color.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="subject-cover-color"
                        value={color.value}
                        checked={isActive}
                        onChange={() => handleCoverColorChange(color)}
                        className="peer sr-only"
                      />
                      <span
                        className={`flex size-9 items-center justify-center rounded-full ring-offset-2 transition peer-checked:ring-2 peer-checked:ring-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 ${color.className}`}
                      >
                        <span className="sr-only">{color.label}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="subject-cover-image" className="text-slate-700">
                Background image
              </FieldLabel>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  id="subject-cover-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full max-w-xs text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                {coverImage ? (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage}>
                    <Trash aria-hidden="true" />
                    Remove image
                  </Button>
                ) : null}
              </div>
              <FieldDescription className="text-slate-500">
                Optional. Stored in this browser only, up to {subjectCoverImageLimitLabel}.
              </FieldDescription>
              {coverError ? (
                <p role="alert" className="text-sm text-destructive">
                  {coverError}
                </p>
              ) : null}
            </div>

            {coverImage ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <img
                  src={coverImage}
                  alt=""
                  aria-hidden="true"
                  className="size-12 rounded-lg object-cover"
                />
                <p className="text-xs leading-5 text-slate-500">
                  This image is now the subject background.
                </p>
              </div>
            ) : null}
          </fieldset>
        ) : null}

        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="subject-name" className="text-slate-700">
            Subject name
          </FieldLabel>
          <Input
            id="subject-name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "subject-name-error" : undefined}
            placeholder="e.g. Physics I"
            autoComplete="off"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="subject-name-error">{nameError}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="subject-code" className="text-slate-700">
            Code <span className="font-normal text-slate-400">(optional)</span>
          </FieldLabel>
          <Input
            id="subject-code"
            value={code}
            onChange={(event) => setCode(event.currentTarget.value)}
            placeholder="e.g. SCI-PHY1"
            autoComplete="off"
            className="border-slate-200 bg-slate-50"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="subject-instructor" className="text-slate-700">
            Instructor <span className="font-normal text-slate-400">(optional)</span>
          </FieldLabel>
          <Input
            id="subject-instructor"
            value={instructor}
            onChange={(event) => setInstructor(event.currentTarget.value)}
            placeholder="e.g. Ramon Diaz"
            autoComplete="off"
            className="border-slate-200 bg-slate-50"
          />
          <FieldDescription className="text-slate-500">{subjectsGuidance}</FieldDescription>
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-blue-700 text-white hover:bg-blue-800"
          onClick={handleSubmit}
        >
          {subject ? "Save changes" : "Create subject"}
        </Button>
      </DialogFooter>
    </>
  )
}
```

### `subject-congrats-dialog.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-congrats-dialog.tsx`

```tsx
import { CircleCheck } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SubjectCongratsDialogProps = {
  open: boolean
  subjectName: string
  onOpenChange: (open: boolean) => void
}

export function SubjectCongratsDialog({
  open,
  subjectName,
  onOpenChange,
}: SubjectCongratsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-7 px-6 py-10 text-center sm:max-w-lg sm:px-10">
        <DialogHeader className="items-center">
          <span className="mb-3 inline-flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CircleCheck aria-hidden="true" className="size-10" />
          </span>
          <DialogTitle className="mt-2 text-lg font-semibold text-slate-900">
            Congrats, you completed {subjectName}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">Every milestone in your personal study plan is done. Your progress is kept in this browser, separate from classroom results.</DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button nativeButton={false} role="link" render={<Link to="/students/subjects" />} className="bg-brand text-brand-foreground hover:bg-brand/90">Back to My Learning</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Keep learning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### `subject-delete-dialog.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-delete-dialog.tsx`

```tsx
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SubjectRecord } from "./subject-records"

type SubjectDeleteDialogProps = {
  open: boolean
  subject: SubjectRecord | null
  onOpenChange: (open: boolean) => void
  onConfirm: (subject: SubjectRecord) => void
}

export function SubjectDeleteDialog({
  open,
  subject,
  onOpenChange,
  onConfirm,
}: SubjectDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Delete this subject?
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {subject
              ? `“${subject.name}” will be removed from this browser.`
              : "This subject will be removed."}{" "}
            Your notes and tasks are not deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep subject
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (!subject) return
              onConfirm(subject)
            }}
          >
            <Trash aria-hidden="true" />
            Delete subject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### `subject-detail-view.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-detail-view.tsx`

```tsx
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FolderOpen,
  NotebookPen,
  Palette,
  Plus,
  Trash,
} from "lucide-react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { NoteEditorDialog } from "@/components/features/personal-workspace/notes/forms/note-editor-dialog"
import {
  createNoteId,
  loadNotes,
  saveNotes,
} from "@/components/features/personal-workspace/notes/utils/note-records"
import type { NoteRecord } from "@/components/features/personal-workspace/notes/contents/note-records"
import { TaskComposerDialog } from "@/components/features/personal-workspace/tasks/task-composer-dialog"
import {
  createTaskId,
  loadTasks,
  saveTasks,
  type TaskDraft,
  type TaskRecord,
} from "@/components/features/personal-workspace/tasks/task-records"
import { SubjectActionButton } from "./subject-action-button"
import { SubjectCongratsDialog } from "./subject-congrats-dialog"
import { SubjectComposerDialog } from "./subject-composer-dialog"
import { SubjectDeleteDialog } from "./subject-delete-dialog"
import { SubjectMilestoneDeleteDialog } from "./subject-milestone-delete-dialog"
import { SubjectMilestoneDialog } from "./subject-milestone-dialog"
import { SubjectMilestonesCard } from "./subject-milestones-card"
import { SubjectStudyContent } from "./subject-study-content"
import { getSubjectAppearance } from "./subject-appearance"
import {
  createMilestoneId,
  findSubjectById,
  getSubjectCoverColor,
  getSubjectMilestoneState,
  getSubjectTag,
  getSubjectTheme,
  loadSubjects,
  notesForSubject,
  saveSubjects,
  subjectsGuidance,
  subjectsStorageNotice,
  tasksForSubject,
  type SubjectDraft,
  type SubjectMilestone,
  type SubjectRecord,
} from "./subject-records"

const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatSubjectDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Recently"

  return createdAtFormatter.format(parsed)
}

type MilestoneSnapshot = {
  milestones: SubjectMilestone[]
  progressStarted: boolean
}

type RemovalSnapshot = {
  milestones: SubjectMilestone[]
  progressStarted: boolean
  label: string
}

function activateNextMilestone(milestones: SubjectMilestone[]): SubjectMilestone[] {
  const nextIndex = milestones.findIndex((item) => item.status === "not-started")
  if (nextIndex === -1) return milestones

  return milestones.map((item, index) =>
    index === nextIndex ? { ...item, status: "in-progress" } : item
  )
}

export function SubjectDetailView() {
  const { subjectId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const [subjects, setSubjects] = useState<SubjectRecord[]>(() => loadSubjects())
  const [notes, setNotes] = useState(() => loadNotes())
  const [tasks, setTasks] = useState(() => loadTasks())
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [draftNote, setDraftNote] = useState<NoteRecord | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<SubjectMilestone | null>(null)
  const [removeMilestoneTarget, setRemoveMilestoneTarget] = useState<SubjectMilestone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubjectRecord | null>(null)
  const [congratsOpen, setCongratsOpen] = useState(false)
  const [milestoneHistory, setMilestoneHistory] = useState<MilestoneSnapshot[]>([])
  const [removalSnapshot, setRemovalSnapshot] = useState<RemovalSnapshot | null>(null)

  useEffect(() => {
    saveSubjects(subjects)
  }, [subjects])

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const subject = useMemo(() => findSubjectById(subjects, subjectId), [subjects, subjectId])
  const reading = subject?.milestones.some((item) => item.id === searchParams.get("topic")) ?? false

  useEffect(() => {
    if (!reading) pageRef.current?.scrollIntoView?.({ block: "start" })
  }, [reading, subjectId])

  const subjectNotes = useMemo(
    () => (subject ? notesForSubject(notes, subject) : []),
    [notes, subject]
  )

  const subjectTasks = useMemo(
    () => (subject ? tasksForSubject(tasks, subject) : []),
    [tasks, subject]
  )

  function updateSubject(patch: Partial<SubjectRecord>) {
    if (!subject) return

    setSubjects((current) =>
      current.map((item) =>
        item.id === subject.id
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item
      )
    )
  }

  function pushMilestoneHistory() {
    if (!subject) return

    setMilestoneHistory((current) => [
      ...current,
      { milestones: subject.milestones, progressStarted: subject.progressStarted },
    ])
  }

  function handleSubmit(draft: SubjectDraft) {
    updateSubject({
      name: draft.name,
      code: draft.code,
      instructor: draft.instructor,
    })
    setCustomizeOpen(false)
  }

  function handleCoverChange(cover: { coverColor: string; coverImage: string | null }) {
    updateSubject(cover)
  }

  function handleDelete(target: SubjectRecord) {
    setSubjects((current) => current.filter((item) => item.id !== target.id))
    setDeleteTarget(null)
    navigate("/students/subjects", { replace: true })
  }

  function handleAddMilestone(title: string) {
    if (!subject) return

    updateSubject({
      milestones: [
        ...subject.milestones,
        { id: createMilestoneId(), title, status: "not-started" },
      ],
    })
    setMilestoneDialogOpen(false)
    setEditingMilestone(null)
  }

  function handleEditMilestone(title: string) {
    if (!subject || !editingMilestone) return

    updateSubject({
      milestones: subject.milestones.map((item) =>
        item.id === editingMilestone.id ? { ...item, title } : item
      ),
    })
    setMilestoneDialogOpen(false)
    setEditingMilestone(null)
  }

  function handleDeleteMilestone(milestone: SubjectMilestone) {
    if (!subject) return

    setRemovalSnapshot({
      milestones: subject.milestones,
      progressStarted: subject.progressStarted,
      label: "Undo removed milestone",
    })
    updateSubject({
      milestones: subject.milestones.filter((item) => item.id !== milestone.id),
    })
    setRemoveMilestoneTarget(null)
  }

  function handleRemoveAllMilestones() {
    if (!subject) return

    setRemovalSnapshot({
      milestones: subject.milestones,
      progressStarted: subject.progressStarted,
      label: "Undo removed milestones",
    })
    updateSubject({ milestones: [], progressStarted: false })
  }

  function handleUndoRemoval() {
    if (!subject || !removalSnapshot) return

    updateSubject({
      milestones: removalSnapshot.milestones,
      progressStarted: removalSnapshot.progressStarted,
    })
    setRemovalSnapshot(null)
  }

  function openNoteComposer() {
    if (!subject) return

    const timestamp = new Date().toISOString()
    setDraftNote({
      id: createNoteId(),
      title: "",
      body: "",
      labels: [getSubjectTag(subject)],
      kind: "text",
      color: "default",
      items: [],
      updatedAt: timestamp,
      pinned: false,
      archived: false,
      trashed: false,
    })
  }

  function handleDraftNoteChange(updated: NoteRecord) {
    setDraftNote(updated)
  }

  function handleDraftNoteCommit() {
    if (!draftNote) return

    const hasContent =
      draftNote.title.trim().length > 0 || draftNote.body.trim().length > 0

    if (hasContent) {
      setNotes((current) => [draftNote, ...current])
    }

    setDraftNote(null)
  }

  function handleAddTask(draft: TaskDraft) {
    if (!subject) return

    const task: TaskRecord = {
      id: createTaskId(),
      title: draft.title,
      subject: subject.name,
      dueDate: draft.dueDate,
      priority: draft.priority,
      status: draft.status,
      notes: draft.notes,
      createdAt: new Date().toISOString(),
    }

    setTasks((current) => [task, ...current])
    setTaskDialogOpen(false)
  }

  function handleStartProgress() {
    if (!subject) return

    pushMilestoneHistory()
    updateSubject({
      progressStarted: true,
      milestones: activateNextMilestone(subject.milestones),
    })
  }

  function handleStartNextMilestone() {
    if (!subject) return

    pushMilestoneHistory()
    updateSubject({ milestones: activateNextMilestone(subject.milestones) })
  }

  function handleCompleteMilestone(milestoneId?: string) {
    if (!subject) return

    pushMilestoneHistory()
    const milestones: SubjectMilestone[] = subject.milestones.map((item) =>
      item.id === (milestoneId ?? subject.milestones.find((milestone) => milestone.status === "in-progress")?.id)
        ? { ...item, status: "completed" }
        : item
    )
    const allDone =
      milestones.length > 0 && milestones.every((item) => item.status === "completed")

    updateSubject({ milestones, progressStarted: true })

    if (allDone) setCongratsOpen(true)
  }

  function handleUndoMilestones() {
    const previous = milestoneHistory[milestoneHistory.length - 1]
    if (!previous) return

    setMilestoneHistory((current) => current.slice(0, -1))
    updateSubject({
      milestones: previous.milestones,
      progressStarted: previous.progressStarted,
    })
  }

  if (!subject) {
    return (
      <div ref={pageRef} className="mx-auto w-full max-w-3xl space-y-4">
        <Link
          to="/students/subjects"
          className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-slate-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          My subjects
        </Link>

        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <h2 className="text-base font-semibold text-slate-900">Subject not found</h2>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">
              This subject is no longer in your workspace. It may have been deleted in another tab.
            </p>
            <Link
              to="/students/subjects"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800",
              )}
            >
              Back to my subjects
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const coverColor = getSubjectCoverColor(subject.coverColor)
  const theme = getSubjectTheme(subject)
  const appearance = getSubjectAppearance(subject)
  const progress = getSubjectMilestoneState(subject)
  const nextTopic = progress.active ?? subject.milestones.find((item) => item.status !== "completed") ?? subject.milestones[0]

  return (
    <div ref={pageRef} className="mx-auto w-full max-w-7xl space-y-6">
      {!reading ? <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <li>
            <Link
              to="/students/subjects"
              className="inline-flex items-center gap-1 rounded-md font-medium text-slate-600 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: appearance.accent }}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              My Learning
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li aria-current="page" className="font-medium text-slate-900">
            {subject.name}
          </li>
        </ol>
      </nav>

      <section
        aria-label="Subject overview"
        className="relative overflow-hidden rounded-xl border border-border bg-muted/40 px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
      >
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div className="relative z-10 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-md bg-background px-2.5 py-1 font-medium text-brand">Personal subject</span>
              {subject.code ? <span className="rounded-md border border-slate-200/80 bg-white/80 px-2.5 py-1">{subject.code}</span> : null}
              <span className="rounded-md border border-slate-200/80 bg-white/80 px-2.5 py-1">{subject.milestones.length} study topics</span>
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#1b1a21] dark:text-foreground sm:text-4xl">
              {subject.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Keep your notes, personal study topics, and learning progress together in one place.
            </p>
            {subject.instructor ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <NotebookPen aria-hidden="true" className="size-4 text-slate-500" />
                Instructor reference: <span className="font-medium underline decoration-slate-300 underline-offset-2">{subject.instructor}</span>
              </p>
            ) : null}
            {progress.total > 0 ? (
              <div className="mt-5 max-w-lg">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-[#1b1a21] dark:text-foreground">{progress.active?.title ?? (progress.allDone ? "All topics complete" : "Ready for your next topic")}</span>
                  <span className="shrink-0 text-slate-500">{progress.completed} of {progress.total} complete</span>
                </div>
                <div role="progressbar" aria-label={`${subject.name} topic progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.progress} className="h-2.5 overflow-hidden rounded-full bg-white/80 shadow-inner" style={{ boxShadow: `inset 0 0 0 1px ${appearance.border}` }}>
                  <div className="h-full rounded-full transition-[width]" style={{ width: `${progress.progress}%`, backgroundColor: appearance.accent }} />
                </div>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to={nextTopic ? `?topic=${encodeURIComponent(nextTopic.id)}` : "#study-outline"}
                className={cn(buttonVariants(), "rounded-lg bg-brand px-4 text-brand-foreground hover:bg-brand/90")}
              >
                {progress.allDone ? "Review topics" : "Continue studying"} <ArrowRight aria-hidden="true" />
              </Link>
              <span className="text-xs text-slate-500">Added {formatSubjectDate(subject.createdAt)}</span>
            </div>
          </div>

          <div role="region" aria-label="Subject cover" className="relative z-10 mx-auto flex h-52 w-full max-w-lg items-center justify-center overflow-hidden rounded-xl sm:h-64">
            {subject.coverImage ? (
              <img src={subject.coverImage} alt="" aria-hidden="true" className="size-full object-cover" />
            ) : (
              <div aria-hidden="true" className={`absolute inset-0 ${coverColor.className}`} />
            )}
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-slate-950/10 to-transparent" />
          </div>
        </div>

        <div className="absolute right-3 top-3 z-20 flex gap-2">
          <SubjectActionButton
            icon={Palette}
            label="Customize"
            onClick={() => setCustomizeOpen(true)}
          />
          <SubjectActionButton
            icon={Trash}
            label="Delete"
            tone="danger"
            onClick={() => setDeleteTarget(subject)}
          />
        </div>
      </section>
      </> : null}

      <SubjectStudyContent
        subject={subject}
        onStartProgress={handleStartProgress}
        onCompleteMilestone={handleCompleteMilestone}
      />

      {!reading ? <>
      <section id="manage-milestones" aria-label="Milestone management" className="scroll-mt-6">
      <SubjectMilestonesCard
        subject={subject}
        theme={theme}
        canUndo={milestoneHistory.length > 0}
        removalLabel={removalSnapshot?.label ?? null}
        onAddMilestone={() => {
          setEditingMilestone(null)
          setMilestoneDialogOpen(true)
        }}
        onEditMilestone={(milestone) => {
          setEditingMilestone(milestone)
          setMilestoneDialogOpen(true)
        }}
        onDeleteMilestone={(milestone) => setRemoveMilestoneTarget(milestone)}
        onRemoveAllMilestones={handleRemoveAllMilestones}
        onUndoRemoval={handleUndoRemoval}
        onStartProgress={handleStartProgress}
        onCompleteMilestone={() => handleCompleteMilestone()}
        onStartNextMilestone={handleStartNextMilestone}
        onUndoMilestones={handleUndoMilestones}
      />
      </section>

      <section
        aria-label="Subject guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <NotebookPen className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">{subjectsGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          {subjectsStorageNotice}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border border-slate-200 bg-white shadow-sm ring-0">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>
                  <h3 className="text-base font-semibold text-slate-900">Your notes</h3>
                </CardTitle>
                <CardDescription className="mt-1 text-slate-500">
                  Notes you tagged for {subject.name}.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openNoteComposer}
                  className={theme.soft}
                >
                  <Plus aria-hidden="true" />
                  Add note
                </Button>
                <Link
                  to="/students/notes"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Open notes
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="gap-2">
            {subjectNotes.length > 0 ? (
              <ul className="space-y-2">
                {subjectNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                  >
                    <p className="truncate text-sm font-semibold text-slate-900">{note.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                      {note.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
                    <NotebookPen aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm text-slate-900">No notes yet</EmptyTitle>
                  <EmptyDescription className="text-slate-600">
                    Add a note and tag it with a matching hashtag to see it here.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    to="/students/notes"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Open notes
                  </Link>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm ring-0">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>
                  <h3 className="text-base font-semibold text-slate-900">Your tasks</h3>
                </CardTitle>
                <CardDescription className="mt-1 text-slate-500">
                  Personal tasks assigned to {subject.name}.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskDialogOpen(true)}
                  className={theme.soft}
                >
                  <Plus aria-hidden="true" />
                  Add task
                </Button>
                <Link
                  to="/students/tasks"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Open tasks
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="gap-2">
            {subjectTasks.length > 0 ? (
              <ul className="space-y-2">
                {subjectTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                  >
                    <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                      {task.title}
                    </p>
                    <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                      {task.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
                    <ClipboardList aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm text-slate-900">No tasks yet</EmptyTitle>
                  <EmptyDescription className="text-slate-600">
                    Plan personal study work for this subject on the tasks page.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    to="/students/tasks"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Open tasks
                  </Link>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                <h3 className="text-base font-semibold text-slate-900">Study resources</h3>
              </CardTitle>
              <CardDescription className="mt-1 text-slate-500">
                Resources you have collected for {subject.name}.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/students/materials/personal"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), theme.soft)}
              >
                <Plus aria-hidden="true" />
                Add resources
              </Link>
              <Link
                to="/students/materials"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Open study library
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="gap-2">
          <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
                <FolderOpen aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-sm text-slate-900">No resources yet</EmptyTitle>
              <EmptyDescription className="text-slate-600">
                Nothing is linked to {subject.name} so far. Browse the study library to find something
                for this subject.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to="/students/materials/personal"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Add resources
              </Link>
              <Link
                to="/students/materials"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Open study library
              </Link>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>

      </> : null}

      <SubjectComposerDialog
        open={customizeOpen}
        subject={subject}
        onOpenChange={setCustomizeOpen}
        onSubmit={handleSubmit}
        onCoverChange={handleCoverChange}
      />

      <SubjectMilestoneDialog
        open={milestoneDialogOpen}
        milestone={editingMilestone}
        onOpenChange={(open) => {
          setMilestoneDialogOpen(open)
          if (!open) setEditingMilestone(null)
        }}
        onSubmit={(title) =>
          editingMilestone ? handleEditMilestone(title) : handleAddMilestone(title)
        }
      />

      <SubjectMilestoneDeleteDialog
        open={removeMilestoneTarget !== null}
        milestone={removeMilestoneTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveMilestoneTarget(null)
        }}
        onConfirm={handleDeleteMilestone}
      />

      <SubjectCongratsDialog
        open={congratsOpen}
        subjectName={subject.name}
        onOpenChange={setCongratsOpen}
      />

      <NoteEditorDialog
        note={draftNote}
        isNew={draftNote !== null}
        onOpenChange={(open) => {
          if (!open) setDraftNote(null)
        }}
        onChange={handleDraftNoteChange}
        onCommit={handleDraftNoteCommit}
        onTogglePin={() => undefined}
        onArchive={() => undefined}
        onDelete={() => undefined}
      />

      <TaskComposerDialog
        open={taskDialogOpen}
        task={null}
        initialSubject={subject.name}
        onOpenChange={setTaskDialogOpen}
        onSubmit={handleAddTask}
      />

      <SubjectDeleteDialog
        open={deleteTarget !== null}
        subject={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
```

### `subject-list-row.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-list-row.tsx`

```tsx
import { Link } from "react-router"
import { cn } from "cn"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  getSubjectListBackground,
  getSubjectProgress,
  type SubjectRecord,
} from "./subject-records"

type SubjectListRowProps = {
  subject: SubjectRecord
  href: string
}

export function SubjectListRow({ subject, href }: SubjectListRowProps) {
  const progress = getSubjectProgress(subject)

  return (
    <li>
      <Card
        size="sm"
        className="relative gap-0 border border-transparent py-0 shadow-sm ring-0"
      >
        <CardContent
          className={cn(
            "grid items-center gap-3 py-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)]",
            getSubjectListBackground(subject)
          )}
        >
          <div className="min-w-0">
            <Link
              to={href}
              className="block truncate rounded text-sm font-semibold text-slate-900 outline-none after:absolute after:inset-0 after:content-[''] hover:text-[#6842c5] dark:hover:text-brand hover:underline focus-visible:ring-2 focus-visible:ring-[#8a60f1] focus-visible:ring-offset-2"
            >
              {subject.name}
            </Link>
            {subject.code ? (
              <p className="truncate text-[11px] uppercase tracking-wide text-slate-500">
                {subject.code}
              </p>
            ) : null}
          </div>

          <p className="truncate text-sm text-slate-600">
            {subject.instructor || "No instructor set"}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-slate-600">{progress}%</span>
            <Progress
              aria-hidden="true"
              value={progress}
              className="h-2 flex-1 gap-0 [&_[data-slot=progress-track]]:bg-white/70 [&_[data-slot=progress-indicator]]:bg-[#8a60f1]"
            />
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
```

### `subject-milestone-delete-dialog.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-milestone-delete-dialog.tsx`

```tsx
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SubjectMilestone } from "./subject-records"

type SubjectMilestoneDeleteDialogProps = {
  open: boolean
  milestone: SubjectMilestone | null
  onOpenChange: (open: boolean) => void
  onConfirm: (milestone: SubjectMilestone) => void
}

export function SubjectMilestoneDeleteDialog({
  open,
  milestone,
  onOpenChange,
  onConfirm,
}: SubjectMilestoneDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Remove this milestone?
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {milestone
              ? `“${milestone.title}” will be removed from this subject.`
              : "This milestone will be removed."}{" "}
            You can bring it back with “Undo removed milestone”.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep milestone
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (!milestone) return
              onConfirm(milestone)
            }}
          >
            <Trash aria-hidden="true" />
            Remove milestone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### `subject-milestone-dialog.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-milestone-dialog.tsx`

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { SubjectMilestone } from "./subject-records"

type SubjectMilestoneDialogProps = {
  open: boolean
  milestone: SubjectMilestone | null
  onOpenChange: (open: boolean) => void
  onSubmit: (title: string) => void
}

export function SubjectMilestoneDialog({
  open,
  milestone,
  onOpenChange,
  onSubmit,
}: SubjectMilestoneDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <SubjectMilestoneForm
          key={milestone?.id ?? "new-milestone"}
          milestone={milestone}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

type SubjectMilestoneFormProps = {
  milestone: SubjectMilestone | null
  onCancel: () => void
  onSubmit: (title: string) => void
}

function SubjectMilestoneForm({
  milestone,
  onCancel,
  onSubmit,
}: SubjectMilestoneFormProps) {
  const [title, setTitle] = useState(milestone?.title ?? "")
  const [titleError, setTitleError] = useState<string | null>(null)

  function handleSubmit() {
    const trimmedTitle = title.trim()
    const nextTitleError = trimmedTitle.length < 2 ? "Give the milestone a name." : null

    setTitleError(nextTitleError)
    if (nextTitleError) return

    onSubmit(trimmedTitle)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {milestone ? "Edit milestone" : "Add milestone"}
        </DialogTitle>
      </DialogHeader>

      <Field data-invalid={titleError !== null}>
        <FieldLabel htmlFor="milestone-title" className="text-slate-700">
          Milestone
        </FieldLabel>
        <Input
          id="milestone-title"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          aria-invalid={titleError !== null}
          aria-describedby={titleError ? "milestone-title-error" : undefined}
          placeholder="e.g. Newton's laws of motion"
          autoComplete="off"
          className="border-slate-200 bg-slate-50"
        />
        <FieldError id="milestone-title-error">{titleError}</FieldError>
      </Field>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-blue-700 text-white hover:bg-blue-800"
          onClick={handleSubmit}
        >
          {milestone ? "Save milestone" : "Add milestone"}
        </Button>
      </DialogFooter>
    </>
  )
}
```

### `subject-milestones-card.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-milestones-card.tsx`

```tsx
import { useEffect, useRef, useState } from "react"
import { Circle, CircleCheck, CircleDot, Flag, MoreVertical, Pencil, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import {
  getSubjectMilestoneState,
  type SubjectMilestone,
  type SubjectRecord,
  type SubjectTheme,
} from "./subject-records"

type SubjectMilestonesCardProps = {
  subject: SubjectRecord
  theme: SubjectTheme
  canUndo: boolean
  removalLabel: string | null
  onAddMilestone: () => void
  onEditMilestone: (milestone: SubjectMilestone) => void
  onDeleteMilestone: (milestone: SubjectMilestone) => void
  onRemoveAllMilestones: () => void
  onUndoRemoval: () => void
  onStartProgress: () => void
  onCompleteMilestone: () => void
  onStartNextMilestone: () => void
  onUndoMilestones: () => void
}

const milestoneStatusMeta = {
  completed: { label: "Completed", icon: CircleCheck, className: "text-emerald-600" },
  "in-progress": { label: "In progress", icon: CircleDot, className: "text-blue-600" },
  "not-started": { label: "Not started", icon: Circle, className: "text-slate-300" },
} as const

function MilestoneActions({
  milestone,
  onEdit,
  onDelete,
}: {
  milestone: SubjectMilestone
  onEdit: (milestone: SubjectMilestone) => void
  onDelete: (milestone: SubjectMilestone) => void
}) {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    },
    []
  )

  function cancelClose() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
    }, 150)
  }

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose()
        setOpen(true)
      }}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null
        if (nextTarget && !event.currentTarget.contains(nextTarget)) scheduleClose()
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          cancelClose()
          setOpen(false)
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Options for ${milestone.title}`}
        aria-expanded={open}
        className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        <MoreVertical aria-hidden="true" />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label={`Options for ${milestone.title}`}
          className="absolute right-0 top-full z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onEdit(milestone)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 outline-none hover:bg-slate-100 focus-visible:bg-slate-100"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onDelete(milestone) }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-700 outline-none hover:bg-red-50 focus-visible:bg-red-50"
          >
            <Trash aria-hidden="true" className="size-4" />
            Remove
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function SubjectMilestonesCard({
  subject,
  theme,
  canUndo,
  removalLabel,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onRemoveAllMilestones,
  onUndoRemoval,
  onStartProgress,
  onCompleteMilestone,
  onStartNextMilestone,
  onUndoMilestones,
}: SubjectMilestonesCardProps) {
  const state = getSubjectMilestoneState(subject)

  if (state.total === 0) {
    return (
      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Your learning milestones</h3>
            <p className="mt-1 text-sm text-slate-500">
              Break {subject.name} into the steps you want to finish.
            </p>
          </div>

          <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
                <Flag aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base text-slate-900">No milestones yet</EmptyTitle>
              <EmptyDescription className="text-slate-600">
                Add the first step, then start working through them one by one.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddMilestone}
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              >
                <Plus aria-hidden="true" />
                Add milestone
              </Button>

              {removalLabel ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onUndoRemoval}
                  className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {removalLabel}
                </Button>
              ) : null}
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const isLastActive =
    state.active !== null &&
    state.active.id === subject.milestones[subject.milestones.length - 1]?.id

  let primaryAction: { label: string; onClick: () => void } | null = null

  if (!subject.progressStarted) {
    primaryAction = { label: "Start progress", onClick: onStartProgress }
  } else if (!state.allDone) {
    if (state.active === null) {
      primaryAction = { label: "Start next milestone", onClick: onStartNextMilestone }
    } else if (isLastActive) {
      primaryAction = { label: "Complete milestones", onClick: onCompleteMilestone }
    } else {
      primaryAction = { label: "Milestone completed", onClick: onCompleteMilestone }
    }
  }

  const showActionRow =
    primaryAction !== null || subject.progressStarted || removalLabel !== null

  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardContent className="gap-4">
        <div>
          <p className="text-sm text-slate-500">Learning progress</p>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <p className={`text-2xl font-semibold ${theme.text}`}>
              {state.completed} of {state.total} topics
            </p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">
              {state.progress}%
            </p>
          </div>
        </div>

        <Progress
          aria-hidden="true"
          value={state.progress}
          className={`gap-0 [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:bg-slate-100 ${theme.bar}`}
        />

        {showActionRow ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {subject.progressStarted ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onUndoMilestones}
                  disabled={!canUndo}
                  className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  Undo milestones
                </Button>
              ) : null}

              {removalLabel ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onUndoRemoval}
                  className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {removalLabel}
                </Button>
              ) : null}
            </div>

            {primaryAction ? (
              <Button
                type="button"
                size="sm"
                onClick={primaryAction.onClick}
                className={`${theme.button} text-white ${theme.buttonHover}`}
              >
                {primaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">Your learning milestones</h3>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemoveAllMilestones}
                className="text-slate-500 hover:bg-red-50 hover:text-red-700"
              >
                <Trash aria-hidden="true" />
                Remove all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onAddMilestone}
                className={`text-slate-600 hover:bg-slate-100 ${theme.hoverText}`}
              >
                <Plus aria-hidden="true" />
                Add milestone
              </Button>
            </div>
          </div>

          <ul className="mt-3 space-y-3">
            {subject.milestones.map((item) => {
              const meta = milestoneStatusMeta[item.status]
              const StatusIcon = meta.icon

              return (
                <li key={item.id} className="group/milestone flex items-start gap-3">
                  <StatusIcon
                    aria-hidden="true"
                    className={`mt-0.5 size-5 shrink-0 ${
                      item.status === "in-progress" ? theme.icon : meta.className
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{meta.label}</p>
                  </div>
                  <MilestoneActions
                    milestone={item}
                    onEdit={onEditMilestone}
                    onDelete={onDeleteMilestone}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
```

### `subject-records.ts`

Current file: `src/components/features/personal-workspace/subjects/subject-records.ts`

```ts
import {
  ChartNoAxesCombined,
  Circle,
  CircleCheck,
  ClipboardList,
  Clock,
  FolderOpen,
  Layers,
  NotebookPen,
  type LucideIcon,
} from "lucide-react"

export type SubjectStatus = "in-progress" | "completed" | "not-started"

export type SubjectFilter = "all" | SubjectStatus

export type SubjectStatusMeta = {
  label: string
  icon: LucideIcon
}

export type SubjectMilestoneStatus = "not-started" | "in-progress" | "completed"

export type SubjectMilestone = {
  id: string
  title: string
  status: SubjectMilestoneStatus
}

export type SubjectRecord = {
  id: string
  name: string
  code: string
  instructor: string
  coverColor: string
  coverImage: string | null
  milestones: SubjectMilestone[]
  progressStarted: boolean
  createdAt: string
  updatedAt: string
  seeded: boolean
}

export type SubjectDraft = {
  name: string
  code: string
  instructor: string
}

export type SubjectCoverMeta = {
  value: string
  label: string
  className: string
  pastelClassName: string
}

export type SubjectCoverPreset = {
  id: string
  label: string
  file: string
}

export type SubjectTheme = {
  id: string
  text: string
  icon: string
  solid: string
  button: string
  buttonHover: string
  bar: string
  soft: string
  ring: string
  hoverText: string
}

export type SubjectNoteLink = {
  id: string
  title: string
  body: string
  labels: string[]
}

export type SubjectTaskLink = {
  id: string
  title: string
  subject: string
  status: string
  dueDate: string
}

export type SubjectSummaryTile = {
  label: string
  icon: LucideIcon
}

export type SubjectMilestoneState = {
  total: number
  completed: number
  active: SubjectMilestone | null
  allDone: boolean
  progress: number
}

export const subjectsStorageKey = "owlio.student-subjects.v1"

export const subjectCoverImageLimitBytes = 1_000_000

export const subjectCoverImageLimitLabel = "1 MB"

export const subjectsGuidance =
  "Your subjects are personal, not an educator's official course."

export const subjectsStorageNotice =
  "Your subjects are kept in this browser for preview. Nothing is sent to a server, and no subject is shared with any classroom."

export const subjectCoverColors: SubjectCoverMeta[] = [
  {
    value: "blue",
    label: "Blue",
    className: "bg-gradient-to-br from-blue-500 to-blue-800",
    pastelClassName: "bg-blue-50",
  },
  {
    value: "emerald",
    label: "Green",
    className: "bg-gradient-to-br from-emerald-500 to-emerald-800",
    pastelClassName: "bg-emerald-50",
  },
  {
    value: "violet",
    label: "Purple",
    className: "bg-gradient-to-br from-violet-500 to-violet-800",
    pastelClassName: "bg-violet-50",
  },
  {
    value: "amber",
    label: "Amber",
    className: "bg-gradient-to-br from-amber-400 to-amber-700",
    pastelClassName: "bg-amber-50",
  },
  {
    value: "rose",
    label: "Rose",
    className: "bg-gradient-to-br from-rose-500 to-rose-800",
    pastelClassName: "bg-rose-50",
  },
  {
    value: "slate",
    label: "Slate",
    className: "bg-gradient-to-br from-slate-500 to-slate-800",
    pastelClassName: "bg-slate-100",
  },
]

export const subjectCoverPresets: SubjectCoverPreset[] = [
  { id: "orbit", label: "Orbit", file: "/subject-covers/orbit.svg" },
  { id: "flask", label: "Flask", file: "/subject-covers/flask.svg" },
  { id: "books", label: "Books", file: "/subject-covers/books.svg" },
  { id: "globe", label: "Globe", file: "/subject-covers/globe.svg" },
  { id: "graph", label: "Graph", file: "/subject-covers/graph.svg" },
  { id: "atom", label: "Atom", file: "/subject-covers/atom.svg" },
]

export const defaultSubjectCoverColor = "blue"

export const subjectImageListBackground = "bg-blue-100"

export const subjectThemes: Record<string, SubjectTheme> = {
  blue: {
    id: "blue",
    text: "text-blue-700",
    icon: "text-blue-600",
    solid: "bg-blue-600",
    button: "bg-blue-700",
    buttonHover: "hover:bg-blue-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-blue-600",
    soft: "bg-blue-50 text-blue-700",
    ring: "ring-blue-500",
    hoverText: "hover:text-blue-700",
  },
  emerald: {
    id: "emerald",
    text: "text-emerald-700",
    icon: "text-emerald-600",
    solid: "bg-emerald-600",
    button: "bg-emerald-700",
    buttonHover: "hover:bg-emerald-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-emerald-600",
    soft: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-500",
    hoverText: "hover:text-emerald-700",
  },
  violet: {
    id: "violet",
    text: "text-violet-700",
    icon: "text-violet-600",
    solid: "bg-violet-600",
    button: "bg-violet-700",
    buttonHover: "hover:bg-violet-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-violet-600",
    soft: "bg-violet-50 text-violet-700",
    ring: "ring-violet-500",
    hoverText: "hover:text-violet-700",
  },
  amber: {
    id: "amber",
    text: "text-amber-800",
    icon: "text-amber-600",
    solid: "bg-amber-500",
    button: "bg-amber-600",
    buttonHover: "hover:bg-amber-700",
    bar: "[&_[data-slot=progress-indicator]]:bg-amber-500",
    soft: "bg-amber-50 text-amber-800",
    ring: "ring-amber-500",
    hoverText: "hover:text-amber-800",
  },
  rose: {
    id: "rose",
    text: "text-rose-700",
    icon: "text-rose-600",
    solid: "bg-rose-600",
    button: "bg-rose-700",
    buttonHover: "hover:bg-rose-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-rose-600",
    soft: "bg-rose-50 text-rose-700",
    ring: "ring-rose-500",
    hoverText: "hover:text-rose-700",
  },
  slate: {
    id: "slate",
    text: "text-slate-700",
    icon: "text-slate-600",
    solid: "bg-slate-600",
    button: "bg-slate-700",
    buttonHover: "hover:bg-slate-800",
    bar: "[&_[data-slot=progress-indicator]]:bg-slate-600",
    soft: "bg-slate-100 text-slate-700",
    ring: "ring-slate-500",
    hoverText: "hover:text-slate-700",
  },
}

export const subjectStatusMeta: Record<SubjectStatus, SubjectStatusMeta> = {
  "in-progress": { label: "In progress", icon: Clock },
  completed: { label: "Completed", icon: CircleCheck },
  "not-started": { label: "Not started", icon: Circle },
}

export const subjectFilterOptions: { value: SubjectFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "not-started", label: "Not started" },
]

export const subjectSummaryTiles: SubjectSummaryTile[] = [
  { label: "My subjects", icon: Layers },
  { label: "With notes", icon: NotebookPen },
  { label: "With tasks", icon: ClipboardList },
  { label: "Average progress", icon: ChartNoAxesCombined },
]

export const subjectShortcutLinks = [
  {
    label: "Subject notes",
    description: "Keep notes with the subject they support.",
    href: "/students/notes",
    icon: NotebookPen,
  },
  {
    label: "Study materials",
    description: "Collect resources and reference links.",
    href: "/students/materials",
    icon: FolderOpen,
  },
  {
    label: "Tasks and deadlines",
    description: "Plan personal study apart from classwork.",
    href: "/students/tasks",
    icon: ClipboardList,
  },
] as const

function milestone(
  id: string,
  title: string,
  status: SubjectMilestoneStatus = "not-started"
): SubjectMilestone {
  return { id, title, status }
}

export const sampleSubjects: SubjectRecord[] = [
  {
    id: "physics-1",
    name: "Physics I",
    code: "SCI-PHY1",
    instructor: "Ramon Diaz",
    coverColor: "blue",
    coverImage: "/subject-covers/orbit.svg",
    milestones: [
      milestone("physics-m1", "Motion and displacement", "completed"),
      milestone("physics-m2", "Velocity and acceleration", "completed"),
      milestone("physics-m3", "Newton's laws of motion"),
      milestone("physics-m4", "Work and energy"),
      milestone("physics-m5", "Waves"),
    ],
    progressStarted: true,
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-10-12T09:15:00.000Z",
    seeded: true,
  },
  {
    id: "chemistry-1",
    name: "Chemistry I",
    code: "SCI-CHM1",
    instructor: "Amara Osei",
    coverColor: "emerald",
    coverImage: "/subject-covers/flask.svg",
    milestones: [
      milestone("chemistry-m1", "Atomic structure", "completed"),
      milestone("chemistry-m2", "Chemical bonding", "completed"),
      milestone("chemistry-m3", "Reactions and moles"),
      milestone("chemistry-m4", "Lab safety and technique"),
    ],
    progressStarted: true,
    createdAt: "2026-09-01T09:10:00.000Z",
    updatedAt: "2026-10-11T16:40:00.000Z",
    seeded: true,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    code: "SCI-MTH2",
    instructor: "Alex Rivera",
    coverColor: "violet",
    coverImage: "/subject-covers/graph.svg",
    milestones: [
      milestone("math-m1", "Algebra and functions", "completed"),
      milestone("math-m2", "Geometry and trigonometry", "completed"),
      milestone("math-m3", "Sequences and series", "completed"),
      milestone("math-m4", "Limits and derivatives", "completed"),
      milestone("math-m5", "Integration", "completed"),
    ],
    progressStarted: true,
    createdAt: "2026-09-02T10:00:00.000Z",
    updatedAt: "2026-10-10T11:05:00.000Z",
    seeded: true,
  },
  {
    id: "computer-science",
    name: "Computer Science",
    code: "SCI-CS1",
    instructor: "Priya Nair",
    coverColor: "slate",
    coverImage: "/subject-covers/atom.svg",
    milestones: [],
    progressStarted: false,
    createdAt: "2026-09-02T10:20:00.000Z",
    updatedAt: "2026-09-02T10:20:00.000Z",
    seeded: true,
  },
  {
    id: "english",
    name: "English",
    code: "LAN-ENG1",
    instructor: "Irene Eda",
    coverColor: "rose",
    coverImage: "/subject-covers/books.svg",
    milestones: [
      milestone("english-m1", "Reading comprehension", "completed"),
      milestone("english-m2", "Essay structure", "completed"),
      milestone("english-m3", "Speaking practice"),
      milestone("english-m4", "Vocabulary building"),
    ],
    progressStarted: true,
    createdAt: "2026-09-03T08:30:00.000Z",
    updatedAt: "2026-10-08T08:20:00.000Z",
    seeded: true,
  },
  {
    id: "history",
    name: "History",
    code: "HUM-HIS1",
    instructor: "Samuel Ortiz",
    coverColor: "amber",
    coverImage: "/subject-covers/globe.svg",
    milestones: [
      milestone("history-m1", "Source analysis", "completed"),
      milestone("history-m2", "Modern history", "completed"),
      milestone("history-m3", "Essay writing"),
    ],
    progressStarted: true,
    createdAt: "2026-09-03T08:45:00.000Z",
    updatedAt: "2026-10-09T19:30:00.000Z",
    seeded: true,
  },
]

function isSubjectRecord(value: unknown): value is SubjectRecord {
  if (typeof value !== "object" || value === null) return false
  const subject = value as Record<string, unknown>

  return typeof subject.id === "string" && typeof subject.name === "string"
}

function isSubjectMilestone(value: unknown): value is SubjectMilestone {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    isSubjectMilestoneStatus(item.status)
  )
}

function isSubjectMilestoneStatus(
  value: unknown
): value is SubjectMilestoneStatus {
  return (
    value === "not-started" || value === "in-progress" || value === "completed"
  )
}
export function normalizeSubject(subject: SubjectRecord): SubjectRecord {
  const milestones = Array.isArray(subject.milestones)
    ? subject.milestones.filter(isSubjectMilestone)
    : []

  return {
    ...subject,
    code: typeof subject.code === "string" ? subject.code : "",
    instructor: typeof subject.instructor === "string" ? subject.instructor : "",
    coverColor: getSubjectCoverColor(subject.coverColor).value,
    coverImage: typeof subject.coverImage === "string" ? subject.coverImage : null,
    milestones,
    progressStarted: subject.progressStarted === true,
    createdAt: typeof subject.createdAt === "string" ? subject.createdAt : new Date().toISOString(),
    updatedAt: typeof subject.updatedAt === "string" ? subject.updatedAt : new Date().toISOString(),
    seeded: subject.seeded === true,
  }
}

export function createSubjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `subject-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createMilestoneId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `milestone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getSubjectInitials(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length === 0) return "?"

  return trimmed.slice(0, 1).toUpperCase()
}

export function normalizeSubjectKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

export function getSubjectTag(subject: SubjectRecord): string {
  return subject.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function getSubjectCoverColor(value: unknown): SubjectCoverMeta {
  return subjectCoverColors.find((color) => color.value === value) ?? subjectCoverColors[0]
}

export function getSubjectCoverPreset(index: number): SubjectCoverPreset {
  return subjectCoverPresets[Math.abs(index) % subjectCoverPresets.length]
}

export function getDefaultSubjectCover(subjectId: string): SubjectCoverPreset {
  let hash = 0

  for (let index = 0; index < subjectId.length; index += 1) {
    hash = (hash * 31 + subjectId.charCodeAt(index)) % 100000
  }

  return getSubjectCoverPreset(hash)
}

export function getSubjectListBackground(subject: SubjectRecord): string {
  return subject.coverImage
    ? subjectImageListBackground
    : getSubjectCoverColor(subject.coverColor).pastelClassName
}

export function getSubjectTheme(subject: SubjectRecord): SubjectTheme {
  return subjectThemes[getSubjectThemeColorName(subject)] ?? subjectThemes.blue
}

export function getSubjectThemeColorName(subject: SubjectRecord): string {
  const preset = subject.coverImage?.split("/").pop()?.replace(/\.svg$/i, "")
  const presetTheme: Record<string, string> = {
    orbit: "violet",
    flask: "emerald",
    globe: "emerald",
    books: "rose",
    graph: "blue",
    atom: "violet",
  }

  return presetTheme[preset ?? ""] ?? getSubjectCoverColor(subject.coverColor).value
}

export function getSubjectMilestoneState(subject: SubjectRecord): SubjectMilestoneState {
  const total = subject.milestones.length
  const completed = subject.milestones.filter((item) => item.status === "completed").length
  const active = subject.milestones.find((item) => item.status === "in-progress") ?? null

  return {
    total,
    completed,
    active,
    allDone: total > 0 && completed === total,
    progress: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

export function getSubjectProgress(subject: SubjectRecord): number {
  return getSubjectMilestoneState(subject).progress
}

export function getSubjectStatus(subject: SubjectRecord): SubjectStatus {
  const progress = getSubjectProgress(subject)

  if (progress >= 100) return "completed"
  if (progress > 0 || subject.progressStarted || subject.milestones.some((item) => item.status === "in-progress")) return "in-progress"

  return "not-started"
}

export function subjectMatchesQuery(subject: SubjectRecord, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length === 0) return true

  return (
    subject.name.toLowerCase().includes(normalizedQuery) ||
    subject.code.toLowerCase().includes(normalizedQuery) ||
    subject.instructor.toLowerCase().includes(normalizedQuery)
  )
}

export function subjectMatchesFilter(
  subject: SubjectRecord,
  filter: SubjectFilter
): boolean {
  return filter === "all" || getSubjectStatus(subject) === filter
}

export function sortSubjects(subjects: SubjectRecord[]): SubjectRecord[] {
  return [...subjects].sort((first, second) => {
    const firstCompleted = getSubjectProgress(first) >= 100 ? 1 : 0
    const secondCompleted = getSubjectProgress(second) >= 100 ? 1 : 0

    if (firstCompleted !== secondCompleted) return firstCompleted - secondCompleted

    return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  })
}

export function findSubjectById(
  subjects: SubjectRecord[],
  subjectId: string | undefined
): SubjectRecord | undefined {
  if (!subjectId) return undefined
  return subjects.find((subject) => subject.id === subjectId)
}

export function notesForSubject(
  notes: SubjectNoteLink[],
  subject: SubjectRecord
): SubjectNoteLink[] {
  const subjectKey = normalizeSubjectKey(subject.name)
  const codeKey = normalizeSubjectKey(subject.code)

  return notes.filter((note) =>
    note.labels.some((tag) => {
      const tagKey = normalizeSubjectKey(tag)
      if (tagKey.length < 3) return false

      return (
        tagKey.includes(subjectKey) ||
        subjectKey.includes(tagKey) ||
        (codeKey.length >= 3 && tagKey.includes(codeKey))
      )
    })
  )
}

export function tasksForSubject(
  tasks: SubjectTaskLink[],
  subject: SubjectRecord
): SubjectTaskLink[] {
  const subjectKey = normalizeSubjectKey(subject.name)

  return tasks.filter((task) => normalizeSubjectKey(task.subject) === subjectKey)
}

export function loadSubjects(): SubjectRecord[] {
  if (typeof window === "undefined") return sampleSubjects

  try {
    const stored = window.localStorage.getItem(subjectsStorageKey)
    if (!stored) return sampleSubjects

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return sampleSubjects

    return parsed.filter(isSubjectRecord).map(normalizeSubject)
  } catch {
    return sampleSubjects
  }
}

export function saveSubjects(subjects: SubjectRecord[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(subjectsStorageKey, JSON.stringify(subjects))
  } catch {
    return
  }
}
```

### `subject-study-content.tsx`

Current file: `src/components/features/personal-workspace/subjects/subject-study-content.tsx`

```tsx
import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, ChevronDown, ChevronRight, CircleCheck, FileText, Layers3, Play, Search } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSubjectCoverColor, subjectShortcutLinks, type SubjectMilestone, type SubjectRecord } from "./subject-records"

type SubjectStudyContentProps = {
  subject: SubjectRecord
  onStartProgress: () => void
  onCompleteMilestone: (milestoneId: string) => void
}

export function SubjectStudyContent({ subject, onStartProgress, onCompleteMilestone }: SubjectStudyContentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [outlineOpen, setOutlineOpen] = useState(true)
  const [outlineQuery, setOutlineQuery] = useState("")
  const headingRef = useRef<HTMLHeadingElement>(null)
  const readerBodyRef = useRef<HTMLDivElement>(null)
  const readerRef = useRef<HTMLElement>(null)
  const selected = subject.milestones.find((item) => item.id === searchParams.get("topic")) ?? null
  const selectedId = selected?.id
  const currentIndex = selected ? subject.milestones.findIndex((item) => item.id === selected.id) : -1
  const completedCount = subject.milestones.filter((item) => item.status === "completed").length
  const visibleMilestones = useMemo(() => subject.milestones.filter((item) => item.title.toLowerCase().includes(outlineQuery.trim().toLowerCase())), [subject.milestones, outlineQuery])

  useEffect(() => {
    if (selectedId) {
      headingRef.current?.focus({ preventScroll: true })
      if (readerBodyRef.current) readerBodyRef.current.scrollTop = 0
      readerRef.current?.scrollIntoView?.({ block: "start" })
    }
  }, [selectedId])

  function openMilestone(milestone: SubjectMilestone) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set("topic", milestone.id)
      return next
    })
    if (!subject.progressStarted) onStartProgress()
  }

  function closeReader() {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete("topic")
      return next
    })
  }

  function moveTopic(direction: -1 | 1) {
    const next = subject.milestones[currentIndex + direction]
    if (next) openMilestone(next)
  }

  if (selected) {
    return (
      <section ref={readerRef} aria-label={`${subject.name} study reader`} className="overflow-hidden rounded-xl border border-border bg-background shadow-xs lg:flex lg:h-[calc(100dvh-10rem)] lg:min-h-[28rem] lg:flex-col">
        <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="sm" onClick={closeReader}><ArrowLeft aria-hidden="true" /> Subject overview</Button>
          <span aria-hidden="true" className="hidden h-5 border-l border-border sm:block" />
          <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{subject.name}</p>
          <a href="#topic-outline" className="rounded text-xs font-medium text-brand outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden">Topic outline</a>
        </header>

        <div className="grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <article className="flex min-h-0 min-w-0 flex-col">
            <p className="flex items-center gap-2 border-b border-border bg-brand-soft px-5 py-3 text-xs leading-5 text-brand-soft-foreground sm:px-8"><BookOpen aria-hidden="true" className="size-4 shrink-0" />Personal study outline · Topic completion stays in this browser.</p>
            <div ref={readerBodyRef} className="mx-auto min-h-0 w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground">Topic {currentIndex + 1} of {subject.milestones.length}<span aria-hidden="true" className="mx-2">·</span>{selected.status === "completed" ? "Completed" : "Personal study"}</p>
              <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground outline-none sm:text-3xl">{selected.title}</h1>
              <div className="mt-7 overflow-hidden rounded-xl border border-border bg-muted/30">
                <div className="grid min-h-56 items-center gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_8rem] sm:p-8">
                  <div>
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">{currentIndex + 1}</span>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">A little focus.<br />A new understanding.</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">Use this topic to guide your own reading, practice, and notes.</p>
                  </div>
                  <div aria-hidden="true" className={`hidden size-32 overflow-hidden rounded-xl sm:block ${getSubjectCoverColor(subject.coverColor).className}`}>
                    {subject.coverImage ? <img src={subject.coverImage} alt="" className="size-full object-cover" /> : null}
                  </div>
                </div>
              </div>
              <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
                <p>This is a topic from your personal plan for <span className="font-medium text-foreground">{subject.name}</span>. Instructor lessons and course files aren’t connected here.</p>
                <div className="border-l-2 border-brand bg-muted/40 px-4 py-3"><span className="font-semibold text-foreground">Make it stick.</span> Write one question you want to answer. After studying, explain the key idea in your own words.</div>
                <div className="flex flex-wrap gap-2">
                  <Button nativeButton={false} role="link" variant="outline" size="sm" render={<Link to="/students/notes" />}>Open notes <ArrowRight aria-hidden="true" /></Button>
                  <Button nativeButton={false} role="link" variant="ghost" size="sm" render={<Link to="/students/materials/personal" />}>Find study resources <ArrowRight aria-hidden="true" /></Button>
                </div>
              </div>
            </div>
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-4 sm:px-6">
              <Button type="button" variant="outline" size="sm" onClick={() => moveTopic(-1)} disabled={currentIndex <= 0}><ArrowLeft aria-hidden="true" />Previous topic</Button>
              <Button type="button" size="sm" onClick={() => onCompleteMilestone(selected.id)} disabled={selected.status === "completed"}><Check aria-hidden="true" />{selected.status === "completed" ? "Completed" : "Mark complete"}</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => moveTopic(1)} disabled={currentIndex >= subject.milestones.length - 1}>Next topic<ArrowRight aria-hidden="true" /></Button>
            </footer>
          </article>

          <aside id="topic-outline" aria-label="Study sidebar" className="scroll-mt-6 border-t border-border lg:overflow-y-auto lg:border-l lg:border-t-0">
            <Tabs defaultValue="topics" className="gap-0">
              <TabsList variant="line" className="h-16 w-full justify-start border-b border-border px-4">
                <TabsTrigger value="topics" className="flex-none px-3">Topics</TabsTrigger>
                <TabsTrigger value="tools" className="flex-none px-3">Study tools</TabsTrigger>
              </TabsList>
              <TabsContent value="topics" className="p-4">
                <div className="mb-4 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>Topic completion</span><span className="font-medium text-foreground">{completedCount}/{subject.milestones.length}</span></div>
                <div role="progressbar" aria-label="Topic completion" aria-valuemin={0} aria-valuemax={subject.milestones.length} aria-valuenow={completedCount} className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${completedCount / subject.milestones.length * 100}%` }} /></div>
                <label className="relative block"><span className="sr-only">Search topics</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={outlineQuery} onChange={(event) => setOutlineQuery(event.currentTarget.value)} placeholder="Search topics…" className="h-9 pl-9" /></label>
                <ul aria-label="Topic outline" className="mt-4 space-y-1">
                  {visibleMilestones.map((milestone) => (
                    <li key={milestone.id}>
                      <button type="button" onClick={() => openMilestone(milestone)} aria-current={selected.id === milestone.id ? "step" : undefined} className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected.id === milestone.id ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-muted"}`}>
                        {milestone.status === "completed" ? <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
                        <span><span className="block text-[10px] text-muted-foreground">Topic {subject.milestones.findIndex((item) => item.id === milestone.id) + 1}{milestone.status === "completed" ? " · Completed" : ""}</span><span className="mt-0.5 block font-medium">{milestone.title}</span></span>
                      </button>
                    </li>
                  ))}
                  {visibleMilestones.length === 0 ? <li role="status" className="px-3 py-5 text-sm text-muted-foreground">No topics match your search.</li> : null}
                </ul>
              </TabsContent>
              <TabsContent value="tools" className="space-y-5 p-5">
                <p className="text-sm leading-6 text-muted-foreground">Keep learning in your personal workspace. These tools open your notes, resources, and tasks.</p>
                {subjectShortcutLinks.map(({ label, href, icon: Icon }) => <Link key={href} to={href} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><Icon aria-hidden="true" className="size-4 text-brand" />{label}<ArrowRight aria-hidden="true" className="ml-auto size-4" /></Link>)}
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </section>
    )
  }

  return (
    <section id="study-outline" aria-label="Subject study plan" className="grid scroll-mt-6 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-semibold tracking-tight text-foreground">Study outline</h2><p className="mt-1 text-xs text-muted-foreground">{subject.milestones.length} topics · {completedCount} completed</p></div>
          {subject.milestones.length > 0 ? <Button type="button" size="sm" variant="outline" onClick={() => openMilestone(subject.milestones.find((item) => item.status !== "completed") ?? subject.milestones[0])}><Play aria-hidden="true" />Open study view</Button> : null}
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          <button type="button" aria-expanded={outlineOpen} onClick={() => setOutlineOpen((open) => !open)} className="flex w-full items-center justify-between gap-3 bg-muted/50 px-5 py-4 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold"><Layers3 aria-hidden="true" className="size-4 shrink-0 text-brand" /><span className="truncate">{subject.name}</span></span>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">{subject.milestones.length} topics{outlineOpen ? <ChevronDown aria-hidden="true" className="size-4" /> : <ChevronRight aria-hidden="true" className="size-4" />}</span>
          </button>
          {outlineOpen ? <ul aria-label="Study topics" className="divide-y divide-border">{subject.milestones.map((milestone, index) => <li key={milestone.id}><button type="button" onClick={() => openMilestone(milestone)} className="flex w-full items-center gap-3 px-5 py-4 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1"><span className="text-[10px] text-muted-foreground">Topic {index + 1}</span><span className="block text-sm font-medium">{milestone.title}</span></span>{milestone.status === "completed" ? <CircleCheck aria-label="Completed" className="size-4 shrink-0 text-emerald-600" /> : <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}</button></li>)}</ul> : null}
          {subject.milestones.length === 0 ? <p className="p-8 text-center text-sm leading-6 text-muted-foreground">Add milestones below to build your personal study outline.</p> : null}
        </div>
        <a href="#manage-milestones" className="mt-3 inline-flex items-center gap-1 rounded text-xs font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">Manage your milestones<ArrowRight aria-hidden="true" className="size-3.5" /></a>
      </div>
      <aside aria-label="Subject details" className="space-y-5 rounded-xl border border-border bg-background p-5 shadow-xs">
        <h3 className="text-sm font-semibold">Subject details</h3>
        <ul className="space-y-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-2.5"><CircleCheck aria-hidden="true" className="size-4 text-emerald-600" />{completedCount} of {subject.milestones.length} topics complete</li>
          <li className="flex items-center gap-2.5"><CalendarDays aria-hidden="true" className="size-4" />Added {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(subject.createdAt))}</li>
          {subject.code ? <li className="flex items-center gap-2.5"><BookOpen aria-hidden="true" className="size-4" />{subject.code}</li> : null}
        </ul>
        <div className="border-t border-border pt-4"><p className="text-xs font-medium">Study plan owner</p><p className="mt-1 text-xs text-muted-foreground">You · Personal workspace</p></div>
        <p className="text-xs leading-5 text-muted-foreground">Topics and completion stay in this browser. They are not classroom grades or official records.</p>
      </aside>
    </section>
  )
}
```

### `subjects-hero.tsx`

Current file: `src/components/features/personal-workspace/subjects/subjects-hero.tsx`

```tsx
import { ArrowUpRight, Plus } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { subjectShortcutLinks } from "./subject-records"

type SubjectsHeroProps = { intro: string; onCreate: () => void }

export function SubjectsHero({ intro, onCreate }: SubjectsHeroProps) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-brand">Personal workspace</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">My Learning</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{intro}</p>
        </div>
        <Button type="button" onClick={onCreate} className="rounded-lg bg-brand px-4 text-brand-foreground hover:bg-brand/90"><Plus aria-hidden="true" /> New subject</Button>
      </div>
      <nav aria-label="Personal learning tools" className="flex flex-wrap gap-x-6 gap-y-3 border-b border-border pb-4">
        {subjectShortcutLinks.map(({ label, href, icon: Icon }) => (
          <Link key={href} to={href} className="inline-flex items-center gap-2 rounded-sm text-xs font-medium text-muted-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Icon aria-hidden="true" className="size-4 text-brand" />{label}<ArrowUpRight aria-hidden="true" className="size-3" />
          </Link>
        ))}
      </nav>
    </header>
  )
}
```

### `subjects-view.test.tsx`

Current file: `src/components/features/personal-workspace/subjects/subjects-view.test.tsx`

```tsx
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { notesStorageKey } from "@/components/features/personal-workspace/notes/contents/note-records"
import { tasksStorageKey } from "@/components/features/personal-workspace/tasks/task-records"
import { SubjectDetailView } from "./subject-detail-view"
import {
  getSubjectTheme,
  sampleSubjects,
  subjectThemes,
  subjectsStorageKey,
} from "./subject-records"
import { SubjectsView } from "./subjects-view"

function renderSubjects() {
  return render(
    <MemoryRouter initialEntries={["/students/subjects"]}>
      <Routes>
        <Route path="/students/subjects" element={<SubjectsView />} />
        <Route path="/students/subjects/:subjectId" element={<SubjectDetailView />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("SubjectsView", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("opens My Learning with a subject creation action", () => {
    renderSubjects()

    expect(screen.getByRole("heading", { name: "My Learning" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "New subject" })).toBeTruthy()
  })

  it("keeps personal notes, materials, and tasks reachable from the library", () => {
    renderSubjects()

    expect(screen.queryByRole("heading", { name: "At a glance" })).toBeNull()
    expect(screen.queryByRole("heading", { name: "Subject workspace" })).toBeNull()
    expect(screen.getByRole("link", { name: /Subject notes/ })).toBeTruthy()
    expect(screen.getByRole("link", { name: /Study materials/ })).toBeTruthy()
    expect(screen.getByRole("link", { name: /Tasks and deadlines/ })).toBeTruthy()
  })

  it("explains independent learning and browser-local storage visibly", () => {
    renderSubjects()

    expect(screen.getByText(/Learn at your pace, with or without a class/)).toBeTruthy()
    expect(screen.getByRole("region", { name: "Sample data notice" }).textContent).toContain("stay in this browser")
  })

  it("drops the stat tiles and keeps a single create action", () => {
    renderSubjects()

    expect(screen.queryByRole("list", { name: "Subject totals" })).toBeNull()
    expect(screen.queryByText("Created by you")).toBeNull()
    expect(screen.getAllByRole("button", { name: "New subject" })).toHaveLength(1)
  })

  it("shows subject artwork and personal topic progress in the library", () => {
    renderSubjects()

    const card = screen.getByRole("link", { name: "Physics I" }).closest("li")
    expect(card?.querySelector("img")).toBeTruthy()
    expect(card?.textContent).toContain("40%")
  })

  it("keeps the subject name out of the card background", () => {
    renderSubjects()

    const card = screen.getByRole("link", { name: "Physics I" }).closest("li")
    const artwork = card?.querySelector("img")?.parentElement

    expect(artwork?.textContent).not.toContain("Physics I")
  })

  it("puts a fully completed subject at the bottom of the list", () => {
    renderSubjects()

    const names = within(screen.getByRole("list", { name: "Subject library" }))
      .getAllByRole("link")
      .map((link) => link.textContent)
      .filter(Boolean)

    expect(names.indexOf("Mathematics")).toBe(names.length - 1)
  })

  it("switches to a one column list with the cover colour background", async () => {
    const user = userEvent.setup()
    renderSubjects()

    await user.click(screen.getByRole("button", { name: "List view" }))

    const row = screen.getByRole("link", { name: "Physics I" }).closest("li")
    expect(row?.textContent).toContain("Ramon Diaz")
    expect(row?.textContent).toContain("%")
  })

  it("identifies example subjects and their own topic status", () => {
    renderSubjects()

    const card = screen.getByRole("link", { name: "Physics I" }).closest("li")

    expect(card?.textContent).not.toContain("chapters")
    expect(card?.textContent).not.toContain("lessons")
    expect(card?.textContent).toContain("Example")
    expect(card?.textContent).toContain("In progress")
  })

  it("gives every subject its own page", () => {
    renderSubjects()

    expect(screen.getByRole("link", { name: "Physics I" }).getAttribute("href")).toBe(
      "/students/subjects/physics-1",
    )
  })

  it("filters subjects by status beside the search bar", async () => {
    const user = userEvent.setup()
    renderSubjects()

    const filters = screen.getByRole("group", { name: "Filter subjects by status" })
    expect(within(filters).getByRole("button", { name: "All" })).toBeTruthy()
    expect(within(filters).getByRole("button", { name: "In progress" })).toBeTruthy()
    expect(within(filters).getByRole("button", { name: "Completed" })).toBeTruthy()
    expect(within(filters).getByRole("button", { name: "Not started" })).toBeTruthy()

    await user.click(within(filters).getByRole("button", { name: "Completed" }))

    expect(screen.getByRole("link", { name: "Mathematics" })).toBeTruthy()
    expect(screen.queryByRole("link", { name: "Physics I" })).toBeNull()
  })

  it("creates a subject in a modal instead of adding a card inline", async () => {
    const user = userEvent.setup()
    renderSubjects()

    expect(screen.queryByRole("dialog")).toBeNull()

    await user.click(screen.getByRole("button", { name: "New subject" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "New subject" })).toBeTruthy()
    expect(within(dialog).queryByText(/Create a subject you are tracking/)).toBeNull()
    expect(
      within(dialog).getByText("Your subjects are personal, not an educator's official course."),
    ).toBeTruthy()

    await user.type(within(dialog).getByLabelText("Subject name"), "Latin")
    await user.type(within(dialog).getByLabelText(/Code/), "LAN-LAT1")
    await user.click(within(dialog).getByRole("button", { name: "Create subject" }))

    expect(await screen.findByRole("link", { name: "Latin" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Latin" }).getAttribute("href")).toMatch(
      /^\/students\/subjects\/.+/,
    )
    expect(window.localStorage.getItem(subjectsStorageKey)).toContain("Latin")
  })

  it("keeps the create modal open when the name is missing", async () => {
    const user = userEvent.setup()
    renderSubjects()

    await user.click(screen.getByRole("button", { name: "New subject" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Create subject" }))

    expect(await screen.findByText("Give your subject a name.")).toBeTruthy()
    expect(screen.getByRole("dialog")).toBeTruthy()
  })

  it("continues the next unfinished topic and persists only that subject's completion", async () => {
    const user = userEvent.setup()
    renderSubjects()

    await user.click(screen.getByRole("link", { name: "Continue studying Physics I" }))
    const reader = screen.getByRole("region", { name: "Physics I study reader" })
    expect(within(reader).getByRole("heading", { name: "Newton's laws of motion" })).toBeTruthy()
    expect(screen.queryByRole("region", { name: "Subject overview" })).toBeNull()
    await user.click(within(reader).getByRole("button", { name: "Mark complete" }))

    const saved = JSON.parse(window.localStorage.getItem(subjectsStorageKey)!) as typeof sampleSubjects
    expect(saved.find((subject) => subject.id === "physics-1")?.milestones.find((topic) => topic.id === "physics-m3")?.status).toBe("completed")
    expect(saved.find((subject) => subject.id === "chemistry-1")?.milestones).toEqual(sampleSubjects.find((subject) => subject.id === "chemistry-1")?.milestones)
    await user.click(within(reader).getByRole("button", { name: "Next topic" }))
    expect(within(reader).getByRole("heading", { name: "Work and energy" })).toBeTruthy()
    await user.click(within(reader).getByRole("button", { name: "Subject overview" }))
    expect(screen.getByRole("region", { name: "Subject overview" })).toBeTruthy()
  })

  it("offers a useful first-use path with no subjects or classroom membership", () => {
    window.localStorage.setItem(subjectsStorageKey, "[]")
    renderSubjects()
    expect(screen.getByRole("heading", { name: "Your learning starts here" })).toBeTruthy()
    expect(screen.queryByRole("region", { name: "Continue learning" })).toBeNull()
    expect(screen.getByRole("button", { name: "Create a subject" })).toBeTruthy()
  })

  it("keeps a started subject in progress before its first topic is completed", async () => {
    const user = userEvent.setup()
    const subject = { ...sampleSubjects[0], milestones: [{ id: "first", title: "First topic", status: "in-progress" }] }
    window.localStorage.setItem(subjectsStorageKey, JSON.stringify([subject]))
    renderSubjects()

    await user.click(screen.getByRole("button", { name: "In progress" }))
    expect(within(screen.getByRole("list", { name: "Subject library" })).getByRole("link", { name: "Physics I" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Continue studying Physics I" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Not started" }))
    expect(screen.getByRole("heading", { name: "No subjects match this view" })).toBeTruthy()
  })
})

describe("SubjectDetailView", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  function renderDetail(path = "/students/subjects/physics-1") {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/students/subjects/:subjectId" element={<SubjectDetailView />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it("opens the subject page with its own notes and tasks sections", async () => {
    renderDetail()

    expect(await screen.findByRole("heading", { name: "Physics I" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Your notes" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Your tasks" })).toBeTruthy()
    expect(screen.getByText("Personal subject")).toBeTruthy()
  })

  it("shows a safe not-found state for an unknown subject", async () => {
    renderDetail("/students/subjects/does-not-exist")

    expect(await screen.findByRole("heading", { name: "Subject not found" })).toBeTruthy()
  })

  it("keeps subject artwork and customization actions available in the overview", async () => {
    renderDetail()

    expect(await screen.findByRole("heading", { name: "Physics I" })).toBeTruthy()
    expect(screen.getByText("Ramon Diaz")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Customize" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy()

    const cover = screen.getByRole("region", { name: "Subject cover" })
    expect(cover.textContent).not.toContain("%")
    expect(cover.textContent).not.toContain("milestones")
  })

  it("walks the milestone flow from start to completion", async () => {
    const user = userEvent.setup()
    renderDetail()

    expect(await screen.findByText("2 of 5 topics")).toBeTruthy()
    const management = screen.getByRole("region", { name: "Milestone management" })
    expect(within(management).getByText("40%")).toBeTruthy()
    expect(within(management).getByText("Motion and displacement")).toBeTruthy()

    const nextButton = screen.getByRole("button", { name: "Start next milestone" })
    await user.click(nextButton)

    expect(screen.getByRole("button", { name: "Milestone completed" })).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Milestone completed" }))

    expect(screen.getByText("3 of 5 topics")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Start next milestone" })).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Undo milestones" }))

    expect(screen.getByText("2 of 5 topics")).toBeTruthy()
  })

  it("completes the final milestone with a congrats modal", async () => {
    const user = userEvent.setup()
    renderDetail()

    await screen.findByText("2 of 5 topics")

    for (let step = 0; step < 2; step += 1) {
      const startNext = screen.queryByRole("button", { name: "Start next milestone" })
      if (startNext) await user.click(startNext)

      const complete = screen.queryByRole("button", { name: "Milestone completed" })
      if (complete) await user.click(complete)
    }

    await user.click(screen.getByRole("button", { name: "Start next milestone" }))

    const completeAll = screen.queryByRole("button", { name: "Complete milestones" })
    expect(completeAll).toBeTruthy()
    await user.click(completeAll as HTMLElement)

    expect(
      await screen.findByRole("heading", { name: /Congrats, you completed Physics I/ }),
    ).toBeTruthy()
  })

  it("adds a milestone from the empty state", async () => {
    const user = userEvent.setup()
    renderDetail("/students/subjects/computer-science")

    expect(await screen.findByText("No milestones yet")).toBeTruthy()
    expect(screen.queryByText("Learning progress")).toBeNull()

    await user.click(screen.getByRole("button", { name: "Add milestone" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Milestone"), "Recursion")
    await user.click(within(dialog).getByRole("button", { name: "Add milestone" }))

    expect(await within(screen.getByRole("region", { name: "Milestone management" })).findByText("Recursion")).toBeTruthy()
    expect(screen.getByText("0 of 1 topics")).toBeTruthy()
  })

  it("undoes a removed milestone with its own button", async () => {
    const user = userEvent.setup()
    renderDetail()

    await screen.findByText("2 of 5 topics")

    await user.click(screen.getAllByRole("button", { name: "Options for Motion and displacement" })[0])

    const menu = await screen.findByRole("menu", { name: "Options for Motion and displacement" })
    await user.click(within(menu).getByRole("menuitem", { name: "Remove" }))

    const confirm = await screen.findByRole("dialog")
    expect(within(confirm).getByRole("heading", { name: "Remove this milestone?" })).toBeTruthy()

    await user.click(within(confirm).getByRole("button", { name: "Remove milestone" }))

    expect(screen.queryByText("Motion and displacement")).toBeNull()
    const undoRemoved = screen.getByRole("button", { name: "Undo removed milestone" })
    expect(undoRemoved).toBeTruthy()

    await user.click(undoRemoved)

    expect(await within(screen.getByRole("region", { name: "Milestone management" })).findByText("Motion and displacement")).toBeTruthy()
  })

  it("removes all milestones and can restore them", async () => {
    const user = userEvent.setup()
    renderDetail()

    await screen.findByText("2 of 5 topics")

    await user.click(screen.getByRole("button", { name: "Remove all" }))

    expect(await screen.findByText("No milestones yet")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Undo removed milestones" }))

    expect(await screen.findByText("2 of 5 topics")).toBeTruthy()
  })

  it("creates a note tagged with the subject", async () => {
    const user = userEvent.setup()
    renderDetail("/students/subjects/mathematics")

    await user.click(await screen.findByRole("button", { name: "Add note" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Note title"), "Quadratic forms")
    await user.type(within(dialog).getByLabelText("Note content"), "Completing the square")
    await user.click(within(dialog).getByRole("button", { name: "Done" }))

    expect(await screen.findByText("Quadratic forms")).toBeTruthy()
    expect(window.localStorage.getItem(notesStorageKey)).toContain("mathematics")
  })

  it("creates a task with the subject already filled in", async () => {
    const user = userEvent.setup()
    renderDetail("/students/subjects/mathematics")

    await user.click(await screen.findByRole("button", { name: "Add task" }))

    const dialog = await screen.findByRole("dialog")
    const subjectField = within(dialog).getByLabelText("Subject") as HTMLInputElement
    expect(subjectField.value).toBe("Mathematics")

    await user.type(within(dialog).getByLabelText(/Title/), "Past paper")
    await user.click(within(dialog).getByRole("button", { name: "Save task" }))

    expect(await screen.findByText("Past paper")).toBeTruthy()
    expect(window.localStorage.getItem(tasksStorageKey)).toContain("Mathematics")
  })

  it("opens the customize dialog with a background colour and image option", async () => {
    const user = userEvent.setup()
    renderDetail()

    await user.click(await screen.findByRole("button", { name: "Customize" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Customize subject" })).toBeTruthy()
    expect(within(dialog).getByRole("group", { name: "Background colour" })).toBeTruthy()
    expect(within(dialog).getByRole("group", { name: "Background illustration" })).toBeTruthy()
    expect(within(dialog).getByLabelText("Background image")).toBeTruthy()
    expect(within(dialog).getByLabelText("Subject name")).toBeTruthy()
    expect(within(dialog).getByLabelText(/Code/)).toBeTruthy()
    expect(within(dialog).getByLabelText(/Instructor/)).toBeTruthy()
    expect(
      within(dialog).queryByText(/Using a solid background/),
    ).toBeNull()
  })

  it("shows an empty state for study resources with both actions", async () => {
    renderDetail()

    expect(await screen.findByText("No resources yet")).toBeTruthy()
    expect(screen.getAllByRole("link", { name: /Add resources/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("link", { name: /Open study library/ }).length).toBeGreaterThan(0)
  })

  it("follows the subject cover for the page theme", async () => {
    renderDetail("/students/subjects/mathematics")

    const progress = await screen.findByText("5 of 5 topics")
    expect(progress.className).toContain("text-blue-700")

    const imageCovered = {
      ...sampleSubjects.find((subject) => subject.id === "mathematics")!,
    }
    const colourCovered = { ...imageCovered, coverImage: null, coverColor: "emerald" }

    expect(getSubjectTheme(imageCovered)).toBe(subjectThemes.blue)
    expect(getSubjectTheme(colourCovered)).toBe(subjectThemes.emerald)
  })
})
```

### `subjects-view.tsx`

Current file: `src/components/features/personal-workspace/subjects/subjects-view.tsx`

```tsx
import { useEffect, useMemo, useRef, useState } from "react"
import { LayoutGrid, List, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContinueLearning } from "./continue-learning"
import { SampleDataNotice } from "./sample-data-notice"
import { SubjectCard } from "./subject-card"
import { SubjectComposerDialog } from "./subject-composer-dialog"
import { SubjectDeleteDialog } from "./subject-delete-dialog"
import { SubjectListRow } from "./subject-list-row"
import { SubjectsHero } from "./subjects-hero"
import {
  createSubjectId, defaultSubjectCoverColor, getDefaultSubjectCover,
  loadSubjects, saveSubjects, sortSubjects, subjectFilterOptions,
  subjectMatchesFilter, subjectMatchesQuery, subjectsStorageNotice,
  type SubjectDraft, type SubjectFilter, type SubjectRecord,
} from "./subject-records"

export function SubjectsView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [subjects, setSubjects] = useState<SubjectRecord[]>(() => loadSubjects())
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<SubjectFilter>("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sort, setSort] = useState("recent")
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubjectRecord | null>(null)

  useEffect(() => { saveSubjects(subjects) }, [subjects])
  useEffect(() => { pageRef.current?.scrollIntoView?.({ block: "start" }) }, [])

  const visibleSubjects = useMemo(() => {
    const matches = subjects.filter((subject) => subjectMatchesFilter(subject, filter) && subjectMatchesQuery(subject, query))
    return sort === "name" ? [...matches].sort((a, b) => a.name.localeCompare(b.name)) : sortSubjects(matches)
  }, [subjects, filter, query, sort])
  const editingSubject = subjects.find((subject) => subject.id === editingSubjectId) ?? null

  function openCreateDialog() {
    setEditingSubjectId(null)
    setComposerOpen(true)
  }

  function openCustomizeDialog(subject: SubjectRecord) {
    setEditingSubjectId(subject.id)
    setComposerOpen(true)
  }

  function handleSubmit(draft: SubjectDraft) {
    const timestamp = new Date().toISOString()
    if (editingSubjectId) {
      setSubjects((current) => current.map((subject) => subject.id === editingSubjectId
        ? { ...subject, ...draft, updatedAt: timestamp } : subject))
    } else {
      const id = createSubjectId()
      setSubjects((current) => [...current, {
        id, ...draft, coverColor: defaultSubjectCoverColor, coverImage: getDefaultSubjectCover(id).file,
        milestones: [], progressStarted: false, createdAt: timestamp, updatedAt: timestamp, seeded: false,
      }])
    }
    setComposerOpen(false)
    setEditingSubjectId(null)
  }

  function handleCoverChange(cover: { coverColor: string; coverImage: string | null }) {
    if (!editingSubjectId) return
    setSubjects((current) => current.map((subject) => subject.id === editingSubjectId
      ? { ...subject, ...cover, updatedAt: new Date().toISOString() } : subject))
  }

  function clearFilters() { setQuery(""); setFilter("all") }

  return (
    <div ref={pageRef} className="mx-auto w-full max-w-7xl space-y-8 pb-6">
      <SubjectsHero intro="Your own space for subjects, notes, and study plans. Learn at your pace, with or without a class." onCreate={openCreateDialog} />
      <SampleDataNotice hasExamples={subjects.some((subject) => subject.seeded)} />
      <ContinueLearning subjects={subjects} />

      <section id="subject-library" aria-labelledby="subject-library-heading" className="space-y-5 scroll-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 id="subject-library-heading" className="text-xl font-semibold tracking-tight text-foreground">All subjects</h2>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{subjects.length}</span>
          </div>
          <span role="status" className="text-xs text-muted-foreground">{visibleSubjects.length} of {subjects.length} shown</span>
        </div>

        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter subjects by status">
            {subjectFilterOptions.map((option) => (
              <Button key={option.value} type="button" variant="ghost" size="sm" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}
                className={`rounded-full px-3.5 ${filter === option.value ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {option.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-40 flex-1 sm:w-44 sm:flex-none">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} aria-label="Search subjects" placeholder="Search subjects…" className="h-9 rounded-lg bg-background pl-9" />
            </div>
            <label>
              <span className="sr-only">Sort subjects</span>
              <select value={sort} onChange={(event) => setSort(event.currentTarget.value)} className="h-9 max-w-full rounded-lg border border-input bg-background px-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="recent">Recently updated</option><option value="name">Name A–Z</option>
              </select>
            </label>
            <div role="group" aria-label="Subject layout" className="inline-flex rounded-lg bg-muted p-0.5">
              {([{ value: "grid", label: "Grid view", icon: LayoutGrid }, { value: "list", label: "List view", icon: List }] as const).map(({ value, label, icon: Icon }) => (
                <Button key={value} type="button" variant="ghost" size="icon-sm" aria-label={label} aria-pressed={view === value} onClick={() => setView(value)} className={`rounded-md ${view === value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`}>
                  <Icon aria-hidden="true" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {visibleSubjects.length > 0 ? (view === "grid" ? (
          <ul aria-label="Subject library" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visibleSubjects.map((subject) => <li key={subject.id}><SubjectCard subject={subject} href={`/students/subjects/${subject.id}`} onCustomize={openCustomizeDialog} onDelete={setDeleteTarget} /></li>)}
          </ul>
        ) : (
          <ul aria-label="Subject library" className="space-y-2">
            {visibleSubjects.map((subject) => <SubjectListRow key={subject.id} subject={subject} href={`/students/subjects/${subject.id}`} />)}
          </ul>
        )) : (
          <div className="rounded-xl border border-dashed border-border bg-background px-6 py-14 text-center">
            <h3 className="font-semibold text-foreground">{subjects.length === 0 ? "Your learning starts here" : "No subjects match this view"}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{subjects.length === 0 ? "Add a subject, give it a few study topics, and make it your own. You don’t need to join a class." : "Try another status or search term to find what you’re looking for."}</p>
            <Button type="button" variant="outline" className="mt-5" onClick={subjects.length === 0 ? openCreateDialog : clearFilters}>
              {subjects.length === 0 ? <><Plus aria-hidden="true" /> Create a subject</> : "Clear search"}
            </Button>
          </div>
        )}
        <p className="text-xs leading-5 text-muted-foreground">{subjectsStorageNotice}</p>
      </section>

      <SubjectComposerDialog open={composerOpen} subject={editingSubject} onOpenChange={(open) => { setComposerOpen(open); if (!open) setEditingSubjectId(null) }} onSubmit={handleSubmit} onCoverChange={handleCoverChange} />
      <SubjectDeleteDialog open={deleteTarget !== null} subject={deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }} onConfirm={(subject) => { setSubjects((current) => current.filter((item) => item.id !== subject.id)); setDeleteTarget(null) }} />
    </div>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
