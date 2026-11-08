import { z } from "zod"

export const passwordSchema = z.string().min(8, "Use at least 8 characters.").superRefine((password, context) => {
  if (new TextEncoder().encode(password).length > 72) {
    context.addIssue({ code: "custom", message: "Password must be no more than 72 UTF-8 bytes." })
  }
})
