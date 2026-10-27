import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, OrbitControls, useCursor } from "@react-three/drei"
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, Spherical, type Group, type OrthographicCamera } from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import type { SamplePerson } from "../space-roster"
import type { StudySpaceCharacter, StudySpaceKind } from "../study-spaces-records"
import { useWalkKeys, walkDirection, type WalkKey } from "../use-walk-keys"
import { CharacterFigure, type FigureMode } from "./character-figure"
import { LockerWall, RadioSet, TaskWhiteboard, type LockerSlot } from "./room-extras"
import { LIGHTING, type LightPhase } from "./room-ambience"
import { RoomGarden } from "./room-garden"
import type { RoomTask } from "./room-tasks"
import { AreaSign, ArcLamp, Bookshelf, DiscussionTable, NapAreaDecor, PinBoard, Plant, WatchRoomDecor } from "./room-zones"
import { discussionTable, napArea, roomPlan, watchRoom, type SeatDef } from "./study-space-seats"

export type CameraResetHandle = {
  reset: () => void
}

export type SpaceRoomSceneProps = {
  character: StudySpaceCharacter
  kind?: StudySpaceKind
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

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

export function SpaceRoomScene({
  character,
  kind = "collaborative",
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
      aria-label="3D study room preview with a discussion table, nap area and watch room. Walk with WASD or the arrow keys, select a seat to sit, or use the overlay controls."
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
          <pointLight position={[discussionTable.x, 2.3, discussionTable.z + 0.4]} intensity={7 * light.lamps} distance={9} color="#fde7c0" />
          <pointLight position={[10, 1, -2.6]} intensity={2.5 * light.lamps} distance={6} color="#fdba74" />
          <pointLight position={[watchRoom.maxX - 1, 2, watchRoom.screenZ]} intensity={4 * light.lamps} distance={8} color={tvHasVideo ? "#93c5fd" : "#cbd5e1"} />
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
      {onExit ? <ExitPortal position={[EXIT_PORTAL.x, 0, EXIT_PORTAL.z]} onExit={onExit} /> : null}

      <DiscussionTable kind={kind} />
      <ArcLamp position={[discussionTable.x + 3.3, 0, discussionTable.z - 2.5]} lamps={light.lamps} />
      <BoardStand x={discussionTable.x} z={-ROOM.halfDepth + 0.3} postX={1.3} height={1.05} />
      <TaskWhiteboard position={[discussionTable.x, 1.9, -ROOM.halfDepth + 0.3]} tasks={tasks} onOpen={onOpenTasks} />
      <AreaSign position={[discussionTable.x, 0.15, discussionTable.z + 3.1]} label="Discussion table" tone="table" />

      <NapAreaDecor lamps={light.lamps} />
      <AreaSign position={[(napArea.minX + napArea.maxX) / 2 + 1, 1.5, napArea.maxZ]} label="Nap area · quiet please" tone="nap" />

      <WatchRoomDecor hasVideo={tvHasVideo} onOpenTv={onOpenTv} />
      <AreaSign position={[(watchRoom.minX + watchRoom.maxX) / 2 + 1, 1.9, watchRoom.minZ]} label="Watch room" tone="watch" />

      <LockerWall position={[-ROOM.halfWidth + 0.34, 0, 2.6]} slots={lockers} onSelect={onSelectLocker} />
      <RoomGarden position={[-0.3, 0, 6]} lamps={light.lamps} soundOn={gardenSoundOn} onToggleSound={onToggleGardenSound} />
      <RadioSet position={[-6.75, 0.5, 4.95]} playing={musicPlaying} onToggle={onToggleMusic} reducedMotion={reducedMotion} />

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
        const napping = seat.furniture === "mat"
        return (
          <group key={person.id} position={[seat.sitPoint.x, 0, seat.sitPoint.z]} rotation={[0, seat.faceRotation, 0]}>
            <CharacterFigure
              bodyColor={person.shirt}
              accentColor={person.hair}
              skinColor={person.skin}
              getMode={() => (napping ? "nap" : "seated")}
              typing={seat.zone === "discussion"}
              phaseOffset={index * 1.9}
              reducedMotion={reducedMotion}
            />
            {napping ? <SleepBubble y={1.15} /> : null}
            {showNameTag ? (
              <Html position={[0, napping ? 1.5 : 2.1, napping ? 0.4 : 0]} center style={{ pointerEvents: "none" }} zIndexRange={[18, 0]}>
                <span className="block rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-slate-700 shadow">
                  {person.name} · {napping ? "napping · sample" : "sample"}
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

function SleepBubble({ y }: { y: number }) {
  return (
    <Html position={[0.3, y, 0.2]} center style={{ pointerEvents: "none" }} zIndexRange={[16, 0]}>
      <span aria-hidden="true" className="block font-bold text-violet-500 motion-safe:animate-pulse">
        <span className="text-[10px]">z</span>
        <span className="text-[13px]">Z</span>
        <span className="text-[16px]">Z</span>
      </span>
    </Html>
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
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#e9cfa3"
      ctx.fillRect(0, 0, 256, 64)
      const planks = ["#e6c999", "#edd5ab", "#e2c393", "#ebd1a5"]
      for (let row = 0; row < 4; row += 1) {
        const offset = row % 2 === 0 ? 0 : 96
        for (let column = -1; column < 3; column += 1) {
          ctx.fillStyle = planks[(row + column + 4) % planks.length]
          ctx.fillRect(column * 128 + offset, row * 16, 126, 15)
        }
      }
      ctx.fillStyle = "rgba(122, 86, 52, 0.25)"
      for (let row = 1; row < 4; row += 1) ctx.fillRect(0, row * 16 - 1, 256, 1)
    }
    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    created.wrapS = RepeatWrapping
    created.wrapT = RepeatWrapping
    created.repeat.set(ROOM.halfWidth / 2, ROOM.halfDepth * 1.2)
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
        <meshStandardMaterial map={floor} roughness={0.7} />
      </mesh>

      <LowWall position={[0, 0, backZ - 0.08]} size={[wallW, LOW_WALL, 0.15]} />
      <LowWall position={[0, 0, ROOM.halfDepth + 0.08]} size={[wallW, LOW_WALL, 0.15]} />
      <LowWall position={[leftX - 0.08, 0, 0]} size={[0.15, LOW_WALL, wallD]} />
      <LowWall position={[ROOM.halfWidth + 0.08, 0, 0]} size={[0.15, LOW_WALL, wallD]} />

      <BoardStand x={-7.6} z={backZ + 0.3} postX={0.55} height={1.9} />
      <PinBoard position={[-7.6, 2.35, backZ + 0.3]} />
      <BoardStand x={0.9} z={backZ + 0.3} postX={0.55} height={1.9} />
      <PinBoard position={[0.9, 2.35, backZ + 0.3]} />

      <Bookshelf position={[leftX + 0.32, 0, -3.6]} />
      <Bookshelf position={[leftX + 0.32, 0, -1.2]} />

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

      <Plant position={[-9.3, 0, -6.2]} />
      <Plant position={[3.4, 0, -0.9]} />
      <Plant position={[2.9, 0, 6.6]} />
      <Plant position={[9.6, 0, 7]} />
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

const MAT_COLORS: Record<SeatVisualState, string> = {
  available: "#c4b5fd",
  hovered: "#a78bfa",
  selected: "#f59e0b",
  occupied: "#86efac",
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
  const state: SeatVisualState = occupied ? "occupied" : selected ? "selected" : hovered ? "hovered" : "available"
  useCursor(hovered)
  const hitSize: [number, number, number] =
    seat.furniture === "mat" ? [1, 0.6, 2] : seat.furniture === "sofa" ? [1.2, 1.2, 1] : seat.furniture === "chair" ? [0.9, 1.5, 0.9] : [1.2, 1.5, 1.2]
  const status = occupied
    ? "You"
    : takenBy
      ? seat.furniture === "mat"
        ? `${takenBy} is napping (sample)`
        : `${takenBy} (sample)`
      : "Available"

  return (
    <group position={[seat.anchor.x, 0, seat.anchor.z]} rotation={[0, seat.furnitureRotationY, 0]}>
      {seat.furniture === "chair" ? <TableChair seatColor={SEAT_COLORS[state]} /> : null}
      {seat.furniture === "armchair" ? <Armchair seatColor={SEAT_COLORS[state]} /> : null}
      {seat.furniture === "mat" ? <NapMat color={MAT_COLORS[state]} /> : null}
      {seat.furniture === "sofa" ? <SofaSeat color={state === "available" ? "#475569" : SEAT_COLORS[state]} /> : null}

      <mesh
        position={[0, hitSize[1] / 2, 0]}
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
        <boxGeometry args={hitSize} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered ? (
        <Html position={[0, 1.9, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
          <span className="block rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {seat.name} · {status}
          </span>
        </Html>
      ) : null}
    </group>
  )
}

function TableChair({ seatColor }: { seatColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[0.5, 0.07, 0.5]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.78, -0.23]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.06]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      {[
        [-0.21, -0.21],
        [0.21, -0.21],
        [-0.21, 0.21],
        [0.21, 0.21],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
    </group>
  )
}

function Armchair({ seatColor }: { seatColor: string }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.26, 0.72]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      <mesh position={[0, 0.66, -0.3]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.14]} />
        <meshStandardMaterial color={seatColor} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.48, 0]} castShadow>
          <boxGeometry args={[0.13, 0.32, 0.72]} />
          <meshStandardMaterial color={seatColor} />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0.04]}>
        <boxGeometry args={[0.56, 0.08, 0.56]} />
        <meshStandardMaterial color="#f1e6d2" />
      </mesh>
    </group>
  )
}

function NapMat({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.1, 1.9]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.16, -0.72]} scale={[1, 0.4, 0.6]} castShadow>
        <sphereGeometry args={[0.36, 18, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.12, 0.62]} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.55]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.95} />
      </mesh>
    </group>
  )
}

function SofaSeat({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.28, 0.95]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.36, 0.04]} castShadow>
        <boxGeometry args={[1.12, 0.18, 0.82]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, -0.4]} castShadow>
        <boxGeometry args={[1.2, 0.62, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.9} />
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
  const napping = seated && seatedSeat?.furniture === "mat"

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
      modeRef.current = seatedSeat.furniture === "mat" ? "nap" : "seated"
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

  const tagY = napping ? 1.5 : seated ? 2.1 : 1.85
  const bubbleY = napping ? 1.9 : seated ? 2.5 : 2.25

  return (
    <group ref={groupRef} position={[start.x, 0, start.z]}>
      <CharacterFigure
        bodyColor={character.bodyColor}
        accentColor={character.accentColor}
        getMode={() => modeRef.current}
        typing={seatedSeat?.zone === "discussion"}
        reducedMotion={reducedMotion}
      />
      {napping ? <SleepBubble y={1.15} /> : null}

      {showNameTag ? (
        <Html position={[0, tagY, napping ? 0.4 : 0]} center style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
          <span className="block rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow">
            {character.name}
            {napping ? " · napping" : ""}
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
