export type ClassroomCoverTheme = {
  id: string
  file: string
  accent: string
}

export const classroomCoverThemes: ClassroomCoverTheme[] = [
  { id: "coral", file: "coral.svg", accent: "bg-orange-100 surface-dark:bg-surface-orange-soft text-orange-800 surface-dark:text-orange-300" },
  { id: "emerald", file: "emerald.svg", accent: "bg-emerald-100 surface-dark:bg-surface-emerald-soft text-emerald-800 surface-dark:text-emerald-300" },
  { id: "steel", file: "steel.svg", accent: "bg-slate-200 surface-dark:bg-muted text-slate-700 surface-dark:text-foreground" },
  { id: "azure", file: "azure.svg", accent: "bg-blue-100 surface-dark:bg-surface-blue-soft text-blue-800 surface-dark:text-blue-300" },
  { id: "violet", file: "violet.svg", accent: "bg-violet-100 surface-dark:bg-surface-violet-soft text-violet-800 surface-dark:text-violet-300" },
  { id: "teal", file: "teal.svg", accent: "bg-cyan-100 surface-dark:bg-surface-cyan-soft text-cyan-800 surface-dark:text-cyan-300" },
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

const classroomBanners = ['learning-studio', 'discovery-lab', 'creative-ideas'] as const

// Derive the artwork from the permanent ID so new and existing classrooms keep
// the same banner for every member, without storing presentation data in the API.
export function getClassroomBannerUrl(classroomId: string): string {
  const banner = classroomBanners[hashClassroomId(classroomId) % classroomBanners.length]
  return `/classroom-banners/${banner}.png`
}
