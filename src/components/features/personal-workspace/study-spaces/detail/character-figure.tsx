import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Color, type Group } from "three"

export type FigureMode = "walk" | "idle" | "seated"

type CharacterFigureProps = {
  bodyColor: string
  accentColor: string
  // Kept for callers that pass a third tone; the owl uses it for its belly feathers.
  skinColor?: string
  getMode: () => FigureMode
  // Desk work: the wings rest forward and the head tips toward the work.
  typing?: boolean
  phaseOffset?: number
  reducedMotion: boolean
}

// Seated owls rise onto the seat instead of folding legs like a person.
const SEATED_RISE = 0.3
const BEAK = "#f59e0b"
const FEET = "#f59e0b"

function ease(current: number, target: number, delta: number) {
  return current + (target - current) * Math.min(1, delta * 14)
}

// Blocky Owlio owl: round-cornered body, big eyes, ear tufts, flapping wings and stepping feet.
export function CharacterFigure({
  bodyColor,
  accentColor,
  skinColor,
  getMode,
  typing = false,
  phaseOffset = 0,
  reducedMotion,
}: CharacterFigureProps) {
  const root = useRef<Group>(null)
  const footL = useRef<Group>(null)
  const footR = useRef<Group>(null)
  const wingL = useRef<Group>(null)
  const wingR = useRef<Group>(null)
  const head = useRef<Group>(null)
  const lids = useRef<Group>(null)
  const phase = useRef(phaseOffset)

  const tones = useMemo(() => {
    const base = new Color(bodyColor)
    return {
      wing: `#${base.clone().multiplyScalar(0.78).getHexString()}`,
      belly: skinColor ? `#${new Color(skinColor).lerp(new Color("#fff7e6"), 0.55).getHexString()}` : "#fdf1d8",
      face: `#${base.clone().lerp(new Color("#ffffff"), 0.72).getHexString()}`,
    }
  }, [bodyColor, skinColor])

  useFrame(({ clock }, delta) => {
    const nodes = [root, footL, footR, wingL, wingR, head, lids].map((ref) => ref.current)
    if (nodes.some((node) => node === null)) return
    const [rootNode, left, right, wingLeft, wingRight, headNode, lidNode] = nodes as Group[]
    const mode = getMode()
    const time = clock.elapsedTime + phaseOffset

    let footTarget = 0
    let footTargetR = 0
    let wingTarget = 0.08
    let wingForward = 0
    let bob = 0
    let lean = 0
    let rise = 0
    let headX = 0
    let headY = 0

    if (mode === "walk") {
      // Walking answers a click or key press, so reduced motion keeps a gentler waddle instead of none.
      const amplitude = reducedMotion ? 0.45 : 1
      phase.current += delta * 10
      const swing = Math.sin(phase.current) * amplitude
      footTarget = swing * 0.7
      footTargetR = -swing * 0.7
      wingTarget = 0.25 + Math.abs(swing) * 0.35
      lean = reducedMotion ? 0 : swing * 0.06
      bob = reducedMotion ? 0 : Math.abs(Math.cos(phase.current)) * 0.05
    } else if (mode === "seated") {
      rise = SEATED_RISE
      footTarget = -1.2
      footTargetR = -1.2
      wingForward = typing ? -0.9 + (reducedMotion ? 0 : Math.sin(time * 9) * 0.06) : -0.2
      headX = typing ? 0.22 : 0
      if (!reducedMotion) headY = Math.sin(time * 0.45) * 0.35
    } else if (!reducedMotion) {
      bob = Math.sin(time * 1.6) * 0.01
      headY = Math.sin(time * 0.6) * 0.25
    }

    left.rotation.x = ease(left.rotation.x, footTarget, delta)
    right.rotation.x = ease(right.rotation.x, footTargetR, delta)
    wingLeft.rotation.z = ease(wingLeft.rotation.z, wingTarget, delta)
    wingRight.rotation.z = ease(wingRight.rotation.z, -wingTarget, delta)
    wingLeft.rotation.x = ease(wingLeft.rotation.x, wingForward, delta)
    wingRight.rotation.x = ease(wingRight.rotation.x, wingForward, delta)
    headNode.rotation.x = ease(headNode.rotation.x, headX, delta)
    headNode.rotation.y = ease(headNode.rotation.y, headY, delta)
    rootNode.rotation.z = ease(rootNode.rotation.z, lean, delta)
    rootNode.position.y = ease(rootNode.position.y, bob + rise, delta)

    const blink = !reducedMotion && (time % 4.2) < 0.12
    lidNode.scale.y = blink ? 1 : 0.001
  })

  return (
    <group ref={root}>
      <group ref={footL} position={[-0.13, 0.12, 0.04]}>
        <mesh position={[0, -0.06, 0.06]} castShadow>
          <boxGeometry args={[0.14, 0.08, 0.2]} />
          <meshStandardMaterial color={FEET} />
        </mesh>
      </group>
      <group ref={footR} position={[0.13, 0.12, 0.04]}>
        <mesh position={[0, -0.06, 0.06]} castShadow>
          <boxGeometry args={[0.14, 0.08, 0.2]} />
          <meshStandardMaterial color={FEET} />
        </mesh>
      </group>

      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.62, 0.74, 0.5]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.46, 0.255]}>
        <boxGeometry args={[0.42, 0.52, 0.02]} />
        <meshStandardMaterial color={tones.belly} roughness={0.9} />
      </mesh>
      {[0.36, 0.5, 0.64].map((y) => (
        <mesh key={y} position={[0, y, 0.268]}>
          <boxGeometry args={[0.24, 0.025, 0.01]} />
          <meshStandardMaterial color={tones.wing} />
        </mesh>
      ))}

      <group ref={wingL} position={[-0.32, 0.78, 0]}>
        <mesh position={[-0.04, -0.24, 0]} castShadow>
          <boxGeometry args={[0.1, 0.5, 0.38]} />
          <meshStandardMaterial color={tones.wing} />
        </mesh>
      </group>
      <group ref={wingR} position={[0.32, 0.78, 0]}>
        <mesh position={[0.04, -0.24, 0]} castShadow>
          <boxGeometry args={[0.1, 0.5, 0.38]} />
          <meshStandardMaterial color={tones.wing} />
        </mesh>
      </group>

      <group ref={head} position={[0, 1.13, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.54, 0.56]} />
          <meshStandardMaterial color={bodyColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.02, 0.285]}>
          <boxGeometry args={[0.6, 0.38, 0.02]} />
          <meshStandardMaterial color={tones.face} />
        </mesh>
        {[-0.15, 0.15].map((x) => (
          <group key={x} position={[x, 0.02, 0.3]}>
            <mesh>
              <boxGeometry args={[0.22, 0.22, 0.02]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.015]}>
              <boxGeometry args={[0.11, 0.11, 0.02]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0.03, 0.03, 0.028]}>
              <boxGeometry args={[0.035, 0.035, 0.01]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        <group ref={lids} position={[0, 0.02, 0.335]}>
          {[-0.15, 0.15].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <boxGeometry args={[0.23, 0.23, 0.01]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, -0.13, 0.32]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.09, 0.1, 0.08]} />
          <meshStandardMaterial color={BEAK} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.27, 0.33, 0]} rotation={[0, 0, -side * 0.35]} castShadow>
            <boxGeometry args={[0.13, 0.2, 0.16]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
        ))}
        <mesh position={[0, 0.285, 0]}>
          <boxGeometry args={[0.36, 0.03, 0.4]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>
    </group>
  )
}
