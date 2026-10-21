import { useEffect, useRef, useState, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls } from "@react-three/drei"
import { Spherical, type Group } from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import type { StudySpaceCharacter } from "../study-spaces-records"
import { loungeTable, roomPlan, type SeatDef } from "./study-space-seats"

export type CameraResetHandle = {
  reset: () => void
}

export type SpaceRoomSceneProps = {
  character: StudySpaceCharacter
  seats: SeatDef[]
  selectedSeatId: string | null
  seatedSeatId: string | null
  walkTarget: { x: number; z: number }
  cameraLevel: number
  showNameTag: boolean
  bubbleText: string | null
  cameraResetRef: RefObject<CameraResetHandle | null>
  onFloorPoint: (point: { x: number; z: number }) => void
  onSeatSelect: (seatId: string) => void
}

const ROOM = { ...roomPlan, wallHeight: 3 }
const MOVE_MARGIN = 0.5
const WALK_SPEED = 2.6
const BASE_POLAR = Math.PI / 3
const POLAR_STEP = 0.12

const BOOK_COLORS = ["#b91c1c", "#1d4ed8", "#15803d", "#a16207", "#7e22ce", "#0e7490", "#be185d"]

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function SpaceRoomScene({
  character,
  seats,
  selectedSeatId,
  seatedSeatId,
  walkTarget,
  cameraLevel,
  showNameTag,
  bubbleText,
  cameraResetRef,
  onFloorPoint,
  onSeatSelect,
}: SpaceRoomSceneProps) {
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null)
  const seatedSeat = seats.find((seat) => seat.id === seatedSeatId) ?? null

  function handleFloorClick(point: { x: number; z: number }) {
    onFloorPoint({
      x: Math.min(Math.max(point.x, -ROOM.halfWidth + MOVE_MARGIN), ROOM.halfWidth - MOVE_MARGIN),
      z: Math.min(Math.max(point.z, -ROOM.halfDepth + MOVE_MARGIN), ROOM.halfDepth - MOVE_MARGIN),
    })
  }

  const destination = seatedSeat ? seatedSeat.sitPoint : walkTarget

  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: [12, 12, 12], zoom: 50, near: -100, far: 300 }}
      aria-label="3D study room preview. Select a seat to sit, or use the overlay controls."
      fallback={
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-300">
          The 3D room preview could not start because WebGL is unavailable in this browser. You can
          still use the space chat below.
        </div>
      }
    >
      <color attach="background" args={["#1a2532"]} />
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      {/* Soft warm fill near the reading corner. */}
      <pointLight position={[-5.2, 2.4, 2.6]} intensity={4} distance={6} color="#fbbf24" />

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
      <CameraHeightRig level={cameraLevel} controlsRef={cameraResetRef} />

      <RoomShell onFloorClick={handleFloorClick} />

      {seats.map((seat) => (
        <SeatFurniture
          key={seat.id}
          seat={seat}
          hovered={hoveredSeatId === seat.id}
          selected={selectedSeatId === seat.id}
          occupied={seatedSeatId === seat.id}
          onHover={setHoveredSeatId}
          onSelect={onSeatSelect}
        />
      ))}

      <SpaceCharacter
        character={character}
        target={destination}
        seatedSeat={seatedSeat}
        showNameTag={showNameTag}
        bubbleText={bubbleText}
      />
    </Canvas>
  )
}

function CameraHeightRig({
  level,
  controlsRef,
}: {
  level: number
  controlsRef: RefObject<CameraResetHandle | null>
}) {
  const { camera } = useThree()

  useEffect(() => {
    const controls = controlsRef.current as OrbitControlsImpl | null
    if (!controls) return

    const polar = Math.min(Math.max(BASE_POLAR - level * POLAR_STEP, Math.PI / 6), Math.PI / 2.4)
    const spherical = new Spherical(controls.getDistance(), polar, controls.getAzimuthalAngle())
    camera.position.setFromSpherical(spherical).add(controls.target)
    controls.update()
  }, [level, camera, controlsRef])

  return null
}

