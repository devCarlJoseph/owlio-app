export const BOARD_WIDTH = 960
export const BOARD_HEIGHT = 540
export const ITEM_SIZE = 100

export type BoardShape = 'circle' | 'square' | 'rectangle' | 'triangle' | 'diamond' | 'star'
export type BoardPoint = [number, number]
type Base = { id: string; authorId: string }
export type BoardShapeItem = Base & { kind: 'shape'; shape: BoardShape; color: string; colorName: string; x: number; y: number }
export type BoardObjectItem = Base & { kind: 'object'; glyph: string; src?: string; label: string; x: number; y: number }
export type BoardMarkItem = Base & { kind: 'mark'; points: BoardPoint[]; color: string }
export type BoardItem = BoardShapeItem | BoardObjectItem | BoardMarkItem
export type BoardState = { items: BoardItem[]; instruction: string | null }
export type BoardBounds = { x: number; y: number; w: number; h: number }

export const boardShapes: { shape: BoardShape; label: string }[] = [
  { shape: 'circle', label: 'Circle' },
  { shape: 'square', label: 'Square' },
  { shape: 'rectangle', label: 'Rectangle' },
  { shape: 'triangle', label: 'Triangle' },
  { shape: 'diamond', label: 'Diamond' },
  { shape: 'star', label: 'Star' },
]

export const boardColors = [
  { value: '#ef4444', name: 'red' },
  { value: '#3b82f6', name: 'blue' },
  { value: '#22c55e', name: 'green' },
  { value: '#f59e0b', name: 'yellow' },
  { value: '#8b5cf6', name: 'purple' },
  { value: '#ec4899', name: 'pink' },
]

export const boardObjects: { glyph: string; label: string; src?: string }[] = [
  { glyph: '🍎', label: 'apple' },
  { glyph: '🐶', label: 'dog' },
  { glyph: '🐱', label: 'cat' },
  { glyph: '⚽', label: 'ball' },
  { glyph: '🏠', label: 'house' },
  { glyph: '🚌', label: 'bus' },
  { glyph: '📚', label: 'books' },
  { glyph: '☀️', label: 'sun' },
  { glyph: '🕐', label: 'clock' },
  { glyph: '🎂', label: 'cake' },
  { glyph: '✏️', label: 'pencil' },
  { glyph: '🦉', label: 'owl', src: '/mascot/owlio-owl.png' },
]

let counter = 0
export function boardId() {
  counter += 1
  return `board-${Date.now().toString(36)}-${counter}`
}

export function itemName(item: BoardItem) {
  if (item.kind === 'shape') return `${item.colorName} ${item.shape}`
  if (item.kind === 'object') return item.label
  return 'circle mark'
}

export function itemBounds(item: BoardItem): BoardBounds {
  if (item.kind !== 'mark') return { x: item.x, y: item.y, w: ITEM_SIZE, h: ITEM_SIZE }
  const xs = item.points.map(([x]) => x)
  const ys = item.points.map(([, y]) => y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

export function clampToBoard(x: number, y: number): BoardPoint {
  return [Math.min(Math.max(x, 0), BOARD_WIDTH - ITEM_SIZE), Math.min(Math.max(y, 0), BOARD_HEIGHT - ITEM_SIZE)]
}

export function moveBoardItem(item: BoardItem, dx: number, dy: number): BoardItem {
  if (item.kind === 'mark') return { ...item, points: item.points.map(([x, y]) => [x + dx, y + dy] as BoardPoint) }
  const [x, y] = clampToBoard(item.x + dx, item.y + dy)
  return { ...item, x, y }
}

export function pathFor(points: BoardPoint[]) {
  const [first, ...rest] = points
  if (!first) return ''
  if (!rest.length) return `M ${first[0]} ${first[1]} l 0.01 0`
  return `M ${first[0]} ${first[1]} ${rest.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')}`
}

export function shapePoints(shape: 'triangle' | 'diamond' | 'star', x: number, y: number) {
  if (shape === 'triangle') return `${x + 50},${y + 6} ${x + 96},${y + 92} ${x + 4},${y + 92}`
  if (shape === 'diamond') return `${x + 50},${y + 2} ${x + 96},${y + 50} ${x + 50},${y + 98} ${x + 4},${y + 50}`
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? 48 : 20
    const angle = (Math.PI / 5) * index - Math.PI / 2
    return `${(x + 50 + radius * Math.cos(angle)).toFixed(1)},${(y + 53 + radius * Math.sin(angle)).toFixed(1)}`
  }).join(' ')
}

export function circleAround(bounds: BoardBounds, pad = 18): BoardPoint[] {
  const cx = bounds.x + bounds.w / 2
  const cy = bounds.y + bounds.h / 2
  const rx = bounds.w / 2 + pad
  const ry = bounds.h / 2 + pad
  return Array.from({ length: 41 }, (_, index) => {
    const angle = (Math.PI * 2.1 * index) / 40 - Math.PI / 2
    const wobble = 1 + Math.sin(index * 1.7) * 0.03
    return [cx + rx * wobble * Math.cos(angle), cy + ry * wobble * Math.sin(angle)] as BoardPoint
  })
}

export function createBoardSeed(kind: 'esl' | 'tutors', hostId: string, sampleLearnerId: string): BoardState {
  void [kind, hostId, sampleLearnerId]
  return { items: [], instruction: null }
}
