import { useEffect, useRef, useState, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, useCursor } from "@react-three/drei"
import { Spherical, type Group, type OrthographicCamera } from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import type { SamplePerson } from "../space-roster"
import type { StudySpaceCharacter } from "../study-spaces-records"
import { CharacterFigure, type FigureMode } from "./character-figure"
import { DrawerCabinet, RadioSet, RoomTv, TaskWhiteboard } from "./room-extras"
import type { RoomTask } from "./room-tasks"
import { loungeTable, meetingRoom, roomPlan, workRug, type SeatDef } from "./study-space-seats"

export type CameraResetHandle = {
  reset: () => void
}

export type SpaceRoomSceneProps = {
  character: StudySpaceCharacter
  seats: SeatDef[]
  samplePeople?: SamplePerson[]
  tasks?: RoomTask[]
  tvHasVideo?: boolean
  drawerOpen?: boolean
  musicPlaying?: boolean
  selectedSeatId: string | null
  seatedSeatId: string | null
  walkTarget: { x: number; z: number }
  cameraLevel: number
  showNameTag: boolean
  bubbleText: string | null
  cameraResetRef: RefObject<CameraResetHandle | null>
  onFloorPoint: (point: { x: number; z: number }) => void
  onSeatSelect: (seatId: string) => void
  onOpenTasks?: () => void
  onOpenTv?: () => void
  onToggleDrawer?: () => void
  onToggleMusic?: () => void
}

const ROOM = { ...roomPlan, wallHeight: 3.2 }
const MOVE_MARGIN = 0.5
const WALK_SPEED = 2.8
const BASE_POLAR = Math.PI / 3
const POLAR_STEP = 0.12

const BOOK_COLORS = ["#b91c1c", "#1d4ed8", "#15803d", "#a16207", "#7e22ce", "#0e7490", "#be185d"]

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

