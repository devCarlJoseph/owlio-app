import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { StudySpacesView } from '../study-spaces/view/study-spaces-view'
import { SubjectsView } from '../subjects/view/subjects-view'
import { NotesView } from '../notes/view/notes-view'
import { TasksView } from '../tasks/view/tasks-view'

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); localStorage.clear() })

describe('original workspace UI without demo data', () => {
  it('keeps the Study Hall and create/join controls without demo rooms', () => {
    render(<MemoryRouter><StudySpacesView /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Study hall' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create space' })).toBeTruthy()
    expect(screen.queryByText('Physics Group')).toBeNull()
    expect(screen.queryByText('Reading Room')).toBeNull()
    expect(screen.getByText(/0 yours · 0 joined · 0 locked/)).toBeTruthy()
  })

  it('keeps My Learning and its creation action without seeded subjects', () => {
    render(<MemoryRouter><SubjectsView /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'My Learning' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'New subject' })).toBeTruthy()
    expect(screen.queryByText('Physics I')).toBeNull()
  })

  it('keeps note buckets without seeded notes', () => {
    render(<MemoryRouter><NotesView /></MemoryRouter>)
    expect(screen.getByRole('tab', { name: /Notes/ })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Archive/ })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Trash/ })).toBeTruthy()
    expect(screen.queryByText('Wave equation checklist')).toBeNull()
  })

  it('keeps all three task columns empty and ready for real tasks', () => {
    render(<MemoryRouter><TasksView /></MemoryRouter>)
    for (const name of ['To do tasks', 'In progress tasks', 'Done tasks']) expect(screen.getByRole('region', { name })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'View example board' })).toBeNull()
    expect(screen.getByRole('button', { name: 'New task' })).toBeTruthy()
  })
})
