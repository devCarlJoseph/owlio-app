import { useState, type FormEvent } from "react"
import { ArrowLeft, BookOpen, BookText, Check, CircleHelp, ClipboardList, FilePlus2, Headphones, Languages, MessageCircle, Mic2, NotebookPen, PenLine, Sparkles } from "lucide-react"
import { Link } from "react-router"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const skillAreas = [
  { name: "Speaking", description: "Conversation, fluency, and spoken practice.", icon: MessageCircle, color: "bg-violet-100 text-violet-700" },
  { name: "Listening", description: "Listening comprehension and response.", icon: Headphones, color: "bg-sky-100 text-sky-700" },
  { name: "Reading", description: "Reading practice and comprehension.", icon: BookOpen, color: "bg-amber-100 text-amber-700" },
  { name: "Writing", description: "Writing practice and clear expression.", icon: PenLine, color: "bg-emerald-100 text-emerald-700" },
  { name: "Vocabulary", description: "Word meaning and practical usage.", icon: Languages, color: "bg-rose-100 text-rose-700" },
  { name: "Grammar", description: "Structures explored in useful contexts.", icon: BookText, color: "bg-indigo-100 text-indigo-700" },
  { name: "Pronunciation", description: "Sound awareness and spoken clarity.", icon: Mic2, color: "bg-orange-100 text-orange-700" },
]

type PlanDraft = {
  title: string
  objective: string
  skills: string[]
  sequence: string
  notes: string
}

const emptyDraft: PlanDraft = { title: "", objective: "", skills: [], sequence: "", notes: "" }

