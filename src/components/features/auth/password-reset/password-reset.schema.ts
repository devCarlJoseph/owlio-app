import { z } from "zod"
import { passwordSchema } from "../shared/password-rules"

export const passwordResetSchema = z.object({
  password: passwordSchema,
  passwordConfirmation: z.string().min(1, "Confirm your password."),
}).refine((values) => values.password === values.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "Passwords do not match.",
})

export type PasswordResetValues = z.infer<typeof passwordResetSchema>
