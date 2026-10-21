import { useRef, useState, type RefObject } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html, OrbitControls } from "@react-three/drei"
import type { Group } from "three"
import type { StudySpaceCharacter, StudySpaceKind } from "../study-spaces-records"

export type CameraResetHandle = {
  reset: () => void
}

export type SpaceRoomSceneProps = {
  character: StudySpaceCharacter
  kind: StudySpaceKind
  capacity: number
  showNameTag: boolean
  bubbleText: string | null
  cameraResetRef: RefObject<CameraResetHandle | null>
}

const ROOM = { halfWidth: 7, halfDepth: 5, wallHeight: 3 }
const MOVE_MARGIN = 0.5
const WALK_SPEED = 2.6

type SeatSpot = { position: [number, number, number]; rotationY: number }

const FOCUSED_SEATS: SeatSpot[] = [
  { position: [-4.6, 0, -2.7], rotationY: 0 },
  { position: [-1.6, 0, -2.7], rotationY: 0 },
  { position: [1.6, 0, -2.7], rotationY: 0 },
  { position: [4.6, 0, -2.7], rotationY: 0 },
  { position: [-4.6, 0, -0.9], rotationY: 0 },
  { position: [-1.6, 0, -0.9], rotationY: 0 },
  { position: [1.6, 0, -0.9], rotationY: 0 },
  { position: [4.6, 0, -0.9], rotationY: 0 },
]

const COLLABORATIVE_SEATS: SeatSpot[] = [
  { position: [-4.6, 0, -2.2], rotationY: 0 },
  { position: [-4.6, 0, -0.4], rotationY: Math.PI },
  { position: [-2.6, 0, -2.2], rotationY: 0 },
  { position: [-2.6, 0, -0.4], rotationY: Math.PI },
  { position: [1.6, 0, -2.2], rotationY: 0 },
  { position: [1.6, 0, -0.4], rotationY: Math.PI },
  { position: [3.6, 0, -2.2], rotationY: 0 },
  { position: [3.6, 0, -0.4], rotationY: Math.PI },
]

const LOUNGE_TABLES: [number, number][] = [
  [-2.9, 1.4],
  [2.9, 1.4],
]
const STOOL_OFFSETS: [number, number][] = [
  [0, -1.15],
  [1.15, 0],
  [0, 1.15],
  [-1.15, 0],
]

const SPAWN_POINTS: Record<StudySpaceKind, { x: number; z: number }> = {
  focused: { x: 0, z: 1 },
  collaborative: { x: 4.9, z: 1.4 },
  lounge: { x: 0, z: -0.6 },
}

const BOOK_COLORS = ["#b91c1c", "#1d4ed8", "#15803d", "#a16207", "#7e22ce", "#0e7490", "#be185d"]

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function SpaceRoomScene({
  character,
  kind,
  capacity,
  showNameTag,
  bubbleText,
  cameraResetRef,
}: SpaceRoomSceneProps) {
  const spawn = SPAWN_POINTS[kind]
  const [moveTarget, setMoveTarget] = useState(spawn)

  function handleFloorClick(point: { x: number; z: number }) {
    setMoveTarget({
      x: Math.min(Math.max(point.x, -ROOM.halfWidth + MOVE_MARGIN), ROOM.halfWidth - MOVE_MARGIN),
      z: Math.min(Math.max(point.z, -ROOM.halfDepth + MOVE_MARGIN), ROOM.halfDepth - MOVE_MARGIN),
    })
  }

  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: [12, 12, 12], zoom: 52, near: -100, far: 300 }}
      aria-label="3D study room preview. Use the chat input and overlay buttons to interact."
      fallback={
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-300">
          The 3D room preview could not start because WebGL is unavailable in this browser. You can
          still use the space chat below.
        </div>
      }
    >
      <color attach="background" args={["#0f172a"]} />
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />

      <OrbitControls
        ref={(controls) => {
          cameraResetRef.current = controls
        }}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        target={[0, 0.6, 0]}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        minZoom={30}
        maxZoom={120}
      />

      <RoomShell kind={kind} capacity={capacity} onFloorClick={handleFloorClick} />
      <SpaceCharacter
        character={character}
        spawn={spawn}
        target={moveTarget}
        showNameTag={showNameTag}
        bubbleText={bubbleText}
      />
    </Canvas>
  )
}

