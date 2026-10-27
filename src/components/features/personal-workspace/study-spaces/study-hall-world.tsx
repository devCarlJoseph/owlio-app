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
      {light.lamps > 0 ? <StreetLighting layout={layout} lamps={light.lamps} /> : null}
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

// Real light sources over every intersection at dusk and night, so streets and buildings stay lit.
function StreetLighting({ layout, lamps }: { layout: CityLayout; lamps: number }) {
  return (
    <group>
      {layout.roadsX.flatMap((x) =>
        layout.roadsZ.map((z) => (
          <pointLight key={`${x}-${z}`} position={[x, 5, z]} intensity={40 * lamps} distance={18} decay={1.6} color="#ffe2a8" />
        ))
      )}
      <pointLight position={[layout.plaza.x, 6, layout.plaza.z]} intensity={45 * lamps} distance={20} decay={1.6} color="#fff1c9" />
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
