import { useState } from "react"
import { Html, useCursor } from "@react-three/drei"

type Vec3 = [number, number, number]

const FLOWERS: { x: number; z: number; color: string }[] = [
  { x: -1.7, z: -0.6, color: "#f472b6" },
  { x: -1.3, z: -0.75, color: "#facc15" },
  { x: -0.9, z: -0.55, color: "#a78bfa" },
  { x: 1.2, z: 0.6, color: "#fb7185" },
  { x: 1.55, z: 0.45, color: "#facc15" },
  { x: 1.85, z: 0.7, color: "#60a5fa" },
  { x: -1.85, z: 0.65, color: "#fb923c" },
]

// Indoor garden corner: grass bed, small tree, flowers, a bench and a lamp that glows at night.
// The bench toggles the "Forest Breeze" ambience in the room music player.
export function RoomGarden({
  position,
  lamps,
  soundOn,
  onToggleSound,
}: {
  position: Vec3
  lamps: number
  soundOn: boolean
  onToggleSound: () => void
}) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.6, 0.12, 2.3]} />
        <meshStandardMaterial color="#8a6d42" />
      </mesh>
      <mesh position={[0, 0.125, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.02, 2.1]} />
        <meshStandardMaterial color="#86c46d" />
      </mesh>
      {[-0.6, 0, 0.6].map((x, index) => (
        <mesh key={x} position={[x, 0.14, -0.1 + index * 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 16]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      ))}

      <group position={[1.65, 0.13, -0.55]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.11, 1.1, 8]} />
          <meshStandardMaterial color="#8a5a33" />
        </mesh>
        <mesh position={[0, 1.4, 0]} castShadow>
          <icosahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial color="#4caf50" flatShading />
        </mesh>
        <mesh position={[0.2, 1.85, 0.1]} castShadow>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#66bb6a" flatShading />
        </mesh>
      </group>

      {FLOWERS.map((flower) => (
        <group key={`${flower.x}-${flower.z}`} position={[flower.x, 0.13, flower.z]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.24, 5]} />
            <meshStandardMaterial color="#3f7d4e" />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={flower.color} />
          </mesh>
        </group>
      ))}

      <group
        position={[-0.4, 0.13, 0.55]}
        onClick={(event) => {
          if (event.delta > 4) return
          event.stopPropagation()
          onToggleSound()
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[1.5, 0.08, 0.45]} />
          <meshStandardMaterial color={hovered ? "#c08a4e" : "#a5743f"} />
        </mesh>
        <mesh position={[0, 0.66, 0.2]} castShadow>
          <boxGeometry args={[1.5, 0.4, 0.06]} />
          <meshStandardMaterial color={hovered ? "#c08a4e" : "#a5743f"} />
        </mesh>
        {[-0.65, 0.65].map((x) => (
          <mesh key={x} position={[x, 0.18, 0]}>
            <boxGeometry args={[0.08, 0.36, 0.42]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        ))}
        {hovered ? (
          <Html position={[0, 1.15, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
            <span className="block whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium text-white shadow">
              {soundOn ? "Stop garden sounds" : "Play garden sounds (Forest Breeze)"}
            </span>
          </Html>
        ) : null}
      </group>

      <group position={[-1.95, 0.13, -0.7]}>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 1.5, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color="#fff7d6" emissive="#fde68a" emissiveIntensity={0.15 + lamps * 1.2} />
        </mesh>
        {lamps > 0 ? <pointLight position={[0, 1.5, 0]} intensity={4 * lamps} distance={5} color="#fde68a" /> : null}
      </group>

      <Html position={[0, 0.5, 1.35]} center style={{ pointerEvents: "none" }} zIndexRange={[12, 0]}>
        <span className="block whitespace-nowrap rounded-full bg-emerald-100/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-emerald-900 shadow">
          Garden corner
        </span>
      </Html>
    </group>
  )
}
