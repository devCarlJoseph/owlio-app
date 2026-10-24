import { cva, type VariantProps } from "class-variance-authority"

export const outlineCardVariants = cva("rounded-3xl border-2 border-outline p-5", {
  variants: {
    tone: {
      white: "bg-white text-panel-foreground",
      amber: "bg-tone-amber text-panel-foreground",
      violet: "bg-tone-violet text-panel-foreground",
      sky: "bg-tone-sky text-panel-foreground",
      emerald: "bg-tone-emerald text-panel-foreground",
      rose: "bg-tone-rose text-panel-foreground",
      ink: "bg-ink text-ink-foreground",
    },
  },
  defaultVariants: { tone: "white" },
})

export type OutlineCardTone = NonNullable<VariantProps<typeof outlineCardVariants>["tone"]>

export const pastelTones = ["amber", "violet", "sky", "emerald", "rose"] as const satisfies readonly OutlineCardTone[]

export function pastelToneFor(key: string): (typeof pastelTones)[number] {
  let hash = 0
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return pastelTones[hash % pastelTones.length]
}
