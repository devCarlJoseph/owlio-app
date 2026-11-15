import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import type { Ref } from "react"
import { cn } from "cn"

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  viewportRef?: Ref<HTMLDivElement>
  viewportClassName?: string
  contentClassName?: string
  scrollbarOrientation?: "vertical" | "horizontal" | "both"
}

function ScrollArea({
  className,
  children,
  viewportRef,
  viewportClassName,
  contentClassName,
  scrollbarOrientation = "vertical",
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className={cn("size-full rounded-[inherit] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1", viewportClassName)}
      >
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content" className={cn("min-w-full", contentClassName)}>
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      {scrollbarOrientation !== "horizontal" && <ScrollBar />}
      {scrollbarOrientation !== "vertical" && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none bg-transparent p-px transition-colors select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-muted-foreground/60 hover:bg-muted-foreground/80"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
