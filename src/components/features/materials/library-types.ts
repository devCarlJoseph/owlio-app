import type { LucideIcon } from "lucide-react"

export type LibrarySource = "personal" | "classroom" | "study-space"

export type LibraryResourceKind =
  | "Note"
  | "Template"
  | "Worksheet"
  | "Slides"
  | "Reading"
  | "Link"
  | "Document"

export type LibraryResourceAvailability = "available" | "unavailable"

export type LibraryResource = {
  id: string
  title: string
  kind: LibraryResourceKind
  source: LibrarySource
  owner: string
  context: string
  contextHref: string
  contextAction: string
  summary: string
  updated: string
  availability: LibraryResourceAvailability
}

export type LibrarySourceMeta = {
  id: LibrarySource
  label: string
  shortLabel: string
  ownerLabel: string
  ownerNote: string
  description: string
  icon: LucideIcon
  iconClassName: string
  badgeClassName: string
  libraryHref: string
  ownerHref: string
  ownerAction: string
}
