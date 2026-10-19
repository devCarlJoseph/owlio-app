import { describe, expect, it } from 'vitest'
import { verifyEmailCodeSchema } from './email-verification.schema'

describe('email verification code schema', () => {
  it('accepts a six-digit code and trims the email address', () => {
    expect(verifyEmailCodeSchema.safeParse({
      email: ' Learner@Example.com ',
      code: '004271',
    }).success).toBe(true)
  })

  it.each(['12345', '1234567', '12a456', ''])('rejects invalid code %s', (code) => {
    expect(verifyEmailCodeSchema.safeParse({
      email: 'learner@example.com',
      code,
    }).success).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(verifyEmailCodeSchema.safeParse({
      email: 'not-an-email',
      code: '004271',
    }).success).toBe(false)
  })
})
