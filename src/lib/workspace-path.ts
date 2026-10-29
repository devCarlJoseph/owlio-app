import type { AuthRole } from "@/services/api/api.types"

export type WorkspaceRole = Exclude<AuthRole, "ADMIN">

const workspacePaths: [WorkspaceRole, string][] = [
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
  ADMIN: "Administrator account",
}

export function getWorkspacePath(roles: AuthRole[]) {
  return workspacePaths.find(([role]) => roles.includes(role))?.[1] ?? "/access-denied"
}

export function getAccountLabel(roles: AuthRole[]) {
  const role = workspacePaths.find(([candidate]) => roles.includes(candidate))?.[0]
  return role ? accountLabels[role] : roles.includes("ADMIN") ? accountLabels.ADMIN : "Owlio account"
}

export function getLoginDestination(roles: AuthRole[], from: unknown) {
  if (typeof from !== "object" || from === null || !("pathname" in from)) return getWorkspacePath(roles)
  const { pathname } = from
  if (typeof pathname !== "string" || pathname.includes("\\")) return getWorkspacePath(roles)
  const workspace = workspacePaths.find(([, root]) =>
    pathname === root || pathname.startsWith(`${root}/`),
  )
  if (!workspace || !roles.includes(workspace[0])) return getWorkspacePath(roles)
  const search = "search" in from && typeof from.search === "string" && from.search.startsWith("?") ? from.search : ""
  const hash = "hash" in from && typeof from.hash === "string" && from.hash.startsWith("#") ? from.hash : ""
  return pathname + search + hash
}
