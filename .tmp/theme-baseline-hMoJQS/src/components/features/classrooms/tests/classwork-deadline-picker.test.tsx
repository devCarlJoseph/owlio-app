import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { ClassworkDeadlinePicker } from '../forms/classwork-deadline-picker'

afterEach(cleanup)
const label = (date: Date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(date)

it('preserves existing local deadlines and chooses leap day without native date or time controls', async () => {
  const { container } = render(<form aria-label="Deadline"><ClassworkDeadlinePicker initialValue="2032-01-31T23:59" /></form>)
  const form = screen.getByRole('form', { name: 'Deadline' }) as HTMLFormElement
  expect(new FormData(form).get('dueAt')).toBe('2032-01-31T23:59')
  expect(container.querySelector('input[type="date"], input[type="datetime-local"], input[type="time"]')).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: /January 31, 2032/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Next month' }))
  await userEvent.click(screen.getByRole('button', { name: label(new Date(2032, 1, 29)) }))
  await userEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(new FormData(form).get('dueAt')).toBe('2032-02-29T23:59')
})

it('converts midnight and noon correctly and rejects invalid time values', async () => {
  render(<form aria-label="Deadline"><ClassworkDeadlinePicker initialValue="2032-05-01T12:00" /></form>)
  const form = screen.getByRole('form', { name: 'Deadline' }) as HTMLFormElement
  await userEvent.click(screen.getByRole('button', { name: /May 1, 2032/ }))
  await userEvent.click(screen.getByRole('button', { name: 'AM' }))
  expect(new FormData(form).get('dueAt')).toBe('2032-05-01T00:00')
  await userEvent.click(screen.getByRole('button', { name: 'PM' }))
  expect(new FormData(form).get('dueAt')).toBe('2032-05-01T12:00')
  await userEvent.clear(screen.getByRole('textbox', { name: 'Closing minute' }))
  await userEvent.type(screen.getByRole('textbox', { name: 'Closing minute' }), '60')
  expect(new FormData(form).get('dueAt')).toBe('')
  expect(screen.getByRole('alert').textContent).toContain('minutes from 00 to 59')
  expect((screen.getByRole('button', { name: 'Done' }) as HTMLButtonElement).disabled).toBe(true)
})

it('supports keyboard navigation across months and Escape restores trigger focus', async () => {
  render(<ClassworkDeadlinePicker initialValue="2032-01-31T23:59" />)
  const trigger = screen.getByRole('button', { name: /January 31, 2032/ })
  await userEvent.click(trigger)
  expect(document.activeElement?.getAttribute('aria-label')).toBe(label(new Date(2032, 0, 31)))
  await userEvent.keyboard('{ArrowRight}')
  expect(document.activeElement?.getAttribute('aria-label')).toBe(label(new Date(2032, 1, 1)))
  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('button', { name: label(new Date(2032, 1, 1)) }).getAttribute('aria-pressed')).toBe('true')
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('region', { name: 'Closing date and time picker' })).toBeNull()
  expect(document.activeElement).toBe(trigger)
})

it('clears the deadline and respects disabled form state', async () => {
  const view = render(<form aria-label="Deadline"><ClassworkDeadlinePicker initialValue="2032-05-01T12:00" /></form>)
  await userEvent.click(screen.getByRole('button', { name: /May 1, 2032/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
  expect(new FormData(screen.getByRole('form', { name: 'Deadline' }) as HTMLFormElement).get('dueAt')).toBe('')
  view.rerender(<form aria-label="Deadline"><ClassworkDeadlinePicker disabled /></form>)
  expect((screen.getByRole('button', { name: /Choose a closing date/ }) as HTMLButtonElement).disabled).toBe(true)
  expect(new FormData(screen.getByRole('form', { name: 'Deadline' }) as HTMLFormElement).has('dueAt')).toBe(false)
})
