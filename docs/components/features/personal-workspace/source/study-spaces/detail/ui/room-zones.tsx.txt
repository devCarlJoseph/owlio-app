import { Html } from "@react-three/drei"
import type { StudySpaceKind } from "../study-spaces-records"
import { RoomTv } from "./room-extras"
import { discussionTable, napArea, watchRoom } from "./study-space-seats"

type Vec3 = [number, number, number]

const WOOD = "#b98a55"
const WOOD_DARK = "#7a5634"
const BOOK_COLORS = ["#b91c1c", "#1d4ed8", "#15803d", "#a16207", "#7e22ce", "#0e7490", "#be185d"]
const noRaycast = () => null

export function AreaSign({ position, label, tone }: { position: Vec3; label: string; tone: "table" | "nap" | "watch" }) {
  const toneClass =
    tone === "nap" ? "bg-violet-100/95 text-violet-900" : tone === "watch" ? "bg-sky-100/95 text-sky-900" : "bg-amber-100/95 text-amber-900"
  return (
    <Html position={position} center style={{ pointerEvents: "none" }} zIndexRange={[12, 0]}>
      <span className={`block whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide shadow ${toneClass}`}>
        {label}
      </span>
    </Html>
  )
}

function Laptop({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.01, 0]} castShadow>
        <boxGeometry args={[0.42, 0.02, 0.3]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.15, -0.15]} rotation={[-0.25, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 0.28, 0.015]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.15, -0.14]} rotation={[-0.25, 0, 0]}>
        <planeGeometry args={[0.38, 0.24]} />
        <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function BookStack({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[index * 0.02, 0.03 + index * 0.06, 0]} rotation={[0, index * 0.25, 0]} castShadow>
          <boxGeometry args={[0.32, 0.055, 0.22]} />
          <meshStandardMaterial color={BOOK_COLORS[(index * 2 + 1) % BOOK_COLORS.length]} />
        </mesh>
      ))}
    </group>
  )
}

function Mug({ position, color }: { position: Vec3; color: string }) {
  return (
    <mesh position={[position[0], position[1] + 0.06, position[2]]} castShadow>
      <cylinderGeometry args={[0.05, 0.045, 0.12, 14]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Notebook({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.008, 0]}>
        <boxGeometry args={[0.36, 0.015, 0.26]} />
        <meshStandardMaterial color="#fef9c3" />
      </mesh>
      <mesh position={[0.12, 0.02, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
    </group>
  )
}

function SmallPlant({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.16, 14]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.26, 0]} castShadow>
        <sphereGeometry args={[0.16, 14, 10]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
    </group>
  )
}

// The single discussion table; room type picks rectangular, oval or a low round lounge table.
export function DiscussionTable({ kind }: { kind: StudySpaceKind }) {
  const { x, z } = discussionTable
  const shape = discussionTable.shape[kind]
  const top = shape === "round" ? 0.52 : 0.76
  const spread = shape === "rect" ? 1 : shape === "oval" ? 0.85 : 0.5

  return (
    <group position={[x, 0, z]}>
      {shape === "rect" ? (
        <mesh position={[0, 0.012, 0]} receiveShadow raycast={noRaycast}>
          <boxGeometry args={[discussionTable.rect.w + 3.6, 0.02, discussionTable.rect.d + 3.6]} />
          <meshStandardMaterial color="#ecd9b8" />
        </mesh>
      ) : (
        <mesh position={[0, 0.012, 0]} scale={shape === "oval" ? [discussionTable.oval.rx + 1.9, 1, discussionTable.oval.rz + 1.9] : [3.6, 1, 3.6]} receiveShadow raycast={noRaycast}>
          <cylinderGeometry args={[1, 1, 0.02, 48]} />
          <meshStandardMaterial color="#ecd9b8" />
        </mesh>
      )}

      {shape === "rect" ? (
        <>
          <mesh position={[0, top - 0.04, 0]} castShadow receiveShadow>
            <boxGeometry args={[discussionTable.rect.w, 0.08, discussionTable.rect.d]} />
            <meshStandardMaterial color={WOOD} roughness={0.55} />
          </mesh>
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([sx, sz]) => (
            <mesh key={`${sx}-${sz}`} position={[sx * (discussionTable.rect.w / 2 - 0.2), (top - 0.08) / 2, sz * (discussionTable.rect.d / 2 - 0.2)]} castShadow>
              <boxGeometry args={[0.09, top - 0.08, 0.09]} />
              <meshStandardMaterial color={WOOD_DARK} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh
            position={[0, top - 0.04, 0]}
            scale={shape === "oval" ? [discussionTable.oval.rx, 1, discussionTable.oval.rz] : [discussionTable.round.r, 1, discussionTable.round.r]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[1, 1, 0.08, 48]} />
            <meshStandardMaterial color={WOOD} roughness={0.55} />
          </mesh>
          {(shape === "oval" ? [-1.2, 1.2] : [0]).map((px) => (
            <group key={px} position={[px, 0, 0]}>
              <mesh position={[0, (top - 0.08) / 2, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.12, top - 0.08, 12]} />
                <meshStandardMaterial color={WOOD_DARK} />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.45, 0.5, 0.06, 20]} />
                <meshStandardMaterial color={WOOD_DARK} />
              </mesh>
            </group>
          ))}
        </>
      )}

      <group position={[0, top, 0]}>
        <SmallPlant position={[0, 0, 0]} />
        <Laptop position={[-1.5 * spread, 0, -0.35 * spread]} rotation={Math.PI} />
        <Laptop position={[0.6 * spread, 0, 0.4 * spread]} />
        <BookStack position={[-0.55 * spread, 0, -0.4 * spread]} rotation={0.3} />
        <Notebook position={[1.5 * spread, 0, 0.35 * spread]} rotation={-0.3} />
        <Notebook position={[-1.4 * spread, 0, 0.45 * spread]} rotation={0.5} />
        <Mug position={[1.2 * spread, 0, -0.35 * spread]} color="#f97316" />
        <Mug position={[-0.9 * spread, 0, 0.5 * spread]} color="#22c55e" />
      </group>
    </group>
  )
}

