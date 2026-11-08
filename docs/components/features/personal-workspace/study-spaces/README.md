# Study Spaces component breakdown

Target: `src/components/features/personal-workspace/study-spaces/`. Keep the existing `detail/` subfeature. These are **proposed** destinations; a move must not change stored spaces, avatar data, 3D interactions, audio cleanup, or fallbacks. Follow the [general guide](../../../../sops/component-decomposition.md).

## Explore/list root

| Proposed destination within `study-spaces/` | Current files |
| --- | --- |
| `forms/` | `create-space-dialog.tsx`, `join-space-dialog.tsx` |
| `ui/` | `city-buildings.tsx`, `city-plaza.tsx`, `city-traffic.tsx`, `room-plan-preview.tsx`, `space-card-grid.tsx`, `space-map-art.tsx`, `space-map.tsx`, `space-map.test.tsx`, `study-hall-world.tsx` |
| `utils/` | `city-layout.ts`, `city-layout.test.ts`, `space-format.ts`, `space-map-layout.ts`, `space-roster.ts`, `traffic-paths.ts`, `traffic-paths.test.ts` |
| `hooks/` | `use-walk-keys.ts` |
| `model/` | `study-spaces-records.ts` (browser-local records) |
| `view/` | `study-spaces-view.tsx`, `study-spaces-flow.test.tsx` |
| `detail/` test | `study-space-room-features.test.ts` -> keep near the room behavior it tests, with `detail/view/` if it exercises the whole screen |

## Room `detail/`

| Proposed destination within `study-spaces/detail/` | Current files |
| --- | --- |
| `forms/` | `character-dialog.tsx` |
| `ui/` | `character-figure.tsx`, `drawer-panel.tsx`, `focus-music-panel.tsx`, `locker-panel.tsx`, `nap-banner.tsx`, `pomodoro-chip.tsx`, `room-chat-panel.tsx`, `room-extras.tsx`, `room-garden.tsx`, `room-zones.tsx`, `seat-panel.tsx`, `space-room-scene.tsx`, `task-board-panel.tsx`, `tv-panel.tsx` |
| `model/` | `drawer-storage.ts`, `room-ambience.ts`, `room-lockers.ts`, `room-tasks.ts`, `room-tv.ts`, `study-space-seats.ts` |
| `audio/` | `focus-music.ts` (Web Audio engine lifecycle, not a pure utility) |
| `hooks/` | `use-focus-music.ts`, `use-pomodoro.ts` |
| `view/` | `study-space-detail-view.tsx`, `study-space-detail.test.tsx` |

The current `study-spaces/{contents,forms,ui,view}/notes.md` files are placeholders, not implementation. Do not use them as proof the component move has already happened.

Split the large Three.js scene only by stable geometry/input ownership; never extract arbitrary JSX if it recreates textures, disposes shared resources, breaks raycast/seating or loses the WebGL fallback. Test navigation in/out, keyboard release, timers/audio cleanup, and preservation of browser-local records. For measured rendering problems follow the Study Spaces performance skill; a directory move is not a performance optimization.

[Personal workspace plans](../README.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/personal-workspace/study-spaces/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### Nested feature guides

- [`contents/`](contents/README.md)
- [`detail/`](detail/README.md)
- [`forms/`](forms/README.md)
- [`ui/`](ui/README.md)
- [`view/`](view/README.md)

### `city-buildings.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/city-buildings.tsx`

```tsx
import { useEffect, useMemo } from "react"
import { CanvasTexture, Color, SRGBColorSpace } from "three"
import type { Footprint } from "./city-layout"
import type { StudySpaceKind } from "./study-spaces-records"

const gray = new Color("#a3a9b2")

function tone(hex: string, locked: boolean): string {
  return locked ? `#${new Color(hex).lerp(gray, 0.65).getHexString()}` : hex
}

type KindStyle = { wall: string; trim: string; roof: string; glass: string; accent: string; label: string }

const KIND_STYLE: Record<StudySpaceKind, KindStyle> = {
  focused: { wall: "#ece6d8", trim: "#d6ccb6", roof: "#f4b400", glass: "#8fb8de", accent: "#2f6fe4", label: "Focus tower" },
  collaborative: { wall: "#e3ebf5", trim: "#c7d3e3", roof: "#2f6fe4", glass: "#9cc7ea", accent: "#f4b400", label: "Group hall" },
  lounge: { wall: "#f7e6cc", trim: "#e2c9a3", roof: "#2f9e78", glass: "#a9d2e6", accent: "#e4572e", label: "Study café" },
}

const PX = 40

// With `mask` the canvas is black except for warm window glass, used as a night-time emissive map.
function facadeCanvas(
  width: number,
  height: number,
  style: KindStyle,
  kind: StudySpaceKind,
  front: boolean,
  locked: boolean,
  mask = false
) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(width * PX)
  canvas.height = Math.round(height * PX)
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  ctx.fillStyle = mask ? "#000000" : tone(style.wall, locked)
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  if (!mask) {
    ctx.fillStyle = tone(style.trim, locked)
    ctx.fillRect(0, canvas.height - 0.35 * PX, canvas.width, 0.35 * PX)
  }

  const glass = mask ? "#ffd27a" : tone(style.glass, locked)
  const frame = mask ? "#000000" : tone("#ffffff", locked)

  if (kind === "focused") {
    const floors = Math.max(2, Math.round((height - 1.6) / 1.8))
    const cols = Math.max(2, Math.round(width / 1.5))
    const cellW = canvas.width / cols
    const cellH = (canvas.height - 1.9 * PX) / floors
    for (let floor = 0; floor < floors; floor += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = col * cellW + cellW * 0.2
        const y = 0.3 * PX + floor * cellH + cellH * 0.18
        ctx.fillStyle = frame
        ctx.fillRect(x - 3, y - 3, cellW * 0.6 + 6, cellH * 0.62 + 6)
        ctx.fillStyle = glass
        ctx.fillRect(x, y, cellW * 0.6, cellH * 0.62)
      }
      ctx.fillStyle = mask ? "#000000" : tone(style.trim, locked)
      ctx.fillRect(0, 0.3 * PX + (floor + 1) * cellH - 3, canvas.width, 4)
    }
  } else {
    const cols = Math.max(2, Math.round(width / (kind === "collaborative" ? 1.3 : 1.7)))
    const cellW = canvas.width / cols
    const top = 0.5 * PX
    const bottom = canvas.height - 0.6 * PX
    for (let col = 0; col < cols; col += 1) {
      const center = Math.abs(col + 0.5 - cols / 2) < 0.6
      if (front && center) continue
      const x = col * cellW + cellW * 0.12
      ctx.fillStyle = frame
      ctx.fillRect(x - 3, top - 3, cellW * 0.76 + 6, bottom - top + 6)
      ctx.fillStyle = glass
      ctx.fillRect(x, top, cellW * 0.76, bottom - top)
      if (kind === "collaborative") {
        ctx.fillStyle = frame
        ctx.fillRect(x, top + (bottom - top) * 0.45, cellW * 0.76, 3)
      }
    }
  }

  return canvas
}

function useFacade(width: number, height: number, kind: StudySpaceKind, front: boolean, locked: boolean, mask = false) {
  const texture = useMemo(() => {
    const created = new CanvasTexture(facadeCanvas(width, height, KIND_STYLE[kind], kind, front, locked, mask))
    created.colorSpace = SRGBColorSpace
    created.anisotropy = 4
    return created
  }, [width, height, kind, front, locked, mask])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function billboardCanvas(name: string, kind: StudySpaceKind, locked: boolean) {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas
  const style = KIND_STYLE[kind]

  const gradient = ctx.createLinearGradient(0, 0, 512, 256)
  gradient.addColorStop(0, tone(style.roof, locked))
  gradient.addColorStop(1, tone(style.accent, locked))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 256)

  ctx.fillStyle = "rgba(255,255,255,0.16)"
  ctx.beginPath()
  ctx.arc(440, 40, 110, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 30px Inter, sans-serif"
  ctx.fillText(locked ? "LOCKED · NEEDS CODE" : style.label.toUpperCase(), 32, 64)

  ctx.font = "bold 58px Inter, sans-serif"
  const words = name.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > 448 && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  lines.slice(0, 2).forEach((text, index) => {
    const clipped = index === 1 && lines.length > 2 ? `${text}…` : text
    ctx.fillText(clipped, 32, 140 + index * 64)
  })

  return canvas
}

function Billboard({ name, kind, locked, y, width }: { name: string; kind: StudySpaceKind; locked: boolean; y: number; width: number }) {
  const texture = useMemo(() => {
    const created = new CanvasTexture(billboardCanvas(name, kind, locked))
    created.colorSpace = SRGBColorSpace
    created.anisotropy = 4
    return created
  }, [name, kind, locked])
  useEffect(() => () => texture.dispose(), [texture])
  const h = width / 2

  return (
    <group position={[0, y, 0]} rotation={[-0.12, 0, 0]}>
      {[-width / 2 + 0.3, width / 2 - 0.3].map((x) => (
        <mesh key={x} position={[x, 0.35, -0.12]} castShadow>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
      <mesh position={[0, 0.7 + h / 2, -0.12]} castShadow>
        <boxGeometry args={[width + 0.2, h + 0.2, 0.14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.7 + h / 2, -0.04]}>
        <planeGeometry args={[width, h]} />
        <meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={locked ? 0.05 : 0.3} />
      </mesh>
    </group>
  )
}

function Door({ z, color, locked }: { z: number; color: string; locked: boolean }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.95, 0.03]}>
        <boxGeometry args={[1.5, 1.9, 0.08]} />
        <meshStandardMaterial color={tone("#ffffff", locked)} />
      </mesh>
      <mesh position={[0, 0.9, 0.08]}>
        <boxGeometry args={[1.25, 1.75, 0.04]} />
        <meshStandardMaterial color={tone(color, locked)} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0.6]} receiveShadow>
        <boxGeometry args={[1.9, 0.04, 1.1]} />
        <meshStandardMaterial color={tone("#d8dee8", locked)} />
      </mesh>
    </group>
  )
}

function Body({
  footprint,
  kind,
  locked,
  height,
  glow,
}: {
  footprint: Footprint
  kind: StudySpaceKind
  locked: boolean
  height: number
  glow: number
}) {
  const front = useFacade(footprint.w, height, kind, true, locked)
  const side = useFacade(footprint.d, height, kind, false, locked)
  const frontLit = useFacade(footprint.w, height, kind, true, locked, true)
  const sideLit = useFacade(footprint.d, height, kind, false, locked, true)
  const roof = tone(KIND_STYLE[kind].wall, locked)
  const lit = glow * (locked ? 0.35 : 1.1)

  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[footprint.w, height, footprint.d]} />
      <meshStandardMaterial attach="material-0" map={side} emissive="#ffffff" emissiveMap={sideLit} emissiveIntensity={lit} />
      <meshStandardMaterial attach="material-1" map={side} emissive="#ffffff" emissiveMap={sideLit} emissiveIntensity={lit} />
      <meshStandardMaterial attach="material-2" color={roof} />
      <meshStandardMaterial attach="material-3" color={roof} />
      <meshStandardMaterial attach="material-4" map={front} emissive="#ffffff" emissiveMap={frontLit} emissiveIntensity={lit} />
      <meshStandardMaterial attach="material-5" map={front} emissive="#ffffff" emissiveMap={frontLit} emissiveIntensity={lit} />
    </mesh>
  )
}

function RoofCap({ w, d, y, color, locked }: { w: number; d: number; y: number; color: string; locked: boolean }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[w + 0.6, 0.4, d + 0.6]} />
        <meshStandardMaterial color={tone(color, locked)} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[w - 0.2, 0.08, d - 0.2]} />
        <meshStandardMaterial color={tone("#f8fafc", locked)} />
      </mesh>
    </group>
  )
}

function Tower({ footprint, locked, name, glow = 0 }: BuildingProps) {
  const style = KIND_STYLE.focused
  const h = footprint.h
  return (
    <group>
      <Body footprint={footprint} kind="focused" locked={locked} height={h} glow={glow} />
      <RoofCap w={footprint.w} d={footprint.d} y={h} color={style.roof} locked={locked} />
      <mesh position={[footprint.w / 2 - 0.9, h + 0.9, -footprint.d / 2 + 0.9]} castShadow>
        <boxGeometry args={[1.1, 0.9, 1.1]} />
        <meshStandardMaterial color={tone("#cbd5e1", locked)} />
      </mesh>
      <Billboard name={name} kind="focused" locked={locked} y={h + 0.5} width={footprint.w - 0.6} />
      <Door z={footprint.d / 2} color={style.accent} locked={locked} />
      <mesh position={[0, 2.25, footprint.d / 2 + 0.45]} castShadow>
        <boxGeometry args={[2.4, 0.12, 0.9]} />
        <meshStandardMaterial color={tone(style.roof, locked)} />
      </mesh>
    </group>
  )
}

function Hall({ footprint, locked, name, glow = 0 }: BuildingProps) {
  const style = KIND_STYLE.collaborative
  const h = footprint.h
  return (
    <group>
      <Body footprint={footprint} kind="collaborative" locked={locked} height={h} glow={glow} />
      <RoofCap w={footprint.w} d={footprint.d} y={h} color={style.roof} locked={locked} />
      <Billboard name={name} kind="collaborative" locked={locked} y={h + 0.5} width={Math.min(footprint.w - 1, 5.2)} />
      <Door z={footprint.d / 2} color={style.roof} locked={locked} />
      <group position={[0, 0, footprint.d / 2 + 0.9]}>
        <mesh position={[0, 2.4, 0]} castShadow>
          <boxGeometry args={[3.2, 0.16, 1.8]} />
          <meshStandardMaterial color={tone(style.accent, locked)} />
        </mesh>
        {[-1.45, 1.45].map((x) => (
          <mesh key={x} position={[x, 1.2, 0.75]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 2.4, 10]} />
            <meshStandardMaterial color={tone("#f8fafc", locked)} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Cafe({ footprint, locked, name, glow = 0 }: BuildingProps) {
  const style = KIND_STYLE.lounge
  const h = footprint.h
  const stripes = 8
  return (
    <group>
      <Body footprint={footprint} kind="lounge" locked={locked} height={h} glow={glow} />
      <RoofCap w={footprint.w} d={footprint.d} y={h} color={style.roof} locked={locked} />
      <Billboard name={name} kind="lounge" locked={locked} y={h + 0.5} width={Math.min(footprint.w - 0.8, 4.6)} />
      <Door z={footprint.d / 2} color={style.roof} locked={locked} />
      <group position={[0, h - 0.9, footprint.d / 2 + 0.6]} rotation={[0.42, 0, 0]}>
        {Array.from({ length: stripes }, (_, index) => (
          <mesh key={index} position={[-footprint.w / 2 + (index + 0.5) * (footprint.w / stripes), 0, 0]} castShadow>
            <boxGeometry args={[footprint.w / stripes, 0.06, 1.3]} />
            <meshStandardMaterial color={tone(index % 2 === 0 ? style.accent : "#fff7ed", locked)} />
          </mesh>
        ))}
      </group>
      {[-footprint.w / 2 + 0.9, footprint.w / 2 - 0.9].map((x) => (
        <group key={x} position={[x, 0, footprint.d / 2 + 1.9]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.06, 18]} />
            <meshStandardMaterial color={tone("#f8fafc", locked)} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.45, 8]} />
            <meshStandardMaterial color={tone("#475569", locked)} />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 6]} />
            <meshStandardMaterial color={tone("#475569", locked)} />
          </mesh>
          <mesh position={[0, 1.85, 0]} castShadow>
            <coneGeometry args={[0.85, 0.4, 12]} />
            <meshStandardMaterial color={tone(style.accent, locked)} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

type BuildingProps = { footprint: Footprint; locked: boolean; name: string; glow?: number }

export function Building({ kind, ...props }: BuildingProps & { kind: StudySpaceKind }) {
  if (kind === "focused") return <Tower {...props} />
  if (kind === "collaborative") return <Hall {...props} />
  return <Cafe {...props} />
}

export function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 1, 8]} />
        <meshStandardMaterial color="#8a5a33" />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color="#4caf50" flatShading />
      </mesh>
      <mesh position={[0.25, 2.05, 0.1]} castShadow>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#66bb6a" flatShading />
      </mesh>
    </group>
  )
}

export function StreetLamp({ position, glow = 0 }: { position: [number, number, number]; glow?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.12, 12]} />
        <meshStandardMaterial color="#2f6fe4" />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 3, 8]} />
        <meshStandardMaterial color="#2f6fe4" />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <cylinderGeometry args={[0.38, 0.2, 0.18, 14]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0, 2.92, 0]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#fff7d6" emissive="#fde68a" emissiveIntensity={0.4 + glow * 3} toneMapped={false} />
      </mesh>
      {/* Same warm lamp light the study room uses at night, centred on the bulb. */}
      {glow > 0 ? <pointLight position={[0, 2.85, 0]} intensity={5 * glow} distance={7} color="#fbbf24" /> : null}
    </group>
  )
}
```

### `city-layout.test.ts`

Current file: `src/components/features/personal-workspace/study-spaces/city-layout.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { constrainWalker, layoutCity, nearestDoor, ROAD, streetAt } from "./city-layout"
import { sampleCreatedSpaces, sampleDiscoverySpaces, sampleJoinedSpaces } from "./study-spaces-records"

function sampleCity() {
  return layoutCity([
    { role: "owner", spaces: sampleCreatedSpaces },
    { role: "member", spaces: sampleJoinedSpaces },
    { role: "visitor", spaces: sampleDiscoverySpaces },
  ])
}

describe("study hall city layout", () => {
  it("places every space on its own lot in one mixed grid, keeping roles", () => {
    const city = sampleCity()
    const total = sampleCreatedSpaces.length + sampleJoinedSpaces.length + sampleDiscoverySpaces.length

    expect(city.lots).toHaveLength(total)
    expect(new Set(city.lots.map((lot) => `${lot.x},${lot.z}`)).size).toBe(total)
    expect(city.lots[0].role).toBe("owner")
    expect(city.lots.at(-1)?.role).toBe("visitor")
    for (const lot of city.lots) {
      expect(Math.abs(lot.x)).toBeLessThan(city.width / 2)
      expect(Math.abs(lot.z)).toBeLessThan(city.depth / 2)
    }
  })

  it("gives each room type its own building shape", () => {
    const city = sampleCity()
    const byKind = (kind: string) => city.lots.find((lot) => lot.space.kind === kind)!.building

    expect(byKind("focused").h).toBeGreaterThan(byKind("collaborative").h)
    expect(byKind("collaborative").w).toBeGreaterThan(byKind("lounge").w)
  })

  it("keeps a walker out of buildings and finds the nearby door", () => {
    const city = sampleCity()
    const lot = city.lots[0]

    const pushed = constrainWalker({ x: lot.building.x, z: lot.building.z }, city)
    const insideX = Math.abs(pushed.x - lot.building.x) < lot.building.w / 2
    const insideZ = Math.abs(pushed.z - lot.building.z) < lot.building.d / 2
    expect(insideX && insideZ).toBe(false)

    expect(nearestDoor(lot.door, city)?.space.id).toBe(lot.space.id)
    expect(nearestDoor({ x: city.width, z: city.depth }, city)).toBeNull()
    expect(streetAt(lot.z, city)).toBe(1)
    expect(streetAt(city.lots.at(-1)!.z, city)).toBe(city.lots.at(-1)!.street)
  })

  it("handles an empty city", () => {
    const city = layoutCity([{ role: "owner", spaces: [] }])
    expect(city.lots).toHaveLength(0)
    expect(city.width).toBeGreaterThan(0)
    expect(streetAt(-city.depth / 2 + 6, city)).toBe(1)
  })

  it("keeps the central plaza free of buildings and puts the fountain roundabout on its corner intersection", () => {
    const city = sampleCity()
    const { plaza, roundabout } = city

    for (const lot of city.lots) {
      const overlapsPlaza = Math.abs(lot.x - plaza.x) < plaza.w / 2 && Math.abs(lot.z - plaza.z) < plaza.d / 2
      expect(overlapsPlaza).toBe(false)
    }
    expect(Math.abs(plaza.x)).toBeLessThan(0.01)
    expect(city.roadsX.some((x) => Math.abs(x - roundabout.x) < 0.01)).toBe(true)
    expect(city.roadsZ.some((z) => Math.abs(z - roundabout.z) < 0.01)).toBe(true)
    expect(roundabout.x).toBeCloseTo(plaza.x + plaza.w / 2 + ROAD / 2)
    expect(roundabout.z).toBeCloseTo(plaza.z + plaza.d / 2 + ROAD / 2)

    const pushed = constrainWalker({ x: roundabout.x, z: roundabout.z }, city)
    expect(Math.hypot(pushed.x - roundabout.x, pushed.z - roundabout.z)).toBeGreaterThanOrEqual(roundabout.island)
  })

  it("grows the city with more rows when there are many spaces", () => {
    const many = Array.from({ length: 30 }, (_, index) => ({ ...sampleCreatedSpaces[0], id: `space-${index}` }))
    const city = layoutCity([{ role: "owner", spaces: many }])
    expect(city.lots).toHaveLength(30)
    expect(new Set(city.lots.map((lot) => `${lot.x},${lot.z}`)).size).toBe(30)
  })
})
```

### `city-layout.ts`

Current file: `src/components/features/personal-workspace/study-spaces/city-layout.ts`

```ts
import type { StudySpaceKind, StudySpaceRecord } from "./study-spaces-records"

