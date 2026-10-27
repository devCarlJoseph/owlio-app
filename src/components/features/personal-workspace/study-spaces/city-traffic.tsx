import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshStandardMaterial, type Group } from "three"
import { ROAD, type CityLayout } from "./city-layout"
import {
  buildLoop,
  cityLoops,
  pointAt,
  signalFor,
  signalizedIntersections,
  type Axis,
  type Signal,
  type TrafficPath,
} from "./traffic-paths"

type VehicleKind = "sedan" | "taxi" | "bus" | "van"

type VehicleSpec = { kind: VehicleKind; color: string; path: number; start: number }

const VEHICLES: VehicleSpec[] = [
  { kind: "bus", color: "#2f6fe4", path: 0, start: 0.1 },
  { kind: "sedan", color: "#ef4444", path: 1, start: 0.3 },
  { kind: "taxi", color: "#facc15", path: 2, start: 0.55 },
  { kind: "sedan", color: "#f8fafc", path: 3, start: 0.2 },
  { kind: "van", color: "#10b981", path: 4, start: 0.4 },
  { kind: "sedan", color: "#1e293b", path: 5, start: 0.7 },
  { kind: "sedan", color: "#a855f7", path: 0, start: 0.6 },
  { kind: "taxi", color: "#facc15", path: 1, start: 0.85 },
]

const SPEED: Record<VehicleKind, number> = { sedan: 5.2, taxi: 5.6, bus: 3.8, van: 4.6 }
const LENGTH: Record<VehicleKind, number> = { sedan: 1.9, taxi: 1.9, bus: 3.4, van: 2.2 }

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

function Wheels({ length }: { length: number }) {
  const x = 0.42
  const z = length / 2 - 0.38
  return (
    <>
      {[
        [-x, -z],
        [x, -z],
        [-x, z],
        [x, z],
      ].map(([wx, wz]) => (
        <mesh key={`${wx}-${wz}`} position={[wx, 0.18, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.14, 14]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
    </>
  )
}

function Lights({ length, lamps }: { length: number; lamps: number }) {
  return (
    <>
      {[-0.28, 0.28].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.42, length / 2 + 0.005]}>
            <boxGeometry args={[0.18, 0.1, 0.02]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fef08a" emissiveIntensity={0.3 + lamps * 2} />
          </mesh>
          <mesh position={[x, 0.42, -length / 2 - 0.005]}>
            <boxGeometry args={[0.18, 0.08, 0.02]} />
            <meshStandardMaterial color="#b91c1c" emissive="#ef4444" emissiveIntensity={0.3 + lamps * 1.2} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Vehicle({ spec, lamps }: { spec: VehicleSpec; lamps: number }) {
  const length = LENGTH[spec.kind]
  const glass = (
    <meshStandardMaterial color="#9cc7ea" emissive="#bfdbfe" emissiveIntensity={lamps * 0.4} roughness={0.15} metalness={0.2} />
  )

  if (spec.kind === "bus") {
    return (
      <group>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[1.05, 1.1, length]} />
          <meshStandardMaterial color={spec.color} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[1.07, 0.38, length - 0.4]} />
          {glass}
        </mesh>
        <mesh position={[0, 1.32, 0]}>
          <boxGeometry args={[0.95, 0.04, length - 0.3]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.07, 0.1, length - 0.2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <Wheels length={length} />
        <Lights length={length} lamps={lamps} />
      </group>
    )
  }

  const cabinLength = spec.kind === "van" ? length - 0.5 : length * 0.52
  const cabinZ = spec.kind === "van" ? -0.15 : -0.08
  return (
    <group>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.95, 0.38, length]} />
        <meshStandardMaterial color={spec.color} roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.72, cabinZ]} castShadow>
        <boxGeometry args={[0.85, 0.34, cabinLength]} />
        <meshStandardMaterial color={spec.color} roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.73, cabinZ]}>
        <boxGeometry args={[0.87, 0.24, cabinLength - 0.12]} />
        {glass}
      </mesh>
      {spec.kind === "taxi" ? (
        <mesh position={[0, 0.95, cabinZ]}>
          <boxGeometry args={[0.36, 0.12, 0.2]} />
          <meshStandardMaterial color="#111827" emissive="#facc15" emissiveIntensity={0.4 + lamps} />
        </mesh>
      ) : null}
      <Wheels length={length} />
      <Lights length={length} lamps={lamps} />
    </group>
  )
}

