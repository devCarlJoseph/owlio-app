import { useEffect, useState } from "react"
import { PrivateFileManager } from "@/components/common/files/private-file-manager"
import { Button } from "@/components/ui/button"
import { listClassroomLinks } from "@/services/api/private-files.service"
import { getApiErrorMessage } from "@/services/api/api-error"
import type { Classroom } from "../types/classroom-types"

function safeResourceUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}
export function ClassroomMaterialsView({
  classroom,
}: {
  classroom: Classroom
}) {
  const [links, setLinks] = useState<
    { id: string; title: string; url: string }[]
  >([])
  const [error, setError] = useState("")
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    listClassroomLinks(classroom.id, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setLinks(result.items)
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            getApiErrorMessage(cause, "Shared links could not be loaded."),
          )
      })
    return () => controller.abort()
  }, [classroom.id, revision])
  return (
    <div className="space-y-4">
      <PrivateFileManager
        kind="classroom"
        id={classroom.id}
        canUpload={classroom.access === "owner" && !classroom.archivedAt}
        title="Classroom materials"
      />
      {error && (
        <div role="alert" className="space-y-2 text-sm">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setError("")
              setRevision((value) => value + 1)
            }}
          >
            Retry shared links
          </Button>
        </div>
      )}
      {!!links.length && (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h4 className="text-sm font-semibold">Shared resource links</h4>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  className="break-words text-sm underline"
                  href={safeResourceUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
