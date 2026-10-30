import type { LucideIcon } from "lucide-react"

export type OverviewLink = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export type OverviewWorkspace = OverviewLink & {
  category: string
  cover: string
}

export type OverviewContent = {
  workspace: string
  headline: string
  introduction: string
  icon: LucideIcon
  focus: [string, string, string]
  primaryAction: { label: string; href: string }
  summary: {
    title: string
    items: [OverviewLink, OverviewLink, OverviewLink]
  }
  explore: {
    title: string
    description: string
    items: [OverviewWorkspace, OverviewWorkspace]
  }
  agenda: {
    title: string
    emptyTitle: string
    description: string
    action: { label: string; href: string }
  }
  followUps: {
    title: string
    description: string
    items: [OverviewLink, OverviewLink]
  }
  note: { title: string; description: string }
}