// Cars loop the streets, follow the roundabout, stop at red and yellow lights, and keep a gap.
export function Traffic({ layout, lamps }: { layout: CityLayout; lamps: number }) {
  const intersections = useMemo(() => signalizedIntersections(layout), [layout])
  const paths = useMemo<TrafficPath[]>(
    () => cityLoops(layout).map((corners) => buildLoop(layout, corners, intersections)),
    [layout, intersections]
  )
  const groups = useRef<(Group | null)[]>([])
  const state = useRef<{ s: number; v: number }[]>([])

  useEffect(() => {
    state.current = VEHICLES.map((spec) => ({ s: spec.start * paths[spec.path % paths.length].total, v: 0 }))
  }, [paths])

  useFrame(({ clock }, delta) => {
    if (state.current.length !== VEHICLES.length) return
    const dt = reducedMotion ? Math.min(delta, 0.05) * 0.6 : Math.min(delta, 0.05)
    const time = clock.elapsedTime
    const poses = VEHICLES.map((spec, index) => pointAt(paths[spec.path % paths.length], state.current[index].s))

    VEHICLES.forEach((spec, index) => {
      const path = paths[spec.path % paths.length]
      const car = state.current[index]
      const pose = poses[index]
      let target = SPEED[spec.kind]

      for (const stop of path.stops) {
        const ahead = (stop.s - car.s + path.total) % path.total
        if (ahead <= 0.05 || ahead > 8) continue
        const signal = signalFor(stop.axis, time, stop.intersection.group)
        if (signal === "red" || (signal === "yellow" && ahead > 1.8)) target = Math.min(target, Math.max(0, (ahead - 0.15) * 1.4))
      }

      const fx = Math.sin(pose.heading)
      const fz = Math.cos(pose.heading)
      VEHICLES.forEach((other, otherIndex) => {
        if (otherIndex === index) return
        const p = poses[otherIndex]
        const dx = p.x - pose.x
        const dz = p.z - pose.z
        const along = dx * fx + dz * fz
        const lateral = Math.abs(dx * fz - dz * fx)
        const sameWay = Math.cos(p.heading - pose.heading) > 0.3
        const gap = (LENGTH[spec.kind] + LENGTH[other.kind]) / 2 + 0.9
        if (along > 0 && along < gap + 3 && lateral < 0.9 && sameWay) target = Math.min(target, Math.max(0, (along - gap) * 2))
      })

      const change = target - car.v
      car.v += Math.max(Math.min(change, 3.5 * dt), -9 * dt)
      car.s = (car.s + car.v * dt) % path.total

      const node = groups.current[index]
      if (node) {
        node.position.set(pose.x, 0, pose.z)
        node.rotation.y = pose.heading
      }
    })
  })

  return (
    <group>
      {VEHICLES.map((spec, index) => (
        <group
          key={index}
          ref={(node) => {
            groups.current[index] = node
          }}
        >
          <Vehicle spec={spec} lamps={lamps} />
        </group>
      ))}
    </group>
  )
}

type LightMaterials = Record<Axis, Record<Signal | "walk" | "dontWalk", MeshStandardMaterial>>

const SIGNAL_COLORS: Record<Signal | "walk" | "dontWalk", string> = {
  red: "#ef4444",
  yellow: "#facc15",
  green: "#22c55e",
  walk: "#f8fafc",
  dontWalk: "#f97316",
}

function createMaterials(): LightMaterials {
  const make = (key: Signal | "walk" | "dontWalk") =>
    new MeshStandardMaterial({ color: SIGNAL_COLORS[key], emissive: SIGNAL_COLORS[key], emissiveIntensity: 0 })
  const set = () => ({ red: make("red"), yellow: make("yellow"), green: make("green"), walk: make("walk"), dontWalk: make("dontWalk") })
  return { ns: set(), ew: set() }
}

