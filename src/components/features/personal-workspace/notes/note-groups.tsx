import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NoteTagGroup } from "./note-records"

type NoteGroupsProps = {
  groups: NoteTagGroup[]
  activeTag: string | null
  onSelectTag: (tag: string | null) => void
  onEdit: (noteId: string) => void
}

export function NoteGroups({ groups, activeTag, onSelectTag, onEdit }: NoteGroupsProps) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900">Groups</h3>
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Every hashtag you add to a note becomes a group. Pick one to filter your notes.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
            {groups.length} groups
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="gap-3">
        {groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-sm leading-6 text-slate-600">
            No hashtags yet. Write a hashtag such as <span className="font-semibold text-blue-700">#physics</span>{" "}
            inside a note and that note will appear in its group.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {groups.map(({ tag, notes }) => {
              const isActive = activeTag === tag

              return (
                <li key={tag}>
                  <div
                    className={`h-full rounded-xl border p-4 ${
                      isActive ? "border-blue-700 bg-blue-50/70" : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectTag(isActive ? null : tag)}
                        aria-pressed={isActive}
                        className="rounded text-sm font-semibold text-blue-700 outline-none underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {tag}
                      </button>
                      <span className="text-xs text-slate-500">
                        {notes.length} {notes.length === 1 ? "note" : "notes"}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {notes.map((note) => (
                        <li key={note.id}>
                          <button
                            type="button"
                            onClick={() => onEdit(note.id)}
                            className="w-full truncate rounded text-left text-sm text-slate-600 outline-none hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            {note.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}