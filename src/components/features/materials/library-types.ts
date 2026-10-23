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
  id: string
  label: string
  shortLabel: string
  ownerLabel: string
  description: string
  icon: LucideIcon
  iconClassName: string
  badgeClassName: string
  cardClassName: string
  buttonClassName: string
  ghostClassName: string
  headerClassName: string
  panelClassName: string
  linkClassName: string
  libraryHref: string
  ownerHref: string
  ownerAction: string
}
