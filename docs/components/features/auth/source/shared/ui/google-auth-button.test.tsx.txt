import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GoogleAuthButton } from './google-auth-button'

afterEach(cleanup)

describe('GoogleAuthButton', () => {
  it('starts the Google flow when activated', () => {
    const onClick = vi.fn()
    render(<GoogleAuthButton onClick={onClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not start the flow while disabled', () => {
    const onClick = vi.fn()
    render(<GoogleAuthButton onClick={onClick} disabled />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