function RoomShell({ onFloorClick }: { onFloorClick: (point: { x: number; z: number }) => void }) {
  return (
    <group>
      {/* Dark ground beyond the walls so the room never floats in empty space. */}
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
        <meshStandardMaterial color="#c9a876" />
      </mesh>

      <mesh position={[0, ROOM.wallHeight / 2, -ROOM.halfDepth]} receiveShadow>
        <boxGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight, 0.15]} />
        <meshStandardMaterial color="#efe7d8" />
      </mesh>
      <mesh position={[-ROOM.halfWidth, ROOM.wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.15, ROOM.wallHeight, ROOM.halfDepth * 2]} />
        <meshStandardMaterial color="#e5dcc9" />
      </mesh>
      <Skirting position={[0, 0.06, -ROOM.halfDepth + 0.09]} size={[ROOM.halfWidth * 2, 0.12, 0.04]} />
      <Skirting position={[-ROOM.halfWidth + 0.09, 0.06, 0]} size={[0.04, 0.12, ROOM.halfDepth * 2]} />
      <Skirting position={[0, 0.03, ROOM.halfDepth - 0.02]} size={[ROOM.halfWidth * 2, 0.06, 0.04]} />
      <Skirting position={[ROOM.halfWidth - 0.02, 0.03, 0]} size={[0.04, 0.06, ROOM.halfDepth * 2]} />

      <WindowPane position={[-3.2, 1.8, -ROOM.halfDepth + 0.1]} />
      <WindowPane position={[3.2, 1.8, -ROOM.halfDepth + 0.1]} />
      <WallClock position={[0, 2.2, -ROOM.halfDepth + 0.1]} />
      <PinBoard position={[-5.7, 1.6, -ROOM.halfDepth + 0.1]} />
      <PinBoard position={[5.8, 1.6, -ROOM.halfDepth + 0.1]} />

      <Bookshelf position={[-ROOM.halfWidth + 0.32, 0, 0.6]} />
      <Bookshelf position={[-ROOM.halfWidth + 0.32, 0, -1.6]} />
      <RoomDoor position={[-ROOM.halfWidth + 0.1, 0, 4.2]} />

      <PendantLamp position={[-3.4, 0, -2.4]} />
      <PendantLamp position={[3.4, 0, -2.4]} />
      <PendantLamp position={[0.4, 0, 1.4]} />

      <Whiteboard position={[5.9, 0, -4.3]} rotationY={-0.3} />

      {/* Reading corner: side table and a warm floor lamp beside the armchairs. */}
      <group position={[-4.5, 0, 3.3]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.05, 20]} />
          <meshStandardMaterial color="#8a6d42" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.07, 0.45, 10]} />
          <meshStandardMaterial color="#6d5634" />
        </mesh>
        <mesh position={[0, 0.49, 0]}>
          <boxGeometry args={[0.24, 0.03, 0.17]} />
          <meshStandardMaterial color="#b91c1c" />
        </mesh>
      </group>
      <group position={[-6.3, 0, 3.4]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.05, 16]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.55, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <coneGeometry args={[0.26, 0.3, 20, 1, true]} />
          <meshStandardMaterial color="#f5e6c8" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Lounge zone: rug, round table and greenery stay even when stools are unselected. */}
      <mesh position={[loungeTable.x, 0.02, loungeTable.z]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.7, 0.03, 32]} />
        <meshStandardMaterial color="#2f6b4f" />
      </mesh>
      <mesh position={[loungeTable.x, 0.55, loungeTable.z]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.06, 32]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      <mesh position={[loungeTable.x, 0.27, loungeTable.z]}>
        <cylinderGeometry args={[0.07, 0.14, 0.55, 12]} />
        <meshStandardMaterial color="#6d5634" />
      </mesh>
      <mesh position={[loungeTable.x + 0.2, 0.61, loungeTable.z + 0.1]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.03, 0.22]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>

      {/* Quiet-zone area rug under the collaborative desks. */}
      <mesh position={[-1.4, 0.015, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.1, 32]} />
        <meshStandardMaterial color="#33415c" />
      </mesh>

      <Plant position={[-6.2, 0, -4.1]} />
      <Plant position={[6.2, 0, 4.3]} />
      <Plant position={[1.9, 0, 4.4]} />
    </group>
  )
}

type SeatVisualState = "available" | "hovered" | "selected" | "occupied"

const SEAT_COLORS: Record<SeatVisualState, string> = {
  available: "#4a5a6e",
  hovered: "#2f6b4f",
  selected: "#b45309",
  occupied: "#166534",
}

