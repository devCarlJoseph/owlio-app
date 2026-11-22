import { StudySpaceSkeleton } from '../ui/study-space-skeleton'
import { lazy, Suspense, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Globe2, Info, Layers, List, Maximize2, Minimize2, Plus, Search, Users } from "lucide-react"
import { cn } from "cn"
import { AuthSessionContext } from "@/components/features/auth/context/auth-session-context"
import { getApiErrorMessage } from "@/services/api/api-error"
import { createStudySpace, getDiscoverableStudySpaces, getStudySpaces, joinStudySpace, removeStudySpace } from "@/services/api/study-space.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateSpaceDialog, type SpaceDraft } from "../forms/create-space-dialog"
import { JoinSpaceDialog, type JoinSpaceDraft } from "../forms/join-space-dialog"
import { LockedSpaceGrid, SpaceGrid, SpaceGridEmptyState } from "../ui/space-card-grid"
import { SpaceMap } from "../ui/space-map"
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
} from "../utils/study-spaces-records"

const StudyHallWorld = lazy(() => import("../ui/study-hall-world"))

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
  const user = useContext(AuthSessionContext)?.user
  const { hash } = useLocation()
  const code = new URLSearchParams(hash.slice(1)).get("join") ?? ""
  return <StudySpacesHall key={`${user?.id ?? "local"}:${code}`} userId={user?.id} accountName={user?.name} invitationCode={code} />
}

