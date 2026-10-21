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