function SeatFurniture({
  seat,
  hovered,
  selected,
  occupied,
  onHover,
  onSelect,
}: {
  seat: SeatDef
  hovered: boolean
  selected: boolean
  occupied: boolean
  onHover: (seatId: string | null) => void
  onSelect: (seatId: string) => void
}) {
  const state: SeatVisualState = occupied
    ? "occupied"
    : selected
      ? "selected"
      : hovered
        ? "hovered"
        : "available"
  const seatColor = SEAT_COLORS[state]

  return (
    <group position={[seat.anchor.x, 0, seat.anchor.z]} rotation={[0, seat.furnitureRotationY, 0]}>
      {seat.furniture === "desk" ? <StudyDesk seatColor={seatColor} /> : null}
      {seat.furniture === "stool" ? <Stool seatColor={seatColor} /> : null}
      {seat.furniture === "armchair" ? <Armchair seatColor={seatColor} /> : null}

      {/* Generous invisible hit volume so seats are easy to click on any screen. */}
      <mesh
        position={[0, 0.8, seat.furniture === "desk" ? 0.4 : 0]}
        onPointerOver={(event) => {
          event.stopPropagation()
          onHover(seat.id)
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          onHover(null)
        }}
        onPointerDown={(event) => {
          event.stopPropagation()
          onSelect(seat.id)
        }}
      >
        <boxGeometry args={[1.6, 1.7, 1.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered ? (
        <Html position={[0, 1.9, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
          <span className="block rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {seat.name} · {occupied ? "You" : "Available"}
          </span>
        </Html>
      ) : null}
    </group>
  )
}

function StudyDesk({ seatColor }: { seatColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.6, 0.06, 0.8]} />
        <meshStandardMaterial color="#8a6d42" roughness={0.7} />
      </mesh>
      <mesh position={[-0.72, 0.36, 0]}>
        <boxGeometry args={[0.06, 0.72, 0.74]} />
        <meshStandardMaterial color="#6d5634" />
      </mesh>
      <mesh position={[0.72, 0.36, 0]}>
        <boxGeometry args={[0.06, 0.72, 0.74]} />
        <meshStandardMaterial color="#6d5634" />
      </mesh>
      {/* Warm desk lamp on the left corner. */}
      <mesh position={[-0.55, 0.82, -0.2]}>
        <cylinderGeometry args={[0.09, 0.11, 0.04, 16]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-0.55, 0.96, -0.2]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.015, 0.015, 0.28, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-0.47, 1.08, -0.2]}>
        <coneGeometry args={[0.09, 0.12, 16, 1, true]} />
        <meshStandardMaterial color="#f5e6c8" emissive="#fbbf24" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.15, 0.78, -0.1]}>
        <boxGeometry args={[0.36, 0.3, 0.03]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.15, 0.76, 0.15]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.28, 0.025, 0.2]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.5, 0.77, 0.1]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.15]} />
        <meshStandardMaterial color={BOOK_COLORS[1]} />
      </mesh>
      {/* Chair: seat, back and post — tinted by seat state. */}
      <mesh position={[0, 0.44, 0.74]} castShadow>
        <boxGeometry args={[0.5, 0.07, 0.5]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.75, 0.97]} castShadow>
        <boxGeometry args={[0.5, 0.56, 0.06]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.22, 0.74]}>
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  )
}

function Stool({ seatColor }: { seatColor: string }) {
  return (
    <mesh position={[0, 0.23, 0]} castShadow>
      <cylinderGeometry args={[0.23, 0.27, 0.46, 16]} />
      <meshStandardMaterial color={seatColor} />
    </mesh>
  )
}

function Armchair({ seatColor }: { seatColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.66, 0.22, 0.6]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.62, -0.26]} castShadow>
        <boxGeometry args={[0.66, 0.6, 0.12]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[-0.33, 0.48, 0]} castShadow>
        <boxGeometry args={[0.12, 0.34, 0.6]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0.33, 0.48, 0]} castShadow>
        <boxGeometry args={[0.12, 0.34, 0.6]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.45, 0.05]}>
        <boxGeometry args={[0.42, 0.08, 0.42]} />
        <meshStandardMaterial color="#e5dcc9" />
      </mesh>
    </group>
  )
}

function Skirting({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#d8cdb8" />
    </mesh>
  )
}

