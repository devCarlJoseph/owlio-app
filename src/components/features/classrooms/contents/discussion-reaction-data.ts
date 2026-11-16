export const REACTION_CHOICES = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "👏", label: "Clapping" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "💡", label: "Insightful" },
] as const

export type ReactionState = Record<string, { count: number; mine: boolean }>