// Standing arc lamp leaning over the discussion table.
export function ArcLamp({ position, lamps }: { position: Vec3; lamps: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.08, 20]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.7, 2.4, 0.35]} rotation={[0.45, 0, 1.1]}>
        <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-1.35, 2.2, 0.7]}>
        <coneGeometry args={[0.32, 0.3, 24, 1, true]} />
        <meshStandardMaterial color="#f8fafc" emissive="#fde68a" emissiveIntensity={0.2 + lamps * 1.1} side={2} />
      </mesh>
    </group>
  )
}

function Partition({ position, size, color }: { position: Vec3; size: Vec3; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow raycast={noRaycast}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size[1] + 0.03, 0]} raycast={noRaycast}>
        <boxGeometry args={[size[0] + 0.04, 0.06, size[2] + 0.04]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

// Quiet nap corner: soft carpet, partitions, beanbag, blanket shelf and a dim lamp.
export function NapAreaDecor({ lamps }: { lamps: number }) {
  const { minX, maxX, minZ, maxZ } = napArea
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2

  return (
    <group>
      <mesh position={[cx, 0.01, cz]} receiveShadow raycast={noRaycast}>
        <boxGeometry args={[maxX - minX, 0.02, maxZ - minZ]} />
        <meshStandardMaterial color="#ece4f8" />
      </mesh>
      <Partition position={[minX, 0, minZ + (maxZ - minZ - 1.8) / 2]} size={[0.14, 1.1, maxZ - minZ - 1.8]} color="#c4b5fd" />
      <Partition position={[(minX + 2 + maxX) / 2, 0, maxZ]} size={[maxX - minX - 2, 0.6, 0.14]} color="#c4b5fd" />

      <mesh position={[5.2, 0.3, -2.75]} scale={[1, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.55, 24, 16]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.95} />
      </mesh>

      <group position={[10.1, 0, -6.8]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.6, 1.2, 1.2]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        {[0.3, 0.7, 1.05].map((y, index) => (
          <mesh key={y} position={[-0.05, y, 0]}>
            <boxGeometry args={[0.55, 0.16, 1]} />
            <meshStandardMaterial color={["#a78bfa", "#93c5fd", "#fcd34d"][index]} />
          </mesh>
        ))}
      </group>

      <group position={[10, 0, -2.6]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.6, 18]} />
          <meshStandardMaterial color="#ddd6fe" />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshStandardMaterial color="#fff7ed" emissive="#fdba74" emissiveIntensity={0.3 + lamps * 0.9} />
        </mesh>
      </group>
      {[6, 7.8, 9.6].map((x) => (
        <mesh key={x} position={[x, 0.005, -5]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
          <planeGeometry args={[1.3, 2.4]} />
          <meshStandardMaterial color="#ddd3f3" />
        </mesh>
      ))}
    </group>
  )
}

// Group watch room: carpet, partitions, media wall with the big screen, coffee table and speakers.
export function WatchRoomDecor({ hasVideo, onOpenTv }: { hasVideo: boolean; onOpenTv: () => void }) {
  const { minX, maxX, minZ, maxZ, screenZ } = watchRoom
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2

  return (
    <group>
      <mesh position={[cx, 0.01, cz]} receiveShadow raycast={noRaycast}>
        <boxGeometry args={[maxX - minX, 0.02, maxZ - minZ]} />
        <meshStandardMaterial color="#d3def3" />
      </mesh>
      <Partition position={[(minX + 2 + maxX) / 2, 0, minZ]} size={[maxX - minX - 2, 1.1, 0.14]} color="#93c5fd" />
      <Partition position={[minX, 0, (minZ + 1.8 + maxZ) / 2]} size={[0.14, 1.1, maxZ - minZ - 1.8]} color="#93c5fd" />

      <mesh position={[maxX - 0.2, 1.5, screenZ]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 3, 5.4]} />
        <meshStandardMaterial color="#5b4636" />
      </mesh>
      <group position={[maxX - 0.4, 2.15, screenZ]} rotation={[0, -Math.PI / 2, 0]} scale={1.25}>
        <RoomTv position={[0, 0, 0]} hasVideo={hasVideo} onOpen={onOpenTv} />
      </group>
      {[screenZ - 2.2, screenZ + 2.2].map((z) => (
        <mesh key={z} position={[maxX - 0.6, 0.6, z]} castShadow>
          <boxGeometry args={[0.4, 1.2, 0.4]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}

      <group position={[8.3, 0, screenZ]}>
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[0.9, 0.06, 1.8]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.7, 0.34, 1.5]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
        <mesh position={[0, 0.45, 0.3]}>
          <cylinderGeometry args={[0.16, 0.1, 0.12, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 0.52, 0.3]}>
          <sphereGeometry args={[0.13, 12, 8]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
      </group>
    </group>
  )
}

export function PinBoard({ position }: { position: Vec3 }) {
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

export function Bookshelf({ position }: { position: Vec3 }) {
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
      {[0.56, 1.16, 1.76].map((y, row) => (
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

export function Plant({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.52, 16]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.45, 18, 14]} />
        <meshStandardMaterial color="#3f9d58" />
      </mesh>
      <mesh position={[0.2, 1.25, 0.1]} castShadow>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshStandardMaterial color="#5bb872" />
      </mesh>
    </group>
  )
}