export type CityRole = "owner" | "member" | "visitor"

export type Footprint = { x: number; z: number; w: number; d: number; h: number }

export type CityLot = {
  space: StudySpaceRecord
  role: CityRole
  x: number
  z: number
  street: number
  building: Footprint
  door: { x: number; z: number }
}

export type CityLayout = {
  lots: CityLot[]
  width: number
  depth: number
  roadsX: number[]
  roadsZ: number[]
  spawn: { x: number; z: number }
  // The central block is a public plaza instead of building lots.
  plaza: { x: number; z: number; w: number; d: number }
  // Roundabout with the Owlio fountain at the plaza's front-right intersection.
  roundabout: { x: number; z: number; island: number; ring: number }
}

export const LOT_W = 10
export const LOT_D = 10
export const ROAD = 5
const LOTS_PER_BLOCK = 2
const BLOCK_COLS = 3
export const ROUNDABOUT_ISLAND = 2.2
export const ROUNDABOUT_RING = 4.4

export const BUILDING_SIZE: Record<StudySpaceKind, { w: number; d: number; h: number }> = {
  focused: { w: 5, d: 5, h: 9 },
  collaborative: { w: 7.4, d: 5.6, h: 4.2 },
  lounge: { w: 6, d: 5, h: 3.4 },
}

export function layoutCity(groups: { role: CityRole; spaces: StudySpaceRecord[] }[]): CityLayout {
  const entries = groups.flatMap((group) => group.spaces.map((space) => ({ space, role: group.role })))
  const blockW = LOTS_PER_BLOCK * LOT_W
  const plazaCol = Math.floor(BLOCK_COLS / 2)
  // Odd row count so the plaza block sits in the middle row; it takes one block's lots.
  let rows = 3
  while ((BLOCK_COLS * rows - 1) * LOTS_PER_BLOCK < entries.length) rows += 2
  const plazaRow = Math.floor(rows / 2)
  const width = BLOCK_COLS * blockW + (BLOCK_COLS + 1) * ROAD
  const depth = rows * LOT_D + (rows + 1) * ROAD
  const left = -width / 2
  const top = -depth / 2

  const roadsX = Array.from({ length: BLOCK_COLS + 1 }, (_, index) => left + ROAD / 2 + index * (blockW + ROAD))
  const roadsZ = Array.from({ length: rows + 1 }, (_, index) => top + ROAD / 2 + index * (LOT_D + ROAD))

  const slots: { row: number; block: number; inBlock: number }[] = []
  for (let row = 0; row < rows; row += 1) {
    for (let block = 0; block < BLOCK_COLS; block += 1) {
      if (row === plazaRow && block === plazaCol) continue
      for (let inBlock = 0; inBlock < LOTS_PER_BLOCK; inBlock += 1) slots.push({ row, block, inBlock })
    }
  }

  const lots = entries.map(({ space, role }, index): CityLot => {
    const { row, block, inBlock } = slots[index]
    const x = left + ROAD + block * (blockW + ROAD) + inBlock * LOT_W + LOT_W / 2
    const z = top + ROAD + row * (LOT_D + ROAD) + LOT_D / 2
    const size = BUILDING_SIZE[space.kind]
    const buildingZ = z - LOT_D / 2 + 1.2 + size.d / 2
    return {
      space,
      role,
      x,
      z,
      street: row + 1,
      building: { x, z: buildingZ, ...size },
      door: { x, z: buildingZ + size.d / 2 + 1.1 },
    }
  })

  const plaza = {
    x: left + ROAD + plazaCol * (blockW + ROAD) + blockW / 2,
    z: top + ROAD + plazaRow * (LOT_D + ROAD) + LOT_D / 2,
    w: blockW,
    d: LOT_D,
  }
  const roundabout = { x: roadsX[plazaCol + 1], z: roadsZ[plazaRow + 1], island: ROUNDABOUT_ISLAND, ring: ROUNDABOUT_RING }
  const spawn = { x: plaza.x - 3, z: plaza.z + 2 }

  return { lots, width, depth, roadsX, roadsZ, spawn, plaza, roundabout }
}

const AVATAR_RADIUS = 0.45

// Keeps a walker inside the city and outside every building footprint.
export function constrainWalker(point: { x: number; z: number }, layout: CityLayout) {
  let x = Math.min(Math.max(point.x, -layout.width / 2 + 0.6), layout.width / 2 - 0.6)
  let z = Math.min(Math.max(point.z, -layout.depth / 2 + 0.6), layout.depth / 2 - 0.6)

  for (const { building } of layout.lots) {
    const halfW = building.w / 2 + AVATAR_RADIUS
    const halfD = building.d / 2 + AVATAR_RADIUS
    const dx = x - building.x
    const dz = z - building.z
    if (Math.abs(dx) >= halfW || Math.abs(dz) >= halfD) continue
    const pushX = halfW - Math.abs(dx)
    const pushZ = halfD - Math.abs(dz)
    if (pushX < pushZ) x = building.x + Math.sign(dx || 1) * halfW
    else z = building.z + Math.sign(dz || 1) * halfD
  }

  const { roundabout } = layout
  const rx = x - roundabout.x
  const rz = z - roundabout.z
  const reach = roundabout.island + AVATAR_RADIUS
  const distance = Math.hypot(rx, rz)
  if (distance < reach) {
    const scale = reach / (distance || 1)
    x = roundabout.x + (distance ? rx : reach / scale) * scale
    z = roundabout.z + rz * scale
  }

  return { x, z }
}

export const DOOR_RADIUS = 2.4

export function nearestDoor(point: { x: number; z: number }, layout: CityLayout): CityLot | null {
  let best: CityLot | null = null
  let bestDistance = DOOR_RADIUS
  for (const lot of layout.lots) {
    const distance = Math.hypot(point.x - lot.door.x, point.z - lot.door.z)
    if (distance < bestDistance) {
      bestDistance = distance
      best = lot
    }
  }
  return best
}

export function streetAt(z: number, layout: CityLayout): number {
  const pitch = LOT_D + ROAD
  const row = Math.floor((z + layout.depth / 2 - ROAD) / pitch)
  return Math.min(Math.max(row + 1, 1), layout.roadsZ.length - 1)
}
```

### `city-plaza.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/city-plaza.tsx`

```tsx
import { useEffect, useMemo, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { CanvasTexture, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, type Group, type Mesh } from "three"
import type { CityLayout } from "./city-layout"
import { StreetLamp, Tree } from "./city-buildings"
import { CharacterFigure } from "./detail/character-figure"

type Point = { x: number; z: number }

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

function useCanvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 128, repeat?: [number, number]) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (ctx) draw(ctx, size)
    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    if (repeat) {
      created.wrapS = RepeatWrapping
      created.wrapT = RepeatWrapping
      created.repeat.set(repeat[0], repeat[1])
    }
    created.anisotropy = 8
    return created
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, repeat?.[0], repeat?.[1]])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function Bench({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.6, 0.07, 0.45]} />
        <meshStandardMaterial color="#a5743f" />
      </mesh>
      <mesh position={[0, 0.72, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.36, 0.06]} />
        <meshStandardMaterial color="#a5743f" />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.07, 0.44, 0.42]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
    </group>
  )
}

function Planter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.6, 1.6]} />
        <meshStandardMaterial color="#d6c7a8" />
      </mesh>
      <mesh position={[0, 0.61, 0]}>
        <boxGeometry args={[1.45, 0.04, 1.45]} />
        <meshStandardMaterial color="#6b8e3d" />
      </mesh>
      <Tree position={[0, 0.6, 0]} scale={0.9} />
    </group>
  )
}

const HOPSCOTCH: { n: number; dx: number; dz: number }[] = [
  { n: 1, dx: 0, dz: 0 },
  { n: 2, dx: 0, dz: -0.85 },
  { n: 3, dx: -0.43, dz: -1.7 },
  { n: 4, dx: 0.43, dz: -1.7 },
  { n: 5, dx: 0, dz: -2.55 },
  { n: 6, dx: -0.43, dz: -3.4 },
  { n: 7, dx: 0.43, dz: -3.4 },
  { n: 8, dx: 0, dz: -4.25 },
]

function numberTexture(n: number) {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, 64, 64)
    ctx.clearRect(5, 5, 54, 54)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 36px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(String(n), 32, 34)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

// Chalk hopscotch: squares light up as the walking owl hops onto them.
function Hopscotch({ origin, walkerRef, walking }: { origin: Point; walkerRef: RefObject<Point>; walking: boolean }) {
  const squares = useMemo(
    () =>
      HOPSCOTCH.map((square) => ({
        ...square,
        texture: numberTexture(square.n),
        fill: new MeshStandardMaterial({ color: "#f472b6", transparent: true, opacity: 0.2 }),
      })),
    []
  )
  useEffect(
    () => () =>
      squares.forEach((square) => {
        square.texture.dispose()
        square.fill.dispose()
      }),
    [squares]
  )

  useFrame(() => {
    const walker = walkerRef.current
    squares.forEach((square) => {
      const inside =
        walking &&
        Math.abs(walker.x - (origin.x + square.dx)) < 0.4 &&
        Math.abs(walker.z - (origin.z + square.dz)) < 0.4
      square.fill.opacity = inside ? 0.85 : 0.2
      square.fill.color.set(inside ? "#facc15" : "#f472b6")
    })
  })

  return (
    <group position={[origin.x, 0.03, origin.z]}>
      {squares.map((square) => (
        <group key={square.n} position={[square.dx, 0, square.dz]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh material={square.fill}>
            <planeGeometry args={[0.8, 0.8]} />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial map={square.texture} transparent />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Beach ball the walking owl can kick around the plaza.
function PlayBall({ bounds, walkerRef, walking }: { bounds: { minX: number; maxX: number; minZ: number; maxZ: number }; walkerRef: RefObject<Point>; walking: boolean }) {
  const ball = useRef<Mesh>(null)
  const position = useRef({ x: (bounds.minX + bounds.maxX) / 2 + 2.5, z: (bounds.minZ + bounds.maxZ) / 2 + 1 })
  const velocity = useRef({ x: 0, z: 0 })
  const lastWalker = useRef<Point | null>(null)
  const texture = useCanvasTexture((ctx, size) => {
    const colors = ["#ef4444", "#ffffff", "#3b82f6", "#ffffff", "#facc15", "#ffffff"]
    colors.forEach((color, index) => {
      ctx.fillStyle = color
      ctx.fillRect((index * size) / colors.length, 0, size / colors.length + 1, size)
    })
  })

  useFrame((_, delta) => {
    const node = ball.current
    if (!node) return
    const dt = Math.min(delta, 0.05)
    const p = position.current
    const v = velocity.current
    const walker = walkerRef.current
    const previous = lastWalker.current
    lastWalker.current = { ...walker }

    if (walking) {
      const dx = p.x - walker.x
      const dz = p.z - walker.z
      const distance = Math.hypot(dx, dz)
      if (distance < 0.75) {
        const walkerSpeed = previous ? Math.hypot(walker.x - previous.x, walker.z - previous.z) / Math.max(dt, 1e-3) : 0
        const kick = 3 + Math.min(walkerSpeed, 6) * 0.9
        v.x = (dx / (distance || 1)) * kick
        v.z = (dz / (distance || 1)) * kick
        p.x = walker.x + (dx / (distance || 1)) * 0.76
        p.z = walker.z + (dz / (distance || 1)) * 0.76
      }
    }

    const friction = Math.exp(-1.4 * dt)
    v.x *= friction
    v.z *= friction
    p.x += v.x * dt
    p.z += v.z * dt
    if (p.x < bounds.minX || p.x > bounds.maxX) {
      p.x = Math.min(Math.max(p.x, bounds.minX), bounds.maxX)
      v.x *= -0.7
    }
    if (p.z < bounds.minZ || p.z > bounds.maxZ) {
      p.z = Math.min(Math.max(p.z, bounds.minZ), bounds.maxZ)
      v.z *= -0.7
    }

    node.position.set(p.x, 0.3, p.z)
    node.rotation.x += (v.z * dt) / 0.3
    node.rotation.z -= (v.x * dt) / 0.3
  })

  return (
    <mesh ref={ball} castShadow>
      <sphereGeometry args={[0.3, 24, 16]} />
      <meshStandardMaterial map={texture} roughness={0.4} />
    </mesh>
  )
}

export function Plaza({
  layout,
  walkerRef,
  walking,
  lamps,
}: {
  layout: CityLayout
  walkerRef: RefObject<Point>
  walking: boolean
  lamps: number
}) {
  const { plaza } = layout
  const stone = useCanvasTexture(
    (ctx, size) => {
      ctx.fillStyle = "#e9dcc3"
      ctx.fillRect(0, 0, size, size)
      const tones = ["#e2d2b4", "#efe3cc", "#dccaa8"]
      for (let row = 0; row < 4; row += 1) {
        for (let column = 0; column < 4; column += 1) {
          ctx.fillStyle = tones[(row * 3 + column) % tones.length]
          ctx.fillRect(column * 32 + (row % 2) * 16 + 2, row * 32 + 2, 28, 28)
        }
      }
    },
    128,
    [plaza.w / 2, plaza.d / 2]
  )
  const left = plaza.x - plaza.w / 2
  const right = plaza.x + plaza.w / 2
  const top = plaza.z - plaza.d / 2
  const bottom = plaza.z + plaza.d / 2

  return (
    <group>
      <mesh position={[plaza.x, 0.016, plaza.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[plaza.w, plaza.d]} />
        <meshStandardMaterial map={stone} />
      </mesh>

      {[
        [left + 1.3, top + 1.3],
        [right - 1.3, top + 1.3],
        [left + 1.3, bottom - 1.3],
        [right - 1.3, bottom - 1.3],
      ].map(([x, z]) => (
        <Planter key={`${x}-${z}`} position={[x, 0, z]} />
      ))}

      {[-3, 0, 3].map((dx) => (
        <Bench key={`n-${dx}`} position={[plaza.x + dx, 0, top + 0.6]} rotation={0} />
      ))}
      {[-3, 3].map((dx) => (
        <Bench key={`s-${dx}`} position={[plaza.x + dx, 0, bottom - 0.6]} rotation={Math.PI} />
      ))}
      <Bench position={[right - 0.6, 0, plaza.z]} rotation={-Math.PI / 2} />

      {[
        [left + 3.2, top + 0.4],
        [right - 3.2, bottom - 0.4],
        [left + 0.4, plaza.z],
      ].map(([x, z]) => (
        <StreetLamp key={`${x}-${z}`} position={[x, 0, z]} glow={lamps} />
      ))}

      <Hopscotch origin={{ x: left + 3, z: bottom - 2.2 }} walkerRef={walkerRef} walking={walking} />
      <PlayBall
        bounds={{ minX: left + 0.5, maxX: right - 0.5, minZ: top + 0.5, maxZ: bottom - 0.5 }}
        walkerRef={walkerRef}
        walking={walking}
      />

      <Html position={[plaza.x, 0.2, top + 1.6]} center zIndexRange={[6, 0]} style={{ pointerEvents: "none" }}>
        <span className="whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
          Owlio Plaza
        </span>
      </Html>
    </group>
  )
}

const JETS = 8

// Roundabout island with a fountain and the Owlio owl standing on top as a statue.
export function OwlioFountain({ layout, lamps }: { layout: CityLayout; lamps: number }) {
  const { roundabout } = layout
  const drops = useRef<(Group | null)[]>([])
  const laneRadius = roundabout.island + (roundabout.ring - roundabout.island) / 2

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const time = clock.elapsedTime
    drops.current.forEach((drop, index) => {
      if (!drop) return
      const t = (time * 0.8 + index / JETS) % 1
      const angle = (index / JETS) * Math.PI * 2
      const radius = 0.25 + t * 0.95
      drop.position.set(Math.cos(angle) * radius, 1.25 + Math.sin(t * Math.PI) * 0.9, Math.sin(angle) * radius)
    })
  })

  return (
    <group position={[roundabout.x, 0, roundabout.z]}>
      <mesh position={[0, 0.024, 0]} receiveShadow>
        <cylinderGeometry args={[roundabout.ring, roundabout.ring, 0.01, 64]} />
        <meshStandardMaterial color="#5d6878" />
      </mesh>
      {Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * laneRadius, 0.032, Math.sin(angle) * laneRadius]}
            rotation={[-Math.PI / 2, 0, -angle]}
          >
            <planeGeometry args={[0.14, 0.45]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        )
      })}

      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[roundabout.island, roundabout.island + 0.05, 0.24, 48]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh position={[0, 0.245, 0]}>
        <cylinderGeometry args={[roundabout.island - 0.15, roundabout.island - 0.15, 0.02, 48]} />
        <meshStandardMaterial color="#7cc46a" />
      </mesh>
      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 1.85, 0.36, Math.sin(angle) * 1.85]}>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color={["#f472b6", "#facc15", "#fb923c", "#a78bfa"][index % 4]} />
          </mesh>
        )
      })}

      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.45, 1.55, 0.5, 40]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.06, 40]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.2 + lamps * 0.5} transparent opacity={0.85} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.42, 0.7, 20]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.55, 0.45, 0.08, 24]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <group position={[0, 1.46, 0]} rotation={[0, Math.PI / 4, 0]} scale={1.1}>
        <CharacterFigure bodyColor="#d4a72c" accentColor="#b4831a" skinColor="#f5deb3" getMode={() => "idle"} reducedMotion />
      </group>
      {Array.from({ length: JETS }, (_, index) => (
        <group
          key={index}
          ref={(node) => {
            drops.current[index] = node
          }}
        >
          <mesh>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#bfdbfe" emissive="#93c5fd" emissiveIntensity={0.3 + lamps * 0.6} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}

      <Html position={[0, 3.6, 0]} center zIndexRange={[6, 0]} style={{ pointerEvents: "none" }}>
        <span className="whitespace-nowrap rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
          Owlio Fountain
        </span>
      </Html>
    </group>
  )
}
```

### `city-traffic.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/city-traffic.tsx`

```tsx
import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshStandardMaterial, type Group } from "three"
import { ROAD, type CityLayout } from "./city-layout"
import {
  buildLoop,
  cityLoops,
  pointAt,
  signalFor,
  signalizedIntersections,
  type Axis,
  type Signal,
  type TrafficPath,
} from "./traffic-paths"

type VehicleKind = "sedan" | "taxi" | "bus" | "van"

type VehicleSpec = { kind: VehicleKind; color: string; path: number; start: number }

const VEHICLES: VehicleSpec[] = [
  { kind: "bus", color: "#2f6fe4", path: 0, start: 0.1 },
  { kind: "sedan", color: "#ef4444", path: 1, start: 0.3 },
  { kind: "taxi", color: "#facc15", path: 2, start: 0.55 },
  { kind: "sedan", color: "#f8fafc", path: 3, start: 0.2 },
  { kind: "van", color: "#10b981", path: 4, start: 0.4 },
  { kind: "sedan", color: "#1e293b", path: 5, start: 0.7 },
  { kind: "sedan", color: "#a855f7", path: 0, start: 0.6 },
  { kind: "taxi", color: "#facc15", path: 1, start: 0.85 },
]

const SPEED: Record<VehicleKind, number> = { sedan: 5.2, taxi: 5.6, bus: 3.8, van: 4.6 }
const LENGTH: Record<VehicleKind, number> = { sedan: 1.9, taxi: 1.9, bus: 3.4, van: 2.2 }

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

function Wheels({ length }: { length: number }) {
  const x = 0.42
  const z = length / 2 - 0.38
  return (
    <>
      {[
        [-x, -z],
        [x, -z],
        [-x, z],
        [x, z],
      ].map(([wx, wz]) => (
        <mesh key={`${wx}-${wz}`} position={[wx, 0.18, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.14, 14]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
    </>
  )
}

// Headlights and tail lights glow from evening onward, and the headlights light the road ahead.
function Lights({ length, lamps }: { length: number; lamps: number }) {
  return (
    <>
      {[-0.28, 0.28].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.42, length / 2 + 0.005]}>
            <boxGeometry args={[0.18, 0.1, 0.02]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fef08a" emissiveIntensity={0.3 + lamps * 3} toneMapped={false} />
          </mesh>
          <mesh position={[x, 0.42, -length / 2 - 0.005]}>
            <boxGeometry args={[0.18, 0.08, 0.02]} />
            <meshStandardMaterial color="#b91c1c" emissive="#ef4444" emissiveIntensity={0.3 + lamps * 2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {lamps > 0 ? <pointLight position={[0, 0.5, length / 2 + 1.1]} intensity={3 * lamps} distance={5} color="#fef3c7" /> : null}
    </>
  )
}

function Vehicle({ spec, lamps }: { spec: VehicleSpec; lamps: number }) {
  const length = LENGTH[spec.kind]
  const glass = (
    <meshStandardMaterial color="#9cc7ea" emissive="#bfdbfe" emissiveIntensity={lamps * 0.4} roughness={0.15} metalness={0.2} />
  )

  if (spec.kind === "bus") {
    return (
      <group>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[1.05, 1.1, length]} />
          <meshStandardMaterial color={spec.color} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[1.07, 0.38, length - 0.4]} />
          {glass}
        </mesh>
        <mesh position={[0, 1.32, 0]}>
          <boxGeometry args={[0.95, 0.04, length - 0.3]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.07, 0.1, length - 0.2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <Wheels length={length} />
        <Lights length={length} lamps={lamps} />
      </group>
    )
  }

  const cabinLength = spec.kind === "van" ? length - 0.5 : length * 0.52
  const cabinZ = spec.kind === "van" ? -0.15 : -0.08
  return (
    <group>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.95, 0.38, length]} />
        <meshStandardMaterial color={spec.color} roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.72, cabinZ]} castShadow>
        <boxGeometry args={[0.85, 0.34, cabinLength]} />
        <meshStandardMaterial color={spec.color} roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.73, cabinZ]}>
        <boxGeometry args={[0.87, 0.24, cabinLength - 0.12]} />
        {glass}
      </mesh>
      {spec.kind === "taxi" ? (
        <mesh position={[0, 0.95, cabinZ]}>
          <boxGeometry args={[0.36, 0.12, 0.2]} />
          <meshStandardMaterial color="#111827" emissive="#facc15" emissiveIntensity={0.4 + lamps} />
        </mesh>
      ) : null}
      <Wheels length={length} />
      <Lights length={length} lamps={lamps} />
    </group>
  )
}

