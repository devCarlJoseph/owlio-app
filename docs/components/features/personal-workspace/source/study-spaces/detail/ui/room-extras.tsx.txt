import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, useCursor } from "@react-three/drei"
import { CanvasTexture, SRGBColorSpace, type Group } from "three"
import type { RoomTask } from "./room-tasks"

type Vec3 = [number, number, number]

function useHoverClick(onActivate: () => void) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return {
    hovered,
    handlers: {
      onClick: (event: { stopPropagation: () => void; delta: number }) => {
        if (event.delta > 4) return
        event.stopPropagation()
        onActivate()
      },
      onPointerOver: (event: { stopPropagation: () => void }) => {
        event.stopPropagation()
        setHovered(true)
      },
      onPointerOut: () => setHovered(false),
    },
  }
}

function HoverTag({ label }: { label: string }) {
  return (
    <Html position={[0, 0.2, 0.2]} center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
      <span className="block rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow">
        {label}
      </span>
    </Html>
  )
}

function drawBoard(tasks: RoomTask[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = 640
  canvas.height = 360
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  ctx.fillStyle = "#f8fafc"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#1d4ed8"
  ctx.font = "bold 34px sans-serif"
  ctx.fillText("Group tasks", 28, 52)
  ctx.fillStyle = "#cbd5e1"
  ctx.fillRect(28, 66, 584, 3)

  const visible = tasks.slice(0, 5)
  if (visible.length === 0) {
    ctx.fillStyle = "#64748b"
    ctx.font = "26px sans-serif"
    ctx.fillText("No tasks yet — click to open", 28, 130)
  }
  visible.forEach((task, index) => {
    const y = 112 + index * 52
    ctx.strokeStyle = "#334155"
    ctx.lineWidth = 3
    ctx.strokeRect(30, y - 24, 28, 28)
    if (task.done) {
      ctx.strokeStyle = "#15803d"
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(35, y - 10)
      ctx.lineTo(43, y - 1)
      ctx.lineTo(56, y - 22)
      ctx.stroke()
    }
    ctx.fillStyle = task.done ? "#94a3b8" : "#0f172a"
    ctx.font = "28px sans-serif"
    const title = task.title.length > 30 ? `${task.title.slice(0, 29)}…` : task.title
    ctx.fillText(title, 74, y)
  })
  if (tasks.length > visible.length) {
    ctx.fillStyle = "#64748b"
    ctx.font = "22px sans-serif"
    ctx.fillText(`+${tasks.length - visible.length} more`, 28, 345)
  }
  return canvas
}

export function TaskWhiteboard({
  position,
  tasks,
  onOpen,
}: {
  position: Vec3
  tasks: RoomTask[]
  onOpen: () => void
}) {
  const { hovered, handlers } = useHoverClick(onOpen)
  const texture = useMemo(() => {
    const created = new CanvasTexture(drawBoard(tasks))
    created.colorSpace = SRGBColorSpace
    return created
  }, [tasks])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={position} {...handlers}>
      <mesh castShadow>
        <boxGeometry args={[2.9, 1.7, 0.08]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[2.72, 1.53]} />
        <meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={hovered ? 0.35 : 0.12} />
      </mesh>
      <mesh position={[0, -0.9, 0.1]}>
        <boxGeometry args={[2.4, 0.06, 0.14]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      {hovered ? <HoverTag label="Group task board" /> : null}
    </group>
  )
}

export function RoomTv({
  position,
  hasVideo,
  onOpen,
}: {
  position: Vec3
  hasVideo: boolean
  onOpen: () => void
}) {
  const { hovered, handlers } = useHoverClick(onOpen)
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 288
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = hasVideo ? "#0f172a" : "#020617"
      ctx.fillRect(0, 0, 512, 288)
      if (hasVideo) {
        ctx.fillStyle = "#dc2626"
        ctx.beginPath()
        ctx.roundRect(196, 94, 120, 84, 22)
        ctx.fill()
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.moveTo(238, 114)
        ctx.lineTo(238, 158)
        ctx.lineTo(278, 136)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = "#e2e8f0"
        ctx.font = "24px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Video ready — click to watch", 256, 232)
      } else {
        ctx.fillStyle = "#475569"
        ctx.font = "26px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("TV off — click to set a video", 256, 150)
      }
    }
    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    return created
  }, [hasVideo])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={position} {...handlers}>
      <mesh castShadow>
        <boxGeometry args={[2.9, 1.7, 0.1]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.72, 1.53]} />
        <meshStandardMaterial map={texture} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={hovered ? 0.7 : 0.45} />
      </mesh>
      <mesh position={[0, -1.35, 0.1]}>
        <boxGeometry args={[3.2, 0.5, 0.5]} />
        <meshStandardMaterial color="#6d5634" />
      </mesh>
      {hovered ? <HoverTag label="Room TV" /> : null}
    </group>
  )
}

