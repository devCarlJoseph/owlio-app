import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, useCursor } from "@react-three/drei"
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, Spherical, type Group, type OrthographicCamera } from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import type { SamplePerson } from "../space-roster"
import type { StudySpaceCharacter } from "../study-spaces-records"
import { useWalkKeys, walkDirection, type WalkKey } from "../use-walk-keys"
import { CharacterFigure, type FigureMode } from "./character-figure"
import { LockerWall, RadioSet, RoomTv, TaskWhiteboard, type LockerSlot } from "./room-extras"
import { LIGHTING, type LightPhase } from "./room-ambience"
import { RoomGarden } from "./room-garden"
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
  lockers?: LockerSlot[]
  lightPhase?: LightPhase
  gardenSoundOn?: boolean
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
  onSelectLocker?: (lockerId: string) => void
  onToggleGardenSound?: () => void
  onToggleMusic?: () => void
  onExit?: () => void
}

const ROOM = { ...roomPlan, wallHeight: 3.2 }
const LOW_WALL = 0.55
const WALL_BLUE = "#2f6fe4"
const EXIT_PORTAL = { x: -roomPlan.halfWidth + 1.5, z: roomPlan.halfDepth - 1.1 }
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
  lockers = [],
  lightPhase = "day",
  gardenSoundOn = false,
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
  onSelectLocker = () => undefined,
  onToggleGardenSound = () => undefined,
  onToggleMusic = () => undefined,
  onExit,
}: SpaceRoomSceneProps) {
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null)
  const seatedSeat = seats.find((seat) => seat.id === seatedSeatId) ?? null
  const takenBy = new Map(samplePeople.map((person) => [seats[person.seatIndex]?.id, person]))
  // A seated character only stands through the Stand up button, so a movement key just shows the hint.
  const { heldRef } = useWalkKeys(true, () => {
    if (seatedSeatId) onFloorPoint(walkTarget)
  })

  function handleFloorClick(point: { x: number; z: number }) {
    onFloorPoint({
      x: Math.min(Math.max(point.x, -ROOM.halfWidth + MOVE_MARGIN), ROOM.halfWidth - MOVE_MARGIN),
      z: Math.min(Math.max(point.z, -ROOM.halfDepth + MOVE_MARGIN), ROOM.halfDepth - MOVE_MARGIN),
    })
  }

  const destination = seatedSeat ? seatedSeat.sitPoint : walkTarget
  const light = LIGHTING[lightPhase]

  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: [18, 18, 18], zoom: 40, near: -100, far: 400 }}
      aria-label="3D study room preview. Walk with WASD or the arrow keys, select a seat to sit, or use the overlay controls."
      fallback={
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-600">
          The 3D room preview could not start because WebGL is unavailable in this browser. You can
          still use the space chat below.
        </div>
      }
    >
      <color attach="background" args={[light.background]} />
      <hemisphereLight args={[light.hemiSky, light.hemiGround, light.hemiIntensity]} />
      <ambientLight intensity={light.ambient} />
      {light.lamps > 0 ? (
        <>
          <pointLight position={[-9.5, 1.7, 4.7]} intensity={5 * light.lamps} distance={7} color="#fbbf24" />
          <pointLight position={[loungeTable.x, 2.2, loungeTable.z]} intensity={5 * light.lamps} distance={8} color="#fcd9a0" />
          <pointLight position={[workRug.x, 2.4, workRug.z]} intensity={4 * light.lamps} distance={9} color="#fde7c0" />
          <pointLight position={[meetingRoom.table.x, 2.4, meetingRoom.table.z]} intensity={4 * light.lamps} distance={8} color="#e0ecff" />
        </>
      ) : null}
      <directionalLight
        position={light.sunPosition}
        color={light.sunColor}
        intensity={light.sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
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
        minZoom={16}
        maxZoom={120}
      />
      <CameraFit />
      <CameraHeightRig level={cameraLevel} controlsRef={cameraResetRef} />

      <RoomShell onFloorClick={handleFloorClick} lamps={light.lamps} />
      <RoomGarden position={[-0.3, 0, 6]} lamps={light.lamps} soundOn={gardenSoundOn} onToggleSound={onToggleGardenSound} />
      {onExit ? <ExitPortal position={[EXIT_PORTAL.x, 0, EXIT_PORTAL.z]} onExit={onExit} /> : null}

      <BoardStand x={-0.2} z={-ROOM.halfDepth + 0.3} postX={1.3} height={1.05} />
      <TaskWhiteboard position={[-0.2, 1.9, -ROOM.halfDepth + 0.3]} tasks={tasks} onOpen={onOpenTasks} />
      <BoardStand x={meetingRoom.table.x} z={-ROOM.halfDepth + 0.3} postX={1.3} height={0.35} />
      <RoomTv position={[meetingRoom.table.x, 1.95, -ROOM.halfDepth + 0.3]} hasVideo={tvHasVideo} onOpen={onOpenTv} />
      <LockerWall position={[-ROOM.halfWidth + 0.34, 0, 2.6]} slots={lockers} onSelect={onSelectLocker} />
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
              <Html position={[0, 2.05, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[18, 0]}>
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
        heldRef={heldRef}
        showNameTag={showNameTag}
        bubbleText={bubbleText}
      />
    </Canvas>
  )
}

