import { useRef, useState, type ReactNode, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import type { StudyRoomPose } from "@/services/api/study-space-realtime"
import { CharacterFigure } from "../detail/ui/character-figure"

type Point = Pick<StudyRoomPose, "x" | "z">

export function RemoteStudyCharacter({ userId, pose, poses, project, reducedMotion, children }: {
  userId: string
  pose: StudyRoomPose
  poses: RefObject<Map<string, StudyRoomPose>>
  project?: (point: Point) => Point
  reducedMotion: boolean
  children: ReactNode
}) {
  const group = useRef<Group>(null)
  const [start] = useState(() => ({ ...(project?.(pose) ?? pose), rotation: pose.rotation }))
  const projection = useRef<{ pose: StudyRoomPose; project: typeof project; point: Point } | null>(null)
  useFrame((_, delta) => {
    const node = group.current
    const latest = poses.current.get(userId)
    if (!node || !latest) return
    if (projection.current?.pose !== latest || projection.current.project !== project) {
      projection.current = { pose: latest, project, point: project?.(latest) ?? latest }
    }
    const target = projection.current.point
    const speed = Math.hypot(target.x - node.position.x, target.z - node.position.z) > 4
      ? 1 : 1 - Math.exp(-14 * Math.min(delta, 0.05))
    node.position.x += (target.x - node.position.x) * speed
    node.position.z += (target.z - node.position.z) * speed
    const angle = latest.rotation - node.rotation.y
    node.rotation.y += Math.atan2(Math.sin(angle), Math.cos(angle)) * speed
  })

  return (
    <group ref={group} position={[start.x, 0, start.z]} rotation={[0, start.rotation, 0]}>
      <CharacterFigure bodyColor={pose.bodyColor} accentColor={pose.accentColor}
        getMode={() => poses.current.get(userId)?.mode ?? pose.mode} reducedMotion={reducedMotion} />
      {children}
    </group>
  )
}