function RoomShell({
  kind,
  capacity,
  onFloorClick,
}: {
  kind: StudySpaceKind
  capacity: number
  onFloorClick: (point: { x: number; z: number }) => void
}) {
  return (
    <group>
      {/* Dark ground beyond the room so the floor never floats in empty space. */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#16202f" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation()
          onFloorClick({ x: event.point.x, z: event.point.z })
        }}
      >
        <planeGeometry args={[ROOM.halfWidth * 2, ROOM.halfDepth * 2]} />
        <meshStandardMaterial color="#b98f63" />
      </mesh>

      {/* Walls and skirting on the two camera-facing sides so the corner reads as one room. */}
      <mesh position={[0, ROOM.wallHeight / 2, -ROOM.halfDepth]} receiveShadow>
        <boxGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight, 0.15]} />
        <meshStandardMaterial color="#e7edf3" />
      </mesh>
      <mesh position={[-ROOM.halfWidth, ROOM.wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.15, ROOM.wallHeight, ROOM.halfDepth * 2]} />
        <meshStandardMaterial color="#dbe3ec" />
      </mesh>
      <Skirting position={[0, 0.06, -ROOM.halfDepth + 0.09]} size={[ROOM.halfWidth * 2, 0.12, 0.04]} />
      <Skirting position={[-ROOM.halfWidth + 0.09, 0.06, 0]} size={[0.04, 0.12, ROOM.halfDepth * 2]} />
      {/* Low trim on the open edges so the floor border looks finished instead of cut off. */}
      <Skirting position={[0, 0.03, ROOM.halfDepth - 0.02]} size={[ROOM.halfWidth * 2, 0.06, 0.04]} />
      <Skirting position={[ROOM.halfWidth - 0.02, 0.03, 0]} size={[0.04, 0.06, ROOM.halfDepth * 2]} />

      <WindowPane position={[-3.2, 1.8, -ROOM.halfDepth + 0.1]} />
      <WindowPane position={[3.2, 1.8, -ROOM.halfDepth + 0.1]} />
      <WallClock position={[0, 2.15, -ROOM.halfDepth + 0.1]} />
      <PinBoard position={[-5.6, 1.6, -ROOM.halfDepth + 0.1]} />

      <Bookshelf position={[-ROOM.halfWidth + 0.32, 0, 1.8]} />
      <RoomDoor position={[-ROOM.halfWidth + 0.1, 0, 3.6]} />

      <PendantLamp position={[-3.4, 0, -1.4]} />
      <PendantLamp position={[3.4, 0, -1.4]} />
      <PendantLamp position={[0, 0, 2.2]} />

      <Whiteboard position={kind === "focused" ? [0, 0, -4.55] : [5.8, 0, -4.3]} rotationY={kind === "focused" ? 0 : -0.3} />

      <Plant position={[-6.2, 0, -4.1]} />
      <Plant position={[6.2, 0, 4.1]} />

      {kind === "lounge" ? (
        <LoungeSeating capacity={capacity} />
      ) : (
        <DeskSeating spots={(kind === "focused" ? FOCUSED_SEATS : COLLABORATIVE_SEATS).slice(0, capacity)} />
      )}

      {kind === "collaborative" ? <RoundNook position={[4.6, 0, 2.6]} /> : null}
      {kind === "focused" ? <RoundNook position={[4.8, 0, 2.8]} /> : null}
    </group>
  )
}

function Skirting({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}

function WindowPane({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.9, 1.4, 0.06]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[1.7, 1.2, 0.02]} />
        <meshStandardMaterial color="#8ecae6" emissive="#8ecae6" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.05, 1.2, 0.02]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.7, 0.05, 0.02]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  )
}

