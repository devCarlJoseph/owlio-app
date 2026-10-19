import { z } from "zod"

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
})

export const verifyEmailCodeSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  code: z.string().regex(/^\d{6}$/, "Enter the six-digit code from your email."),
})

export type ResendVerificationValues = z.infer<typeof resendVerificationSchema>
export type VerifyEmailCodeValues = z.infer<typeof verifyEmailCodeSchema>