export function EslLessonPlansView() {
  const [view, setView] = useState<"library" | "create" | "preview">("library")
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  function toggleSkill(skill: string) {
    setDraft((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }))
  }

  function previewDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setView("preview")
  }

  function discardDraft() {
    setDraft(emptyDraft)
    setView("library")
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-violet-100/70 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">ESL workspace · Teaching</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Lesson Plans</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Prepare reusable language-learning plans with clear goals, skill focus, and a sequence of practice.</p>
          </div>
          {view === "library" ? (
            <Button onClick={() => setView("create")} className="w-full sm:w-auto">
              <FilePlus2 aria-hidden="true" /> Create plan
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setView("library")} className="w-full sm:w-auto">
              <ArrowLeft aria-hidden="true" /> Back to library
            </Button>
          )}
        </div>
      </section>

      {view === "library" && (
        <>
          <section className="grid gap-4 md:grid-cols-3" aria-label="Lesson planning guidance">
            <Card className="border-0 bg-gradient-to-br from-violet-50 to-white ring-violet-100">
              <CardHeader className="pb-2">
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><NotebookPen aria-hidden="true" className="size-5" /></div>
                <CardTitle>Start with an objective</CardTitle>
                <CardDescription>Keep the goal teacher-authored and specific to the learning session.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-sky-50 to-white ring-sky-100">
              <CardHeader className="pb-2">
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><ClipboardList aria-hidden="true" className="size-5" /></div>
                <CardTitle>Build a practice sequence</CardTitle>
                <CardDescription>Arrange prompts, supported practice, and a closing review.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-amber-50 to-white ring-amber-100">
              <CardHeader className="pb-2">
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Sparkles aria-hidden="true" className="size-5" /></div>
                <CardTitle>Adapt with care</CardTitle>
                <CardDescription>A reusable plan is preparation; scheduling and learner assignment are separate steps.</CardDescription>
              </CardHeader>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)]">
            <Card className="min-h-80">
              <CardHeader className="flex-row items-start justify-between gap-4 border-b border-slate-100">
                <div>
                  <CardTitle className="text-lg">Plan library</CardTitle>
                  <CardDescription className="mt-1">Your reusable lesson preparation will appear here.</CardDescription>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Not connected</span>
              </CardHeader>
              <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><BookOpen aria-hidden="true" className="size-7" /></div>
                <h2 className="text-base font-semibold text-slate-900">No saved plans to show</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Lesson plans are not connected to a service yet. You can explore skill areas or draft a local preview, but plans cannot be saved or shared.</p>
                <Button onClick={() => setView("create")} variant="outline" className="mt-5">
                  <FilePlus2 aria-hidden="true" /> Draft a plan preview
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Browse by skill</CardTitle>
                <CardDescription>Choose a focus to guide your preparation.</CardDescription>
              </CardHeader>
              <CardContent className="gap-2">
                {skillAreas.map(({ name, description, icon: Icon, color }) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={selectedSkill === name}
                    onClick={() => setSelectedSkill((current) => current === name ? null : name)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selectedSkill === name ? "border-violet-300 bg-violet-50/60" : "border-slate-100"}`}
                  >
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${color}`}><Icon aria-hidden="true" className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900">{name}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
                    </span>
                    {selectedSkill === name && <Check aria-hidden="true" className="size-4 text-violet-700" />}
                  </button>
                ))}
                {selectedSkill && <p className="pt-2 text-xs text-slate-500" role="status">Showing the {selectedSkill.toLowerCase()} focus. Saved plans are unavailable until the plan library is connected.</p>}
              </CardContent>
            </Card>
          </section>

          <Alert>
            <CircleHelp aria-hidden="true" />
            <AlertTitle>Plans and sessions are separate</AlertTitle>
            <AlertDescription>A lesson plan is reusable preparation. To work with a dated session, use <Link to="/esl/schedule" className="font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Lesson Schedule</Link>.</AlertDescription>
          </Alert>
        </>
      )}

      {view === "create" && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Draft a lesson plan</CardTitle>
              <CardDescription>Shape a reusable outline. This preview stays in the current browser session and is not saved or shared.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={previewDraft}>
                <div className="space-y-2">
                  <label htmlFor="plan-title" className="text-sm font-medium text-slate-900">Plan title</label>
                  <Input id="plan-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Everyday conversations" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="plan-objective" className="text-sm font-medium text-slate-900">Learning objective</label>
                  <Textarea id="plan-objective" value={draft.objective} onChange={(event) => setDraft({ ...draft, objective: event.target.value })} placeholder="What should learners practice by the end?" required />
                  <p className="text-xs text-slate-500">Write an objective for your plan; no proficiency level is inferred.</p>
                </div>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-slate-900">Skill focus <span className="font-normal text-slate-500">(optional)</span></legend>
                  <div className="flex flex-wrap gap-2">
                    {skillAreas.map(({ name }) => (
                      <button key={name} type="button" aria-pressed={draft.skills.includes(name)} onClick={() => toggleSkill(name)} className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${draft.skills.includes(name) ? "border-violet-300 bg-violet-50 text-violet-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {name}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="space-y-2">
                  <label htmlFor="plan-sequence" className="text-sm font-medium text-slate-900">Practice sequence <span className="font-normal text-slate-500">(optional)</span></label>
                  <Textarea id="plan-sequence" value={draft.sequence} onChange={(event) => setDraft({ ...draft, sequence: event.target.value })} placeholder={"Add one step per line, such as:\nIntroduce the topic\nPractice with a prompt\nReview together"} rows={5} />
                  <p className="text-xs text-slate-500">Use prompts, practice, and review steps that you can adapt later.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="plan-notes" className="text-sm font-medium text-slate-900">Teacher notes <span className="font-normal text-slate-500">(optional, private in this preview)</span></label>
                  <Textarea id="plan-notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Add preparation notes for yourself" rows={3} />
                </div>
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
                  <Button type="button" variant="ghost" onClick={discardDraft}>Discard preview</Button>
                  <Button type="submit"><BookText aria-hidden="true" /> Review draft</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <aside className="space-y-4">
            <Alert>
              <CircleHelp aria-hidden="true" />
              <AlertTitle>Saving is unavailable</AlertTitle>
              <AlertDescription>There is no lesson-plan service connected. Reviewing this draft will not create a saved plan, assign it to a learner, attach materials, or schedule a session.</AlertDescription>
            </Alert>
            <Card className="bg-slate-50/70 shadow-none ring-slate-200">
              <CardHeader>
                <CardTitle className="text-sm">Keep the workflow clear</CardTitle>
              </CardHeader>
              <CardContent className="gap-3 text-sm leading-6 text-slate-600">
                <p>Teaching materials and activities are selected in their own workflows when available.</p>
                <Link to="/esl/materials" className="font-medium text-violet-700 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Open Teaching Materials</Link>
                <Link to="/esl/classwork" className="font-medium text-violet-700 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Open Activities &amp; Assessments</Link>
              </CardContent>
            </Card>
          </aside>
        </section>
      )}

      {view === "preview" && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Draft preview · Not saved</p>
                  <CardTitle className="mt-2 text-xl">{draft.title}</CardTitle>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">Browser session only</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <section>
                <h2 className="text-sm font-semibold text-slate-900">Learning objective</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{draft.objective}</p>
              </section>
              {draft.skills.length > 0 && <section>
                <h2 className="text-sm font-semibold text-slate-900">Skill focus</h2>
                <div className="mt-2 flex flex-wrap gap-2">{draft.skills.map((skill) => <span key={skill} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">{skill}</span>)}</div>
              </section>}
              {draft.sequence.trim() && <section>
                <h2 className="text-sm font-semibold text-slate-900">Practice sequence</h2>
                <ol className="mt-3 space-y-3">{draft.sequence.split("\n").map((step) => step.trim()).filter(Boolean).map((step, index) => <li key={`${step}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-600"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{index + 1}</span><span>{step}</span></li>)}</ol>
              </section>}
              {draft.notes.trim() && <section className="rounded-xl bg-slate-50 p-4"><h2 className="text-sm font-semibold text-slate-900">Teacher notes · private in this preview</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{draft.notes}</p></section>}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={discardDraft}>Discard preview</Button>
                <Button variant="outline" onClick={() => setView("create")}><PenLine aria-hidden="true" /> Edit draft</Button>
              </div>
            </CardContent>
          </Card>
          <aside className="space-y-4">
            <Alert>
              <CircleHelp aria-hidden="true" />
              <AlertTitle>This plan has not been saved</AlertTitle>
              <AlertDescription>The current app has no lesson-plan service. This preview is held in page memory and will be lost when you leave or refresh.</AlertDescription>
            </Alert>
            <Button className="w-full" disabled title="Lesson-plan saving is not connected">Save plan unavailable</Button>
          </aside>
        </section>
      )}
    </div>
  )
}
