import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { NotFoundPage } from '@/components/common/not-found-page'

afterEach(cleanup)

it('explains an unknown route and lets the visitor return home', () => {
  render(<MemoryRouter initialEntries={['/missing-page']}><Routes>
    <Route path="/" element={<p>Owlio home</p>} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'This page flew out of reach' })).toBeTruthy()
  expect(screen.getByText('404')).toBeTruthy()
  fireEvent.click(screen.getByRole('link', { name: 'Go home' }))
  expect(screen.getByText('Owlio home')).toBeTruthy()
})
