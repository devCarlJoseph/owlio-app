import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import {
  ArrowDown,
  ArrowUp,
  Armchair,
  ClipboardList,
  DoorOpen,
  FolderOpen,
  MessageCircle,
  Music,
  PencilLine,
  RotateCcw,
  Send,
  Tags,
  Tv,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CharacterDialog } from "./character-dialog"
import { DrawerPanel } from "./drawer-panel"
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
import { getSampleRoster, sampleRosterNotice } from "../space-roster"
import { SpaceRoomScene, type CameraResetHandle } from "./space-room-scene"
import { focusMusicTracks } from "./focus-music"
import { buildSeats, roomSpawnPoint } from "./study-space-seats"
import { useFocusMusic } from "./use-focus-music"
import { usePomodoro } from "./use-pomodoro"
import {
  createStudySpaceId,
  loadSpaceCharacter,
  loadStudySpaces,
  markStudySpaceVisited,
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
  const seats = useMemo(() => (space ? buildSeats(space.kind, space.capacity) : []), [space])
  const samplePeople = useMemo(() => (space ? getSampleRoster(space, seats.length) : []), [space, seats.length])

  const [character, setCharacter] = useState<StudySpaceCharacter | null>(() =>
    spaceId ? loadSpaceCharacter(spaceId) : null
  )
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [bubble, setBubble] = useState<{ id: string; text: string } | null>(null)
  const [showNameTags, setShowNameTags] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [panel, setPanel] = useState<"music" | "timer" | "drawer" | "tasks" | "tv" | null>(null)
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
  const freeSeats = seats.length - samplePeople.length - (seatedSeatId ? 1 : 0)
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
    <div className="mx-auto flex h-full min-h-0 w-full flex-col gap-2">
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
            {freeSeats} of {seats.length} seats open
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

      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
        {character ? (
          <SpaceRoomScene
            character={character}
            seats={seats}
            samplePeople={samplePeople}
            tasks={tasks}
            tvHasVideo={tvVideo !== null}
            drawerOpen={panel === "drawer"}
            musicPlaying={music.playback.playing}
            onOpenTasks={() => setPanel("tasks")}
            onOpenTv={() => setPanel("tv")}
            onToggleDrawer={() => togglePanel("drawer")}
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
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-slate-950" />
        )}

        {!noticeDismissed ? (
          <div className="absolute left-3 top-3 z-10 flex max-w-sm items-start gap-2 rounded-lg bg-slate-900/85 px-3 py-2 text-xs leading-5 text-slate-200">
            <p className="flex-1">
              {studySpaceRoomPreviewNotice}
              {samplePeople.length > 0 ? ` ${sampleRosterNotice}` : ""}
            </p>
            <button
              type="button"
              onClick={() => setNoticeDismissed(true)}
              aria-label="Dismiss preview notice"
              className="shrink-0 rounded text-slate-400 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white"
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

        <p className="sr-only" role="status" aria-live="polite">
          {bubble ? `You said: ${bubble.text}` : ""}
          {timer.status === "finished" ? " Focus timer finished." : ""}
        </p>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-2 bg-slate-900/85 px-3 py-2 backdrop-blur">
          {seatedSeat ? (
            <span className="flex items-center gap-2 rounded-lg border border-emerald-700/60 bg-emerald-950/80 px-2 py-1 text-xs text-emerald-100">
              <Armchair className="size-3.5" aria-hidden="true" />
              Seated at {seatedSeat.name}
              <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={standUp}
                className="text-emerald-200 hover:text-white"
              >
                Stand up
              </Button>
            </span>
          ) : (
            <span className="hidden text-xs text-slate-400 md:inline">Choose a seat in the room</span>
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
              className="border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!character || draft.trim().length === 0}
              className="bg-blue-600 text-white hover:bg-blue-500"
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
            <span className="hidden items-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200 sm:flex">
              <Music className="size-3.5 text-emerald-400" aria-hidden="true" />
              <span className="max-w-28 truncate">{activeTrack.title}</span>
              <button
                type="button"
                onClick={() => (music.playback.playing ? music.pause() : music.play(activeTrack))}
                aria-label={music.playback.playing ? "Pause music" : "Resume music"}
                className="rounded px-1 text-slate-300 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white"
              >
                {music.playback.playing ? "Pause" : "Play"}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={music.toggle}
              aria-label="Play room music"
              className="hidden items-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white sm:flex"
            >
              <Music className="size-3.5 text-emerald-400" aria-hidden="true" />
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
