import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { classroomSections } from '../contents/classroom-sections'

export function ClassroomSectionNavigation({ tab, schoolClassroom }: { tab: string; schoolClassroom: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const revealTab = () => {
      // Desktop uses a vertical menu, so only scroll the mobile strip.
      if (viewport.scrollWidth <= viewport.clientWidth) return
      const selected = activeRef.current?.getBoundingClientRect()
      const bounds = viewport.getBoundingClientRect()
      if (!selected) return
      const delta = selected.left < bounds.left ? selected.left - bounds.left : selected.right > bounds.right ? selected.right - bounds.right : 0
      if (delta) viewport.scrollBy?.({ left: delta })
    }
    revealTab()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', revealTab)
      return () => window.removeEventListener('resize', revealTab)
    }
    const observer = new ResizeObserver(revealTab)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [tab])

  return (
    <nav aria-label="Classroom navigation" className="min-w-0 lg:sticky lg:top-0">
      <div ref={viewportRef} className="overflow-x-auto p-0.5 lg:overflow-visible">
        <TabsList aria-label="Classroom sections" className="flex h-auto w-max justify-start gap-1.5 rounded-none bg-transparent p-0 group-data-[orientation=horizontal]/tabs:data-[variant=default]:h-auto lg:grid lg:w-full">
          {classroomSections.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} ref={value === tab ? activeRef : undefined} value={value} className="group/section h-[42px] flex-none justify-start gap-2.5 border-border bg-card py-[5px] pl-[5px] pr-2.5 text-xs font-normal text-foreground shadow-none dark:text-foreground data-active:border-transparent data-active:bg-brand-soft data-active:text-brand-soft-foreground dark:data-active:border-transparent dark:data-active:bg-brand-soft dark:data-active:text-brand-soft-foreground group-data-[variant=default]/tabs-list:data-active:shadow-none lg:w-full lg:whitespace-normal lg:text-left">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted group-data-active/section:bg-card"><Icon aria-hidden="true" className="size-3.5" /></span>
              <span>{value === 'progress' && !schoolClassroom ? 'Progress & Feedback' : label}</span>
              <ChevronRight aria-hidden="true" className="hidden lg:block ml-auto size-3" />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </nav>
  )
}
