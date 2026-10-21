import { useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { DoorOpen, MessageCircle, PencilLine, RotateCcw, Send, Tags } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CharacterDialog } from "./character-dialog"
import { RoomChatPanel, type RoomMessage } from "./room-chat-panel"
import { SpaceRoomScene, type CameraResetHandle } from "./space-room-scene"
import {
  createStudySpaceId,
  loadSpaceCharacter,
  loadStudySpaces,
  saveSpaceCharacter,
  studySpaceRoomPreviewNotice,
  type StudySpaceCharacter,
} from "../study-spaces-records"

const BUBBLE_DURATION_MS = 6000

export function StudySpaceDetailView() {
  const { spaceId } = useParams()
  const space = useMemo(
    () => loadStudySpaces().find((record) => record.id === spaceId) ?? null,
    [spaceId]
  )

  const [character, setCharacter] = useState<StudySpaceCharacter | null>(() =>
    spaceId ? loadSpaceCharacter(spaceId) : null
  )
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [bubble, setBubble] = useState<{ id: string; text: string } | null>(null)
  const [showNameTags, setShowNameTags] = useState(true)
  const [chatOpen, setChatOpen] = useState(true)
  const [draft, setDraft] = useState("")
  const cameraResetRef = useRef<CameraResetHandle | null>(null)
  const bubbleTimeoutRef = useRef<number | null>(null)

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

  function handleCharacterSubmit(draft: Pick<StudySpaceCharacter, "name" | "bodyColor" | "accentColor">) {
    const next: StudySpaceCharacter = { ...draft, createdAt: new Date().toISOString() }
    if (spaceId) saveSpaceCharacter(spaceId, next)
    setCharacter(next)
    setEditDialogOpen(false)
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
    <div className="mx-auto flex h-full min-h-0 w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {space.name}
            </h2>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {space.role === "owner" ? "Created by you" : "Joined"}
            </Badge>
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
              Local preview
            </Badge>
          </div>
          {space.about ? (
            <p className="mt-1 line-clamp-1 text-sm text-slate-600">{space.about}</p>
          ) : null}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={showNameTags}
            onClick={() => setShowNameTags((current) => !current)}
          >
            <Tags aria-hidden="true" />
            Name tags
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => cameraResetRef.current?.reset()}
          >
            <RotateCcw aria-hidden="true" />
            Reset camera
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={chatOpen}
            onClick={() => setChatOpen((current) => !current)}
          >
            <MessageCircle aria-hidden="true" />
            Chat
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            disabled={!character}
          >
            <PencilLine aria-hidden="true" />
            Edit character
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link to="/students/study-spaces" />}
          >
            <DoorOpen aria-hidden="true" />
            Leave space
          </Button>
        </div>
      </div>

      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
        {character ? (
          <SpaceRoomScene
            character={character}
            kind={space.kind}
            capacity={space.capacity}
            showNameTag={showNameTags}
            bubbleText={bubble?.text ?? null}
            cameraResetRef={cameraResetRef}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-slate-950" />
        )}

        <p className="pointer-events-none absolute left-3 top-3 z-10 max-w-xs rounded-lg bg-slate-900/85 px-3 py-2 text-xs leading-5 text-slate-200">
          {studySpaceRoomPreviewNotice}
        </p>

        {chatOpen ? <RoomChatPanel messages={messages} onClose={() => setChatOpen(false)} /> : null}

        <p className="sr-only" role="status" aria-live="polite">
          {bubble ? `You said: ${bubble.text}` : ""}
        </p>

        <form
          className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 bg-slate-900/85 p-3 backdrop-blur"
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
            className="border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!character || draft.trim().length === 0}
            className="bg-blue-600 text-white hover:bg-blue-500"
          >
            <Send aria-hidden="true" />
            Send
          </Button>
        </form>
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