// Cars loop the streets, follow the roundabout, stop at red and yellow lights, and keep a gap.
export function Traffic({ layout, lamps }: { layout: CityLayout; lamps: number }) {
  const intersections = useMemo(() => signalizedIntersections(layout), [layout])
  const paths = useMemo<TrafficPath[]>(
    () => cityLoops(layout).map((corners) => buildLoop(layout, corners, intersections)),
    [layout, intersections]
  )
  const groups = useRef<(Group | null)[]>([])
  const state = useRef<{ s: number; v: number }[]>([])

  useEffect(() => {
    state.current = VEHICLES.map((spec) => ({ s: spec.start * paths[spec.path % paths.length].total, v: 0 }))
  }, [paths])

  useFrame(({ clock }, delta) => {
    if (state.current.length !== VEHICLES.length) return
    const dt = reducedMotion ? Math.min(delta, 0.05) * 0.6 : Math.min(delta, 0.05)
    const time = clock.elapsedTime
    const poses = VEHICLES.map((spec, index) => pointAt(paths[spec.path % paths.length], state.current[index].s))

    VEHICLES.forEach((spec, index) => {
      const path = paths[spec.path % paths.length]
      const car = state.current[index]
      const pose = poses[index]
      let target = SPEED[spec.kind]

      for (const stop of path.stops) {
        const ahead = (stop.s - car.s + path.total) % path.total
        if (ahead <= 0.05 || ahead > 8) continue
        const signal = signalFor(stop.axis, time, stop.intersection.group)
        if (signal === "red" || (signal === "yellow" && ahead > 1.8)) target = Math.min(target, Math.max(0, (ahead - 0.15) * 1.4))
      }

      const fx = Math.sin(pose.heading)
      const fz = Math.cos(pose.heading)
      VEHICLES.forEach((other, otherIndex) => {
        if (otherIndex === index) return
        const p = poses[otherIndex]
        const dx = p.x - pose.x
        const dz = p.z - pose.z
        const along = dx * fx + dz * fz
        const lateral = Math.abs(dx * fz - dz * fx)
        const sameWay = Math.cos(p.heading - pose.heading) > 0.3
        const gap = (LENGTH[spec.kind] + LENGTH[other.kind]) / 2 + 0.9
        if (along > 0 && along < gap + 3 && lateral < 0.9 && sameWay) target = Math.min(target, Math.max(0, (along - gap) * 2))
      })

      const change = target - car.v
      car.v += Math.max(Math.min(change, 3.5 * dt), -9 * dt)
      car.s = (car.s + car.v * dt) % path.total

      const node = groups.current[index]
      if (node) {
        node.position.set(pose.x, 0, pose.z)
        node.rotation.y = pose.heading
      }
    })
  })

  return (
    <group>
      {VEHICLES.map((spec, index) => (
        <group
          key={index}
          ref={(node) => {
            groups.current[index] = node
          }}
        >
          <Vehicle spec={spec} lamps={lamps} />
        </group>
      ))}
    </group>
  )
}

type LightMaterials = Record<Axis, Record<Signal | "walk" | "dontWalk", MeshStandardMaterial>>

const SIGNAL_COLORS: Record<Signal | "walk" | "dontWalk", string> = {
  red: "#ef4444",
  yellow: "#facc15",
  green: "#22c55e",
  walk: "#f8fafc",
  dontWalk: "#f97316",
}

function createMaterials(): LightMaterials {
  const make = (key: Signal | "walk" | "dontWalk") =>
    new MeshStandardMaterial({ color: SIGNAL_COLORS[key], emissive: SIGNAL_COLORS[key], emissiveIntensity: 0 })
  const set = () => ({ red: make("red"), yellow: make("yellow"), green: make("green"), walk: make("walk"), dontWalk: make("dontWalk") })
  return { ns: set(), ew: set() }
}

function SignalHead({ materials, rotation }: { materials: LightMaterials[Axis]; rotation: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.26, 0.72, 0.2]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {(["red", "yellow", "green"] as const).map((color, index) => (
        <mesh key={color} position={[0, 0.22 - index * 0.22, 0.105]} material={materials[color]}>
          <sphereGeometry args={[0.075, 12, 8]} />
        </mesh>
      ))}
    </group>
  )
}

// Two signal poles per intersection, with car lights for each road and pedestrian walk lights.
export function TrafficSignals({ layout }: { layout: CityLayout }) {
  const intersections = useMemo(() => signalizedIntersections(layout), [layout])
  const groupMaterials = useMemo<[LightMaterials, LightMaterials]>(() => [createMaterials(), createMaterials()], [])

  useEffect(
    () => () =>
      groupMaterials.forEach((group) =>
        (["ns", "ew"] as const).forEach((axis) => Object.values(group[axis]).forEach((material) => material.dispose()))
      ),
    [groupMaterials]
  )

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    groupMaterials.forEach((group, groupIndex) => {
      ;(["ns", "ew"] as const).forEach((axis) => {
        const signal = signalFor(axis, time, groupIndex as 0 | 1)
        const crossing = signalFor(axis === "ns" ? "ew" : "ns", time, groupIndex as 0 | 1)
        ;(["red", "yellow", "green"] as const).forEach((color) => {
          group[axis][color].emissiveIntensity = signal === color ? 2.2 : 0
          group[axis][color].color.set(signal === color ? SIGNAL_COLORS[color] : "#374151")
        })
        // People crossing this road may walk while its traffic has a red light.
        const walk = crossing !== "red" && signal === "red"
        group[axis].walk.emissiveIntensity = walk ? 2 : 0
        group[axis].walk.color.set(walk ? SIGNAL_COLORS.walk : "#374151")
        group[axis].dontWalk.emissiveIntensity = walk ? 0 : 1.6
        group[axis].dontWalk.color.set(walk ? "#374151" : SIGNAL_COLORS.dontWalk)
      })
    })
  })

  const offset = ROAD / 2 + 0.45

  return (
    <group>
      {intersections.map((intersection) => {
        const materials = groupMaterials[intersection.group]
        return (
          <group key={intersection.id} position={[intersection.x, 0, intersection.z]}>
            {[
              [1, 1],
              [-1, -1],
            ].map(([sx, sz]) => (
              <group key={`${sx}-${sz}`} position={[sx * offset, 0, sz * offset]}>
                <mesh position={[0, 1.4, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.07, 2.8, 8]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
                <group position={[0, 2.55, 0]}>
                  <SignalHead materials={materials.ns} rotation={sz > 0 ? 0 : Math.PI} />
                </group>
                <group position={[0, 1.85, 0]}>
                  <SignalHead materials={materials.ew} rotation={sx > 0 ? Math.PI / 2 : -Math.PI / 2} />
                </group>
                <group position={[0, 1.1, 0]} rotation={[0, sx > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
                  <mesh>
                    <boxGeometry args={[0.22, 0.34, 0.14]} />
                    <meshStandardMaterial color="#1f2937" />
                  </mesh>
                  <mesh position={[0, 0.07, 0.075]} material={materials.ns.walk}>
                    <boxGeometry args={[0.12, 0.1, 0.01]} />
                  </mesh>
                  <mesh position={[0, -0.07, 0.075]} material={materials.ns.dontWalk}>
                    <boxGeometry args={[0.12, 0.1, 0.01]} />
                  </mesh>
                </group>
              </group>
            ))}
            {(["ns", "ew"] as const).flatMap((axis) =>
              [-1, 1].map((side) => {
                const along = ROAD / 2 + 1.75
                const lane = (ROAD - 1.2) / 4
                const position: [number, number, number] =
                  axis === "ew"
                    ? [side * along, 0.032, -side * lane]
                    : [side * lane, 0.032, side * along]
                return (
                  <mesh key={`${axis}-${side}`} position={position} rotation={[-Math.PI / 2, 0, axis === "ew" ? Math.PI / 2 : 0]}>
                    <planeGeometry args={[(ROAD - 1.2) / 2 - 0.1, 0.18]} />
                    <meshStandardMaterial color="#f8fafc" />
                  </mesh>
                )
              })
            )}
          </group>
        )
      })}
    </group>
  )
}
```

### `create-space-dialog.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/create-space-dialog.tsx`

```tsx
import { useState } from "react"
import { Check, Minus, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  defaultSpaceCapacity,
  maxSpaceCapacity,
  minSpaceCapacity,
  studySpaceKinds,
  type StudySpaceKind,
} from "./study-spaces-records"
import { RoomPlanPreview } from "./room-plan-preview"

export type SpaceDraft = {
  name: string
  about: string
  kind: StudySpaceKind
  capacity: number
}

type CreateSpaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: SpaceDraft) => void
}

