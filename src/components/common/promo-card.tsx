import type { ReactNode } from "react"
import { Link } from "react-router"
import { OutlineCard } from "@/components/common/outline-card"

type PromoCardProps = {
  eyebrow: string
  tag?: string
  title: string
  footer?: ReactNode
  action: { label: string; to: string }
}

export function PromoCard({ eyebrow, tag, title, footer, action }: PromoCardProps) {
  return (
    <OutlineCard tone="ink" className="flex flex-col gap-4 p-6">
      <p className="text-sm text-ink-foreground/80">{eyebrow}</p>
      {tag && <span className="w-fit rounded-lg border-2 border-outline bg-tone-amber px-2.5 py-1 text-xs font-medium text-panel-foreground">{tag}</span>}
      <h2 className="text-xl font-semibold leading-snug">{title}</h2>
      {footer}
      <Link
        to={action.to}
        className="mt-auto inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground outline-none transition-colors hover:bg-brand-hover focus-visible:ring-3 focus-visible:ring-white/60"
      >
        {action.label}
      </Link>
    </OutlineCard>
  )
}