export type LockerSlot = { id: string; label: string; color: string; mine: boolean; open: boolean }

const LOCKER_W = 0.7
const LOCKER_H = 0.88

function LockerDoor({ slot, x, y, onSelect }: { slot: LockerSlot; x: number; y: number; onSelect: (id: string) => void }) {
  const { hovered, handlers } = useHoverClick(() => onSelect(slot.id))
  const door = useRef<Group>(null)
  const swing = slot.open ? -0.9 : 0

  useFrame((_, delta) => {
    const node = door.current
    if (node) node.rotation.y += (swing - node.rotation.y) * Math.min(1, delta * 8)
  })

  const status = slot.mine ? "your locker" : slot.open ? "unlocked" : "locked — needs their code"

  return (
    <group position={[x, y, 0.31]} {...handlers}>
      <mesh position={[0, LOCKER_H / 2, -0.04]}>
        <boxGeometry args={[LOCKER_W - 0.08, LOCKER_H - 0.08, 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {slot.open ? (
        <mesh position={[0, LOCKER_H * 0.35, -0.02]}>
          <boxGeometry args={[0.4, 0.2, 0.02]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      ) : null}
      <group ref={door} position={[-LOCKER_W / 2 + 0.04, 0, 0]}>
        <mesh position={[LOCKER_W / 2 - 0.04, LOCKER_H / 2, 0]} castShadow>
          <boxGeometry args={[LOCKER_W - 0.06, LOCKER_H - 0.06, 0.04]} />
          <meshStandardMaterial color={slot.color} emissive={slot.color} emissiveIntensity={hovered ? 0.25 : 0} />
        </mesh>
        {[0.62, 0.68, 0.74].map((vy) => (
          <mesh key={vy} position={[LOCKER_W / 2 - 0.04, vy, 0.025]}>
            <boxGeometry args={[0.3, 0.025, 0.01]} />
            <meshStandardMaterial color="#0f172a" transparent opacity={0.35} />
          </mesh>
        ))}
        <mesh position={[LOCKER_W - 0.16, LOCKER_H / 2 - 0.06, 0.035]}>
          <boxGeometry args={[0.08, 0.1, 0.03]} />
          <meshStandardMaterial
            color={slot.mine || slot.open ? "#22c55e" : "#ef4444"}
            emissive={slot.mine || slot.open ? "#22c55e" : "#ef4444"}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      {hovered ? <HoverTag label={`${slot.label} · ${status}`} /> : null}
    </group>
  )
}

// Two-row locker wall; one locker per person in the room. Opening others needs their code.
export function LockerWall({ position, slots, onSelect }: { position: Vec3; slots: LockerSlot[]; onSelect: (id: string) => void }) {
  const columns = Math.max(1, Math.ceil(slots.length / 2))
  const width = columns * LOCKER_W + 0.1

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, LOCKER_H + 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, LOCKER_H * 2 + 0.24, 0.6]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, LOCKER_H * 2 + 0.27, 0]}>
        <boxGeometry args={[width + 0.08, 0.06, 0.66]} />
        <meshStandardMaterial color="#2f6fe4" />
      </mesh>
      {slots.map((slot, index) => {
        const column = Math.floor(index / 2)
        const row = index % 2
        return (
          <LockerDoor
            key={slot.id}
            slot={slot}
            x={-width / 2 + 0.05 + column * LOCKER_W + LOCKER_W / 2}
            y={row === 0 ? LOCKER_H + 0.16 : 0.08}
            onSelect={onSelect}
          />
        )
      })}
      <Html position={[0, LOCKER_H * 2 + 0.6, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[12, 0]}>
        <span className="block whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
          Lockers
        </span>
      </Html>
    </group>
  )
}

export function RadioSet({
  position,
  playing,
  onToggle,
  reducedMotion,
}: {
  position: Vec3
  playing: boolean
  onToggle: () => void
  reducedMotion: boolean
}) {
  const { hovered, handlers } = useHoverClick(onToggle)
  const cone = useRef<Group>(null)

  useFrame(({ clock }) => {
    const node = cone.current
    if (!node || reducedMotion) return
    const pulse = playing ? 1 + Math.sin(clock.elapsedTime * 8) * 0.06 : 1
    node.scale.set(pulse, pulse, 1)
  })

  return (
    <group position={position} {...handlers}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.7, 0.32, 0.26]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <group ref={cone} position={[-0.18, 0.16, 0.14]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 20]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      <mesh position={[0.18, 0.2, 0.14]}>
        <boxGeometry args={[0.22, 0.08, 0.02]} />
        <meshStandardMaterial color={playing ? "#22c55e" : "#64748b"} emissive={playing ? "#22c55e" : "#000000"} emissiveIntensity={playing ? 0.8 : 0} />
      </mesh>
      {hovered ? <HoverTag label={playing ? "Pause room music" : "Play room music"} /> : null}
    </group>
  )
}
