import { useEffect, useRef, useState } from "react"
import { Download, Eye, FileText, Pencil, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { openDownload } from "@/services/api/academic.service"
import { getApiErrorMessage } from "@/services/api/api-error"
import {
  beginPrivateUpload,
  completePrivateUpload,
  listPrivateFiles,
  privateFileUrl,
  removePrivateFile,
  renamePrivateFile,
  transferPrivateUpload,
  type FileReservation,
  type FileScope,
  type PrivateFile,
} from "@/services/api/private-files.service"

export function PrivateFileManager({
  kind,
  id,
  canUpload,
  disabled = false,
  title = "Files",
  onBusyChange,
}: {
  kind: FileScope["kind"]
  id: string
  canUpload: boolean
  disabled?: boolean
  title?: string
  onBusyChange?: (busy: boolean) => void
}) {
  const [files, setFiles] = useState<PrivateFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const alive = useRef(true)
  const [revision, setRevision] = useState(0)
  const [upload, setUpload] = useState<{
    file: File
    reservation: FileReservation
    transferred: boolean
  } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [name, setName] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const scope = { kind, id }
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    listPrivateFiles({ kind, id }, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setFiles(result)
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(getApiErrorMessage(cause, "Files could not be loaded."))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [kind, id, revision])
  async function run(action: () => Promise<void>) {
    if (pending.current || disabled) return
    pending.current = true
    setBusy(true)
    onBusyChange?.(true)
    setError("")
    setNotice("")
    try {
      await action()
    } catch (cause) {
      if (alive.current)
        setError(
          getApiErrorMessage(cause, "The file operation failed. Try again."),
        )
    } finally {
      pending.current = false
      if (alive.current) {
        setBusy(false)
        onBusyChange?.(false)
      }
    }
  }
  async function send(file?: File) {
    await run(async () => {
      let current = upload
      if (!current) {
        if (!file) return
        current = {
          file,
          reservation: await beginPrivateUpload(scope, file),
          transferred: false,
        }
        if (alive.current) setUpload(current)
      }
      if (!current.transferred) {
        if (Date.parse(current.reservation.uploadExpiresAt) <= Date.now()) {
          if (alive.current) setUpload(null)
          throw new Error("The upload link expired. Choose the file again.")
        }
        await transferPrivateUpload(current.reservation, current.file)
        current = { ...current, transferred: true }
        if (alive.current) setUpload(current)
      }
      if (Date.parse(current.reservation.completeBefore) <= Date.now()) {
        if (alive.current) setUpload(null)
        throw new Error("The upload expired. Choose the file again.")
      }
      const saved = await completePrivateUpload(scope, current.reservation)
      if (alive.current) {
        setFiles((previous) => [
          ...previous.filter((item) => item.id !== saved.id),
          saved,
        ])
        setUpload(null)
        setNotice(`${saved.fileName} uploaded and saved.`)
      }
    })
  }
  const locked = busy || disabled
  return (
    <section
      aria-label={title}
      className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">{title}</h4>
        {canUpload && (
          <>
            <input
              ref={input}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              aria-label={`Choose file for ${title}`}
              className="sr-only"
              disabled={locked || loading || !!upload}
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ""
                if (file) void send(file)
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={locked || loading || !!upload}
              onClick={() => input.current?.click()}
            >
              <Upload aria-hidden="true" />
              {busy ? "Working…" : "Add file"}
            </Button>
          </>
        )}
      </header>
      <p className="text-xs leading-5 text-muted-foreground">
        PDF, PNG, or JPEG · up to 5 MB per file.
        {kind === "locker"
          ? " Saved to your account’s private locker in this study space."
          : kind === "classwork"
            ? " Draft attachments become available to enrolled students when classwork is published."
            : " Classroom files are available to the teacher and enrolled students."}
      </p>
      {loading && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading files…
        </p>
      )}
      {error && (
        <div role="alert" className="space-y-2 text-sm text-destructive">
          <p>{error}</p>
          {!upload && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={locked}
              onClick={() => {
                setError("")
                setLoading(true)
                setRevision((value) => value + 1)
              }}
            >
              Reload files
            </Button>
          )}
        </div>
      )}
      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      )}
      {upload && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>
            {upload.file.name}:{" "}
            {upload.transferred
              ? "awaiting confirmation"
              : "transfer not confirmed"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locked}
            onClick={() => void send()}
          >
            Retry upload
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={locked}
            onClick={() => setUpload(null)}
          >
            Cancel upload
          </Button>
        </div>
      )}
      {!loading && !error && !files.length && (
        <p className="py-4 text-sm text-muted-foreground">No files yet.</p>
      )}
      <ul aria-label={`${title} list`} className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-border p-3"
          >
            <FileText
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium">{file.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {(file.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={`View ${file.fileName}`}
                disabled={locked}
                onClick={() =>
                  void run(() =>
                    openDownload(() => privateFileUrl(scope, file.id, true)),
                  )
                }
              >
                <Eye aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={`Download ${file.fileName}`}
                disabled={locked}
                onClick={() =>
                  void run(() =>
                    openDownload(() => privateFileUrl(scope, file.id)),
                  )
                }
              >
                <Download aria-hidden="true" />
              </Button>
              {canUpload && kind !== "classwork" && (
                <>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Rename ${file.fileName}`}
                    disabled={locked}
                    onClick={() => {
                      setRenaming(file.id)
                      setName(file.fileName)
                    }}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove ${file.fileName}`}
                    disabled={locked}
                    onClick={() =>
                      void run(async () => {
                        await removePrivateFile(scope, file.id)
                        if (alive.current) {
                          setFiles((previous) =>
                            previous.filter((item) => item.id !== file.id),
                          )
                          setNotice(`${file.fileName} removed.`)
                        }
                      })
                    }
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </>
              )}
            </div>
            {renaming === file.id && (
              <form
                className="flex w-full gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  void run(async () => {
                    const saved = await renamePrivateFile(
                      scope,
                      file,
                      name.trim(),
                    )
                    if (alive.current) {
                      setFiles((previous) =>
                        previous.map((item) =>
                          item.id === saved.id ? saved : item,
                        ),
                      )
                      setRenaming(null)
                    }
                  })
                }}
              >
                <Input
                  aria-label={`New name for ${file.fileName}`}
                  maxLength={120}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={locked}
                  autoFocus
                />
                <Button type="submit" size="sm" disabled={locked}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={locked}
                  onClick={() => setRenaming(null)}
                >
                  Cancel
                </Button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