function SignalHead({ materials, rotation }: { materials: LightMaterials[Axis]; rotation: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.26, 0.72, 0.2]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {(["red", "yellow", "green"] as const).map((color, index) => (
        <mesh key={color} position={[0, 0.22 - index * 0.22, 0.105]} material={materials[color]}>
          <sphereGeometry args={[0.075, 12, 8]} />
        </mesh>
      ))}
    </group>
  )
}

// Two signal poles per intersection, with car lights for each road and pedestrian walk lights.
export function TrafficSignals({ layout }: { layout: CityLayout }) {
  const intersections = useMemo(() => signalizedIntersections(layout), [layout])
  const groupMaterials = useMemo<[LightMaterials, LightMaterials]>(() => [createMaterials(), createMaterials()], [])

  useEffect(
    () => () =>
      groupMaterials.forEach((group) =>
        (["ns", "ew"] as const).forEach((axis) => Object.values(group[axis]).forEach((material) => material.dispose()))
      ),
    [groupMaterials]
  )

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    groupMaterials.forEach((group, groupIndex) => {
      ;(["ns", "ew"] as const).forEach((axis) => {
        const signal = signalFor(axis, time, groupIndex as 0 | 1)
        const crossing = signalFor(axis === "ns" ? "ew" : "ns", time, groupIndex as 0 | 1)
        ;(["red", "yellow", "green"] as const).forEach((color) => {
          group[axis][color].emissiveIntensity = signal === color ? 2.2 : 0
          group[axis][color].color.set(signal === color ? SIGNAL_COLORS[color] : "#374151")
        })
        // People crossing this road may walk while its traffic has a red light.
        const walk = crossing !== "red" && signal === "red"
        group[axis].walk.emissiveIntensity = walk ? 2 : 0
        group[axis].walk.color.set(walk ? SIGNAL_COLORS.walk : "#374151")
        group[axis].dontWalk.emissiveIntensity = walk ? 0 : 1.6
        group[axis].dontWalk.color.set(walk ? "#374151" : SIGNAL_COLORS.dontWalk)
      })
    })
  })

  const offset = ROAD / 2 + 0.45

  return (
    <group>
      {intersections.map((intersection) => {
        const materials = groupMaterials[intersection.group]
        return (
          <group key={intersection.id} position={[intersection.x, 0, intersection.z]}>
            {[
              [1, 1],
              [-1, -1],
            ].map(([sx, sz]) => (
              <group key={`${sx}-${sz}`} position={[sx * offset, 0, sz * offset]}>
                <mesh position={[0, 1.4, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.07, 2.8, 8]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
                <group position={[0, 2.55, 0]}>
                  <SignalHead materials={materials.ns} rotation={sz > 0 ? 0 : Math.PI} />
                </group>
                <group position={[0, 1.85, 0]}>
                  <SignalHead materials={materials.ew} rotation={sx > 0 ? Math.PI / 2 : -Math.PI / 2} />
                </group>
                <group position={[0, 1.1, 0]} rotation={[0, sx > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
                  <mesh>
                    <boxGeometry args={[0.22, 0.34, 0.14]} />
                    <meshStandardMaterial color="#1f2937" />
                  </mesh>
                  <mesh position={[0, 0.07, 0.075]} material={materials.ns.walk}>
                    <boxGeometry args={[0.12, 0.1, 0.01]} />
                  </mesh>
                  <mesh position={[0, -0.07, 0.075]} material={materials.ns.dontWalk}>
                    <boxGeometry args={[0.12, 0.1, 0.01]} />
                  </mesh>
                </group>
              </group>
            ))}
            {(["ns", "ew"] as const).flatMap((axis) =>
              [-1, 1].map((side) => {
                const along = ROAD / 2 + 1.75
                const lane = (ROAD - 1.2) / 4
                const position: [number, number, number] =
                  axis === "ew"
                    ? [side * along, 0.032, -side * lane]
                    : [side * lane, 0.032, side * along]
                return (
                  <mesh key={`${axis}-${side}`} position={position} rotation={[-Math.PI / 2, 0, axis === "ew" ? Math.PI / 2 : 0]}>
                    <planeGeometry args={[(ROAD - 1.2) / 2 - 0.1, 0.18]} />
                    <meshStandardMaterial color="#f8fafc" />
                  </mesh>
                )
              })
            )}
          </group>
        )
      })}
    </group>
  )
}