export function CreateSpaceDialog({ open, onOpenChange, onSubmit }: CreateSpaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <CreateSpaceForm
          key={open ? "create-space-open" : "create-space-closed"}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function CreateSpaceForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (draft: SpaceDraft) => void }) {
  const [draft, setDraft] = useState<SpaceDraft>({
    name: "",
    about: "",
    kind: "collaborative",
    capacity: defaultSpaceCapacity,
  })
  const [nameError, setNameError] = useState<string | null>(null)
  const [capacityError, setCapacityError] = useState<string | null>(null)

  function handleSubmit() {
    const nextNameError = draft.name.trim().length < 3 ? "Add a space name of at least 3 characters." : null
    const nextCapacityError =
      !Number.isInteger(draft.capacity) || draft.capacity < minSpaceCapacity || draft.capacity > maxSpaceCapacity
        ? `Choose between ${minSpaceCapacity} and ${maxSpaceCapacity} seats.`
        : null

    setNameError(nextNameError)
    setCapacityError(nextCapacityError)
    if (nextNameError || nextCapacityError) return

    onSubmit({
      name: draft.name.trim(),
      about: draft.about.trim(),
      kind: draft.kind,
      capacity: draft.capacity,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">Create a study space</DialogTitle>
        <DialogDescription className="text-slate-600">
          A study space is for peer collaboration. It is not an official classroom and cannot hold grades or
          attendance.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="space-name" className="text-slate-700">
            Space name
          </FieldLabel>
          <Input
            id="space-name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "space-name-error" : undefined}
            placeholder="Physics Group"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="space-name-error">{nameError}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="space-about" className="text-slate-700">
            What is it about?
          </FieldLabel>
          <Textarea
            id="space-about"
            rows={3}
            value={draft.about}
            onChange={(event) => setDraft((current) => ({ ...current, about: event.target.value }))}
            placeholder="Weekly problem sets and past paper review."
            className="border-slate-200 bg-slate-50"
          />
        </Field>

        <div role="radiogroup" aria-label="Room type" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Room type</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {studySpaceKinds.map((kind) => {
              const selected = draft.kind === kind.value
              return (
                <button
                  key={kind.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDraft((current) => ({ ...current, kind: kind.value }))}
                  className={`rounded-xl border p-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                    selected
                      ? "border-emerald-700 bg-emerald-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="relative block overflow-hidden rounded-lg border border-slate-200">
                    <RoomPlanPreview
                      kind={kind.value}
                      capacity={maxSpaceCapacity}
                      className="h-24 w-full"
                    />
                    {selected ? (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-slate-900">{kind.label}</span>
                  <span className="mt-0.5 block text-xs leading-4 text-slate-600">{kind.description}</span>
                  <span className="mt-1 block text-[11px] text-slate-500">
                    Up to {maxSpaceCapacity} seats
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <Field data-invalid={capacityError !== null}>
          <span id="space-capacity-label" className="text-sm font-medium text-slate-700">
            Seats in the room
          </span>
          <div className="flex items-center gap-3">
            <div
              role="group"
              aria-labelledby="space-capacity-label"
              aria-describedby="space-capacity-hint space-capacity-error"
              className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Decrease seats"
                disabled={draft.capacity <= minSpaceCapacity}
                onClick={() =>
                  setDraft((current) => ({ ...current, capacity: current.capacity - 1 }))
                }
              >
                <Minus aria-hidden="true" />
              </Button>
              <output
                aria-live="polite"
                className="w-16 text-center text-sm font-medium tabular-nums text-slate-800"
              >
                {draft.capacity} seats
              </output>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Increase seats"
                disabled={draft.capacity >= maxSpaceCapacity}
                onClick={() =>
                  setDraft((current) => ({ ...current, capacity: current.capacity + 1 }))
                }
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
            <p id="space-capacity-hint" className="flex-1 text-xs leading-5 text-slate-500">
              {minSpaceCapacity}–{maxSpaceCapacity} seats. The plan below shows the layout you will get.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <RoomPlanPreview kind={draft.kind} capacity={draft.capacity} className="h-36 w-full" />
          </div>
          <FieldError id="space-capacity-error">{capacityError}</FieldError>
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="bg-emerald-800 text-white hover:bg-emerald-700" onClick={handleSubmit}>
          <Users aria-hidden="true" />
          Create space
        </Button>
      </DialogFooter>
    </>
  )
}

```

### `join-space-dialog.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/join-space-dialog.tsx`

```tsx
import { useState } from "react"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { studySpacesJoinHint } from "./study-spaces-records"

export type JoinSpaceDraft = {
  name: string
  inviteCode: string
}

type JoinSpaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: JoinSpaceDraft) => void
  previewName?: string | null
}

export function JoinSpaceDialog({ open, onOpenChange, onSubmit, previewName }: JoinSpaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <JoinSpaceForm
          key={open ? "join-space-open" : "join-space-closed"}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
          previewName={previewName ?? null}
        />
      </DialogContent>
    </Dialog>
  )
}

function JoinSpaceForm({
  onCancel,
  onSubmit,
  previewName,
}: {
  onCancel: () => void
  onSubmit: (draft: JoinSpaceDraft) => void
  previewName: string | null
}) {
  const isPreview = previewName !== null
  const [draft, setDraft] = useState<JoinSpaceDraft>({ name: previewName ?? "", inviteCode: "" })
  const [nameError, setNameError] = useState<string | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)

  function handleSubmit() {
    const nextNameError = draft.name.trim().length < 3 ? "Add a space name of at least 3 characters." : null
    const nextCodeError =
      isPreview && draft.inviteCode.trim().length === 0
        ? "Enter a space code to unlock this preview space."
        : null

    setNameError(nextNameError)
    setCodeError(nextCodeError)
    if (nextNameError || nextCodeError) return

    onSubmit({ name: draft.name.trim(), inviteCode: draft.inviteCode.trim() })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {isPreview ? "Enter this space's code" : "Join a study space"}
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          {isPreview
            ? `"${previewName}" is a sample preview space. Unlocking it only adds it to this browser. `
            : ""}
          A study space is for peer collaboration. It is not an official classroom and cannot hold grades or
          attendance.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="join-space-name" className="text-slate-700">
            Space name
          </FieldLabel>
          <Input
            id="join-space-name"
            value={draft.name}
            readOnly={isPreview}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "join-space-name-error" : undefined}
            placeholder="History Circle"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="join-space-name-error">{nameError}</FieldError>
        </Field>

        <Field data-invalid={codeError !== null}>
          <FieldLabel htmlFor="join-space-code" className="text-slate-700">
            Invite code or link
          </FieldLabel>
          <Input
            id="join-space-code"
            value={draft.inviteCode}
            onChange={(event) => setDraft((current) => ({ ...current, inviteCode: event.target.value }))}
            aria-invalid={codeError !== null}
            aria-describedby={codeError ? "join-space-code-hint join-space-code-error" : "join-space-code-hint"}
            placeholder="PHY-4821"
            className="border-slate-200 bg-slate-50"
          />
          <p id="join-space-code-hint" className="text-xs leading-5 text-slate-500">
            {studySpacesJoinHint}
          </p>
          <FieldError id="join-space-code-error">{codeError}</FieldError>
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSubmit}>
          <LogIn aria-hidden="true" />
          {isPreview ? "Unlock space" : "Join space"}
        </Button>
      </DialogFooter>
    </>
  )
}
```

### `room-plan-preview.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/room-plan-preview.tsx`

```tsx
import {
  buildRoomSpots,
  buildSeats,
  discussionTable,
  napArea,
  roomPlan,
  watchRoom,
  type SeatDef,
} from "./detail/study-space-seats"
import type { StudySpaceKind } from "./study-spaces-records"

type RoomPlanPreviewProps = {
  kind: StudySpaceKind
  capacity: number
  className?: string
}

const spots = buildRoomSpots()

// Top-down floor plan rendered from the same coordinates the 3D room uses,
// so the preview honestly shows the layout the student will enter.
export function RoomPlanPreview({ kind, capacity, className }: RoomPlanPreviewProps) {
  const seats = buildSeats(kind, Math.min(Math.max(capacity, 0), 8))
  const { halfWidth: w, halfDepth: d } = roomPlan
  const shape = discussionTable.shape[kind]
  const { x: tx, z: tz } = discussionTable

  return (
    <svg viewBox={`${-w} ${-d} ${w * 2} ${d * 2}`} aria-hidden="true" role="presentation" className={className}>
      <rect x={-w} y={-d} width={w * 2} height={d * 2} rx={0.4} fill="#fbf3e2" stroke="#2f6fe4" strokeWidth={0.25} />
      <rect
        x={napArea.minX}
        y={napArea.minZ}
        width={napArea.maxX - napArea.minX}
        height={napArea.maxZ - napArea.minZ}
        fill="#ece4f8"
      />
      <rect
        x={watchRoom.minX}
        y={watchRoom.minZ}
        width={watchRoom.maxX - watchRoom.minX}
        height={watchRoom.maxZ - watchRoom.minZ}
        fill="#dde6f6"
      />
      <rect x={watchRoom.maxX - 0.5} y={watchRoom.screenZ - 2} width={0.3} height={4} fill="#1e293b" />
      <rect x={-2.6} y={4.85} width={4.6} height={2.3} rx={0.3} fill="#a7d796" />
      <rect x={-w + 0.1} y={0.8} width={0.6} height={3.6} fill="#94a3b8" />

      {shape === "rect" ? (
        <rect
          x={tx - discussionTable.rect.w / 2}
          y={tz - discussionTable.rect.d / 2}
          width={discussionTable.rect.w}
          height={discussionTable.rect.d}
          rx={0.15}
          fill="#a5854f"
        />
      ) : shape === "oval" ? (
        <ellipse cx={tx} cy={tz} rx={discussionTable.oval.rx} ry={discussionTable.oval.rz} fill="#a5854f" />
      ) : (
        <circle cx={tx} cy={tz} r={discussionTable.round.r} fill="#a5854f" />
      )}

      {[...seats, ...spots].map((seat) => (
        <SeatPlanMarker key={seat.id} seat={seat} />
      ))}
    </svg>
  )
}

function SeatPlanMarker({ seat }: { seat: SeatDef }) {
  const { x, z } = seat.anchor
  if (seat.furniture === "mat") return <rect x={x - 0.45} y={z - 0.95} width={0.9} height={1.9} rx={0.2} fill="#a78bfa" />
  if (seat.furniture === "sofa") return <rect x={x - 0.4} y={z - 0.55} width={0.8} height={1.1} rx={0.15} fill="#475569" />
  if (seat.furniture === "armchair") return <circle cx={x} cy={z} r={0.4} fill="#33415c" />
  return <rect x={x - 0.27} y={z - 0.27} width={0.54} height={0.54} rx={0.12} fill="#33415c" />
}
```

### `space-card-grid.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/space-card-grid.tsx`

```tsx
import { useState } from "react"
import { Link } from "react-router"
import { Lock, MoreVertical, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoomPlanPreview } from "./room-plan-preview"
import { kindLabel, metaLine } from "./space-format"
import { studySpacesLockedTooltip, type StudySpaceRecord } from "./study-spaces-records"

export function SpaceActionsMenu({
  space,
  onRemove,
  className,
}: {
  space: StudySpaceRecord
  onRemove: (space: StudySpaceRecord) => void
  className?: string
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isOwner = space.role === "owner"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`More actions for ${space.name}`}
              className={className ?? "shrink-0 text-slate-500 hover:text-slate-900"}
            />
          }
        >
          <MoreVertical aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden="true" />
            {isOwner ? "Remove from this browser" : "Leave space"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {isOwner ? "Remove this study space?" : "Leave this study space?"}
            </DialogTitle>
            <DialogDescription>
              {isOwner
                ? `"${space.name}" will be removed from this browser. Study spaces are local previews, so this does not affect other students.`
                : `"${space.name}" will be removed from your joined list in this browser.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onRemove(space)
                setConfirmOpen(false)
              }}
            >
              {isOwner ? "Remove space" : "Leave space"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SpaceCard({
  space,
  onRemove,
}: {
  space: StudySpaceRecord
  onRemove: (space: StudySpaceRecord) => void
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300">
      <div className="flex gap-3 p-3">
        <div className="w-24 shrink-0 self-start overflow-hidden rounded-lg border border-slate-100">
          <RoomPlanPreview kind={space.kind} capacity={space.capacity} className="block h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
            {space.name}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            {kindLabel(space.kind)} · {space.capacity} seats
          </p>
          <p className="mt-1 text-xs leading-4 text-slate-500">
            {metaLine(space)} · browser only
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 p-2">
        <Link
          to={`/students/study-spaces/${space.id}`}
          aria-label={`Open ${space.name}`}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-md bg-blue-50 text-sm font-medium text-blue-700 outline-none transition-colors hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Open room
        </Link>
        <SpaceActionsMenu space={space} onRemove={onRemove} />
      </div>
    </div>
  )
}

function LockedSpaceCard({
  space,
  onUnlock,
}: {
  space: StudySpaceRecord
  onUnlock: (space: StudySpaceRecord) => void
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-dashed border-slate-300 bg-slate-50 shadow-sm">
      <div className="flex gap-3 p-3">
        <div className="w-24 shrink-0 self-start overflow-hidden rounded-lg border border-slate-200 opacity-55 grayscale">
          <RoomPlanPreview kind={space.kind} capacity={space.capacity} className="block h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">{space.name}</h4>
          <p className="mt-0.5 text-xs text-slate-500">
            {kindLabel(space.kind)} · {space.capacity} seats
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs leading-4 text-slate-600">
            <Lock className="size-3 shrink-0" aria-hidden="true" />
            {studySpacesLockedTooltip}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200 p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          aria-label={`${space.name} — locked preview, needs a space code`}
          onClick={() => onUnlock(space)}
        >
          Enter space code
        </Button>
      </div>
    </div>
  )
}

export function SpaceGrid({
  label,
  spaces,
  onRemove,
}: {
  label: string
  spaces: StudySpaceRecord[]
  onRemove: (space: StudySpaceRecord) => void
}) {
  return (
    <ul role="list" aria-label={label} className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {spaces.map((space) => (
        <li key={space.id}>
          <SpaceCard space={space} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  )
}

export function LockedSpaceGrid({
  label,
  spaces,
  onUnlock,
}: {
  label: string
  spaces: StudySpaceRecord[]
  onUnlock: (space: StudySpaceRecord) => void
}) {
  return (
    <ul role="list" aria-label={label} className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {spaces.map((space) => (
        <li key={space.id}>
          <LockedSpaceCard space={space} onUnlock={onUnlock} />
        </li>
      ))}
    </ul>
  )
}

export function SpaceGridEmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Users className="size-4" aria-hidden="true" />
      </span>
      <p className="text-sm leading-5 text-slate-600">{message}</p>
    </div>
  )
}
```

### `space-format.ts`

Current file: `src/components/features/personal-workspace/study-spaces/space-format.ts`

```ts
import { formatDistanceToNow } from "date-fns"
import { studySpaceKinds, type StudySpaceRecord } from "./study-spaces-records"

export function kindLabel(kind: StudySpaceRecord["kind"]): string {
  return studySpaceKinds.find((entry) => entry.value === kind)?.label ?? "Study space"
}

function relativeTime(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return formatDistanceToNow(date, { addSuffix: true })
}

export function metaLine(space: StudySpaceRecord): string {
  const visited = space.lastVisitedAt ? relativeTime(space.lastVisitedAt) : null
  if (visited) return `Last opened ${visited}`
  const created = relativeTime(space.createdAt)
  return created ? `Added ${created}` : "Saved in this browser"
}
```

### `space-map-art.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/space-map-art.tsx`

```tsx
import type { ReactNode } from "react"
import { buildSeats, discussionTable, napArea, roomPlan, watchRoom } from "./detail/study-space-seats"
import { TILE_ART_CX, TILE_ART_CY, TILE_H, TILE_W } from "./space-map-layout"
import type { StudySpaceKind } from "./study-spaces-records"

const HW = 96
const HH = 48
const THICK = 14
const HEIGHT_UNIT = 14
const { halfWidth: PW, halfDepth: PD } = roomPlan

type Pt = [number, number]

function project(x: number, z: number, h = 0): Pt {
  return [
    TILE_ART_CX + HW * (x / (PW * 2) - z / (PD * 2)),
    TILE_ART_CY + HH * (x / (PW * 2) + z / (PD * 2)) - h * HEIGHT_UNIT,
  ]
}

function pts(points: Pt[]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
}

function circle(cx: number, cz: number, r: number, h = 0): Pt[] {
  return Array.from({ length: 20 }, (_, index) => {
    const angle = (index / 20) * Math.PI * 2
    return project(cx + Math.cos(angle) * r, cz + Math.sin(angle) * r, h)
  })
}

type Item = { depth: number; node: ReactNode }

function box(
  key: string,
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  colors: { top: string; left: string; right: string }
): Item {
  return {
    depth: x + w / 2 + z + d / 2,
    node: (
      <g key={key}>
        <polygon
          points={pts([project(x, z + d), project(x + w, z + d), project(x + w, z + d, h), project(x, z + d, h)])}
          fill={colors.left}
        />
        <polygon
          points={pts([project(x + w, z), project(x + w, z + d), project(x + w, z + d, h), project(x + w, z, h)])}
          fill={colors.right}
        />
        <polygon
          points={pts([project(x, z, h), project(x + w, z, h), project(x + w, z + d, h), project(x, z + d, h)])}
          fill={colors.top}
        />
      </g>
    ),
  }
}

function cylinder(key: string, x: number, z: number, r: number, h: number, top: string, side: string): Item {
  const layers = [0, 0.25, 0.5, 0.75]
  return {
    depth: x + z,
    node: (
      <g key={key}>
        {layers.map((layer) => (
          <polygon key={layer} points={pts(circle(x, z, r, h * layer))} fill={side} />
        ))}
        <polygon points={pts(circle(x, z, r, h))} fill={top} />
      </g>
    ),
  }
}

const OAK = { top: "#c4a266", left: "#7d6238", right: "#98793f" }
const NAVY = { top: "#4a5a80", left: "#262f45", right: "#33415c" }

function buildItems(kind: StudySpaceKind, capacity: number): Item[] {
  const items: Item[] = []

  const { x: tx, z: tz } = discussionTable
  const shape = discussionTable.shape[kind]
  if (shape === "rect") {
    const { w, d } = discussionTable.rect
    items.push(box("table", tx - w / 2, tz - d / 2, w, d, 0.5, OAK))
  } else {
    const r = shape === "oval" ? discussionTable.oval.rx * 0.8 : discussionTable.round.r
    items.push(cylinder("table", tx, tz, r, 0.5, "#a5854f", "#6f562f"))
  }

  buildSeats(kind, Math.min(Math.max(capacity, 0), 8)).forEach((seat) => {
    const size = seat.furniture === "armchair" ? 0.8 : 0.6
    items.push(box(`seat-${seat.id}`, seat.anchor.x - size / 2, seat.anchor.z - size / 2, size, size, 0.4, NAVY))
  })

  ;([
    [-9.3, -6.2],
    [3.4, -0.9],
    [2.9, 6.6],
  ] as Pt[]).forEach(([x, z]) => {
    items.push(cylinder(`plant-${x}-${z}`, x, z, 0.5, 0.9, "#3f7d4e", "#2c5a38"))
  })

  return items.sort((a, b) => a.depth - b.depth)
}

type SpaceMapArtProps = {
  kind: StudySpaceKind
  capacity: number
  locked: boolean
  className?: string
}

export function SpaceMapArt({ kind, capacity, locked, className }: SpaceMapArtProps) {
  const top = [project(-PW, -PD), project(PW, -PD), project(PW, PD), project(-PW, PD)]
  const [north, east, south, west] = top
  const thick = (point: Pt): Pt => [point[0], point[1] + THICK]

  return (
    <svg
      viewBox={`0 0 ${TILE_W} ${TILE_H - 40}`}
      width={TILE_W}
      height={TILE_H - 40}
      aria-hidden="true"
      focusable="false"
      className={className}
      data-locked={locked ? "true" : undefined}
    >
      <ellipse cx={TILE_ART_CX} cy={TILE_ART_CY + THICK + 10} rx={HW + 8} ry={HH * 0.55} fill="#33415c" opacity={0.12} />
      <polygon points={pts([west, south, thick(south), thick(west)])} fill="#262f45" />
      <polygon points={pts([south, east, thick(east), thick(south)])} fill="#33415c" />
      <polygon points={pts([north, east, south, west])} fill="#f3ead9" stroke="#a5854f" strokeWidth={3} strokeLinejoin="round" />
      <polygon
        points={pts([project(napArea.minX, napArea.minZ), project(napArea.maxX, napArea.minZ), project(napArea.maxX, napArea.maxZ), project(napArea.minX, napArea.maxZ)])}
        fill="#a78bfa"
        opacity={0.25}
      />
      <polygon
        points={pts([project(watchRoom.minX, watchRoom.minZ), project(watchRoom.maxX, watchRoom.minZ), project(watchRoom.maxX, watchRoom.maxZ), project(watchRoom.minX, watchRoom.maxZ)])}
        fill="#2f6fe4"
        opacity={0.16}
      />
      {buildItems(kind, capacity).map((item) => item.node)}
    </svg>
  )
}
```

### `space-map-layout.ts`

Current file: `src/components/features/personal-workspace/study-spaces/space-map-layout.ts`

```ts
import type { StudySpaceRecord } from "./study-spaces-records"

export type MapRole = "owner" | "member" | "visitor"

export const CELL_W = 300
export const CELL_H = 220
export const COLS = 3
export const TILE_W = 220
export const TILE_H = 228
export const TILE_ART_CX = 110
export const TILE_ART_CY = 110

type Point = { x: number; y: number }

export type MapTile = {
  space: StudySpaceRecord
  role: MapRole
  center: Point
}

export type MapZone = {
  role: MapRole
  label: string
  emptyMessage: string
  tiles: MapTile[]
  rug: Point[]
  labelAt: Point
  center: Point
}

export type MapLayout = {
  zones: MapZone[]
  floor: Point[]
  walkways: { strip: Point[]; line: [Point, Point] }[]
  bounds: { minX: number; minY: number; width: number; height: number }
  focus: Point
}

export function gridToWorld(c: number, r: number): Point {
  return { x: ((c - r) * CELL_W) / 2, y: ((c + r) * CELL_H) / 2 }
}

function quad(c0: number, r0: number, c1: number, r1: number): Point[] {
  return [gridToWorld(c0, r0), gridToWorld(c1, r0), gridToWorld(c1, r1), gridToWorld(c0, r1)]
}

export type MapZoneInput = {
  role: MapRole
  label: string
  emptyMessage: string
  spaces: StudySpaceRecord[]
}

export function layoutMap(inputs: MapZoneInput[]): MapLayout {
  let cursor = 0
  const rowStarts: { row0: number; rows: number }[] = []

  const zones = inputs.map((input): MapZone => {
    const rows = Math.max(1, Math.ceil(input.spaces.length / COLS))
    const row0 = cursor
    cursor += rows + 1
    rowStarts.push({ row0, rows })

    const tiles = input.spaces.map((space, index): MapTile => {
      const row = Math.floor(index / COLS)
      const offset = index % COLS
      const col = row % 2 === 0 ? offset : COLS - 1 - offset
      return { space, role: input.role, center: gridToWorld(col, row0 + row) }
    })

    return {
      role: input.role,
      label: input.label,
      emptyMessage: input.emptyMessage,
      tiles,
      rug: quad(-0.6, row0 - 0.6, COLS - 0.4, row0 + rows - 0.4),
      labelAt: gridToWorld(-0.6, row0 - 0.6),
      center: gridToWorld((COLS - 1) / 2, row0 + (rows - 1) / 2),
    }
  })

  const totalRows = cursor - 1
  const floor = quad(-1.6, -1.6, COLS + 0.6, totalRows + 0.6)

  const walkways = rowStarts.slice(0, -1).map(({ row0, rows }) => {
    const edge = row0 + rows
    return {
      strip: quad(-1.6, edge - 0.4, COLS + 0.6, edge + 0.4),
      line: [gridToWorld(-1.3, edge), gridToWorld(COLS + 0.3, edge)] as [Point, Point],
    }
  })

  const xs = floor.map((point) => point.x)
  const ys = floor.map((point) => point.y)
  const pad = 24
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad

  return {
    zones,
    floor,
    walkways,
    bounds: {
      minX,
      minY,
      width: Math.max(...xs) + pad - minX,
      height: Math.max(...ys) + pad - minY,
    },
    focus: { x: gridToWorld((COLS - 1) / 2, 0).x, y: zones[0].labelAt.y - 30 },
  }
}

export function pointsAttr(points: Point[], origin?: Point): string {
  return points.map((point) => `${point.x - (origin?.x ?? 0)},${point.y - (origin?.y ?? 0)}`).join(" ")
}
```

### `space-map.test.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/space-map.test.tsx`

```tsx
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudySpacesView } from "./study-spaces-view"
import {
  sampleDiscoverySpaces,
  studySpaceJoinedDiscoveryStorageKey,
  studySpacesDiscoveryCaption,
  studySpacesStorageKey,
} from "./study-spaces-records"

vi.setConfig({ testTimeout: 20000 })

afterEach(cleanup)

beforeEach(() => {
  window.localStorage.clear()
})

function renderList() {
  return render(
    <MemoryRouter initialEntries={["/students/study-spaces"]}>
      <Routes>
        <Route path="/students/study-spaces" element={<StudySpacesView />} />
        <Route path="/students/study-spaces/:spaceId" element={<div>study room route</div>} />
      </Routes>
    </MemoryRouter>
  )
}

const lockedLabel = (name: string) => `${name} — locked preview, needs a space code`

describe("study space map", () => {
  it("renders user spaces plus locked discovery tiles with the preview caption", () => {
    renderList()

    expect(screen.getByRole("link", { name: "Open Physics Group" })).toBeTruthy()
    expect(screen.getAllByRole("link", { name: /^Open / })).toHaveLength(5)
    expect(screen.getByRole("button", { name: lockedLabel("Reading Room") })).toBeTruthy()
    expect(screen.getAllByRole("button", { name: /locked preview, needs a space code/ })).toHaveLength(
      sampleDiscoverySpaces.length
    )
    expect(screen.getByText(studySpacesDiscoveryCaption)).toBeTruthy()
    expect(screen.getByText(/3 yours · 2 joined · 6 locked/)).toBeTruthy()
  })

  it("opens the join dialog prefilled for a locked tile and keeps unlocked tiles as room links", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: lockedLabel("Reading Room") }))
    const dialog = screen.getByRole("dialog")
    expect((within(dialog).getByLabelText("Space name") as HTMLInputElement).value).toBe("Reading Room")
    expect(dialog.textContent).toContain("not verified")
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))

    expect(
      screen.getByRole("link", { name: "Open Maths Club" }).getAttribute("href")
    ).toBe("/students/study-spaces/sample-space-maths")
  })

  it("moves a joined discovery space out of the locked wing permanently", async () => {
    const user = userEvent.setup()
    const first = renderList()

    await user.click(screen.getByRole("button", { name: lockedLabel("Reading Room") }))
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Unlock space" }))
    expect(within(dialog).getByText("Enter a space code to unlock this preview space.")).toBeTruthy()

    await user.type(within(dialog).getByLabelText("Invite code or link"), "READ-1")
    await user.click(within(dialog).getByRole("button", { name: "Unlock space" }))

    expect(screen.queryByRole("button", { name: lockedLabel("Reading Room") })).toBeNull()
    expect(screen.getByRole("link", { name: "Open Reading Room" })).toBeTruthy()
    expect(screen.getByText(/3 yours · 3 joined · 5 locked/)).toBeTruthy()

    const records = JSON.parse(window.localStorage.getItem(studySpacesStorageKey) as string) as {
      name: string
      role: string
    }[]
    expect(records.some((record) => record.name === "Reading Room" && record.role === "member")).toBe(true)
    expect(JSON.parse(window.localStorage.getItem(studySpaceJoinedDiscoveryStorageKey) as string)).toEqual([
      "discovery-reading-room",
    ])

    first.unmount()
    renderList()
    expect(screen.queryByRole("button", { name: lockedLabel("Reading Room") })).toBeNull()
    expect(screen.getByRole("link", { name: "Open Reading Room" })).toBeTruthy()
  })

  it("filters spaces by the search box", async () => {
    const user = userEvent.setup()
    renderList()

    await user.type(screen.getByRole("searchbox", { name: "Search study spaces" }), "calc")
    expect(screen.getAllByRole("button", { name: /locked preview/ })).toHaveLength(1)
    expect(screen.queryByRole("link", { name: /Open Physics Group/ })).toBeNull()
  })

  it("lists every space as cards below the map, with locked spaces joinable", async () => {
    const user = userEvent.setup()
    renderList()

    expect(screen.getByRole("list", { name: "Spaces you've created" })).toBeTruthy()
    expect(screen.getByRole("list", { name: "Spaces you've joined" })).toBeTruthy()
    expect(screen.getByRole("list", { name: "Preview spaces (locked)" })).toBeTruthy()

    await user.click(screen.getByRole("button", { name: lockedLabel("Calculus Circle") }))
    expect((within(screen.getByRole("dialog")).getByLabelText("Space name") as HTMLInputElement).value).toBe(
      "Calculus Circle"
    )
  })

  it("defaults to the list without WebGL and switches to the map world view", async () => {
    const user = userEvent.setup()
    renderList()

    expect(screen.getByRole("button", { name: "List" }).getAttribute("aria-pressed")).toBe("true")
    expect(screen.queryByLabelText("Zoom level")).toBeNull()

    await user.click(screen.getByRole("button", { name: "World" }))
    expect(screen.getByRole("button", { name: "World" }).getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByLabelText("Zoom level")).toBeTruthy()
    expect(screen.queryByRole("list", { name: "Spaces you've created" })).toBeNull()
    expect(screen.getByRole("searchbox", { name: "Search study spaces" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Expand study hall to full screen" })).toBeTruthy()
  })

  it("zooms with the zoom buttons", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: "World" }))
    expect(screen.getByLabelText("Zoom level").textContent).toBe("100%")
    await user.click(screen.getByRole("button", { name: "Zoom in" }))
    expect(screen.getByLabelText("Zoom level").textContent).toBe("125%")
    await user.click(screen.getByRole("button", { name: "Zoom out" }))
    await user.click(screen.getByRole("button", { name: "Zoom out" }))
    expect(screen.getByLabelText("Zoom level").textContent).toBe("80%")
  })

  it("orders tiles deterministically by the selected sort", async () => {
    const user = userEvent.setup()
    renderList()

    const names = () =>
      screen
        .getAllByRole("link", { name: /^Open / })
        .map((link) => link.getAttribute("aria-label")?.replace("Open ", ""))

    expect(names().slice(0, 3)).toEqual(["Maths Club", "Essay Writers", "Physics Group"])

    await user.click(screen.getByRole("combobox", { name: "Sort spaces" }))
    await user.click(await screen.findByRole("option", { name: "Name A–Z" }))

    expect(names().slice(0, 3)).toEqual(["Essay Writers", "Maths Club", "Physics Group"])
  })
})
```

### `space-map.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/space-map.tsx`

```tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { Link } from "react-router"
import { Lock, Minus, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { kindLabel, metaLine } from "./space-format"
import { SpaceMapArt } from "./space-map-art"
import {
  layoutMap,
  pointsAttr,
  TILE_ART_CX,
  TILE_ART_CY,
  TILE_H,
  TILE_W,
  type MapRole,
  type MapTile,
} from "./space-map-layout"
import {
  studySpacesLockedTooltip,
  type StudySpaceRecord,
} from "./study-spaces-records"

const MIN_SCALE = 0.35
const MAX_SCALE = 1.8
const ZOOM_STEP = 1.25
const PAN_MARGIN = 80
const DRAG_THRESHOLD = 4

type View = { x: number; y: number; s: number }

type SpaceMapProps = {
  created: StudySpaceRecord[]
  joined: StudySpaceRecord[]
  locked: StudySpaceRecord[]
  onUnlock: (space: StudySpaceRecord) => void
  className?: string
}

const ZONE_STYLE: Record<MapRole, { fill: string; stroke: string; text: string; dash?: string }> = {
  owner: { fill: "#2f6b4f", stroke: "#2f6b4f", text: "#2f6b4f" },
  member: { fill: "#33415c", stroke: "#33415c", text: "#33415c" },
  visitor: { fill: "#64748b", stroke: "#64748b", text: "#475569", dash: "10 8" },
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function tileAriaLabel(tile: MapTile): string {
  return tile.role === "visitor"
    ? `${tile.space.name} — locked preview, needs a space code`
    : `Open ${tile.space.name}`
}

function stateLabel(role: MapRole): string {
  if (role === "owner") return "Yours"
  if (role === "member") return "Joined"
  return "Locked — needs code"
}

export function SpaceMap({ created, joined, locked, onUnlock, className }: SpaceMapProps) {
  const layout = useMemo(
    () =>
      layoutMap([
        {
          role: "owner",
          label: "Your desk row",
          emptyMessage: "No spaces created yet. Use Create space to start one.",
          spaces: created,
        },
        {
          role: "member",
          label: "Shared tables",
          emptyMessage: "No joined spaces yet. Use Join space to add one.",
          spaces: joined,
        },
        {
          role: "visitor",
          label: "Locked wing",
          emptyMessage: "All preview spaces have been unlocked in this browser.",
          spaces: locked,
        },
      ]),
    [created, joined, locked]
  )
  const { bounds } = layout
  const origin = { x: bounds.minX, y: bounds.minY }

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [view, setView] = useState<View>({ x: 0, y: 0, s: 1 })
  const drag = useRef({ pointers: new Map<number, { x: number; y: number }>(), moved: false, pinch: 0 })

  const viewportSize = useCallback(() => {
    const el = viewportRef.current
    return { w: el?.clientWidth ?? 0, h: el?.clientHeight ?? 0 }
  }, [])

  const clampView = useCallback(
    (next: View): View => {
      const { w, h } = viewportSize()
      if (!w || !h) return next
      const range = (viewport: number, content: number) => {
        const a = PAN_MARGIN
        const b = viewport - content - PAN_MARGIN
        return [Math.min(a, b), Math.max(a, b)] as const
      }
      const [minX, maxX] = range(w, bounds.width * next.s)
      const [minY, maxY] = range(h, bounds.height * next.s)
      return { s: next.s, x: clamp(next.x, minX, maxX), y: clamp(next.y, minY, maxY) }
    },
    [bounds.width, bounds.height, viewportSize]
  )

  const fitView = useCallback((): View => {
    const { w } = viewportSize()
    if (!w) return { x: 0, y: 0, s: 1 }
    const s = clamp(w / 1000, 0.5, 0.9)
    return clampView({
      s,
      x: w / 2 - (layout.focus.x - bounds.minX) * s,
      y: 16 - (layout.focus.y - bounds.minY) * s,
    })
  }, [bounds.minX, bounds.minY, clampView, layout.focus.x, layout.focus.y, viewportSize])

  const fitted = useRef(false)
  const attachViewport = useCallback(
    (el: HTMLDivElement | null) => {
      viewportRef.current = el
      if (el && !fitted.current) {
        fitted.current = true
        setView(fitView())
      }
    },
    [fitView]
  )

  const zoomBy = useCallback(
    (factor: number, point?: { x: number; y: number }) => {
      setView((current) => {
        const s = clamp(current.s * factor, MIN_SCALE, MAX_SCALE)
        const size = viewportSize()
        const px = point?.x ?? size.w / 2
        const py = point?.y ?? size.h / 2
        const ratio = s / current.s
        return clampView({ s, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio })
      })
    },
    [clampView, viewportSize]
  )

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const rect = el!.getBoundingClientRect()
      zoomBy(Math.exp(-event.deltaY * 0.0015), { x: event.clientX - rect.left, y: event.clientY - rect.top })
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [zoomBy])

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    drag.current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (drag.current.pointers.size === 1) drag.current.moved = false
    if (drag.current.pointers.size === 2) {
      const [a, b] = [...drag.current.pointers.values()]
      drag.current.pinch = Math.hypot(a.x - b.x, a.y - b.y)
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const pointers = drag.current.pointers
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    const next = { x: event.clientX, y: event.clientY }

    if (pointers.size === 2) {
      pointers.set(event.pointerId, next)
      const [a, b] = [...pointers.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const rect = viewportRef.current!.getBoundingClientRect()
      if (drag.current.pinch > 0 && distance > 0) {
        zoomBy(distance / drag.current.pinch, {
          x: (a.x + b.x) / 2 - rect.left,
          y: (a.y + b.y) / 2 - rect.top,
        })
      }
      drag.current.pinch = distance
      drag.current.moved = true
      return
    }

    const dx = next.x - previous.x
    const dy = next.y - previous.y
    if (!drag.current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return

    if (!drag.current.moved) {
      drag.current.moved = true
      viewportRef.current?.setPointerCapture?.(event.pointerId)
    }
    pointers.set(event.pointerId, next)
    setView((current) => clampView({ ...current, x: current.x + dx, y: current.y + dy }))
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    drag.current.pointers.delete(event.pointerId)
    drag.current.pinch = 0
  }

  function revealTile(target: HTMLElement) {
    const viewport = viewportRef.current
    if (!viewport) return
    const box = viewport.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    if (!box.width || !rect.width) return
    const pad = 24
    const dx = rect.left < box.left + pad ? box.left + pad - rect.left : rect.right > box.right - pad ? box.right - pad - rect.right : 0
    const dy = rect.top < box.top + pad ? box.top + pad - rect.top : rect.bottom > box.bottom - pad ? box.bottom - pad - rect.bottom : 0
    if (dx || dy) setView((current) => clampView({ ...current, x: current.x + dx, y: current.y + dy }))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    const target = event.target as HTMLElement

    if (event.key === "+" || event.key === "=") return zoomBy(ZOOM_STEP)
    if (event.key === "-") return zoomBy(1 / ZOOM_STEP)
    if (event.key === "0") return setView(fitView())

    const direction = arrows[event.key]
    if (!direction) return
    event.preventDefault()

    if (target === viewportRef.current) {
      setView((current) =>
        clampView({ ...current, x: current.x - direction[0] * 60, y: current.y - direction[1] * 60 })
      )
      return
    }

    if (!target.hasAttribute("data-map-tile")) return
    const from = target.getBoundingClientRect()
    const fromX = from.left + from.width / 2
    const fromY = from.top + from.height / 2
    let best: HTMLElement | null = null
    let bestScore = Infinity

    viewportRef.current?.querySelectorAll<HTMLElement>("[data-map-tile]").forEach((candidate) => {
      if (candidate === target) return
      const rect = candidate.getBoundingClientRect()
      const dx = rect.left + rect.width / 2 - fromX
      const dy = rect.top + rect.height / 2 - fromY
      const along = dx * direction[0] + dy * direction[1]
      if (along <= 0) return
      const score = along + 2 * Math.abs(dx * direction[1] + dy * direction[0])
      if (score < bestScore) {
        bestScore = score
        best = candidate
      }
    })

    ;(best as HTMLElement | null)?.focus()
  }

  const percent = Math.round(view.s * 100)

  return (
    <div
      className={
        className ?? "relative h-[60vh] min-h-[420px] overflow-hidden rounded-3xl bg-[#ece3cf] sm:h-[68vh] lg:h-[72vh]"
      }
    >
      <div
        ref={attachViewport}
        aria-hidden="true"
        data-zoom={view.s.toFixed(3)}
        className="absolute inset-0 cursor-grab touch-none select-none outline-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
        onFocusCapture={(event) => {
          if ((event.target as HTMLElement).hasAttribute("data-map-tile")) revealTile(event.target as HTMLElement)
        }}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault()
            event.stopPropagation()
            drag.current.moved = false
          }
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: bounds.width,
            height: bounds.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
          }}
        >
          <svg
            width={bounds.width}
            height={bounds.height}
            viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
            aria-hidden="true"
            focusable="false"
            className="absolute left-0 top-0"
          >
            <polygon points={pointsAttr(layout.floor)} fill="#f3ead9" stroke="#d8cdb8" strokeWidth={4} />
            {layout.walkways.map((walkway, index) => (
              <g key={index}>
                <polygon points={pointsAttr(walkway.strip)} fill="#e8dec7" />
                <line
                  x1={walkway.line[0].x}
                  y1={walkway.line[0].y}
                  x2={walkway.line[1].x}
                  y2={walkway.line[1].y}
                  stroke="#b9a57a"
                  strokeWidth={3}
                  strokeDasharray="14 12"
                  strokeLinecap="round"
                />
              </g>
            ))}
            {layout.zones.map((zone) => {
              const style = ZONE_STYLE[zone.role]
              return (
                <g key={zone.role}>
                  <polygon
                    points={pointsAttr(zone.rug)}
                    fill={style.fill}
                    fillOpacity={zone.role === "visitor" ? 0.1 : 0.16}
                    stroke={style.stroke}
                    strokeOpacity={0.5}
                    strokeWidth={3}
                    strokeDasharray={style.dash}
                    strokeLinejoin="round"
                  />
                  <text
                    x={zone.labelAt.x}
                    y={zone.labelAt.y - 14}
                    textAnchor="middle"
                    fill={style.text}
                    fontSize={18}
                    fontWeight={700}
                    letterSpacing={2}
                  >
                    {zone.label.toUpperCase()}
                  </text>
                </g>
              )
            })}
          </svg>

          {layout.zones.map((zone) =>
            zone.tiles.length === 0 ? (
              <p
                key={`${zone.role}-empty`}
                className="pointer-events-none absolute w-56 -translate-x-1/2 -translate-y-1/2 text-center text-sm leading-5 text-slate-600"
                style={{ left: zone.center.x - origin.x, top: zone.center.y - origin.y }}
              >
                {zone.emptyMessage}
              </p>
            ) : null
          )}

          {layout.zones
            .flatMap((zone) => zone.tiles)
            .sort((a, b) => a.center.y - b.center.y)
            .map((tile) => (
              <MapTileView
                key={tile.space.id}
                tile={tile}
                left={tile.center.x - origin.x - TILE_ART_CX}
                top={tile.center.y - origin.y - TILE_ART_CY}
                zoom={view.s}
                onUnlock={onUnlock}
              />
            ))}
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-2 left-3 right-28 text-[11px] leading-4 text-slate-600">
        Drag to move, pinch or use the buttons to zoom · open a space or enter a code on a locked tile
      </p>

      <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)}>
          <Plus aria-hidden="true" />
        </Button>
        <span aria-label="Zoom level" className="text-[10px] font-medium tabular-nums text-slate-600">
          {percent}%
        </span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => zoomBy(1 / ZOOM_STEP)}>
          <Minus aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Reset view" onClick={() => setView(fitView())}>
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

