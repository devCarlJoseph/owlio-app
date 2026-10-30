import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import {
  ArrowLeft,
  CornerDownRight,
  Edit2,
  FileText,
  LockKeyhole,
  Maximize2,
  MessageCircleMore,
  MessageSquare,
  Minimize2,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  X,
} from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

type Person = { name: string; initials: string; color: string }

type NoteReply = { id: number; author: Person; time: string; body: string }

type NoteComment = {
  id: number
  author: Person
  time: string
  anchor?: string
  quote: string
  body: string
  likes: number
  dislikes: number
  reaction: "like" | "dislike" | null
  replies: NoteReply[]
}

type KeyPoint = { label: string; text: string }

type SessionNote = {
  id: number
  title: string
  learner: string
  subject: string
  date: string
  lastSync: string
  summary: string
  highlight: string
  keyPoints: KeyPoint[]
  issues: string[]
  actionItems: string[]
  attachments: number
  isPrivate: boolean
  collaborators: Person[]
  comments: NoteComment[]
}

type NoteForm = {
  title: string
  learner: string
  subject: string
  date: string
  summary: string
  keyPoints: string
  issues: string
  actionItems: string
  isPrivate: boolean
}

const you: Person = { name: "You", initials: "YO", color: "bg-blue-600" }
const leadTutor: Person = { name: "Aisha Karim", initials: "AK", color: "bg-violet-500" }
const coTutor: Person = { name: "Daniel Reyes", initials: "DR", color: "bg-amber-500" }

const subjectColors: Record<string, string> = {
  Calculus: "bg-sky-500",
  Physics: "bg-emerald-500",
  Chemistry: "bg-rose-500",
}

