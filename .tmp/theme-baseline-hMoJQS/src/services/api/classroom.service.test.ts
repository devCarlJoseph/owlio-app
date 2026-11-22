import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { postApiWithCsrf } from './auth.service'
import { createClassroom, getClassrooms, joinClassroomByCode, getClassroomStudents, getClassroomMembers } from './classroom.service'
vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ postApiWithCsrf: vi.fn() }))
const record = { id: 'class-id', ownerId: 'teacher-id', name: 'Math', description: '', createdAt: '2026-01-01' }
beforeEach(() => { vi.resetAllMocks() })
describe('classroom API contract', () => {
  it('uses the participant member endpoint with a validated display-only response', async () => {
    const id = '902df2ea-e551-43c0-b879-956366138d93'
    const signal = new AbortController().signal
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'success', data: { items: [{ id, name: 'Teacher', role: 'owner', email: 'private@example.test' }], nextCursor: null } } })
    expect(await getClassroomMembers('class/id', id, signal)).toEqual({ items: [{ id, name: 'Teacher', role: 'owner' }], nextCursor: null })
    expect(api.get).toHaveBeenCalledWith('/api/v1/classrooms/class%2Fid/members', { params: { limit: 50, cursor: id }, signal })
  })
  it('rejects an invalid directory instead of displaying invented member identities', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'success', data: { items: [{ id: 'invalid', name: 'Unknown', role: 'admin' }], nextCursor: null } } })
    await expect(getClassroomMembers('class-id')).rejects.toThrow()
  })
  it('unwraps every list page and passes cancellation through', async () => {
    const signal = new AbortController().signal
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: { items: [record], nextCursor: 'cursor-id' } } })
      .mockResolvedValueOnce({ data: { data: { items: [{ ...record, id: 'other' }], nextCursor: null } } })
    expect(await getClassrooms(signal)).toHaveLength(2)
    expect(api.get).toHaveBeenNthCalledWith(1, '/api/v1/classrooms', { params: { limit: 50 }, signal })
    expect(api.get).toHaveBeenNthCalledWith(2, '/api/v1/classrooms', { params: { limit: 50, cursor: 'cursor-id' }, signal })
  })
  it('does not accept the outdated flat-array contract', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [record] } })
    await expect(getClassrooms()).rejects.toThrow('invalid response')
  })
  it('stops a repeating pagination cursor', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { items: [], nextCursor: 'same' } } })
    await expect(getClassrooms()).rejects.toThrow('pagination')
    expect(api.get).toHaveBeenCalledTimes(2)
  })
  it('sends only supported creation fields and preserves the one-time code', async () => {
    vi.mocked(postApiWithCsrf).mockResolvedValue({ classroom: record, joinCode: 'secret' })
    const input = { name: 'Math', description: '', subject: 'Must not be sent' }
    expect(await createClassroom(input)).toEqual({ classroom: record, joinCode: 'secret' })
    expect(postApiWithCsrf).toHaveBeenCalledWith('/api/v1/classrooms', { name: 'Math', description: '' })
  })
  it('resolves the classroom from the confirmed enrollment ID', async () => {
    vi.mocked(postApiWithCsrf).mockResolvedValue({ id: 'enrollment', classroomId: 'class-id' })
    vi.mocked(api.get).mockResolvedValue({ data: { data: record } })
    expect(await joinClassroomByCode('AbCaseSensitive')).toEqual(record)
    expect(postApiWithCsrf).toHaveBeenCalledWith('/api/v1/classrooms/join', { joinCode: 'AbCaseSensitive' })
    expect(api.get).toHaveBeenCalledWith('/api/v1/classrooms/class-id', { signal: undefined })
  })
  it('does not conceal a committed enrollment when its detail fetch fails', async () => {
    vi.mocked(postApiWithCsrf).mockResolvedValue({ classroomId: 'class-id' })
    vi.mocked(api.get).mockRejectedValue(new Error('Unavailable'))
    await expect(joinClassroomByCode('secret')).rejects.toThrow('Enrollment was confirmed')
  })
  it('fetches roster pages using student cursors', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { items: [], nextCursor: null } } })
    expect(await getClassroomStudents('class-id', 'student-id')).toEqual({ items: [], nextCursor: null })
    expect(api.get).toHaveBeenCalledWith('/api/v1/classrooms/class-id/students', { params: { limit: 50, cursor: 'student-id' }, signal: undefined })
  })
})