function MapTileView({
  tile,
  left,
  top,
  zoom,
  onUnlock,
}: {
  tile: MapTile
  left: number
  top: number
  zoom: number
  onUnlock: (space: StudySpaceRecord) => void
}) {
  const { space, role } = tile
  const isLocked = role === "visitor"
  const tooltipId = `space-map-tip-${space.id}`
  const hitClass =
    "absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3ead9]"

  const body = (
    <>
      <SpaceMapArt
        kind={space.kind}
        capacity={space.capacity}
        locked={isLocked}
        className={isLocked ? "opacity-55 grayscale" : "motion-safe:transition-transform motion-safe:group-hover:-translate-y-1"}
      />
      {isLocked && (
        <span className="absolute left-1/2 top-[88px] flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-slate-700 shadow-sm">
          <Lock className="size-4" aria-hidden="true" />
        </span>
      )}
      <span className="absolute inset-x-0 top-[178px] flex flex-col items-center px-3 text-center">
        <span className="max-w-full truncate text-[13px] font-semibold leading-4 text-slate-900">{space.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-4 text-slate-600">
          <span className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: space.capacity }, (_, index) => (
              <span key={index} className="size-1.5 rounded-[2px] bg-slate-500" />
            ))}
          </span>
          {space.capacity} seats
        </span>
        {isLocked && <span className="text-[11px] font-medium leading-4 text-slate-700">Needs a space code</span>}
      </span>
    </>
  )

  return (
    <div
      className="group absolute focus-within:z-30 hover:z-30"
      style={{ left, top, width: TILE_W, height: TILE_H }}
    >
      {isLocked ? (
        <button
          type="button"
          data-map-tile=""
          tabIndex={-1}
          aria-label={tileAriaLabel(tile)}
          aria-describedby={tooltipId}
          className={hitClass}
          onClick={() => onUnlock(space)}
        >
          {body}
        </button>
      ) : (
        <Link
          to={`/students/study-spaces/${space.id}`}
          data-map-tile=""
          tabIndex={-1}
          aria-label={tileAriaLabel(tile)}
          aria-describedby={tooltipId}
          className={hitClass}
        >
          {body}
        </Link>
      )}

      <span
        className={`pointer-events-none absolute left-1 top-[58px] z-10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-4 ${
          isLocked
            ? "border-slate-300 bg-white/90 text-slate-700"
            : role === "owner"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
        }`}
      >
        {isLocked ? (
          <>
            <Lock className="size-2.5" aria-hidden="true" />
            Locked
          </>
        ) : role === "owner" ? (
          "Yours"
        ) : (
          "Joined"
        )}
      </span>

      <div
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-2 z-40 w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left opacity-0 shadow-md transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        style={{ transform: `translateX(-50%) scale(${1 / zoom})`, transformOrigin: "50% 0" }}
      >
        <p className="text-xs font-semibold text-slate-900">{space.name}</p>
        <p className="text-[11px] leading-4 text-slate-600">
          {kindLabel(space.kind)} · {space.capacity} seats
        </p>
        <p className="text-[11px] font-medium leading-4 text-slate-800">
          {isLocked ? studySpacesLockedTooltip : stateLabel(role)}
        </p>
        <p className="text-[11px] leading-4 text-slate-500">
          {isLocked ? "Preview only — not opened" : `${metaLine(space)} · browser only`}
        </p>
      </div>
    </div>
  )
}
```

### `space-roster.ts`

Current file: `src/components/features/personal-workspace/study-spaces/space-roster.ts`

```ts
import type { StudySpaceRecord } from "./study-spaces-records"

// Decorative sample people. They are derived from the space id, never saved, never speak,
// and do not represent real students, members, or presence.
export type SamplePerson = {
  id: string
  name: string
  seatIndex: number
  skin: string
  shirt: string
  hair: string
}

export const SAMPLE_NAMES = ["Ava", "Ben", "Chloe", "Dev", "Ella", "Finn", "Grace", "Hugo"]
export const SAMPLE_SKINS = ["#f1c9a5", "#d9a47a", "#a8744c", "#7a4e33"]
export const SAMPLE_SHIRTS = ["#2f6b4f", "#c2693a", "#4f6fa8", "#b4485a", "#d9a73a", "#6b5ca5"]
export const SAMPLE_HAIRS = ["#2a1d15", "#4a3222", "#1c1c1c", "#8a5a2b"]

export const sampleRosterNotice =
  "Sample study-mates are illustrations only. No real students are in this room."

export function hashString(value: string): number {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

// Some rooms have one extra sample owl resting in the nap area. `seatIndex` counts from
// `firstSpotIndex`, the index of the first nap mat in the combined seat list.
export function getSampleNappers(
  space: StudySpaceRecord,
  roster: SamplePerson[],
  firstSpotIndex: number,
  matCount: number
): SamplePerson[] {
  const hash = hashString(`${space.id}:nap`)
  if (hash % 3 === 0 || matCount === 0) return []
  const name = SAMPLE_NAMES.find(
    (candidate, index) => !roster.some((person) => person.name === candidate) && index >= hash % SAMPLE_NAMES.length
  ) ?? SAMPLE_NAMES.find((candidate) => !roster.some((person) => person.name === candidate))
  if (!name) return []
  return [
    {
      id: `sample-${space.id}-nap`,
      name,
      seatIndex: firstSpotIndex + (hash % matCount),
      skin: SAMPLE_SKINS[hash % SAMPLE_SKINS.length],
      shirt: SAMPLE_SHIRTS[(hash >> 3) % SAMPLE_SHIRTS.length],
      hair: SAMPLE_HAIRS[(hash >> 6) % SAMPLE_HAIRS.length],
    },
  ]
}

// One seat is always left free so the student can take a place.
export function getSampleRoster(space: StudySpaceRecord, seatCount: number): SamplePerson[] {
  if (seatCount < 2) return []

  const hash = hashString(space.id)
  const count = Math.min(seatCount - 1, Math.max(1, Math.round(seatCount * (0.55 + 0.1 * (hash % 3)))))

  const seatOrder = Array.from({ length: seatCount }, (_, index) => index).sort(
    (a, b) => hashString(`${space.id}:${a}`) - hashString(`${space.id}:${b}`)
  )
  const nameOrder = [...SAMPLE_NAMES.keys()].sort(
    (a, b) => hashString(`${space.id}:n${a}`) - hashString(`${space.id}:n${b}`)
  )

  return Array.from({ length: count }, (_, index) => {
    const seed = hashString(`${space.id}:p${index}`)
    return {
      id: `sample-${space.id}-${index}`,
      name: SAMPLE_NAMES[nameOrder[index]],
      seatIndex: seatOrder[index],
      skin: SAMPLE_SKINS[seed % SAMPLE_SKINS.length],
      shirt: SAMPLE_SHIRTS[(seed >> 3) % SAMPLE_SHIRTS.length],
      hair: SAMPLE_HAIRS[(seed >> 6) % SAMPLE_HAIRS.length],
    }
  })
}
```

### `study-hall-world.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/study-hall-world.tsx`

```tsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, MapControls, useCursor } from "@react-three/drei"
import { CanvasTexture, MOUSE, RepeatWrapping, SRGBColorSpace, TOUCH, type Group } from "three"
import type { MapControls as MapControlsImpl } from "three-stdlib"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  DoorOpen,
  Footprints,
  Info,
  Lock,
  Map as MapIcon,
  Minus,
  Moon,
  PencilLine,
  Plus,
  RotateCcw,
  Sun,
  Sunset,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "cn"
import { Building, StreetLamp, Tree } from "./city-buildings"
import {
  constrainWalker,
  layoutCity,
  LOT_D,
  LOT_W,
  nearestDoor,
  ROAD,
  streetAt,
  type CityLayout,
  type CityLot,
} from "./city-layout"
import { OwlioFountain, Plaza } from "./city-plaza"
import { Traffic, TrafficSignals } from "./city-traffic"
import { CharacterDialog } from "./detail/character-dialog"
import { HALL_LIGHTING, LIGHT_LABELS, useLightPhase, useSharedLightSetting, type LightPhase } from "./detail/room-ambience"
import { CharacterFigure, type FigureMode } from "./detail/character-figure"
import { kindLabel, metaLine } from "./space-format"
import {
  loadHallCharacter,
  saveHallCharacter,
  studySpacesDiscoveryCaption,
  studySpacesGuidance,
  studySpacesLockedTooltip,
  studySpacesStorageNotice,
  type StudySpaceCharacter,
  type StudySpaceRecord,
} from "./study-spaces-records"
import { useWalkKeys, walkDirection, type WalkKey } from "./use-walk-keys"

type Mode = "explore" | "walk"
type Point = { x: number; z: number }
type RigHandle = { zoomBy: (factor: number) => void; reset: () => void }

export type StudyHallWorldProps = {
  created: StudySpaceRecord[]
  joined: StudySpaceRecord[]
  locked: StudySpaceRecord[]
  toolbar: ReactNode
  onOpen: (space: StudySpaceRecord) => void
  onUnlock: (space: StudySpaceRecord) => void
}

const WALK_SPEED = 6
const WALK_DISTANCE = 26
const MIN_DISTANCE = 10

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

function statusLabel(lot: CityLot) {
  if (lot.role === "visitor") return "Locked"
  return lot.role === "owner" ? "Yours" : "Joined"
}

