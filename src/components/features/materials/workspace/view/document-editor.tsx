import { useState } from "react"
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Bold, Italic, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createBlock, type BlockKind, type LibraryWork, type WorkBlock } from "./work-records"

export const editorSelectClass = "h-9 max-w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function DocumentEditor({ work, onChange }: { work: LibraryWork; onChange: (next: LibraryWork) => void }) {
  const [activeId, setActiveId] = useState(work.blocks[0].id)
  const active = work.blocks.find(block => block.id === activeId) ?? work.blocks[0]
  const activeIndex = work.blocks.indexOf(active)
  function patch(value: Partial<WorkBlock>) {
    onChange({ ...work, blocks: work.blocks.map(block => block.id === active.id ? { ...block, ...value } : block) })
  }
  function move(offset: number) {
    const blocks = [...work.blocks]
    const target = activeIndex + offset
    if (target < 0 || target >= blocks.length) return
    ;[blocks[activeIndex], blocks[target]] = [blocks[target], blocks[activeIndex]]
    onChange({ ...work, blocks })
  }
  return <div className="space-y-4">
    <div role="group" aria-label="Document formatting" className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-2">
      <select aria-label="Block style" className={editorSelectClass} value={active.kind} onChange={event => patch({ kind: event.target.value as BlockKind })}>
        <option value="paragraph">Paragraph</option><option value="heading">Heading</option><option value="bullets">Bullet list</option>
      </select>
      <Button variant="ghost" size="icon" aria-label="Bold block" aria-pressed={active.bold} onClick={() => patch({ bold: !active.bold })}><Bold aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Italic block" aria-pressed={active.italic} onClick={() => patch({ italic: !active.italic })}><Italic aria-hidden="true" /></Button>
      {([{ value: "left", icon: AlignLeft }, { value: "center", icon: AlignCenter }, { value: "right", icon: AlignRight }] as const).map(({ value, icon: Icon }) => <Button key={value} variant="ghost" size="icon" aria-label={`Align ${value}`} aria-pressed={active.align === value} onClick={() => patch({ align: value })}><Icon aria-hidden="true" /></Button>)}
      <span aria-hidden="true" className="mx-1 h-5 border-l border-border" />
      <Button variant="ghost" size="icon" aria-label="Move block up" disabled={activeIndex === 0} onClick={() => move(-1)}><ArrowUp aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Move block down" disabled={activeIndex === work.blocks.length - 1} onClick={() => move(1)}><ArrowDown aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Delete block" disabled={work.blocks.length === 1} onClick={() => onChange({ ...work, blocks: work.blocks.filter(block => block.id !== active.id) })}><Trash2 aria-hidden="true" /></Button>
      <Button variant="outline" className="ml-auto" onClick={() => { const block = createBlock(); setActiveId(block.id); onChange({ ...work, blocks: [...work.blocks, block] }) }}><Plus aria-hidden="true" /> Add block</Button>
    </div>
    <p className="text-xs text-muted-foreground">Select a block to format it. For a bullet list, write one item per line.</p>
    <div className="rounded-2xl border border-border bg-muted/35 p-3 sm:p-8">
      <article aria-label="Document canvas" className="mx-auto min-h-[540px] max-w-3xl space-y-2 rounded-sm border border-border bg-card px-4 py-8 shadow-sm sm:px-12 sm:py-12">
        <h2 className="mb-8 break-words text-3xl font-semibold tracking-tight">{work.title || "Untitled document"}</h2>
        {work.blocks.map((block, index) => <div key={block.id} className={`rounded-lg border p-2 ${block.id === active.id ? "border-ring/40 bg-muted/20" : "border-transparent"}`}>
          <label htmlFor={`block-${block.id}`} className="mb-1 block text-[10px] font-medium tracking-wider text-muted-foreground uppercase">{index + 1} · {block.kind === "bullets" ? "Bullet list" : block.kind}</label>
          <Textarea id={`block-${block.id}`} value={block.text} onFocus={() => setActiveId(block.id)} onChange={event => onChange({ ...work, blocks: work.blocks.map(item => item.id === block.id ? { ...item, text: event.target.value } : item) })} placeholder={block.kind === "heading" ? "Section heading…" : block.kind === "bullets" ? "First idea\nNext idea" : "Start writing…"} rows={Math.max(2, Math.min(18, block.text.split("\n").length + 1))} style={{ textAlign: block.align, fontWeight: block.bold || block.kind === "heading" ? 600 : 400, fontStyle: block.italic ? "italic" : "normal" }} className={`resize-y border-0 bg-transparent shadow-none ${block.kind === "heading" ? "text-xl md:text-xl" : "text-base md:text-base"}`} />
        </div>)}
      </article>
    </div>
  </div>
}

export function DocumentPreview({ work }: { work: LibraryWork }) {
  return <article className="space-y-5 break-words rounded-xl bg-card p-5 text-card-foreground sm:p-8">
    <h2 className="text-3xl font-semibold">{work.title || "Untitled document"}</h2>
    {work.blocks.map(block => <div key={block.id} style={{ textAlign: block.align, fontWeight: block.bold ? 700 : undefined, fontStyle: block.italic ? "italic" : undefined }}>
      {block.kind === "heading" ? <h3 className="whitespace-pre-wrap text-xl font-semibold">{block.text}</h3> : block.kind === "bullets" ? <ul className="list-inside list-disc space-y-1">{block.text.split("\n").map((line, i) => <li key={i}>{line}</li>)}</ul> : <p className="whitespace-pre-wrap leading-7">{block.text}</p>}
    </div>)}
  </article>
}
