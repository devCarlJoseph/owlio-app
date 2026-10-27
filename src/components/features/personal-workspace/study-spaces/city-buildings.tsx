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
