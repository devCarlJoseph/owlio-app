export type PreviewRole = "teacher" | "learner"
export type Tool = "select" | "pen" | "highlighter" | "eraser" | "text" | "sticky"
export type ShapeName = "circle" | "square" | "triangle" | "star"
export type Person = { id: string; name: string }

export const people: Person[] = [
  { id: "teacher", name: "Teacher" },
  { id: "learner-1", name: "Learner 1" },
  { id: "learner-2", name: "Learner 2" },
]

export function getMe(role: PreviewRole): Person {
  return role === "teacher" ? people[0] : people[1]
}

export function getPerson(id: string): Person {
  return people.find((person) => person.id === id) ?? people[0]
}

type Base = { id: string; authorId: string }
export type StrokeItem = Base & {
  kind: "stroke"
  points: [number, number][]
  color: string
  width: number
  opacity: number
}
export type BoardItem =
  | StrokeItem
  | (Base & { kind: "text"; x: number; y: number; text: string; color: string; size: number })
  | (Base & { kind: "sticky"; x: number; y: number; text: string })
  | (Base & { kind: "clipart"; x: number; y: number; glyph: string; src?: string; label: string })
  | (Base & { kind: "shape"; x: number; y: number; shape: ShapeName; color: string; label: string })

export type Bounds = { x: number; y: number; w: number; h: number }

export const STICKY_SIZE = { w: 176, h: 132 }
export const CLIPART_SIZE = 96
export const SHAPE_SIZE = 100

let counter = 0
export function newId() {
  counter += 1
  return `item-${counter}`
}

export const toolsByRole: Record<PreviewRole, Tool[]> = {
  teacher: ["select", "pen", "highlighter", "eraser", "text", "sticky"],
  learner: ["select", "pen", "eraser", "text"],
}

export const toolLabels: Record<Tool, { label: string; key: string }> = {
  select: { label: "Select and move", key: "V" },
  pen: { label: "Pen", key: "P" },
  highlighter: { label: "Highlighter", key: "H" },
  eraser: { label: "Eraser", key: "E" },
  text: { label: "Text", key: "T" },
  sticky: { label: "Sticky note", key: "N" },
}

export const palette = [
  { value: "#1e293b", name: "Black" },
  { value: "#e11d48", name: "Red" },
  { value: "#2563eb", name: "Blue" },
  { value: "#16a34a", name: "Green" },
  { value: "#f97316", name: "Orange" },
  { value: "#7c3aed", name: "Purple" },
]

export const strokeWidths = [
  { value: 3, name: "Thin" },
  { value: 6, name: "Medium" },
  { value: 10, name: "Thick" },
]

export const shapeColors: Record<ShapeName, string> = {
  circle: "#fb7185",
  square: "#38bdf8",
  triangle: "#fbbf24",
  star: "#a78bfa",
}

export type LibraryTab = "clipart" | "shapes" | "words" | "prompts"
export const libraryTabs: { id: LibraryTab; label: string }[] = [
  { id: "clipart", label: "Clipart" },
  { id: "shapes", label: "Shapes" },
  { id: "words", label: "Words" },
  { id: "prompts", label: "Prompts" },
]

export const clipart: { glyph: string; label: string; src?: string }[] = [
  { glyph: "🦉", label: "Owlio owl", src: "/mascot/owlio-owl.png" },
  { glyph: "☀️", label: "Sun" },
  { glyph: "🌱", label: "Grass" },
  { glyph: "🐶", label: "Dog" },
  { glyph: "🐱", label: "Cat" },
  { glyph: "🕐", label: "Clock" },
  { glyph: "🧸", label: "Teddy bear" },
  { glyph: "🍎", label: "Apple" },
  { glyph: "🌍", label: "Globe" },
  { glyph: "📚", label: "Books" },
  { glyph: "✏️", label: "Pencil" },
  { glyph: "🏠", label: "House" },
  { glyph: "🚌", label: "Bus" },
  { glyph: "⚽", label: "Ball" },
  { glyph: "🎂", label: "Cake" },
  { glyph: "🌧️", label: "Rain" },
]

