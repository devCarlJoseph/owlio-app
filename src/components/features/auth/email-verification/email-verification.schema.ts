import { z } from "zod"

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
})

export type ResendVerificationValues = z.infer<typeof resendVerificationSchema>