function WindowPane({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.9, 1.4, 0.06]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[1.7, 1.2, 0.02]} />
        <meshStandardMaterial color="#a8d3e8" emissive="#bfe0f0" emissiveIntensity={0.45} />
      </mesh>
      {/* Rolling hill silhouettes for a calm exterior view. */}
      <mesh position={[-0.3, -0.28, 0.05]}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial color="#5b8c5a" />
      </mesh>
      <mesh position={[0.55, -0.35, 0.05]}>
        <sphereGeometry args={[0.7, 16, 12]} />
        <meshStandardMaterial color="#4a7a4e" />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.05, 1.2, 0.02]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[1.7, 0.05, 0.02]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      <mesh position={[0, -0.72, 0.1]}>
        <boxGeometry args={[2, 0.08, 0.16]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
    </group>
  )
}

function WallClock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.01, 32]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.07, 0.04, 0]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.16, 0.01, 0.02]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.04, 0.09]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.02, 0.01, 0.18]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  )
}

function PinBoard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.3, 0.9, 0.05]} />
        <meshStandardMaterial color="#a16207" />
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
        <meshStandardMaterial color="#1e293b" emissive="#fbbf24" emissiveIntensity={0.4} />
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
      <mesh position={[-0.8, 0.55, 0]}>
        <boxGeometry args={[0.05, 1.1, 0.05]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.8, 0.55, 0]}>
        <boxGeometry args={[0.05, 1.1, 0.05]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[-0.5, 1.85, 0.045]}>
        <boxGeometry args={[0.7, 0.05, 0.01]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[-0.3, 1.65, 0.045]}>
        <boxGeometry args={[1.1, 0.05, 0.01]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <mesh position={[0.2, 1.12, 0.045]}>
        <boxGeometry args={[0.4, 0.04, 0.06]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  )
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.52, 16]} />
        <meshStandardMaterial color="#8a6d42" />
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
  target,
  seatedSeat,
  showNameTag,
  bubbleText,
}: {
  character: StudySpaceCharacter
  target: { x: number; z: number }
  seatedSeat: SeatDef | null
  showNameTag: boolean
  bubbleText: string | null
}) {
  const groupRef = useRef<Group>(null)
  const walkPhase = useRef(0)
  const [seated, setSeated] = useState(false)

  useFrame((_, delta) => {
    const node = groupRef.current
    if (!node) return

    const dx = target.x - node.position.x
    const dz = target.z - node.position.z
    const distance = Math.hypot(dx, dz)
    const reachedSeat = seatedSeat !== null && distance <= 0.03
    if (reachedSeat !== seated) setSeated(reachedSeat)

    if (reachedSeat && seatedSeat) {
      node.position.x = seatedSeat.sitPoint.x
      node.position.z = seatedSeat.sitPoint.z
      node.position.y = 0
      node.rotation.y = seatedSeat.faceRotation
      return
    }

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

  const pose = seated
    ? { legY: 0.3, legZ: 0.18, legRot: -1.4, bodyY: 0.68, armY: 0.72, headY: 1.18, hatY: 1.37, tagY: 1.68, bubbleY: 2.05 }
    : { legY: 0.25, legZ: 0, legRot: 0, bodyY: 0.85, armY: 0.88, headY: 1.45, hatY: 1.64, tagY: 1.95, bubbleY: 2.3 }

  return (
    <group ref={groupRef} position={[target.x, 0, target.z]}>
      <mesh position={[-0.12, pose.legY, pose.legZ]} rotation={[pose.legRot, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.18]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.12, pose.legY, pose.legZ]} rotation={[pose.legRot, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.18]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, pose.bodyY, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color={character.bodyColor} />
      </mesh>
      <mesh position={[-0.34, pose.armY, seated ? 0.08 : 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.14]} />
        <meshStandardMaterial color={character.bodyColor} />
      </mesh>
      <mesh position={[0.34, pose.armY, seated ? 0.08 : 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.14]} />
        <meshStandardMaterial color={character.bodyColor} />
      </mesh>
      <mesh position={[0, pose.headY, 0]} castShadow>
        <sphereGeometry args={[0.23, 24, 24]} />
        <meshStandardMaterial color="#f1c9a5" />
      </mesh>
      <mesh position={[0, pose.hatY, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.27, 0.12, 24]} />
        <meshStandardMaterial color={character.accentColor} />
      </mesh>

      {showNameTag ? (
        <Html position={[0, pose.tagY, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
          <span className="block rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {character.name}
          </span>
        </Html>
      ) : null}

      {bubbleText ? (
        <Html position={[0, pose.bubbleY, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[30, 0]}>
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
