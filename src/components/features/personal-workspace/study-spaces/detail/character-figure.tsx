import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"

export type FigureMode = "walk" | "idle" | "seated"

type CharacterFigureProps = {
  bodyColor: string
  accentColor: string
  skinColor?: string
  getMode: () => FigureMode
  // Desk work: the arms rest forward and the head tips toward the work.
  typing?: boolean
  phaseOffset?: number
  reducedMotion: boolean
}

const SEATED_DROP = 0.2

function ease(current: number, target: number, delta: number) {
  return current + (target - current) * Math.min(1, delta * 14)
}

// Blocky character whose limbs pivot at the hips and shoulders so walking visibly swings them.
export function CharacterFigure({
  bodyColor,
  accentColor,
  skinColor = "#f1c9a5",
  getMode,
  typing = false,
  phaseOffset = 0,
  reducedMotion,
}: CharacterFigureProps) {
  const root = useRef<Group>(null)
  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const head = useRef<Group>(null)
  const phase = useRef(phaseOffset)

  useFrame(({ clock }, delta) => {
    const nodes = [root, legL, legR, armL, armR, head].map((ref) => ref.current)
    if (nodes.some((node) => node === null)) return
    const [rootNode, left, right, armLeft, armRight, headNode] = nodes as Group[]
    const mode = getMode()
    const time = clock.elapsedTime + phaseOffset

    let legTarget = 0
    let armTarget = 0
    let legTargetR = 0
    let armTargetR = 0
    let bob = 0
    let drop = 0
    let headX = 0
    let headY = 0

    if (mode === "walk") {
      if (!reducedMotion) {
        phase.current += delta * 9
        const swing = Math.sin(phase.current)
        legTarget = swing * 0.75
        legTargetR = -swing * 0.75
        armTarget = -swing * 0.6
        armTargetR = swing * 0.6
        bob = Math.abs(Math.cos(phase.current)) * 0.045
      }
    } else if (mode === "seated") {
      drop = SEATED_DROP
      legTarget = -1.4
      legTargetR = -1.4
      armTarget = typing ? -0.95 + (reducedMotion ? 0 : Math.sin(time * 9) * 0.05) : -0.35
      armTargetR = typing ? -0.95 + (reducedMotion ? 0 : Math.cos(time * 8) * 0.05) : -0.35
      headX = typing ? 0.2 : 0
      if (!reducedMotion) headY = Math.sin(time * 0.45) * 0.3
    } else if (!reducedMotion) {
      bob = Math.sin(time * 1.6) * 0.008
    }

    left.rotation.x = ease(left.rotation.x, legTarget, delta)
    right.rotation.x = ease(right.rotation.x, legTargetR, delta)
    armLeft.rotation.x = ease(armLeft.rotation.x, armTarget, delta)
    armRight.rotation.x = ease(armRight.rotation.x, armTargetR, delta)
    headNode.rotation.x = ease(headNode.rotation.x, headX, delta)
    headNode.rotation.y = ease(headNode.rotation.y, headY, delta)
    rootNode.position.y = ease(rootNode.position.y, bob - drop, delta)
  })

  return (
    <group ref={root}>
      <group ref={legL} position={[-0.12, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.16, 0.5, 0.18]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
      <group ref={legR} position={[0.12, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.16, 0.5, 0.18]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <group ref={armL} position={[-0.34, 1.15, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.14]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>
      <group ref={armR} position={[0.34, 1.15, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.14]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>
      <group ref={head} position={[0, 1.38, 0]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <sphereGeometry args={[0.23, 24, 24]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.27, 0.12, 24]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>
    </group>
  )
}