function WallClock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.01, 32]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.07, 0.04, 0]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.16, 0.01, 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.04, 0.09]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.02, 0.01, 0.18]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  )
}

function PinBoard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.3, 0.9, 0.05]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      {[
        [-0.35, 0.15, "#fef08a"],
        [0.05, 0.2, "#bfdbfe"],
        [0.4, -0.05, "#fecaca"],
        [-0.1, -0.2, "#bbf7d0"],
      ].map(([x, y, color]) => (
        <mesh key={`${x}-${y}`} position={[x as number, y as number, 0.04]} rotation={[0, 0, (x as number) * 0.4]}>
          <boxGeometry args={[0.22, 0.24, 0.01]} />
          <meshStandardMaterial color={color as string} />
        </mesh>
      ))}
    </group>
  )
}

function Bookshelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[2, 2.1, 0.4]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      {[0.35, 0.95, 1.55].map((y) => (
        <mesh key={y} position={[0, y, 0.06]}>
          <boxGeometry args={[1.84, 0.05, 0.32]} />
          <meshStandardMaterial color="#6d5634" />
        </mesh>
      ))}
      {[0.56, 1.16].map((y, row) => (
        <group key={y} position={[0, y, 0.08]}>
          {[-0.7, -0.5, -0.28, -0.05, 0.18, 0.42, 0.62].map((x, i) => (
            <mesh key={x} position={[x, 0.02, 0]}>
              <boxGeometry args={[0.14, 0.36, 0.22]} />
              <meshStandardMaterial color={BOOK_COLORS[(row * 4 + i) % BOOK_COLORS.length]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function RoomDoor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 1.1, -0.02]}>
        <boxGeometry args={[1.1, 2.2, 0.08]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 1.05, 0.03]}>
        <boxGeometry args={[0.92, 2.05, 0.06]} />
        <meshStandardMaterial color="#a5854f" />
      </mesh>
      <mesh position={[0.34, 1.05, 0.08]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  )
}

function PendantLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh position={[0, 2.65, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 2.28, 0]}>
        <coneGeometry args={[0.3, 0.28, 24, 1, true]} />
        <meshStandardMaterial color="#1e293b" emissive="#fbbf24" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

function Whiteboard({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[1.9, 1.1, 0.06]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 1.7, 0.035]}>
        <boxGeometry args={[1.78, 0.98, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.5, 1.85, 0.05]}>
        <boxGeometry args={[0.7, 0.05, 0.01]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[-0.3, 1.65, 0.05]}>
        <boxGeometry args={[1.1, 0.05, 0.01]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <mesh position={[0.55, 1.45, 0.05]}>
        <boxGeometry args={[0.5, 0.05, 0.01]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[-0.8, 0.55, 0]}>
        <boxGeometry args={[0.05, 1.1, 0.05]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.8, 0.55, 0]}>
        <boxGeometry args={[0.05, 1.1, 0.05]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.2, 1.12, 0.05]}>
        <boxGeometry args={[0.4, 0.04, 0.06]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  )
}

function DeskSeating({ spots }: { spots: SeatSpot[] }) {
  return (
    <group>
      {spots.map((spot) => (
        <Desk key={`${spot.position[0]}-${spot.position[2]}`} position={spot.position} rotationY={spot.rotationY} />
      ))}
    </group>
  )
}

function LoungeSeating({ capacity }: { capacity: number }) {
  const stools: [number, number][] = []
  const tableCount = Math.ceil(capacity / STOOL_OFFSETS.length)

  LOUNGE_TABLES.slice(0, tableCount).forEach(([cx, cz]) => {
    STOOL_OFFSETS.forEach(([ox, oz]) => stools.push([cx + ox, cz + oz]))
  })

  return (
    <group>
      {LOUNGE_TABLES.slice(0, tableCount).map(([cx, cz]) => (
        <RoundNook key={`${cx}-${cz}`} position={[cx, 0, cz]} />
      ))}
      {stools.slice(0, capacity).map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.23, z]} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.46, 16]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      ))}
    </group>
  )
}

