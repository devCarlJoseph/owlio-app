import { describe, expect, it } from 'vitest'
import { getAccountLabel, getLoginDestination, getWorkspacePath } from './workspace-path'

describe('API role navigation', () => {
  it.each([
    ['STUDENT', '/students'], ['EDUCATOR', '/educators'], ['TUTOR', '/tutors'], ['ESL', '/esl'],
  ] as const)('maps %s to its own workspace', (role, path) => {
    expect(getWorkspacePath([role])).toBe(path)
  })

  it('does not grant an educator workspace to administrators or missing roles', () => {
    expect(getWorkspacePath(['ADMIN'])).toBe('/access-denied')
    expect(getWorkspacePath([])).toBe('/access-denied')
    expect(getAccountLabel(['ADMIN'])).toBe('Administrator account')
  })

  it('retains an authorized deep link with its query and fragment', () => {
    expect(getLoginDestination(['STUDENT'], { pathname: '/students/classrooms/abc', search: '?tab=work', hash: '#details' }))
      .toBe('/students/classrooms/abc?tab=work#details')
  })

  it('honors every role actually assigned by the API', () => {
    expect(getLoginDestination(['STUDENT', 'TUTOR'], { pathname: '/tutors/sessions' })).toBe('/tutors/sessions')
  })

  it.each([
    { pathname: '/educators/learners' }, { pathname: '/students-other' },
    { pathname: '//example.com' }, { pathname: 'https://example.com' },
    { pathname: '/login' }, { pathname: '/password-reset' }, { pathname: '/students/\\example.com' },
    {}, null, '/students', { pathname: 12 },
  ])('rejects an unauthorized or invalid return target: %j', (from) => {
    expect(getLoginDestination(['STUDENT'], from)).toBe('/students')
  })
})
