import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Globe2, Info, Layers, List, Maximize2, Minimize2, Plus, Search, Users } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateSpaceDialog, type SpaceDraft } from "./create-space-dialog"
import { JoinSpaceDialog, type JoinSpaceDraft } from "./join-space-dialog"
import { LockedSpaceGrid, SpaceGrid, SpaceGridEmptyState } from "./space-card-grid"
import { SpaceMap } from "./space-map"
import {
  createStudySpaceId,
  loadJoinedDiscoveryIds,
  loadStudySpaces,
  sampleDiscoverySpaces,
  saveJoinedDiscoveryIds,
  saveStudySpaces,
  sortSpaces,
  studySpacesDiscoveryCaption,
  studySpacesGuidance,
  studySpacesOpenHint,
  studySpacesStorageNotice,
  type SpaceSortKey,
  type StudySpaceRecord,
} from "./study-spaces-records"

const StudyHallWorld = lazy(() => import("./study-hall-world"))

type HallView = "world" | "list"

const SORT_LABELS: Record<SpaceSortKey, string> = {
  recent: "Recently opened",
  newest: "Newest",
  name: "Name A–Z",
}

function hasWebGL(): boolean {
  if (typeof document === "undefined" || /jsdom/i.test(navigator.userAgent)) return false
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}

