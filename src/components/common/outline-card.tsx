import type { ComponentProps } from "react"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { outlineCardVariants } from "./outline-card-styles"

export function OutlineCard({
  tone,
  className,
  ...props
}: ComponentProps<"section"> & VariantProps<typeof outlineCardVariants>) {
  return <section data-slot="outline-card" className={cn(outlineCardVariants({ tone }), className)} {...props} />
}
