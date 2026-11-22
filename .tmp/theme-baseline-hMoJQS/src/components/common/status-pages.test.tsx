import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { HttpErrorPage } from './http-error-page'
import { UnderDevelopmentPage } from './under-development-page'
import { getPlannedDashboardPages } from './dashboard-navigation'
import { NotFoundPage } from './not-found-page'

afterEach(cleanup)

it.each(['students', 'educators', 'tutors', 'esl'])('opens planned %s pages and returns to the workspace', role => {
  const pages = getPlannedDashboardPages('/' + role)
  render(<MemoryRouter initialEntries={['/' + role]}><Routes>
    <Route path={'/' + role} element={<nav>{pages.map(page => <Link key={page.href} to={page.href}>{page.label}</Link>)}</nav>} />
    {pages.map(page => <Route key={page.href} path={page.href} element={<UnderDevelopmentPage />} />)}
    <Route path="*" element={<NotFoundPage />} />
  </Routes></MemoryRouter>)
  for (const page of pages) {
    fireEvent.click(screen.getByRole('link', { name: page.label }))
    expect(screen.getByRole('heading', { name: 'Under development' })).toBeTruthy()
    expect(screen.getByText(page.label)).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Go to Dashboard' }))
  }
})

it('returns an unknown workspace URL to its own dashboard', () => {
  render(<MemoryRouter initialEntries={['/esl/not-a-real-page']}><NotFoundPage /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Go to Dashboard' }).getAttribute('href')).toBe('/esl')
})

it('offers sign-in for a confirmed 401 and a safe fallback for other HTTP errors', () => {
  const view = render(<MemoryRouter><HttpErrorPage status={401} /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Go to sign in' }).getAttribute('href')).toBe('/login')
  view.rerender(<MemoryRouter><HttpErrorPage status={418} /></MemoryRouter>)
  expect(screen.getByText('418')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'The request could not be completed' })).toBeTruthy()
})
