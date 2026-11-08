import { z } from "zod"
import { passwordSchema } from "../shared/password-rules"

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  accountType: z.enum(["student", "educator", "tutor", "esl"], { error: "Choose an account type." }),
  password: passwordSchema,
  passwordConfirmation: z.string().min(1, "Confirm your password."),
  acceptTerms: z.boolean().refine((accepted) => accepted, "Accept the terms to continue."),
}).refine((values) => values.password === values.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "Passwords do not match.",
})

export type RegisterValues = z.infer<typeof registerSchema>
