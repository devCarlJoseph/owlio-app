import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Info, Layers, Plus, Search, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

const SpaceMap3D = lazy(() => import("./space-map-3d"))

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

  useEffect(() => {
    saveStudySpaces(spaces)
  }, [spaces])

  useEffect(() => {
    saveJoinedDiscoveryIds(joinedDiscoveryIds)
  }, [joinedDiscoveryIds])

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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Peer learning
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Study spaces
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Create or join a peer learning space for group projects, shared study, and collaboration without an
          instructor.
        </p>
      </section>

      <section
        aria-label="Study space guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <Users className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">{studySpacesGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {studySpacesStorageNotice}
        </p>
      </section>

      <section aria-labelledby="study-hall-map-title" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3
            id="study-hall-map-title"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            <Layers className="size-4" aria-hidden="true" />
            Study hall map
          </h3>
          <p className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
            {createdSpaces.length} yours · {joinedSpaces.length} joined · {lockedSpaces.length} locked
          </p>
          <div className="relative min-w-52 flex-1 sm:max-w-sm">
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
              className="h-9 rounded-full border-transparent bg-white pl-9 shadow-sm"
            />
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label htmlFor="sort-spaces" className="text-xs font-medium text-slate-500">
              Sort
            </label>
            <Select value={sort} onValueChange={(value) => setSort(value as SpaceSortKey)}>
              <SelectTrigger id="sort-spaces" size="sm" aria-label="Sort spaces" className="bg-white">
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
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              Create space
            </Button>
            <Button type="button" size="sm" variant="outline" className="bg-white" onClick={() => openJoin(null)}>
              <Plus aria-hidden="true" />
              Join space
            </Button>
          </div>
        </div>

        {webgl ? (
          <Suspense
            fallback={
              <div className="flex h-[62vh] min-h-[440px] items-center justify-center rounded-3xl bg-[#ece3cf] text-sm text-slate-600 sm:h-[68vh] lg:h-[72vh]">
                Loading study hall map…
              </div>
            }
          >
            <SpaceMap3D
              created={createdSpaces}
              joined={joinedSpaces}
              locked={lockedSpaces}
              onOpen={(space) => navigate(`/students/study-spaces/${space.id}`)}
              onUnlock={openJoin}
            />
          </Suspense>
        ) : (
          <SpaceMap created={createdSpaces} joined={joinedSpaces} locked={lockedSpaces} onUnlock={openJoin} />
        )}

        <p className="text-xs leading-5 text-slate-500">
          People shown in your desk row are sample illustrations, not real students, members, or live presence.
          Every space is also listed in the cards below.
        </p>
        {lockedSpaces.length > 0 && (
          <p className="text-xs leading-5 text-slate-500">{studySpacesDiscoveryCaption}</p>
        )}
      </section>

      <section aria-labelledby="study-spaces-title" className="space-y-6">
        <h3 id="study-spaces-title" className="flex items-baseline gap-2 text-2xl font-bold text-slate-900">
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
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Sample spaces that need a space code. Codes are not checked by a service.
              </p>
            </div>
            <LockedSpaceGrid label="Preview spaces (locked)" spaces={lockedSpaces} onUnlock={openJoin} />
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-500">{studySpacesOpenHint}</p>

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
