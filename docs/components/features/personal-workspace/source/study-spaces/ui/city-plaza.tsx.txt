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