export default function StudyHallWorld({ created, joined, locked, toolbar, onOpen, onUnlock }: StudyHallWorldProps) {
  const layout = useMemo(
    () =>
      layoutCity([
        { role: "owner", spaces: created },
        { role: "member", spaces: joined },
        { role: "visitor", spaces: locked },
      ]),
    [created, joined, locked]
  )
  const [mode, setMode] = useState<Mode>("explore")
  const [character, setCharacter] = useState<StudySpaceCharacter | null>(() => loadHallCharacter())
  const [characterOpen, setCharacterOpen] = useState(false)
  const [nearby, setNearby] = useState<CityLot | null>(null)
  const [street, setStreet] = useState(1)
  const [infoOpen, setInfoOpen] = useState(false)
  const handleRef = useRef<RigHandle | null>(null)
  const walk = useWalkKeys(mode === "walk")
  const light = useSharedLightSetting()
  const lightPhase = useLightPhase(light.setting)

  const activate = useCallback(
    (lot: CityLot) => (lot.role === "visitor" ? onUnlock(lot.space) : onOpen(lot.space)),
    [onOpen, onUnlock]
  )

  function changeMode(next: Mode) {
    if (next === "walk" && !character) {
      setCharacterOpen(true)
      return
    }
    setMode(next)
    if (next === "explore") setNearby(null)
  }

  function handleCharacterSubmit(draft: Pick<StudySpaceCharacter, "name" | "bodyColor" | "accentColor">) {
    const next: StudySpaceCharacter = { ...draft, createdAt: new Date().toISOString() }
    saveHallCharacter(next)
    setCharacter(next)
    setCharacterOpen(false)
    setMode("walk")
  }

  useEffect(() => {
    if (mode !== "walk" || !nearby) return
    function onKey(event: KeyboardEvent) {
      if (event.code !== "KeyE" || event.repeat || isTypingTarget(event.target) || !nearby) return
      event.preventDefault()
      activate(nearby)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mode, nearby, activate])

  const empty = layout.lots.length === 0

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [20, 46, 50], fov: 38, near: 0.5, far: 600 }}
        aria-label="3D study hall city. Each building is a study space; the labels above buildings are buttons."
        fallback={
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-600">
            The 3D study hall could not start because WebGL is unavailable. Switch to the list view.
          </div>
        }
      >
        <CityScene
          layout={layout}
          mode={mode}
          character={character}
          heldRef={walk.heldRef}
          nearbyId={nearby?.space.id ?? null}
          lightPhase={lightPhase}
          handleRef={handleRef}
          onActivate={activate}
          onNearby={setNearby}
          onStreet={setStreet}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3">{toolbar}</div>

      {mode === "walk" && character ? (
        <div className="pointer-events-none absolute left-3 top-[4.5rem] z-10 flex flex-wrap items-center gap-2 max-sm:top-32">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
            Owlio Study Hall · Street {street}
          </span>
          <span className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/95 py-1 pl-1 pr-1.5 text-xs font-medium text-slate-700 shadow-sm">
            <span className="size-5 rounded-full border-2" style={{ backgroundColor: character.bodyColor, borderColor: character.accentColor }} aria-hidden="true" />
            {character.name}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Edit hall character"
              title="Edit hall character"
              onClick={() => setCharacterOpen(true)}
            >
              <PencilLine aria-hidden="true" />
            </Button>
          </span>
        </div>
      ) : null}

      {empty ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
          <p className="max-w-xs rounded-2xl bg-white/95 px-5 py-4 text-center text-sm leading-6 text-slate-700 shadow-md">
            No study spaces match. Clear the search, or create or join a space to add a building.
          </p>
        </div>
      ) : null}

      <div className="absolute bottom-3 left-3 z-10 flex max-w-[calc(100%-6rem)] flex-col items-start gap-2">
        {infoOpen ? (
          <div id="study-hall-info" className="w-80 max-w-full rounded-2xl border border-slate-200 bg-white/95 p-4 text-xs leading-5 text-slate-700 shadow-lg">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">About the study hall</p>
              <Button type="button" variant="ghost" size="icon-xs" aria-label="Close study hall info" onClick={() => setInfoOpen(false)}>
                <X aria-hidden="true" />
              </Button>
            </div>
            <p>{studySpacesGuidance}</p>
            <p className="mt-2">{studySpacesStorageNotice}</p>
            {locked.length > 0 ? <p className="mt-2">{studySpacesDiscoveryCaption}</p> : null}
            <p className="mt-2 text-slate-500">
              Focus towers, group halls and study cafés each have one discussion table inside. Owlio Plaza and the
              fountain are for gathering; the cars and traffic lights are decorative.
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 rounded-full bg-white/95 px-2 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="About the study hall"
            aria-expanded={infoOpen}
            aria-controls={infoOpen ? "study-hall-info" : undefined}
            onClick={() => setInfoOpen((open) => !open)}
          >
            <Info aria-hidden="true" />
          </Button>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />Yours</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" aria-hidden="true" />Joined</span>
          <span className="flex items-center gap-1 pr-1"><Lock className="size-3" aria-hidden="true" />Locked</span>
          <span aria-hidden="true" className="h-4 w-px bg-slate-200" />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={light.cycle}
            aria-label={`Hall and room lighting: ${LIGHT_LABELS[light.setting]}`}
            title="Lighting follows your local time on Auto and is shared with your study rooms"
          >
            {lightPhase === "night" ? <Moon aria-hidden="true" /> : lightPhase === "evening" ? <Sunset aria-hidden="true" /> : <Sun aria-hidden="true" />}
            {LIGHT_LABELS[light.setting]}
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-24 sm:bottom-3">
        {mode === "walk" && nearby ? (
          <div role="status" className="pointer-events-auto flex items-center gap-3 rounded-full bg-slate-900/90 py-1.5 pl-4 pr-1.5 text-sm text-white shadow-lg">
            <span className="max-w-48 truncate font-semibold">{nearby.space.name}</span>
            <span className="hidden text-xs text-slate-300 sm:inline">
              {statusLabel(nearby)} · press <kbd className="rounded bg-white/15 px-1.5 font-sans">E</kbd>
            </span>
            <Button type="button" size="sm" className="rounded-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => activate(nearby)}>
              {nearby.role === "visitor" ? <Lock aria-hidden="true" /> : <DoorOpen aria-hidden="true" />}
              {nearby.role === "visitor" ? "Enter code" : "Enter"}
            </Button>
          </div>
        ) : (
          <p className="hidden rounded-full bg-white/90 px-4 py-1.5 text-center text-[11px] leading-4 text-slate-600 shadow-sm md:block">
            {mode === "walk"
              ? "Walk with WASD or the arrow keys · click the ground to move · walk up to a door to enter"
              : "Drag to move · scroll to zoom · right-drag to rotate · click a building to open it"}
          </p>
        )}
      </div>

      <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
        {mode === "walk" ? <WalkPad onPress={walk.setPad} /> : null}
        <div className="flex items-end gap-2">
          <div role="group" aria-label="Map mode" className="flex rounded-full bg-white/95 p-1 shadow-sm">
            <Button
              type="button"
              size="sm"
              variant={mode === "explore" ? "default" : "ghost"}
              className="rounded-full"
              aria-pressed={mode === "explore"}
              onClick={() => changeMode("explore")}
            >
              <MapIcon aria-hidden="true" />
              Explore
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "walk" ? "default" : "ghost"}
              className="rounded-full"
              aria-pressed={mode === "walk"}
              onClick={() => changeMode("walk")}
            >
              <Footprints aria-hidden="true" />
              Walk
            </Button>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-white/95 p-1 shadow-sm">
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => handleRef.current?.zoomBy(1.25)}>
              <Plus aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => handleRef.current?.zoomBy(0.8)}>
              <Minus aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Reset view" onClick={() => handleRef.current?.reset()}>
              <RotateCcw aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <CharacterDialog
        open={characterOpen}
        onOpenChange={setCharacterOpen}
        required={false}
        initial={character}
        context="hall"
        onSubmit={handleCharacterSubmit}
      />
    </div>
  )
}

// Touch/pointer movement pad. Keyboard users walk with WASD or the arrow keys instead.
function WalkPad({ onPress }: { onPress: (key: WalkKey, pressed: boolean) => void }) {
  const pad = (key: WalkKey, icon: ReactNode, className: string) => (
    <button
      type="button"
      tabIndex={-1}
      className={cn(
        "flex size-9 touch-none items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-sm active:bg-slate-200",
        className
      )}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        onPress(key, true)
      }}
      onPointerUp={() => onPress(key, false)}
      onPointerCancel={() => onPress(key, false)}
      onLostPointerCapture={() => onPress(key, false)}
    >
      {icon}
    </button>
  )

  return (
    <div aria-hidden="true" className="grid grid-cols-3 grid-rows-2 gap-1">
      {pad("up", <ArrowUp className="size-4" />, "col-start-2")}
      {pad("left", <ArrowLeft className="size-4" />, "col-start-1 row-start-2")}
      {pad("down", <ArrowDown className="size-4" />, "col-start-2 row-start-2")}
      {pad("right", <ArrowRight className="size-4" />, "col-start-3 row-start-2")}
    </div>
  )
}

function CityScene({
  layout,
  mode,
  character,
  heldRef,
  nearbyId,
  lightPhase,
  handleRef,
  onActivate,
  onNearby,
  onStreet,
}: {
  layout: CityLayout
  mode: Mode
  character: StudySpaceCharacter | null
  heldRef: RefObject<Set<WalkKey>>
  nearbyId: string | null
  lightPhase: LightPhase
  handleRef: RefObject<RigHandle | null>
  onActivate: (lot: CityLot) => void
  onNearby: (lot: CityLot | null) => void
  onStreet: (street: number) => void
}) {
  const walkerRef = useRef<Point>({ ...layout.spawn })
  const clickTargetRef = useRef<Point | null>(null)
  const walking = mode === "walk" && character !== null
  const span = Math.max(layout.width, layout.depth)

  useEffect(() => {
    const constrained = constrainWalker(walkerRef.current, layout)
    walkerRef.current = constrained
  }, [layout])

  const goTo = useCallback(
    (point: Point) => {
      clickTargetRef.current = constrainWalker(point, layout)
    },
    [layout]
  )

  const light = HALL_LIGHTING[lightPhase]

  return (
    <>
      <color attach="background" args={[light.sky]} />
      <fog attach="fog" args={[light.sky, span * 2.2, span * 5]} />
      <hemisphereLight args={[light.sky, light.ground, light.hemi]} />
      <ambientLight intensity={light.ambient} />
      <directionalLight
        position={[span * light.sunPosition[0], span * light.sunPosition[1], span * light.sunPosition[2]]}
        color={light.sun}
        intensity={light.sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-span * 0.75}
        shadow-camera-right={span * 0.75}
        shadow-camera-top={span * 0.75}
        shadow-camera-bottom={-span * 0.75}
        shadow-camera-near={1}
        shadow-camera-far={span * 3}
        shadow-bias={-0.0005}
      />

      <Ground layout={layout} onPoint={walking ? goTo : undefined} />
      <Roads layout={layout} />
      <Scenery layout={layout} lamps={light.lamps} />
      <Plaza layout={layout} walkerRef={walkerRef} walking={walking} lamps={light.lamps} />
      <OwlioFountain layout={layout} lamps={light.lamps} />
      <TrafficSignals layout={layout} />
      <Traffic layout={layout} lamps={light.lamps} />

      {layout.lots.map((lot) => (
        <Lot
          key={lot.space.id}
          lot={lot}
          glow={light.lamps}
          walking={walking}
          nearby={nearbyId === lot.space.id}
          onActivate={onActivate}
          onWalkTo={goTo}
        />
      ))}

      {walking && character ? (
        <Walker
          layout={layout}
          character={character}
          heldRef={heldRef}
          walkerRef={walkerRef}
          clickTargetRef={clickTargetRef}
          onNearby={onNearby}
          onStreet={onStreet}
        />
      ) : null}

      <Rig layout={layout} mode={walking ? "walk" : "explore"} walkerRef={walkerRef} handleRef={handleRef} />
    </>
  )
}

function useTileTexture(width: number, depth: number) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#f6eedd"
      ctx.fillRect(0, 0, 128, 128)
      ctx.strokeStyle = "#e6dac2"
      ctx.lineWidth = 4
      ctx.strokeRect(2, 2, 124, 124)
      ctx.fillStyle = "#efe4cd"
      ctx.fillRect(40, 40, 48, 48)
    }
    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    created.wrapS = RepeatWrapping
    created.wrapT = RepeatWrapping
    created.anisotropy = 8
    created.repeat.set(width / 2.5, depth / 2.5)
    return created
  }, [width, depth])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function Ground({ layout, onPoint }: { layout: CityLayout; onPoint?: (point: Point) => void }) {
  const tiles = useTileTexture(layout.width, layout.depth)

  return (
    <group>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[layout.width * 6 + 200, layout.depth * 6 + 200]} />
        <meshStandardMaterial color="#b6dc8c" />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[layout.width + 0.6, 0.06, layout.depth + 0.6]} />
        <meshStandardMaterial color="#d9cdb3" />
      </mesh>
      <mesh
        position={[0, 0.012, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(event) => {
          if (!onPoint || event.delta > 4) return
          event.stopPropagation()
          onPoint({ x: event.point.x, z: event.point.z })
        }}
      >
        <planeGeometry args={[layout.width, layout.depth]} />
        <meshStandardMaterial map={tiles} />
      </mesh>
    </group>
  )
}

