import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sampleCreatedSpaces, sampleNotes, sampleSubjects, sampleTasks } from '@/test/legacy-demo-fixtures'
import { loadStudySpaces, saveStudySpaces, studySpacesStorageKey } from '@/components/features/personal-workspace/study-spaces/utils/study-spaces-records'
import { loadSubjects } from '@/components/features/personal-workspace/subjects/utils/subject-records'
import { loadNotes } from '@/components/features/personal-workspace/notes/utils/note-records'
import { loadPersonalTasks } from '@/components/features/personal-workspace/tasks/utils/task-records'
import { getSampleRoster, getSampleNappers } from '@/components/features/personal-workspace/study-spaces/utils/space-roster'
import { isLegacyDemoRecord } from './local-demo-records'

beforeEach(() => localStorage.clear())
afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })

describe('demo-free collections', () => {
  it('starts empty without repopulating fictional records', () => {
    expect(loadStudySpaces()).toEqual([])
    expect(loadSubjects()).toEqual([])
    expect(loadNotes()).toEqual([])
    expect(loadPersonalTasks()).toEqual({ tasks: [], error: false })
    expect(localStorage.length).toBe(0)
  })

  it('recognizes untouched legacy examples but preserves user edits and unrelated IDs', () => {
    for (const record of [...sampleCreatedSpaces, ...sampleNotes, ...sampleSubjects, ...sampleTasks]) {
      expect(isLegacyDemoRecord(record), record.id).toBe(true)
      expect(isLegacyDemoRecord({ ...record, id: 'my-record' })).toBe(false)
    }
    expect(isLegacyDemoRecord({ ...sampleCreatedSpaces[0], name: 'My own group' })).toBe(false)
    expect(isLegacyDemoRecord({ ...sampleTasks[0], notes: 'My changed plan' })).toBe(false)
  })

  it('hides old demo rooms, preserves real and edited rooms, and backs up before the next save', () => {
    const edited = { ...sampleCreatedSpaces[1], name: 'My edited room' }
    const own = { ...sampleCreatedSpaces[0], id: 'user-owned-room', name: 'My group' }
    const raw = JSON.stringify([sampleCreatedSpaces[0], edited, own])
    localStorage.setItem(studySpacesStorageKey, raw)
    expect(loadStudySpaces()).toEqual([edited, own])
    expect(localStorage.getItem(studySpacesStorageKey)).toBe(raw)
    saveStudySpaces(loadStudySpaces())
    expect(localStorage.getItem(`${studySpacesStorageKey}.before-demo-removal`)).toBe(raw)
    expect(loadStudySpaces()).toEqual([edited, own])
  })

  it('keeps the original when backup storage fails', () => {
    const raw = JSON.stringify(sampleCreatedSpaces)
    localStorage.setItem(studySpacesStorageKey, raw)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    saveStudySpaces([])
    expect(localStorage.getItem(studySpacesStorageKey)).toBe(raw)
  })

  it('does not overwrite malformed storage with an empty collection', () => {
    localStorage.setItem(studySpacesStorageKey, '{invalid')
    expect(loadStudySpaces()).toEqual([])
    saveStudySpaces([])
    expect(localStorage.getItem(studySpacesStorageKey)).toBe('{invalid')
  })

  it('does not fabricate seated or sleeping study-mates', () => {
    expect(getSampleRoster(sampleCreatedSpaces[0], 6)).toEqual([])
    expect(getSampleNappers(sampleCreatedSpaces[0], [], 6, 3)).toEqual([])
  })
})
