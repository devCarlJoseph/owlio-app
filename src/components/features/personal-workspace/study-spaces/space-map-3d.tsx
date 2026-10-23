import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, MapControls, useCursor } from "@react-three/drei"
import { Color, type Group, type OrthographicCamera } from "three"
import type { MapControls as MapControlsImpl } from "three-stdlib"
import { Lock, Minus, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildSeats, loungeTable, ROOM_SCALE, workRug, type SeatDef } from "./detail/study-space-seats"
import { getSampleRoster, type SamplePerson as RosterPerson } from "./space-roster"
import { kindLabel, metaLine } from "./space-format"
import { studySpacesLockedTooltip, type StudySpaceKind, type StudySpaceRecord } from "./study-spaces-records"

type TileRole = "owner" | "member" | "visitor"

type SpaceMap3DProps = {
  created: StudySpaceRecord[]
  joined: StudySpaceRecord[]
  locked: StudySpaceRecord[]
  onOpen: (space: StudySpaceRecord) => void
  onUnlock: (space: StudySpaceRecord) => void
}

type Tile = { space: StudySpaceRecord; role: TileRole; x: number; z: number }

type Zone = {
  role: TileRole
  label: string
  emptyMessage: string
  z0: number
  depth: number
  tiles: Tile[]
}

const S = 0.5 / ROOM_SCALE
const FURN = S / 0.5
const COLS = 3
const PX = 9.4
const PZ = 7.6
const TILE_W = 7.4
const TILE_D = 5.4
const PLAT = 0.5
const RUG_W = (COLS - 1) * PX + TILE_W + 1.8
const ZONE_GAP = 3.2
const MIN_ZOOM = 8
const MAX_ZOOM = 90
const DETAIL_ZOOM = 34

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function layoutZones(
  inputs: { role: TileRole; label: string; emptyMessage: string; spaces: StudySpaceRecord[] }[]
) {
  let cursor = 0
  const zones = inputs.map((input): Zone => {
    const rows = Math.max(1, Math.ceil(input.spaces.length / COLS))
    const depth = rows * PZ + 1.6
    const z0 = cursor
    cursor += depth + ZONE_GAP

    const tiles = input.spaces.map((space, index): Tile => {
      const row = Math.floor(index / COLS)
      const offset = index % COLS
      const col = row % 2 === 0 ? offset : COLS - 1 - offset
      return {
        space,
        role: input.role,
        x: (col - (COLS - 1) / 2) * PX,
        z: z0 + 0.8 + (row + 0.5) * PZ,
      }
    })

    return { role: input.role, label: input.label, emptyMessage: input.emptyMessage, z0, depth, tiles }
  })

  return { zones, totalDepth: cursor - ZONE_GAP }
}

const gray = new Color("#9aa0a6")
function tone(hex: string, locked: boolean): string {
  return locked ? `#${new Color(hex).lerp(gray, 0.62).getHexString()}` : hex
}

const COLORS = {
  oak: "#b08d52",
  oakDark: "#8a6d42",
  navy: "#33415c",
  navyDark: "#262f45",
  ivory: "#f3ead9",
  forest: "#2f6b4f",
  leaf: "#3f7d4e",
  lamp: "#f2b84b",
}

