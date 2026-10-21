import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Info, Plus, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateSpaceDialog, type SpaceDraft } from "./create-space-dialog"
import { JoinSpaceDialog, type JoinSpaceDraft } from "./join-space-dialog"
import { SpaceGrid, SpaceGridEmptyState } from "./space-card-grid"
import {
  createStudySpaceId,
  loadStudySpaces,
  saveStudySpaces,
  sortSpaces,
  studySpacesGuidance,
  studySpacesOpenHint,
  studySpacesStorageNotice,
  type SpaceSortKey,
  type StudySpaceRecord,
} from "./study-spaces-records"

const SORT_LABELS: Record<SpaceSortKey, string> = {
  recent: "Recently opened",
  newest: "Newest",
  name: "Name A–Z",
}

export function StudySpacesView() {
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState<StudySpaceRecord[]>(() => loadStudySpaces())
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [createdSort, setCreatedSort] = useState<SpaceSortKey>("recent")
  const [joinedSort, setJoinedSort] = useState<SpaceSortKey>("recent")

  useEffect(() => {
    saveStudySpaces(spaces)
  }, [spaces])

  const createdSpaces = useMemo(
    () => sortSpaces(spaces.filter((space) => space.role === "owner"), createdSort),
    [spaces, createdSort]
  )

  const joinedSpaces = useMemo(
    () => sortSpaces(spaces.filter((space) => space.role === "member"), joinedSort),
    [spaces, joinedSort]
  )

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

  function handleJoin(draft: JoinSpaceDraft) {
    setSpaces((current) => [
      ...current,
      {
        id: createStudySpaceId(),
        name: draft.name,
        about: "",
        role: "member",
        kind: "collaborative",
        capacity: 4,
        createdAt: new Date().toISOString(),
        inviteCode: draft.inviteCode.length > 0 ? draft.inviteCode : undefined,
      },
    ])
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

      <SpaceSection
        title="Spaces you've created"
        spaces={createdSpaces}
        sort={createdSort}
        onSortChange={setCreatedSort}
        actionLabel="Create space"
        onAction={() => setCreateOpen(true)}
        onRemove={handleRemove}
        emptyMessage="You have not created a peer space yet. Use the create space button to start one."
      />

      <SpaceSection
        title="Spaces you've joined"
        spaces={joinedSpaces}
        sort={joinedSort}
        onSortChange={setJoinedSort}
        actionLabel="Join space"
        onAction={() => setJoinOpen(true)}
        onRemove={handleRemove}
        emptyMessage="You have not joined a peer space yet. Use the join space button to add one."
      />

      <p className="text-xs leading-5 text-slate-500">{studySpacesOpenHint}</p>

      <CreateSpaceDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      <JoinSpaceDialog open={joinOpen} onOpenChange={setJoinOpen} onSubmit={handleJoin} />
    </div>
  )
}

type SpaceSectionProps = {
  title: string
  spaces: StudySpaceRecord[]
  sort: SpaceSortKey
  onSortChange: (sort: SpaceSortKey) => void
  actionLabel: string
  onAction: () => void
  onRemove: (space: StudySpaceRecord) => void
  emptyMessage: string
}

function SpaceSection({
  title,
  spaces,
  sort,
  onSortChange,
  actionLabel,
  onAction,
  onRemove,
  emptyMessage,
}: SpaceSectionProps) {
  const sortId = `sort-${title.replaceAll(/\W+/g, "-").toLowerCase()}`

  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900">
                {title} ({spaces.length})
              </h3>
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Peer spaces in this browser. Room previews reflect each space's layout.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={sortId} className="text-xs font-medium text-slate-500">
              Sort
            </label>
            <Select
              value={sort}
              onValueChange={(value) => onSortChange(value as SpaceSortKey)}
            >
              <SelectTrigger id={sortId} size="sm" aria-label={`Sort ${title}`}>
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
            <Button type="button" size="sm" onClick={onAction}>
              <Plus aria-hidden="true" />
              {actionLabel}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {spaces.length > 0 ? (
          <SpaceGrid label={title} spaces={spaces} onRemove={onRemove} />
        ) : (
          <SpaceGridEmptyState message={emptyMessage} />
        )}
      </CardContent>
    </Card>
  )
}