// Fit the whole room into the canvas on load and resize, then remember it as the reset view.
// Reads the default controls from the store so it re-runs once they exist.
function CameraFit() {
  const get = useThree((state) => state.get)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null

  useEffect(() => {
    if (!controls || width === 0 || height === 0) return
    const camera = get().camera as OrthographicCamera

    const spanX = (ROOM.halfWidth * 2 + ROOM.halfDepth * 2) * Math.SQRT1_2
    const spanY = spanX * 0.58 + ROOM.wallHeight * 0.6
    camera.zoom = Math.min(width / (spanX * 1.04), height / (spanY * 1.08))
    camera.updateProjectionMatrix()
    controls.saveState()
    controls.update()
  }, [get, controls, width, height])

  return null
}

function useFloorTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#fbf3e2"
      ctx.fillRect(0, 0, 128, 128)
      ctx.strokeStyle = "#eadfc8"
      ctx.lineWidth = 3
      ctx.strokeRect(1.5, 1.5, 125, 125)
    }
    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    created.wrapS = RepeatWrapping
    created.wrapT = RepeatWrapping
    created.repeat.set(ROOM.halfWidth, ROOM.halfDepth)
    created.anisotropy = 8
    return created
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function LowWall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, LOW_WALL / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={WALL_BLUE} />
      </mesh>
      <mesh position={[0, LOW_WALL + 0.03, 0]}>
        <boxGeometry args={[size[0] + 0.04, 0.06, size[2] + 0.04]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

function BoardStand({ x, z, postX, height }: { x: number; z: number; postX: number; height: number }) {
  return (
    <group position={[x, 0, z - 0.08]}>
      {[-postX, postX].map((offset) => (
        <group key={offset} position={[offset, 0, 0]}>
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[0.08, height, 0.08]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.6]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function ExitPortal({ position, onExit }: { position: [number, number, number]; onExit: () => void }) {
  const ring = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    if (ring.current && !reducedMotion) ring.current.rotation.y += delta * 0.8
  })

  return (
    <group
      position={position}
      onClick={(event) => {
        if (event.delta > 4) return
        event.stopPropagation()
        onExit()
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.08, 32]} />
        <meshStandardMaterial color="#dbeafe" />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.03, 32]} />
        <meshStandardMaterial color="#3b82f6" emissive="#60a5fa" emissiveIntensity={hovered ? 0.9 : 0.5} />
      </mesh>
      <group ref={ring} position={[0, 1.05, 0]}>
        <mesh>
          <torusGeometry args={[0.7, 0.06, 12, 40]} />
          <meshStandardMaterial color={WALL_BLUE} emissive="#60a5fa" emissiveIntensity={0.4} />
        </mesh>
      </group>
      <Html position={[0, 2.05, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[14, 0]}>
        <span className="block whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
          {hovered ? "Back to the study hall" : "Exit to hall"}
        </span>
      </Html>
    </group>
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

function RoomShell({ onFloorClick, lamps }: { onFloorClick: (point: { x: number; z: number }) => void; lamps: number }) {
  const backZ = -ROOM.halfDepth
  const leftX = -ROOM.halfWidth
  const floor = useFloorTexture()
  const wallW = ROOM.halfWidth * 2 + 0.3
  const wallD = ROOM.halfDepth * 2 + 0.3

  return (
    <group>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 70]} />
        <meshStandardMaterial color="#dfe7f1" />
      </mesh>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[wallW + 0.4, 0.1, wallD + 0.4]} />
        <meshStandardMaterial color="#f8fafc" />
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
        <meshStandardMaterial map={floor} />
      </mesh>

      <LowWall position={[0, 0, backZ - 0.08]} size={[wallW, LOW_WALL, 0.15]} />
      <LowWall position={[0, 0, ROOM.halfDepth + 0.08]} size={[wallW, LOW_WALL, 0.15]} />
      <LowWall position={[leftX - 0.08, 0, 0]} size={[0.15, LOW_WALL, wallD]} />
      <LowWall position={[ROOM.halfWidth + 0.08, 0, 0]} size={[0.15, LOW_WALL, wallD]} />

      <BoardStand x={-2.9} z={backZ + 0.3} postX={0.55} height={1.9} />
      <PinBoard position={[-2.9, 2.35, backZ + 0.3]} />

      <Bookshelf position={[leftX + 0.32, 0, -3.6]} />
      <Bookshelf position={[leftX + 0.32, 0, -1.2]} />

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
          <meshStandardMaterial color="#f5e6c8" emissive="#fbbf24" emissiveIntensity={0.3 + lamps * 1.2} />
        </mesh>
      </group>

      <mesh position={[loungeTable.x, 0.02, loungeTable.z]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.3, 0.03, 40]} />
        <meshStandardMaterial color="#bfe6cf" />
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
        <meshStandardMaterial color="#cfe0fb" />
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
      <meshStandardMaterial color={WALL_BLUE} />
    </mesh>
  )

  return (
    <group>
      <mesh position={[centerX, 0.025, centerZ]} receiveShadow raycast={noRaycast}>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial color="#e4edf9" />
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
  heldRef,
  showNameTag,
  bubbleText,
}: {
  character: StudySpaceCharacter
  target: { x: number; z: number }
  seatedSeat: SeatDef | null
  heldRef: RefObject<Set<WalkKey>>
  showNameTag: boolean
  bubbleText: string | null
}) {
  const groupRef = useRef<Group>(null)
  const modeRef = useRef<FigureMode>("idle")
  const [seated, setSeated] = useState(false)
  // Fixed start position: a position prop that follows the target would teleport the character on every click.
  const [start] = useState(target)
  // Keyboard walking takes over until the next click or seat choice sets a new target.
  const lastTarget = useRef(target)
  const manual = useRef(false)
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null

  useFrame(({ camera }, delta) => {
    const node = groupRef.current
    if (!node) return

    if (lastTarget.current !== target) {
      lastTarget.current = target
      manual.current = false
    }

    const direction = seatedSeat ? null : walkDirection(heldRef.current, camera, controls?.target ?? node.position)
    if (direction) {
      manual.current = true
      const step = WALK_SPEED * Math.min(delta, 0.05)
      node.position.x = Math.min(Math.max(node.position.x + direction.x * step, -ROOM.halfWidth + MOVE_MARGIN), ROOM.halfWidth - MOVE_MARGIN)
      node.position.z = Math.min(Math.max(node.position.z + direction.z * step, -ROOM.halfDepth + MOVE_MARGIN), ROOM.halfDepth - MOVE_MARGIN)
      node.rotation.y = Math.atan2(direction.x, direction.z)
      modeRef.current = "walk"
      return
    }

    const goal = manual.current && !seatedSeat ? node.position : target
    const dx = goal.x - node.position.x
    const dz = goal.z - node.position.z
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

  const tagY = seated ? 2.05 : 1.8
  const bubbleY = seated ? 2.45 : 2.2

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