function Roads({ layout }: { layout: CityLayout }) {
  const { width, depth, roadsX, roadsZ, roundabout } = layout
  const asphalt = "#5d6878"
  const roadWidth = ROAD - 1.2
  const nearRing = (x: number, z: number, pad = 0.6) => Math.hypot(x - roundabout.x, z - roundabout.z) < roundabout.ring + pad
  const dashes: { x: number; z: number; along: "x" | "z" }[] = []

  roadsZ.forEach((z) => {
    for (let index = 0; index < roadsX.length - 1; index += 1) {
      const from = roadsX[index] + ROAD / 2 + 0.8
      const to = roadsX[index + 1] - ROAD / 2 - 0.8
      for (let x = from + 2.6; x < to - 2; x += 2.4) if (!nearRing(x, z)) dashes.push({ x, z, along: "x" })
    }
  })
  roadsX.forEach((x) => {
    for (let index = 0; index < roadsZ.length - 1; index += 1) {
      const from = roadsZ[index] + ROAD / 2 + 0.8
      const to = roadsZ[index + 1] - ROAD / 2 - 0.8
      for (let z = from + 2.6; z < to - 2; z += 2.4) if (!nearRing(x, z)) dashes.push({ x, z, along: "z" })
    }
  })

  // Zebra crossings on every approach to an intersection, except round the roundabout.
  const crossings: { x: number; z: number; along: "x" | "z" }[] = []
  roadsX.forEach((x) =>
    roadsZ.forEach((z) => {
      if (nearRing(x, z, 0)) return
      ;[-1, 1].forEach((side) => {
        const cx = x + side * (ROAD / 2 + 0.9)
        if (Math.abs(cx) < width / 2 - 0.6) crossings.push({ x: cx, z, along: "x" })
        const cz = z + side * (ROAD / 2 + 0.9)
        if (Math.abs(cz) < depth / 2 - 0.6) crossings.push({ x, z: cz, along: "z" })
      })
    })
  )

  return (
    <group>
      {roadsZ.map((z) => (
        <mesh key={`rz-${z}`} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width - 0.6, roadWidth]} />
          <meshStandardMaterial color={asphalt} />
        </mesh>
      ))}
      {roadsX.map((x) => (
        <mesh key={`rx-${x}`} position={[x, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[roadWidth, depth - 0.6]} />
          <meshStandardMaterial color={asphalt} />
        </mesh>
      ))}
      {dashes.map((dash) => (
        <mesh key={`${dash.along}-${dash.x}-${dash.z}`} position={[dash.x, 0.03, dash.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={dash.along === "x" ? [1.2, 0.16] : [0.16, 1.2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      {crossings.map((crossing) =>
        Array.from({ length: 5 }, (_, index) => {
          const offset = -roadWidth / 2 + 0.45 + index * ((roadWidth - 0.9) / 4)
          return (
            <mesh
              key={`c-${crossing.along}-${crossing.x}-${crossing.z}-${index}`}
              position={
                crossing.along === "x"
                  ? [crossing.x, 0.031, crossing.z + offset]
                  : [crossing.x + offset, 0.031, crossing.z]
              }
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={crossing.along === "x" ? [1.3, 0.34] : [0.34, 1.3]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          )
        })
      )}
      {roadsZ.slice(1).map((z, index) => (
        <Html key={`street-${z}`} position={[-width / 2 + 3.2, 0.1, z]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <span className="whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            Street {index + 1}
          </span>
        </Html>
      ))}
    </group>
  )
}

function Scenery({ layout, lamps }: { layout: CityLayout; lamps: number }) {
  const { width, depth, lots, roundabout } = layout
  const clearOfRing = (x: number, z: number) => Math.hypot(x - roundabout.x, z - roundabout.z) > roundabout.ring + 1.2
  const trees = useMemo(() => {
    const result: { x: number; z: number; s: number }[] = []
    const step = 5
    for (let x = -width / 2 - 2; x <= width / 2 + 2; x += step) {
      const jitter = Math.sin(x * 12.9898) * 0.6
      result.push({ x: x + jitter, z: -depth / 2 - 3 + jitter, s: 1 + jitter * 0.2 })
      result.push({ x: x - jitter, z: depth / 2 + 3 - jitter, s: 1 - jitter * 0.2 })
    }
    for (let z = -depth / 2 + 2; z <= depth / 2 - 2; z += step) {
      const jitter = Math.cos(z * 7.233) * 0.6
      result.push({ x: -width / 2 - 3 + jitter, z: z + jitter, s: 1 + jitter * 0.2 })
      result.push({ x: width / 2 + 3 - jitter, z: z - jitter, s: 1 - jitter * 0.2 })
    }
    return result
  }, [width, depth])

  return (
    <group>
      {trees.map((tree) => (
        <Tree key={`${tree.x}-${tree.z}`} position={[tree.x, 0, tree.z]} scale={tree.s} />
      ))}
      {lots.map((lot) => (
        <group key={lot.space.id}>
          <Tree position={[lot.x - LOT_W / 2 + 0.9, 0, lot.z - LOT_D / 2 + 0.9]} scale={0.75} />
          <Tree position={[lot.x + LOT_W / 2 - 0.9, 0, lot.z - LOT_D / 2 + 0.9]} scale={0.75} />
          {clearOfRing(lot.x - LOT_W / 2 + 0.5, lot.z + LOT_D / 2 - 0.4) ? (
            <StreetLamp position={[lot.x - LOT_W / 2 + 0.5, 0, lot.z + LOT_D / 2 - 0.4]} glow={lamps} />
          ) : null}
          {[-1, 1].map((side) =>
            clearOfRing(lot.x + side * (LOT_W / 2 - 1.3), lot.z + LOT_D / 2 - 1.4) ? (
              <mesh key={side} position={[lot.x + side * (LOT_W / 2 - 1.3), 0.15, lot.z + LOT_D / 2 - 1.4]} castShadow receiveShadow>
                <boxGeometry args={[1.8, 0.3, 1.2]} />
                <meshStandardMaterial color="#7cc46a" />
              </mesh>
            ) : null
          )}
        </group>
      ))}
    </group>
  )
}

function Lot({
  lot,
  glow,
  walking,
  nearby,
  onActivate,
  onWalkTo,
}: {
  lot: CityLot
  glow: number
  walking: boolean
  nearby: boolean
  onActivate: (lot: CityLot) => void
  onWalkTo: (point: Point) => void
}) {
  const locked = lot.role === "visitor"
  const [hovered, setHovered] = useState(false)
  const lift = useRef<Group>(null)
  useCursor(hovered)

  useFrame((_, delta) => {
    const node = lift.current
    if (!node) return
    const target = hovered && !reducedMotion ? 0.25 : 0
    node.position.y += (target - node.position.y) * Math.min(1, delta * 10)
  })

  const { building } = lot
  const billboardTop = building.h + 1.2 + (building.w - 0.6) / 2

  return (
    <group position={[building.x, 0, building.z]}>
      <group
        ref={lift}
        onClick={(event) => {
          if (event.delta > 4) return
          event.stopPropagation()
          if (walking) onWalkTo(lot.door)
          else onActivate(lot)
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <Building kind={lot.space.kind} footprint={building} locked={locked} name={lot.space.name} glow={glow} />
      </group>
      <BuildingLabel lot={lot} y={billboardTop + 1.1} highlighted={hovered || nearby} onActivate={() => onActivate(lot)} />
    </group>
  )
}

function BuildingLabel({
  lot,
  y,
  highlighted,
  onActivate,
}: {
  lot: CityLot
  y: number
  highlighted: boolean
  onActivate: () => void
}) {
  const { space, role } = lot
  const locked = role === "visitor"
  const ariaLabel = locked ? `${space.name} — locked preview, needs a space code (map)` : `Open ${space.name} (map)`

  return (
    <Html position={[0, y, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div className="group relative flex justify-center">
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={onActivate}
          className={cn(
            "pointer-events-auto flex max-w-44 items-center gap-1.5 whitespace-nowrap rounded-full border bg-white/95 py-1 pl-1.5 pr-2.5 text-[11px] font-semibold text-slate-900 shadow-md outline-none transition-transform focus-visible:ring-2 focus-visible:ring-blue-500",
            highlighted ? "scale-110 border-blue-400" : "border-white"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-full",
              locked ? "bg-slate-200 text-slate-600" : role === "owner" ? "bg-emerald-500" : "bg-blue-500"
            )}
          >
            {locked ? <Lock className="size-2.5" /> : null}
          </span>
          <span className="truncate">{space.name}</span>
        </button>
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden w-52 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-md group-focus-within:block group-hover:block"
        >
          <p className="text-xs font-semibold text-slate-900">{space.name}</p>
          <p className="text-[11px] leading-4 text-slate-600">
            {kindLabel(space.kind)} · {space.capacity} seats
          </p>
          <p className="text-[11px] font-medium leading-4 text-slate-800">
            {locked ? studySpacesLockedTooltip : statusLabel(lot)}
          </p>
          <p className="text-[11px] leading-4 text-slate-500">
            {locked ? "Preview only — not opened" : `${metaLine(space)} · browser only`}
          </p>
        </div>
      </div>
    </Html>
  )
}

function Walker({
  layout,
  character,
  heldRef,
  walkerRef,
  clickTargetRef,
  onNearby,
  onStreet,
}: {
  layout: CityLayout
  character: StudySpaceCharacter
  heldRef: RefObject<Set<WalkKey>>
  walkerRef: RefObject<Point>
  clickTargetRef: RefObject<Point | null>
  onNearby: (lot: CityLot | null) => void
  onStreet: (street: number) => void
}) {
  const group = useRef<Group>(null)
  const figureMode = useRef<FigureMode>("idle")
  const nearRef = useRef<string | null | undefined>(undefined)
  const streetRef = useRef(0)
  const controls = useThree((state) => state.controls) as MapControlsImpl | null

  useLayoutEffect(() => {
    group.current?.position.set(walkerRef.current.x, 0, walkerRef.current.z)
  }, [walkerRef])

  useFrame(({ camera }, delta) => {
    const node = group.current
    if (!node) return
    const position = walkerRef.current
    const step = WALK_SPEED * Math.min(delta, 0.05)
    const direction = walkDirection(heldRef.current, camera, controls?.target ?? position)
    let next: Point | null = null

    if (direction) {
      clickTargetRef.current = null
      next = { x: position.x + direction.x * step, z: position.z + direction.z * step }
    } else if (clickTargetRef.current) {
      const dx = clickTargetRef.current.x - position.x
      const dz = clickTargetRef.current.z - position.z
      const distance = Math.hypot(dx, dz)
      if (distance < 0.05) clickTargetRef.current = null
      else next = { x: position.x + (dx / distance) * Math.min(step, distance), z: position.z + (dz / distance) * Math.min(step, distance) }
    }

    if (next) {
      const constrained = constrainWalker(next, layout)
      const moved = Math.hypot(constrained.x - position.x, constrained.z - position.z)
      if (moved > 1e-4) {
        node.rotation.y = Math.atan2(constrained.x - position.x, constrained.z - position.z)
        figureMode.current = "walk"
      } else {
        clickTargetRef.current = null
        figureMode.current = "idle"
      }
      walkerRef.current = constrained
    } else {
      figureMode.current = "idle"
    }

    node.position.set(walkerRef.current.x, 0, walkerRef.current.z)

    const near = nearestDoor(walkerRef.current, layout)
    const nearId = near?.space.id ?? null
    if (nearId !== nearRef.current) {
      nearRef.current = nearId
      onNearby(near)
    }
    const street = streetAt(walkerRef.current.z, layout)
    if (street !== streetRef.current) {
      streetRef.current = street
      onStreet(street)
    }
  })

  return (
    <group ref={group}>
      <CharacterFigure
        bodyColor={character.bodyColor}
        accentColor={character.accentColor}
        getMode={() => figureMode.current}
        reducedMotion={reducedMotion}
      />
      <Html position={[0, 2.2, 0]} center zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
        <span className="block whitespace-nowrap rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] font-medium text-white shadow">
          {character.name} · you
        </span>
      </Html>
    </group>
  )
}

function Rig({
  layout,
  mode,
  walkerRef,
  handleRef,
}: {
  layout: CityLayout
  mode: Mode
  walkerRef: RefObject<Point>
  handleRef: RefObject<RigHandle | null>
}) {
  const controls = useRef<MapControlsImpl>(null)
  const get = useThree((state) => state.get)
  const ready = useThree((state) => state.size.width > 0 && state.size.height > 0)
  const maxDistance = Math.max(layout.width, layout.depth) * 2.2 + 30

  const frame = useCallback(
    (target: Point, distance: number) => {
      const c = controls.current
      if (!c) return
      const camera = get().camera
      c.target.set(target.x, 0, target.z)
      camera.position.set(target.x + distance * 0.29, distance * 0.65, target.z + distance * 0.7)
      c.update()
    },
    [get]
  )

  const reset = useCallback(() => {
    if (mode === "walk") {
      frame(walkerRef.current, WALK_DISTANCE)
      return
    }
    const { width, height } = get().size
    const aspect = width / Math.max(height, 1)
    frame({ x: 0, z: 0 }, Math.max(layout.width / Math.min(aspect, 1.8), layout.depth) * 1.05 + 6)
  }, [frame, get, layout.depth, layout.width, mode, walkerRef])

  useEffect(() => {
    if (ready) reset()
  }, [ready, reset])

  useEffect(() => {
    handleRef.current = {
      reset,
      zoomBy: (factor) => {
        const c = controls.current
        if (!c) return
        const camera = get().camera
        const offset = camera.position.clone().sub(c.target)
        const length = Math.min(Math.max(offset.length() / factor, MIN_DISTANCE), maxDistance)
        camera.position.copy(c.target).add(offset.setLength(length))
        c.update()
      },
    }
    return () => {
      handleRef.current = null
    }
  }, [get, handleRef, maxDistance, reset])

  useFrame(() => {
    const c = controls.current
    if (!c || mode !== "walk") return
    const dx = walkerRef.current.x - c.target.x
    const dz = walkerRef.current.z - c.target.z
    if (Math.abs(dx) + Math.abs(dz) < 1e-4) return
    const k = reducedMotion ? 1 : 0.2
    const camera = get().camera
    c.target.x += dx * k
    c.target.z += dz * k
    camera.position.x += dx * k
    camera.position.z += dz * k
    c.update()
  })

  function handleChange() {
    const c = controls.current
    if (!c || mode === "walk") return
    const camera = get().camera
    const x = Math.min(Math.max(c.target.x, -layout.width / 2), layout.width / 2)
    const z = Math.min(Math.max(c.target.z, -layout.depth / 2), layout.depth / 2)
    if (x !== c.target.x || z !== c.target.z) {
      camera.position.x += x - c.target.x
      camera.position.z += z - c.target.z
      c.target.x = x
      c.target.z = z
    }
  }

  return (
    <MapControls
      ref={controls}
      makeDefault
      enableDamping={!reducedMotion}
      dampingFactor={0.1}
      minDistance={MIN_DISTANCE}
      maxDistance={maxDistance}
      minPolarAngle={0.3}
      maxPolarAngle={1.2}
      enablePan={mode === "explore"}
      mouseButtons={{
        LEFT: mode === "explore" ? MOUSE.PAN : MOUSE.ROTATE,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.ROTATE,
      }}
      touches={{ ONE: mode === "explore" ? TOUCH.PAN : TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
      onChange={handleChange}
    />
  )
}
```

### `study-space-room-features.test.ts`

Current file: `src/components/features/personal-workspace/study-spaces/study-space-room-features.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { getSampleNappers, getSampleRoster, SAMPLE_NAMES } from "./space-roster"
import { buildRoomSpots, buildSeats, discussionTable, napArea, roomPlan, watchRoom } from "./detail/study-space-seats"
import { sampleCreatedSpaces, sampleJoinedSpaces, type StudySpaceRecord } from "./study-spaces-records"
import { canManageTasks, canTickTask, createRoomTask, moveRoomTask, toggleRoomTask } from "./detail/room-tasks"
import { parseYouTubeId, youTubeEmbedUrl } from "./detail/room-tv"
import { drawerMaxFileBytes, drawerMaxFiles, validateDrawerFile } from "./detail/drawer-storage"

const essayWriters = sampleCreatedSpaces.find((space) => space.id === "sample-space-essay") as StudySpaceRecord

describe("sample roster", () => {
  it("is deterministic, leaves one seat free, and never seats two people together", () => {
    for (const space of [...sampleCreatedSpaces, ...sampleJoinedSpaces]) {
      const seats = buildSeats(space.kind, space.capacity)
      const roster = getSampleRoster(space, seats.length)

      expect(roster).toEqual(getSampleRoster(space, seats.length))
      expect(roster.length).toBeGreaterThan(0)
      expect(roster.length).toBeLessThan(seats.length)
      expect(new Set(roster.map((person) => person.seatIndex)).size).toBe(roster.length)
      expect(new Set(roster.map((person) => person.name)).size).toBe(roster.length)
      roster.forEach((person) => expect(SAMPLE_NAMES).toContain(person.name))
    }
  })

  it("seats at most three people in a four-seat space", () => {
    expect(essayWriters.capacity).toBe(4)
    expect(getSampleRoster(essayWriters, 4).length).toBeLessThanOrEqual(3)
  })
})

describe("discussion table, nap area and watch room", () => {
  const inside = (point: { x: number; z: number }, area: { minX: number; maxX: number; minZ: number; maxZ: number }) =>
    point.x > area.minX && point.x < area.maxX && point.z > area.minZ && point.z < area.maxZ

  it("seats everyone at one table that matches the capacity, facing the table", () => {
    for (const kind of ["focused", "collaborative", "lounge"] as const) {
      for (const capacity of [2, 4, 8]) {
        const seats = buildSeats(kind, capacity)
        expect(seats).toHaveLength(capacity)
        for (const seat of seats) {
          expect(seat.zone).toBe("discussion")
          expect(Math.abs(seat.sitPoint.x)).toBeLessThan(roomPlan.halfWidth)
          expect(Math.abs(seat.sitPoint.z)).toBeLessThan(roomPlan.halfDepth)
          expect(inside(seat.sitPoint, napArea) || inside(seat.sitPoint, watchRoom)).toBe(false)
          const toTable = Math.atan2(discussionTable.x - seat.sitPoint.x, discussionTable.z - seat.sitPoint.z)
          expect(seat.faceRotation).toBeCloseTo(toTable)
        }
      }
    }
    expect(buildSeats("lounge", 4).every((seat) => seat.furniture === "armchair")).toBe(true)
    expect(buildSeats("focused", 4).every((seat) => seat.furniture === "chair")).toBe(true)
  })

  it("puts nap mats in the nap area and sofa seats facing the watch-room screen", () => {
    const spots = buildRoomSpots()
    const mats = spots.filter((spot) => spot.furniture === "mat")
    const sofas = spots.filter((spot) => spot.furniture === "sofa")

    expect(mats.length).toBeGreaterThanOrEqual(2)
    mats.forEach((mat) => expect(inside(mat.anchor, napArea)).toBe(true))
    expect(sofas.length).toBeGreaterThanOrEqual(2)
    sofas.forEach((sofa) => {
      expect(inside(sofa.sitPoint, watchRoom)).toBe(true)
      expect(sofa.faceRotation).toBeCloseTo(Math.PI / 2)
    })
    expect(new Set(spots.map((spot) => spot.id)).size).toBe(spots.length)
  })

  it("adds at most one sample napper on a free mat with a name not already in the room", () => {
    for (const space of [...sampleCreatedSpaces, ...sampleJoinedSpaces]) {
      const seats = buildSeats(space.kind, space.capacity)
      const roster = getSampleRoster(space, seats.length)
      const nappers = getSampleNappers(space, roster, seats.length, 3)
      expect(nappers.length).toBeLessThanOrEqual(1)
      nappers.forEach((napper) => {
        expect(roster.map((person) => person.name)).not.toContain(napper.name)
        expect(napper.seatIndex).toBeGreaterThanOrEqual(seats.length)
        expect(napper.seatIndex).toBeLessThan(seats.length + 3)
      })
    }
  })
})

describe("group tasks", () => {
  const leader = { ...essayWriters, role: "owner" as const }
  const mate = { ...essayWriters, role: "member" as const }

  it("lets only the owner manage tasks", () => {
    expect(canManageTasks(leader)).toBe(true)
    expect(canManageTasks(mate)).toBe(false)
  })

  it("lets a group mate tick only the tasks that are theirs", () => {
    const own = createRoomTask({ title: "Read chapter", notes: "", due: "", assignee: "me" })
    const everyone = createRoomTask({ title: "Bring notes", notes: "", due: "", assignee: "everyone" })
    const theirs = createRoomTask({ title: "Slides", notes: "", due: "", assignee: "sample-1" })
    const tasks = [own, everyone, theirs]

    expect(canTickTask(theirs)).toBe(false)
    const toggled = toggleRoomTask(toggleRoomTask(toggleRoomTask(tasks, own.id), everyone.id), theirs.id)
    expect(toggled.map((task) => task.done)).toEqual([true, true, false])
  })

  it("reorders tasks and ignores moves past the ends", () => {
    const a = createRoomTask({ title: "A task", notes: "", due: "", assignee: "everyone" })
    const b = createRoomTask({ title: "B task", notes: "", due: "", assignee: "everyone" })

    expect(moveRoomTask([a, b], b.id, -1).map((task) => task.title)).toEqual(["B task", "A task"])
    expect(moveRoomTask([a, b], a.id, -1)).toEqual([a, b])
  })
})

describe("room TV links", () => {
  it("accepts https YouTube links in common shapes", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=4")).toBe("dQw4w9WgXcQ")
    expect(parseYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(parseYouTubeId("https://m.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
  })

  it("rejects non-https, other hosts, and malformed ids", () => {
    expect(parseYouTubeId("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull()
    expect(parseYouTubeId("https://evil.example/watch?v=dQw4w9WgXcQ")).toBeNull()
    expect(parseYouTubeId("https://www.youtube.com/watch?v=short")).toBeNull()
    expect(parseYouTubeId("javascript:alert(1)")).toBeNull()
    expect(parseYouTubeId("not a url")).toBeNull()
  })

  it("embeds through the privacy-enhanced domain", () => {
    expect(youTubeEmbedUrl("dQw4w9WgXcQ")).toContain("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")
  })
})

describe("drawer file rules", () => {
  it("accepts supported types within the limits", () => {
    expect(validateDrawerFile({ name: "notes.PDF", size: 1000 }, 0)).toBeNull()
    expect(validateDrawerFile({ name: "essay.docx", size: drawerMaxFileBytes }, 3)).toBeNull()
  })

  it("rejects unsupported, oversized, and overflow files", () => {
    expect(validateDrawerFile({ name: "run.exe", size: 10 }, 0)).toContain("not supported")
    expect(validateDrawerFile({ name: "big.pdf", size: drawerMaxFileBytes + 1 }, 0)).toContain("10 MB")
    expect(validateDrawerFile({ name: "one-more.txt", size: 10 }, drawerMaxFiles)).toContain("full")
  })
})
```

### `study-spaces-flow.test.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/study-spaces-flow.test.tsx`

```tsx
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { StudySpacesView } from "./study-spaces-view"
import { studySpacesStorageKey } from "./study-spaces-records"

vi.setConfig({ testTimeout: 20000 })

afterEach(cleanup)

beforeEach(() => {
  window.localStorage.clear()
})

function renderList() {
  return render(
    <MemoryRouter initialEntries={["/students/study-spaces"]}>
      <Routes>
        <Route path="/students/study-spaces" element={<StudySpacesView />} />
        <Route path="/students/study-spaces/:spaceId" element={<div>study room route</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("study spaces create flow", () => {
  it("creates a space with a room type and seats, then opens the room", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: "Create space" }))
    const dialog = screen.getByRole("dialog")

    await user.type(within(dialog).getByLabelText("Space name"), "Exam Crew")
    await user.click(within(dialog).getByRole("radio", { name: /Focused desks/ }))
    await user.click(within(dialog).getByRole("button", { name: "Increase seats" }))
    await user.click(within(dialog).getByRole("button", { name: "Increase seats" }))
    await user.click(within(dialog).getByRole("button", { name: /Create space/ }))

    expect(screen.getByText("study room route")).toBeTruthy()

    const stored = window.localStorage.getItem(studySpacesStorageKey)
    expect(stored).toBeTruthy()
    const records = JSON.parse(stored as string) as { kind: string; capacity: number; name: string }[]
    const created = records.find((record) => record.name === "Exam Crew")
    expect(created?.kind).toBe("focused")
    expect(created?.capacity).toBe(6)
  })

  it("links each space entry to its room route", () => {
    renderList()

    const spaceLink = screen.getByRole("link", { name: /Open Physics Group/ })
    expect(spaceLink.getAttribute("href")).toBe("/students/study-spaces/sample-space-physics")
  })

  it("shows room layout and seat count on each space card", () => {
    renderList()

    const createdList = screen.getByRole("list", { name: "Spaces you've created" })
    expect(createdList.textContent).toContain("Shared tables · 6 seats")
    expect(createdList.textContent).toContain("browser only")
  })

  it("removes a created space from the browser after confirming", async () => {
    const user = userEvent.setup()
    renderList()

    await user.click(screen.getByRole("button", { name: "More actions for Physics Group" }))
    const menu = await screen.findByRole("menu")
    await user.click(within(menu).getByRole("menuitem", { name: "Remove from this browser" }))

    const confirm = screen.getByRole("dialog")
    expect(confirm.textContent).toContain("local previews")
    await user.click(within(confirm).getByRole("button", { name: "Remove space" }))

    expect(screen.queryByRole("link", { name: /Open Physics Group/ })).toBeNull()

    const stored = window.localStorage.getItem(studySpacesStorageKey)
    const records = JSON.parse(stored as string) as { id: string }[]
    expect(records.some((record) => record.id === "sample-space-physics")).toBe(false)
  })
})
```

### `study-spaces-records.ts`

Current file: `src/components/features/personal-workspace/study-spaces/study-spaces-records.ts`

```ts
export type StudySpaceRole = "owner" | "member"

export type StudySpaceKind = "focused" | "collaborative" | "lounge"

export type StudySpaceRecord = {
  id: string
  name: string
  about: string
  role: StudySpaceRole
  kind: StudySpaceKind
  capacity: number
  createdAt: string
  inviteCode?: string
  // Local-only timestamp of the last time this browser opened the room.
  lastVisitedAt?: string
}

export const studySpaceKinds: { value: StudySpaceKind; label: string; description: string }[] = [
  {
    value: "focused",
    label: "Focused desks",
    description: "Individual desks facing the board for quiet, independent study.",
  },
  {
    value: "collaborative",
    label: "Shared tables",
    description: "Paired desks facing each other for group work and discussion.",
  },
  {
    value: "lounge",
    label: "Study lounge",
    description: "Round tables with casual seating for relaxed reading and review.",
  },
]

export const minSpaceCapacity = 2
export const maxSpaceCapacity = 8
export const defaultSpaceCapacity = 4

export type StudySpaceCharacter = {
  name: string
  bodyColor: string
  accentColor: string
  createdAt: string
}

export const studySpacesStorageKey = "owlio.student-study-spaces.v1"

export const studySpaceCharacterStoragePrefix = "owlio.study-space-character."

export const studyHallCharacterStorageKey = "owlio.study-hall-character.v1"

export const studySpacesGuidance =
  "A study space is for peer collaboration, not an official classroom. It never carries official grades, attendance, or educator feedback."

export const studySpacesStorageNotice =
  "Sample spaces are for layout preview only. Creating and joining a study space is not connected to a service, so new spaces are kept in this browser."

export const studySpacesJoinHint =
  "Joining by code or invitation is not connected yet. The code you enter is not verified by a service, and the space stays in this browser."

export const studySpacesOpenHint =
  "Select a space to open its local room preview. The room is not connected to a service, so no other students can see or join it."

export const studySpaceRoomPreviewNotice =
  "Local preview — only you are in this room. Other students cannot see your character or messages."

export const studySpaceChatLocalNotice =
  "Messages stay on this device for this visit and are not sent to other students."

export const sampleCreatedSpaces: StudySpaceRecord[] = [
  {
    id: "sample-space-physics",
    name: "Physics Group",
    about: "Weekly problem sets and past paper review.",
    role: "owner",
    kind: "collaborative",
    capacity: 6,
    createdAt: "2026-09-28T09:00:00.000Z",
  },
  {
    id: "sample-space-essay",
    name: "Essay Writers",
    about: "Peer review of argument outlines.",
    role: "owner",
    kind: "lounge",
    capacity: 4,
    createdAt: "2026-10-02T17:30:00.000Z",
  },
  {
    id: "sample-space-maths",
    name: "Maths Club",
    about: "Calculus drills before Friday.",
    role: "owner",
    kind: "focused",
    capacity: 6,
    createdAt: "2026-10-09T13:10:00.000Z",
  },
]

export const sampleJoinedSpaces: StudySpaceRecord[] = [
  {
    id: "sample-space-history",
    name: "History Circle",
    about: "Source analysis discussion.",
    role: "member",
    kind: "lounge",
    capacity: 8,
    createdAt: "2026-09-20T08:00:00.000Z",
  },
  {
    id: "sample-space-language",
    name: "Language Exchange",
    about: "Conversation practice twice a week.",
    role: "member",
    kind: "collaborative",
    capacity: 4,
    createdAt: "2026-10-05T19:45:00.000Z",
  },
]

export const studySpaceJoinedDiscoveryStorageKey = "owlio.study-space-joined-discovery.v1"

export const studySpacesDiscoveryCaption =
  "Preview spaces — joining is local only and codes are not verified."

export const studySpacesLockedTooltip = "Locked — preview space, needs a space code"

// Sample preview spaces for the locked wing. They are not saved spaces until joined locally,
// and they carry no members, owners, or activity.
export const sampleDiscoverySpaces: StudySpaceRecord[] = [
  {
    id: "discovery-reading-room",
    name: "Reading Room",
    about: "Quiet reading and review.",
    role: "member",
    kind: "lounge",
    capacity: 6,
    createdAt: "2026-08-12T09:00:00.000Z",
  },
  {
    id: "discovery-calculus-circle",
    name: "Calculus Circle",
    about: "Problem sets and worked examples.",
    role: "member",
    kind: "focused",
    capacity: 8,
    createdAt: "2026-08-20T09:00:00.000Z",
  },
  {
    id: "discovery-thesis-sprint",
    name: "Thesis Sprint",
    about: "Writing sprints and outline swaps.",
    role: "member",
    kind: "collaborative",
    capacity: 4,
    createdAt: "2026-09-03T09:00:00.000Z",
  },
  {
    id: "discovery-language-corner",
    name: "Language Corner",
    about: "Relaxed conversation practice.",
    role: "member",
    kind: "lounge",
    capacity: 4,
    createdAt: "2026-09-10T09:00:00.000Z",
  },
  {
    id: "discovery-quiet-floor",
    name: "Quiet Floor",
    about: "Silent independent study.",
    role: "member",
    kind: "focused",
    capacity: 8,
    createdAt: "2026-09-15T09:00:00.000Z",
  },
  {
    id: "discovery-design-crit",
    name: "Design Crit",
    about: "Peer critique sessions.",
    role: "member",
    kind: "collaborative",
    capacity: 6,
    createdAt: "2026-09-22T09:00:00.000Z",
  },
]

export function loadJoinedDiscoveryIds(): string[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(studySpaceJoinedDiscoveryStorageKey)
    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

export function saveJoinedDiscoveryIds(ids: string[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(studySpaceJoinedDiscoveryStorageKey, JSON.stringify(ids))
  } catch {
    return
  }
}

function isStudySpaceKind(value: unknown): value is StudySpaceKind {
  return value === "focused" || value === "collaborative" || value === "lounge"
}

function isStudySpaceRecord(value: unknown): value is StudySpaceRecord {
  if (typeof value !== "object" || value === null) return false
  const space = value as Record<string, unknown>

  if (space.inviteCode !== undefined && typeof space.inviteCode !== "string") return false
  if (space.lastVisitedAt !== undefined && typeof space.lastVisitedAt !== "string") return false

  return (
    typeof space.id === "string" &&
    typeof space.name === "string" &&
    typeof space.about === "string" &&
    typeof space.createdAt === "string" &&
    (space.role === "owner" || space.role === "member")
  )
}

// Records saved before room type/capacity existed get sensible defaults so the room still renders.
function normalizeStudySpace(space: StudySpaceRecord): StudySpaceRecord {
  const raw = space as Partial<StudySpaceRecord>
  const capacity =
    typeof raw.capacity === "number" && Number.isFinite(raw.capacity)
      ? Math.min(Math.max(Math.round(raw.capacity), minSpaceCapacity), maxSpaceCapacity)
      : defaultSpaceCapacity

  return {
    ...space,
    kind: isStudySpaceKind(raw.kind) ? raw.kind : "collaborative",
    capacity,
  }
}

export function createStudySpaceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `space-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function loadStudySpaces(): StudySpaceRecord[] {
  if (typeof window === "undefined") return [...sampleCreatedSpaces, ...sampleJoinedSpaces]

  try {
    const stored = window.localStorage.getItem(studySpacesStorageKey)
    if (!stored) return [...sampleCreatedSpaces, ...sampleJoinedSpaces]

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return [...sampleCreatedSpaces, ...sampleJoinedSpaces]

    return parsed.filter(isStudySpaceRecord).map(normalizeStudySpace)
  } catch {
    return [...sampleCreatedSpaces, ...sampleJoinedSpaces]
  }
}

export function saveStudySpaces(spaces: StudySpaceRecord[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(studySpacesStorageKey, JSON.stringify(spaces))
  } catch {
    return
  }
}

export function markStudySpaceVisited(spaceId: string): void {
  const spaces = loadStudySpaces()
  const index = spaces.findIndex((space) => space.id === spaceId)
  if (index === -1) return

  spaces[index] = { ...spaces[index], lastVisitedAt: new Date().toISOString() }
  saveStudySpaces(spaces)
}

export type SpaceSortKey = "recent" | "newest" | "name"

export function sortSpaces(spaces: StudySpaceRecord[], sort: SpaceSortKey): StudySpaceRecord[] {
  const sorted = [...spaces]
  if (sort === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === "newest") {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } else {
    sorted.sort((a, b) =>
      (b.lastVisitedAt ?? b.createdAt).localeCompare(a.lastVisitedAt ?? a.createdAt)
    )
  }
  return sorted
}

function isStudySpaceCharacter(value: unknown): value is StudySpaceCharacter {
  if (typeof value !== "object" || value === null) return false
  const character = value as Record<string, unknown>

  return (
    typeof character.name === "string" &&
    typeof character.bodyColor === "string" &&
    typeof character.accentColor === "string" &&
    typeof character.createdAt === "string"
  )
}

function loadCharacter(key: string): StudySpaceCharacter | null {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) return null

    const parsed: unknown = JSON.parse(stored)
    return isStudySpaceCharacter(parsed) ? parsed : null
  } catch {
    return null
  }
}

function saveCharacter(key: string, character: StudySpaceCharacter): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, JSON.stringify(character))
  } catch {
    return
  }
}

export function loadSpaceCharacter(spaceId: string): StudySpaceCharacter | null {
  return loadCharacter(`${studySpaceCharacterStoragePrefix}${spaceId}`)
}

export function saveSpaceCharacter(spaceId: string, character: StudySpaceCharacter): void {
  saveCharacter(`${studySpaceCharacterStoragePrefix}${spaceId}`, character)
}

// One browser-local character for walking the study hall; rooms default to it until customized.
export function loadHallCharacter(): StudySpaceCharacter | null {
  return loadCharacter(studyHallCharacterStorageKey)
}

export function saveHallCharacter(character: StudySpaceCharacter): void {
  saveCharacter(studyHallCharacterStorageKey, character)
}
```

### `study-spaces-view.tsx`

Current file: `src/components/features/personal-workspace/study-spaces/study-spaces-view.tsx`

```tsx
import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Globe2, Info, Layers, List, Maximize2, Minimize2, Plus, Search, Users } from "lucide-react"
import { cn } from "cn"
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

const StudyHallWorld = lazy(() => import("./study-hall-world"))

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
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState<StudySpaceRecord[]>(() => loadStudySpaces())
  const [joinedDiscoveryIds, setJoinedDiscoveryIds] = useState<string[]>(() => loadJoinedDiscoveryIds())
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinTarget, setJoinTarget] = useState<StudySpaceRecord | null>(null)
  const [sort, setSort] = useState<SpaceSortKey>("recent")
  const [query, setQuery] = useState("")
  const [webgl] = useState(hasWebGL)
  const [view, setView] = useState<HallView>(() => (webgl ? "world" : "list"))
  const [expanded, setExpanded] = useState(false)

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

  function changeView(next: HallView) {
    setView(next)
    if (next === "list") setExpanded(false)
  }

  const overlay = view === "world"
  const pill = overlay ? "bg-white/95 shadow-sm" : "bg-white shadow-sm"

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
      <p className={cn("rounded-full px-3 py-2 text-xs font-medium text-slate-600", pill)}>
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
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
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
        <Button type="button" size="sm" className="rounded-full shadow-sm" onClick={() => setCreateOpen(true)}>
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
          Join space
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
      {view === "world" ? (
        <section
          aria-labelledby="study-hall-title"
          className={cn(
            "overflow-hidden bg-[#e3f1fb]",
            expanded
              ? "fixed inset-0 z-40"
              : "relative h-[calc(100svh-6rem)] min-h-[520px] rounded-3xl border border-slate-200 shadow-sm sm:h-[calc(100svh-7rem)] lg:h-[calc(100svh-8rem)]"
          )}
        >
          {webgl ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-slate-600">
                  Loading study hall…
                </div>
              }
            >
              <StudyHallWorld
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

          <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <Users className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
            <p className="flex-1 text-sm leading-6 text-blue-800">{studySpacesGuidance}</p>
            <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {studySpacesStorageNotice}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="flex items-baseline gap-2 text-2xl font-bold text-slate-900">
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
                  <p className="mt-1 text-xs leading-5 text-slate-500">{studySpacesDiscoveryCaption}</p>
                </div>
                <LockedSpaceGrid label="Preview spaces (locked)" spaces={lockedSpaces} onUnlock={openJoin} />
              </div>
            )}
          </div>

          <p className="text-xs leading-5 text-slate-500">{studySpacesOpenHint}</p>
        </section>
      )}

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
```

### `traffic-paths.test.ts`

Current file: `src/components/features/personal-workspace/study-spaces/traffic-paths.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { layoutCity } from "./city-layout"
import { sampleCreatedSpaces, sampleDiscoverySpaces, sampleJoinedSpaces } from "./study-spaces-records"
import {
  buildLoop,
  cityLoops,
  pointAt,
  SIGNAL_CYCLE,
  signalFor,
  signalizedIntersections,
} from "./traffic-paths"

const city = layoutCity([
  { role: "owner", spaces: sampleCreatedSpaces },
  { role: "member", spaces: sampleJoinedSpaces },
  { role: "visitor", spaces: sampleDiscoverySpaces },
])

describe("traffic signals", () => {
  it("never shows green to both roads at once and gives each road a green phase", () => {
    let nsGreen = false
    let ewGreen = false
    for (let time = 0; time < SIGNAL_CYCLE; time += 0.25) {
      for (const group of [0, 1] as const) {
        const ns = signalFor("ns", time, group)
        const ew = signalFor("ew", time, group)
        expect(ns !== "red" && ew !== "red").toBe(false)
        nsGreen ||= ns === "green"
        ewGreen ||= ew === "green"
      }
    }
    expect(nsGreen && ewGreen).toBe(true)
  })

  it("puts no signal on the roundabout or the outer corners", () => {
    const intersections = signalizedIntersections(city)
    expect(intersections.length).toBeGreaterThan(0)
    expect(intersections.some((item) => item.x === city.roundabout.x && item.z === city.roundabout.z)).toBe(false)
    const corner = { x: city.roadsX[0], z: city.roadsZ[0] }
    expect(intersections.some((item) => item.x === corner.x && item.z === corner.z)).toBe(false)
  })
})

describe("traffic loops", () => {
  const intersections = signalizedIntersections(city)
  const paths = cityLoops(city).map((corners) => buildLoop(city, corners, intersections))

  it("keeps every car path out of the fountain island and inside the city", () => {
    for (const path of paths) {
      expect(path.total).toBeGreaterThan(0)
      for (const point of path.points) {
        expect(Math.hypot(point.x - city.roundabout.x, point.z - city.roundabout.z)).toBeGreaterThan(city.roundabout.island)
        expect(Math.abs(point.x)).toBeLessThan(city.width / 2)
        expect(Math.abs(point.z)).toBeLessThan(city.depth / 2)
      }
    }
  })

  it("routes at least one loop round the roundabout and adds stop points at signals", () => {
    const circles = paths.some((path) =>
      path.points.some((point) => Math.hypot(point.x - city.roundabout.x, point.z - city.roundabout.z) < city.roundabout.ring)
    )
    expect(circles).toBe(true)
    expect(paths.every((path) => path.stops.length > 0)).toBe(true)
  })

  it("samples positions continuously along a loop", () => {
    const path = paths[0]
    const a = pointAt(path, 1)
    const b = pointAt(path, 1.2)
    expect(Math.hypot(b.x - a.x, b.z - a.z)).toBeLessThan(0.5)
    const wrapped = pointAt(path, path.total + 1)
    expect(wrapped.x).toBeCloseTo(a.x)
    expect(wrapped.z).toBeCloseTo(a.z)
  })
})
```

### `traffic-paths.ts`

Current file: `src/components/features/personal-workspace/study-spaces/traffic-paths.ts`

```ts
import { ROAD, type CityLayout } from "./city-layout"

export type Axis = "ns" | "ew"
export type Signal = "green" | "yellow" | "red"

export type Intersection = { id: string; x: number; z: number; group: 0 | 1 }

export type StopEvent = { s: number; intersection: Intersection; axis: Axis }

export type TrafficPath = {
  points: { x: number; z: number }[]
  headings: number[]
  lengths: number[]
  total: number
  stops: StopEvent[]
}

export const LANE_OFFSET = 0.95
const SAMPLE_STEP = 0.25
const TURN_RADIUS = 1.4
// Cars stop before the crosswalk that sits just outside each intersection.
const STOP_BACKOFF = 3.1

// Signal cycle in seconds: north-south green, yellow, all red, east-west green, yellow, all red.
const GREEN = 9
const YELLOW = 2
const ALL_RED = 1
export const SIGNAL_CYCLE = (GREEN + YELLOW + ALL_RED) * 2

export function signalFor(axis: Axis, time: number, group: 0 | 1): Signal {
  const t = (((time + group * (SIGNAL_CYCLE / 2)) % SIGNAL_CYCLE) + SIGNAL_CYCLE) % SIGNAL_CYCLE
  const half = GREEN + YELLOW + ALL_RED
  const local = axis === "ns" ? t : (t + half) % SIGNAL_CYCLE
  if (local < GREEN) return "green"
  if (local < GREEN + YELLOW) return "yellow"
  return "red"
}

// Signalized intersections: every crossing except the roundabout and the four outer corners.
export function signalizedIntersections(layout: CityLayout): Intersection[] {
  const result: Intersection[] = []
  layout.roadsX.forEach((x, i) =>
    layout.roadsZ.forEach((z, j) => {
      const corner = (i === 0 || i === layout.roadsX.length - 1) && (j === 0 || j === layout.roadsZ.length - 1)
      const roundabout = Math.abs(x - layout.roundabout.x) < 0.01 && Math.abs(z - layout.roundabout.z) < 0.01
      if (!corner && !roundabout) result.push({ id: `${i}-${j}`, x, z, group: ((i + j) % 2) as 0 | 1 })
    })
  )
  return result
}

type Pt = { x: number; z: number }

function rightOf(dx: number, dz: number) {
  return { x: -dz, z: dx }
}

// Builds the lane polyline for a loop around a rectangle of road centerlines,
// with rounded corners and a counter-clockwise detour round the roundabout island.
export function buildLoop(layout: CityLayout, corners: Pt[], intersections: Intersection[]): TrafficPath {
  const ring = layout.roundabout
  const ringLane = ring.island + (ring.ring - ring.island) / 2
  const raw: Pt[] = []

  const edges = corners.map((from, index) => ({ from, to: corners[(index + 1) % corners.length] }))
  // Lane-offset corner points: the intersection of consecutive offset edges.
  const laneCorners = corners.map((corner, index) => {
    const before = edges[(index - 1 + edges.length) % edges.length]
    const after = edges[index]
    const d1 = normalize(before.to.x - before.from.x, before.to.z - before.from.z)
    const d2 = normalize(after.to.x - after.from.x, after.to.z - after.from.z)
    const r1 = rightOf(d1.x, d1.z)
    const r2 = rightOf(d2.x, d2.z)
    return { x: corner.x + (r1.x + r2.x) * LANE_OFFSET, z: corner.z + (r1.z + r2.z) * LANE_OFFSET, d1, d2 }
  })

  laneCorners.forEach((corner, index) => {
    const next = laneCorners[(index + 1) % laneCorners.length]
    const d = corner.d2
    // Rounded corner arc.
    const start = { x: corner.x - corner.d1.x * TURN_RADIUS, z: corner.z - corner.d1.z * TURN_RADIUS }
    const end = { x: corner.x + d.x * TURN_RADIUS, z: corner.z + d.z * TURN_RADIUS }
    for (let t = 0; t <= 1; t += 0.125) {
      const a = { x: start.x + (corner.x - start.x) * t, z: start.z + (corner.z - start.z) * t }
      const b = { x: corner.x + (end.x - corner.x) * t, z: corner.z + (end.z - corner.z) * t }
      raw.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t })
    }

    // Straight run to the next corner, detouring round the roundabout if it lies on this edge.
    const from = end
    const to = { x: next.x - d.x * TURN_RADIUS, z: next.z - d.z * TURN_RADIUS }
    const length = Math.hypot(to.x - from.x, to.z - from.z)
    const center = { x: ring.x, z: ring.z }
    const along = (center.x - from.x) * d.x + (center.z - from.z) * d.z
    const across = Math.abs((center.x - from.x) * -d.z + (center.z - from.z) * d.x)
    const throughRing = along > 0 && along < length && across < LANE_OFFSET + 0.2

    if (!throughRing) {
      raw.push(from)
      return
    }
    const half = Math.sqrt(Math.max(ringLane * ringLane - LANE_OFFSET * LANE_OFFSET, 0.01))
    const entry = { x: from.x + d.x * (along - half), z: from.z + d.z * (along - half) }
    const exit = { x: from.x + d.x * (along + half), z: from.z + d.z * (along + half) }
    raw.push(from, entry)
    let a0 = Math.atan2(entry.z - center.z, entry.x - center.x)
    const a1 = Math.atan2(exit.z - center.z, exit.x - center.x)
    // Counter-clockwise on the map means decreasing angle in x/z.
    while (a0 < a1) a0 += Math.PI * 2
    const steps = 18
    for (let step = 1; step < steps; step += 1) {
      const angle = a0 + ((a1 - a0) * step) / steps
      raw.push({ x: center.x + Math.cos(angle) * ringLane, z: center.z + Math.sin(angle) * ringLane })
    }
    raw.push(exit)
  })

  return samplePath(raw, intersections)
}

function normalize(x: number, z: number) {
  const length = Math.hypot(x, z) || 1
  return { x: x / length, z: z / length }
}

function samplePath(input: Pt[], intersections: Intersection[]): TrafficPath {
  const raw = input.filter((point, index) => {
    const next = input[(index + 1) % input.length]
    return Math.hypot(next.x - point.x, next.z - point.z) > 1e-4
  })
  const points: Pt[] = []
  for (let index = 0; index < raw.length; index += 1) {
    const a = raw[index]
    const b = raw[(index + 1) % raw.length]
    const length = Math.hypot(b.x - a.x, b.z - a.z)
    const steps = Math.max(1, Math.ceil(length / SAMPLE_STEP))
    for (let step = 0; step < steps; step += 1) {
      points.push({ x: a.x + ((b.x - a.x) * step) / steps, z: a.z + ((b.z - a.z) * step) / steps })
    }
  }

  const lengths: number[] = [0]
  const headings: number[] = []
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % points.length]
    headings.push(Math.atan2(b.x - a.x, b.z - a.z))
    if (index > 0) lengths.push(lengths[index - 1] + Math.hypot(a.x - points[index - 1].x, a.z - points[index - 1].z))
  }
  const last = points[points.length - 1]
  const total = lengths[lengths.length - 1] + Math.hypot(points[0].x - last.x, points[0].z - last.z)

  const stops: StopEvent[] = []
  const box = ROAD / 2
  for (const intersection of intersections) {
    for (let index = 0; index < points.length; index += 1) {
      const p = points[index]
      const previous = points[(index - 1 + points.length) % points.length]
      const inside = Math.abs(p.x - intersection.x) < box && Math.abs(p.z - intersection.z) < box
      const wasInside = Math.abs(previous.x - intersection.x) < box && Math.abs(previous.z - intersection.z) < box
      if (inside && !wasInside) {
        const dx = p.x - previous.x
        const dz = p.z - previous.z
        stops.push({
          s: (lengths[index] - STOP_BACKOFF + total) % total,
          intersection,
          axis: Math.abs(dx) > Math.abs(dz) ? "ew" : "ns",
        })
      }
    }
  }

  return { points, headings, lengths, total, stops }
}

export function pointAt(path: TrafficPath, s: number) {
  const wrapped = ((s % path.total) + path.total) % path.total
  let low = 0
  let high = path.lengths.length - 1
  while (low < high) {
    const mid = (low + high + 1) >> 1
    if (path.lengths[mid] <= wrapped) low = mid
    else high = mid - 1
  }
  const a = path.points[low]
  const b = path.points[(low + 1) % path.points.length]
  const next = low + 1 < path.lengths.length ? path.lengths[low + 1] : path.total
  const t = next > path.lengths[low] ? (wrapped - path.lengths[low]) / (next - path.lengths[low]) : 0
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, heading: path.headings[low] }
}

// A handful of loops: the outer ring road both ways and loops through the roundabout street.
export function cityLoops(layout: CityLayout): Pt[][] {
  const { roadsX, roadsZ, roundabout } = layout
  const xi = roadsX.findIndex((x) => Math.abs(x - roundabout.x) < 0.01)
  const zi = roadsZ.findIndex((z) => Math.abs(z - roundabout.z) < 0.01)
  const lastX = roadsX.length - 1
  const lastZ = roadsZ.length - 1
  const rect = (x0: number, x1: number, z0: number, z1: number, clockwise: boolean): Pt[] => {
    const loop = [
      { x: roadsX[x0], z: roadsZ[z0] },
      { x: roadsX[x1], z: roadsZ[z0] },
      { x: roadsX[x1], z: roadsZ[z1] },
      { x: roadsX[x0], z: roadsZ[z1] },
    ]
    return clockwise ? loop : loop.reverse()
  }
  // Loop corners never sit on the roundabout; loops cross it straight through instead.
  return [
    rect(0, lastX, 0, lastZ, true),
    rect(0, lastX, 0, lastZ, false),
    rect(0, lastX, 0, zi, true),
    rect(0, lastX, zi, lastZ, false),
    rect(0, xi, 0, lastZ, true),
    rect(xi, lastX, 0, lastZ, false),
  ]
}
```

### `use-walk-keys.ts`

Current file: `src/components/features/personal-workspace/study-spaces/use-walk-keys.ts`

```ts
import { useCallback, useEffect, useRef } from "react"
import type { Camera } from "three"

export type WalkKey = "up" | "down" | "left" | "right"

const KEY_CODES: Record<string, WalkKey> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target.closest("[role='dialog'], [role='menu'], [role='listbox']")) return true
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

// Held movement keys (WASD/arrows) plus on-screen pad presses, read every frame by the scene.
export function useWalkKeys(enabled: boolean, onPress?: () => void) {
  const heldRef = useRef(new Set<WalkKey>())
  const onPressRef = useRef(onPress)

  useEffect(() => {
    onPressRef.current = onPress
  }, [onPress])

  useEffect(() => {
    const keys = heldRef.current
    if (!enabled) {
      keys.clear()
      return
    }

    function down(event: KeyboardEvent) {
      const key = KEY_CODES[event.code]
      if (!key || event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return
      event.preventDefault()
      if (!keys.has(key)) onPressRef.current?.()
      keys.add(key)
    }
    function up(event: KeyboardEvent) {
      const key = KEY_CODES[event.code]
      if (key) keys.delete(key)
    }
    function clear() {
      keys.clear()
    }

    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", clear)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", clear)
      keys.clear()
    }
  }, [enabled])

  const setPad = useCallback((key: WalkKey, pressed: boolean) => {
    if (pressed) {
      if (!heldRef.current.has(key)) onPressRef.current?.()
      heldRef.current.add(key)
    } else {
      heldRef.current.delete(key)
    }
  }, [])

  return { heldRef, setPad }
}

// Converts heldRef keys into a ground-plane direction relative to where the camera looks.
export function walkDirection(keys: Set<WalkKey>, camera: Camera, target: { x: number; z: number }) {
  const forward = (keys.has("up") ? 1 : 0) - (keys.has("down") ? 1 : 0)
  const strafe = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0)
  if (forward === 0 && strafe === 0) return null

  let fx = target.x - camera.position.x
  let fz = target.z - camera.position.z
  const length = Math.hypot(fx, fz) || 1
  fx /= length
  fz /= length

  const x = fx * forward - fz * strafe
  const z = fz * forward + fx * strafe
  const size = Math.hypot(x, z) || 1
  return { x: x / size, z: z / size }
}
```

<!-- END GENERATED CURRENT SOURCE -->
