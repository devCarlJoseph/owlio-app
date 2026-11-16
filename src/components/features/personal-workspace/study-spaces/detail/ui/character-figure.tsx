import { useMemo, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { Color, type Group } from "three"

export type FigureMode = "walk" | "idle" | "seated" | "nap"

type CharacterFigureProps = {
  bodyColor: string
  accentColor: string
  // Optional third tone; the owl uses it to tint its belly feathers.
  skinColor?: string
  getMode: () => FigureMode
  // Desk work: the wings rest forward and the head tips toward the table.
  typing?: boolean
  phaseOffset?: number
  reducedMotion: boolean
}

const SEATED_RISE = 0.36
const BEAK = "#f59e0b"
const FEET = "#f5a524"
const IRIS = "#f6b73c"

function ease(current: number, target: number, delta: number, speed = 14) {
  return current + (target - current) * Math.min(1, delta * speed)
}

// Rounded cartoon Owlio owl: egg body, big amber eyes in a heart-shaped face, ear tufts,
// soft wings that flap while walking, three-toed feet, and a curled-up nap pose.
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
  const eyes = useRef<Group>(null)
  const phase = useRef(phaseOffset)

  const tones = useMemo(() => {
    const base = new Color(bodyColor)
    return {
      wing: `#${base.clone().multiplyScalar(0.8).getHexString()}`,
      spot: `#${base.clone().multiplyScalar(0.65).getHexString()}`,
      belly: skinColor ? `#${new Color(skinColor).lerp(new Color("#fff6e3"), 0.6).getHexString()}` : "#fdf0d5",
      face: `#${base.clone().lerp(new Color("#ffffff"), 0.75).getHexString()}`,
    }
  }, [bodyColor, skinColor])

  useFrame(({ clock }, delta) => {
    const nodes = [root, footL, footR, wingL, wingR, head, eyes].map((ref) => ref.current)
    if (nodes.some((node) => node === null)) return
    const [rootNode, left, right, wingLeft, wingRight, headNode, eyeNode] = nodes as Group[]
    const mode = getMode()
    const time = clock.elapsedTime + phaseOffset

    let footTarget = 0
    let footTargetR = 0
    let wingOut = 0.06
    let wingForward = 0
    let bob = 0
    let lean = 0
    let rise = 0
    let tiltX = 0
    let shiftZ = 0
    let headX = 0
    let headY = 0
    let eyeOpen = 1

    if (mode === "walk") {
      // Walking answers a click or key press, so reduced motion keeps a gentler waddle instead of none.
      const amplitude = reducedMotion ? 0.45 : 1
      phase.current += delta * 10
      const swing = Math.sin(phase.current) * amplitude
      footTarget = swing * 0.7
      footTargetR = -swing * 0.7
      wingOut = 0.2 + Math.abs(swing) * 0.4
      lean = reducedMotion ? 0 : swing * 0.08
      bob = reducedMotion ? 0 : Math.abs(Math.cos(phase.current)) * 0.06
    } else if (mode === "seated") {
      rise = SEATED_RISE
      footTarget = -1.2
      footTargetR = -1.2
      wingForward = typing ? -0.8 + (reducedMotion ? 0 : Math.sin(time * 9) * 0.06) : -0.15
      headX = typing ? 0.25 : 0
      if (!reducedMotion) headY = Math.sin(time * 0.45) * 0.4
    } else if (mode === "nap") {
      // Lies on its back on the mat with eyes shut and slow breathing.
      tiltX = -Math.PI / 2
      rise = 0.5
      shiftZ = 0.58
      footTarget = 0.6
      footTargetR = 0.6
      wingOut = 0.35
      eyeOpen = 0.12
      bob = reducedMotion ? 0 : Math.sin(time * 1.2) * 0.015
    } else if (!reducedMotion) {
      bob = Math.sin(time * 1.6) * 0.012
      headY = Math.sin(time * 0.6) * 0.3
    }

    if (mode !== "nap" && !reducedMotion && time % 4.3 < 0.13) eyeOpen = 0.12

    left.rotation.x = ease(left.rotation.x, footTarget, delta)
    right.rotation.x = ease(right.rotation.x, footTargetR, delta)
    wingLeft.rotation.z = ease(wingLeft.rotation.z, -wingOut, delta)
    wingRight.rotation.z = ease(wingRight.rotation.z, wingOut, delta)
    wingLeft.rotation.x = ease(wingLeft.rotation.x, wingForward, delta)
    wingRight.rotation.x = ease(wingRight.rotation.x, wingForward, delta)
    headNode.rotation.x = ease(headNode.rotation.x, headX, delta)
    headNode.rotation.y = ease(headNode.rotation.y, headY, delta)
    rootNode.rotation.z = ease(rootNode.rotation.z, lean, delta)
    rootNode.rotation.x = ease(rootNode.rotation.x, tiltX, delta, 6)
    rootNode.position.y = ease(rootNode.position.y, bob + rise, delta, 8)
    rootNode.position.z = ease(rootNode.position.z, shiftZ, delta, 6)
    eyeNode.scale.y = ease(eyeNode.scale.y, eyeOpen, delta, 30)
  })

  return (
    <group ref={root}>
      {[
        [footL, -0.14],
        [footR, 0.14],
      ].map(([ref, x]) => (
        <group key={x as number} ref={ref as RefObject<Group | null>} position={[x as number, 0.1, 0.08]}>
          {[-0.45, 0, 0.45].map((angle) => (
            <mesh key={angle} position={[Math.sin(angle) * 0.06, -0.07, 0.06]} rotation={[Math.PI / 2, 0, -angle]} castShadow>
              <capsuleGeometry args={[0.028, 0.1, 4, 8]} />
              <meshStandardMaterial color={FEET} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      <mesh position={[0, 0.56, 0]} scale={[1, 1.12, 0.92]} castShadow>
        <sphereGeometry args={[0.4, 32, 24]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.5, 0.17]} scale={[1, 1.18, 0.55]}>
        <sphereGeometry args={[0.3, 28, 20]} />
        <meshStandardMaterial color={tones.belly} roughness={0.9} />
      </mesh>
      {[
        [-0.08, 0.6],
        [0.08, 0.6],
        [0, 0.48],
        [-0.12, 0.42],
        [0.12, 0.42],
        [0, 0.34],
      ].map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.33 - Math.abs(x) * 0.25]} scale={[1.4, 0.7, 0.4]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshStandardMaterial color={tones.spot} />
        </mesh>
      ))}
      <mesh position={[0, 0.24, -0.34]} rotation={[-1.1, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.26, 12]} />
        <meshStandardMaterial color={tones.wing} />
      </mesh>

      {[
        [wingL, -1],
        [wingR, 1],
      ].map(([ref, side]) => (
        <group key={side as number} ref={ref as RefObject<Group | null>} position={[(side as number) * 0.36, 0.84, -0.02]}>
          <mesh position={[(side as number) * 0.03, -0.27, 0]} scale={[0.32, 0.95, 0.72]} castShadow>
            <sphereGeometry args={[0.3, 20, 16]} />
            <meshStandardMaterial color={tones.wing} roughness={0.8} />
          </mesh>
          <mesh position={[(side as number) * 0.07, -0.42, 0.05]} scale={[0.3, 0.5, 0.5]}>
            <sphereGeometry args={[0.22, 14, 10]} />
            <meshStandardMaterial color={tones.spot} roughness={0.8} />
          </mesh>
        </group>
      ))}

      <group ref={head} position={[0, 1.12, 0]}>
        <mesh scale={[1.08, 0.95, 0.95]} castShadow>
          <sphereGeometry args={[0.37, 32, 24]} />
          <meshStandardMaterial color={bodyColor} roughness={0.75} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.13, 0.02, 0.27]} scale={[1, 1.05, 0.38]}>
            <sphereGeometry args={[0.175, 24, 16]} />
            <meshStandardMaterial color={tones.face} roughness={0.9} />
          </mesh>
        ))}
        <group ref={eyes} position={[0, 0.03, 0]}>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.13, 0, 0.31]}>
              <mesh>
                <sphereGeometry args={[0.105, 24, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.06]} scale={[1, 1, 0.6]}>
                <sphereGeometry args={[0.072, 20, 14]} />
                <meshStandardMaterial color={IRIS} roughness={0.35} />
              </mesh>
              <mesh position={[0, 0, 0.09]} scale={[1, 1, 0.6]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                <meshStandardMaterial color="#111827" roughness={0.2} />
              </mesh>
              <mesh position={[side * -0.02 + 0.018, 0.025, 0.12]}>
                <sphereGeometry args={[0.016, 8, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
              </mesh>
            </group>
          ))}
        </group>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.13, 0.15, 0.36]} rotation={[0, 0, side * -0.25]} scale={[1, 0.35, 0.4]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshStandardMaterial color={tones.wing} />
          </mesh>
        ))}
        <mesh position={[0, -0.08, 0.38]} rotation={[Math.PI * 0.82, 0, 0]} castShadow>
          <coneGeometry args={[0.055, 0.15, 12]} />
          <meshStandardMaterial color={BEAK} roughness={0.4} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.25, 0.32, 0]} rotation={[0, 0, side * -0.5]} castShadow>
            <coneGeometry args={[0.085, 0.24, 12]} />
            <meshStandardMaterial color={accentColor} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