function Furniture({ seat, kind, locked }: { seat: SeatDef; kind: StudySpaceKind; locked: boolean }) {
  const { x, z } = seat.anchor
  const t = (hex: string) => tone(hex, locked)

  if (seat.furniture === "stool") {
    return (
      <group position={[x * S, PLAT, z * S]} scale={FURN}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.19, 0.17, 0.28, 16]} />
          <meshStandardMaterial color={t(COLORS.navy)} roughness={0.8} />
        </mesh>
      </group>
    )
  }

  if (seat.furniture === "chair") {
    return (
      <group position={[x * S, PLAT, z * S]} scale={FURN} rotation={[0, seat.furnitureRotationY, 0]}>
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[0.28, 0.22, 0.28]} />
          <meshStandardMaterial color={t(COLORS.navy)} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.27, -0.12]}>
          <boxGeometry args={[0.28, 0.3, 0.04]} />
          <meshStandardMaterial color={t(COLORS.navyDark)} roughness={0.85} />
        </mesh>
      </group>
    )
  }

  if (seat.furniture === "armchair") {
    return (
      <group position={[x * S, PLAT, z * S]} scale={FURN} rotation={[0, seat.furnitureRotationY, 0]}>
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[0.33, 0.22, 0.3]} />
          <meshStandardMaterial color={t(COLORS.navy)} roughness={0.85} />
        </mesh>
        <mesh position={[-0.15, 0.27, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.3]} />
          <meshStandardMaterial color={t(COLORS.navyDark)} roughness={0.85} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[x * S, PLAT, z * S]} scale={FURN} rotation={[0, seat.furnitureRotationY, 0]}>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.4]} />
        <meshStandardMaterial color={t(COLORS.oak)} roughness={0.7} />
      </mesh>
      {[
        [-0.36, -0.16],
        [0.36, -0.16],
        [-0.36, 0.16],
        [0.36, 0.16],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} position={[lx, 0.16, lz]}>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
          <meshStandardMaterial color={t(COLORS.oakDark)} roughness={0.8} />
        </mesh>
      ))}
      {kind === "focused" && (
        <mesh position={[0.32, 0.42, -0.12]}>
          <sphereGeometry args={[0.04, 10, 8]} />
          <meshStandardMaterial color={t(COLORS.lamp)} emissive={t(COLORS.lamp)} emissiveIntensity={locked ? 0 : 0.6} />
        </mesh>
      )}
      <mesh position={[0, 0.11, 0.37]}>
        <boxGeometry args={[0.2, 0.22, 0.2]} />
        <meshStandardMaterial color={t(COLORS.navy)} roughness={0.85} />
      </mesh>
    </group>
  )
}

function Laptop({ seat }: { seat: SeatDef }) {
  return (
    <group position={[seat.anchor.x * S, PLAT + 0.37 * FURN, seat.anchor.z * S]} scale={FURN} rotation={[0, seat.furnitureRotationY, 0]}>
      <mesh position={[0, 0.01, 0.04]}>
        <boxGeometry args={[0.26, 0.015, 0.17]} />
        <meshStandardMaterial color="#d6dbe2" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.09, -0.05]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.26, 0.16, 0.012]} />
        <meshStandardMaterial color="#2b3650" emissive="#4f7fd1" emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
    </group>
  )
}

