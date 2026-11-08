export type ClassroomCoverTheme = {
  id: string
  file: string
  accent: string
}

export const classroomCoverThemes: ClassroomCoverTheme[] = [
  { id: "coral", file: "coral.svg", accent: "bg-orange-100 text-orange-800" },
  { id: "emerald", file: "emerald.svg", accent: "bg-emerald-100 text-emerald-800" },
  { id: "steel", file: "steel.svg", accent: "bg-slate-200 text-slate-700" },
  { id: "azure", file: "azure.svg", accent: "bg-blue-100 text-blue-800" },
  { id: "violet", file: "violet.svg", accent: "bg-violet-100 text-violet-800" },
  { id: "teal", file: "teal.svg", accent: "bg-cyan-100 text-cyan-800" },
]

function hashClassroomId(classroomId: string): number {
  let hash = 0

  for (let index = 0; index < classroomId.length; index += 1) {
    hash = (hash * 31 + classroomId.charCodeAt(index)) % 100000
  }

  return hash
}

export function getClassroomCoverTheme(classroomId: string): ClassroomCoverTheme {
  const index = hashClassroomId(classroomId) % classroomCoverThemes.length
  return classroomCoverThemes[index]
}

export function getClassroomCoverUrl(classroomId: string): string {
  return `/classroom-covers/${getClassroomCoverTheme(classroomId).file}`
}
