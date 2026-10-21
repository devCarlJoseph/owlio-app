import type { StudySpaceRecord } from "./study-spaces-records"

// Decorative sample people. They are derived from the space id, never saved, never speak,
// and do not represent real students, members, or presence.
export type SamplePerson = {
  id: string
  name: string
  seatIndex: number
  skin: string
  shirt: string
  hair: string
}

export const SAMPLE_NAMES = ["Ava", "Ben", "Chloe", "Dev", "Ella", "Finn", "Grace", "Hugo"]
export const SAMPLE_SKINS = ["#f1c9a5", "#d9a47a", "#a8744c", "#7a4e33"]
export const SAMPLE_SHIRTS = ["#2f6b4f", "#c2693a", "#4f6fa8", "#b4485a", "#d9a73a", "#6b5ca5"]
export const SAMPLE_HAIRS = ["#2a1d15", "#4a3222", "#1c1c1c", "#8a5a2b"]

export const sampleRosterNotice =
  "Sample study-mates are illustrations only. No real students are in this room."

export function hashString(value: string): number {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

// One seat is always left free so the student can take a place.
export function getSampleRoster(space: StudySpaceRecord, seatCount: number): SamplePerson[] {
  if (seatCount < 2) return []

  const hash = hashString(space.id)
  const count = Math.min(seatCount - 1, Math.max(1, Math.round(seatCount * (0.55 + 0.1 * (hash % 3)))))

  const seatOrder = Array.from({ length: seatCount }, (_, index) => index).sort(
    (a, b) => hashString(`${space.id}:${a}`) - hashString(`${space.id}:${b}`)
  )
  const nameOrder = [...SAMPLE_NAMES.keys()].sort(
    (a, b) => hashString(`${space.id}:n${a}`) - hashString(`${space.id}:n${b}`)
  )

  return Array.from({ length: count }, (_, index) => {
    const seed = hashString(`${space.id}:p${index}`)
    return {
      id: `sample-${space.id}-${index}`,
      name: SAMPLE_NAMES[nameOrder[index]],
      seatIndex: seatOrder[index],
      skin: SAMPLE_SKINS[seed % SAMPLE_SKINS.length],
      shirt: SAMPLE_SHIRTS[(seed >> 3) % SAMPLE_SHIRTS.length],
      hair: SAMPLE_HAIRS[(seed >> 6) % SAMPLE_HAIRS.length],
    }
  })
}
