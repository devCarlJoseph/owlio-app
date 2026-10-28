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