export const shapeLibrary: { shape: ShapeName; label: string }[] = [
  { shape: "circle", label: "Circle" },
  { shape: "square", label: "Square" },
  { shape: "triangle", label: "Triangle" },
  { shape: "star", label: "Star" },
]

export const words = ["apple", "happy", "run", "big", "small", "teacher", "morning", "because", "always", "yesterday"]

export const prompts = [
  "Find the circle",
  "Find the blue shape",
  "Choose the shape with three sides",
  "What do you see?",
  "Say it in a full sentence",
]

export function itemBounds(item: BoardItem): Bounds {
  if (item.kind === "stroke") {
    const xs = item.points.map(([x]) => x)
    const ys = item.points.map(([, y]) => y)
    const pad = item.width / 2 + 4
    const x = Math.min(...xs) - pad
    const y = Math.min(...ys) - pad
    return { x, y, w: Math.max(...xs) - x + pad, h: Math.max(...ys) - y + pad }
  }
  if (item.kind === "text") {
    const lines = item.text.split("\n")
    const longest = Math.max(...lines.map((line) => line.length), 1)
    return { x: item.x, y: item.y, w: longest * item.size * 0.58 + 12, h: lines.length * item.size * 1.3 + 4 }
  }
  if (item.kind === "sticky") return { x: item.x, y: item.y, ...STICKY_SIZE }
  if (item.kind === "clipart") return { x: item.x, y: item.y, w: CLIPART_SIZE, h: CLIPART_SIZE }
  return { x: item.x, y: item.y, w: SHAPE_SIZE, h: SHAPE_SIZE }
}

export function moveItem(item: BoardItem, dx: number, dy: number): BoardItem {
  if (item.kind === "stroke") {
    return { ...item, points: item.points.map(([x, y]) => [x + dx, y + dy] as [number, number]) }
  }
  return { ...item, x: item.x + dx, y: item.y + dy }
}

export function strokePath(points: [number, number][]) {
  const [first, ...rest] = points
  if (!first) return ""
  if (!rest.length) return `M ${first[0]} ${first[1]} l 0.01 0`
  return `M ${first[0]} ${first[1]} ${rest.map(([x, y]) => `L ${x} ${y}`).join(" ")}`
}

export function starPoints(x: number, y: number) {
  const cx = x + SHAPE_SIZE / 2
  const cy = y + SHAPE_SIZE / 2 + 3
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? 48 : 20
    const angle = (Math.PI / 5) * index - Math.PI / 2
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`
  }).join(" ")
}

function ellipse(cx: number, cy: number, rx: number, ry: number): [number, number][] {
  return Array.from({ length: 33 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 32
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)] as [number, number]
  })
}

export function createSeedPages(): BoardItem[][] {
  const shapes: ShapeName[] = ["circle", "square", "triangle", "star"]
  return [
    [
      { id: "seed-prompt", authorId: "teacher", kind: "text", x: 90, y: 70, text: "Find the circle", color: "#1e3a8a", size: 44 },
      {
        id: "seed-underline",
        authorId: "teacher",
        kind: "stroke",
        points: [[90, 132], [200, 138], [330, 132], [420, 136]],
        color: "#e11d48",
        width: 5,
        opacity: 1,
      },
      ...shapes.map((shape, index): BoardItem => ({
        id: `seed-${shape}`,
        authorId: "teacher",
        kind: "shape",
        x: 110 + index * 200,
        y: 230,
        shape,
        color: shapeColors[shape],
        label: `${shape} shape`,
      })),
      { id: "seed-sticky", authorId: "teacher", kind: "sticky", x: 880, y: 90, text: "How are you today?" },
      {
        id: "seed-learner-circle",
        authorId: "learner-2",
        kind: "stroke",
        points: ellipse(160, 280, 78, 78),
        color: "#16a34a",
        width: 5,
        opacity: 1,
      },
    ],
    [],
  ]
}
