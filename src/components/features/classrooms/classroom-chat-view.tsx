import { useEffect, useRef, useState, type FormEvent } from "react"
import { FileText, Hash, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, WorkspaceRole } from "./classroom-types"
import { PersonAvatar } from "./classroom-ui"
import { isYou } from "./classroom-utils"

export function ClassroomChatView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { sendChatMessage } = useClassroomPrototype()
  const [draft, setDraft] = useState("")
  const [status, setStatus] = useState("")
  const listRef = useRef<HTMLOListElement>(null)
  const authorRole = role === "students" ? "student" : "educator"
  const educators = classroom.members.filter((member) => member.role === "educator")
  const students = classroom.members.filter((member) => member.role === "student")

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [classroom.chatMessages.length])

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = draft.trim()
    if (!message) return
    sendChatMessage(classroom.id, message, authorRole)
    setDraft("")
    setStatus("Message added for this preview session only. It was not delivered or saved.")
  }

  return (
    <div className="grid h-[34rem] max-h-[75dvh] grid-rows-[minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-white lg:max-h-none lg:grid-cols-[14rem_minmax(0,1fr)_16rem]">
      <aside aria-label="Chat members" className="hidden min-h-0 flex-col gap-4 overflow-y-auto border-r border-slate-100 p-4 lg:flex">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Group</h3>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
            <Hash aria-hidden="true" className="size-4" /> <span className="truncate">{classroom.name}</span>
          </div>
        </div>
        {[{ label: "Educators", people: educators }, { label: "Students", people: students }].map(({ label, people }) => (
          <div key={label}>
            <h3 className="text-sm font-semibold text-slate-900">{label} <span className="font-normal text-slate-500">· {people.length}</span></h3>
            <ul className="mt-2 space-y-2">
              {people.map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <PersonAvatar name={member.name} size="sm" />
                  <span className="truncate text-sm text-slate-700">{member.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <section aria-label={`${classroom.name} group chat`} className="flex min-h-0 min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">{classroom.name} group chat</h3>
            <p className="text-xs text-slate-500">{classroom.members.length} members · only for this class</p>
          </div>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Preview · not synced</Badge>
        </header>
        <ol
          ref={listRef}
          aria-label={`${classroom.name} group chat messages`}
          aria-live="polite"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5"
        >
          {classroom.chatMessages.length === 0 ? (
            <li className="m-auto max-w-sm text-center text-sm text-slate-500">No messages yet. Start the class-only conversation.</li>
          ) : classroom.chatMessages.map((message) => {
            const mine = isYou(message.authorName)
            return (
              <li key={message.id} className={`flex max-w-[92%] gap-2.5 sm:max-w-[80%] ${mine ? "flex-row-reverse self-end" : "self-start"}`}>
                <PersonAvatar name={message.authorName} size="sm" />
                <div className={mine ? "text-right" : ""}>
                  <p className="text-xs font-semibold text-slate-900">
                    {message.authorName}
                    <span className="ml-2 font-normal text-slate-500">{message.authorRole} · {message.createdAt}</span>
                  </p>
                  <p className={`mt-1 inline-block whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-left text-sm leading-5 ${mine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                    {message.body}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
        {status && <p role="status" className="px-4 pb-2 text-xs text-amber-800">{status}</p>}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-100 p-3">
          <Label htmlFor="class-chat-message" className="sr-only">Message this class</Label>
          <Input
            id="class-chat-message"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            maxLength={1000}
            placeholder="Type something to send…"
            className="min-w-0 flex-1"
          />
          <Button type="submit" disabled={!draft.trim()} aria-label="Send class chat message">
            <Send aria-hidden="true" /><span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </section>

      <aside aria-label="Class info" className="hidden min-h-0 flex-col gap-5 overflow-y-auto border-l border-slate-100 p-4 lg:flex">
        <div className="flex flex-col items-center text-center">
          <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-blue-700 text-xl font-bold text-white">
            {classroom.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-900">{classroom.name}</p>
          <p className="text-xs text-slate-500">{classroom.subject}</p>
        </div>
        <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between gap-2"><dt className="text-slate-500">Educator</dt><dd className="truncate text-right font-medium text-slate-900">{classroom.instructorName}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-slate-500">Members</dt><dd className="font-medium text-slate-900">{classroom.members.length}</dd></div>
        </dl>
        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">Attachments</h3>
          {classroom.materials.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">No files shared yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {classroom.materials.map((material) => (
                <li key={material.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <FileText aria-hidden="true" className="size-4 shrink-0 text-blue-700" />
                  <span className="truncate">{material.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
