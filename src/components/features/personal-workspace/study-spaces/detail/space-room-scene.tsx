import { useRef, useState, type RefObject } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html, OrbitControls } from "@react-three/drei"
import type { Group } from "three"
import type { StudySpaceCharacter } from "../study-spaces-records"

export type CameraResetHandle = {
  reset: () => void
}

export type SpaceRoomSceneProps = {
  character: StudySpaceCharacter
  showNameTag: boolean
  bubbleText: string | null
  cameraResetRef: RefObject<CameraResetHandle | null>
}

const ROOM = { halfWidth: 7, halfDepth: 5, wallHeight: 3 }
const MOVE_MARGIN = 0.5
const WALK_SPEED = 2.6

const DESK_SPOTS: { position: [number, number, number]; rotationY: number }[] = [
  { position: [-4.4, 0, -2.1], rotationY: 0 },
  { position: [-2.4, 0, -2.1], rotationY: 0 },
  { position: [-4.4, 0, -0.3], rotationY: Math.PI },
  { position: [-2.4, 0, -0.3], rotationY: Math.PI },
]

const STOOL_SPOTS: [number, number, number][] = [
  [3.7, 0, 1.5],
  [4.5, 0, 2.6],
  [2.9, 0, 2.7],
]

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function SpaceRoomScene({
  character,
  showNameTag,
  bubbleText,
  cameraResetRef,
}: SpaceRoomSceneProps) {
  const [moveTarget, setMoveTarget] = useState({ x: 3.4, z: 0.6 })

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
      camera={{ position: [12, 12, 12], zoom: 55, near: -100, far: 300 }}
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

      <RoomShell onFloorClick={handleFloorClick} />
      <SpaceCharacter
        character={character}
        target={moveTarget}
        showNameTag={showNameTag}
        bubbleText={bubbleText}
      />
    </Canvas>
  )
}

function RoomShell({ onFloorClick }: { onFloorClick: (point: { x: number; z: number }) => void }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation()
          onFloorClick({ x: event.point.x, z: event.point.z })
        }}
      >
        <planeGeometry args={[ROOM.halfWidth * 2, ROOM.halfDepth * 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      <mesh position={[0, ROOM.wallHeight / 2, -ROOM.halfDepth]} receiveShadow>
        <boxGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight, 0.15]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[-ROOM.halfWidth, ROOM.wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.15, ROOM.wallHeight, ROOM.halfDepth * 2]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {DESK_SPOTS.map((spot) => (
        <Desk key={`${spot.position[0]}-${spot.position[2]}`} position={spot.position} rotationY={spot.rotationY} />
      ))}

      <mesh position={[3.7, 0.02, 2.1]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.7, 0.03, 32]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>
      <mesh position={[3.7, 0.55, 2.1]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.06, 32]} />
        <meshStandardMaterial color="#c9a876" />
      </mesh>
      <mesh position={[3.7, 0.27, 2.1]}>
        <cylinderGeometry args={[0.07, 0.14, 0.55, 12]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      {STOOL_SPOTS.map((position) => (
        <mesh key={`${position[0]}-${position[2]}`} position={[position[0], 0.23, position[2]]} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.46, 16]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      ))}

      <group position={[5.6, 0, -4.2]} rotation={[0, -0.35, 0]}>
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
      </group>

      <Plant position={[-6.2, 0, -4.1]} />
      <Plant position={[6.2, 0, 4.1]} />
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
  target,
  showNameTag,
  bubbleText,
}: {
  character: StudySpaceCharacter
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
    <group ref={groupRef} position={[3.4, 0, 0.6]}>
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
