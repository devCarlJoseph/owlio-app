import { useEffect, useMemo, useState } from "react"
import { Info, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateSpaceDialog, type SpaceDraft } from "./create-space-dialog"
import { JoinSpaceDialog, type JoinSpaceDraft } from "./join-space-dialog"
import { SpaceCircleRail, SpaceRailEmptyState } from "./space-circle-rail"
import {
  createStudySpaceId,
  loadStudySpaces,
  saveStudySpaces,
  studySpacesGuidance,
  studySpacesOpenHint,
  studySpacesStorageNotice,
  type StudySpaceRecord,
} from "./study-spaces-records"

export function StudySpacesView() {
  const [spaces, setSpaces] = useState<StudySpaceRecord[]>(() => loadStudySpaces())
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  useEffect(() => {
    saveStudySpaces(spaces)
  }, [spaces])

  const createdSpaces = useMemo(
    () => spaces.filter((space) => space.role === "owner"),
    [spaces]
  )

  const joinedSpaces = useMemo(
    () => spaces.filter((space) => space.role === "member"),
    [spaces]
  )

  function handleCreate(draft: SpaceDraft) {
    setSpaces((current) => [
      ...current,
      {
        id: createStudySpaceId(),
        name: draft.name,
        about: draft.about,
        role: "owner",
        createdAt: new Date().toISOString(),
      },
    ])
    setCreateOpen(false)
  }

  function handleJoin(draft: JoinSpaceDraft) {
    setSpaces((current) => [
      ...current,
      {
        id: createStudySpaceId(),
        name: draft.name,
        about: "",
        role: "member",
        createdAt: new Date().toISOString(),
        inviteCode: draft.inviteCode.length > 0 ? draft.inviteCode : undefined,
      },
    ])
    setJoinOpen(false)
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

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                <h3 className="text-base font-semibold text-slate-900">Spaces you create</h3>
              </CardTitle>
              <CardDescription className="mt-1 text-slate-500">
                Peer spaces you lead. Scroll sideways when you have many.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
              {createdSpaces.length} spaces
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="gap-4">
          <SpaceCircleRail
            label="Spaces you create"
            spaces={createdSpaces}
            action={{ label: "Create space", onAction: () => setCreateOpen(true) }}
          />

          <p className="text-xs leading-5 text-slate-500">{studySpacesOpenHint}</p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                <h3 className="text-base font-semibold text-slate-900">Spaces you join</h3>
              </CardTitle>
              <CardDescription className="mt-1 text-slate-500">
                Peer spaces shared with you by other students.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
              {joinedSpaces.length} spaces
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="gap-4">
          <SpaceCircleRail
            label="Spaces you join"
            spaces={joinedSpaces}
            action={{ label: "Join space", onAction: () => setJoinOpen(true) }}
          />

          {joinedSpaces.length === 0 ? (
            <SpaceRailEmptyState message="You have not joined a peer space yet. Use the join space button to add one." />
          ) : null}
        </CardContent>
      </Card>

      <CreateSpaceDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      <JoinSpaceDialog open={joinOpen} onOpenChange={setJoinOpen} onSubmit={handleJoin} />
    </div>
  )
}