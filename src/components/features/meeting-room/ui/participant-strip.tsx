import type { ReactNode } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from 'cn'

export function ParticipantStrip({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return <ScrollArea role="group" aria-label={label} scrollbarOrientation="both"
    className={cn('h-22 min-h-0 min-w-0 shrink-0 sm:h-28 lg:h-auto lg:w-56', className)}
    viewportClassName="overscroll-contain" contentClassName="min-w-full!">
    <div className="flex w-max min-w-full gap-3 pb-2 lg:w-full lg:flex-col lg:pr-2 lg:pb-0">{children}</div>
  </ScrollArea>
}
