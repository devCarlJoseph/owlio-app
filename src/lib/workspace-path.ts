import type { AuthRole } from "@/services/api/api.types"

const workspacePaths: [AuthRole, string][] = [
  ["STUDENT", "/students"],
  ["EDUCATOR", "/educators"],
  ["TUTOR", "/tutors"],
  ["ESL", "/esl"],
]

const accountLabels: Record<AuthRole, string> = {
  STUDENT: "Student account",
  EDUCATOR: "Educator account",
  TUTOR: "Tutor account",
  ESL: "ESL teacher account",
}

export function getWorkspacePath(roles: AuthRole[]) {
  return workspacePaths.find(([role]) => roles.includes(role))?.[1] ?? "/educators"
}

export function getAccountLabel(roles: AuthRole[]) {
  const role = workspacePaths.find(([candidate]) => roles.includes(candidate))?.[0]
  return role ? accountLabels[role] : "Educator account"
}
