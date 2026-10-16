import { useState, type FormEvent } from "react"
import { LockKeyhole, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, WorkspaceRole } from "./classroom-types"

export function ClassroomChatView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { sendChatMessage } = useClassroomPrototype()
  const [draft, setDraft] = useState("")
  const [status, setStatus] = useState("")
  const authorRole = role === "students" ? "student" : "educator"

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = draft.trim()
    if (!message) return
    sendChatMessage(classroom.id, message, authorRole)
    setDraft("")
    setStatus("Demo message added to this class in this session only. It was not delivered or saved.")
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LockKeyhole aria-hidden="true" className="size-4 text-blue-700" />
              {classroom.name} group chat
            </CardTitle>
            <CardDescription className="mt-1">A separate conversation for members of this class.</CardDescription>
          </div>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Preview · not synced</Badge>
        </div>
      </CardHeader>
      <CardContent className="gap-0 p-0">
        <p className="px-5 pt-4 text-xs leading-5 text-slate-500">
          Messages stay scoped to this classroom in the preview. They are not saved or delivered to other people, devices, or sessions.
        </p>
        <ol
          aria-label={`${classroom.name} demo group chat messages`}
          aria-live="polite"
          className="flex max-h-[28rem] min-h-56 flex-col gap-3 overflow-y-auto px-4 py-5 sm:px-6"
        >
          {classroom.chatMessages.length === 0 ? (
            <li className="m-auto max-w-sm text-center text-sm text-slate-500">No demo messages yet. Start the class-only conversation.</li>
          ) : classroom.chatMessages.map((message) => (
            <li key={message.id} className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[78%] ${message.authorRole === authorRole && message.authorName.startsWith("You") ? "self-end bg-blue-600 text-white" : "self-start bg-slate-100 text-slate-800"}`}>
              <p className={`text-xs font-semibold ${message.authorRole === authorRole && message.authorName.startsWith("You") ? "text-blue-50" : "text-slate-900"}`}>
                {message.authorName}
                <span className={`ml-2 font-normal ${message.authorRole === authorRole && message.authorName.startsWith("You") ? "text-blue-100" : "text-slate-500"}`}>
                  {message.authorRole} · {message.createdAt}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5">{message.body}</p>
            </li>
          ))}
        </ol>
        {status && <p role="status" className="px-5 pb-3 text-xs text-amber-800">{status}</p>}
        <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-slate-100 bg-slate-50 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <Label htmlFor="class-chat-message" className="sr-only">Message this class</Label>
            <Input
              id="class-chat-message"
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              maxLength={1000}
              placeholder="Write a message to this class…"
              aria-describedby="class-chat-note"
            />
            <p id="class-chat-note" className="mt-1 px-1 text-[11px] text-slate-500">Demo messages are cleared when this preview session ends.</p>
          </div>
          <Button type="submit" disabled={!draft.trim()} aria-label="Send demo class chat message">
            <Send aria-hidden="true" /><span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
