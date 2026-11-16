export function shouldShowEslWhiteboardPreview(role: string, flag: string | null) {
  return role === "esl" && flag === "1"
}