function StudySpacesHall({ userId, accountName, invitationCode }: { userId?: string; accountName?: string; invitationCode: string }) {
  const navigate = useNavigate()
  const [accountSpaces, setAccountSpaces] = useState<StudySpaceRecord[]>([])
  const [discoverySpaces, setDiscoverySpaces] = useState<StudySpaceRecord[]>([])
  const [directoryStatus, setDirectoryStatus] = useState(userId ? "Loading your spaces and the student directory…" : "")
  const [directoryError, setDirectoryError] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [localCreate, setLocalCreate] = useState(false)
  const [localJoin, setLocalJoin] = useState(false)
  const active = useRef(false)
  const [spaces, setSpaces] = useState<StudySpaceRecord[]>(() => loadStudySpaces())
  const [joinedDiscoveryIds, setJoinedDiscoveryIds] = useState<string[]>(() => loadJoinedDiscoveryIds())
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(Boolean(userId && invitationCode))
  const [joinTarget, setJoinTarget] = useState<StudySpaceRecord | null>(null)
  const [sort, setSort] = useState<SpaceSortKey>("recent")
  const [query, setQuery] = useState("")
  const [webgl] = useState(hasWebGL)
  const [view, setView] = useState<HallView>(() => (webgl ? "world" : "list"))
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    const accountRequest = getStudySpaces(controller.signal).then((records) => {
      if (!controller.signal.aborted) setAccountSpaces(records.map((space) => ({ ...space, accountSpace: true })))
    })
    const discoveryRequest = getDiscoverableStudySpaces(controller.signal).then((records) => {
      if (!controller.signal.aborted) setDiscoverySpaces(records)
    })
    void Promise.allSettled([accountRequest, discoveryRequest]).then((results) => {
      if (controller.signal.aborted) return
      const failureIndex = results.findIndex((result) => result.status === "rejected")
      if (failureIndex < 0) {
        setDirectoryStatus("")
        return
      }
      const failure = results[failureIndex]
      const fallback = failureIndex === 0 ? "Could not load your shared study spaces." : "Could not load the student Study Spaces directory."
      setDirectoryError(true)
      setDirectoryStatus(getApiErrorMessage(failure.status === "rejected" ? failure.reason : null, fallback))
    })
    return () => controller.abort()
  }, [userId, refresh])

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
    () => sortSpaces([...accountSpaces, ...spaces].filter((space) => space.role === "owner" && matches(space)), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountSpaces, spaces, sort, needle]
  )

  const joinedSpaces = useMemo(
    () => sortSpaces([...accountSpaces, ...spaces].filter((space) => space.role === "member" && matches(space)), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountSpaces, spaces, sort, needle]
  )

  const lockedSpaces = useMemo(
    () => {
      const joinedIds = new Set([...accountSpaces.map((space) => space.id), ...joinedDiscoveryIds])
      return sortSpaces(
        [
          ...discoverySpaces.filter((space) => !joinedIds.has(space.id)),
          ...sampleDiscoverySpaces.filter((space) => !joinedIds.has(space.id)),
        ].filter(matches),
        sort
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountSpaces, discoverySpaces, joinedDiscoveryIds, sort, needle]
  )

  const total = createdSpaces.length + joinedSpaces.length + lockedSpaces.length

  async function handleCreate(draft: SpaceDraft) {
    if (userId && !localCreate) {
      const space = await createStudySpace(draft.name, draft.about, draft)
      if (!active.current) return
      navigate(`/students/study-spaces/${space.id}`, { state: { offerInvite: true } })
      return
    }
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

  function openJoin(target: StudySpaceRecord | null, browserOnly = false) {
    setJoinTarget(target)
    setLocalJoin(browserOnly)
    setJoinOpen(true)
  }

  async function handleJoin(draft: JoinSpaceDraft) {
    if (userId && joinTarget?.discoverySpace && !localJoin) {
      const space = await joinStudySpace(draft.inviteCode, joinTarget.id)
      if (active.current) {
        setRefresh((current) => current + 1)
        navigate(`/students/study-spaces/${space.id}`)
      }
      return
    }
    if (userId && !joinTarget && !localJoin) {
      const space = await joinStudySpace(draft.inviteCode)
      if (active.current) navigate(`/students/study-spaces/${space.id}`)
      return
    }
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

  async function handleRemove(space: StudySpaceRecord) {
    if (space.accountSpace) {
      await removeStudySpace(space)
      setAccountSpaces((current) => current.filter((record) => record.id !== space.id))
      setRefresh((current) => current + 1)
      return
    }
    setSpaces((current) => current.filter((record) => record.id !== space.id))
  }

  function changeView(next: HallView) {
    setView(next)
    if (next === "list") setExpanded(false)
  }

  const overlay = view === "world"
  const pill = overlay ? "bg-white/95 surface-dark:bg-card/95 shadow-sm" : "bg-white surface-dark:bg-card shadow-sm"

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
      <p className={cn("rounded-full px-3 py-2 text-xs font-medium text-slate-600 surface-dark:text-muted-foreground", pill)}>
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
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 surface-dark:text-muted-foreground"
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
        <Button type="button" size="sm" className="rounded-full shadow-sm" onClick={() => { setLocalCreate(false); setCreateOpen(true) }}>
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
          {userId ? "Join by code" : "Join space"}
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
      {directoryStatus && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm" role={directoryError ? "alert" : "status"}>
          {directoryStatus}
          {directoryError && <Button size="xs" variant="outline" onClick={() => {
            setDirectoryError(false)
            setDirectoryStatus("Loading your spaces and the student directory…")
            setRefresh((current) => current + 1)
          }}>Retry</Button>}
        </div>
      )}
      {view === "world" ? (
        <section
          aria-labelledby="study-hall-title"
          className={cn(
            "overflow-hidden bg-[#e3f1fb]",
            expanded
              ? "fixed inset-0 z-40"
              : "relative h-[calc(100svh-6rem)] min-h-[520px] rounded-3xl border border-slate-200 surface-dark:border-border shadow-sm sm:h-[calc(100svh-7rem)] lg:h-[calc(100svh-8rem)]"
          )}
        >
          {webgl ? (
            <Suspense
              fallback={
                <StudySpaceSkeleton world />
              }
            >
              <StudyHallWorld
                accountName={accountName}
                accountId={userId}
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

          <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 surface-dark:border-surface-blue-border bg-blue-50 surface-dark:bg-surface-blue-soft px-4 py-3">
            <Users className="mt-1 size-4 shrink-0 text-blue-700 surface-dark:text-blue-300" aria-hidden="true" />
            <p className="flex-1 text-sm leading-6 text-blue-800 surface-dark:text-blue-300">{studySpacesGuidance}</p>
            <p className="flex w-full items-start gap-2 border-t border-blue-100 surface-dark:border-surface-blue-border pt-2 text-xs leading-5 text-blue-800 surface-dark:text-blue-300 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {userId ? "Shared spaces you own or have joined appear here alongside your browser-only rooms." : studySpacesStorageNotice}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="flex items-baseline gap-2 text-2xl font-bold text-slate-900 surface-dark:text-foreground">
              Spaces
              <span className="text-sm font-semibold text-slate-500 surface-dark:text-muted-foreground">{total}</span>
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
                  <h4 className="text-sm font-semibold text-slate-900 surface-dark:text-foreground">
                    Student study spaces — access code required ({lockedSpaces.length})
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">{studySpacesDiscoveryCaption}</p>
                </div>
                <LockedSpaceGrid label="Preview spaces (locked)" spaces={lockedSpaces} onUnlock={openJoin} />
              </div>
            )}
          </div>

          {userId ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => { setLocalCreate(true); setCreateOpen(true) }}>
                Create a browser-only room
              </Button>
              <Button variant="outline" size="sm" onClick={() => openJoin(null, true)}>
                Add a browser-only joined room
              </Button>
            </div>
          ) : <p className="text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">{studySpacesOpenHint}</p>}
        </section>
      )}

      <CreateSpaceDialog accountSpace={Boolean(userId && !localCreate)} open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      <JoinSpaceDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        initialCode={invitationCode}
        onSubmit={handleJoin}
        previewName={joinTarget?.name ?? null}
        accountId={joinTarget || localJoin ? undefined : userId}
        serverSpace={Boolean(joinTarget?.discoverySpace)}
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
  onRemove: (space: StudySpaceRecord) => void | Promise<void>
  emptyMessage: string
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 surface-dark:text-foreground">
          {title} ({spaces.length})
        </h4>
        <p className="mt-1 text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">
          Open a room to study. Browser-only rooms are labeled on their cards.
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