// Decorative sample person drawn from the shared roster.
function SamplePerson({
  seat,
  person,
  index,
  detail,
}: {
  seat: SeatDef
  person: RosterPerson
  index: number
  detail: boolean
}) {
  const head = useRef<Group>(null)
  const body = useRef<Group>(null)
  const seatY = seat.furniture === "stool" ? 0.28 : seat.furniture === "armchair" ? 0.24 : 0.22
  const seed = person.name.charCodeAt(0)

  useFrame(({ clock }) => {
    if (reducedMotion || !head.current || !body.current) return
    const time = clock.elapsedTime + index * 1.7 + seed
    const typing = seat.furniture === "desk"
    head.current.rotation.x = typing ? 0.18 + Math.sin(time * 1.4) * 0.05 : Math.sin(time * 0.8) * 0.06
    head.current.rotation.y = Math.sin(time * 0.45) * 0.3
    body.current.position.y = Math.sin(time * 1.1) * 0.006
  })

  return (
    <group position={[seat.sitPoint.x * S, PLAT, seat.sitPoint.z * S]} scale={FURN} rotation={[0, seat.faceRotation, 0]}>
      <mesh position={[0, seatY + 0.03, 0.08]}>
        <boxGeometry args={[0.15, 0.06, 0.2]} />
        <meshStandardMaterial color="#2b3650" roughness={0.9} />
      </mesh>
      <mesh position={[0, seatY / 2, 0.17]}>
        <boxGeometry args={[0.13, seatY, 0.06]} />
        <meshStandardMaterial color="#2b3650" roughness={0.9} />
      </mesh>
      <group ref={body}>
        <mesh position={[0, seatY + 0.15, -0.01]}>
          <capsuleGeometry args={[0.075, 0.13, 4, 10]} />
          <meshStandardMaterial color={person.shirt} roughness={0.85} />
        </mesh>
        <group ref={head} position={[0, seatY + 0.36, 0]}>
          <mesh>
            <sphereGeometry args={[0.068, 14, 12]} />
            <meshStandardMaterial color={person.skin} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.012, -0.012]}>
            <sphereGeometry args={[0.073, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={person.hair} roughness={0.9} />
          </mesh>
          {detail && (
            <Html position={[0, 0.16, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
              <span className="whitespace-nowrap rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 shadow-sm">
                {person.name}
              </span>
            </Html>
          )}
        </group>
      </group>
    </group>
  )
}

function TileScene({
  tile,
  detail,
  onOpen,
  onUnlock,
}: {
  tile: Tile
  detail: boolean
  onOpen: (space: StudySpaceRecord) => void
  onUnlock: (space: StudySpaceRecord) => void
}) {
  const { space, role } = tile
  const locked = role === "visitor"
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const seats = useMemo(() => buildSeats(space.kind, space.capacity), [space.kind, space.capacity])
  const roster = useMemo(() => (locked ? [] : getSampleRoster(space, seats.length)), [locked, space, seats.length])
  const t = (hex: string) => tone(hex, locked)
  const activate = () => (locked ? onUnlock(space) : onOpen(space))

  return (
    <group
      position={[tile.x, hovered && !reducedMotion ? 0.12 : 0, tile.z]}
      onClick={(event) => {
        if (event.delta > 4) return
        event.stopPropagation()
        activate()
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[TILE_W + 0.3, 0.12, TILE_D + 0.3]} />
        <meshStandardMaterial color={t(COLORS.oak)} roughness={0.7} />
      </mesh>
      <mesh position={[0, PLAT / 2 + 0.04, 0]}>
        <boxGeometry args={[TILE_W, PLAT - 0.08, TILE_D]} />
        {[0, 1, 2, 3, 4, 5].map((face) => (
          <meshStandardMaterial
            key={face}
            attach={`material-${face}`}
            color={face === 2 ? t(COLORS.ivory) : t(face === 4 || face === 5 ? COLORS.navy : COLORS.navyDark)}
            roughness={0.85}
          />
        ))}
      </mesh>

      <mesh position={[workRug.x * S, PLAT + 0.005, workRug.z * S]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[workRug.radius * S, 32]} />
        <meshStandardMaterial color={t(COLORS.navy)} transparent opacity={0.14} />
      </mesh>
      <mesh position={[loungeTable.x * S, PLAT + 0.006, loungeTable.z * S]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7 * S, 32]} />
        <meshStandardMaterial color={t(COLORS.forest)} transparent opacity={0.35} />
      </mesh>
      <mesh position={[loungeTable.x * S, PLAT + 0.15, loungeTable.z * S]}>
        <cylinderGeometry args={[0.36, 0.3, 0.3, 24]} />
        <meshStandardMaterial color={t(COLORS.oakDark)} roughness={0.7} />
      </mesh>
      {[
        [-6.2, -4.1],
        [6.2, 4.3],
        [1.9, 4.4],
      ].map(([px, pz]) => (
        <group key={`${px}-${pz}`} position={[px * ROOM_SCALE * S, PLAT, pz * ROOM_SCALE * S]}>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.14, 12]} />
            <meshStandardMaterial color={t("#a5622f")} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.2, 14, 12]} />
            <meshStandardMaterial color={t(COLORS.leaf)} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {seats.map((seat) => (
        <Furniture key={seat.id} seat={seat} kind={space.kind} locked={locked} />
      ))}
      {roster.map((person, index) => {
        const seat = seats[person.seatIndex]
        return (
          <group key={person.id}>
            {seat.furniture === "desk" && <Laptop seat={seat} />}
            <SamplePerson seat={seat} person={person} index={index} detail={detail} />
          </group>
        )
      })}

      <TileLabel tile={tile} onActivate={activate} />
    </group>
  )
}

function TileLabel({ tile, onActivate }: { tile: Tile; onActivate: () => void }) {
  const { space, role } = tile
  const locked = role === "visitor"
  const ariaLabel = locked
    ? `${space.name} — locked preview, needs a space code (map)`
    : `Open ${space.name} (map)`

  return (
    <Html position={[0, 0.2, TILE_D / 2 + 1]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div className="group relative flex w-[116px] justify-center">
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={onActivate}
          className={`pointer-events-auto flex w-full flex-col items-center rounded-lg border px-2 py-1 text-center shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
            locked
              ? "border-slate-300 bg-white/85 hover:bg-white"
              : "border-slate-200 bg-white/95 hover:border-slate-300"
          }`}
        >
          <span className="max-w-full truncate text-[12px] font-semibold leading-4 text-slate-900">
            {space.name}
          </span>
          <span className="flex items-center gap-1 text-[10px] leading-4 text-slate-600">
            <span className="flex gap-px" aria-hidden="true">
              {Array.from({ length: space.capacity }, (_, index) => (
                <span key={index} className="size-1 rounded-[1px] bg-slate-500" />
              ))}
            </span>
            {space.capacity} seats
          </span>
          <span
            className={`mt-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 text-[9px] font-semibold leading-4 ${
              locked
                ? "bg-slate-100 text-slate-700"
                : role === "owner"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-blue-50 text-blue-800"
            }`}
          >
            {locked ? (
              <>
                <Lock className="size-2.5" aria-hidden="true" />
                Needs a space code
              </>
            ) : role === "owner" ? (
              "Yours"
            ) : (
              "Joined"
            )}
          </span>
        </button>
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden w-48 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-md group-focus-within:block group-hover:block"
        >
          <p className="text-xs font-semibold text-slate-900">{space.name}</p>
          <p className="text-[11px] leading-4 text-slate-600">
            {kindLabel(space.kind)} · {space.capacity} seats
          </p>
          <p className="text-[11px] font-medium leading-4 text-slate-800">
            {locked ? studySpacesLockedTooltip : role === "owner" ? "Yours" : "Joined"}
          </p>
          <p className="text-[11px] leading-4 text-slate-500">
            {locked ? "Preview only — not opened" : `${metaLine(space)} · browser only`}
          </p>
        </div>
      </div>
    </Html>
  )
}

type RigHandle = { zoomBy: (factor: number) => void; reset: () => void }

function Rig({
  handleRef,
  focus,
  bounds,
  onDetail,
}: {
  handleRef: RefObject<RigHandle | null>
  focus: { x: number; z: number }
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  onDetail: (detail: boolean) => void
}) {
  const controls = useRef<MapControlsImpl>(null)
  const get = useThree((state) => state.get)
  const width = useThree((state) => state.size.width)
  const detailRef = useRef(false)

  const reset = useCallback(() => {
    const c = controls.current
    if (!c) return
    const camera = get().camera as OrthographicCamera
    camera.zoom = clamp(get().size.width / 62, 11, 20)
    camera.position.set(focus.x + 40, 36, focus.z + 40)
    camera.updateProjectionMatrix()
    c.target.set(focus.x, 0, focus.z)
    c.update()
  }, [get, focus.x, focus.z])

  const framed = useRef(false)
  useEffect(() => {
    if (width > 0 && !framed.current) {
      framed.current = true
      reset()
    }
  }, [width, reset])

  useEffect(() => {
    handleRef.current = {
      reset,
      zoomBy: (factor) => {
        const camera = get().camera as OrthographicCamera
        camera.zoom = clamp(camera.zoom * factor, MIN_ZOOM, MAX_ZOOM)
        camera.updateProjectionMatrix()
        controls.current?.update()
      },
    }
    return () => {
      handleRef.current = null
    }
  }, [get, handleRef, reset])

  function handleChange() {
    const c = controls.current
    if (!c) return
    const camera = get().camera
    const x = clamp(c.target.x, bounds.minX, bounds.maxX)
    const z = clamp(c.target.z, bounds.minZ, bounds.maxZ)
    if (x !== c.target.x || z !== c.target.z) {
      camera.position.x += x - c.target.x
      camera.position.z += z - c.target.z
      c.target.x = x
      c.target.z = z
    }
    const detail = camera.zoom >= DETAIL_ZOOM
    if (detail !== detailRef.current) {
      detailRef.current = detail
      onDetail(detail)
    }
  }

  return (
    <MapControls
      ref={controls}
      makeDefault
      enableRotate={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.12}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      zoomSpeed={1.1}
      onChange={handleChange}
    />
  )
}

export default function SpaceMap3D({ created, joined, locked, onOpen, onUnlock }: SpaceMap3DProps) {
  const { zones, totalDepth } = useMemo(
    () =>
      layoutZones([
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
  const [detail, setDetail] = useState(false)
  const handleRef = useRef<RigHandle | null>(null)
  const focus = useMemo(() => ({ x: 0, z: zones[0].z0 + zones[0].depth / 2 + 2 }), [zones])
  const bounds = useMemo(
    () => ({ minX: -RUG_W / 2, maxX: RUG_W / 2, minZ: 0, maxZ: totalDepth }),
    [totalDepth]
  )

  return (
    <div className="relative h-[62vh] min-h-[440px] overflow-hidden rounded-3xl bg-[#ece3cf] sm:h-[68vh] lg:h-[72vh]">
      <Canvas
        orthographic
        dpr={[1, 2]}
        camera={{ position: [40, 36, 40], zoom: 16, near: -200, far: 400 }}
        aria-label="Isometric study hall map. The cards below list every space."
        fallback={
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-600">
            The 3D study hall map could not start because WebGL is unavailable. Use the space cards below.
          </div>
        }
      >
        <color attach="background" args={["#ece3cf"]} />
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#fff6e5", "#8a7a5a", 0.5]} />
        <directionalLight position={[14, 22, 8]} intensity={1.1} />

        <mesh position={[0, -0.02, totalDepth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[RUG_W + 14, totalDepth + 14]} />
          <meshStandardMaterial color={COLORS.ivory} roughness={1} />
        </mesh>

        {zones.map((zone, index) => {
          const isLocked = zone.role === "visitor"
          const rugColor = zone.role === "owner" ? COLORS.forest : zone.role === "member" ? COLORS.navy : "#7b8794"
          const next = zones[index + 1]
          return (
            <group key={zone.role}>
              <mesh position={[0, 0.03, zone.z0 + zone.depth / 2]}>
                <boxGeometry args={[RUG_W, 0.06, zone.depth]} />
                <meshStandardMaterial color={rugColor} transparent opacity={isLocked ? 0.22 : 0.2} roughness={1} />
              </mesh>
              <Html
                position={[-RUG_W / 2 + 3.2, 0.1, zone.z0 + 0.1]}
                center
                zIndexRange={[15, 0]}
                style={{ pointerEvents: "none" }}
              >
                <span
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-widest shadow-sm ${
                    isLocked ? "text-slate-600" : zone.role === "owner" ? "text-emerald-900" : "text-slate-800"
                  }`}
                >
                  {isLocked && <Lock className="size-3" aria-hidden="true" />}
                  {zone.label}
                </span>
              </Html>
              {zone.tiles.length === 0 && (
                <Html position={[0, 0.2, zone.z0 + zone.depth / 2]} center style={{ pointerEvents: "none" }}>
                  <p className="w-56 text-center text-sm leading-5 text-slate-600">{zone.emptyMessage}</p>
                </Html>
              )}
              {next && (
                <group position={[0, 0.02, zone.z0 + zone.depth + ZONE_GAP / 2]}>
                  <mesh>
                    <boxGeometry args={[RUG_W, 0.03, ZONE_GAP - 0.6]} />
                    <meshStandardMaterial color="#e6dbc2" roughness={1} />
                  </mesh>
                  {Array.from({ length: 14 }, (_, dash) => (
                    <mesh key={dash} position={[-RUG_W / 2 + 1.2 + dash * ((RUG_W - 2.4) / 13), 0.03, 0]}>
                      <boxGeometry args={[0.9, 0.02, 0.12]} />
                      <meshStandardMaterial color="#b9a57a" />
                    </mesh>
                  ))}
                </group>
              )}
            </group>
          )
        })}

        {zones
          .flatMap((zone) => zone.tiles)
          .map((tile) => (
            <TileScene key={tile.space.id} tile={tile} detail={detail} onOpen={onOpen} onUnlock={onUnlock} />
          ))}

        <Rig handleRef={handleRef} focus={focus} bounds={bounds} onDetail={setDetail} />
      </Canvas>

      <p className="pointer-events-none absolute bottom-3 left-4 right-28 text-[11px] leading-4 text-slate-600">
        Drag to move, pinch or use the buttons to zoom · zoom in on your desk row to see sample study-mates · click a
        space to open it
      </p>

      <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1 rounded-xl bg-white/95 p-1 shadow-sm">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => handleRef.current?.zoomBy(1.3)}>
          <Plus aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => handleRef.current?.zoomBy(1 / 1.3)}>
          <Minus aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Reset view" onClick={() => handleRef.current?.reset()}>
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
