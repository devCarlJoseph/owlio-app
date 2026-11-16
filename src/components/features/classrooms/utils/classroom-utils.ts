export function getInitials(name: string) {
  return name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "?"
}

export function isYou(name: string) {
  return name.startsWith("You")
}