export function SpaceRoomScene({
  character,
  seats,
  samplePeople = [],
  tasks = [],
  tvHasVideo = false,
  drawerOpen = false,
  musicPlaying = false,
  selectedSeatId,
  seatedSeatId,
  walkTarget,
  cameraLevel,
  showNameTag,
  bubbleText,
  cameraResetRef,
  onFloorPoint,
  onSeatSelect,
  onOpenTasks = () => undefined,
  onOpenTv = () => undefined,
  onToggleDrawer = () => undefined,
  onToggleMusic = () => undefined,
}: SpaceRoomSceneProps) {
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null)
  const seatedSeat = seats.find((seat) => seat.id === seatedSeatId) ?? null
  const takenBy = new Map(samplePeople.map((person) => [seats[person.seatIndex]?.id, person]))

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
      camera={{ position: [18, 18, 18], zoom: 40, near: -100, far: 400 }}
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
        position={[12, 20, 9]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
      />
      <pointLight position={[-8, 2.6, 4]} intensity={6} distance={9} color="#fbbf24" />
      <pointLight position={[0, 3, -2]} intensity={3} distance={14} color="#fff1d6" />

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
        minZoom={16}
        maxZoom={120}
      />
      <CameraFit controlsRef={cameraResetRef} />
      <CameraHeightRig level={cameraLevel} controlsRef={cameraResetRef} />

      <RoomShell onFloorClick={handleFloorClick} />

      <TaskWhiteboard position={[-0.2, 1.9, -ROOM.halfDepth + 0.12]} tasks={tasks} onOpen={onOpenTasks} />
      <RoomTv position={[meetingRoom.table.x, 1.95, -ROOM.halfDepth + 0.12]} hasVideo={tvHasVideo} onOpen={onOpenTv} />
      <DrawerCabinet position={[-ROOM.halfWidth + 0.33, 0, 1.6]} open={drawerOpen} onToggle={onToggleDrawer} />
      <RadioSet
        position={[-6.75, 0.5, 4.95]}
        playing={musicPlaying}
        onToggle={onToggleMusic}
        reducedMotion={reducedMotion}
      />

      {seats.map((seat) => (
        <SeatFurniture
          key={seat.id}
          seat={seat}
          hovered={hoveredSeatId === seat.id}
          selected={selectedSeatId === seat.id}
          occupied={seatedSeatId === seat.id}
          takenBy={takenBy.get(seat.id)?.name ?? null}
          onHover={setHoveredSeatId}
          onSelect={onSeatSelect}
        />
      ))}

      {samplePeople.map((person, index) => {
        const seat = seats[person.seatIndex]
        if (!seat) return null
        return (
          <group
            key={person.id}
            position={[seat.sitPoint.x, 0, seat.sitPoint.z]}
            rotation={[0, seat.faceRotation, 0]}
          >
            <CharacterFigure
              bodyColor={person.shirt}
              accentColor={person.hair}
              skinColor={person.skin}
              getMode={() => "seated"}
              typing={seat.furniture === "desk"}
              phaseOffset={index * 1.9}
              reducedMotion={reducedMotion}
            />
            {showNameTag ? (
              <Html position={[0, 1.55, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[18, 0]}>
                <span className="block rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-slate-700 shadow">
                  {person.name} · sample
                </span>
              </Html>
            ) : null}
          </group>
        )
      })}

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

// Fit the whole room into the canvas on load and resize, then remember it as the reset view.
function CameraFit({ controlsRef }: { controlsRef: RefObject<CameraResetHandle | null> }) {
  const get = useThree((state) => state.get)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)

  useEffect(() => {
    const controls = controlsRef.current as OrbitControlsImpl | null
    if (!controls || width === 0 || height === 0) return
    const camera = get().camera as OrthographicCamera

    const spanX = (ROOM.halfWidth * 2 + ROOM.halfDepth * 2) * Math.SQRT1_2
    const spanY = spanX * 0.62 + ROOM.wallHeight
    camera.zoom = Math.min(width / (spanX * 1.05), height / (spanY * 1.05))
    camera.updateProjectionMatrix()
    controls.saveState()
    controls.update()
  }, [get, controlsRef, width, height])

  return null
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
  const backZ = -ROOM.halfDepth
  const leftX = -ROOM.halfWidth

  return (
    <group>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 52]} />
        <meshStandardMaterial color="#16202f" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(event) => {
          if (event.delta > 4) return
          event.stopPropagation()
          onFloorClick({ x: event.point.x, z: event.point.z })
        }}
      >
        <planeGeometry args={[ROOM.halfWidth * 2, ROOM.halfDepth * 2]} />
        <meshStandardMaterial color="#c9a876" />
      </mesh>

      <mesh position={[0, ROOM.wallHeight / 2, backZ]} receiveShadow>
        <boxGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight, 0.15]} />
        <meshStandardMaterial color="#efe7d8" />
      </mesh>
      <mesh position={[leftX, ROOM.wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.15, ROOM.wallHeight, ROOM.halfDepth * 2]} />
        <meshStandardMaterial color="#e5dcc9" />
      </mesh>
      <Skirting position={[0, 0.06, backZ + 0.09]} size={[ROOM.halfWidth * 2, 0.12, 0.04]} />
      <Skirting position={[leftX + 0.09, 0.06, 0]} size={[0.04, 0.12, ROOM.halfDepth * 2]} />
      <Skirting position={[0, 0.03, ROOM.halfDepth - 0.02]} size={[ROOM.halfWidth * 2, 0.06, 0.04]} />
      <Skirting position={[ROOM.halfWidth - 0.02, 0.03, 0]} size={[0.04, 0.06, ROOM.halfDepth * 2]} />

      <WindowPane position={[-8.4, 1.9, backZ + 0.1]} />
      <WindowPane position={[-5, 1.9, backZ + 0.1]} />
      <WallClock position={[2.4, 2.6, backZ + 0.1]} />
      <PinBoard position={[-2.9, 2.35, backZ + 0.1]} />

      <Bookshelf position={[leftX + 0.32, 0, -3.6]} />
      <Bookshelf position={[leftX + 0.32, 0, -1.2]} />
      <RoomDoor position={[leftX + 0.1, 0, 6.4]} />

      <PendantLamp position={[-6.7, 0, -4.6]} />
      <PendantLamp position={[-2.5, 0, -4.6]} />
      <PendantLamp position={[workRug.x, 0, workRug.z]} />
      <PendantLamp position={[meetingRoom.table.x, 0, meetingRoom.table.z]} />
      <PendantLamp position={[loungeTable.x, 0, loungeTable.z]} />

      <MeetingRoom />
      <AreaSign position={[workRug.x, 0.1, 3.6]} label="Working area" tone="work" />
      <AreaSign position={[(meetingRoom.minX + meetingRoom.maxX) / 2, 2.95, meetingRoom.maxZ]} label="Meeting room" tone="meeting" />

      <group position={[-6.75, 0, 4.95]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.05, 20]} />
          <meshStandardMaterial color="#8a6d42" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.05, 0.09, 0.45, 10]} />
          <meshStandardMaterial color="#6d5634" />
        </mesh>
      </group>
      <group position={[-9.5, 0, 4.7]}>
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

      <mesh position={[loungeTable.x, 0.02, loungeTable.z]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.3, 0.03, 40]} />
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

      <mesh position={[workRug.x, 0.015, workRug.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[workRug.radius, 40]} />
        <meshStandardMaterial color="#33415c" />
      </mesh>

      <Plant position={[-9.3, 0, -6.2]} />
      <Plant position={[9.3, 0, 6.4]} />
      <Plant position={[2.9, 0, 6.6]} />
      <Plant position={[9.6, 0, 1.6]} />
      <Plant position={[3.0, 0, 0.6]} />
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
  takenBy,
  onHover,
  onSelect,
}: {
  seat: SeatDef
  hovered: boolean
  selected: boolean
  occupied: boolean
  takenBy: string | null
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
  useCursor(hovered)

  return (
    <group position={[seat.anchor.x, 0, seat.anchor.z]} rotation={[0, seat.furnitureRotationY, 0]}>
      {seat.furniture === "desk" ? <StudyDesk seatColor={seatColor} /> : null}
      {seat.furniture === "stool" ? <Stool seatColor={seatColor} /> : null}
      {seat.furniture === "armchair" ? <Armchair seatColor={seatColor} /> : null}
      {seat.furniture === "chair" ? <MeetingChair seatColor={seatColor} /> : null}

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
        onClick={(event) => {
          if (event.delta > 4) return
          event.stopPropagation()
          onSelect(seat.id)
        }}
      >
        <boxGeometry args={seat.furniture === "chair" ? [1.1, 1.5, 1.1] : [1.6, 1.7, 1.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered ? (
        <Html position={[0, 1.9, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
          <span className="block rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {seat.name} · {occupied ? "You" : takenBy ? `${takenBy} (sample)` : "Available"}
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

function MeetingChair({ seatColor }: { seatColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[0.5, 0.07, 0.5]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.75, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.56, 0.06]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.04, 5]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  )
}

// Glass-walled meeting room with a conference table. Glass never blocks clicks, so the floor stays walkable.
function MeetingRoom() {
  const { minX, maxX, minZ, maxZ, table } = meetingRoom
  const height = 2.7
  const width = maxX - minX
  const depth = maxZ - minZ
  const centerX = (minX + maxX) / 2
  const centerZ = (minZ + maxZ) / 2
  const doorFrom = 4.1
  const doorTo = 5.3
  const frontPanels: [number, number][] = [
    [minX, doorFrom],
    [doorTo, maxX],
  ]
  const noRaycast = () => null

  const pane = (key: string, position: [number, number, number], size: [number, number, number]) => (
    <mesh key={key} position={position} raycast={noRaycast}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#bfe0f0" transparent opacity={0.16} roughness={0.1} depthWrite={false} />
    </mesh>
  )
  const frame = (key: string, position: [number, number, number], size: [number, number, number]) => (
    <mesh key={key} position={position} raycast={noRaycast}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#111827" />
    </mesh>
  )

  return (
    <group>
      <mesh position={[centerX, 0.025, centerZ]} receiveShadow raycast={noRaycast}>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial color="#c98f4a" />
      </mesh>

      {frontPanels.map(([from, to]) =>
        pane(`front-${from}`, [(from + to) / 2, height / 2, maxZ], [to - from, height, 0.03])
      )}
      {pane("right", [maxX, height / 2, centerZ], [0.03, height, depth])}
      {pane("left", [minX, height / 2, centerZ], [0.03, height, depth])}

      {[0, 1, 2, 3, 4].map((index) => {
        const x = minX + (width / 4) * index
        const z = minZ + (depth / 4) * index
        return (
          <group key={index}>
            {frame(`post-front-${index}`, [x, height / 2, maxZ], [0.09, height, 0.09])}
            {frame(`post-right-${index}`, [maxX, height / 2, z], [0.09, height, 0.09])}
          </group>
        )
      })}
      {frame("post-door-a", [doorFrom, height / 2, maxZ], [0.09, height, 0.09])}
      {frame("post-door-b", [doorTo, height / 2, maxZ], [0.09, height, 0.09])}
      {frame("rail-front-top", [centerX, height, maxZ], [width, 0.08, 0.08])}
      {frame("rail-front-mid", [centerX, height * 0.5, maxZ], [width, 0.05, 0.05])}
      {frame("rail-right-top", [maxX, height, centerZ], [0.08, 0.08, depth])}
      {frame("rail-right-mid", [maxX, height * 0.5, centerZ], [0.05, 0.05, depth])}
      {frame("rail-left-top", [minX, height, centerZ], [0.08, 0.08, depth])}

      <group position={[table.x, 0, table.z]}>
        <mesh position={[0, 0.74, 0]} castShadow>
          <boxGeometry args={[4.6, 0.08, 1.5]} />
          <meshStandardMaterial color="#d9a05b" />
        </mesh>
        {[
          [-2.1, -0.6],
          [2.1, -0.6],
          [-2.1, 0.6],
          [2.1, 0.6],
        ].map(([x, z]) => (
          <mesh key={`${x}-${z}`} position={[x, 0.37, z]}>
            <boxGeometry args={[0.08, 0.74, 0.08]} />
            <meshStandardMaterial color="#6d5634" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function AreaSign({
  position,
  label,
  tone,
}: {
  position: [number, number, number]
  label: string
  tone: "work" | "meeting"
}) {
  return (
    <Html position={position} center style={{ pointerEvents: "none" }} zIndexRange={[12, 0]}>
      <span
        className={`block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap shadow ${
          tone === "meeting" ? "bg-sky-100/95 text-sky-900" : "bg-amber-100/95 text-amber-900"
        }`}
      >
        {label}
      </span>
    </Html>
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
  const modeRef = useRef<FigureMode>("idle")
  const [seated, setSeated] = useState(false)
  // Fixed start position: a position prop that follows the target would teleport the character on every click.
  const [start] = useState(target)

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
      node.rotation.y = seatedSeat.faceRotation
      modeRef.current = "seated"
      return
    }

    if (distance > 0.02) {
      const step = Math.min(distance, WALK_SPEED * delta)
      node.position.x += (dx / distance) * step
      node.position.z += (dz / distance) * step
      node.rotation.y = Math.atan2(dx, dz)
      modeRef.current = "walk"
    } else {
      modeRef.current = "idle"
    }
  })

  const tagY = seated ? 1.68 : 1.95
  const bubbleY = seated ? 2.05 : 2.3

  return (
    <group ref={groupRef} position={[start.x, 0, start.z]}>
      <CharacterFigure
        bodyColor={character.bodyColor}
        accentColor={character.accentColor}
        getMode={() => modeRef.current}
        typing={seatedSeat?.furniture === "desk"}
        reducedMotion={reducedMotion}
      />

      {showNameTag ? (
        <Html position={[0, tagY, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
          <span className="block rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {character.name}
          </span>
        </Html>
      ) : null}

      {bubbleText ? (
        <Html position={[0, bubbleY, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[30, 0]}>
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