const initialNotes: SessionNote[] = [
  {
    id: 1,
    title: "Calculus Review: Chain Rule",
    learner: "Sarah Johnson",
    subject: "Calculus",
    date: "Oct 27, 2026",
    lastSync: "Just now",
    summary:
      "During today's session, Sarah worked through chain rule problems and showed strong understanding of composite functions. She still hesitates with implicit differentiation and needs more guided practice before the next session. The pace should stay steady to match her learning goals.",
    highlight: "match her learning goals.",
    keyPoints: [
      { label: "Chain Rule", text: "Correctly identified inner and outer functions in 8 of 10 problems." },
      { label: "Implicit Differentiation", text: "Needs step-by-step prompts to isolate dy/dx." },
      { label: "Notation", text: "Mixes Leibniz and prime notation within the same answer." },
      { label: "Confidence", text: "Asked more questions than last week and explained her reasoning aloud." },
    ],
    issues: [
      "Skips writing the derivative of the inner function.",
      "Rushes the final simplification step.",
      "Unsure when to apply the product rule together with the chain rule.",
    ],
    actionItems: [
      "Assign 10 mixed chain-rule and product-rule problems.",
      "Open the next session with a 5-minute implicit differentiation warm-up.",
      "Share the notation cheat sheet before Thursday.",
      "Review the simplification checklist together.",
    ],
    attachments: 2,
    isPrivate: true,
    collaborators: [you, leadTutor, coTutor],
    comments: [
      {
        id: 1,
        author: leadTutor,
        time: "2 days ago",
        anchor: "key-1",
        quote: "Implicit Differentiation: Needs step-by-step prompts to isolate dy/dx.",
        body: "I've prepared a short scaffolded worksheet for implicit differentiation. I'll attach it before Thursday's session.",
        likes: 2,
        dislikes: 0,
        reaction: null,
        replies: [],
      },
      {
        id: 2,
        author: coTutor,
        time: "2 days ago",
        anchor: "issue-0",
        quote: "Skips writing the derivative of the inner function.",
        body: "Saw the same pattern during Tuesday's drop-in. Color-coding the inner function helped her slow down.",
        likes: 1,
        dislikes: 0,
        reaction: null,
        replies: [],
      },
      {
        id: 3,
        author: leadTutor,
        time: "1 day ago",
        anchor: "action-0",
        quote: "Assign 10 mixed chain-rule and product-rule problems.",
        body: "Let's keep it to 8 problems so she has time for the warm-up review as well.",
        likes: 0,
        dislikes: 0,
        reaction: null,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    title: "Physics: Newton's Laws Progress",
    learner: "Michael Chen",
    subject: "Physics",
    date: "Oct 26, 2026",
    lastSync: "2 hours ago",
    summary:
      "Michael made excellent progress on Newton's laws and can now draw free-body diagrams without prompting. Momentum conservation is the next focus area, and he would benefit from more real-world examples.",
    highlight: "more real-world examples.",
    keyPoints: [
      { label: "Free-body diagrams", text: "Draws all forces correctly, including normal force on inclines." },
      { label: "Second law", text: "Sets up F = ma equations confidently." },
      { label: "Momentum", text: "Not yet comfortable with collision problems." },
    ],
    issues: ["Confuses mass and weight in word problems.", "Forgets to define a positive direction."],
    actionItems: [
      "Review momentum conservation problems for homework.",
      "Bring two collision videos to the next session.",
    ],
    attachments: 1,
    isPrivate: true,
    collaborators: [you, coTutor],
    comments: [
      {
        id: 1,
        author: coTutor,
        time: "5 hours ago",
        anchor: "key-2",
        quote: "Momentum: Not yet comfortable with collision problems.",
        body: "I have a cart-collision simulation we can use for this. I'll share the link.",
        likes: 1,
        dislikes: 0,
        reaction: null,
        replies: [],
      },
    ],
  },
  {
    id: 3,
    title: "Chemistry: Titration Lab Debrief",
    learner: "Emma Wilson",
    subject: "Chemistry",
    date: "Oct 25, 2026",
    lastSync: "Yesterday",
    summary:
      "Emma's lab report on acid-base titration was well structured and clearly written. Stoichiometry calculations should be reinforced before the unit test.",
    highlight: "",
    keyPoints: [
      { label: "Lab report", text: "Clear method section with a properly labeled titration curve." },
      { label: "Stoichiometry", text: "Mole ratio errors in two of five calculations." },
    ],
    issues: ["Rounds intermediate values too early."],
    actionItems: ["Practice set on mole ratios.", "Walk through one full titration calculation together."],
    attachments: 3,
    isPrivate: true,
    collaborators: [you],
    comments: [],
  },
]

const emptyForm: NoteForm = {
  title: "",
  learner: "",
  subject: "",
  date: "",
  summary: "",
  keyPoints: "",
  issues: "",
  actionItems: "",
  isPrivate: true,
}

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"

function nextId(items: { id: number }[]) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseKeyPoints(value: string): KeyPoint[] {
  return toLines(value).map((line) => {
    const [label, ...rest] = line.split(":")
    return rest.length ? { label: label.trim(), text: rest.join(":").trim() } : { label: "", text: line }
  })
}

function formatKeyPoint({ label, text }: KeyPoint) {
  return label ? `${label}: ${text}` : text
}

function Avatar({ person, size = "sm" }: { person: Person; size?: "xs" | "sm" }) {
  return (
    <span
      title={person.name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white ${person.color} ${
        size === "xs" ? "size-6 text-[10px]" : "size-7 text-[11px]"
      }`}
    >
      {person.initials}
    </span>
  )
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  const index = highlight ? text.indexOf(highlight) : -1
  if (index < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-sky-100 px-0.5 text-slate-900">{highlight}</mark>
      {text.slice(index + highlight.length)}
    </>
  )
}

function IconButton({ label, onClick, children, danger }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg p-1.5 text-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  )
}

export default function TutorSessionNotesView() {
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>(initialNotes)
  const [selectedId, setSelectedId] = useState(initialNotes[0].id)
  const [view, setView] = useState<"document" | "list">("document")
  const [noteQuery, setNoteQuery] = useState("")
  const [showComments, setShowComments] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const [commentQuery, setCommentQuery] = useState("")
  const [commentFilter, setCommentFilter] = useState<"all" | "mine">("all")
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [newComment, setNewComment] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null)
  const [formData, setFormData] = useState<NoteForm>(emptyForm)

  const selectedNote = sessionNotes.find((note) => note.id === selectedId) ?? sessionNotes[0]

  const filteredNotes = useMemo(() => {
    const query = noteQuery.trim().toLowerCase()
    if (!query) return sessionNotes
    return sessionNotes.filter((note) =>
      [note.title, note.learner, note.subject, note.summary].some((value) => value.toLowerCase().includes(query))
    )
  }, [noteQuery, sessionNotes])

  const visibleComments = useMemo(() => {
    if (!selectedNote) return []
    const query = commentQuery.trim().toLowerCase()
    return selectedNote.comments.filter((comment) => {
      if (commentFilter === "mine" && comment.author.name !== you.name) return false
      if (!query) return true
      return [comment.author.name, comment.quote, comment.body, ...comment.replies.map((reply) => reply.body)].some((value) =>
        value.toLowerCase().includes(query)
      )
    })
  }, [commentFilter, commentQuery, selectedNote])

  const updateNote = (id: number, update: (note: SessionNote) => SessionNote) => {
    setSessionNotes((notes) => notes.map((note) => (note.id === id ? update(note) : note)))
  }

  const updateComment = (commentId: number, update: (comment: NoteComment) => NoteComment) => {
    if (!selectedNote) return
    updateNote(selectedNote.id, (note) => ({
      ...note,
      lastSync: "Just now",
      comments: note.comments.map((comment) => (comment.id === commentId ? update(comment) : comment)),
    }))
  }

  const openNote = (id: number) => {
    setSelectedId(id)
    setView("document")
    setActiveCommentId(null)
    setReplyingTo(null)
  }

  const handleCreate = () => {
    setEditingNote(null)
    setFormData(emptyForm)
    setIsModalOpen(true)
  }

  const handleEdit = (note: SessionNote) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      learner: note.learner,
      subject: note.subject,
      date: note.date,
      summary: note.summary,
      keyPoints: note.keyPoints.map(formatKeyPoint).join("\n"),
      issues: note.issues.join("\n"),
      actionItems: note.actionItems.join("\n"),
      isPrivate: note.isPrivate,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this session note? (Local preview only - not persisted)")) {
      const remaining = sessionNotes.filter((note) => note.id !== id)
      setSessionNotes(remaining)
      if (id === selectedId) {
        if (remaining.length) setSelectedId(remaining[0].id)
        else setView("list")
      }
    }
  }

  const handleSave = () => {
    const fields = {
      title: formData.title.trim() || "Untitled session note",
      learner: formData.learner.trim(),
      subject: formData.subject.trim(),
      date: formData.date.trim(),
      summary: formData.summary.trim(),
      keyPoints: parseKeyPoints(formData.keyPoints),
      issues: toLines(formData.issues),
      actionItems: toLines(formData.actionItems),
      isPrivate: formData.isPrivate,
      lastSync: "Just now",
    }
    if (editingNote) {
      updateNote(editingNote.id, (note) => ({ ...note, ...fields }))
    } else {
      const id = nextId(sessionNotes)
      setSessionNotes([
        ...sessionNotes,
        { id, ...fields, highlight: "", attachments: 0, collaborators: [you], comments: [] },
      ])
      openNote(id)
    }
    setIsModalOpen(false)
  }

  const handleShare = () => {
    void navigator.clipboard?.writeText(window.location.href).catch(() => undefined)
    setShareCopied(true)
    window.setTimeout(() => setShareCopied(false), 2000)
  }

  const handleReaction = (commentId: number, reaction: "like" | "dislike") => {
    updateComment(commentId, (comment) => {
      const likes = comment.likes - (comment.reaction === "like" ? 1 : 0)
      const dislikes = comment.dislikes - (comment.reaction === "dislike" ? 1 : 0)
      const next = comment.reaction === reaction ? null : reaction
      return {
        ...comment,
        reaction: next,
        likes: likes + (next === "like" ? 1 : 0),
        dislikes: dislikes + (next === "dislike" ? 1 : 0),
      }
    })
  }

  const handleReply = (event: FormEvent, commentId: number) => {
    event.preventDefault()
    const body = replyText.trim()
    if (!body) return
    updateComment(commentId, (comment) => ({
      ...comment,
      replies: [...comment.replies, { id: nextId(comment.replies), author: you, time: "Just now", body }],
    }))
    setReplyText("")
    setReplyingTo(null)
  }

  const handleAddComment = (event: FormEvent) => {
    event.preventDefault()
    const body = newComment.trim()
    if (!body || !selectedNote) return
    updateNote(selectedNote.id, (note) => ({
      ...note,
      lastSync: "Just now",
      comments: [
        ...note.comments,
        {
          id: nextId(note.comments),
          author: you,
          time: "Just now",
          quote: note.title,
          body,
          likes: 0,
          dislikes: 0,
          reaction: null,
          replies: [],
        },
      ],
    }))
    setNewComment("")
  }

  const focusComment = (commentId: number) => {
    setShowComments(true)
    setExpanded(false)
    setCommentQuery("")
    setCommentFilter("all")
    setActiveCommentId(commentId)
  }

  const renderMarker = (anchor: string) => {
    const comment = selectedNote?.comments.find((item) => item.anchor === anchor)
    if (!comment) return <span aria-hidden="true" className="size-6 shrink-0" />
    return (
      <button
        type="button"
        onClick={() => focusComment(comment.id)}
        aria-label={`View comment from ${comment.author.name}`}
        className="shrink-0 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Avatar person={comment.author} size="xs" />
      </button>
    )
  }

  const commentsVisible = showComments && !expanded

  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Session Notes"
      description="Keep tutor-only observations separate from feedback intentionally published to a learner."
    >
      <section
        aria-label="Session note workspace"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {view === "list" || !selectedNote ? (
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Your notes</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">Recent session notes</h3>
                <p className="mt-1 text-sm text-slate-600">{sessionNotes.length} notes in preview mode</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative">
                  <span className="sr-only">Search notes</span>
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={noteQuery}
                    onChange={(event) => setNoteQuery(event.target.value)}
                    placeholder="Search notes"
                    className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Add Note
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => openNote(note.id)}
                    className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={`Open ${note.title}`}
                  />
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <FileText aria-hidden="true" className="size-4 text-slate-600" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{note.title}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <User aria-hidden="true" className="size-3" />
                            {note.learner} • {note.date}
                          </p>
                        </div>
                        {note.isPrivate && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">Private</span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{note.summary}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare aria-hidden="true" className="size-3.5" />
                            {note.comments.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Paperclip aria-hidden="true" className="size-3.5" />
                            {note.attachments}
                          </span>
                        </span>
                        <div className="relative flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <IconButton label="Edit" onClick={() => handleEdit(note)}>
                            <Edit2 aria-hidden="true" className="size-3.5" />
                          </IconButton>
                          <IconButton label="Delete" danger onClick={() => handleDelete(note.id)}>
                            <Trash2 aria-hidden="true" className="size-3.5" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {filteredNotes.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 md:col-span-2">
                  {sessionNotes.length ? "No notes match your search." : "No session notes yet. Add one to get started."}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={`grid min-h-[640px] ${commentsVisible ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""}`}>
            <article aria-label={selectedNote.title} className="flex min-w-0 flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="inline-flex items-center gap-2 rounded-md text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Notes
                  </button>
                  <span aria-hidden="true" className="text-slate-300">/</span>
                  <span className="truncate font-medium text-slate-900">{selectedNote.title}</span>
                </nav>
                <div className="flex shrink-0 items-center gap-1">
                  {shareCopied && <span className="mr-1 text-xs font-medium text-emerald-700">Link copied</span>}
                  <IconButton label="Edit note" onClick={() => handleEdit(selectedNote)}>
                    <Edit2 aria-hidden="true" className="size-4" />
                  </IconButton>
                  <IconButton label="Delete note" danger onClick={() => handleDelete(selectedNote.id)}>
                    <Trash2 aria-hidden="true" className="size-4" />
                  </IconButton>
                  <IconButton label="Share note" onClick={handleShare}>
                    <Share2 aria-hidden="true" className="size-4" />
                  </IconButton>
                  <IconButton label={expanded ? "Exit focus mode" : "Focus mode"} onClick={() => setExpanded(!expanded)}>
                    {expanded ? <Minimize2 aria-hidden="true" className="size-4" /> : <Maximize2 aria-hidden="true" className="size-4" />}
                  </IconButton>
                  {!commentsVisible && (
                    <IconButton
                      label="Show comments"
                      onClick={() => {
                        setExpanded(false)
                        setShowComments(true)
                      }}
                    >
                      <MessageSquare aria-hidden="true" className="size-4" />
                    </IconButton>
                  )}
                </div>
              </div>

              <div className={`mx-auto w-full flex-1 px-6 py-8 sm:px-10 ${expanded ? "max-w-4xl" : "max-w-3xl"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <RefreshCw aria-hidden="true" className="size-3.5" />
                    Last sync: <span className="font-medium text-slate-700">{selectedNote.lastSync}</span>
                  </p>
                  <div className="flex -space-x-2">
                    {selectedNote.collaborators.map((person) => (
                      <Avatar key={person.name} person={person} size="xs" />
                    ))}
                  </div>
                </div>

                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{selectedNote.title}</h3>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {selectedNote.subject && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                      <span className={`size-2.5 rounded-sm ${subjectColors[selectedNote.subject] ?? "bg-slate-400"}`} />
                      {selectedNote.subject}
                    </span>
                  )}
                  {selectedNote.learner && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                      <User aria-hidden="true" className="size-3" />
                      {selectedNote.learner}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-slate-600">
                    <Paperclip aria-hidden="true" className="size-3" />
                    {selectedNote.attachments} {selectedNote.attachments === 1 ? "attachment" : "attachments"}
                  </span>
                  {selectedNote.isPrivate && (
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-slate-600">
                      <LockKeyhole aria-hidden="true" className="size-3" />
                      Private
                    </span>
                  )}
                  {selectedNote.date && <span className="px-2 py-1 text-slate-500">{selectedNote.date}</span>}
                </div>

                {selectedNote.summary && (
                  <p className="mt-6 text-sm leading-7 text-slate-700">
                    <HighlightedText text={selectedNote.summary} highlight={selectedNote.highlight} />
                  </p>
                )}

                {selectedNote.keyPoints.length > 0 && (
                  <div className="mt-7">
                    <h4 className="text-base font-semibold text-slate-950">Key Points:</h4>
                    <ul className="mt-3 space-y-1.5">
                      {selectedNote.keyPoints.map((point, index) => (
                        <li key={`${point.label}-${index}`} className="flex items-start justify-between gap-4 text-sm leading-6 text-slate-700">
                          <span className="flex gap-2.5">
                            <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-slate-700" />
                            <span>
                              {point.label && <strong className="font-semibold text-slate-900">{point.label}:</strong>} {point.text}
                            </span>
                          </span>
                          {renderMarker(`key-${index}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedNote.issues.length > 0 && (
                  <div className="mt-7">
                    <h4 className="text-base font-semibold text-slate-950">Issues Identified:</h4>
                    <ul className="mt-3 space-y-1.5">
                      {selectedNote.issues.map((issue, index) => (
                        <li key={`${issue}-${index}`} className="flex items-start justify-between gap-4 text-sm leading-6 text-slate-700">
                          <span className="flex gap-2.5">
                            <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-slate-700" />
                            {issue}
                          </span>
                          {renderMarker(`issue-${index}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedNote.actionItems.length > 0 && (
                  <div className="mt-7">
                    <h4 className="text-base font-semibold text-slate-950">Action Items:</h4>
                    <ul className="mt-3 space-y-1.5">
                      {selectedNote.actionItems.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex items-start justify-between gap-4 text-sm leading-6 text-slate-700">
                          <span className="flex gap-2.5">
                            <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-slate-700" />
                            {item}
                          </span>
                          {renderMarker(`action-${index}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>

            {commentsVisible && (
              <aside aria-label="Comments" className="flex flex-col border-t border-slate-100 bg-white lg:border-l lg:border-t-0">
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <MessageSquare aria-hidden="true" className="size-4 text-slate-500" />
                    Comments
                    <span className="rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-600">{selectedNote.comments.length}</span>
                  </p>
                  <IconButton label="Close comments" onClick={() => setShowComments(false)}>
                    <X aria-hidden="true" className="size-4" />
                  </IconButton>
                </div>

                <div className="space-y-3 px-4">
                  <label className="relative block">
                    <span className="sr-only">Search comments</span>
                    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={commentQuery}
                      onChange={(event) => setCommentQuery(event.target.value)}
                      placeholder="Search comments"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>
                  <label className="inline-flex items-center">
                    <span className="sr-only">Filter comments</span>
                    <select
                      value={commentFilter}
                      onChange={(event) => setCommentFilter(event.target.value as "all" | "mine")}
                      className="cursor-pointer rounded-md bg-transparent py-1 pr-1 text-sm font-medium text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <option value="all">All comments</option>
                      <option value="mine">My comments</option>
                    </select>
                  </label>
                </div>

                <ol className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
                  {visibleComments.map((comment) => (
                    <li
                      key={comment.id}
                      className={`rounded-lg transition-colors ${activeCommentId === comment.id ? "bg-blue-50/70 ring-1 ring-blue-100" : ""}`}
                    >
                      <div className="p-1">
                        <div className="flex items-center gap-2">
                          <Avatar person={comment.author} />
                          <p className="text-sm">
                            <span className="font-semibold text-slate-900">{comment.author.name}</span>
                            <span className="text-slate-400"> • {comment.time}</span>
                          </p>
                        </div>
                        <div className="ml-3.5 mt-2 border-l border-slate-200 pl-5">
                          <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <CornerDownRight aria-hidden="true" className="size-3.5 shrink-0" />
                            <span className="truncate">{comment.quote}</span>
                          </p>
                          <p className="mt-2 text-sm leading-5 text-slate-700">{comment.body}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                            <button
                              type="button"
                              onClick={() => handleReaction(comment.id, "like")}
                              aria-pressed={comment.reaction === "like"}
                              aria-label="Like comment"
                              className={`inline-flex items-center gap-1 rounded hover:text-slate-900 ${comment.reaction === "like" ? "text-blue-600" : ""}`}
                            >
                              <ThumbsUp aria-hidden="true" className="size-3.5" />
                              {comment.likes > 0 && comment.likes}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReaction(comment.id, "dislike")}
                              aria-pressed={comment.reaction === "dislike"}
                              aria-label="Dislike comment"
                              className={`inline-flex items-center gap-1 rounded hover:text-slate-900 ${comment.reaction === "dislike" ? "text-rose-600" : ""}`}
                            >
                              <ThumbsDown aria-hidden="true" className="size-3.5" />
                              {comment.dislikes > 0 && comment.dislikes}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(replyingTo === comment.id ? null : comment.id)
                                setReplyText("")
                              }}
                              className="ml-2 font-medium text-slate-700 hover:text-slate-950"
                            >
                              Reply
                            </button>
                          </div>

                          {comment.replies.length > 0 && (
                            <ul className="mt-3 space-y-3">
                              {comment.replies.map((reply) => (
                                <li key={reply.id} className="flex gap-2">
                                  <Avatar person={reply.author} size="xs" />
                                  <div>
                                    <p className="text-xs">
                                      <span className="font-semibold text-slate-900">{reply.author.name}</span>
                                      <span className="text-slate-400"> • {reply.time}</span>
                                    </p>
                                    <p className="mt-0.5 text-sm leading-5 text-slate-700">{reply.body}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}

                          {replyingTo === comment.id && (
                            <form onSubmit={(event) => handleReply(event, comment.id)} className="mt-3 flex items-center gap-2">
                              <label className="sr-only" htmlFor={`reply-${comment.id}`}>
                                Reply to {comment.author.name}
                              </label>
                              <input
                                id={`reply-${comment.id}`}
                                autoFocus
                                value={replyText}
                                onChange={(event) => setReplyText(event.target.value)}
                                placeholder="Write a reply..."
                                className="h-8 flex-1 rounded-lg border border-slate-200 px-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                              <button
                                type="submit"
                                aria-label="Send reply"
                                className="rounded-lg bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                disabled={!replyText.trim()}
                              >
                                <Send aria-hidden="true" className="size-3.5" />
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                  {visibleComments.length === 0 && (
                    <li className="py-8 text-center text-sm text-slate-500">
                      {selectedNote.comments.length ? "No comments match your filters." : "No comments yet."}
                    </li>
                  )}
                </ol>

                <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t border-slate-100 p-3">
                  <Avatar person={you} size="xs" />
                  <label className="sr-only" htmlFor="new-note-comment">
                    Add a comment
                  </label>
                  <input
                    id="new-note-comment"
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Add a comment for co-tutors..."
                    className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    aria-label="Post comment"
                    disabled={!newComment.trim()}
                    className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send aria-hidden="true" className="size-4" />
                  </button>
                </form>
              </aside>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Private tutor notes" description="Private notes require explicit tutor-only access and retention rules.">
          <LockKeyhole aria-hidden="true" className="size-5 text-slate-700" />
          <p className="text-sm text-slate-600">These notes must not appear in learner feeds, group discussions, notifications, or progress views.</p>
        </TutorSection>
        <TutorSection title="Learner-visible feedback" description="Publishing is a separate action with a confirmed audience.">
          <MessageCircleMore aria-hidden="true" className="size-5 text-blue-700" />
          <p className="text-sm text-slate-600">A private note never becomes feedback automatically.</p>
        </TutorSection>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{editingNote ? "Edit Session Note" : "Add Session Note"}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close" className="rounded-lg p-2 transition-colors hover:bg-slate-100">
                <X aria-hidden="true" className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="note-title" className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  id="note-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputClassName}
                  placeholder="e.g., Calculus Review: Chain Rule"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="note-learner" className="mb-1 block text-sm font-medium text-slate-700">Learner</label>
                  <input
                    id="note-learner"
                    type="text"
                    value={formData.learner}
                    onChange={(e) => setFormData({ ...formData, learner: e.target.value })}
                    className={inputClassName}
                    placeholder="e.g., Sarah Johnson"
                  />
                </div>
                <div>
                  <label htmlFor="note-subject" className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                  <input
                    id="note-subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={inputClassName}
                    placeholder="e.g., Calculus"
                  />
                </div>
                <div>
                  <label htmlFor="note-date" className="mb-1 block text-sm font-medium text-slate-700">Date</label>
                  <input
                    id="note-date"
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={inputClassName}
                    placeholder="e.g., Oct 27, 2026"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="note-summary" className="mb-1 block text-sm font-medium text-slate-700">Summary</label>
                <textarea
                  id="note-summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className={`${inputClassName} min-h-[90px]`}
                  placeholder="Enter your private tutor notes..."
                />
              </div>
              <div>
                <label htmlFor="note-key-points" className="mb-1 block text-sm font-medium text-slate-700">Key points</label>
                <textarea
                  id="note-key-points"
                  value={formData.keyPoints}
                  onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                  className={`${inputClassName} min-h-[80px]`}
                  placeholder={"One per line, e.g.\nChain Rule: Identified inner and outer functions"}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="note-issues" className="mb-1 block text-sm font-medium text-slate-700">Issues identified</label>
                  <textarea
                    id="note-issues"
                    value={formData.issues}
                    onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                    className={`${inputClassName} min-h-[80px]`}
                    placeholder="One issue per line"
                  />
                </div>
                <div>
                  <label htmlFor="note-actions" className="mb-1 block text-sm font-medium text-slate-700">Action items</label>
                  <textarea
                    id="note-actions"
                    value={formData.actionItems}
                    onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                    className={`${inputClassName} min-h-[80px]`}
                    placeholder="One action item per line"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-slate-700">Private (tutor-only)</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                {editingNote ? "Update" : "Create"}
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="Notes and feedback are unavailable"
        description="No session-note or feedback service is connected. Creating, saving, or publishing records is unavailable."
      />
    </TutorPage>
  )
}
