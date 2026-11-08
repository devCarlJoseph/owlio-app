import { hashString, type SamplePerson } from "../space-roster"

export type SampleLockerFile = { name: string; size: string; note: string }

export type SampleLocker = {
  owner: SamplePerson
  code: string
  files: SampleLockerFile[]
}

export const lockerPreviewNotice =
  "Preview lockers: study-mates and their files are samples. Codes are checked only in this browser and are not a security control."

export const ownLockerCodeNotice =
  "Your locker code is saved in this browser only. No one else can open your locker because nothing is shared yet."

const SAMPLE_FILES: SampleLockerFile[] = [
  { name: "Kinematics summary.pdf", size: "412 KB", note: "Formula sheet with worked examples" },
  { name: "Essay outline v2.docx", size: "38 KB", note: "Thesis and three supporting points" },
  { name: "Past paper 2024 answers.pdf", size: "1.2 MB", note: "Marked answers for Q1–Q6" },
  { name: "Vocabulary list.txt", size: "6 KB", note: "40 terms with short definitions" },
  { name: "Cell diagram.png", size: "820 KB", note: "Labelled organelles" },
  { name: "Group plan.docx", size: "24 KB", note: "Who covers which chapter" },
  { name: "Flashcards week 3.pdf", size: "290 KB", note: "Printable flashcards" },
  { name: "Lab results.txt", size: "4 KB", note: "Readings from the pendulum lab" },
]

// Deterministic sample lockers for the sample study-mates. Nothing here is a real file or person.
export function getSampleLockers(spaceId: string, people: SamplePerson[]): SampleLocker[] {
  return people.map((owner) => {
    const seed = hashString(`${spaceId}:locker:${owner.id}`)
    const count = 2 + (seed % 3)
    const files = Array.from({ length: count }, (_, index) => SAMPLE_FILES[(seed + index * 3) % SAMPLE_FILES.length])
    return { owner, code: String(1000 + (seed % 9000)), files }
  })
}

const OWN_CODE_PREFIX = "owlio.study-space-locker-code."

export function isValidLockerCode(code: string): boolean {
  return /^\d{4,6}$/.test(code)
}

export function loadOwnLockerCode(spaceId: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const stored = window.localStorage.getItem(`${OWN_CODE_PREFIX}${spaceId}`)
    return stored && isValidLockerCode(stored) ? stored : null
  } catch {
    return null
  }
}

export function saveOwnLockerCode(spaceId: string, code: string | null): void {
  if (typeof window === "undefined") return
  try {
    if (code) window.localStorage.setItem(`${OWN_CODE_PREFIX}${spaceId}`, code)
    else window.localStorage.removeItem(`${OWN_CODE_PREFIX}${spaceId}`)
  } catch {
    return
  }
}