export function StudySpacesView() {
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState<StudySpaceRecord[]>(() => loadStudySpaces())
  const [joinedDiscoveryIds, setJoinedDiscoveryIds] = useState<string[]>(() => loadJoinedDiscoveryIds())
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinTarget, setJoinTarget] = useState<StudySpaceRecord | null>(null)
  const [sort, setSort] = useState<SpaceSortKey>("recent")
  const [query, setQuery] = useState("")
  const [webgl] = useState(hasWebGL)
  const [view, setView] = useState<HallView>(() => (webgl ? "world" : "list"))
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    saveStudySpaces(spaces)
  }, [spaces])

  useEffect(() => {
    saveJoinedDiscoveryIds(joinedDiscoveryIds)
  }, [joinedDiscoveryIds])

  useEffect(() => {
    if (!expanded) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !document.querySelector("[role='dialog']")) setExpanded(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [expanded])

  const needle = query.trim().toLowerCase()
  const matches = (space: StudySpaceRecord) => needle === "" || space.name.toLowerCase().includes(needle)

  const createdSpaces = useMemo(
    () => sortSpaces(spaces.filter((space) => space.role === "owner" && matches(space)), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaces, sort, needle]
  )

  const joinedSpaces = useMemo(
    () => sortSpaces(spaces.filter((space) => space.role === "member" && matches(space)), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaces, sort, needle]
  )

  const lockedSpaces = useMemo(
    () =>
      sortSpaces(
        sampleDiscoverySpaces.filter((space) => !joinedDiscoveryIds.includes(space.id) && matches(space)),
        sort
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [joinedDiscoveryIds, sort, needle]
  )

  const total = createdSpaces.length + joinedSpaces.length + lockedSpaces.length

  function handleCreate(draft: SpaceDraft) {
    const space: StudySpaceRecord = {
      id: createStudySpaceId(),
      name: draft.name,
      about: draft.about,
      role: "owner",
      kind: draft.kind,
      capacity: draft.capacity,
      createdAt: new Date().toISOString(),
    }
    setSpaces((current) => [...current, space])
    setCreateOpen(false)
    navigate(`/students/study-spaces/${space.id}`)
  }

  function openJoin(target: StudySpaceRecord | null) {
    setJoinTarget(target)
    setJoinOpen(true)
  }

  function handleJoin(draft: JoinSpaceDraft) {
    const inviteCode = draft.inviteCode.length > 0 ? draft.inviteCode : undefined
    const createdAt = new Date().toISOString()

    setSpaces((current) => [
      ...current,
      joinTarget
        ? {
            id: createStudySpaceId(),
            name: joinTarget.name,
            about: joinTarget.about,
            role: "member",
            kind: joinTarget.kind,
            capacity: joinTarget.capacity,
            createdAt,
            inviteCode,
          }
        : {
            id: createStudySpaceId(),
            name: draft.name,
            about: "",
            role: "member",
            kind: "collaborative",
            capacity: 4,
            createdAt,
            inviteCode,
          },
    ])
    if (joinTarget) {
      const discoveryId = joinTarget.id
      setJoinedDiscoveryIds((current) => (current.includes(discoveryId) ? current : [...current, discoveryId]))
    }
    setJoinOpen(false)
  }

  function handleRemove(space: StudySpaceRecord) {
    setSpaces((current) => current.filter((record) => record.id !== space.id))
  }

  function changeView(next: HallView) {
    setView(next)
    if (next === "list") setExpanded(false)
  }

  const overlay = view === "world"
  const pill = overlay ? "bg-white/95 shadow-sm" : "bg-white shadow-sm"

  const toolbar = (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        overlay && "pointer-events-none *:pointer-events-auto"
      )}
    >
      <h2
        id="study-hall-title"
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
      >
        <Layers className="size-4" aria-hidden="true" />
        Study hall
      </h2>
      <p className={cn("rounded-full px-3 py-2 text-xs font-medium text-slate-600", pill)}>
        {createdSpaces.length} yours · {joinedSpaces.length} joined · {lockedSpaces.length} locked
      </p>
      <div role="group" aria-label="Study hall view" className={cn("flex rounded-full p-1", pill)}>
        <Button
          type="button"
          size="xs"
          variant={view === "world" ? "default" : "ghost"}
          className="rounded-full"
          aria-pressed={view === "world"}
          onClick={() => changeView("world")}
        >
          <Globe2 aria-hidden="true" />
          World
        </Button>
        <Button
          type="button"
          size="xs"
          variant={view === "list" ? "default" : "ghost"}
          className="rounded-full"
          aria-pressed={view === "list"}
          onClick={() => changeView("list")}
        >
          <List aria-hidden="true" />
          List
        </Button>
      </div>
      <div className="relative min-w-48 flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search study spaces"
          placeholder="Search a space name"
          className={cn("h-9 rounded-full border-transparent pl-9", pill)}
        />
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Select value={sort} onValueChange={(value) => setSort(value as SpaceSortKey)}>
          <SelectTrigger size="sm" aria-label="Sort spaces" className={cn("rounded-full", pill)}>
            <SelectValue>{SORT_LABELS[sort]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SpaceSortKey[]).map((key) => (
              <SelectItem key={key} value={key}>
                {SORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" className="rounded-full shadow-sm" onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          Create space
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn("rounded-full", pill)}
          onClick={() => openJoin(null)}
        >
          <Plus aria-hidden="true" />
          Join space
        </Button>
        {overlay ? (
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className={cn("rounded-full", pill)}
            aria-pressed={expanded}
            aria-label={expanded ? "Exit full screen" : "Expand study hall to full screen"}
            title={expanded ? "Exit full screen (Esc)" : "Full screen"}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
          </Button>
        ) : null}
      </div>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl">
      {view === "world" ? (
        <section
          aria-labelledby="study-hall-title"
          className={cn(
            "overflow-hidden bg-[#e3f1fb]",
            expanded
              ? "fixed inset-0 z-40"
              : "relative h-[calc(100svh-6rem)] min-h-[520px] rounded-3xl border border-slate-200 shadow-sm sm:h-[calc(100svh-7rem)] lg:h-[calc(100svh-8rem)]"
          )}
        >
          {webgl ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-slate-600">
                  Loading study hall…
                </div>
              }
            >
              <StudyHallWorld
                created={createdSpaces}
                joined={joinedSpaces}
                locked={lockedSpaces}
                toolbar={toolbar}
                onOpen={(space) => navigate(`/students/study-spaces/${space.id}`)}
                onUnlock={openJoin}
              />
            </Suspense>
          ) : (
            <>
              <SpaceMap
                className="absolute inset-0 bg-[#ece3cf]"
                created={createdSpaces}
                joined={joinedSpaces}
                locked={lockedSpaces}
                onUnlock={openJoin}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3">{toolbar}</div>
            </>
          )}
        </section>
      ) : (
        <section aria-labelledby="study-hall-title" className="space-y-6">
          {toolbar}

          <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <Users className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
            <p className="flex-1 text-sm leading-6 text-blue-800">{studySpacesGuidance}</p>
            <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {studySpacesStorageNotice}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="flex items-baseline gap-2 text-2xl font-bold text-slate-900">
              Spaces
              <span className="text-sm font-semibold text-slate-500">{total}</span>
            </h3>

            <ListSection
              title="Spaces you've created"
              emptyMessage="You have not created a peer space yet. Use the create space button to start one."
              spaces={createdSpaces}
              onRemove={handleRemove}
            />
            <ListSection
              title="Spaces you've joined"
              emptyMessage="You have not joined a peer space yet. Use the join space button to add one."
              spaces={joinedSpaces}
              onRemove={handleRemove}
            />
            {lockedSpaces.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Preview spaces — locked ({lockedSpaces.length})
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{studySpacesDiscoveryCaption}</p>
                </div>
                <LockedSpaceGrid label="Preview spaces (locked)" spaces={lockedSpaces} onUnlock={openJoin} />
              </div>
            )}
          </div>

          <p className="text-xs leading-5 text-slate-500">{studySpacesOpenHint}</p>
        </section>
      )}

      <CreateSpaceDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      <JoinSpaceDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        onSubmit={handleJoin}
        previewName={joinTarget?.name ?? null}
      />
    </div>
  )
}

function ListSection({
  title,
  spaces,
  onRemove,
  emptyMessage,
}: {
  title: string
  spaces: StudySpaceRecord[]
  onRemove: (space: StudySpaceRecord) => void
  emptyMessage: string
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">
          {title} ({spaces.length})
        </h4>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Peer spaces in this browser. Room previews reflect each space's layout.
        </p>
      </div>
      {spaces.length > 0 ? (
        <SpaceGrid label={title} spaces={spaces} onRemove={onRemove} />
      ) : (
        <SpaceGridEmptyState message={emptyMessage} />
      )}
    </div>
  )
}