function RoundNook({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.03, 32]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.06, 32]} />
        <meshStandardMaterial color="#c9a876" />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.07, 0.14, 0.55, 12]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      <mesh position={[0.2, 0.61, 0.15]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.03, 0.22]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

function Desk({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.6, 0.06, 0.8]} />
        <meshStandardMaterial color="#c9a876" />
      </mesh>
      <mesh position={[-0.72, 0.36, 0]}>
        <boxGeometry args={[0.06, 0.72, 0.74]} />
        <meshStandardMaterial color="#a5854f" />
      </mesh>
      <mesh position={[0.72, 0.36, 0]}>
        <boxGeometry args={[0.06, 0.72, 0.74]} />
        <meshStandardMaterial color="#a5854f" />
      </mesh>
      <mesh position={[0, 1.04, -0.18]} castShadow>
        <boxGeometry args={[0.56, 0.36, 0.04]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.82, -0.18]}>
        <boxGeometry args={[0.09, 0.16, 0.09]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-0.45, 0.76, 0.12]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.025, 0.22]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.5, 0.76, 0.15]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.24, 0.025, 0.18]} />
        <meshStandardMaterial color="#bfdbfe" />
      </mesh>
      <mesh position={[0, 0.44, 0.72]} castShadow>
        <boxGeometry args={[0.5, 0.07, 0.5]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0.75, 0.95]} castShadow>
        <boxGeometry args={[0.5, 0.56, 0.06]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0.22, 0.72]}>
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  )
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.52, 16]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#3f7d4e" flatShading />
      </mesh>
    </group>
  )
}

function SpaceCharacter({
  character,
  spawn,
  target,
  showNameTag,
  bubbleText,
}: {
  character: StudySpaceCharacter
  spawn: { x: number; z: number }
  target: { x: number; z: number }
  showNameTag: boolean
  bubbleText: string | null
}) {
  const groupRef = useRef<Group>(null)
  const walkPhase = useRef(0)

  useFrame((_, delta) => {
    const node = groupRef.current
    if (!node) return

    const dx = target.x - node.position.x
    const dz = target.z - node.position.z
    const distance = Math.hypot(dx, dz)

    if (distance > 0.02) {
      const step = Math.min(distance, WALK_SPEED * delta)
      node.position.x += (dx / distance) * step
      node.position.z += (dz / distance) * step
      node.rotation.y = Math.atan2(dx, dz)

      if (!reducedMotion) {
        walkPhase.current += delta * 10
        node.position.y = Math.abs(Math.sin(walkPhase.current)) * 0.05
      }
    } else if (node.position.y !== 0) {
      node.position.y = 0
    }
  })

  return (
    <group ref={groupRef} position={[spawn.x, 0, spawn.z]}>
      <mesh position={[-0.12, 0.25, 0]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.18]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.12, 0.25, 0]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.18]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color={character.bodyColor} />
      </mesh>
      <mesh position={[-0.34, 0.88, 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.14]} />
        <meshStandardMaterial color={character.bodyColor} />
      </mesh>
      <mesh position={[0.34, 0.88, 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.14]} />
        <meshStandardMaterial color={character.bodyColor} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.23, 24, 24]} />
        <meshStandardMaterial color="#f1c9a5" />
      </mesh>
      <mesh position={[0, 1.64, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.27, 0.12, 24]} />
        <meshStandardMaterial color={character.accentColor} />
      </mesh>

      {showNameTag ? (
        <Html position={[0, 1.95, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
          <span className="block rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {character.name}
          </span>
        </Html>
      ) : null}

      {bubbleText ? (
        <Html position={[0, 2.3, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[30, 0]}>
          <span className="relative block max-w-48 rounded-xl bg-white px-3 py-2 text-xs leading-4 break-words text-slate-800 shadow-lg">
            {bubbleText}
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-white"
            />
          </span>
        </Html>
      ) : null}
    </group>
  )
}
