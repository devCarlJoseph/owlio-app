import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getNotifications } from '@/services/api/personal-workspace.service'
import { ClassroomMentionNotifications } from '../ui/classroom-mention-notifications'
import { ClassroomMentionBadge } from '../ui/classroom-mention-badge'
vi.mock('@/services/api/personal-workspace.service', () => ({ getNotifications: vi.fn() }))
const mention = { id: 'notification', kind: 'CLASSROOM_MENTION', sourceId: 'message', createdAt: '2026-11-17T00:00:00Z', readAt: null,
  classroomMention: { classroomId: 'class', classroomName: 'Mathematics', messageId: 'message', authorName: 'Class Teacher', body: '@students please read' } }
beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)
it('shows persisted mentions with a direct link to the message and excludes revoked sources', async () => {
  vi.mocked(getNotifications).mockResolvedValue([mention, { ...mention, id: 'revoked', classroomMention: null }])
  const view = render(<MemoryRouter><ClassroomMentionNotifications role="students" filter="unread" /></MemoryRouter>)
  const link = await screen.findByRole('link', { name: /Open mentioned message/ })
  expect(link.getAttribute('href')).toBe('/students/classrooms/class?tab=chat&message=message')
  expect(screen.getAllByText('Class Teacher')).toHaveLength(1)
  const signal = vi.mocked(getNotifications).mock.calls[0][0]!
  view.unmount()
  expect(signal.aborted).toBe(true)
})
it('keeps failures distinct from an empty notification inbox', async () => {
  vi.mocked(getNotifications).mockRejectedValue(new Error('Offline'))
  render(<MemoryRouter><ClassroomMentionNotifications role="students" filter="all" /></MemoryRouter>)
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.queryByText('No notifications yet')).toBeNull()
})
it('counts only unread mentions whose classroom remains accessible', async () => {
  vi.mocked(getNotifications).mockResolvedValue([mention, { ...mention, id: 'read', readAt: mention.createdAt }, { ...mention, id: 'revoked', classroomMention: null }])
  render(<ClassroomMentionBadge />)
  await waitFor(() => expect(screen.getByLabelText('1 unread classroom mentions').textContent).toBe('1'))
})
