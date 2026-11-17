import { type SamplePerson } from "../../utils/space-roster"

export type SampleLockerFile = { name: string; size: string; note: string }

export type SampleLocker = {
  owner: SamplePerson
  code: string
  files: SampleLockerFile[]
}

export const lockerPreviewNotice =
  "Shared lockers and files are not connected yet. Local locker codes are not an access control for server files."

export const ownLockerCodeNotice =
  "Your locker code is saved in this browser only. No one else can open your locker because nothing is shared yet."

export function getSampleLockers(spaceId: string, people: SamplePerson[]): SampleLocker[] {
  void [spaceId, people]
  return []
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
