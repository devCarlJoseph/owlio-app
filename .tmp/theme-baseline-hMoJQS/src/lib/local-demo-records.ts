// Fingerprints identify untouched legacy seeds without keeping fictional records in the app.
// Editing a seeded record makes it user work and keeps it visible.
const legacyFingerprints: Record<string, string> = {
  'sample-task-me': '11bedc05',
  'sample-task-everyone': '8c30d4b0',
  "sample-task-wave-problem-set": "40c1bae0",
  "sample-task-chem-review": "d94d0ad3",
  "sample-task-calculus-timed-paper": "e93f8539",
  "sample-task-essay-draft": "6ba697b4",
  "sample-task-read-chapter": "d08438a1",
  "physics-1": "ab7baa9b",
  "chemistry-1": "eae9d899",
  "mathematics": "ce3f3380",
  "computer-science": "f67a183e",
  "english": "e9a089ec",
  "history": "704d0582",
  "sample-wave-checklist": "db537111",
  "sample-bonding-recap": "af726664",
  "sample-lab-template": "bb7b7066",
  "sample-calculus-plan": "fe34a964",
  "sample-essay-outline": "ee03c249",
  "sample-vocabulary-set": "f5299467",
  "sample-space-physics": "415a1fde",
  "sample-space-essay": "74c26e0b",
  "sample-space-maths": "2467cb64",
  "sample-space-history": "925d7dfd",
  "sample-space-language": "94b9e9a5"
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)]))
  return value
}

export function isLegacyDemoRecord<T extends { id: string }>(record: T): boolean {
  const expected = legacyFingerprints[record.id]
  if (!expected) return false
  let hash = 2166136261
  for (const character of JSON.stringify(canonical(record))) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
  return hash.toString(16) === expected
}

// Keep a recoverable copy before a collection's next normal save removes old seeds.
// A failed backup or unreadable collection must never be overwritten by an empty view.
export function preserveLegacyDemoRecords(key: string): void {
  const raw = window.localStorage.getItem(key)
  if (!raw) return
  const records: unknown = JSON.parse(raw)
  if (!Array.isArray(records)) throw new Error('Stored collection is unreadable.')
  if (records.some(record => record && typeof record.id === 'string' && isLegacyDemoRecord(record))) {
    const backupKey = `${key}.before-demo-removal`
    if (window.localStorage.getItem(backupKey) === null) window.localStorage.setItem(backupKey, raw)
  }
}
