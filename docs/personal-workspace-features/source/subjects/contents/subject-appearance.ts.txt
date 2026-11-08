import { getSubjectThemeColorName, type SubjectRecord } from "./subject-records"

const subjectThemeColors: Record<string, { background: string; border: string; accent: string; glow: string }> = {
  blue: { background: "#eff6ff", border: "#bfdbfe", accent: "#2563eb", glow: "#93c5fd" },
  emerald: { background: "#ecfdf5", border: "#a7f3d0", accent: "#059669", glow: "#6ee7b7" },
  violet: { background: "#f5f0ff", border: "#ddd0ff", accent: "#8a60f1", glow: "#c4b5fd" },
  amber: { background: "#fffbeb", border: "#fde68a", accent: "#d97706", glow: "#fcd34d" },
  rose: { background: "#fff1f2", border: "#fecdd3", accent: "#e11d48", glow: "#fda4af" },
  slate: { background: "#f1f5f9", border: "#cbd5e1", accent: "#475569", glow: "#94a3b8" },
}

export const defaultSubjectAppearance = subjectThemeColors.blue

export function getSubjectAppearance(subject: SubjectRecord) {
  return subjectThemeColors[getSubjectThemeColorName(subject)] ?? subjectThemeColors.blue
}
